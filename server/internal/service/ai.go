package service

import (
	"github.com/torderonex/webcompiler/server/internal/webapi"
	"go.uber.org/zap"
)

type AIService struct {
	logger *zap.Logger
	gpt    webapi.GptApi
}

func newAIService(l *zap.Logger, gpt webapi.GptApi) *AIService {
	return &AIService{l, gpt}
}

func (a AIService) DoPrompt(prompt, code string) (string, error) {
	if code != "" {
		prefix := "Сейчас я задам тебе вопрос по этому коду:\n" + code + "\n"
		prompt += prefix + prompt
	}
	answer, err := a.gpt.DoPrompt(prompt)
	return answer, err
}

func (a AIService) GetCodeAnalysis(code string) (string, error) {
	prompt := `Проанализируй следующий код и дай рекомендации по его улучшению по следующим критериям. Пиши строго по делу, без лишней воды:
	Верни исправленный код, без дополнительного текста, добавь комментарии в код.
	Код для анализа:\n
` + code
	a.logger.Info("DOING PROMPT", zap.String("prompt", prompt))
	resp, err := a.gpt.DoPrompt(prompt)
	if err != nil {
		a.logger.Error(err.Error())
		return "", err
	}
	return resp, nil
}
