package handler

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	docs "github.com/torderonex/webcompiler/server/docs"
	"github.com/torderonex/webcompiler/server/internal/service"
)

type Handler struct {
	service *service.Service
}

func New(s *service.Service) *Handler {
	return &Handler{
		service: s,
	}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()
	docs.SwaggerInfo.BasePath = "/api/v1"
	router.Use(CORSMiddleware())

	v1 := router.Group("/api/v1/")
	auth := v1.Group("auth")
	{
		auth.POST("register", h.register)
		auth.POST("login", h.login)
		auth.POST("logout", h.logout)
	}
	compiler := v1.Group("compiler")
	{
		compiler.POST("script", h.compileScript)
	}
	ai := v1.Group("ai")
	{
		ai.POST("ask", h.askChat)
		ai.POST("review", h.codeReview)
	}

	projects := v1.Group("project")
	projects.Use(h.userIdentity)
	{
		projects.DELETE("file/:id", h.deleteFile)
		projects.PUT("file/:id", h.updateContent)
		projects.POST("create", h.createProject)
		projects.POST("file/create", h.createFile)
		projects.GET("all/:userId", h.getUsersProjects)
		projects.GET("files/:projId", h.getProjectFiles)
		projects.GET("file/:id", h.GetFileContent)
		projects.PUT("file/rename/:id", h.fileRename)
		projects.POST("/invite/create", h.createInvite)
		projects.PUT("/invite/accept", h.acceptInvite)
		projects.POST("/compile", h.compileProject)
	}

	tasks := v1.Group("tasks")
	tasks.Use(h.userIdentity)
	{
		tasks.POST("test", h.testSolution)
		tasks.GET("", h.getTasksInfo)
		tasks.GET(":id", h.getTaskById)
	}

	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	return router
}
