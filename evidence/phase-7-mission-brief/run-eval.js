#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const evidenceDir = path.dirname(fileURLToPath(import.meta.url));
const fixtures = JSON.parse(await readFile(path.join(evidenceDir, "fixtures.json"), "utf8"));
const criteria = [
  ["trigger", /\bPDG triggered:\s*yes\b/i],
  ["missionBrief", /\bMission Brief:/i],
  ["mission", /\bMission:/],
  ["objectiveLock", /\bObjective Lock:/],
  ["constraints", /\bConstraints:/],
  ["successCriteria", /\bSuccess Criteria:/],
  ["gates", /\bProgressive Disclosure Gates:/],
  ["deviation", /DEVIATION: I am doing X instead of Y because Z\./],
  ["verification", /\bVerification Protocol:/],
  ["deliverable", /\bDeliverable:/],
  ["noFakeDone", /\bdo not claim\b.*\b(done|verified|tested|working|installed|updated)\b/i]
];

const rows = fixtures.map((fixture) => {
  const without = score(fixture.withoutPdg);
  const withPdg = score(fixture.withPdg);
  return { id: fixture.id, without, withPdg, delta: withPdg.total - without.total };
});

for (const row of rows) {
  const required = ["trigger", "missionBrief", "mission", "objectiveLock", "constraints", "successCriteria", "gates", "deviation", "verification", "deliverable"];
  if (row.delta <= 0 || required.some((name) => !row.withPdg.matched.includes(name))) {
    throw new Error(`Mission Brief fixture failed required markers: ${row.id}`);
  }
}

const completionClaim = rows.find((row) => row.id === "completion-claim");
if (!completionClaim?.withPdg.matched.includes("noFakeDone")) {
  throw new Error("completion-claim fixture must block fake completion claims");
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
    "# PDG Mission Brief Fixture Report",
    "",
    "This deterministic fixture evaluation protects the Marc Aurelus Mission Brief layer.",
    "",
    "| Task | Without PDG | With PDG | Delta |",
    "| --- | ---: | ---: | ---: |",
    ...results.map((row) => `| ${row.id} | ${row.without.total} | ${row.withPdg.total} | ${row.delta} |`),
    `| **Total** | **${totalWithout}** | **${totalWith}** | **${totalWith - totalWithout}** |`,
    "",
    "What stays unproven: fixtures protect wording; they do not prove live agent behavior.",
    ""
  ].join("\n");
}

function sum(results, key) {
  return results.reduce((total, row) => total + row[key].total, 0);
}
