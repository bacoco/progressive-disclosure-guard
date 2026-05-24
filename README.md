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

PDG is intentionally bounded. It should stay silent for typo-only edits, formatting-only edits, read-only lookups, one-command status checks, or low-risk changes with no handoff, behavior, contract, source-of-truth, install, generated-output, or verification risk.

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
| Skills | Select one primary skill first, then load additional skills or references only when the task requires them. |
| Tests | Start with the smallest contract check, then prove the real workflow. |
| Verification | Report the actual command, route, or user path checked, plus what remains unverified. |

## Documentation Generation Mode

PDG now includes a narrow mode for LLM-generated documentation, specs, portals, API docs, architecture docs, and user guides. The agent should not ask the model to infer, draft, overwrite, and verify in one broad pass.

The expected sequence is:

1. build a small evidence manifest from source files, routes, APIs, env vars, data stores, entry points, and unknowns;
2. generate an overview or index first, then focused pages or sections, then architecture only when the evidence supports it;
3. use bounded structured outputs for repeated sections when possible;
4. preserve human overrides, accepted corrections, and curated source-of-truth sections;
5. archive or diff prior generated artifacts before replacement;
6. verify with cheap deterministic checks first, optional rubric-based LLM judge second, and a real preview or workflow for user-visible docs.

Generated or duplicated binary assets also need an explicit `PDG-BINARY-ASSET-JUSTIFICATION:` in an adjacent text file. For example, keeping both `screen.png` and `screen.webp` is justified only when the PNG is an intentional source/fallback asset; otherwise the referenced optimized asset is enough.

## Documentation Review Passes

After a generated or updated doc draft, PDG expects three passes:

1. **Coverage pass:** compare changed files, routes, APIs, env vars, pages, modules, and removed behavior against the draft so important changes are not silently omitted.
2. **Grounding pass:** remove or mark any feature, dependency, architecture claim, limitation, example, or suggested question that cannot point to named source evidence.
3. **Regression pass:** verify the generated output path: links or previews, generated-file drift, preserved human overrides, skipped sections, binary asset justifications, and any real route or install path.

An LLM judge can help the grounding pass, but it is supporting evidence only. The final receipt should name the three passes, or explain which pass was skipped and what risk remains.

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

The pass now has four explicit guard sections:

- `Invariants`: always/never rules for source of truth, preserved behavior, generated files, and real verification.
- `Fallbacks`: bounded responses for ambiguous triggers, missing sources, blocked verification, no second reviewer, and generated drift.
- `Examples`: concrete triggered and non-triggered inputs.
- `Final Checklist`: the short receipt that prevents silent weakening before final output.

## Examples

Without PDG, `Refactor auth flow and clean up callbacks` can become a broad rewrite. With PDG, the output must name preserved login/logout routes, session storage, callbacks, forbidden parallel auth paths, and a real login verification path.

Without PDG, `Generate architecture docs` can invent workers, queues, and services because they sound plausible. With PDG, the agent must build an evidence manifest first and omit architecture claims that are not supported by named sources.

Without PDG, `Update docs after this feature` can cover only the headline page and miss changed env vars, removed behavior, or stale suggested questions. With PDG, the coverage, grounding, and regression passes must each report what was checked.

Without PDG, `Done` or `verified` can be a vibe. With PDG, the final receipt must name the command, route, install path, preview, or workflow that was actually checked.

## Install With One Prompt

Use one of these prompts inside the repository where you want PDG installed.

Codex:

```text
Install PDG - Progressive Disclosure Guard here for Codex. Read https://github.com/bacoco/progressive-disclosure-guard/blob/main/INSTALL.md, start with audit only, then install the skill and merge the PDG trigger block into AGENTS.md. Report the exact files you will write and ask before writing.
```

Claude Code:

```text
Install PDG - Progressive Disclosure Guard here for Claude Code. Read https://github.com/bacoco/progressive-disclosure-guard/blob/main/INSTALL.md, start with audit only, then install the skill and merge the PDG trigger block into CLAUDE.md. Report the exact files you will write and ask before writing.
```

Both:

```text
Install PDG - Progressive Disclosure Guard here for both Codex and Claude Code. Read https://github.com/bacoco/progressive-disclosure-guard/blob/main/INSTALL.md, start with audit only, then install both skills and merge the PDG trigger blocks into AGENTS.md and CLAUDE.md. Report the exact files you will write and ask before writing.
```

Default PDG installation writes two things for each selected agent:

- Codex: `.agents/skills/progressive-disclosure-guard/SKILL.md`
- Claude Code: `.claude/skills/progressive-disclosure-guard/SKILL.md`
- Codex trigger block: `AGENTS.md`
- Claude Code trigger block: `CLAUDE.md`

Use a skill-only install only when the human explicitly says not to edit agent instruction files.

It does not install broad project governance, GitHub workflows, Linear templates, or Claude/Codex collaboration workflows.

## Files

```text
pdg.skill.md
pdg.codex.skill.md
pdg.claude.skill.md
AGENTS.pdg.md
CLAUDE.pdg.md
LICENSE
CHANGELOG.md
scripts/
evidence/
```

- `pdg.skill.md`: canonical shared source.
- `pdg.codex.skill.md`: Codex install file.
- `pdg.claude.skill.md`: Claude Code install file.
- `AGENTS.pdg.md`: optional Codex trigger block for project instructions.
- `CLAUDE.pdg.md`: optional Claude Code trigger block for project instructions.
- `LICENSE` and `CHANGELOG.md`: release metadata.
- `scripts/`: generation and drift checks.
- `evidence/`: maintainer-only proof artifacts; not part of the installed skill copy.

PDG is the canonical source for the `progressive-disclosure-guard` skill. Downstream governance kits may vendor it, but project-specific workflows should stay out of PDG.

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

## Maintainers

```bash
npm test
npm run generate
npm run health
```

Generated skill files must stay in sync with `pdg.skill.md`.
