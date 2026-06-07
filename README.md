# PDG - Progressive Disclosure Guard

<!-- PDG-LARGE-FILE-JUSTIFICATION: README.md is the public index for PDG, PDD, Marc Aurelus, Mission Brief, installation, and maintainer checks; detailed content stays in linked docs. -->

**A Marc Aurelus mission harness for AI agents.**

Do not prompt the agent. Brief the mission.

PDG turns vague agent work into governed missions: objective, constraints,
source evidence, smallest useful step, visible deviations, and real
verification.

Your mission, should you choose to accept it:
achieve the goal, obey the laws, expose every deviation.

This message will not self-destruct.
Your hidden assumptions will.

The readable name is **PDG - Progressive Disclosure Guard**. The stable skill
slug and repository name stay `progressive-disclosure-guard`.

## What PDG Is

PDG is a small guardrail for Claude Code, Codex, and other coding agents.

It forces progressive disclosure: the agent must earn the next layer of detail
instead of jumping into one giant plan, one giant file, one vague refactor, or
one fake verification.

Treat my requests as objectives under constraints, not merely as rails to
follow.

Respect my explicit request first. Depart from it only if it is contradictory,
impossible, unsafe, misleading, or if another method clearly serves the stated
objective better. If you depart from it, declare the deviation.

For every risky request, PDG asks the agent to:

- identify the real objective;
- respect the explicit constraints;
- distinguish what is known, unknown, and assumed;
- choose the best method within the framework;
- expose deviations before acting on them;
- verify the limits before answering;
- produce the most useful, clear, and reliable result possible.

Be free in method, but faithful to the objective.
Freedom of method is not permission to silently change the mission.

## The Marc Aurelus Doctrine

Marc Aurelus is the product doctrine behind PDG:

- do not command the agent, brief the mission;
- a prompt is not a rail;
- a prompt is a mission under constraints;
- the agent has freedom of method, not freedom to silently change the mission;
- the goal is not perfect agents;
- the goal is visible drift and verifiable work.

See [`docs/marc-aurelus-doctrine.md`](docs/marc-aurelus-doctrine.md).

## Mission Brief

Mission Brief is the practical interface.

Use it when a task is risky, multi-step, delegated, persistent, or likely to
drift across sessions.

The short form:

- Mission;
- Objective Lock;
- Constraints;
- Success Criteria;
- Progressive Disclosure Gates;
- Deviation Protocol;
- Verification Protocol;
- Deliverable.

Template: [`templates/mission-brief.md`](templates/mission-brief.md)

Guide: [`docs/mission-brief.md`](docs/mission-brief.md)

## What PDG Guards Against

- premature architecture;
- giant plans;
- giant files;
- fake verification;
- silent scope drift;
- source-of-truth bypass;
- generated-output mismatch;
- multi-agent busywork;
- undocumented PDD/documentation claims;
- parallel engines, stores, routers, workflows, or prompt paths.

The deeper failure model is in [`docs/failure-atlas.md`](docs/failure-atlas.md).
The short governance constitution is in
[`docs/vibe-coding-laws.md`](docs/vibe-coding-laws.md).

## When PDG Triggers

PDG should trigger on:

- risky tasks;
- code changes;
- refactors;
- specs, plans, handoffs, reviews, and implementation prompts;
- durable documentation;
- generated outputs;
- install or migration instructions;
- behavior changes;
- tests and verification claims;
- multi-step or multi-agent work.

PDG should stay silent or minimal for:

- typo-only edits;
- formatting-only edits;
- read-only lookups;
- one-command status checks;
- small questions with no handoff, behavior, contract, source-of-truth,
  generated-output, install, or verification risk.

## The PDG Pass

Before an important handoff, review, install instruction, migration plan, or
substantial code change, the agent runs a PDG pass.

It asks:

- What could a rushed implementer misread and still claim they followed?
- Which existing behavior, callback, route, store, pipeline, workflow,
  generated file, or persistence contract must be preserved?
- Did this change create a parallel implementation instead of extending the
  real one?
- Are vague words like "refactor", "simplify", "wire", "reuse", or "clean up"
  constrained by `MUST` and `MUST NOT` language?
- Do tests and verification exercise the real product entry path?

## PDD Mode

PDG is the guardrail.
PDD is the documentation engine or external documentation contract.

Related repositories:

- [PDD - Progressive Disclosure Documentation](https://github.com/bacoco/progressive-disclosure-documentation):
  produces `.pdd/` artifacts.
- [PDD-IAR - Investigative Autoregressive Retrieval](https://github.com/bacoco/progressive-disclosure-iar):
  consumes `.pdd/` artifacts to investigate original source evidence.

PDG has no runtime dependency on either repository. It defines the guardrails
that tell agents when to require PDD artifacts and how PDD-IAR-style consumers
must use them.

When durable documentation must be created, converted, updated, reviewed,
indexed, consumed by a documentation chatbot, or used by an investigative
retrieval layer, PDG should route the work to PDD when PDD is available in the
repository or toolchain.

PDG must not vendor, import, duplicate, or reimplement PDD runtime behavior when
PDD is external.

PDD receipts may include source inventory, source map, manifest, disclosure
contract, coverage, grounding, regression, stale-removal, and preserved human
overrides. Generated docs are a disclosure layer; retrieval consumers should
treat generated docs as orientation and return an answerability state when
evidence is missing, stale, contradictory, or unmapped.

See [`docs/pdd-contract.md`](docs/pdd-contract.md).

## Installation

Use one of these prompts inside the repository where you want PDG installed.
They read `INSTALL.md` from `main`; do not pin `v0.1.0` when you need the
documentation-generation guardrails.

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

Use a skill-only install only when the human explicitly says not to edit agent
instruction files.

It does not install broad project governance, GitHub workflows, Linear
templates, or Claude/Codex collaboration workflows.

## Files

```text
pdg.skill.md
pdg.codex.skill.md
pdg.claude.skill.md
AGENTS.pdg.md
CLAUDE.pdg.md
docs/
templates/
evidence/
scripts/
LICENSE
CHANGELOG.md
```

- `pdg.skill.md`: canonical shared source.
- `pdg.codex.skill.md`: generated Codex install file.
- `pdg.claude.skill.md`: generated Claude Code install file.
- `AGENTS.pdg.md`: optional Codex trigger block for project instructions.
- `CLAUDE.pdg.md`: optional Claude Code trigger block for project instructions.
- `docs/`: Marc Aurelus, Mission Brief, PDD contract, laws, and failure model.
- `templates/`: reusable mission brief template.
- `evidence/`: maintainer-only proof artifacts; not part of the installed skill
  copy.
- `scripts/`: generation, drift checks, install audit, and health checks.

PDG is the canonical source for the `progressive-disclosure-guard` skill.
Downstream governance kits may vendor it, but project-specific workflows should
stay out of PDG.

## Maintainers

```bash
npm run generate
npm test
git diff --check
npm run health
```

Generated skill files must stay in sync with `pdg.skill.md`.
Do not hand-edit `pdg.codex.skill.md` or `pdg.claude.skill.md`.
