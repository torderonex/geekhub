import { createSlice } from "@reduxjs/toolkit";

interface initialState {
    code: string,
    language: string,
    isLoading: boolean
}

const initialState: initialState = {
    code: '',
    language: 'javascript',
    isLoading: false
}

export const taskSlice = createSlice({
    name: 'taskSlice',
    initialState,
    reducers: {
        setCode: (state, action) => {
            state.code = action.payload
        },
        setLanguage: (state, action) => {
            state.language = action.payload
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload
        },
    }
});

export const { setCode, setIsLoading, setLanguage } = taskSlice.actions;

export default taskSlice.reducer;
