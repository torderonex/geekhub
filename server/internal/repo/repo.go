package repo

import (
	"github.com/torderonex/webcompiler/server/internal/config"
	"github.com/torderonex/webcompiler/server/internal/entities"
	"github.com/torderonex/webcompiler/server/internal/repo/postgres"
)

func New(config config.Config) *Repository {
	pg := postgres.New(config.Postgres)
	return &Repository{
		Authorization: postgres.NewAuthRepo(pg),
		Projects:      postgres.NewProjectRepository(pg),
		Files:         postgres.NewFileRepository(pg),
		Tasks:         postgres.NewTaskRepository(pg),
	}
}

type Repository struct {
	Authorization
	Projects
	Files
	Tasks
}

type Authorization interface {
	CreateUser(u entities.User) (int, error)
	GetAllUsers() ([]entities.User, error)
	GetUserById(id int) (entities.User, error)
	DeleteUserById(id int) error
	GetUserByNickNPass(nickname, password string) (entities.User, error)
}

type Projects interface {
	CreateProject(p entities.Project) (entities.Project, error)
	GetAllProjects() ([]entities.Project, error)
	DeleteProjectById(id int) (int, error)
	GetProjectById(id int) (entities.Project, error)
	GetUsersProjects(userId int) ([]entities.Project, error)
	DeleteInvitationById(id int) error
	GetInvitationById(id int) (entities.Invitation, error)
	GetAllInvitations() ([]entities.Invitation, error)
	CreateInvitation(projectId int) (int, error)
	AcceptInvitation(userId, projectId int) error
	GetAllInvitationsByUser(userId int) ([]entities.Invitation, error)
	GetAllInvitationsByProj(projId int) ([]entities.Invitation, error)
}

type Files interface {
	CreateFile(p entities.File) (entities.File, error)
	GetAllFiles() ([]entities.File, error)
	DeleteFileById(id int) error
	GetFileById(id int) (entities.File, error)
	FileRename(id int, newName string) (entities.File, error)
	GetAllFilesFromProject(proj_id int) ([]entities.File, error)
}

type Tasks interface {
	CreateTask(p entities.Task) (int, error)
	GetAllTasks() ([]entities.Task, error)
	DeleteTaskById(id int) error
	GetTaskById(id int) (entities.Task, error)
	UpdateSolutionStatus(userId, taskId int) error
	GetTestcasesByTask(taskId int) ([]entities.TaskTestcase, error)
	GetTasksInfo(userId int) ([]*entities.TaskInfo, error)
	UpdateSolution(id int, code, lang string) error
	GetSolution(taskId, userId int) (entities.TaskSolution, error)
	CreateNewSolution(userId, taskId int, code, lang string) (int, error)
}
