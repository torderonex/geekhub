package entities

type Task struct {
	Id          int    `db:"id" json:"id"`
	TypeId      int    `db:"type_id" json:"type_id"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	Difficulty  string `db:"difficulty" json:"difficulty"`
}

type TaskSolution struct {
	Id       int    `db:"id"`
	TaskId   int    `db:"task_id"`
	UserId   int    `db:"user_id"`
	Code     string `db:"code"`
	Language string `db:"language"`
	Status   bool   `db:"status"`
}

type TaskTestcase struct {
	Id     int    `json:"-" db:"id"`
	TaskId int    `json:"-" db:"task_id"`
	Input  string `json:"input" db:"input"`
	Output string `json:"output" db:"output"`
}

type TaskInfo struct {
	ID                int            `json:"id" db:"id"`
	Status            bool           `json:"status" db:"status"`
	Title             string         `json:"title" db:"title"`
	Description       string         `json:"description" db:"description"`
	Difficulty        string         `json:"difficulty" db:"difficulty"`
	Type              string         `json:"type" db:"type"`
	Language          string         `json:"language" db:"language"`
	DefaultValue      string         `json:"defaultValue" db:"default_value"`
	TestOutputsBase64 []byte         `db:"test_outputs" json:"-"`
	TestOutputs       []TaskTestcase `json:"testOutputs"`
}
