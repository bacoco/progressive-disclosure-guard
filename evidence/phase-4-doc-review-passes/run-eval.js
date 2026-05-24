#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(await readFile(path.join(evidenceDir, "fixtures.json"), "utf8"));
const criteria = [
  ["trigger", /\bPDG triggered:\s*yes\b/i],
  ["coverage", /\bCoverage pass:/],
  ["grounding", /\bGrounding pass:/],
  ["regression", /\bRegression pass/],
  ["source", /\b(source evidence|manifest|README|\.env|diff)\b/i],
  ["verification", /`[^`]+`|\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+/],
  ["risk", /\bresidual risk:/i]
];

const rows = fixtures.map((fixture) => {
  const without = score(fixture.withoutPdg);
  const withPdg = score(fixture.withPdg);
  return { id: fixture.id, without, withPdg, delta: withPdg.total - without.total };
});

if (rows.some((row) => row.delta <= 0 || !row.withPdg.matched.includes("coverage") || !row.withPdg.matched.includes("grounding") || !row.withPdg.matched.includes("regression"))) {
  throw new Error("doc-review fixtures must include coverage, grounding, and regression pass markers");
}

const report = renderReport(rows);
await writeFile(path.join(evidenceDir, "REPORT.md"), report, "utf8");
console.log(report);

function score(output) {
  const matched = criteria
    .filter(([, pattern]) => pattern.test(output))
    .map(([name]) => name);
  return { total: matched.length, matched };
}

function renderReport(results) {
  const totalWithout = sum(results, "without");
  const totalWith = sum(results, "withPdg");
  return [
    "# PDG Doc Review Pass Fixture Report",
    "",
    "This deterministic fixture evaluation checks that generated-documentation work names coverage, grounding, and regression review passes.",
    "",
    "| Task | Without PDG | With PDG | Delta |",
    "| --- | ---: | ---: | ---: |",
    ...results.map((row) => `| ${row.id} | ${row.without.total} | ${row.withPdg.total} | ${row.delta} |`),
    `| **Total** | **${totalWithout}** | **${totalWith}** | **${totalWith - totalWithout}** |`,
    "",
    "What stays unproven: these fixtures do not prove live LLM behavior; they protect the documented review-pass contract from disappearing.",
    ""
  ].join("\n");
}

function sum(results, key) {
  return results.reduce((total, row) => total + row[key].total, 0);
}
