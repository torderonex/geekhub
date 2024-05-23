package handler

import "github.com/gin-gonic/gin"

type errorResponse struct {
	Msg  string `json:"message"`
	Code int    `json:"status_code"`
}

func newErrorResponse(c *gin.Context, statusCode int, err string) {
	c.AbortWithStatusJSON(statusCode, errorResponse{Msg: err, Code: statusCode})
}
