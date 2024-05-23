package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type testSolutionReq struct {
	Code     string `json:"code" binding:"required"`
	Language string `json:"language" binding:"required"`
	UserId   int    `json:"user_id" binding:"required"`
	TaskId   int    `json:"task_id" binding:"required"`
}

// testSolution godoc
// @Summary Test solution for a task
// @Description Test a provided code solution for a specific task
// @Tags tasks
// @Accept  json
// @Produce  json
// @Param   input  body  testSolutionReq  true  "Solution input"
// @Success 200 {object} testSolutionReq
// @Failure 400 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /api/v1/tasks/test [post]
func (h *Handler) testSolution(c *gin.Context) {
	var input testSolutionReq
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	output, _ := h.service.Tasks.TestSolution(input.Code, input.Language, input.TaskId, input.UserId)
	c.JSON(200, output)
}

// getTasksInfo godoc
// @Summary Get information about tasks
// @Description Get detailed information about tasks for the current user
// @Tags tasks
// @Accept  json
// @Produce  json
// @Param   input  body  testSolutionReq  false  "User ID and other optional parameters"
// @Success 200 {object} entities.TaskInfo
// @Failure 400 {object} errorResponse
// @Failure 401 {object} errorResponse
// @Failure 500 {object} errorResponse
// @Router /api/v1/tasks [get]
func (h *Handler) getTasksInfo(c *gin.Context) {
	a, ok := c.Get("userID")
	if !ok {
		newErrorResponse(c, http.StatusUnauthorized, "No access token in cookie")
		return
	}
	tasks, err := h.service.Tasks.GetTasksInfo(a.(int))
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(200, tasks)
}

// getTaskById godoc
// @Summary Get Task by ID
// @Description Get a task by its ID
// @Tags tasks
// @Accept  json
// @Produce  json
// @Param id path int true "Task ID"
// @Success 200 {object} entities.TaskInfo
// @Failure 400 {object} errorResponse
// @Router /api/v1/tasks/{id} [get]
func (h *Handler) getTaskById(c *gin.Context) {
	a, ok := c.Get("userID")
	if !ok {
		newErrorResponse(c, http.StatusUnauthorized, "No access token in headers")
		return
	}
	id := c.Param("id")
	idInt, err := strconv.Atoi(id)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	task, err := h.service.Tasks.GetTaskByID(idInt, a.(int))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(200, task)
}
