import fs from "node:fs";
const m = fs.readFileSync("src/lib/analytics/events.ts", "utf8");
const a = m.match(/export const ANALYTICS_EVENTS = \[([\s\S]*?)\] as const/);
const names = [...a[1].matchAll(/"([a-z0-9_]+)"/g)].map((x) => x[1]);
console.log("count", names.length);
console.log([...new Set(names)].length, "unique");
