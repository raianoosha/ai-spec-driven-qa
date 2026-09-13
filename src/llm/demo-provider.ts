import { demoReviews, demoScenarios } from '../fixtures.js';
import type { GeneratedSuite, SpecReview } from '../domain.js';
import type { JsonCompletionRequest, LlmProvider } from './provider.js';

export class SeededDemoProvider implements LlmProvider {
  readonly name = 'seeded-demo';

  async completeJson<T>(request: JsonCompletionRequest): Promise<T> {
    const input = request.input as { requirementId?: string };
    const id = input.requirementId;
    if (!id || !(id in demoReviews)) throw new Error(`No demo fixture for requirement: ${id ?? 'unknown'}`);

    if (request.task === 'review-spec') {
      return structuredClone(demoReviews[id] as SpecReview) as T;
    }

    if (request.task === 'generate-tests') {
      const scenarios = structuredClone(demoScenarios[id] ?? []);
      const seed = request.seed ?? 0;
      // Deliberate, bounded variation: some runs omit a lower-priority case. This
      // demonstrates non-determinism without inventing unsafe executable code.
      if (seed % 3 === 1) scenarios.pop();
      const suite: GeneratedSuite = { requirementId: id, scenarios, generationSource: 'seeded-demo', seed };
      return suite as T;
    }

    throw new Error(`The demo provider does not implement task: ${request.task}`);
  }
}
