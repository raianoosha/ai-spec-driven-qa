import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateSuite } from '../src/evaluator.js';
import { demoScenarios, demoSpecs } from '../src/fixtures.js';
import type { GeneratedSuite } from '../src/domain.js';

test('scores the complete login suite at 100%', () => {
  const suite: GeneratedSuite = { requirementId: 'login', scenarios: structuredClone(demoScenarios.login ?? []), generationSource: 'seeded-demo' };
  const report = evaluateSuite(demoSpecs.login!, suite);
  assert.equal(report.overallScore, 1);
  assert.ok(report.metrics.every((metric) => metric.evaluator === 'deterministic'));
});

test('reports uncovered acceptance criteria', () => {
  const suite: GeneratedSuite = { requirementId: 'login', scenarios: [structuredClone(demoScenarios.login![0]!)], generationSource: 'seeded-demo' };
  const report = evaluateSuite(demoSpecs.login!, suite);
  const metric = report.metrics.find((item) => item.name === 'requirementCoverage');
  assert.equal(metric?.score, 0.25);
  assert.equal(metric?.notes.length, 3);
});

test('flags an unsupported behavior and prevents rendering', () => {
  const suite: GeneratedSuite = {
    requirementId: 'cart-checkout', generationSource: 'llm', scenarios: [{
      id: 'BAD-1', title: 'Apply coupon', intent: 'Use a discount code', tags: [], traceRequirementIds: ['CART-AC-01'], actions: [{ type: 'applyCoupon', value: 'SAVE10' }]
    }]
  };
  const report = evaluateSuite(demoSpecs['cart-checkout']!, suite);
  assert.equal(report.metrics.find((item) => item.name === 'unsupportedBehavior')?.score, 0);
  assert.equal(report.metrics.find((item) => item.name === 'executability')?.score, 0);
});
