import type { JsonCompletionRequest, LlmProvider } from './provider.js';

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export class HttpLlmProvider implements LlmProvider {
  readonly name = 'http-llm';

  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
    private readonly model: string
  ) {}

  async completeJson<T>(request: JsonCompletionRequest): Promise<T> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: `${request.system}\nReturn JSON only. Expected shape:\n${request.outputShape}` },
          { role: 'user', content: JSON.stringify(request.input) }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error(`LLM request failed (${response.status}): ${await response.text()}`);
    const body = (await response.json()) as ChatCompletionResponse;
    const text = body.choices?.[0]?.message?.content;
    if (!text) throw new Error('LLM response did not contain message content.');
    return JSON.parse(text) as T;
  }
}
