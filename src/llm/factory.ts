import { HttpLlmProvider } from './http-provider.js';
import type { LlmProvider } from './provider.js';
import { SeededDemoProvider } from './demo-provider.js';

export function createProvider(name: string): LlmProvider {
  if (name === 'demo') return new SeededDemoProvider();
  if (name === 'http') {
    const baseUrl = process.env.LLM_BASE_URL;
    const apiKey = process.env.LLM_API_KEY;
    const model = process.env.LLM_MODEL;
    if (!baseUrl || !apiKey || !model) {
      throw new Error('HTTP provider requires LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL.');
    }
    return new HttpLlmProvider(baseUrl, apiKey, model);
  }
  throw new Error(`Unknown provider "${name}". Use "demo" or "http".`);
}
