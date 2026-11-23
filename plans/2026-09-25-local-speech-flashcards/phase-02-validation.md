# Phase 2: Verification and Documentation

Status: Pending. Estimate: 1h. Depends on [implementation](./phase-01-implementation.md).

## Functional checks

| Scenario | Required result |
| --- | --- |
| Click each English example | Only its full English content is spoken |
| Click listen / keyboard activate | No unintended card flip |
| Click active item again | Speech and queued work stop |
| Switch examples rapidly | Latest selection wins; no overlap or old state reset |
| Click example then word US/UK, and reverse | Single coherent speech lifecycle |
| Navigate with previous/next/dots while starting or speaking | Immediate cancel; next card remains silent |
| Flip away or leave the flashcard step | No continuing utterance or delayed speech |
| Initial empty voice list, later voiceschanged | Controls recover; earlier clicks do not auto-play |
| No local English voice / remote voices only | No speech; installation guidance, never online fallback |
| Local US voice only, click UK word | Clear missing-UK message; no misleading accent substitution |
| Unsupported browser | Useful feedback; cards and session progression remain usable |
| Synthesis error then retry | Recoverable state, no automatic retries |
| Cancellation fires old error/end callbacks | New utterance state is unaffected |
| StrictMode mount/cleanup | No duplicate listeners, queued speech, or stale state updates |
| Long example with punctuation | Complete audible output; no silent truncation or indefinite stuck UI |

Keep long-text handling evidence-driven. If the target engine cannot complete real examples, record the exact failure and propose a minimal follow-up; do not introduce chunk queues or timer-based pause/resume workarounds preemptively.

## Offline and voice verification

1. Record browser/Windows version and the selected voice's name, locale, and `localService` flag. Installed Windows voices are not necessarily all exposed to every browser.
2. Use Windows Chrome and Edge on the target machine as the initial support matrix.
3. Disconnect external Internet access while preserving localhost availability. Page request logging alone is insufficient because an operating-system speech provider can make requests outside the page.
4. Reload the locally running app and read previously unspoken examples after a fresh browser start. Confirm the chosen voice is explicitly local.
5. Test all flashcard speech controls covered by the plan, including available word accents.
6. Verify missing-voice feedback using a controlled test stub rather than uninstalling the user's system voice packs.
7. If no appropriate voice exists, provide current official Windows speech-voice installation instructions and explain how to reopen the browser and retry. Do not install system components without a separate user request.

## Latency and resource checks

The objective is low click-to-audio delay with minimal app-managed resources, not a zero-latency or zero-memory guarantee.

- Measure the first click after browser startup and at least ten subsequent clicks across typical short and longer examples.
- Record click-to-`onstart` with a monotonic browser timer during validation; distinguish this engine event from the exact audible onset. Confirm perceived onset by listening.
- Record the observed range and median rather than inventing a universal threshold. Compare against the existing word-reading path on the same browser and voice where meaningful.
- Confirm there is no application download, audio-generation server call, artificial timer delay, or speech queue backlog between click and `speak()`.
- Observe responsiveness and memory while navigating repeatedly; verify utterance references and listeners do not accumulate.
- Confirm no new model files, audio files, IndexedDB audio cache, worker, or runtime dependency was added.
- Assess intelligibility and full-sentence pronunciation with contractions, questions, numbers, and ambiguous words in context. User listening feedback determines whether the installed voice is acceptable.

## Build and regression checks

1. Record pre-change frontend build/typecheck/lint results before implementation.
2. Run `npm --prefix frontend run build` after the changes.
3. Run the installed TypeScript compiler against `frontend/tsconfig.json` with `--noEmit`; Vite build is not sufficient for type safety.
4. Run existing lint, noting that its current JS/JSX scope does not prove TS/TSX lint coverage. Avoid unrelated lint reconfiguration.
5. Test stale callbacks, local-only filtering, and delayed voice availability with focused existing tooling or a temporary browser harness. Do not add a new test framework for this small integration. Delete temporary harness files after use.
6. Run real browser speech checks in development and the local production build; mocks cannot establish audible or offline success.
7. Verify card progress, difficult marks, completion callbacks, and session navigation remain unchanged.
8. Review the feature diff according to dual-pass-review: first pass mandatory, second pass only after corrections. Repeat only affected checks when code changes.

No backend source or schema changes are planned, so backend tests are unnecessary unless implementation crosses that boundary.

## Documentation after implementation

Read files fully before editing and preserve existing uncommitted work.

| Full path | Required update |
| --- | --- |
| `D:/workspace/JS/mindvocab/README.md` | Local voice prerequisite, per-example playback, optional env settings, missing-voice troubleshooting |
| `D:/workspace/JS/mindvocab/HANDOFF.md` | Implemented behavior, measured latency, tested browser/voice, remaining limitations |
| `D:/workspace/JS/mindvocab/CHANGELOG.md` | One dated completed entry only after verification |
| `D:/workspace/JS/mindvocab/docs/structure.md` | New shared hook and example component |
| `D:/workspace/JS/mindvocab/plans/2026-09-25-local-speech-flashcards/plan.md` | Phase status and actual acceptance results |

## Rollback and completion

- Roll back only feature-specific changes if necessary; preserve unrelated changes and learning data.
- No database rollback, downloaded model cleanup, or audio-cache migration is needed.
- All authored changed files must remain below 300 lines; avoid broad refactoring.
- Report actual successful checks and any baseline failures separately.
- This plan does not authorize a claim that speech is already implemented or tested.

Open checks: installed voice availability, actual onset delay, pronunciation quality, and long-example reliability on the user's browser.
