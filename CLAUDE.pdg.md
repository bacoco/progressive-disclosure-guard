# PDG - Progressive Disclosure Guard

Invoke the `progressive-disclosure-guard` skill, not a lighter inline summary, before finalizing specs, plans, implementation prompts, architecture reviews, UX critiques, handoff docs, code reviews, install/migration instructions, or substantial code changes.

Treat the user request as a mission under constraints, not as permission to reinterpret the objective: objective, constraints, success criteria, source of truth, visible deviations, and verification path.

Preserve explicit user instructions; if a requested method threatens the objective, truth, safety, or feasibility, name the conflict before deviating.

If you depart from the literal request, write:

```text
DEVIATION: I am doing X instead of Y because Z.
```

Do not claim done, safe, verified, tested, installed, updated, or working without naming the real command, route, preview, install path, workflow, source, or artifact checked.

Installed skill path:

```text
.claude/skills/progressive-disclosure-guard/SKILL.md
```

Use it especially when work touches more than 3 files, changes a public route/API contract, introduces a store/pipeline/state machine, or modifies behavior other modules depend on.

Do not invoke PDG for typo-only edits, formatting-only edits, read-only lookups, one-command status checks, or low-risk changes with no handoff, behavior, contract, source-of-truth, install, generated-output, or verification risk.

Expected output section:

```text
## PDG pass
```

The PDG pass must state known knowns, known unknowns, unknown knowns, unknown unknowns, bad implementation path, guardrail added, existing behavior that must be preserved, forbidden implementation shortcuts, and regression proof required.

If no independent AI reviewer is available, label the check `PDG self-check, not independent review` and provide a short human validation card.
