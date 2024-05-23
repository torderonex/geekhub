package handler

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"github.com/torderonex/webcompiler/server/internal/entities"
)

// register godoc
// @Summary      Register a new user
// @Description  Create a new user account and generate a JWT token.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input  body      loginDto  true  "User credentials"
// @Success      200    {object}  map[string]interface{}  "token"="JWT token"
// @Failure      400    {object}  map[string]string "error"="Bad request"
// @Failure      500    {object}  map[string]string "error"="Internal server error"
// @Router       /api/v1/auth/register [post]
func (h *Handler) register(c *gin.Context) {
	var input loginDto
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	_, err := h.service.Authorization.CreateUser(entities.User{Username: input.Username, Password: input.Password})
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	token, err := h.service.Authorization.GenerateToken(input.Username, input.Password)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.SetCookie("token", token, 60*60*60*24, "/", viper.GetString("SERVER_DOMAIN"), false, true)
	c.JSON(http.StatusOK, map[string]interface{}{
		"token": token,
	})
}

type loginDto struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// login godoc
// @Summary      Log in a user
// @Description  Authenticate a user and generate a JWT token.
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        input  body      loginDto  true  "User credentials"
// @Success      200    {object}  map[string]interface{}  "token"="JWT token"
// @Failure      400    {object}  map[string]string "error"="Bad request"
// @Failure      500    {object}  map[string]string "error"="Internal server error"
// @Router       /api/v1/auth/login [post]
func (h *Handler) login(c *gin.Context) {
	var input loginDto

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	token, err := h.service.Authorization.GenerateToken(input.Username, input.Password)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.SetCookie("token", token, 60*60*60*24, "/", os.Getenv("SERVER_ADDR"), false, true)
	c.JSON(http.StatusOK, map[string]interface{}{
		"token": token,
	})
}

// logout godoc
// @Summary      Log out a user
// @Description  Invalidate the user's JWT token.
// @Tags         auth
// @Success      200    {string}  string "ok"
// @Router       /api/v1/auth/logout [post]
func (h *Handler) logout(c *gin.Context) {
	c.SetCookie("token", "", -1, "/", os.Getenv("SERVER_ADDR"), false, true)
}
