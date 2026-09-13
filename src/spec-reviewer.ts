import type { LlmProvider } from './llm/provider.js';
import type { SpecReview } from './domain.js';

const reviewShape = `{
  "requirementId": "string",
  "findings": [{"category":"ambiguity|missing_acceptance_criterion|risk","severity":"low|medium|high","statement":"string","recommendation":"string"}],
  "proposedSpec": {"id":"string","title":"string","objective":"string","assumptions":["string"],"outOfScope":["string"],"acceptanceCriteria":[{"id":"string","given":"string","when":"string","then":"string","priority":"must|should"}]},
  "judgmentSource": "llm"
}`;

export async function reviewRequirement(
  provider: LlmProvider,
  requirementId: string,
  rawRequirement: string
): Promise<SpecReview> {
  const review = await provider.completeJson<SpecReview>({
    task: 'review-spec',
    system: 'You are a cautious QA spec reviewer. Identify only evidence-based gaps. Make assumptions explicit and keep the proposed scope small.',
    input: { requirementId, rawRequirement },
    outputShape: reviewShape
  });
  validateReview(review, requirementId);
  return review;
}

function validateReview(review: SpecReview, requirementId: string): void {
  if (review.requirementId !== requirementId) throw new Error('Review requirementId does not match the request.');
  if (!Array.isArray(review.findings) || !review.proposedSpec?.acceptanceCriteria?.length) {
    throw new Error('Review is missing findings or acceptance criteria.');
  }
  const ids = review.proposedSpec.acceptanceCriteria.map((criterion) => criterion.id);
  if (new Set(ids).size !== ids.length) throw new Error('Acceptance criterion IDs must be unique.');
}
