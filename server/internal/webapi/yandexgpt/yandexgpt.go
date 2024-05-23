package yandexgpt

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/torderonex/webcompiler/server/internal/config"
	"go.uber.org/zap"
)

type ApiResponse struct {
	Result struct {
		Alternatives []struct {
			Message struct {
				Role string `json:"role"`
				Text string `json:"text"`
			} `json:"message"`
			Status string `json:"status"`
		} `json:"alternatives"`
		Usage struct {
			InputTextTokens  string `json:"inputTextTokens"`
			CompletionTokens string `json:"completionTokens"`
			TotalTokens      string `json:"totalTokens"`
		} `json:"usage"`
		ModelVersion string `json:"modelVersion"`
	} `json:"result"`
}

type ApiError struct {
	Error struct {
		GrpcCode   int      `json:"grpcCode"`
		HTTPCode   int      `json:"httpCode"`
		Message    string   `json:"message"`
		HTTPStatus string   `json:"httpStatus"`
		Details    []string `json:"details"`
	} `json:"error"`
}

type TokenResponse struct {
	IamToken string `json:"iamToken"`
}

const (
	apiURL      = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
	apiURLAsync = "https://llm.api.cloud.yandex.net/foundationModels/v1/completionAync"
)

type YandexGptApi struct {
	logger *zap.Logger
	config config.Config
	token  string
	mu     sync.Mutex
}

func New(logger *zap.Logger, config config.Config) *YandexGptApi {
	a := &YandexGptApi{
		logger: logger,
		config: config,
	}
	go a.startTokenUpdater() // Запускаем обновление токена в горутине
	if err := a.refreshToken(); err != nil {
		logger.Error("Failed to refresh IAM token during initialization", zap.Error(err))
	}
	return a
}

func (a *YandexGptApi) refreshToken() error {
	requestBody := map[string]interface{}{
		"yandexPassportOauthToken": a.config.Gpt.OAuth2Token,
	}

	requestBodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", "https://iam.api.cloud.yandex.net/iam/v1/tokens", bytes.NewBuffer(requestBodyBytes))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+a.config.Gpt.OAuth2Token)

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("unexpected status code: %d, body: %s", resp.StatusCode, body)
	}

	var tokenResponse TokenResponse
	if err := json.Unmarshal(body, &tokenResponse); err != nil {
		return err
	}

	a.mu.Lock()
	defer a.mu.Unlock()
	a.token = tokenResponse.IamToken
	return nil
}

func (a *YandexGptApi) startTokenUpdater() {
	ticker := time.NewTicker(12 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		if err := a.refreshToken(); err != nil {
			a.logger.Error("Failed to refresh IAM token", zap.Error(err))
		}
	}
}

func (a *YandexGptApi) DoPrompt(prompt string) (string, error) {

	var modelURI = fmt.Sprintf("gpt://%s/yandexgpt/latest", os.Getenv("YANDEXCLOUD_DIR"))
	requestBody := map[string]interface{}{
		"modelUri": modelURI,
		"completionOptions": map[string]interface{}{
			"stream":      false,
			"temperature": 0.7,
			"maxTokens":   "2000",
		},
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"text": prompt,
			},
		},
	}

	requestBodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		a.logger.Error("Failed to marshal request body", zap.Error(err))
		return "", err
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(requestBodyBytes))
	if err != nil {
		a.logger.Error("Failed to create HTTP request", zap.Error(err))
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+a.token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		a.logger.Error("Failed to send HTTP POST request to YANDEX GPT", zap.Error(err))
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var response ApiError
		if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
			a.logger.Error("Failed to decode response body", zap.Error(err))
			return "", err
		}

		errMsg := response.Error.Message
		a.logger.Error("Unexpected status code from GPT API", zap.Int("status_code", resp.StatusCode), zap.String("error", errMsg))
		return "", fmt.Errorf("unexpected status code: %d, error message: %s", resp.StatusCode, errMsg)
	}

	var response ApiResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		a.logger.Error("Failed to decode response body", zap.Error(err))
		return "", err
	}

	generatedText := response.Result.Alternatives[0].Message.Text
	return generatedText, nil
}

func (a *YandexGptApi) DoPromptAsync(prompt string) (string, error) {
	panic("not implemented")
}
