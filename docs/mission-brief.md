# Mission Brief

Mission Brief is the operational interface for PDG.

It turns a request into a governed mission: objective, constraints, success
criteria, progressive disclosure gates, visible deviation, verification, and
deliverable.

Use the template in [`templates/mission-brief.md`](../templates/mission-brief.md)
when a task is risky, multi-step, delegated to another developer, or likely to
drift across sessions.

## Fields

### Mission

What must be achieved.

### Objective Lock

What must not drift while the agent chooses its method.

### Constraints

Explicit limits, forbidden outcomes, non-goals, and source-of-truth boundaries.

### Success Criteria

Observable signs that the mission is complete.

### Progressive Disclosure Gates

1. Known / unknown / assumed
2. Source of truth
3. Preserved behavior
4. Smallest useful step
5. Verification path
6. Final receipt

### Deviation Protocol

If the agent departs from the literal request, it must write:

```text
DEVIATION: I am doing X instead of Y because Z.
```

No silent deviation is allowed.

### Verification Protocol

The agent must not claim done, safe, verified, working, installed, updated, or
tested unless it names the command, route, preview, install path, workflow,
source, or artifact checked.

If not verified, it must write:

```text
NOT VERIFIED: [reason]
```

### Deliverable

The final format expected by the user.
