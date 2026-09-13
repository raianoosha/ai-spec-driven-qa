import type { SpecReview, StructuredSpec, TestScenario } from './domain.js';

const loginSpec: StructuredSpec = {
  id: 'login',
  title: 'Login to SauceDemo',
  objective: 'Permit a standard shopper to reach inventory while rejecting invalid and locked accounts.',
  assumptions: [
    'SauceDemo public test credentials are test data, not secrets.',
    'The inventory list and /inventory.html together prove a successful login.',
    'Exact SauceDemo error text is part of this demo contract.'
  ],
  outOfScope: ['Password recovery', 'Account creation', 'Rate limiting', 'Cross-browser visual comparison'],
  acceptanceCriteria: [
    { id: 'LOGIN-AC-01', priority: 'must', given: 'the login page', when: 'standard_user submits secret_sauce', then: 'inventory is visible at /inventory.html' },
    { id: 'LOGIN-AC-02', priority: 'must', given: 'the login page', when: 'locked_out_user submits secret_sauce', then: 'access is denied with the locked-out error' },
    { id: 'LOGIN-AC-03', priority: 'must', given: 'the login page', when: 'a blank username is submitted', then: 'the username-required error is shown' },
    { id: 'LOGIN-AC-04', priority: 'should', given: 'a signed-in standard user', when: 'the session is logged out', then: 'the login page is shown again' }
  ]
};

const cartSpec: StructuredSpec = {
  id: 'cart-checkout',
  title: 'Cart and checkout on SauceDemo',
  objective: 'Let a standard shopper manage one product and complete the supported checkout flow.',
  assumptions: [
    'A valid checkout uses non-empty first name, last name, and postal code.',
    'The cart badge and product row are authoritative for this demo.',
    'One product is sufficient to demonstrate the core flow.'
  ],
  outOfScope: ['Coupon codes', 'Payment processing', 'Inventory reservation', 'Shipping integrations'],
  acceptanceCriteria: [
    { id: 'CART-AC-01', priority: 'must', given: 'a signed-in shopper on inventory', when: 'Sauce Labs Backpack is added', then: 'the cart badge is 1 and the cart contains that product' },
    { id: 'CART-AC-02', priority: 'must', given: 'Sauce Labs Backpack is in the cart', when: 'the shopper removes it', then: 'the product row and cart badge are absent' },
    { id: 'CHECKOUT-AC-01', priority: 'must', given: 'Sauce Labs Backpack is in the cart', when: 'valid customer information is submitted and Finish is selected', then: 'the complete page displays Thank you for your order!' },
    { id: 'CHECKOUT-AC-02', priority: 'should', given: 'the checkout information page', when: 'customer information is blank and Continue is selected', then: 'the first-name-required error is shown' }
  ]
};

export const demoSpecs: Record<string, StructuredSpec> = { login: loginSpec, 'cart-checkout': cartSpec };

export const demoReviews: Record<string, SpecReview> = {
  login: {
    requirementId: 'login',
    judgmentSource: 'seeded-demo',
    findings: [
      { category: 'ambiguity', severity: 'high', statement: '“Invalid users” does not define credentials or user states.', recommendation: 'Name representative invalid and locked accounts.' },
      { category: 'ambiguity', severity: 'medium', statement: '“Helpful error” is not observable or measurable.', recommendation: 'Specify the expected message or semantic assertion.' },
      { category: 'missing_acceptance_criterion', severity: 'medium', statement: 'Blank-field behavior is unspecified.', recommendation: 'Add criteria for required username and password.' },
      { category: 'risk', severity: 'medium', statement: 'A URL-only success check could miss a broken inventory render.', recommendation: 'Assert both URL and inventory list visibility.' }
    ],
    proposedSpec: loginSpec
  },
  'cart-checkout': {
    requirementId: 'cart-checkout',
    judgmentSource: 'seeded-demo',
    findings: [
      { category: 'ambiguity', severity: 'high', statement: 'Cart “accuracy” has no observable definition.', recommendation: 'Assert badge, product identity, and removal state explicitly.' },
      { category: 'missing_acceptance_criterion', severity: 'high', statement: 'Required checkout fields and validation are missing.', recommendation: 'Define required fields and one representative validation case.' },
      { category: 'ambiguity', severity: 'medium', statement: '“Clear confirmation” does not name a stable signal.', recommendation: 'Specify the supported completion heading.' },
      { category: 'risk', severity: 'medium', statement: 'The requirement could invite tests for unsupported payment or coupon behavior.', recommendation: 'Declare payment and discounts out of scope.' }
    ],
    proposedSpec: cartSpec
  }
};

export const demoScenarios: Record<string, TestScenario[]> = {
  login: [
    { id: 'LOGIN-T-01', title: 'Standard user signs in', intent: 'Verify the supported happy path.', traceRequirementIds: ['LOGIN-AC-01'], tags: ['smoke', 'positive'], actions: [{ type: 'visitLogin' }, { type: 'login', value: 'standard_user' }, { type: 'expectInventory' }] },
    { id: 'LOGIN-T-02', title: 'Locked user is rejected', intent: 'Verify the named locked-account state.', traceRequirementIds: ['LOGIN-AC-02'], tags: ['negative'], actions: [{ type: 'visitLogin' }, { type: 'login', value: 'locked_out_user' }, { type: 'expectError', expected: 'Sorry, this user has been locked out.' }] },
    { id: 'LOGIN-T-03', title: 'Username is required', intent: 'Verify empty username validation.', traceRequirementIds: ['LOGIN-AC-03'], tags: ['negative'], actions: [{ type: 'visitLogin' }, { type: 'submitLogin' }, { type: 'expectError', expected: 'Username is required' }] },
    { id: 'LOGIN-T-04', title: 'Signed-in user logs out', intent: 'Verify the session exit path.', traceRequirementIds: ['LOGIN-AC-04'], tags: ['session'], actions: [{ type: 'visitLogin' }, { type: 'login', value: 'standard_user' }, { type: 'logout' }, { type: 'expectLogin' }] }
  ],
  'cart-checkout': [
    { id: 'CART-T-01', title: 'Add backpack to cart', intent: 'Verify badge and cart contents after add.', traceRequirementIds: ['CART-AC-01'], tags: ['smoke'], actions: [{ type: 'visitLogin' }, { type: 'login', value: 'standard_user' }, { type: 'addProduct', product: 'Sauce Labs Backpack' }, { type: 'expectCartBadge', expected: '1' }, { type: 'openCart' }, { type: 'expectCartItem', product: 'Sauce Labs Backpack' }] },
    { id: 'CART-T-02', title: 'Remove backpack from cart', intent: 'Verify removal updates row and badge.', traceRequirementIds: ['CART-AC-02'], tags: ['cart'], actions: [{ type: 'visitLogin' }, { type: 'login', value: 'standard_user' }, { type: 'addProduct', product: 'Sauce Labs Backpack' }, { type: 'openCart' }, { type: 'removeProduct', product: 'Sauce Labs Backpack' }, { type: 'expectCartEmpty' }] },
    { id: 'CHECKOUT-T-01', title: 'Complete checkout', intent: 'Verify the supported checkout happy path.', traceRequirementIds: ['CHECKOUT-AC-01'], tags: ['smoke', 'checkout'], actions: [{ type: 'visitLogin' }, { type: 'login', value: 'standard_user' }, { type: 'addProduct', product: 'Sauce Labs Backpack' }, { type: 'openCart' }, { type: 'checkout' }, { type: 'fillCheckout', firstName: 'Ada', lastName: 'Lovelace', postalCode: 'T5J 0N3' }, { type: 'continueCheckout' }, { type: 'finishCheckout' }, { type: 'expectCheckoutComplete' }] },
    { id: 'CHECKOUT-T-02', title: 'Require customer information', intent: 'Verify representative checkout validation.', traceRequirementIds: ['CHECKOUT-AC-02'], tags: ['negative', 'checkout'], actions: [{ type: 'visitLogin' }, { type: 'login', value: 'standard_user' }, { type: 'addProduct', product: 'Sauce Labs Backpack' }, { type: 'openCart' }, { type: 'checkout' }, { type: 'continueCheckout' }, { type: 'expectError', expected: 'First Name is required' }] }
  ]
};
