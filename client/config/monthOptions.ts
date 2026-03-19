export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_OPTIONS = MONTH_NAMES.map((label, index) => ({
  label,
  value: String(index + 1),
}));
