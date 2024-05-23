package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type createProjectRequest struct {
	Name    string `json:"name" binding:"required"`
	OwnerId int    `json:"owner_id" binding:"required"`
}

// createProject godoc
// @Summary      Create a new project
// @Description  Create a new project with the given name and owner ID.
// @Tags         projects
// @Accept       json
// @Produce      json
// @Param        input  body createProjectRequest true  "Project input: {\"name\":\"string\", \"owner_id\":int}"
// @Success      200    {object}  entities.Project
// @Failure      400    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /api/v1/project/create [post]
func (h *Handler) createProject(c *gin.Context) {
	var input createProjectRequest

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	proj, err := h.service.Projects.NewProject(input.Name, input.OwnerId)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, proj)
}

type createFileRequest struct {
	Name      string `json:"name" binding:"required"`
	ProjectId int    `json:"project_id" binding:"required"`
}

// createFile godoc
// @Summary      Create a new file in a project
// @Description  Create a new file with the given name in the specified project.
// @Tags         projects
// @Accept       json
// @Produce      json
// @Param        input  body  createFileRequest  true  "File input: {\"name\":\"string\", \"project_id\":int}"
// @Success      200    {object}  entities.File
// @Failure      400    {object}  errorResponse
// @Failure      500    {object}  errorResponse
// @Router       /api/v1/project/file/create [post]
func (h *Handler) createFile(c *gin.Context) {
	var input createFileRequest

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	file, err := h.service.Projects.NewFile(input.Name, input.ProjectId)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, file)
}

// deleteFile godoc
// @Summary      Delete a file
// @Description  Delete the file with the specified ID.
// @Tags         projects
// @Produce      json
// @Param        id   path      int  true  "File ID"
// @Success      200  {object}  map[string]interface{}  "id"="0"
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/v1/project/file/{id} [delete]
func (h *Handler) deleteFile(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid file ID")
		return
	}

	if err := h.service.Projects.DeleteFile(id); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"id": id,
	})
}

type updateContentReq struct {
	Content string `json:"content"`
}

// updateContent godoc
// @Summary      Update file content
// @Description  Update the content of the file with the specified ID.
// @Tags         projects
// @Accept       json
// @Produce      json
// @Param        id      path      int     true  "File ID"
// @Param        input   body      interface{}  true  "File content input: {\"content\":\"string\"}"
// @Success      200     {object}  updateContentReq
// @Failure      400     {object}  errorResponse
// @Failure      500     {object}  errorResponse
// @Router       /api/v1/project/file/{id} [put]
func (h *Handler) updateContent(c *gin.Context) {
	var input updateContentReq
	fileIdStr := c.Param("id")
	fileId, err := strconv.Atoi(fileIdStr)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "invalid file ID")
		return
	}

	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	if err := h.service.Projects.UpdateFileContent(fileId, input.Content); err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}

	c.JSON(http.StatusOK, input)
}

// getUsersProjects godoc
// @Summary      Get user's projects
// @Description  Retrieve all projects for the user with the specified ID.
// @Tags         projects
// @Produce      json
// @Param        userId  path      int  true  "User ID"
// @Success      200     {array}   entities.Project  "List of user projects"
// @Failure      400     {object}  errorResponse
// @Failure      500     {object}  errorResponse
// @Router       /api/v1/project/all/{userId} [get]
func (h *Handler) getUsersProjects(c *gin.Context) {
	userId, err := strconv.Atoi(c.Param("userId"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "Invalid user ID")
		return
	}

	projects, err := h.service.Projects.GetUsersProjects(userId)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, "Failed to get user projects")
		return
	}

	c.JSON(http.StatusOK, projects)
}

// getProjectFiles godoc
// @Summary      Get project files
// @Description  Retrieve all files for the project with the specified ID.
// @Tags         projects
// @Produce      json
// @Param        projId  path      int  true  "Project ID"
// @Success      200     {array}   entities.File  "List of project files"
// @Failure      400     {object}  errorResponse
// @Failure      500     {object}  errorResponse
// @Router       /api/v1/project/files/{projId} [get]
func (h *Handler) getProjectFiles(c *gin.Context) {
	projId, err := strconv.Atoi(c.Param("projId"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "Invalid project ID")
		return
	}

	files, err := h.service.Projects.GetProjectFiles(projId)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, "Failed to get project files")
		return
	}

	c.JSON(http.StatusOK, files)
}

// GetFileContent godoc
// @Summary      Get file content
// @Description  Retrieve the content of the file with the specified ID.
// @Tags         projects
// @Produce      json
// @Param        id   path      int  true  "File ID"
// @Success      200  {object}  map[string]interface{}  "content"="File content"
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/v1/project/file/{id} [get]
func (h *Handler) GetFileContent(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "Invalid file ID")
		return
	}

	data, err := h.service.Projects.GetFileContent(id)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, "Failed to get project files")
		return
	}

	c.JSON(http.StatusOK, map[string]interface{}{
		"content": string(data),
	})
}

type fileRenameReq struct {
	NewName string `json:"new_name" binding:"required"`
}

// fileRename godoc
// @Summary      Get file content
// @Description  Retrieve the content of the file with the specified ID.
// @Tags         projects
// @Produce      json
// @Param        id   path      fileRenameReq  true  "new filename"
// @Success      200  {object}  entities.File
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/v1/project/file/rename/{id} [put]
func (h *Handler) fileRename(c *gin.Context) {
	var input fileRenameReq
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, "Invalid file ID")
		return
	}

	file, err := h.service.Projects.FileRename(id, input.NewName)
	if err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, file)
}

type createInviteReq struct {
	ProjectId int `json:"project_id" binding:"required"`
}

// createInvite godoc
// @Summary      Get file content
// @Description  Retrieve the content of the file with the specified ID.
// @Tags         projects
// @Produce      json
// @Param        id   path      createInviteReq  true  "new filename"
// @Success      200  {object}  map[string]interface{}  "link"="http://localhost:5137/plakiplaki"
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/v1/project/invite/create [post]
func (h *Handler) createInvite(c *gin.Context) {
	var input createInviteReq
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	link, err := h.service.Projects.CreateInvite(input.ProjectId)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, map[string]interface{}{
		"link": link,
	})
}

// acceptInvite godoc
// @Summary      Get file content
// @Description  Retrieve the content of the file with the specified ID.
// @Tags         projects
// @Produce      json
// @Param        id   path      createInviteReq  true  "new filename"
// @Success      200  {object}  map[string]interface{}  "message"="user successfully join to the project"
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/v1/project/invite/accept [put]
func (h *Handler) acceptInvite(c *gin.Context) {
	a, ok := c.Get("userID")
	if !ok {
		newErrorResponse(c, http.StatusUnauthorized, "No access token in headers")
		return
	}
	var input createInviteReq
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	err := h.service.Projects.JoinToProject(a.(int), input.ProjectId)
	if err != nil {
		newErrorResponse(c, http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, map[string]interface{}{
		"message": "user successfully join to the project",
	})
}

type compileProjectReq struct {
	EntryFile string `json:"entry_file" binding:"required"`
	ProjectId int    `json:"project_id" binding:"required"`
}

// compileProject godoc
// @Summary      Compile project
// @Description  Compile the project with the specified ID and entry file.
// @Tags         projects
// @Accept       json
// @Produce      json
// @Param        compileProjectReq body compileProjectReq true "Compile Project Request"
// @Success      200  {object}  map[string]interface{}  "output"="hello world\n"
// @Failure      400  {object}  errorResponse
// @Failure      500  {object}  errorResponse
// @Router       /api/v1/project/compile [post]
func (h *Handler) compileProject(c *gin.Context) {
	var input compileProjectReq
	if err := c.BindJSON(&input); err != nil {
		newErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}
	output, _ := h.service.Projects.CompileProject(input.ProjectId, input.EntryFile)
	c.JSON(http.StatusOK, map[string]interface{}{
		"output": output,
	})
}
