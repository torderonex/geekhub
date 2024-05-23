import { createSlice } from "@reduxjs/toolkit";
import { IMessage } from "src/model/IMessage";

interface initialState {
    chatMessages: IMessage[];
    isAiAnswering: boolean
}

const initialState: initialState = {
    chatMessages: [],
    isAiAnswering: false 
}

export const chatSlice = createSlice({
    name: 'chatSlice',
    initialState,
    reducers: {
        sendMessage: (state, action) => {
            state.chatMessages.push(action.payload)
        },
        AiAnswering: (state) => {
            state.isAiAnswering = true
        },
        AiNotAnswering: (state) => {
            state.isAiAnswering = false
        },
    }
});

export const {sendMessage, AiAnswering, AiNotAnswering} = chatSlice.actions;

export default chatSlice.reducer;