package service

import (
	"github.com/torderonex/webcompiler/server/internal/entities"
	"github.com/torderonex/webcompiler/server/internal/repo"
	"github.com/torderonex/webcompiler/server/internal/webapi"
	"go.uber.org/zap"
)

type Service struct {
	AIhelper
	Compiler
	Authorization
	Projects
	Tasks
}

func New(l *zap.Logger, repo *repo.Repository, gpt webapi.GptApi) *Service {
	compilerService := newCompilerService(l)
	projService := NewProjectService(l, repo.Projects, repo.Files, compilerService)
	return &Service{
		AIhelper:      newAIService(l, gpt),
		Compiler:      compilerService,
		Projects:      projService,
		Authorization: newAuthService(repo.Authorization, projService, l),
		Tasks:         NewTaskService(l, repo.Tasks, compilerService),
	}
}

type AIhelper interface {
	GetCodeAnalysis(code string) (string, error)
	DoPrompt(prompt, code string) (string, error)
}

type Compiler interface {
	CompileScript(language, code string) string
	CompileProject(language, pathToProject, entryPoint string) (string, error)
}

type Authorization interface {
	CreateUser(user entities.User) (int, error)
	GenerateToken(login, password string) (string, error)
	ParseToken(accessToken string) (int, error)
}

type Projects interface {
	NewProject(name string, ownerId int) (entities.Project, error)
	DeleteFile(id int) error
	NewFile(name string, projectId int) (entities.File, error)
	UpdateFileContent(fileId int, content string) error
	GetUsersProjects(userId int) ([]entities.Project, error)
	GetProjectFiles(projId int) ([]entities.File, error)
	GetFileContent(fileId int) ([]byte, error)
	FileRename(id int, newName string) (entities.File, error)
	JoinToProject(userId, projectId int) error
	CreateInvite(projectId int) (string, error)
	CompileProject(projectId int, entryFile string) (string, error)
}

type Tasks interface {
	GetTaskByID(taskId int, userId int) (entities.TaskInfo, error)
	TestSolution(solution, language string, taskId, userId int) (string, error)
	GetTasksInfo(userId int) ([]*entities.TaskInfo, error)
}
