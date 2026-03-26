import type { LeaveApplicationWithDate } from "$lib/types";

export function calculateTotalDays(from: string, to: string) {
  const startDate = new Date(from);
  const endDate = new Date(to);

  // Calculate difference in milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());

  // Convert to days and add 1 (to include the start day)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export function countTotalLeaveDays(leaves: LeaveApplicationWithDate[] | LeaveDate[]) {
  if (!leaves.length) return 0 // If empty
  
  if ('dates' in leaves[0]) {
    let counts = 0
    return (leaves as LeaveApplicationWithDate[]).map(l => counts += l.dates.length).length
  }

  return leaves.length
};
