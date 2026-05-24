# PDG Fixture Evaluation Report

This file is evidence for repository maintainers. It is not part of the installed skill copy.

This is a deterministic fixture evaluation, not an empirical LLM benchmark.

| Task | Without PDG | With PDG | Delta |
| --- | ---: | ---: | ---: |
| auth-refactor | 0 | 6 | 6 |
| install-pdg | 0 | 6 | 6 |
| readme-typo | 0 | 2 | 2 |
| explicit-constraint-preservation | 0 | 7 | 7 |
| **Total** | **0** | **21** | **21** |

Measured difference: the PDG-conditioned fixture outputs include more trigger, source, preservation, MUST/MUST NOT, and verification markers than the non-PDG fixture outputs.

What stays unproven: this does not prove real-world agent behavior, user acceptance, false-positive rate, or regression prevention on live repositories. A robust evaluation would need repeated model runs, blinded review, and real task outcomes.
