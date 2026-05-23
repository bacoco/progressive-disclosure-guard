#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(await readFile(path.join(evidenceDir, "fixtures.json"), "utf8"));
const criteria = [
  ["trigger", /\bPDG triggered:\s*(yes|no)\b/i],
  ["source", /\b(source files?|source-of-truth)\b/i],
  ["preserve", /\bpreserve\b/i],
  ["must", /\bMUST\b/],
  ["mustNot", /\bMUST NOT\b/],
  ["verification", /`[^`]+`|\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+/]
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
    "# PDG Fixture Evaluation Report",
    "",
    "This file is evidence for repository maintainers. It is not part of the installed skill copy.",
    "",
    "This is a deterministic fixture evaluation, not an empirical LLM benchmark.",
    "",
    "| Task | Without PDG | With PDG | Delta |",
    "| --- | ---: | ---: | ---: |",
    ...results.map((row) => `| ${row.id} | ${row.without.total} | ${row.withPdg.total} | ${row.delta} |`),
    `| **Total** | **${totalWithout}** | **${totalWith}** | **${totalDelta}** |`,
    "",
    "Measured difference: the PDG-conditioned fixture outputs include more trigger, source, preservation, MUST/MUST NOT, and verification markers than the non-PDG fixture outputs.",
    "",
    "What stays unproven: this does not prove real-world agent behavior, user acceptance, false-positive rate, or regression prevention on live repositories. A robust evaluation would need repeated model runs, blinded review, and real task outcomes.",
    ""
  ].join("\n");
}

function sum(results, key) {
  return results.reduce((total, row) => total + row[key].total, 0);
}
