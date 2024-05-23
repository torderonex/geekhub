package postgres

import (
	"github.com/jmoiron/sqlx"
	"github.com/torderonex/webcompiler/server/internal/entities"
)

type FileRepository struct {
	Db *sqlx.DB
}

func NewFileRepository(db *sqlx.DB) *FileRepository {
	return &FileRepository{db}
}

func (r FileRepository) CreateFile(f entities.File) (entities.File, error) {
	var id int
	query := "INSERT INTO files (project_id,name) VALUES ($1,$2) RETURNING id"
	row := r.Db.QueryRow(query, f.ProjectId, f.Name)
	if err := row.Scan(&id); err != nil {
		return f, err
	}
	f.Id = id
	return f, nil
}

func (r FileRepository) GetAllFiles() ([]entities.File, error) {
	var c []entities.File
	query := "SELECT * from files"
	err := r.Db.Select(&c, query)
	return c, err
}

func (r FileRepository) GetFileById(id int) (entities.File, error) {
	var c entities.File
	query := "SELECT * from files WHERE id = $1"
	err := r.Db.Get(&c, query, id)
	return c, err
}

func (r FileRepository) DeleteFileById(id int) error {
	query := "DELETE from files WHERE id = $1"
	_, err := r.Db.Exec(query, id)
	return err
}

func (r FileRepository) GetAllFilesFromProject(proj_id int) ([]entities.File, error) {
	var c []entities.File
	query := "SELECT * FROM files WHERE project_id = $1"
	err := r.Db.Select(&c, query, proj_id)
	return c, err
}

func (r FileRepository) FileRename(id int, newName string) (entities.File, error) {
	var c entities.File
	query := "UPDATE files SET name = $1 WHERE id = $2 RETURNING *"
	err := r.Db.Get(&c, query, newName, id)
	return c, err
}
