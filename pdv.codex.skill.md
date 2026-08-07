---
name: progressive-disclosure-validation
description: PDV — strict post-implementation validation. Call at the end, once the PDP has been implemented. Validates abstraction quality, detects spaghetti and oversized files, hunts for code judo moves. Produces a formal GO / NO-GO verdict.
---

<!--
GENERATED FILE - DO NOT EDIT DIRECTLY
source: pdv.skill.md
source_hash: ae9862b5de7e8ba9ffdab6abf704575e77119cabb2051aaaf0006b3aaee99150
generated_by: pdg generate-skills
target: codex
-->

# PDV - Progressive Disclosure Validation

## Codex Mechanics

- Use `rg` for repository inventory.
- Use `apply_patch` for manual file edits.
- Use Codex subagents only when file ownership is disjoint.
- Do not run parallel agents on the same files.
- Do not mark a risky Codex implementation as reviewed by the same Codex context.

# PDV - Progressive Disclosure Validation

PDV is the final validation step in the PD chain:

```
PDG frames the work → PDP plans → PDD produces artifacts → PDV validates at the end
```

Call PDV after implementation is complete. Never before.

## Triggers

Call PDV when:

- implementation is complete and ready for final review;
- after a substantial Codex or Claude contribution;
- after PDD has produced its artifacts and the code is ready;
- before declaring a task done, safe, or shipped.

Stay silent when:

- implementation has not started yet (use PDG instead);
- the change is typo-only, formatting-only, or trivially reversible;
- the diff is under 10 lines with no structural impact.

## Behavior when context is insufficient

| Situation | Action |
|-----------|--------|
| No identifiable target | Ask: "What is the target? (file, directory, branch, diff)" — STOP |
| Target not found | Report the error and ask for the correct path — STOP |
| Context too large (> 5,000 lines) | Ask to narrow the target before starting |
| Ambiguous verdict after inspection | List uncertain blockers explicitly, ask for human confirmation — do not default to GO |

## Workflow

1. **Identify the target** — file, directory, branch or diff provided as argument.
2. **Read the artifacts** — diff, modified files, direct dependents (importers, callers, config consumers).
3. **Apply the validation questions** — for each significant change, look for the code judo move first.
4. **Classify observations** — in descending order of severity: (1) structural quality regressions, (2) missed dramatic simplifications / code judo, (3) spaghetti / ad hoc branching, (4) boundary / type issues, (5) file size, (6) modularity, (7) readability. One concrete remedy per observation.
5. **Produce the validation receipt** — fill in the template, check the checklist, formulate the GO / NO-GO verdict.

## Constraints

Never:

- approve solely because the behavior appears correct;
- soften a major structural problem into a light suggestion;
- produce a long list of cosmetic notes when structural problems exist;
- validate code that pushes a file from under 1,000 lines to over 1,000 lines without justification.

Always:

- look for a code judo move before proposing a partial refactor;
- name the specific file, function or layer in each observation;
- propose a concrete remedy, not just a finding;
- prioritize observations in the defined severity order;
- conclude with an explicitly formulated GO / NO-GO verdict.

## Non-negotiable standards

0. Be ambitious about structural simplification. Hunt for code judo moves: restructurings that make entire branches, layers or helpers disappear entirely.
1. 1,000-line threshold. A PR that crosses this limit without justification is a strong signal of quality debt — require decomposition first.
2. Anti-spaghetti. New ad hoc conditionals in unrelated flows = design problem, not a stylistic remark.
3. Design bias. Prefer simplifications that remove moving parts over refactors that redistribute the same complexity elsewhere.
4. Boring code. Direct and maintainable over hacky or magical.
5. Type boundaries. `any`, `unknown`, unnecessary casts = contract obfuscation — make the boundary explicit.
6. Canonical layer. Reuse existing helpers; do not introduce a near-duplicate.
7. Atomicity. Unnecessary sequential orchestration or partial state updates = design smell.

## Main validation questions

For each significant change:

- Is there a code judo move that would make this dramatically simpler?
- Does this change improve or degrade the local architecture?
- Has a previously cohesive module become more coupled or harder to reason about?
- Does this logic live in the right file and layer?
- Has this change pushed a file beyond a healthy size limit?
- Is the implementation direct and readable, or does it rely on special cases?
- Does this abstraction justify its existence, or is it just a wrapper?

## Example

Input: Python diff adding 3 `if/elif` blocks in `process_request()` (already 120 lines, `app/api/handler.py`) to handle 3 different client types.

Expected output:

```
[spaghetti] process_request() grows from 120 to 148 lines with 3 if/elif
blocks for client_type. These branches are disguised routing — move to a
dedicated dispatcher (handler dict or Strategy pattern). The main flow
becomes one line; each handler evolves independently.

[code judo] If the 3 handlers share 80% of logic, extract process_request_base()
and override only the delta. The PR nearly disappears.

Verdict: NO-GO — avoidable spaghetti, code judo move available.
```

## Validation receipt

```
## PDV pass

**Target**: [file / directory / branch]
**Artifacts inspected**: [list]

### Observations
[prioritized in the defined order — each with a concrete remedy]

### Checklist
- [ ] Target identified and read
- [ ] Code judo move searched for each significant change
- [ ] Files exceeding 1,000 lines flagged or justified
- [ ] Ad hoc branches in existing flows flagged
- [ ] Each observation carries a concrete remedy
- [ ] No structural regression left unreported

### Verdict
GO — no structural blocker
or
NO-GO — [list of blockers]
```

## Output expectations

Prioritize observations in this order:

1. Structural code quality regressions
2. Missed dramatic simplification opportunities / code judo
3. Spaghetti / branching complexity increases
4. Boundary / abstraction / type contract issues
5. File size and decomposition concerns
6. Modularity and abstraction issues
7. Readability and maintainability concerns

Prefer a small number of high-conviction comments over a long list of cosmetic notes.

## Tone

Direct, serious, demanding. Do not soften major problems. If the code makes the codebase messier, say so clearly.
