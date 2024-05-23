package service

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path"
	"strings"

	"github.com/torderonex/webcompiler/server/internal/entities"

	"github.com/torderonex/webcompiler/server/internal/repo"
	"github.com/torderonex/webcompiler/server/internal/service/helpers"
	"go.uber.org/zap"
)

type TaskService struct {
	logger   *zap.Logger
	compiler Compiler
	taskRepo repo.Tasks
}

func NewTaskService(logger *zap.Logger, taskRepo repo.Tasks, compiler Compiler) *TaskService {
	return &TaskService{
		logger,
		compiler,
		taskRepo,
	}
}

func (s TaskService) GetTaskByID(taskId, userId int) (entities.TaskInfo, error) {
	tasks, err := s.GetTasksInfo(userId)

	if err != nil {
		s.logger.Error(err.Error())
		return entities.TaskInfo{}, err
	}
	for _, task := range tasks {
		if taskId == task.ID {
			return *task, nil
		}
	}
	return entities.TaskInfo{}, errors.New("no tasks with this id")
}

func (s TaskService) TestSolution(solution, language string, taskId, userId int) (string, error) {

	solEntity, err := s.taskRepo.GetSolution(taskId, userId)

	if errors.Is(err, sql.ErrNoRows) {
		solEntity.Id, err = s.taskRepo.CreateNewSolution(userId, taskId, solution, language)
		if err != nil {
			s.logger.Error(err.Error(), zap.Int("solID", solEntity.Id))
		}
	} else {
		err := s.taskRepo.UpdateSolution(solEntity.Id, solution, language)
		if err != nil {
			s.logger.Error(err.Error(), zap.Int("solID", solEntity.Id))
		}
	}

	task, err := s.taskRepo.GetTaskById(taskId)

	if err != nil {
		s.logger.Error(err.Error())
	}

	filepath := path.Join("static", "tasks", task.Name, language, "main"+helpers.GetExtByLang(language))
	fmt.Println(filepath)
	testingSoft, err := os.ReadFile(filepath)
	if err != nil && !os.IsNotExist(err) {
		fmt.Println("Error reading file:", err)
		return "", err
	}

	code := solution + "\n" + string(testingSoft)
	res := s.compiler.CompileScript(language, code)
	programOutput := res
	testcases, err := s.taskRepo.GetTestcasesByTask(taskId)

	if err != nil {
		s.logger.Error(err.Error())
	}

	testcasesCount := len(testcases)

	if count := strings.Count(programOutput, "Test passed"); count == testcasesCount {
		s.logger.Info("SETTING TASK COMPLETE", zap.Int("TESTCASE COUNT", testcasesCount))
		err := s.completeTask(taskId, userId)
		if err != nil {
			s.logger.Error(err.Error())
		}
	}

	return programOutput, nil
}

func (s TaskService) GetTasksInfo(userId int) ([]*entities.TaskInfo, error) {

	tasks, err := s.taskRepo.GetTasksInfo(userId)
	if err != nil {
		s.logger.Error("GET TASK INFO ERROR", zap.Error(err))
		return nil, err
	}

	for _, task := range tasks {
		if task.Language == "" {
			task.Language = "javascript"
		}
		if task.DefaultValue == "" {
			filepath := path.Join("static", "tasks", task.Title, task.Language, "snippet"+helpers.GetExtByLang(task.Language))
			content, err := os.ReadFile(filepath)
			if err != nil {
				s.logger.Error(err.Error())
				return nil, err
			}
			task.DefaultValue = string(content)
		}
		var tmp []entities.TaskTestcase
		err = json.Unmarshal(task.TestOutputsBase64, &tmp)
		if err != nil {
			s.logger.Error(err.Error())
		}
		task.TestOutputs = tmp
	}
	return tasks, nil
}

func (s TaskService) completeTask(taskId, userId int) error {
	if err := s.taskRepo.UpdateSolutionStatus(userId, taskId); err != nil {
		s.logger.Error("UPDATE SOLUTION STATUS ERROR", zap.Error(err))
		return err
	}
	return nil
}
