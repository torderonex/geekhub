package config

import (
	"log"
	"os"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Postgres   PostgresDatabase `yaml:"postgres"`
	HTTPServer HTTPServer       `mapstructure:"http_server"`
	Gpt        YandexGptApi
}

type HTTPServer struct {
	Port    string        `yaml:"port"`
	Timeout time.Duration `yaml:"timeout"`
}

type YandexGptApi struct {
	OAuth2Token string
	Dir         string
}

type PostgresDatabase struct {
	RetryInterval time.Duration `mapstructure:"retry_interval"`
	MaxRetries    int           `mapstructure:"max_retries"`
	Port          int           `yaml:"port"`
	Host          string        `yaml:"host"`
	Database      string        `yaml:"database"`
	Username      string        `yaml:"username"`
	Password      string        `yaml:"password"`
}

func MustLoad() Config {

	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		configPath = "./config"
	}
	viper.SetConfigName("config")
	viper.AddConfigPath(configPath)
	viper.SetConfigType("yaml")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatal(err)
		log.Fatalf("config file doesn't exists: %s", configPath)
	}
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("unable to decode config into struct: %v", err)
	}

	config.Postgres.Password = os.Getenv("POSTGRES_PASS")

	//yandex gpt cfg load
	config.Gpt.OAuth2Token = os.Getenv("YANDEX_OAUTH_TOKEN")
	config.Gpt.Dir = os.Getenv("YANDEXCLOUD_DIR")
	return config
}
