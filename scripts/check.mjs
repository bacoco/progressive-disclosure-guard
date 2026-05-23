#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const forbidden = [
  ["implementer", "guard"].join("-"),
  ["Implementer", "Guard"].join(" "),
  ["Implementer", "Pass"].join(" ")
];

execFileSync(process.execPath, ["scripts/generate-skills.mjs"], {
  cwd: repoRoot,
  stdio: "inherit"
});

await assertSkill("skills/progressive-disclosure-guard/SKILL.md");
await assertSkill("generated/codex/progressive-disclosure-guard/SKILL.md");
await assertSkill("generated/claude/progressive-disclosure-guard/SKILL.md");
await assertNoForbiddenWords(repoRoot);

console.log("PDG checks passed.");

async function assertSkill(relativePath) {
  const content = await readFile(path.join(repoRoot, relativePath), "utf8");
  if (!content.startsWith("---\n")) {
    throw new Error(`${relativePath} must start with YAML frontmatter.`);
  }
  if (!content.includes("\nname: progressive-disclosure-guard\n")) {
    throw new Error(`${relativePath} must use the progressive-disclosure-guard skill name.`);
  }
  if (!content.includes("PDG - Progressive Disclosure Guard")) {
    throw new Error(`${relativePath} must include the public PDG title.`);
  }
  if (!content.includes("## Output")) {
    throw new Error(`${relativePath} must include the output contract.`);
  }
}

async function assertNoForbiddenWords(directory) {
  for (const file of await walk(directory)) {
    if (file.includes(`${path.sep}.git${path.sep}`) || file.includes(`${path.sep}node_modules${path.sep}`)) {
      continue;
    }

    const content = await readFile(file, "utf8");
    for (const phrase of forbidden) {
      if (content.includes(phrase)) {
        throw new Error(`${path.relative(repoRoot, file)} contains forbidden legacy phrase: ${phrase}`);
      }
    }
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.name === ".git" || entry.name === "node_modules") {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...await walk(absolute));
      continue;
    }

    if (entry.isFile() && await isTextFile(absolute)) {
      files.push(absolute);
    }
  }

  return files;
}

async function isTextFile(file) {
  const info = await stat(file);
  return info.size < 200_000;
}
