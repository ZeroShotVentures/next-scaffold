const browsers: [RegExp, string][] = [
  [/Edg\//, "Edge"],
  [/OPR\/|Opera/, "Opera"],
  [/Firefox\//, "Firefox"],
  [/Chrome\/|CriOS\//, "Chrome"],
  [/Safari\//, "Safari"],
];

const systems: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, "iOS"],
  [/Android/, "Android"],
  [/Mac OS X|Macintosh/, "macOS"],
  [/Windows/, "Windows"],
  [/CrOS/, "ChromeOS"],
  [/Linux/, "Linux"],
];

const match = (ua: string, patterns: [RegExp, string][]) =>
  patterns.find(([pattern]) => pattern.test(ua))?.[1];

export function describeUserAgent(ua: string | null | undefined): string {
  if (!ua) return "Unknown device";
  const browser = match(ua, browsers);
  const system = match(ua, systems);
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? "Unknown device";
}
