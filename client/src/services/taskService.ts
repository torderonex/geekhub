import { AxiosResponse } from "axios";
import $api from "src/http";

export default class taskService {
    static async testSolution(code: string, language: string, task_id: number, user_id: number): Promise<AxiosResponse> {
        return $api.post('tasks/test',
        {
          code,
          language,
          task_id,
          user_id
        });
    }

    static async getTasks(): Promise<AxiosResponse> {
        return $api.get('/tasks');
    }

    static async getTaskById(task_id: number): Promise<AxiosResponse> {
        return $api.get(`/tasks/${task_id}`);
    }
}