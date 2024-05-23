package service

import (
	"crypto/sha1"
	"errors"
	"fmt"
	"os"
	"time"

	"go.uber.org/zap"

	"github.com/golang-jwt/jwt"
	"github.com/torderonex/webcompiler/server/internal/entities"
	"github.com/torderonex/webcompiler/server/internal/repo"
)

var (
	salt       = os.Getenv("SALT")
	tokenTTL   = 120 * time.Hour
	signingKey = os.Getenv("SIGNING_KEY")
)

type AuthService struct {
	repo           repo.Authorization
	projectService Projects
	logger         *zap.Logger
}

type tokenClaims struct {
	jwt.StandardClaims
	UserId int `json:"user_id"`
}

func newAuthService(repo repo.Authorization, projects Projects, log *zap.Logger) *AuthService {
	return &AuthService{repo: repo, projectService: projects, logger: log}
}

func (s *AuthService) CreateUser(user entities.User) (int, error) {
	user.Password = generatePasswordHash(user.Password)
	ownerId, err := s.repo.CreateUser(user)
	if err != nil {
		s.logger.Error(err.Error())
		return ownerId, err
	}
	_, err = s.projectService.NewProject(user.Username+"'s Project", ownerId)
	if err != nil {
		s.logger.Error(err.Error())
	}
	// file, err := s.projectService.NewFile("main.js", proj.Id)
	// if err != nil {
	// 	s.logger.Error(err.Error())
	// }
	// err = s.projectService.UpdateFileContent(file.Id, "console.log('Welcome to the GEEKHUB IDE!')")
	return ownerId, err
}

func (s *AuthService) GenerateToken(login, password string) (string, error) {
	user, err := s.repo.GetUserByNickNPass(login, generatePasswordHash(password))
	if err != nil {
		return "", err
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, &tokenClaims{
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(tokenTTL).Unix(),
			IssuedAt:  time.Now().Unix(),
		},
		user.Id,
	})

	return token.SignedString([]byte(signingKey))
}

func generatePasswordHash(password string) string {
	hash := sha1.New()
	hash.Write([]byte(password))

	return fmt.Sprintf("%x", hash.Sum([]byte(salt)))
}

func (s *AuthService) ParseToken(accessToken string) (int, error) {
	token, err := jwt.ParseWithClaims(accessToken, &tokenClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid signing method")
		}

		return []byte(signingKey), nil
	})
	if err != nil {
		return 0, err
	}
	claims, ok := token.Claims.(*tokenClaims)
	if !ok {
		return 0, errors.New("token claims are not of type *tokenClaisms")
	}
	return claims.UserId, nil
}
