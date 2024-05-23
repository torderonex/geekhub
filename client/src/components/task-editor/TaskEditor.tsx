// @ts-nocheck
import { Editor, loader } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks/redux-hooks';
import { Theme, useTheme } from 'src/hooks/useTheme';
import { setCode } from 'src/store/reducers/taskSlice';

export default function TaskEditor() {
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const { code, language } = useAppSelector(state => state.taskSlice);
  const [editorTheme, setEditorTheme] = useState<string>(theme);
  console.log(theme)

  useEffect(() => {
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
        setEditorTheme('dark');
      } else {
        monaco.editor.defineTheme("whiteTheme", whiteTheme);
        setEditorTheme('whiteTheme');
      }
    });
  }, [theme]);

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
      language={language}
      value={code}
      onChange={(value) => dispatch(setCode(value))}
    />
  );
}
