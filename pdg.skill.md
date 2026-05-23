---
name: progressive-disclosure-guard
description: Use before finalizing specs, plans, implementation prompts, architecture reviews, UX critiques, handoff docs, code reviews, install/migration instructions, or after substantial code changes. Stay silent for typos, formatting-only edits, read-only lookups, one-command status checks, or low-risk changes with no handoff, behavior, or source-of-truth risk.
targets:
  - claude
  - codex
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
context:
  - Read source-of-truth files before relying on memory.
  - Keep checks bounded; do not recursively invoke PDG on PDG itself.
constitution:
  - progressive-disclosure-before-detail
  - evidence-before-claim
  - source-of-truth-before-memory
  - preserve-working-systems
  - separated-authority
  - real-verification-before-done
---

# PDG - Progressive Disclosure Guard

Use this skill before finalizing specs, plans, implementation prompts, architecture reviews, UX critiques, handoff docs, code reviews, install/migration instructions, or substantial code changes.

Do not invoke PDG for typo-only edits, formatting-only edits, read-only lookups, one-command status checks, or low-risk changes that do not affect handoff text, behavior, contracts, source of truth, install steps, verification claims, or generated outputs.

A substantial code change touches more than 3 files, changes a public route or API contract, introduces a store/pipeline/state machine, changes persistence, or modifies behavior other modules depend on.

Assume the next implementer is low-context, literal, rushed, and able to satisfy the words while damaging the product.

## Invariants

Always:

- read the named source-of-truth files before giving constraints;
- name the existing behavior, files, callbacks, routes, stores, pipelines, generated outputs, and install paths that must be preserved;
- convert dangerous wording into explicit `MUST` / `MUST NOT` constraints;
- require verification through a real command, public route, install path, or product entry path;
- label same-agent review as `PDG self-check, not independent review`.

Never:

- replace a working route, store, hook, pipeline, state machine, prompt path, persistence contract, or install flow without end-to-end verification;
- create a parallel engine, store, router, workflow, generator, or doctrine file when an existing one should be extended;
- claim `verified`, `done`, or `safe` without naming the command, route, or workflow checked;
- treat generated files as canonical when a source file and generator exist;
- bulk-load full catalogs, doctrines, folders, fixtures, or skill trees when a focused source will answer.

## Trigger Boundary

Invoke PDG when any of these are true:

- another human, Claude, Codex, or reviewer will execute the output;
- the work is a spec, plan, handoff, review, install or migration instruction;
- the diff changes behavior, public contracts, generated outputs, install steps, verification claims, or more than 3 files;
- wording could let a rushed implementer satisfy the text while breaking the intended behavior.

Stay silent when all of these are true:

- the task is typo-only, formatting-only, read-only lookup, one-command status, or similarly low-risk;
- no handoff, install instruction, behavior, contract, source-of-truth, generated output, or verification claim changes;
- no final answer needs to assert safety beyond the command or fact just observed.

If the boundary is ambiguous, run only a two-line trigger check: `PDG triggered: yes/no` and `reason: ...`. Continue with a full PDG pass only when the answer is yes.

## Workflow

1. Decide whether PDG triggers; if not, say why in one line and stop the PDG pass.
2. Classify known knowns, known unknowns, unknown knowns, and unknown unknowns.
3. Name preserved behavior and source-of-truth files.
4. Red-team dangerous wording such as `refactor`, `simplify`, `wire`, `reuse`, `support`, `migrate`, `install`, `generate`, `verified`, or `done`.
5. Convert ambiguity into `MUST`, `MUST NOT`, non-goals, and forbidden shortcuts.
6. Require regression proof through the real workflow, not only isolated helper existence.
7. If review is same-agent, label it as self-check and request human validation for risky work.

## Known/Unknown Pass

- **Known knowns:** explicit requirements, existing behavior, named files, routes, callbacks, contracts, tests, constraints, and sources already covered.
- **Known unknowns:** decisions still required before implementation; convert them into phase gates, required decisions, or explicit deferrals.
- **Unknown knowns:** assumptions hidden by "already done", "simple", "wire", "support", "MVP", "later", or "for now"; convert them into hard constraints or acceptance criteria.
- **Unknown unknowns:** failure modes the implementer is unlikely to check; convert them into regression proof, non-goals, monitoring/logging, or follow-up.

Bias toward uncertainty. If an item could fit multiple quadrants, classify it as unknown rather than known.

## Enforce Progressive Disclosure Everywhere

- Docs/specs/plans: use an index or top-level plan that points to phase, decision, domain, or implementation files when the topic is broad.
- Code: expose a narrow entry point first, then split orchestration, domain logic, IO, state, persistence, rendering, prompt construction, and validation by responsibility.
- New code files should normally stay under roughly 200 lines; split or justify larger files, and do not hide unrelated responsibilities in broad `utils`, `service`, `manager`, `handler`, `core`, `engine`, or `processor` dumps.
- Runtime flows: fetch or compute summaries/lists first, then expand details only when the real path needs them.
- APIs/search/discovery: expose summary/list endpoints first and detail endpoints only on explicit demand.
- UI work: implement the smallest real workflow surface first, then reveal advanced controls or secondary panels only after the main path works.
- Prompts/agents: select targeted domains or capabilities before injecting detailed doctrine.
- Skills: choose one primary skill from name/description first, then load extra skills or references only when the task requires their specific procedure.
- Tests/verification: start with narrow contract checks and the shortest real workflow, then broaden according to named risk. State what was checked and what remains unverified.
- Reviews: read root context first, then expand only into files that evidence a risk.

A solution that works by dumping all knowledge, all domains, all tests, all UI, or all doctrine into one large artifact is a failed implementation unless explicitly requested.

## Fallbacks

- Ambiguous trigger boundary: do the two-line trigger check and stop unless PDG clearly triggers.
- Source of truth missing: write `Unknown`, ask for the source, or inspect a named file; do not proceed from memory as if it were fact.
- Verification blocked: report the exact blocked command or route, why it is blocked, and the narrower check that was still possible.
- No second reviewer: label the result `PDG self-check, not independent review`; provide the human validation card.
- Generated output drift: update only the canonical source or generator, regenerate, and do not hand-edit generated variants.

Human validation card:

- changed files:
- real workflow or command to inspect:
- expected result:
- risk the human is accepting:
- exact approval sentence: `Approved after human validation.`

## Examples

Input: `Refactor auth flow and clean up callbacks.`
PDG output: triggered. MUST preserve current login/logout routes, session storage, callbacks, and tests. MUST NOT create a parallel auth pipeline. Required proof: run the real login workflow or named auth test.

Input: `Install PDG here for Codex.`
PDG output: triggered. MUST start with audit only, report exact files, preserve existing `AGENTS.md`, install `.agents/skills/progressive-disclosure-guard/SKILL.md`, merge the trigger block only after approval, and verify the installed path.

Input: `Fix README typo.`
PDG output: not triggered unless the edit changes install instructions, handoff text, verification claims, or generated output.

## Output

Add a section named `PDG pass` with:

- trigger decision;
- known knowns;
- known unknowns;
- unknown knowns;
- unknown unknowns;
- bad implementation path;
- guardrail added;
- existing behavior that must be preserved;
- forbidden implementation shortcuts;
- regression proof required.

## Final Checklist

- trigger boundary checked;
- source of truth read or marked `Unknown`;
- preserved behavior named;
- dangerous wording constrained with `MUST` / `MUST NOT`;
- non-goals and forbidden shortcuts stated;
- real verification path required or blocked verification reported;
- generated files treated as generated;
- same-agent review labeled `PDG self-check, not independent review`.
