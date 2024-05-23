package webapi

type GptApi interface {
	DoPrompt(prompt string) (string, error)
}
