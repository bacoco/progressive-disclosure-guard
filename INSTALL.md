# Install PDG

This file is an agent procedure for Claude Code, Codex, or another AI coding agent.

The human is inside the target repository and asked you to install **PDG - Progressive Disclosure Guard**.

Normal installation does not require Node.js or npm.

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

## Non-Negotiable Contract

- Treat the current working directory as the target repository.
- Do not copy this file into the target repository.
- Do not modify product code.
- Start with audit only.
- Report exact files before writes.
- Ask before writing files.
- Preserve existing `AGENTS.md`, `CLAUDE.md`, skills, workflows, docs, and config.
- If a target skill already exists with different content, stop and report the conflict.
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
test -f "$PDG_DIR/generated/codex/progressive-disclosure-guard/SKILL.md"
test -f "$PDG_DIR/generated/claude/progressive-disclosure-guard/SKILL.md"
```

These commands are read-only.

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
- any conflict that blocks writing;
- exact command or copy operation you want to run next.

Stop after this report.

## Apply After Human Approval

Run only the copy operations for the selected mode.

Codex:

```bash
mkdir -p "$target_dir/.agents/skills/progressive-disclosure-guard"
cp "$PDG_DIR/generated/codex/progressive-disclosure-guard/SKILL.md" \
  "$target_dir/.agents/skills/progressive-disclosure-guard/SKILL.md"
```

Claude Code:

```bash
mkdir -p "$target_dir/.claude/skills/progressive-disclosure-guard"
cp "$PDG_DIR/generated/claude/progressive-disclosure-guard/SKILL.md" \
  "$target_dir/.claude/skills/progressive-disclosure-guard/SKILL.md"
```

For `dual-agent`, run both copy blocks.

Do not write `AGENTS.md`, `CLAUDE.md`, GitHub workflows, Linear templates, or project docs. PDG is only the skill.

## Verify Installation

Run:

```bash
cd "$target_dir"
case "<codex-only|claude-only|dual-agent>" in
  codex-only)
    test -f .agents/skills/progressive-disclosure-guard/SKILL.md
    grep -q "name: progressive-disclosure-guard" .agents/skills/progressive-disclosure-guard/SKILL.md
    ;;
  claude-only)
    test -f .claude/skills/progressive-disclosure-guard/SKILL.md
    grep -q "name: progressive-disclosure-guard" .claude/skills/progressive-disclosure-guard/SKILL.md
    ;;
  dual-agent)
    test -f .agents/skills/progressive-disclosure-guard/SKILL.md
    test -f .claude/skills/progressive-disclosure-guard/SKILL.md
    grep -q "target: codex" .agents/skills/progressive-disclosure-guard/SKILL.md
    grep -q "target: claude" .claude/skills/progressive-disclosure-guard/SKILL.md
    ;;
esac
```

Report the commands run and any blocked verification.
