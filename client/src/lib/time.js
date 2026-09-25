const relativeTime = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});
const units = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

export const timeAgo = (date) => {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  const [unit, size] =
    units.find(([, size]) => Math.abs(seconds) >= size) ?? [];
  return unit
    ? relativeTime.format(Math.round(seconds / size), unit)
    : "just now";
};
