package postgres

import (
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/torderonex/webcompiler/server/internal/config"
	"github.com/torderonex/webcompiler/server/internal/repo/postgres/startup"
)

var downFlag = flag.Bool("down", false, "Execute the down script")

func New(cfg config.PostgresDatabase) *sqlx.DB {
	flag.Parse()
	var db *sqlx.DB

	db, err := sqlx.Connect("postgres", fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
		cfg.Username, cfg.Password, cfg.Host, cfg.Port, cfg.Database, "disable"))

	if err != nil || db.Ping() != nil {
		err = doWithRetries(cfg, &db)
		if err != nil {
			log.Fatalf("Failed to connect to the database after %d retries", cfg.MaxRetries)
		}
	}
	if *downFlag {
		log.Println("Executing down script...")
		tx := db.MustBegin()

		tx.MustExec("DROP TABLE IF EXISTS task_solutions")
		tx.MustExec("DROP TABLE IF EXISTS invitations")
		tx.MustExec("DROP TABLE IF EXISTS task_testcases")
		tx.MustExec("DROP TABLE IF EXISTS tasks")
		tx.MustExec("DROP TYPE IF EXISTS difficulty_level")
		tx.MustExec("DROP TABLE IF EXISTS task_types")
		tx.MustExec("DROP TABLE IF EXISTS files")
		tx.MustExec("DROP TABLE IF EXISTS projects")
		tx.MustExec("DROP TABLE IF EXISTS users")

		err := tx.Commit()
		if err != nil {
			log.Fatalf("Failed to execute down script: %v", err)
		}
	}
	db.MustExec(startup.Up)

	return db
}

func doWithRetries(cfg config.PostgresDatabase, db **sqlx.DB) error {
	var err error
	for i := 0; i < cfg.MaxRetries; i++ {
		*db, err = sqlx.Connect("postgres", fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
			cfg.Username, cfg.Password, cfg.Host, cfg.Port, cfg.Database, "disable"))
		if err == nil {
			return nil
		}

		log.Printf("Failed to connect to the database: %v", err)
		if i < cfg.MaxRetries-1 {
			log.Printf("Retrying in %v seconds...", cfg.RetryInterval.Seconds())
			time.Sleep(cfg.RetryInterval)
		}
	}
	return err
}
