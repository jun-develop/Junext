// Date inputs give a calendar day (YYYY-MM-DD) in the viewer's time zone, while APIs filter by
// instant. These helpers convert between the two in the browser, where the time zone is known.

// localDayStart returns the instant a calendar day starts in the local time zone.
export function localDayStart(day: string): string {
  return new Date(`${day}T00:00:00`).toISOString();
}

// localDayEnd returns the last instant of a calendar day in the local time zone, to microseconds,
// because Jungo compares the upper bound at the precision it receives.
export function localDayEnd(day: string): string {
  return new Date(`${day}T23:59:59.999`).toISOString().replace(/\.999Z$/, '.999999Z');
}

// localDay returns the calendar day (YYYY-MM-DD) of an instant in the local time zone.
export function localDay(instant: string): string {
  const date = new Date(instant);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
