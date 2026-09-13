export interface JsonCompletionRequest {
  task: 'review-spec' | 'generate-tests' | 'judge-quality';
  system: string;
  input: unknown;
  outputShape: string;
  seed?: number;
}

export interface LlmProvider {
  readonly name: string;
  completeJson<T>(request: JsonCompletionRequest): Promise<T>;
}
