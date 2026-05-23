#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = "kit/skills-src/shared/progressive-disclosure-guard.skill.md";
const writeMode = process.argv.includes("--write");

const targets = {
  codex: [
    "## Codex Mechanics",
    "",
    "- Use `rg` for repository inventory.",
    "- Use `apply_patch` for manual file edits.",
    "- Use Codex subagents only when file ownership is disjoint.",
    "- Do not run parallel agents on the same files.",
    "- Do not mark a risky Codex implementation as reviewed by the same Codex context."
  ].join("\n"),
  claude: [
    "## Claude Mechanics",
    "",
    "- Use Claude planning tools for task tracking.",
    "- Use Claude subagents only when file ownership is disjoint.",
    "- Do not run parallel agents on the same files.",
    "- Do not mark a risky Claude implementation as reviewed by the same Claude context."
  ].join("\n")
};

const source = await readFile(path.join(repoRoot, sourcePath), "utf8");
const parsed = parseSkill(source);
const outputs = Object.entries(targets).map(([target, mechanics]) => {
  const output = `kit/generated-skills/${target}-progressive-disclosure-guard.md`;
  return {
    target,
    output,
    content: renderGeneratedSkill({
      name: parsed.name,
      description: parsed.description,
      body: parsed.body,
      sourceHash: sha256(source),
      target,
      mechanics
    })
  };
});

let hasDrift = false;

for (const output of outputs) {
  const absoluteOutput = path.join(repoRoot, output.output);
  if (writeMode) {
    await mkdir(path.dirname(absoluteOutput), { recursive: true });
    await writeFile(absoluteOutput, output.content, "utf8");
    console.log(`wrote ${output.output}`);
    continue;
  }

  let current = null;
  try {
    current = await readFile(absoluteOutput, "utf8");
  } catch {
    // Missing output is reported as drift below.
  }

  if (current !== output.content) {
    hasDrift = true;
    console.error(`drift: ${output.output}`);
  } else {
    console.log(`current ${output.output}`);
  }
}

if (hasDrift) {
  console.error("Generated skills are not current. Run `npm run generate`.");
  process.exitCode = 1;
}

function parseSkill(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`${sourcePath} must start with YAML frontmatter.`);
  }

  const frontmatter = match[1];
  const body = match[2].trim();
  const name = readScalar(frontmatter, "name");
  const description = readScalar(frontmatter, "description");
  return { name, description, body };
}

function readScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
  if (!match) {
    throw new Error(`${sourcePath} is missing required frontmatter key: ${key}`);
  }

  return match[1].trim();
}

function renderGeneratedSkill({ name, description, body, sourceHash, target, mechanics }) {
  return [
    "---",
    `name: ${name}`,
    `description: ${description}`,
    "---",
    "",
    "<!--",
    "GENERATED FILE - DO NOT EDIT DIRECTLY",
    `source: ${sourcePath}`,
    `source_hash: ${sourceHash}`,
    "generated_by: fuckia generate-skills",
    `target: ${target}`,
    "-->",
    "",
    injectMechanics(body, mechanics),
    ""
  ].join("\n");
}

function injectMechanics(body, mechanics) {
  const lines = body.split(/\r?\n/);
  const title = lines[0]?.startsWith("# ") ? lines[0] : null;
  const rest = title ? lines.slice(1).join("\n").trimStart() : body;
  return title ? `${title}\n\n${mechanics}\n\n${rest}` : `${mechanics}\n\n${rest}`;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}
