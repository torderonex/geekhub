export interface TestOutput {
    input: number[];
    output: number[];
}

export interface ITask {
    id: number
    status: boolean;
    title: string;
    description: string;
    difficulty: string;
    type: string;
    language: string;
    defaultValue: string
    testOutputs: TestOutput[];
}