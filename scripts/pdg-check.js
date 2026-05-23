#!/usr/bin/env node
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const MAX_LINES = 200;
const largeJustification = "PDG-LARGE-FILE-JUSTIFICATION:";
const broadJustification = "PDG-BROAD-FILE-JUSTIFICATION:";
const broadNames = new Set(["service", "utils", "manager", "handler"]);
const args = process.argv.slice(2);
const findings = [];

if (args[0] === "--diff") {
  const diffPath = args[1];
  if (!diffPath) {
    fail(["--diff requires a file path."]);
  }
  await checkDiff(await readFile(diffPath, "utf8"));
} else if (args.length > 0) {
  for (const target of args) {
    await checkPath(path.resolve(target));
  }
} else {
  console.log("PDG static check skipped: pass a path or --diff <file>.");
}

if (findings.length > 0) {
  fail(findings);
}

console.log("PDG static check passed.");

async function checkPath(target) {
  const info = await stat(target);
  if (info.isDirectory()) {
    for (const entry of await readdir(target, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      await checkPath(path.join(target, entry.name));
    }
    return;
  }
  if (!info.isFile() || info.size > 200_000 || isBinaryLike(target)) {
    return;
  }
  await checkFile(target, await readFile(target, "utf8"));
}

async function checkFile(file, content) {
  const rel = path.relative(process.cwd(), file) || file;
  const lines = content.split(/\r?\n/);
  if (lines.length > MAX_LINES && !content.includes(largeJustification)) {
    findings.push(`${rel}: ${lines.length} lines exceeds ${MAX_LINES}; add ${largeJustification}`);
  }
  if (hasBroadDumpName(file) && !content.includes(broadJustification)) {
    findings.push(`${rel}: broad service/utils/manager/handler file needs ${broadJustification}`);
  }
  for (const [index, line] of lines.entries()) {
    if (isDoneClaim(line) && !hasVerificationReference(line)) {
      findings.push(`${rel}:${index + 1}: verified/done claim lacks command or route reference.`);
    }
  }
}

async function checkDiff(diff) {
  const newFiles = new Map();
  let current = null;
  let isNewFile = false;
  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      current = null;
      isNewFile = false;
    } else if (line.startsWith("+++ b/")) {
      current = line.slice("+++ b/".length);
      if (!newFiles.has(current)) {
        newFiles.set(current, []);
      }
    } else if (line === "--- /dev/null") {
      isNewFile = true;
    } else if (current && line.startsWith("+") && !line.startsWith("+++")) {
      const added = line.slice(1);
      if (isNewFile) {
        newFiles.get(current).push(added);
      }
      if (hasBroadDumpName(current) && !added.includes(broadJustification)) {
        findings.push(`${current}: added broad service/utils/manager/handler file needs ${broadJustification}`);
      }
      if (isDoneClaim(added) && !hasVerificationReference(added)) {
        findings.push(`${current}: added verified/done claim lacks command or route reference.`);
      }
    }
  }
  for (const [file, lines] of newFiles) {
    const content = lines.join("\n");
    if (lines.length > MAX_LINES && !content.includes(largeJustification)) {
      findings.push(`${file}: new file has ${lines.length} added lines; add ${largeJustification}`);
    }
  }
}

function hasBroadDumpName(file) {
  const name = path.basename(file, path.extname(file)).toLowerCase();
  return name.split(/[-_.]/).some((part) => broadNames.has(part));
}

function isDoneClaim(line) {
  return /\b(verified|done)\b/i.test(line);
}

function hasVerificationReference(line) {
  return /`[^`]+`|https?:\/\/|\b(npm|node|pytest|curl|pnpm|yarn|go test|cargo test)\b|\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+/.test(line);
}

function isBinaryLike(file) {
  return /\.(png|jpg|jpeg|gif|webp|pdf|zip|gz|tar|ico)$/i.test(file);
}

function fail(messages) {
  console.error("PDG static check failed:");
  for (const message of messages) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}
