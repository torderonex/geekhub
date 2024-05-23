package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type compilerDto struct {
	Script   string `json:"script"`
	Langauge string `json:"language"`
}

// compileScript godoc
// @Summary      Compile a script
// @Description  Compile the given script in the specified language.
// @Tags         compiler
// @Accept       json
// @Produce      json
// @Param        input  body      compilerDto  true  "Compiler input"
// @Success      200    {object}  map[string]interface{}  "output"="Compilation result"
// @Failure      400    {object}  map[string]string "error"="Bad request"
// @Failure      500    {object}  map[string]string "error"="Internal server error"
// @Router       /api/v1/compiler/script [post]
func (h *Handler) compileScript(c *gin.Context) {
	var input compilerDto
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	output := h.service.Compiler.CompileScript(input.Langauge, input.Script)
	c.JSON(200, output)
}
