# PDG Doc Generation Fixture Evaluation Report

This deterministic fixture evaluation checks whether PDG-conditioned outputs add evidence, preservation, artifact receipt, and verification markers for generated documentation.

| Task | Without PDG | With PDG | Delta |
| --- | ---: | ---: | ---: |
| unsupported-architecture | 0 | 4 | 4 |
| human-override | 0 | 5 | 5 |
| duplicate-binary-assets | 1 | 3 | 2 |
| valid-doc-receipt | 0 | 4 | 4 |
| **Total** | **1** | **16** | **15** |

What stays unproven: this is not a live LLM benchmark. It only protects the repository wording and examples from losing the doc-generation guardrails.
