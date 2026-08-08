# Performance and production behaviour review

This checklist is the release validation baseline for ELO Trail's public
workflows and scheduled production jobs.

It is intended to detect regressions in client rendering, duplicate requests,
cache behaviour, bounded AoE4World usage, cron execution and operational data
retention. It does not replace the final release-candidate review in Batch 9I.

## Required automated checks

Run from a clean working tree with the production environment variables needed
by the build:

```bash
npm run format:check
npm run lint
npm run test
npm run build
```

The production build must complete without warnings that require action.
Record the Node.js version, npm version and commit under test:

```bash
node --version
npm --version
git rev-parse --short HEAD
```

## Browser request audit

Use the browser Network panel with caching enabled. Test a normal browser
session and then repeat the refresh and direct-link cases in a new session.

### Homepage

1. Load the homepage.
2. Confirm the homepage leaderboard is requested once.
3. Search for a known player.
4. Confirm search requests begin only after the minimum query length and
   debounce delay.
5. Select a search result.
6. Change the player-history range.
7. Select a leaderboard player.

Expected behaviour:

- no continuous polling;
- no refetch when the browser window regains focus;
- identical concurrent React Query requests are deduplicated;
- the leaderboard continues to use the cached daily snapshot;
- player-history requests remain bounded to the supported range;
- changing a displayed range does not start an unrelated profile search.

### Comparison

1. Open `/compare`.
2. Select player one and player two from search.
3. Confirm the selected search results seed the profile cache and do not cause
   immediate duplicate profile requests.
4. Confirm both history requests still run.
5. Refresh the page.
6. Open the same comparison URL in a private window.

Expected behaviour:

- manual selection avoids duplicate `/api/players/{id}` requests;
- refresh and direct-link navigation request both profiles because the
  in-memory client cache is empty;
- Current ELO and ELO difference remain correct after history loads;
- a profile value of zero does not override a valid history rating;
- only matchmaking ELO is displayed.

## Response cache audit

Inspect the response headers for representative successful and failure cases.

Expected successful cache policy:

| Route                       | Expected behaviour                                                        |
| --------------------------- | ------------------------------------------------------------------------- |
| `/api/homepage-leaderboard` | Shared cache for one hour with stale-while-revalidate                     |
| `/api/players/search`       | Short shared cache for successful searches                                |
| `/api/players/{id}`         | Short shared cache for a successful profile                               |
| `/api/players/{id}/history` | Shared cache for fresh history; no-store for stale fallback               |
| Cron routes                 | `Cache-Control: no-store`                                                 |
| Error responses             | `Cache-Control: no-store`, except the bounded snapshot-not-ready response |

Do not increase upstream refresh frequency merely to make client data appear
newer. Persistent and incremental history caching remain the source of truth
for responsible refresh behaviour.

## Cron validation

Test both scheduled routes with and without the configured `CRON_SECRET`:

```bash
curl -i http://localhost:3000/api/cron/homepage-leaderboard
curl -i http://localhost:3000/api/cron/history-cache-cleanup
```

Unauthorised requests must return `401` and `Cache-Control: no-store`.

Repeat with the bearer token:

```bash
curl -i -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/homepage-leaderboard

curl -i -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/history-cache-cleanup
```

Expected behaviour:

- the leaderboard cron refreshes one bounded daily snapshot;
- the cleanup cron removes unused history caches;
- the cleanup cron removes operational events older than 90 days;
- cleanup responses report deleted cache and operational-event counts;
- scheduled routes remain protected by the existing bearer-token check.

## Database and observability review

Confirm the private observability dashboard still reports:

- route volume, errors and duration;
- fresh cache, incremental refresh, full refresh and stale fallback outcomes;
- upstream games retrieved and games returned;
- persistent-history cache capacity;
- cron failures.

Operational-event retention is 90 days. The dashboard's longest reporting
window is 30 days, leaving a substantial reporting buffer while preventing
unbounded event-table growth.

Review the oldest retained operational event after the cleanup cron runs:

```sql
SELECT MIN("createdAt"), COUNT(*)
FROM "OperationalEvent";
```

Review cache-table capacity against the configured allowance and investigate
unexpected growth before changing retention or refresh settings.

## Rendering validation

Confirm the three public chart surfaces still behave correctly after dataset
memoisation:

- player-history timeline;
- homepage Top 10 timeline;
- two-player comparison timeline.

Verify:

- chart data updates when its input or range changes;
- leaderboard rank and legend order remain `#1` through `#10`;
- leaderboard and comparison series remain solid lines;
- tooltips map to the correct player;
- accessible chart summaries remain present;
- no page-level horizontal overflow appears.

## Batch 9G acceptance record

Batch 9G is complete when all of the following are true:

- no unnecessary duplicate compare-profile request remains during manual
  selection;
- refresh and shared-link comparison restoration remain correct;
- derived chart datasets are memoised without stale rendering;
- operational-event storage has bounded retention;
- cached leaderboard and persistent/incremental history behaviour are
  preserved;
- cron routes remain authenticated and non-cacheable;
- lint, tests and production build pass;
- the manual checks in this document pass without a release-blocking issue.
