import { supportedActions, unsupportedBehaviorTerms } from './capabilities.js';
import type { EvaluationReport, GeneratedSuite, MetricResult, StructuredSpec, TestScenario } from './domain.js';
import { renderSuite } from './renderer.js';

const ratio = (passed: number, total: number): number => total === 0 ? 0 : Number((passed / total).toFixed(3));

function requirementCoverage(spec: StructuredSpec, suite: GeneratedSuite): MetricResult {
  const traced = new Set(suite.scenarios.flatMap((scenario) => scenario.traceRequirementIds));
  const missing = spec.acceptanceCriteria.filter((criterion) => !traced.has(criterion.id)).map((criterion) => criterion.id);
  const passed = spec.acceptanceCriteria.length - missing.length;
  return { name: 'requirementCoverage', score: ratio(passed, spec.acceptanceCriteria.length), passed, total: spec.acceptanceCriteria.length, notes: missing.map((id) => `Uncovered: ${id}`), evaluator: 'deterministic' };
}

function relevance(spec: StructuredSpec, suite: GeneratedSuite): MetricResult {
  const valid = new Set(spec.acceptanceCriteria.map((criterion) => criterion.id));
  const irrelevant = suite.scenarios.filter((scenario) => scenario.traceRequirementIds.length === 0 || scenario.traceRequirementIds.some((id) => !valid.has(id)));
  return { name: 'relevance', score: ratio(suite.scenarios.length - irrelevant.length, suite.scenarios.length), passed: suite.scenarios.length - irrelevant.length, total: suite.scenarios.length, notes: irrelevant.map((scenario) => `Invalid traceability: ${scenario.id}`), evaluator: 'deterministic' };
}

function unsupportedBehavior(suite: GeneratedSuite): MetricResult {
  const unsupported: string[] = [];
  for (const scenario of suite.scenarios) {
    for (const action of scenario.actions) {
      if (!supportedActions.has(action.type)) unsupported.push(`${scenario.id}: unsupported action ${action.type}`);
    }
    const prose = `${scenario.title} ${scenario.intent}`.toLowerCase();
    for (const term of unsupportedBehaviorTerms) {
      if (prose.includes(term)) unsupported.push(`${scenario.id}: unsupported behavior “${term}”`);
    }
  }
  const total = suite.scenarios.length;
  const affected = new Set(unsupported.map((note) => note.split(':')[0])).size;
  return { name: 'unsupportedBehavior', score: ratio(total - affected, total), passed: total - affected, total, notes: unsupported, evaluator: 'deterministic' };
}

function scenarioRenders(scenario: TestScenario, suite: GeneratedSuite): boolean {
  try { renderSuite({ ...suite, scenarios: [scenario] }); return true; } catch { return false; }
}

function executability(suite: GeneratedSuite): MetricResult {
  const failed = suite.scenarios.filter((scenario) => !scenarioRenders(scenario, suite));
  return { name: 'executability', score: ratio(suite.scenarios.length - failed.length, suite.scenarios.length), passed: suite.scenarios.length - failed.length, total: suite.scenarios.length, notes: failed.map((scenario) => `Could not render: ${scenario.id}`), evaluator: 'deterministic' };
}

export function evaluateSuite(spec: StructuredSpec, suite: GeneratedSuite): EvaluationReport {
  const metrics = [requirementCoverage(spec, suite), relevance(spec, suite), unsupportedBehavior(suite), executability(suite)];
  return {
    requirementId: spec.id,
    generatedAt: new Date().toISOString(),
    metrics,
    overallScore: Number((metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length).toFixed(3))
  };
}
