# Changelog

## 0.1.0

- Added the canonical PDG skill source and generated Claude/Codex skill outputs.
- Added static checks for large files, broad file names, and unsupported verification claims.
- Added deterministic fixture evidence for the initial guard behavior.

## Unreleased

- Added documentation-generation guardrails inspired by BercyHubDocs.
- Added binary asset duplication checks and `PDG-BINARY-ASSET-JUSTIFICATION:`.
- Added maintainer health checks, CI, install audit fixtures, and release metadata.
- Added Bercy-derived source inventory, stale-question removal, and review-finding-to-fixture checks.
- Documented safe updates for existing generated PDG skill installs.
- Documented that `v0.1.0` predates the documentation-generation guardrails.
- Added source-grounded review scoring guardrails requiring claim/source/verdict/impact evidence before ratings or approvals.
- Added overlap inspection guardrails for code, scripts, skills, agents, hooks, and configs before known/unknown classification.
