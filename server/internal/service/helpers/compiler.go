package helpers

func GetExtByLang(lang string) string {
	switch lang {
	case "python":
		return ".py"
	case "c++":
		return ".cpp"
	case "golang":
		return ".go"
	case "javascript":
		return ".js"
	default:
		return ""
	}
}

func GetLangByExt(ext string) string {
	switch ext {
	case "py":
		return "python"
	case "cpp":
		return "c++"
	case "go":
		return "golang"
	case "js":
		return "javascript"
	default:
		return ""
	}
}

func GetExtByCommand(lang string) string {
	switch lang {
	case "python":
		return "py"
	case "sh":
		return "cpp"
	case "go":
		return "go"
	case "node":
		return "js"
	default:
		return ""
	}
}
