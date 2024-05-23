package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type askChatRequest struct {
	Code   string `json:"code"`
	Prompt string `json:"prompt,omitempty"`
}

// askChat godoc
// @Summary      Ask AI Chat
// @Description  Send a code snippet and a prompt to the AI chat for a response.
// @Tags         AI
// @Accept       json
// @Produce      json
// @Param        input  body      askChatRequest  true  "Code and Prompt"
// @Success      200    {object}  map[string]interface{}  "type"="res" "message"="AI response"
// @Failure      400    {object}  map[string]string "error"="Bad request"
// @Failure      500    {object}  map[string]string "error"="Internal server error"
// @Router        /api/v1/ai/ask [post]
func (h *Handler) askChat(c *gin.Context) {
	var input askChatRequest
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	ans, err := h.service.AIhelper.DoPrompt(input.Prompt, input.Code)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
	}
	c.JSON(http.StatusOK, map[string]interface{}{
		"type":    "res",
		"message": ans,
	})
}

type codeReviewRequest struct {
	Code string `json:"code,omitempty"`
}

// codeReview godoc
// @Summary      Code Review
// @Description  Send a code snippet for AI code review.
// @Tags         AI
// @Accept       json
// @Produce      json
// @Param        input  body      codeReviewRequest  true  "Code"
// @Success      200    {object}  map[string]interface{}  "message"="AI analysis"
// @Failure      400    {object}  map[string]string "error"="Bad request"
// @Failure      500    {object}  map[string]string "error"="Internal server error"
// @Router        /api/v1/ai/review [post]
func (h *Handler) codeReview(c *gin.Context) {
	var input codeReviewRequest
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	ans, err := h.service.AIhelper.GetCodeAnalysis(input.Code)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
	}
	c.JSON(http.StatusOK, map[string]interface{}{
		"message": ans,
	})
}
