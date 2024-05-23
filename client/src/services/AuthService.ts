import $api from "src/http/index";
import {AxiosResponse} from 'axios'
import { AuthResponse } from "src/model/response/AuthResponse";

export default class AuthService {
    static async login(nickname: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post('auth/login', {username: nickname, password});
    }

    static async registration(nickname: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post('auth/register', {username: nickname, password});
    }

    static async logout(): Promise<void> {
        return $api.post('auth/logout');
    }
}