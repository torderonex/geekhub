package postgres

import (
	"github.com/jmoiron/sqlx"
	"github.com/torderonex/webcompiler/server/internal/entities"
)

type ProjectRepository struct {
	Db *sqlx.DB
}

func NewProjectRepository(db *sqlx.DB) *ProjectRepository {
	return &ProjectRepository{db}
}

func (r ProjectRepository) CreateProject(p entities.Project) (entities.Project, error) {
	var id int
	query := "INSERT INTO projects (name, owner_id, path) VALUES ($1,$2,$3) RETURNING id"
	row := r.Db.QueryRow(query, p.Name, p.OwnerId, p.Path)
	if err := row.Scan(&id); err != nil {
		return p, err
	}
	p.Id = id
	return p, nil
}

func (r ProjectRepository) GetAllProjects() ([]entities.Project, error) {
	var c []entities.Project
	query := "SELECT * from projects"
	err := r.Db.Select(&c, query)
	return c, err
}

func (r ProjectRepository) GetProjectById(id int) (entities.Project, error) {
	var c entities.Project
	query := "SELECT * from projects WHERE id = $1"
	err := r.Db.Get(&c, query, id)
	return c, err
}

func (r ProjectRepository) DeleteProjectById(id int) (int, error) {
	query := "DELETE from projects WHERE id = $1"
	_, err := r.Db.Exec(query, id)
	return id, err
}

func (r ProjectRepository) GetUsersProjects(userId int) ([]entities.Project, error) {
	var c []entities.Project
	query := `SELECT DISTINCT ON (p.id) p.id, p.owner_id, p.name
FROM projects p
LEFT JOIN invitations i ON i.project_id = p.id
WHERE p.owner_id = $1 OR i.user_id = $1;`
	err := r.Db.Select(&c, query, userId)
	return c, err
}

func (r ProjectRepository) CreateInvitation(projectId int) (int, error) {
	var id int
	query := "INSERT INTO invitations (project_id) VALUES ($1) RETURNING id"
	row := r.Db.QueryRow(query, projectId)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (r ProjectRepository) AcceptInvitation(userId, projectId int) error {
	query := `WITH cte AS (
  SELECT id
  FROM invitations
  WHERE user_id IS NULL AND project_id = $2
  LIMIT 1
)
UPDATE invitations
SET user_id = $1
WHERE id IN (SELECT id FROM cte);`
	_, err := r.Db.Exec(query, userId, projectId)
	return err
}

func (r ProjectRepository) GetAllInvitations() ([]entities.Invitation, error) {
	var c []entities.Invitation
	query := "SELECT * from invitations"
	err := r.Db.Select(&c, query)
	return c, err
}

func (r ProjectRepository) GetInvitationById(id int) (entities.Invitation, error) {
	var c entities.Invitation
	query := "SELECT * from invitations WHERE id = $1"
	err := r.Db.Get(&c, query, id)
	return c, err
}

func (r ProjectRepository) DeleteInvitationById(id int) error {
	query := "DELETE from invitations WHERE id = $1"
	_, err := r.Db.Exec(query, id)
	return err
}

func (r ProjectRepository) GetAllInvitationsByProj(projId int) ([]entities.Invitation, error) {
	var c []entities.Invitation
	query := "SELECT * from invitations WHERE project_id = $1"
	err := r.Db.Select(&c, query, projId)
	return c, err
}

func (r ProjectRepository) GetAllInvitationsByUser(userId int) ([]entities.Invitation, error) {
	var c []entities.Invitation
	query := "SELECT * from invitations WHERE user_ud = $1"
	err := r.Db.Select(&c, query, userId)
	return c, err
}
