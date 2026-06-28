#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(await readFile(path.join(evidenceDir, "fixtures.json"), "utf8"));
const criteria = [
  ["trigger", /\bPDG triggered:\s*yes\b/i],
  ["pddAvailable", /\bPDD available:\s*yes\b/i],
  ["pddEngine", /\bUse PDD as the documentation engine\b|\bthrough PDD\b|\bconsume PDD artifacts\b/i],
  ["receipts", /\bRequired PDD receipts:/i],
  ["sourceInventory", /\bsource inventory\b/i],
  ["sourceMap", /\bsource map\b/i],
  ["manifest", /\bmanifest\b/i],
  ["coverage", /\bcoverage\b/i],
  ["grounding", /\bgrounding\b/i],
  ["regression", /\bregression\b/i],
  ["disclosure", /\bdisclosure contract\b|\bdisclosure\.json\b/i],
  ["answerability", /\banswerability state\b|\banswerability gate\b|\banswerable\b/i],
  ["orientation", /\bgenerated docs as orientation\b|\borient(?:ation)? on generated docs\b/i],
  ["staleRemoval", /\bstale-removal receipt\b|\bstale removals\b/i],
  ["humanOverrides", /\bpreserved human overrides\b|\bpreserving human overrides\b/i],
  ["mustNotParallel", /\bMUST NOT\b.*\b(parallel documentation engine|outside PDD|manual editing)\b/i],
  ["verification", /\bVerification:/i],
  ["risk", /\bresidual risk:/i]
];

const rows = fixtures.map((fixture) => {
  const without = score(fixture.withoutPdg);
  const withPdg = score(fixture.withPdg);
  return { id: fixture.id, without, withPdg, delta: withPdg.total - without.total };
});

for (const row of rows) {
  const required = ["trigger", "pddAvailable", "pddEngine", "receipts", "verification", "risk"];
  if (row.delta <= 0 || required.some((name) => !row.withPdg.matched.includes(name)) || !row.withPdg.matched.includes("manifest")) {
    throw new Error(`PDD contract fixture failed required markers: ${row.id}`);
  }
}

const staleFixture = rows.find((row) => row.id === "update-pdd-doc");
if (!staleFixture?.withPdg.matched.includes("staleRemoval")) {
  throw new Error("update-pdd-doc fixture must require a stale-removal receipt");
}

const overrideFixture = rows.find((row) => row.id === "convert-existing-doc");
if (!overrideFixture?.withPdg.matched.includes("humanOverrides")) {
  throw new Error("convert-existing-doc fixture must preserve human overrides");
}

const iarFixture = rows.find((row) => row.id === "iar-over-pdd");
for (const marker of ["disclosure", "answerability", "orientation", "grounding"]) {
  if (!iarFixture?.withPdg.matched.includes(marker)) {
    throw new Error(`iar-over-pdd fixture must require ${marker}`);
  }
}

const report = renderReport(rows);
await writeFile(path.join(evidenceDir, "REPORT.md"), report, "utf8");
console.log(report);

function score(output) {
  const matched = criteria.filter(([, pattern]) => pattern.test(output)).map(([name]) => name);
  return { total: matched.length, matched };
}

function renderReport(results) {
  const totalWithout = sum(results, "without");
  const totalWith = sum(results, "withPdg");
  return [
    "# PDG PDD Contract Fixture Report",
    "",
    "This deterministic fixture evaluation protects the PDD-as-external-engine contract.",
    "",
    "| Task | Without PDG | With PDG | Delta |",
    "| --- | ---: | ---: | ---: |",
    ...results.map((row) => `| ${row.id} | ${row.without.total} | ${row.withPdg.total} | ${row.delta} |`),
    `| **Total** | **${totalWithout}** | **${totalWith}** | **${totalWith - totalWithout}** |`,
    "",
    "What stays unproven: fixtures protect wording; they do not prove a live PDD runtime or chatbot integration.",
    ""
  ].join("\n");
}

function sum(results, key) {
  return results.reduce((total, row) => total + row[key].total, 0);
}
