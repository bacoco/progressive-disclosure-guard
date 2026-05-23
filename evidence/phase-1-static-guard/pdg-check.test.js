#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const checker = path.join(repoRoot, "scripts", "pdg-check.js");
const root = await mkdtemp(path.join(tmpdir(), "pdg-check-test-"));

try {
  const clean = path.join(root, "clean");
  const bad = path.join(root, "bad");
  await mkdir(clean, { recursive: true });
  await mkdir(bad, { recursive: true });

  await writeFile(path.join(clean, "auth-flow.md"), [
    "# Auth Flow",
    "",
    "Verified with `npm test -- auth`.",
    "Route checked: `/login`."
  ].join("\n"), "utf8");

  await writeFile(path.join(bad, "user-service.md"), [
    "# User Service",
    "",
    "Done and verified.",
    ...Array.from({ length: 205 }, (_, index) => `line ${index + 1}`)
  ].join("\n"), "utf8");

  const cleanRun = run(clean);
  assertStatus(cleanRun, 0, "clean fixture should pass");
  assertIncludes(cleanRun.stdout, "PDG static check passed", "clean fixture pass output");

  const badRun = run(bad);
  assertNonZero(badRun.status, "bad fixture should fail");
  assertIncludes(badRun.stderr, "exceeds 200", "bad fixture large-file output");
  assertIncludes(badRun.stderr, "service/utils/manager/handler", "bad fixture broad-name output");
  assertIncludes(badRun.stderr, "verified/done claim", "bad fixture verification output");

  console.log("PDG static check tests passed.");
} finally {
  await rm(root, { recursive: true, force: true });
}

function run(target) {
  return spawnSync(process.execPath, [checker, target], {
    cwd: repoRoot,
    encoding: "utf8"
  });
}

function assertStatus(result, expected, message) {
  if (result.status !== expected) {
    throw new Error(`${message}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  }
}

function assertNonZero(status, message) {
  if (status === 0) {
    throw new Error(message);
  }
}

function assertIncludes(value, expected, message) {
  if (!value.includes(expected)) {
    throw new Error(`${message}: missing ${expected}\n${value}`);
  }
}
