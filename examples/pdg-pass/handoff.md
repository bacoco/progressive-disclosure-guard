# Example PDG Pass For A Handoff

## Known Knowns

- The existing `/api/search` route must keep returning summaries for list views.
- The detail endpoint is `/api/search/:id`.
- Current tests cover route status codes but not the full user workflow.

## Known Unknowns

- The owner has not decided whether the new filter is visible by default.
- The plan must defer default visibility until the owner decides.

## Unknown Knowns

- "Wire the new filter" could be misread as creating a second search store.
- "Clean up results" could be misread as changing response shape.

## Unknown Unknowns

- A low-context implementer might fetch full result details in the list endpoint and slow down every search.

## Bad Implementation Path

The developer adds a parallel search client, loads all details in the list endpoint, and updates only a component test.

## Guardrail Added

- `MUST preserve /api/search as a summary endpoint.`
- `MUST fetch details only through /api/search/:id after explicit user selection.`
- `MUST NOT create a parallel search store, client, route family, or response contract.`

## Existing Behavior That Must Be Preserved

- Search page loads with summary results.
- Detail payload is fetched only after the user opens a result.
- Existing filters and URL params keep working.

## Forbidden Implementation Shortcuts

- Do not replace the existing search store.
- Do not load full document payloads in the list endpoint.
- Do not mark isolated helper tests as workflow verification.

## Regression Proof Required

Run the existing search route tests and one browser workflow that searches, opens a result, returns to the list, and keeps the selected filters.
