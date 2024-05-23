import { createSlice } from "@reduxjs/toolkit";
import { LANGUAGE_SNIPPETS } from "src/consts/language-snippets";

interface initialState {
  editorValue: string | undefined;
  codeOutput: string | null;
  editorLanguage: string;
  isCodeOutputLoading: boolean;
  isError: boolean;
}

const initialState: initialState = {
  editorValue:
    LANGUAGE_SNIPPETS["javascript" as keyof typeof LANGUAGE_SNIPPETS],
  codeOutput: null,
  editorLanguage: "javascript",
  isCodeOutputLoading: false,
  isError: false,
};

export const codeSlice = createSlice({
  name: "codeSlice",
  initialState,
  reducers: {
    setEditorValue: (state, action) => {
      state.editorValue = action.payload;
    },
    setCodeOutput: (state, action) => {
      state.codeOutput = action.payload;
    },
    setEditorLanguage: (state, action) => {
      state.editorLanguage = action.payload;
    },
    setIsCodeOutputLoading: (state, action) => {
      state.isCodeOutputLoading = action.payload;
    },
    setIsError: (state, action) => {
      state.isError = action.payload;
    },
  },
});

export const {
  setEditorValue,
  setCodeOutput,
  setEditorLanguage,
  setIsCodeOutputLoading,
} = codeSlice.actions;

export default codeSlice.reducer;
