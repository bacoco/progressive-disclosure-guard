#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(await readFile(path.join(evidenceDir, "fixtures.json"), "utf8"));
const criteria = [
  ["trigger", /\bPDG triggered:\s*yes\b/i],
  ["inventory", /\bSource inventory:/],
  ["coverage", /\bCoverage pass:/],
  ["grounding", /\bGrounding pass:/],
  ["regression", /\bRegression pass:/],
  ["findingProof", /\b(fixture|checklist|test)\b/i],
  ["staleRemoval", /\b(stale question|removed)\b/i],
  ["risk", /\bresidual risk:/i]
];

const rows = fixtures.map((fixture) => {
  const without = score(fixture.withoutPdg);
  const withPdg = score(fixture.withPdg);
  return { id: fixture.id, without, withPdg, delta: withPdg.total - without.total };
});

for (const row of rows) {
  const required = ["trigger", "inventory", "coverage", "grounding", "regression", "risk"];
  if (row.delta <= 0 || required.some((name) => !row.withPdg.matched.includes(name))) {
    throw new Error(`Bercy doc-audit fixture failed required markers: ${row.id}`);
  }
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
    "# PDG Bercy Doc Audit Fixture Report",
    "",
    "This deterministic fixture evaluation protects the Bercy-derived source inventory, stale-removal, and review-finding-to-proof contracts.",
    "",
    "| Task | Without PDG | With PDG | Delta |",
    "| --- | ---: | ---: | ---: |",
    ...results.map((row) => `| ${row.id} | ${row.without.total} | ${row.withPdg.total} | ${row.delta} |`),
    `| **Total** | **${totalWithout}** | **${totalWith}** | **${totalWith - totalWithout}** |`,
    "",
    "What stays unproven: fixtures protect the written contract; they do not prove live LLM behavior or human source-relevance judgment.",
    ""
  ].join("\n");
}

function sum(results, key) {
  return results.reduce((total, row) => total + row[key].total, 0);
}
