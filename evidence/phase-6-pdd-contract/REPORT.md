# PDG PDD Contract Fixture Report

This deterministic fixture evaluation protects the PDD-as-external-engine contract.

| Task | Without PDG | With PDG | Delta |
| --- | ---: | ---: | ---: |
| generate-new-doc | 0 | 12 | 12 |
| convert-existing-doc | 0 | 12 | 12 |
| update-pdd-doc | 0 | 11 | 11 |
| chatbot-over-pdd | 1 | 12 | 11 |
| **Total** | **1** | **47** | **46** |

What stays unproven: fixtures protect wording; they do not prove a live PDD runtime or chatbot integration.
