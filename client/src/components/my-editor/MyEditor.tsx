// @ts-nocheck
import { Editor, loader } from "@monaco-editor/react";
import { useEffect, useCallback, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/hooks/redux-hooks";
import {
  setEditorLanguage,
  setEditorValue,
} from "src/store/reducers/codeSlice";
import { updateFileEditorValue } from "src/store/reducers/projectsSlice";
import debounce from "lodash/debounce";
import { Theme, useTheme } from "src/hooks/useTheme";

export default function MyEditor() {
  const dispatch = useAppDispatch();
  const { selectedFile } = useAppSelector((state) => state.projectsSlice);
  const { theme } = useTheme();
  const [editorTheme, setEditorTheme] = useState(theme);

  const debouncedUpdateFileEditorValue = useCallback(
    debounce(() => {
      dispatch(updateFileEditorValue({ editorValue: value }));
    }, 1500),
    []
  );

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      dispatch(setEditorValue(value));
      debouncedUpdateFileEditorValue(selectedFile.id, value);
    }
  };

  const handleFileChange = (event : any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        if (selectedFile) {
          dispatch(
            updateFileEditorValue()
          );
        }
        dispatch(setEditorValue(content));
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    dispatch(setEditorLanguage(selectedFile?.fileLang));
    dispatch(setEditorValue(selectedFile?.editorValue));

    loader.init().then((monaco) => {
      const darkTheme = {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", background: "181717" },
          { token: "active-line", foreground: "E8E8E8" },
        ],
        colors: {
          "editor.background": "#1E1E1E",
          "editor.foreground": "#E0E0E0",
          "editorLineNumber.foreground": "#888888",
          "editorCursor.foreground": "#F8F8F0",
          "editor.selectionBackground": "#44444488",
          "editor.inactiveSelectionBackground": "#33333388",
          "editor.lineHighlightBackground": "#2E2E2E",
          "editorLineNumber.activeForeground": "#F8F8F0",
        },
      };

      const whiteTheme = {
        base: "vs",
        inherit: true,
        rules: [
          { token: "", background: "FFFFFF" },
          { token: "active-line", foreground: "000000" },
        ],
        colors: {
          "editor.background": "#FFFFFF",
          "editor.foreground": "#000000",
          "editorLineNumber.foreground": "#555555",
          "editorCursor.foreground": "#000000",
          "editor.selectionBackground": "#ADD8E688",
          "editor.inactiveSelectionBackground": "#D3D3D388",
          "editor.lineHighlightBackground": "#EEEEEE",
          "editorLineNumber.activeForeground": "#000000",
        },
      };

      if (theme === Theme.DARK) {
        monaco.editor.defineTheme("dark", darkTheme);
        setEditorTheme("dark");
      } else {
        monaco.editor.defineTheme("whiteTheme", whiteTheme);
        setEditorTheme("whiteTheme");
      }
    });
  }, [selectedFile, dispatch, theme]);
  const getLanguageExtension = (language?: string): string | undefined => {
    const languageMapping: { [key: string]: string } = {
      "c++": "cpp",
      golang: "go",
    };
    return language
      ? languageMapping[language.toLowerCase()] || language
      : undefined;
  };
  return (
    <Editor
      options={{
        minimap: {
          enabled: true,
        },
        fontSize: 16,
      }}
      height="100%"
      theme={editorTheme}
      language={getLanguageExtension(selectedFile?.fileLang)}
      value={selectedFile?.editorValue}
      onChange={handleEditorChange}
      loading={<div></div>}
    />
  );
}
