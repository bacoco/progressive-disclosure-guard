#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(await readFile(path.join(evidenceDir, "fixtures.json"), "utf8"));
const criteria = [
  ["trigger", /\bPDG triggered:\s*yes\b/i],
  ["evidence", /\b(evidence manifest|source-of-truth|source files?)\b/i],
  ["mustNot", /\bMUST NOT\b/],
  ["preserve", /\bpreserve\b/i],
  ["receipt", /\b(archive|diff|receipt)\b/i],
  ["verification", /`[^`]+`|\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+/],
  ["binaryJustification", /PDG-BINARY-ASSET-JUSTIFICATION/],
  ["judgeBounded", /\bLLM judge:\s*(not run|optional|labelled)\b/i]
];

const rows = fixtures.map((fixture) => {
  const without = score(fixture.withoutPdg);
  const withPdg = score(fixture.withPdg);
  return {
    id: fixture.id,
    without,
    withPdg,
    delta: withPdg.total - without.total
  };
});

if (rows.some((row) => row.delta <= 0)) {
  throw new Error("doc-generation fixtures must improve with PDG wording");
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
  const totalDelta = totalWith - totalWithout;
  return [
    "# PDG Doc Generation Fixture Evaluation Report",
    "",
    "This deterministic fixture evaluation checks whether PDG-conditioned outputs add evidence, preservation, artifact receipt, and verification markers for generated documentation.",
    "",
    "| Task | Without PDG | With PDG | Delta |",
    "| --- | ---: | ---: | ---: |",
    ...results.map((row) => `| ${row.id} | ${row.without.total} | ${row.withPdg.total} | ${row.delta} |`),
    `| **Total** | **${totalWithout}** | **${totalWith}** | **${totalDelta}** |`,
    "",
    "What stays unproven: this is not a live LLM benchmark. It only protects the repository wording and examples from losing the doc-generation guardrails.",
    ""
  ].join("\n");
}

function sum(results, key) {
  return results.reduce((total, row) => total + row[key].total, 0);
}
