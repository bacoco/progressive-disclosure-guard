# PDG Doc Review Pass Fixture Report

This deterministic fixture evaluation checks that generated-documentation work names coverage, grounding, and regression review passes.

| Task | Without PDG | With PDG | Delta |
| --- | ---: | ---: | ---: |
| missed-env-var | 0 | 7 | 7 |
| hallucinated-queue | 0 | 7 | 7 |
| stale-question | 0 | 7 | 7 |
| skipped-pass | 0 | 6 | 6 |
| prose-only-score | 1 | 9 | 8 |
| skill-overload-unread-justification | 0 | 11 | 11 |
| **Total** | **1** | **47** | **46** |

What stays unproven: these fixtures do not prove live LLM behavior; they protect the documented review-pass contract from disappearing.
