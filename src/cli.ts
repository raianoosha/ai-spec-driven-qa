#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createProvider } from './llm/factory.js';
import { requirementIds, runPipeline } from './pipeline.js';
import { projectRoot, writeJson } from './io.js';

function option(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function selectedRequirements(): string[] {
  const selected = option('requirement', 'all');
  if (selected === 'all') return [...requirementIds];
  if (!requirementIds.includes(selected as (typeof requirementIds)[number])) {
    throw new Error(`Unknown requirement "${selected}". Use login, cart-checkout, or all.`);
  }
  return [selected];
}

async function demo(): Promise<void> {
  const provider = createProvider(option('provider', 'demo'));
  for (const id of selectedRequirements()) {
    const result = await runPipeline(provider, id, Number(option('seed', '0')), true);
    console.log(`✓ ${id}: ${result.review.findings.length} findings, ${result.suite.scenarios.length} scenarios, evaluation ${Math.round(result.evaluation.overallScore * 100)}%`);
  }
  console.log('Generated Playwright tests and reports under generated/ and artifacts/.');
}

async function repeat(): Promise<void> {
  const runs = Number(option('runs', '5'));
  if (!Number.isInteger(runs) || runs < 2 || runs > 50) throw new Error('--runs must be an integer from 2 to 50.');
  const provider = createProvider(option('provider', 'demo'));
  const records: Array<{ run: number; requirementId: string; score: number; scenarioCount: number; coverage: number }> = [];
  for (let run = 0; run < runs; run += 1) {
    for (const id of selectedRequirements()) {
      const result = await runPipeline(provider, id, run, false);
      const coverage = result.evaluation.metrics.find((metric) => metric.name === 'requirementCoverage')?.score ?? 0;
      records.push({ run: run + 1, requirementId: id, score: result.evaluation.overallScore, scenarioCount: result.suite.scenarios.length, coverage });
    }
  }
  const summary = [...requirementIds].filter((id) => records.some((row) => row.requirementId === id)).map((id) => {
    const rows = records.filter((row) => row.requirementId === id);
    const meanScore = rows.reduce((sum, row) => sum + row.score, 0) / rows.length;
    const passRate = rows.filter((row) => row.coverage === 1).length / rows.length;
    return { requirementId: id, runs: rows.length, meanScore: Number(meanScore.toFixed(3)), fullCoveragePassRate: Number(passRate.toFixed(3)), scenarioCounts: rows.map((row) => row.scenarioCount) };
  });
  await writeJson('artifacts/repeated-runs.json', { provider: provider.name, records, summary });
  console.table(summary);
  console.log('Saved artifacts/repeated-runs.json');
}

async function run(): Promise<void> {
  await demo();
  console.log('Running generated tests against SauceDemo...');
  const cliPath = `${projectRoot}/node_modules/playwright/cli.js`;
  const result = spawnSync(process.execPath, [cliPath, 'test'], {
    cwd: projectRoot,
    env: process.env,
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Playwright exited with status ${result.status ?? 'unknown'}.`);
}

function help(): void {
  console.log(`ai-spec-driven-qa\n\nCommands:\n  demo     Review, generate, evaluate, and write Playwright tests\n  run      Run the demo pipeline, then execute Playwright against SauceDemo\n  repeat   Run generation repeatedly and aggregate mean/pass-rate metrics\n\nOptions:\n  --requirement login|cart-checkout|all  (default: all)\n  --provider demo|http                   (default: demo)\n  --seed <integer>                       (default: 0)\n  --runs <2-50>                          (repeat only, default: 5)\n\nExamples:\n  npm run qa -- demo\n  npm run qa -- run --requirement login\n  npm run qa -- repeat --runs 10\n  npm run test:e2e`);
}

const command = process.argv[2] ?? 'help';
try {
  if (command === 'demo') await demo();
  else if (command === 'run') await run();
  else if (command === 'repeat') await repeat();
  else help();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
