# PDG - Progressive Disclosure Guard

**Progressive disclosure for AI coding agents.**

PDG is a small skill for Claude Code, Codex, and other coding agents. It stops an agent from turning a change into one giant plan, one giant file, one vague refactor, or one fake verification.

The core rule is simple: the agent must earn the next layer of detail.

It reveals work in layers:

1. what is known and unknown;
2. what existing behavior must survive;
3. which docs, specs, plans, files, routes, stores, prompts, and tests are in scope;
4. the smallest useful implementation step;
5. code split by responsibility instead of dumped into broad files;
6. narrow tests first, then real workflow verification;
7. a clear receipt of what was checked and what remains unverified.

The readable name is **PDG - Progressive Disclosure Guard**. The stable skill slug is `progressive-disclosure-guard`.

## Why It Exists

AI coding agents often fail by adding too much too early:

- a spec that hides decisions in a wall of text;
- a plan that says "refactor" without naming what must stay working;
- a code change that creates a parallel pipeline beside the real one;
- a new helper, store, route, or prompt path that bypasses the product path;
- tests that prove a helper exists but not that the user workflow still works;
- a final answer that says "verified" without showing the real verification path.

PDG makes those shortcuts visible and blocks them before they become regressions.

## What PDG Applies To

Progressive disclosure is not only a documentation rule.

| Surface | What PDG forces |
| --- | --- |
| Docs | Start with a clear index, then link to focused detail files. |
| Specs | Separate known facts, open decisions, non-goals, and acceptance criteria. |
| Plans | Name allowed files, forbidden files, preserved behavior, and verification gates. |
| Code | Keep entry points thin and split orchestration, domain logic, IO, state, prompts, and validation. |
| Files | Avoid broad `utils`, `service`, or `manager` dumps when a smaller responsibility exists. |
| APIs and prompts | Fetch or inject summaries first, then expand details only when needed. |
| Tests | Start with the smallest contract check, then prove the real workflow. |
| Verification | Report the actual command, route, or user path checked, plus what remains unverified. |

## The PDG Pass

Before an important handoff, review, install instruction, migration plan, or substantial code change, the agent runs a PDG pass.

It asks:

- What could a rushed implementer misread and still claim they followed?
- Which existing behavior, callback, route, store, pipeline, workflow, generated file, or persistence contract must be preserved?
- Did this change create a parallel implementation instead of extending the real one?
- Are vague words like "refactor", "simplify", "wire", "reuse", or "clean up" constrained by `MUST` and `MUST NOT` language?
- Do tests and verification exercise the real product entry path?

Then it turns ambiguity into constraints:

- `MUST preserve ...`
- `MUST call/use ...`
- `MUST NOT replace ...`
- `MUST NOT create a parallel engine/pipeline/store/router ...`
- `MUST NOT remove working code unless the replacement is wired and verified end-to-end ...`

## Install With One Prompt

Use one of these prompts inside the repository where you want PDG installed.

Codex:

```text
Install PDG - Progressive Disclosure Guard here for Codex. Read https://github.com/bacoco/progressive-disclosure-guard/blob/main/INSTALL.md, start with audit only, report the exact files you will write, and ask before writing.
```

Claude Code:

```text
Install PDG - Progressive Disclosure Guard here for Claude Code. Read https://github.com/bacoco/progressive-disclosure-guard/blob/main/INSTALL.md, start with audit only, report the exact files you will write, and ask before writing.
```

Both:

```text
Install PDG - Progressive Disclosure Guard here for both Codex and Claude Code. Read https://github.com/bacoco/progressive-disclosure-guard/blob/main/INSTALL.md, start with audit only, report the exact files you will write, and ask before writing.
```

PDG writes only the selected skill file:

- Codex: `.agents/skills/progressive-disclosure-guard/SKILL.md`
- Claude Code: `.claude/skills/progressive-disclosure-guard/SKILL.md`
- Both: both files

It does not install project governance, GitHub workflows, Linear templates, or collaboration rules.

## Repository Layout

```text
skills/progressive-disclosure-guard/SKILL.md
generated/codex/progressive-disclosure-guard/SKILL.md
generated/claude/progressive-disclosure-guard/SKILL.md
examples/pdg-pass/
scripts/
```

- `skills/.../SKILL.md` is the source skill.
- `generated/codex/...` adds Codex-specific mechanics.
- `generated/claude/...` adds Claude-specific mechanics.
- `examples/pdg-pass/` shows the expected shape of a PDG pass.

## Single-Agent Validation

PDG does not let an AI present its own self-check as independent review.

If there is no second AI reviewer, the author AI may run a `PDG self-check`, but it must label it `self-check, not independent review`.

Risky work still needs one of these:

- human approval;
- another AI/session review;
- `Ready for human validation` with a short validation card.

The human approval sentence is:

```text
Approved after human validation.
```

## Relationship To Fuckia

PDG is the standalone product.

Fuckia is a larger optional governance and collaboration kit for repositories that use Claude Code, Codex, GitHub, Linear, review separation, and stricter workflow checks. Fuckia vendors PDG, but PDG does not depend on Fuckia.

Use PDG alone when you only need progressive disclosure. Use Fuckia when you want the full collaboration and governance layer around it.

## Maintainers

```bash
npm test
npm run generate
```

Generated skill files must stay in sync with `skills/progressive-disclosure-guard/SKILL.md`.
