package main

import (
	"log"
	"os"
	"runtime"
	"time"

	"github.com/joho/godotenv"
	"github.com/torderonex/webcompiler/server/internal/config"
	"github.com/torderonex/webcompiler/server/internal/handler"
	"github.com/torderonex/webcompiler/server/internal/repo"
	"github.com/torderonex/webcompiler/server/internal/service"
	"github.com/torderonex/webcompiler/server/internal/webapi/yandexgpt"
	"github.com/torderonex/webcompiler/server/pkg/server"
	"go.uber.org/zap"
)

func init() {
	//set the os to determine which command to use to call the compiler
	os.Setenv("OS", runtime.GOOS)

	if err := godotenv.Load("config/.env"); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
}

func main() {
	//logger init
	logger, _ := zap.NewProduction()
	defer logger.Sync() // flushes buffer, if any
	logger.Info("Zap Logger integrated successfully!", zap.String("environment", "production"), zap.Int("attempt", 1), zap.Duration("backoff", time.Second))
	//config init
	cfg := config.MustLoad()
	//repo init
	rep := repo.New(cfg)
	//api init
	gpt := yandexgpt.New(logger, cfg)

	//service init
	services := service.New(logger, rep, gpt)
	//handlers init

	handler := handler.New(services)
	//server init
	srv := server.New(cfg.HTTPServer.Port, handler.InitRoutes(), cfg.HTTPServer.Timeout)
	srv.Run()
	// TODO: gracefull shutdown
}
