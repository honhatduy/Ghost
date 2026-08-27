import { formatNumber, getCurrencySymbol, getStripeAmount } from './helpers';

export function formatGiftValue(price) {
  const { amount, currency } = price ?? {};
  if (amount === null || amount === undefined || !currency) {
    return '';
  }
  return `${getCurrencySymbol(currency)}${formatNumber(getStripeAmount(amount))}`;
}
