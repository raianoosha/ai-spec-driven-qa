export type Severity = 'low' | 'medium' | 'high';

export interface Finding {
  category: 'ambiguity' | 'missing_acceptance_criterion' | 'risk';
  severity: Severity;
  statement: string;
  recommendation: string;
}

export interface AcceptanceCriterion {
  id: string;
  given: string;
  when: string;
  then: string;
  priority: 'must' | 'should';
}

export interface StructuredSpec {
  id: string;
  title: string;
  objective: string;
  assumptions: string[];
  outOfScope: string[];
  acceptanceCriteria: AcceptanceCriterion[];
}

export interface SpecReview {
  requirementId: string;
  findings: Finding[];
  proposedSpec: StructuredSpec;
  judgmentSource: 'llm' | 'seeded-demo';
}

export interface TestAction {
  type: string;
  value?: string;
  product?: string;
  expected?: string;
  firstName?: string;
  lastName?: string;
  postalCode?: string;
}

export interface TestScenario {
  id: string;
  title: string;
  intent: string;
  traceRequirementIds: string[];
  actions: TestAction[];
  tags: string[];
}

export interface GeneratedSuite {
  requirementId: string;
  scenarios: TestScenario[];
  generationSource: 'llm' | 'seeded-demo';
  seed?: number;
}

export interface MetricResult {
  name: 'requirementCoverage' | 'relevance' | 'unsupportedBehavior' | 'executability';
  score: number;
  passed: number;
  total: number;
  notes: string[];
  evaluator: 'deterministic' | 'llm';
}

export interface EvaluationReport {
  requirementId: string;
  generatedAt: string;
  metrics: MetricResult[];
  overallScore: number;
}
