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
const requiredSections = [
  "## Invariants",
  "## Mission Frame",
  "## Skill Invocation Pass",
  "## Overlap Inspection Pass",
  "## Documentation Generation Mode",
  "## Documentation Review Passes",
  "## Fallbacks",
  "## Examples",
  "## Final Checklist"
];
const requiredPhrases = [
  "source inventory",
  "before any review, score, approval, implementation decision",
  "from prose alone when code",
  "Skill Invocation Pass",
  "check twice",
  "material unread files",
  "Unknown",
  "source-grounded claim matrix",
  "overlap findings",
  "stale questions",
  "Every actionable review finding",
  "Preserve explicit user instructions",
  "no silent reinterpretation of the user request"
];

execFileSync(process.execPath, ["scripts/generate-skills.mjs"], {
  cwd: repoRoot,
  stdio: "inherit"
});

await assertSkill("pdg.skill.md", { generated: false });
await assertSkill("pdg.codex.skill.md", { generated: true, target: "codex" });
await assertSkill("pdg.claude.skill.md", { generated: true, target: "claude", claudeFrontmatter: true });
await assertReleaseMetadata();
await assertTriggerTemplates();
await assertInstallMergeContract();
await assertReadmeOperatingPrinciple();
await assertNoForbiddenWords(repoRoot);

console.log("PDG checks passed.");

async function assertSkill(relativePath, options) {
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
  for (const section of requiredSections) {
    if (!content.includes(section)) {
      throw new Error(`${relativePath} must include ${section}.`);
    }
  }
  for (const phrase of requiredPhrases) {
    if (!content.includes(phrase)) {
      throw new Error(`${relativePath} must include Bercy doc-audit phrase: ${phrase}`);
    }
  }
  if (options.generated) {
    for (const marker of [
      "GENERATED FILE - DO NOT EDIT DIRECTLY",
      "source: pdg.skill.md",
      "source_hash:",
      `target: ${options.target}`
    ]) {
      if (!content.includes(marker)) {
        throw new Error(`${relativePath} generated marker is missing: ${marker}`);
      }
    }
  }
  if (options.claudeFrontmatter) {
    if (!/^allowed-tools:\n(?:  - .+\n)+/m.test(content)) {
      throw new Error(`${relativePath} must include Claude allowed-tools frontmatter.`);
    }
    if (!/^context:\n(?:  - .+\n)+/m.test(content)) {
      throw new Error(`${relativePath} must include Claude context frontmatter.`);
    }
  }
  if (options.target === "codex" && (content.includes("\nallowed-tools:\n") || content.includes("\ncontext:\n"))) {
    throw new Error(`${relativePath} must not include Claude-specific frontmatter.`);
  }
}

async function assertReleaseMetadata() {
  for (const requiredFile of ["LICENSE", "CHANGELOG.md", ".github/workflows/ci.yml"]) {
    await readFile(path.join(repoRoot, requiredFile), "utf8");
  }
  const pkg = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
  for (const key of ["license", "repository", "bugs", "homepage"]) {
    if (!pkg[key]) {
      throw new Error(`package.json is missing ${key}.`);
    }
  }
  for (const entry of ["evidence/", "scripts/health.mjs", "scripts/install-audit.mjs"]) {
    if (!pkg.files.includes(entry)) {
      throw new Error(`package.json files must include ${entry}.`);
    }
  }
}

async function assertTriggerTemplates() {
  for (const relativePath of ["AGENTS.pdg.md", "CLAUDE.pdg.md"]) {
    const content = await readFile(path.join(repoRoot, relativePath), "utf8");
    for (const phrase of [
      "Treat the user request as a destination under constraints",
      "Preserve explicit user instructions",
      "name the conflict before deviating"
    ]) {
      if (!content.includes(phrase)) {
        throw new Error(`${relativePath} must include request-preservation phrase: ${phrase}`);
      }
    }
  }
}

async function assertInstallMergeContract() {
  const content = await readFile(path.join(repoRoot, "INSTALL.md"), "utf8");
  for (const phrase of [
    "Trigger-rule edits are merge/update-only",
    "never replace an existing `AGENTS.md` or `CLAUDE.md` wholesale",
    "preserve all non-PDG content",
    "edit only the PDG section or append the PDG block"
  ]) {
    if (!content.includes(phrase)) {
      throw new Error(`INSTALL.md must preserve merge/update trigger behavior: ${phrase}`);
    }
  }
}

async function assertReadmeOperatingPrinciple() {
  const content = await readFile(path.join(repoRoot, "README.md"), "utf8");
  for (const phrase of [
    "Treat my requests as objectives under constraints",
    "Respect my explicit request first",
    "distinguish what is known, unknown, and assumed",
    "Be free in method, but faithful to the objective"
  ]) {
    if (!content.includes(phrase)) {
      throw new Error(`README.md must include objective-under-constraints principle: ${phrase}`);
    }
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
