function getDateDifferenceInMonths(initialDate: Date, finalDate: Date): number {
  return Math.max(
    (finalDate.getFullYear() - initialDate.getFullYear()) * 12 +
      finalDate.getMonth() -
      initialDate.getMonth(),
    0
  );
}

export function getDateDifferenceInYears(initialDate: Date, finalDate: Date): number {
  return getDateDifferenceInMonths(initialDate, finalDate) / 12;
}
