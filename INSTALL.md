# Install PDG

This file is an agent procedure for Claude Code, Codex, or another AI coding agent.

The human is inside the target repository and asked you to install **PDG - Progressive Disclosure Guard**.

Normal installation does not require Node.js or npm.

PDG-LARGE-FILE-JUSTIFICATION: `INSTALL.md` is the single procedural source for install and update flows; splitting it would make the agent follow cross-file instructions during the riskiest step.

## Install Modes

Install exactly one mode:

- `codex-only`: install the Codex skill file.
- `claude-only`: install the Claude Code skill file.
- `dual-agent`: install both skill files.

Use explicit human wording when available:

- "Codex only" or "for Codex" -> `codex-only`
- "Claude only", "Claude Code", or "for Claude" -> `claude-only`
- "both", "Claude and Codex", or "dual" -> `dual-agent`

If the human did not specify the mode, inspect existing repo markers:

- Codex markers only: `AGENTS.md`, `.agents`, or `.agents/skills` -> use `codex-only`.
- Claude markers only: `CLAUDE.md`, `.claude`, or `.claude/skills` -> use `claude-only`.
- both marker families or no markers -> stop and ask one short question:

```text
Should I install PDG for Codex only, Claude only, or both?
```

Do not infer mode from missing Claude or Codex credentials alone.

Default install scope:

- install the selected skill file;
- merge the matching PDG trigger block into `AGENTS.md` and/or `CLAUDE.md`;
- skip trigger files only when the human explicitly asks for a skill-only install.

## Non-Negotiable Contract

- Treat the current working directory as the target repository.
- Do not copy this file into the target repository.
- Do not modify product code.
- Start with audit only.
- Report exact files before writes.
- Ask before writing files.
- Preserve existing `AGENTS.md`, `CLAUDE.md`, skills, workflows, docs, and config.
- If a target skill already exists with different content and is not a generated PDG skill, stop and report the conflict.
- If a target skill is a generated PDG skill with an older `source_hash`, use the update procedure below.
- If `AGENTS.md` or `CLAUDE.md` already contains a PDG block, update it instead of duplicating it.
- If evidence is missing, write `Unknown`, verify, ask the human, or stop.

## Get PDG

If the PDG repository already exists locally, use its absolute path.

If it does not exist locally, clone it into a temporary directory:

```bash
tmp_dir="$(mktemp -d)"
git clone https://github.com/bacoco/progressive-disclosure-guard.git "$tmp_dir/progressive-disclosure-guard"
PDG_DIR="$tmp_dir/progressive-disclosure-guard"
```

If clone fails, stop and ask the human for access or a local path.

For an existing local clone:

```bash
PDG_DIR="/absolute/path/to/progressive-disclosure-guard"
```

## Audit The Target Repository

Run inside the target repository:

```bash
target_dir="$(pwd)"
git rev-parse --is-inside-work-tree
git status --short
test -f AGENTS.md && echo "AGENTS.md=present" || echo "AGENTS.md=missing"
test -f CLAUDE.md && echo "CLAUDE.md=present" || echo "CLAUDE.md=missing"
test -d .agents/skills && find .agents/skills -maxdepth 2 -type f | sort || true
test -d .claude/skills && find .claude/skills -maxdepth 2 -type f | sort || true
```

Then check the source files you would install:

```bash
test -f "$PDG_DIR/pdg.codex.skill.md"
test -f "$PDG_DIR/pdg.claude.skill.md"
test -f "$PDG_DIR/AGENTS.pdg.md"
test -f "$PDG_DIR/CLAUDE.pdg.md"
```

These commands are read-only.

If a target skill file already exists, inspect its generated markers before deciding whether it is a conflict or an update:

```bash
grep -nE "GENERATED FILE - DO NOT EDIT DIRECTLY|source: pdg.skill.md|source_hash:|target: (codex|claude)" \
  "$target_dir/.agents/skills/progressive-disclosure-guard/SKILL.md" \
  "$target_dir/.claude/skills/progressive-disclosure-guard/SKILL.md" \
  "$PDG_DIR/pdg.codex.skill.md" \
  "$PDG_DIR/pdg.claude.skill.md" 2>/dev/null || true

Treat an existing file as a safe update candidate only when it contains all of these markers:

- `GENERATED FILE - DO NOT EDIT DIRECTLY`
- `source: pdg.skill.md`
- `source_hash:`
- the expected `target: codex` or `target: claude`

If the existing file is missing those markers, report it as a local customization conflict and stop before writing.

## Report Before Writes

Report these facts to the human:

- target repository path;
- selected install mode;
- git repository state;
- existing `AGENTS.md`;
- existing `CLAUDE.md`;
- existing `.agents/skills`;
- existing `.claude/skills`;
- exact files PDG wants to create;
- exact existing files PDG will preserve;
- exact existing generated PDG skill files PDG will update;
- old and new `source_hash` values for each generated skill update;
- exact `AGENTS.md` and/or `CLAUDE.md` PDG trigger block changes;
- any conflict that blocks writing;
- exact command or copy operation you want to run next.

Stop after this report.

## Update Existing PDG Install

Use this path when the target already has generated PDG skill files and the source hash differs from the current PDG repository.

An update may replace only generated PDG skill files:

- Codex: `.agents/skills/progressive-disclosure-guard/SKILL.md`
- Claude Code: `.claude/skills/progressive-disclosure-guard/SKILL.md`

Do not edit `AGENTS.md` or `CLAUDE.md` during an update unless the trigger block itself changed or the human explicitly asked for trigger-rule edits.

Before writing, report the old and new hashes:

Before writing, confirm the old and new hashes identified during the audit step.

After human approval, follow the **Apply After Human Approval** section to replace the skill files.

For `codex-only` or `claude-only`, run only the matching copy command.

After copying, verify that each selected installed file is byte-identical to the generated source and that the expected new hash is present.

Codex:

```bash
diff -q "$PDG_DIR/pdg.codex.skill.md" \
  "$target_dir/.agents/skills/progressive-disclosure-guard/SKILL.md"
grep -n "source_hash:" "$target_dir/.agents/skills/progressive-disclosure-guard/SKILL.md"
```

Claude Code:

```bash
diff -q "$PDG_DIR/pdg.claude.skill.md" \
  "$target_dir/.claude/skills/progressive-disclosure-guard/SKILL.md"
grep -n "source_hash:" "$target_dir/.claude/skills/progressive-disclosure-guard/SKILL.md"
```

Report any skipped trigger-rule edits as intentional preservation.

## Apply After Human Approval

Run only the copy operations for the selected mode.

Codex:

```bash
mkdir -p "$target_dir/.agents/skills/progressive-disclosure-guard"
cp "$PDG_DIR/pdg.codex.skill.md" \
  "$target_dir/.agents/skills/progressive-disclosure-guard/SKILL.md"
```

Claude Code:

```bash
mkdir -p "$target_dir/.claude/skills/progressive-disclosure-guard"
cp "$PDG_DIR/pdg.claude.skill.md" \
  "$target_dir/.claude/skills/progressive-disclosure-guard/SKILL.md"
```

For `dual-agent`, run both copy blocks.

## Add Trigger Rules

A skill file alone is not enough in every project. By default, add the matching PDG trigger block after the human approves the write list.

Codex:

```bash
cat "$PDG_DIR/AGENTS.pdg.md"
```

Claude Code:

```bash
cat "$PDG_DIR/CLAUDE.pdg.md"
```

Rules:

- If the selected instruction file exists, merge the block without removing existing rules.
- If it already contains `progressive-disclosure-guard` or a `PDG - Progressive Disclosure Guard` section, update that section instead of duplicating it.
- If the selected instruction file does not exist, create it only after the human approves the write list.
- If the human explicitly requested skill-only install, do not edit `AGENTS.md` or `CLAUDE.md`.

Do not write GitHub workflows, Linear templates, broad governance files, or product docs. PDG installation is only the skill plus the small trigger rule.

## Verify Installation

Run:

```bash
cd "$target_dir"
case "<codex-only|claude-only|dual-agent>" in
  codex-only)
    test -f .agents/skills/progressive-disclosure-guard/SKILL.md
    grep -q "name: progressive-disclosure-guard" .agents/skills/progressive-disclosure-guard/SKILL.md
    test -f AGENTS.md
    grep -q "progressive-disclosure-guard" AGENTS.md
    ;;
  claude-only)
    test -f .claude/skills/progressive-disclosure-guard/SKILL.md
    grep -q "name: progressive-disclosure-guard" .claude/skills/progressive-disclosure-guard/SKILL.md
    test -f CLAUDE.md
    grep -q "progressive-disclosure-guard" CLAUDE.md
    ;;
  dual-agent)
    test -f .agents/skills/progressive-disclosure-guard/SKILL.md
    test -f .claude/skills/progressive-disclosure-guard/SKILL.md
    grep -q "target: codex" .agents/skills/progressive-disclosure-guard/SKILL.md
    grep -q "target: claude" .claude/skills/progressive-disclosure-guard/SKILL.md
    test -f AGENTS.md
    test -f CLAUDE.md
    grep -q "progressive-disclosure-guard" AGENTS.md
    grep -q "progressive-disclosure-guard" CLAUDE.md
    ;;
esac
```

For explicit skill-only installs, skip the `AGENTS.md` and `CLAUDE.md` checks and report that trigger rules were intentionally not installed.

Report the commands run and any blocked verification.
