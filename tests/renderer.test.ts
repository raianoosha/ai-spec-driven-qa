import assert from 'node:assert/strict';
import test from 'node:test';
import { demoScenarios } from '../src/fixtures.js';
import { renderSuite } from '../src/renderer.js';

test('renders traceable Playwright tests without model-authored source code', () => {
  const output = renderSuite({ requirementId: 'login', scenarios: demoScenarios.login!, generationSource: 'seeded-demo' });
  assert.match(output, /LOGIN-T-01 Standard user signs in/);
  assert.match(output, /getByTestId\('username'\)/);
  assert.match(output, /toHaveURL/);
});

test('rejects actions outside the allowlist', () => {
  assert.throws(() => renderSuite({
    requirementId: 'x', generationSource: 'llm', scenarios: [{ id: 'x', title: 'x', intent: 'x', tags: [], traceRequirementIds: [], actions: [{ type: 'deleteEverything' }] }]
  }), /Unsupported action/);
});
