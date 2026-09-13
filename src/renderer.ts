import type { GeneratedSuite, TestAction, TestScenario } from './domain.js';
import { supportedActions } from './capabilities.js';

const q = (value: string | undefined): string => JSON.stringify(value ?? '');

function renderAction(action: TestAction): string {
  if (!supportedActions.has(action.type)) throw new Error(`Unsupported action: ${action.type}`);
  const lines: Record<string, string> = {
    visitLogin: `await page.goto('/');`,
    login: `await login(page, ${q(action.value)});`,
    submitLogin: `await page.getByTestId('login-button').click();`,
    expectInventory: `await expect(page).toHaveURL(/inventory\\.html/);\n    await expect(page.getByTestId('inventory-list')).toBeVisible();`,
    expectError: `await expect(page.getByTestId('error')).toContainText(${q(action.expected)});`,
    logout: `await page.getByRole('button', { name: 'Open Menu' }).click();\n    await page.getByTestId('logout-sidebar-link').click();`,
    expectLogin: `await expect(page.getByTestId('login-button')).toBeVisible();`,
    addProduct: `await productRow(page, ${q(action.product)}).getByRole('button', { name: 'Add to cart' }).click();`,
    expectCartBadge: `await expect(page.getByTestId('shopping-cart-badge')).toHaveText(${q(action.expected)});`,
    openCart: `await page.getByTestId('shopping-cart-link').click();`,
    expectCartItem: `await expect(productRow(page, ${q(action.product)})).toBeVisible();`,
    removeProduct: `await productRow(page, ${q(action.product)}).getByRole('button', { name: 'Remove' }).click();`,
    expectCartEmpty: `await expect(page.getByTestId('inventory-item')).toHaveCount(0);\n    await expect(page.getByTestId('shopping-cart-badge')).toHaveCount(0);`,
    checkout: `await page.getByTestId('checkout').click();`,
    fillCheckout: `await page.getByTestId('firstName').fill(${q(action.firstName)});\n    await page.getByTestId('lastName').fill(${q(action.lastName)});\n    await page.getByTestId('postalCode').fill(${q(action.postalCode)});`,
    continueCheckout: `await page.getByTestId('continue').click();`,
    finishCheckout: `await page.getByTestId('finish').click();`,
    expectCheckoutComplete: `await expect(page).toHaveURL(/checkout-complete\\.html/);\n    await expect(page.getByRole('heading', { name: 'Thank you for your order!' })).toBeVisible();`
  };
  return lines[action.type] as string;
}

function renderScenario(scenario: TestScenario): string {
  const body = scenario.actions.map((action) => `    ${renderAction(action)}`).join('\n');
  return `  test(${q(`${scenario.id} ${scenario.title}`)}, async ({ page }) => {\n${body}\n  });`;
}

export function renderSuite(suite: GeneratedSuite): string {
  const tests = suite.scenarios.map(renderScenario).join('\n\n');
  return `// Generated from a constrained scenario DSL. Do not edit by hand.\nimport { test, expect, type Page } from '@playwright/test';\n\nconst password = process.env.SAUCEDEMO_PASSWORD ?? 'secret_sauce';\n\nasync function login(page: Page, username: string) {\n  await page.getByTestId('username').fill(username);\n  await page.getByTestId('password').fill(password);\n  await page.getByTestId('login-button').click();\n}\n\nfunction productRow(page: Page, name: string) {\n  return page.getByTestId('inventory-item').filter({ hasText: name });\n}\n\ntest.describe(${q(`Generated: ${suite.requirementId}`)}, () => {\n${tests}\n});\n`;
}
