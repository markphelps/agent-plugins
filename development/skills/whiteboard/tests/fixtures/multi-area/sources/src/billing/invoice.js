export function invoiceTotalCents(lineItems) {
  return lineItems.reduce((total, item) => total + item.amountCents, 0)
}
