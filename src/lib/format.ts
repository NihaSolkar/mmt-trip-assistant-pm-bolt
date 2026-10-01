export function formatINR(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
}
