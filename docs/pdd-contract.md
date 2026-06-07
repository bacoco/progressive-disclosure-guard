# PDD Contract

PDG is the guardrail.
PDD is the documentation engine or external documentation contract.

PDG must not import, vendor, duplicate, or reimplement PDD runtime behavior unless
explicitly decided later.

When PDD is available, PDG routes durable documentation work to PDD.

Durable documentation includes:

- docs meant to survive beyond the current chat/session;
- API documentation;
- specs;
- architecture docs;
- generated docs;
- chatbot documentation sources;
- knowledge-base material;
- docs that must stay synchronized with code.

PDD receipts may include:

- source inventory;
- source map;
- manifest;
- disclosure contract;
- coverage receipt;
- grounding receipt;
- regression receipt;
- stale-removal receipt;
- preserved human overrides.

Generated docs are a disclosure surface, not the source of truth. Treat
generated docs as orientation, then verify claims against PDD artifacts before
answering.

If a chatbot or investigative retrieval layer over documentation is requested,
it must consume PDD artifacts or APIs when available. It must inspect
`disclosure.json`, `source-map.json`, `inventory.json`, review receipts,
overrides, stale removals, and original source evidence before presenting an
evidence-backed answer.

When evidence is missing, stale, contradictory, or unmapped, the consumer must
return an answerability state instead of forcing a final answer.

It must not create a parallel scanner, indexer, source map, review contract, or
documentation engine inside PDG or the consumer repo.

If PDD is not available, PDG may still require:

- source-of-truth identification;
- explicit NOT VERIFIED markers;
- no claims of durable coverage without evidence.
