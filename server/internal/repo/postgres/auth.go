package postgres

import (
	"github.com/jmoiron/sqlx"
	"github.com/torderonex/webcompiler/server/internal/entities"
)

type AuthRepo struct {
	Db *sqlx.DB
}

func NewAuthRepo(db *sqlx.DB) *AuthRepo {
	return &AuthRepo{
		db,
	}
}

func (r AuthRepo) CreateUser(u entities.User) (int, error) {
	var id int
	query := "INSERT INTO users (username, password) VALUES ($1,$2) RETURNING id"
	row := r.Db.QueryRow(query, u.Username, u.Password)
	if err := row.Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}

func (r AuthRepo) GetAllUsers() ([]entities.User, error) {
	var c []entities.User
	query := "SELECT * from users"
	err := r.Db.Select(&c, query)
	return c, err
}

func (r AuthRepo) GetUserByNickNPass(nickname, password string) (entities.User, error) {
	var u entities.User
	query := "SELECT * FROM users WHERE password = $1 AND username = $2"
	err := r.Db.Get(&u, query, password, nickname)
	return u, err
}

func (r AuthRepo) GetUserById(id int) (entities.User, error) {
	var c entities.User
	query := "SELECT * from users WHERE id = $1"
	err := r.Db.Get(&c, query, id)
	return c, err
}

func (r AuthRepo) DeleteUserById(id int) error {
	query := "DELETE from users WHERE id = $1"
	_, err := r.Db.Exec(query, id)
	return err
}
