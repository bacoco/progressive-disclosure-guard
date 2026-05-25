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
- coverage receipt;
- grounding receipt;
- regression receipt;
- stale-removal receipt;
- preserved human overrides.

If a chatbot over documentation is requested, it must consume PDD artifacts or
APIs when available.
It must not create a parallel scanner, indexer, source map, review contract, or
documentation engine inside PDG or the chatbot repo.

If PDD is not available, PDG may still require:

- source-of-truth identification;
- explicit NOT VERIFIED markers;
- no claims of durable coverage without evidence.
