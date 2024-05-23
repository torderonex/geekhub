import $api from "../http/index";
import {AxiosResponse} from 'axios'
import { ChatResponse } from "../model/response/ChatResponse";

interface arg {
    code: string | undefined;
    prompt?: string;
}

export default class ChatService {
    static async askAI({code, prompt}: arg): Promise<AxiosResponse<ChatResponse>> {
        return $api.post<ChatResponse>('ai/ask', {
            code,
            prompt
        })
    }
    static async reviewCode({code}: arg): Promise<AxiosResponse> {
        return $api.post<ChatResponse>('ai/review', {
            code
        })
    }
}