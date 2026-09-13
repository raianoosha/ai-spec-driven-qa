import type { GeneratedSuite, StructuredSpec } from './domain.js';
import type { LlmProvider } from './llm/provider.js';

const suiteShape = `{
  "requirementId":"string",
  "scenarios":[{"id":"string","title":"string","intent":"string","traceRequirementIds":["AC-ID"],"actions":[{"type":"allowed action","value":"optional","product":"optional","expected":"optional"}],"tags":["string"]}],
  "generationSource":"llm"
}`;

export async function generateSuite(provider: LlmProvider, spec: StructuredSpec, seed = 0): Promise<GeneratedSuite> {
  const suite = await provider.completeJson<GeneratedSuite>({
    task: 'generate-tests',
    system: `Generate a minimal, non-duplicative suite. Trace every scenario to acceptance criteria. Use only these actions: visitLogin, login, submitLogin, expectInventory, expectError, logout, expectLogin, addProduct, expectCartBadge, openCart, expectCartItem, removeProduct, expectCartEmpty, checkout, fillCheckout, continueCheckout, finishCheckout, expectCheckoutComplete. Do not generate source code.`,
    input: { requirementId: spec.id, spec },
    outputShape: suiteShape,
    seed
  });
  if (suite.requirementId !== spec.id || !Array.isArray(suite.scenarios)) {
    throw new Error('Generated suite is invalid or belongs to another requirement.');
  }
  return suite;
}
