#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.join(repoRoot, "evidence", "phase-3-install-audit");
const fixtures = JSON.parse(await readFile(path.join(evidenceDir, "fixtures.json"), "utf8"));
const rows = fixtures.map(runFixture);

const failures = rows.filter((row) => !row.pass);
const report = renderReport(rows);
await writeFile(path.join(evidenceDir, "REPORT.md"), report, "utf8");
console.log(report);

if (failures.length > 0) {
  process.exit(1);
}

function runFixture(fixture) {
  const actual = resolveInstall(fixture.input);
  const pass = JSON.stringify(actual) === JSON.stringify(fixture.expected);
  return { id: fixture.id, pass, actual, expected: fixture.expected };
}

function resolveInstall(input) {
  if (input.existingSkillConflict) {
    return { action: "stop", reason: "skill-conflict" };
  }
  const mode = explicitMode(input.prompt || "") || markerMode(input.markers || {});
  if (mode === "ask") {
    return { action: "ask", question: "Codex only, Claude only, or both?" };
  }
  const writes = [];
  if (mode === "codex-only" || mode === "dual-agent") {
    writes.push(".agents/skills/progressive-disclosure-guard/SKILL.md");
    if (!input.skillOnly) writes.push("AGENTS.md");
  }
  if (mode === "claude-only" || mode === "dual-agent") {
    writes.push(".claude/skills/progressive-disclosure-guard/SKILL.md");
    if (!input.skillOnly) writes.push("CLAUDE.md");
  }
  return { action: "install", mode, writes };
}

function explicitMode(prompt) {
  const text = prompt.toLowerCase();
  if (/\b(both|dual|claude and codex|codex and claude)\b/.test(text)) return "dual-agent";
  if (/\b(codex only|for codex)\b/.test(text)) return "codex-only";
  if (/\b(claude only|claude code|for claude)\b/.test(text)) return "claude-only";
  return null;
}

function markerMode(markers) {
  const hasCodex = Boolean(markers.agentsMd || markers.agentsSkills);
  const hasClaude = Boolean(markers.claudeMd || markers.claudeSkills);
  if (hasCodex && !hasClaude) return "codex-only";
  if (hasClaude && !hasCodex) return "claude-only";
  return "ask";
}

function renderReport(results) {
  return [
    "# PDG Install Audit Fixture Report",
    "",
    "This deterministic check mirrors the install-mode routing rules in INSTALL.md.",
    "",
    "| Fixture | Result |",
    "| --- | --- |",
    ...results.map((row) => `| ${row.id} | ${row.pass ? "PASS" : "FAIL"} |`),
    "",
    `**${results.filter((row) => row.pass).length}/${results.length} fixtures passed.**`,
    ""
  ].join("\n");
}
