# Fuckia Integration

PDG is the standalone source of truth for the `progressive-disclosure-guard` skill.

Fuckia is allowed to vendor PDG because Fuckia installs a broader governance kit: Claude/Codex entrypoints, GitHub templates, Linear templates, review separation, and workflow checks.

## Source Direction

- PDG owns the skill content.
- Fuckia consumes a pinned copy.
- PDG must not depend on Fuckia.
- Fuckia-specific workflows must not be added to the PDG skill.

## Files Fuckia May Vendor

```text
skills/progressive-disclosure-guard/SKILL.md
generated/codex/progressive-disclosure-guard/SKILL.md
generated/claude/progressive-disclosure-guard/SKILL.md
```

## Sync Rule

When PDG changes, update Fuckia with a dedicated sync commit. The commit must include:

- the updated source skill;
- the updated generated Claude and Codex variants;
- the pinned PDG commit;
- generated-skill checks;
- a short PDG pass in the pull request or commit notes.

Do not edit the vendored Fuckia copy by hand unless the same change is applied here first.
