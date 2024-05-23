package service

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/torderonex/webcompiler/server/internal/service/helpers"
	"go.uber.org/zap"
)

type CompilerService struct {
	logger *zap.Logger
}

func newCompilerService(l *zap.Logger) *CompilerService {
	return &CompilerService{l}
}

func (c *CompilerService) CompileScript(language, code string) string {
	c.logger.Info("COMPILING SCRIPT:", zap.String("CODE", code), zap.String("LANG", language))

	// creating temp file to write code to it
	tmpfile, err := os.CreateTemp("", "code.*"+helpers.GetExtByLang(language))
	if err != nil {
		return ""
	}
	c.logger.Info(tmpfile.Name())
	fileName := tmpfile.Name()

	if _, err := tmpfile.Write([]byte(code)); err != nil {
		return ""
	}

	defer os.Remove(tmpfile.Name())
	defer tmpfile.Close()

	var output string

	switch language {
	case "c++":
		output, err = c.compileCppCode(fileName)
	case "python":
		output, err = c.compilePythonCode(fileName)
	case "golang":
		output, err = c.compileGolangCode(fileName)
	case "javascript":
		output, err = c.compileNodeCode(fileName)
	default:
		err = fmt.Errorf("unsupported language: %s", language)
	}

	if err != nil {
		c.logger.Info("COMPILING ERROR:", zap.String("ERROR", err.Error()), zap.String("SCRIPT", code))
		return output
	}

	return output
}

func (c *CompilerService) compilePythonCode(file string) (string, error) {
	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/app/main.py", file), "python:3", "python", "/app/main.py"}
	return c.runDockerCommandWithTimeout(context.Background(), args...)
}

func (c *CompilerService) compileCppCode(file string) (string, error) {
	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/app/main.cpp", file), "gcc:latest", "sh", "-c", "g++ /app/main.cpp -o /app/main && /app/main"}
	return c.runDockerCommandWithTimeout(context.Background(), args...)
}

func (c *CompilerService) compileGolangCode(file string) (string, error) {
	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/app/main.go", file), "golang", "go", "run", "/app/main.go"}
	return c.runDockerCommandWithTimeout(context.Background(), args...)
}

func (c *CompilerService) compileNodeCode(file string) (string, error) {
	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/app/main.js", file), "node", "node", "/app/main.js"}
	return c.runDockerCommandWithTimeout(context.Background(), args...)
}

func (c *CompilerService) runDockerCommandWithTimeout(ctx context.Context, args ...string) (string, error) {
	var stdout, stderr bytes.Buffer
	cmd := exec.CommandContext(ctx, "docker", args...)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if ctx.Err() == context.DeadlineExceeded {
		return stderr.String(), fmt.Errorf("command timed out")
	}
	if err != nil {
		c.logger.Error("STDOUT", zap.String("stdout", stdout.String()))
		c.logger.Error("STDERR", zap.String("stderr", stderr.String()))
		return stderr.String(), fmt.Errorf("docker command failed: %v", err)
	}

	return stdout.String(), nil
}

func (c *CompilerService) CompileCppProject(pathToProject string) (string, error) {
	cppFiles, err := filepath.Glob(filepath.Join(pathToProject, "*.cpp"))
	if err != nil {
		c.logger.Error("Failed to list cpp files", zap.Error(err))
		return "", err
	}

	compileArgs := []string{"g++", "-o", "/compiled_cpp_file"}
	compileArgs = append(compileArgs, cppFiles...)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/cpp_files", pathToProject), "gcc:latest", "sh", "-c", strings.Join(compileArgs, " ") + " && /compiled_cpp_file"}
	return c.runDockerCommandWithTimeout(ctx, args...)
}

func (c *CompilerService) CompileGolangProject(pathToProject string) (string, error) {
	// Получение списка всех Go файлов в директории
	goFiles, err := filepath.Glob(filepath.Join(pathToProject, "*.go"))
	if err != nil {
		c.logger.Error("Failed to list Go files", zap.Error(err))
		return "", err
	}

	if len(goFiles) == 0 {
		return "", fmt.Errorf("no Go files found in the project directory")
	}

	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/go/src/app", pathToProject), "golang", "go", "run"}
	for _, goFile := range goFiles {
		args = append(args, fmt.Sprintf("/go/src/app/%s", filepath.Base(goFile)))
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	return c.runDockerCommandWithTimeout(ctx, args...)
}

func (c *CompilerService) CompilePythonProject(pathToProject, entryPoint string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/python_project", pathToProject), "python:latest", "python", fmt.Sprintf("/python_project/%s", entryPoint)}
	return c.runDockerCommandWithTimeout(ctx, args...)
}

func (c *CompilerService) CompileNodeProject(pathToProject, entryPoint string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()

	args := []string{"run", "--rm", "-v", fmt.Sprintf("%s:/node_project", pathToProject), "node:latest", "node", fmt.Sprintf("/node_project/%s", entryPoint)}
	return c.runDockerCommandWithTimeout(ctx, args...)
}

func (c *CompilerService) CompileProject(language, pathToProject, entryPoint string) (string, error) {
	switch language {
	case "c++":
		return c.CompileCppProject(pathToProject)
	case "golang":
		return c.CompileGolangProject(pathToProject)
	case "python":
		return c.CompilePythonProject(pathToProject, entryPoint)
	case "javascript":
		return c.CompileNodeProject(pathToProject, entryPoint)
	default:
		return "", fmt.Errorf("unsupported language: %s", language)
	}
}
