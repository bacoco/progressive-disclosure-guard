#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const checks = [
  ["npm", ["test"]],
  ["npm", ["pack", "--dry-run"]]
];

if (isGitRepo()) {
  checks.unshift(["git", ["diff", "--check"]]);
}

for (const [command, args] of checks) {
  const label = [command, ...args].join(" ");
  console.log(`\n> ${label}`);
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

console.log("\nPDG health checks passed.");

function isGitRepo() {
  const result = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    encoding: "utf8"
  });
  return result.status === 0 && result.stdout.trim() === "true";
}
