package service

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/rand"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/torderonex/webcompiler/server/internal/entities"
	"github.com/torderonex/webcompiler/server/internal/repo"
	"github.com/torderonex/webcompiler/server/internal/service/helpers"
	"go.uber.org/zap"
)

type ProjectService struct {
	projectRepo repo.Projects
	fileRepo    repo.Files
	compiler    Compiler
	logger      *zap.Logger
}

func NewProjectService(logger *zap.Logger, projects repo.Projects, files repo.Files, compiler Compiler) *ProjectService {
	return &ProjectService{
		projects,
		files,
		compiler,
		logger,
	}
}

func generateRandomString(length int) string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[r.Intn(len(charset))]
	}
	return string(b)
}

func (s ProjectService) generateProjectPath(name string) string {
	var randomString = generateRandomString(5)
	filename := fmt.Sprintf("%s-%s", name, randomString)
	return path.Join("static", "projects", filename)
}

func (s ProjectService) NewProject(name string, ownerId int) (entities.Project, error) {
	newProj := entities.Project{
		Name:    name,
		OwnerId: ownerId,
		Path:    s.generateProjectPath(name),
	}
	newProj, err := s.projectRepo.CreateProject(newProj)
	if err != nil {
		s.logger.Error(err.Error())
		return newProj, err
	}
	s.logger.Info("PROJECT CREATED", zap.Int("ID", newProj.Id))
	file, err := s.NewFile("main.js", newProj.Id)
	if err != nil {
		return newProj, err
	}
	err = os.WriteFile(path.Join(newProj.Path, "package.json"), []byte("{\"type\":\"module\"}"), 0664)
	if err != nil {
		s.logger.Error("FAILED TO CREATE package.json", zap.Error(err))
	}
	s.UpdateFileContent(file.Id, "console.log('Welcome to the GEEKHUB!!!')")
	return newProj, err
}

func (s ProjectService) DeleteFile(id int) error {
	if err := s.fileRepo.DeleteFileById(id); err != nil {
		s.logger.Error("FILE DELETING ERROR", zap.Int("ID", id), zap.Error(err))
		return err
	}
	s.logger.Info("FILE DELETED", zap.Int("ID", id))
	return nil
}

func (s ProjectService) NewFile(name string, projectId int) (entities.File, error) {
	newFile := entities.File{
		ProjectId: projectId,
		Name:      name,
	}

	fileEntity, err := s.fileRepo.CreateFile(newFile)
	split := strings.Split(name, ".")
	fileEntity.FileLang = helpers.GetLangByExt(split[len(split)-1])
	if err != nil {
		s.logger.Error("FILE CREATING ERROR", zap.Error(err))
		return fileEntity, err
	}
	project, err := s.projectRepo.GetProjectById(projectId)
	if err != nil {
		s.logger.Error("PROJECT DIDNT FIND", zap.Error(err))
		return fileEntity, err
	}
	// Ensure the project path exists
	projectPath := project.Path
	if _, err := os.Stat(projectPath); os.IsNotExist(err) {
		err := os.MkdirAll(projectPath, os.ModePerm)
		if err != nil {
			s.logger.Error("DIRECTORY CREATING ERROR", zap.String("path", projectPath), zap.Error(err))
			return fileEntity, err
		}
	}

	filePath := filepath.Join(projectPath, name)
	_, err = os.Create(filePath)

	if err != nil {
		s.logger.Error("FILE CREATING ERROR", zap.String("name", name), zap.Error(err))
		return fileEntity, err
	}

	s.logger.Info("FILE CREATED", zap.Int("ID", fileEntity.Id))
	return fileEntity, nil
}

func (s ProjectService) UpdateFileContent(fileId int, content string) error {
	file, err := s.fileRepo.GetFileById(fileId)
	if err != nil {
		s.logger.Error("FAILED TO UPDATE FILE", zap.Int("ID", fileId), zap.Error(err))
		return err
	}
	proj, err := s.projectRepo.GetProjectById(file.ProjectId)
	if err != nil {
		s.logger.Error("FAILED TO UPDATE FILE", zap.Int("ID", fileId), zap.Error(err))
		return err
	}
	err = os.WriteFile(path.Join(proj.Path, file.Name), []byte(content), os.ModePerm)

	return err
}

func (s ProjectService) GetUsersProjects(userId int) ([]entities.Project, error) {
	projs, err := s.projectRepo.GetUsersProjects(userId)
	if err != nil {
		s.logger.Error("PROJECTS GETTING  ERROR", zap.Int("userID", userId), zap.Error(err))
		return nil, err
	}
	return projs, nil
}

func (s ProjectService) getFilePath(projPath, filename string) string {
	return path.Join(projPath, filename)
}

func (s ProjectService) FileRename(id int, newName string) (entities.File, error) {
	oldFile, err := s.fileRepo.GetFileById(id)
	if err != nil {
		s.logger.Error("GET FILE  ERROR", zap.Int("ID", id), zap.Error(err))
		return oldFile, err
	}
	file, err := s.fileRepo.FileRename(id, newName)
	if err != nil {
		s.logger.Error("FILE RENAME  ERROR", zap.Int("ID", id), zap.Error(err))
		return file, err
	}
	proj, err := s.projectRepo.GetProjectById(file.ProjectId)
	if err != nil {
		s.logger.Error("PROJECT GETTING  ERROR", zap.Int("ID", id), zap.Error(err))
		return file, err
	}
	err = os.Rename(s.getFilePath(proj.Path, oldFile.Name), s.getFilePath(proj.Path, file.Name))
	if err != nil {
		s.logger.Error("FILE RENAME ERROR OS LEVEL", zap.Int("ID", id), zap.Error(err))
		return file, err
	}
	split := strings.Split(file.Name, ".")
	file.FileLang = helpers.GetLangByExt(split[len(split)-1])
	return file, nil
}

func (s ProjectService) GetProjectFiles(projId int) ([]entities.File, error) {
	files, err := s.fileRepo.GetAllFilesFromProject(projId)
	if err != nil {
		s.logger.Error("FILES GETTING  ERROR", zap.Int("projectId", projId), zap.Error(err))
		return nil, err
	}

	for i := 0; i < len(files); i++ {
		split := strings.Split(files[i].Name, ".")
		files[i].FileLang = helpers.GetLangByExt(split[len(split)-1])
	}

	return files, nil
}

func (s ProjectService) GetFileContent(fileId int) ([]byte, error) {
	fileEntity, err := s.fileRepo.GetFileById(fileId)
	if err != nil {
		s.logger.Error("FILE GETTING  ERROR", zap.Int("fileId", fileId), zap.Error(err))

		return nil, err
	}
	projEntity, err := s.projectRepo.GetProjectById(fileEntity.ProjectId)
	if err != nil {
		s.logger.Error("PROJECT GETTING  ERROR", zap.Int("projectId", fileEntity.ProjectId), zap.Error(err))
		return nil, err
	}
	content, err := os.ReadFile(path.Join(projEntity.Path, fileEntity.Name))
	if err != nil {
		s.logger.Error("FILE READING  ERROR", zap.Int("fileId", fileId), zap.Error(err))
		return nil, err
	}
	return content, nil
}

type invitePayload struct {
	Id        int `json:"id"`
	ProjectId int `json:"project_id"`
}

func (s ProjectService) CreateInvite(projectId int) (string, error) {
	id, err := s.projectRepo.CreateInvitation(projectId)
	if err != nil {
		return "", err
	}

	payload := invitePayload{
		Id:        id,
		ProjectId: projectId,
	}
	data, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}
	sEnc := base64.StdEncoding.EncodeToString(data)

	return os.Getenv("CLIENT_ADDR") + "/invite/" + sEnc, err
}

func (s ProjectService) JoinToProject(userId, projectId int) error {
	inv, err := s.projectRepo.GetAllInvitationsByProj(projectId)
	if err != nil {
		s.logger.Error("GetAllInvitationsByProj ERROR", zap.Error(err))
		return err
	}
	for _, i := range inv {
		if i.UserId.Int32 == int32(userId) {
			s.logger.Info("THE USER IS ALREADY INVITED TO THE PROJECT", zap.Int("UserId", userId))
			return errors.New("THE USER IS ALREADY INVITED TO THE PROJECT")
		}
	}

	project, err := s.projectRepo.GetProjectById(projectId)
	if err != nil {
		s.logger.Error("FAILED TO GET PROJECT ", zap.Error(err))
		return err
	}

	if project.OwnerId == userId {
		s.logger.Info("THE USER IS THE PROJECT OWNER", zap.Int("UserId", userId))
		return errors.New("THE USER IS THE PROJECT OWNER")
	}

	err = s.projectRepo.AcceptInvitation(userId, projectId)
	if err != nil {
		s.logger.Error("ACCEPT INVITE  ERROR", zap.Error(err))
	}
	return err
}

func (s ProjectService) CompileProject(projectId int, entryFile string) (string, error) {
	proj, err := s.projectRepo.GetProjectById(projectId)
	if err != nil {
		s.logger.Error("FAILED TO GET PROJECT", zap.Error(err))
		return "", err
	}
	split := strings.Split(entryFile, ".")
	lang := helpers.GetLangByExt(split[len(split)-1])
	absPathToProject, err := filepath.Abs(proj.Path)
	if err != nil {
		s.logger.Error("Failed to get absolute path", zap.Error(err))
		return "", err
	}
	res, err := s.compiler.CompileProject(lang, absPathToProject, entryFile)
	if err != nil {
		return res, err
	}
	return res, nil
}
