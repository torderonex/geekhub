package postgres

import (
	"github.com/jmoiron/sqlx"
	"github.com/torderonex/webcompiler/server/internal/entities"
)

type TaskRepository struct {
	Db *sqlx.DB
}

func NewTaskRepository(db *sqlx.DB) *TaskRepository {
	return &TaskRepository{db}
}

func (r TaskRepository) CreateTask(t entities.Task) (int, error) {
	var id int
	query := "INSERT INTO tasks (type_id, name, description, difficulty) VALUES ($1,$2, $3,$4) RETURNING id"
	row := r.Db.QueryRow(query, t.TypeId, t.Name, t.Description, t.Difficulty)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (r TaskRepository) GetAllTasks() ([]entities.Task, error) {
	var c []entities.Task
	query := "SELECT * from tasks"
	err := r.Db.Select(&c, query)
	return c, err
}

func (r TaskRepository) GetTaskById(id int) (entities.Task, error) {
	var c entities.Task
	query := "SELECT * from tasks WHERE id = $1"
	err := r.Db.Get(&c, query, id)
	return c, err
}

func (r TaskRepository) DeleteTaskById(id int) error {
	query := "DELETE from tasks WHERE id = $1"
	_, err := r.Db.Exec(query, id)
	return err
}

func (r TaskRepository) UpdateSolutionStatus(userId, taskId int) error {
	query := "UPDATE task_solutions SET status = $1 WHERE user_id = $2 and task_id = $3"
	_, err := r.Db.Exec(query, true, userId, taskId)
	return err
}

func (r TaskRepository) GetTestcasesByTask(taskId int) ([]entities.TaskTestcase, error) {
	var c []entities.TaskTestcase
	query := "SELECT * from task_testcases WHERE task_id = $1"
	err := r.Db.Select(&c, query, taskId)
	return c, err
}
func (r TaskRepository) GetSolution(taskId, userId int) (entities.TaskSolution, error) {
	var c entities.TaskSolution
	query := "SELECT * from task_solutions WHERE task_id = $1 AND user_id = $2"
	err := r.Db.Get(&c, query, taskId, userId)
	return c, err
}

func (r TaskRepository) CreateNewSolution(userId, taskId int, code, lang string) (int, error) {
	var id int
	query := "INSERT INTO task_solutions (task_id,user_id,code,language) VALUES ($1,$2,$3,$4);"
	row := r.Db.QueryRow(query, taskId, userId, code, lang)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (r TaskRepository) UpdateSolution(id int, code, lang string) error {
	query := "UPDATE task_solutions SET code = $1, language = $2 WHERE id = $3;"
	_, err := r.Db.Exec(query, code, lang, id)
	return err
}

func (r TaskRepository) GetTasksInfo(userId int) ([]*entities.TaskInfo, error) {
	var c []*entities.TaskInfo
	query := `
	WITH combined_results AS (
    SELECT
        t.id,
        NULL AS user_id,
        false AS status,
        t.name AS title,
        t.description,
        t.difficulty,
        '' AS default_value,
        tt.name AS type,
        '' AS language,
        json_agg(
            jsonb_build_object('input', tc.input, 'output', tc.output)
        ) AS test_outputs
    FROM
        tasks t
    JOIN
        task_types tt ON t.type_id = tt.id
    LEFT JOIN
        task_testcases tc ON tc.task_id = t.id
    GROUP BY
        t.id, t.name, t.description, t.difficulty, tt.name

    UNION ALL

    SELECT
        t.id,
        ts.user_id,
        COALESCE(ts.status, false) AS status,
        t.name AS title,
        t.description,
        t.difficulty,
        COALESCE(ts.code, '') AS default_value,
        tt.name AS type,
        COALESCE(ts.language, '') AS language,
        json_agg(
            jsonb_build_object('input', tc.input, 'output', tc.output)
        ) AS test_outputs
    FROM
        tasks t
    JOIN
        task_types tt ON t.type_id = tt.id
    LEFT JOIN
        task_solutions ts ON ts.task_id = t.id
    LEFT JOIN
        task_testcases tc ON tc.task_id = t.id
    WHERE
        ts.user_id = $1
    GROUP BY
        t.id, ts.user_id, ts.status, t.name, t.description, t.difficulty, ts.code, tt.name, ts.language
)
SELECT DISTINCT ON (cr.id)
    cr.id,
    cr.status,
    cr.title,
    cr.description,
    cr.difficulty,
    cr.default_value,
    cr.type,
    cr.language,
    cr.test_outputs
FROM
    combined_results cr
ORDER BY
    cr.id, cr.user_id ASC;
`

	err := r.Db.Select(&c, query, userId)
	return c, err
}
