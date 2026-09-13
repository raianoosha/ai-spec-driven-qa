export const supportedActions = new Set([
  'visitLogin', 'login', 'submitLogin', 'expectInventory', 'expectError', 'logout', 'expectLogin',
  'addProduct', 'expectCartBadge', 'openCart', 'expectCartItem', 'removeProduct', 'expectCartEmpty',
  'checkout', 'fillCheckout', 'continueCheckout', 'finishCheckout', 'expectCheckoutComplete'
]);

export const unsupportedBehaviorTerms = [
  'coupon', 'discount code', 'payment card', 'credit card', 'inventory reservation', 'email receipt'
];
