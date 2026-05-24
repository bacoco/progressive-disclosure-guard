---
name: progressive-disclosure-guard
description: Use before finalizing specs, plans, implementation prompts, architecture reviews, UX critiques, handoff docs, code reviews, install/migration instructions, or after substantial code changes. Stay silent for typos, formatting-only edits, read-only lookups, one-command status checks, or low-risk changes with no handoff, behavior, or source-of-truth risk.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
context:
  - Read source-of-truth files before relying on memory.
  - Keep checks bounded; do not recursively invoke PDG on PDG itself.
---

<!--
GENERATED FILE - DO NOT EDIT DIRECTLY
source: pdg.skill.md
source_hash: a3406c1d41cbd9c73781b0f8d53ab4df3e42794560f5216f3c002821a8845147
generated_by: pdg generate-skills
target: claude
-->

# PDG - Progressive Disclosure Guard

## Claude Mechanics

- Use Claude planning tools for task tracking.
- Use Claude subagents only when file ownership is disjoint.
- Do not run parallel agents on the same files.
- Do not mark a risky Claude implementation as reviewed by the same Claude context.

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
- for any new file over 200 lines, require `PDG-LARGE-FILE-JUSTIFICATION:` with why the file must stay dense;
- for any broad `service`, `utils`, `manager`, or `handler` file, require `PDG-BROAD-FILE-JUSTIFICATION:` with the single responsibility it owns.

Never:

- replace a working route, store, hook, pipeline, state machine, prompt path, persistence contract, or install flow without end-to-end verification;
- create a parallel engine, store, router, workflow, generator, or doctrine file when an existing one should be extended;
- claim `verified`, `done`, or `safe` without naming the command, route, or workflow checked;
- treat "roughly 200 lines" as permission to exceed 200 lines without an explicit justification marker;
- treat generated files as canonical when a source file and generator exist;
- overwrite generated documentation, inventories, human overrides, or binary assets without a diff/archive receipt and a named verification path;
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
- New files must stay at or below 200 lines unless they include `PDG-LARGE-FILE-JUSTIFICATION:`.
- Broad `service`, `utils`, `manager`, or `handler` files must include `PDG-BROAD-FILE-JUSTIFICATION:` and state their single responsibility.
- Runtime flows: fetch or compute summaries/lists first, then expand details only when the real path needs them.
- APIs/search/discovery: expose summary/list endpoints first and detail endpoints only on explicit demand.
- UI work: implement the smallest real workflow surface first, then reveal advanced controls or secondary panels only after the main path works.
- Prompts/agents: select targeted domains or capabilities before injecting detailed doctrine.
- Skills: choose one primary skill from name/description first, then load extra skills or references only when the task requires their specific procedure.
- Tests/verification: start with narrow contract checks and the shortest real workflow, then broaden according to named risk. State what was checked and what remains unverified.
- Reviews: read root context first, then expand only into files that evidence a risk.

A solution that works by dumping all knowledge, all domains, all tests, all UI, or all doctrine into one large artifact is a failed implementation unless explicitly requested.

## Documentation Generation Mode

When generating or updating documentation, specs, portals, API docs, architecture docs, or user guides with LLM help:

1. Build a source inventory before drafting. Name inspected files, routes, entry points, APIs, env vars, modules, data stores, generated outputs, and unknowns.
2. Classify sources by audience, relevance, and safety: user/product, architecture, operator, internal-only, stale, secret-bearing, generated, binary asset, or out of scope.
3. Generate from the inventory in layers: overview or index first, focused pages or sections second, cross-cutting architecture only when source evidence supports it.
4. Prefer bounded structured outputs for repeated units. If the LLM output is invalid, incomplete, or unsupported, fall back to deterministic minimal text and report the gap.
5. Preserve human overrides, accepted corrections, and curated source-of-truth sections. MUST NOT overwrite them silently during regeneration.
6. Archive or diff prior generated artifacts before replacement when the output is durable or user-facing.
7. Suggested questions, examples, summaries, architecture claims, limitations, and dependencies MUST be answerable from named sources.
8. Removed behavior and stale questions MUST be removed from generated docs unless explicitly retained as historical notes.
9. Heavy generated assets and duplicated binary formats require `PDG-BINARY-ASSET-JUSTIFICATION:` in an adjacent text file. Prefer committing only the referenced optimized asset unless a source or fallback asset is intentionally needed.
10. Verification must include cheap deterministic checks first, optional rubric-based LLM judge second, and a real route, preview, or workflow for user-visible docs.

## Documentation Review Passes

When generated or updated documentation is durable, user-facing, or used by another agent, run three explicit passes after the first draft:

1. **Coverage pass:** compare inventory, changed files, routes, APIs, env vars, pages, modules, removed behavior, and generated outputs against the draft. Every relevant change appears in one intended place, or is listed as intentionally undocumented.
2. **Grounding pass:** every feature, dependency, architecture claim, limitation, default question, example, and suggested next action points to named source evidence. Unsupported claims are removed, marked `Unknown`, or converted into questions for the human.
3. **Regression pass:** verify the real generated output path still works. Check links or previews, generated-file drift, preserved human overrides, stale removals, binary asset justification, and the product route or install path when applicable.

Every actionable review finding that is machine-checkable MUST become a fixture, regression test, or checklist item before final. The final receipt must name the three passes, inventory counts or exclusions, review findings converted to proof, skipped checks, and residual risk. An LLM judge can support grounding, but it must not replace source evidence or real workflow verification.

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
- for generated docs, evidence manifest, preserved overrides, artifact diff/archive, and doc-quality checks reported;
- for generated or updated docs, coverage, grounding, and regression review passes reported or explicitly skipped with residual risk;
- same-agent review labeled `PDG self-check, not independent review`.
