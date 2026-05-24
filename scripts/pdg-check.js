#!/usr/bin/env node
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const MAX_LINES = 200;
const largeJustification = "PDG-LARGE-FILE-JUSTIFICATION:";
const broadJustification = "PDG-BROAD-FILE-JUSTIFICATION:";
const binaryAssetJustification = "PDG-BINARY-ASSET-JUSTIFICATION:";
const broadNames = new Set(["service", "utils", "manager", "handler"]);
const duplicateAssetExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
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
    const entries = await readdir(target, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === ".git" || entry.name === "node_modules") {
        continue;
      }
      await checkPath(path.join(target, entry.name));
    }
    await checkDuplicateAssetSiblings(target, entries);
    return;
  }
  if (!info.isFile() || info.size > 200_000 || isBinaryLike(target)) return;
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
  const touched = [];
  const justified = new Set();
  let current = null;
  let isNewFile = false;
  for (const line of diff.split(/\r?\n/)) {
    if (line.startsWith("diff --git ")) {
      current = null;
      isNewFile = false;
    } else if (line.startsWith("+++ b/")) {
      current = line.slice("+++ b/".length);
      touched.push(current);
      if (!newFiles.has(current)) {
        newFiles.set(current, []);
      }
    } else if (line === "--- /dev/null") {
      isNewFile = true;
    } else if (current && line.startsWith("+") && !line.startsWith("+++")) {
      const added = line.slice(1);
      if (added.includes(binaryAssetJustification)) justified.add(path.dirname(current));
      if (isNewFile) newFiles.get(current).push(added);
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
  checkDuplicateAssetNames(touched, (dir) => justified.has(dir));
}

async function checkDuplicateAssetSiblings(directory, entries) {
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const duplicates = duplicateAssetGroups(files);
  if (duplicates.length === 0 || await directoryHasBinaryJustification(directory)) {
    return;
  }
  const rel = path.relative(process.cwd(), directory) || directory;
  for (const stem of duplicates) {
    findings.push(`${rel}: duplicated binary asset formats for ${stem}; add ${binaryAssetJustification}`);
  }
}

function checkDuplicateAssetNames(files, hasJustification) {
  const byDir = new Map();
  for (const file of files) {
    const dir = path.dirname(file);
    byDir.set(dir, [...(byDir.get(dir) || []), path.basename(file)]);
  }
  for (const [dir, names] of byDir) {
    if (hasJustification(dir)) continue;
    for (const stem of duplicateAssetGroups(names)) {
      findings.push(`${dir}: duplicated binary asset formats for ${stem}; add ${binaryAssetJustification}`);
    }
  }
}

function duplicateAssetGroups(files) {
  const groups = new Map();
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!duplicateAssetExtensions.has(ext)) {
      continue;
    }
    const stem = path.basename(file, ext);
    if (!groups.has(stem)) {
      groups.set(stem, new Set());
    }
    groups.get(stem).add(ext);
  }
  return [...groups.entries()]
    .filter(([, exts]) => exts.has(".webp") && [...exts].some((ext) => ext !== ".webp"))
    .map(([stem]) => stem);
}

async function directoryHasBinaryJustification(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !isSmallTextLike(entry.name)) {
      continue;
    }
    try {
      const content = await readFile(path.join(directory, entry.name), "utf8");
      if (content.includes(binaryAssetJustification)) {
        return true;
      }
    } catch {
      // Ignore unreadable files; the duplicate finding still points at the directory.
    }
  }
  return false;
}

function hasBroadDumpName(file) {
  const name = path.basename(file, path.extname(file)).toLowerCase();
  return name.split(/[-_.]/).some((part) => broadNames.has(part));
}

function isDoneClaim(line) {
  if (/\balready done\b/i.test(line) || /"verified".*without showing/i.test(line)) {
    return false;
  }
  return /(?<![-\w])(verified|done)(?![-\w])/i.test(line);
}

function hasVerificationReference(line) {
  return /`[^`]+`|https?:\/\/|\b(npm|node|pytest|curl|pnpm|yarn|go test|cargo test)\b|\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+/.test(line);
}

function isBinaryLike(file) {
  return /\.(png|jpg|jpeg|gif|webp|pdf|zip|gz|tar|ico)$/i.test(file);
}

function isSmallTextLike(file) {
  return /\.(md|txt|json|ya?ml|html?|csv)$/i.test(file);
}

function fail(messages) {
  console.error("PDG static check failed:");
  for (const message of messages) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}
