package entities

import "database/sql"

type Project struct {
	Id      int    `db:"id" json:"id"`
	Name    string `db:"name" json:"name"`
	OwnerId int    `db:"owner_id" json:"owner_id"`
	Path    string `db:"path" json:"-"`
}

type File struct {
	Id        int    `db:"id" json:"id"`
	ProjectId int    `db:"project_id" json:"projectId"`
	Name      string `db:"name" json:"fileName"`
	FileLang  string `json:"fileLang"`
}

type Invitation struct {
	Id        int           `db:"id"`
	ProjectId int           `db:"project_id"`
	UserId    sql.NullInt32 `db:"user_id"`
}
