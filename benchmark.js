import { readFile, writeFile } from "node:fs/promises";

const baseUrl = process.env.MAM_API_URL || "http://127.0.0.1:3000";
const cases = JSON.parse(await readFile(new URL("./benchmark-cases.json", import.meta.url), "utf8"));
const results = [];

for (const testCase of cases) {
  const started = performance.now();
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: "9-11", messages: [{ role: "user", content: testCase.question }] })
    });
    const data = await response.json();
    results.push({ ...testCase, ok: response.ok && typeof data.message === "string", status: response.status, latencyMs: Math.round(performance.now() - started), classification: data.classification || null, error: data.error || null });
  } catch (error) {
    results.push({ ...testCase, ok: false, status: 0, latencyMs: Math.round(performance.now() - started), error: error.message });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  api: baseUrl,
  total: results.length,
  succeeded: results.filter((item) => item.ok).length,
  failed: results.filter((item) => !item.ok).length,
  averageLatencyMs: results.length ? Math.round(results.reduce((sum, item) => sum + item.latencyMs, 0) / results.length) : 0,
  results
};
await writeFile("benchmark-results.json", JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ total: summary.total, succeeded: summary.succeeded, failed: summary.failed, averageLatencyMs: summary.averageLatencyMs }, null, 2));
