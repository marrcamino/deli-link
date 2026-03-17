
export function calculateTotalDays(from: string, to: string) {
  const startDate = new Date(from);
  const endDate = new Date(to);

  // Calculate difference in milliseconds
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());

  // Convert to days and add 1 (to include the start day)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export function countTotalLeaveDays(applications: LeaveApplication[]) {
  return applications.reduce((total, leave) => {
    // Append '+08:00' to force Philippines offset if the string is just 'YYYY-MM-DD'
    const start = new Date(`${leave.inclusive_from}T00:00:00+08:00`);
    const end = new Date(`${leave.inclusive_to}T00:00:00+08:00`);

    const diffInMs = end.getTime() - start.getTime();

    // Convert ms to days and add 1 for inclusivity
    const days = Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;

    return total + (days > 0 ? days : 0);
  }, 0);
};
