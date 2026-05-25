# PDG PDD Contract Fixture Report

This deterministic fixture evaluation protects the PDD-as-external-engine contract.

| Task | Without PDG | With PDG | Delta |
| --- | ---: | ---: | ---: |
| generate-new-doc | 0 | 13 | 13 |
| convert-existing-doc | 0 | 14 | 14 |
| update-pdd-doc | 0 | 13 | 13 |
| chatbot-over-pdd | 1 | 13 | 12 |
| **Total** | **1** | **53** | **52** |

What stays unproven: fixtures protect wording; they do not prove a live PDD runtime or chatbot integration.
