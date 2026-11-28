// Checked in order: Edge and Opera also say "Chrome", and Chrome also says "Safari".
const BROWSERS = [
  ['Edge', /Edg\//],
  ['Opera', /OPR\//],
  ['Firefox', /Firefox\//],
  ['Chrome', /Chrome\//],
  ['Safari', /Safari\//],
] as const;
const SYSTEMS = [
  ['iOS', /iPhone|iPad/],
  ['Android', /Android/],
  ['Windows', /Windows/],
  ['macOS', /Mac OS X/],
  ['Linux', /Linux/],
] as const;

export type DeviceSummary = { browser: string | null; system: string | null; isMobile: boolean };

// describeUserAgent names the browser and operating system of a session for the sessions list.
export function describeUserAgent(userAgent: string | null): DeviceSummary {
  const agent = userAgent ?? '';
  const browser = BROWSERS.find(([, pattern]) => pattern.test(agent))?.[0] ?? null;
  const system = SYSTEMS.find(([, pattern]) => pattern.test(agent))?.[0] ?? null;
  return { browser, system, isMobile: /Mobile|iPhone|Android/.test(agent) };
}
