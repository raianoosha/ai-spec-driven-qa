import type { EvaluationReport, GeneratedSuite, SpecReview } from './domain.js';
import { evaluateSuite } from './evaluator.js';
import { readRequirement, writeJson, writeText } from './io.js';
import type { LlmProvider } from './llm/provider.js';
import { renderSuite } from './renderer.js';
import { reviewRequirement } from './spec-reviewer.js';
import { generateSuite } from './test-generator.js';

export const requirementIds = ['login', 'cart-checkout'] as const;

export interface PipelineResult {
  review: SpecReview;
  suite: GeneratedSuite;
  evaluation: EvaluationReport;
}

export async function runPipeline(provider: LlmProvider, requirementId: string, seed = 0, persist = true): Promise<PipelineResult> {
  const raw = await readRequirement(requirementId);
  const review = await reviewRequirement(provider, requirementId, raw);
  const suite = await generateSuite(provider, review.proposedSpec, seed);
  const evaluation = evaluateSuite(review.proposedSpec, suite);

  if (persist) {
    await writeJson(`artifacts/reviews/${requirementId}.json`, review);
    await writeJson(`artifacts/specs/${requirementId}.json`, review.proposedSpec);
    await writeJson(`artifacts/scenarios/${requirementId}.json`, suite);
    await writeJson(`artifacts/evaluations/${requirementId}.json`, evaluation);
    await writeText(`generated/${requirementId}.spec.ts`, renderSuite(suite));
  }
  return { review, suite, evaluation };
}
