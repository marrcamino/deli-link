export function calculateTotalDays(from: string, to: string) {
  const startDate = new Date(from);
  const endDate = new Date(to);

  // Calculate difference in milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());

  // Convert to days and add 1 (to include the start day)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};