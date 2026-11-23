# Phase 3: Verification and Handoff

Status: Pending. Priority: P2. Estimate: 2h. Depends on phases 1 and 2.

## Context

- [Plan](./plan.md)
- [Offline engine](./phase-01-offline-engine.md)
- [Playback/UI](./phase-02-playback-ui.md)

This phase verifies the trial; documentation research alone cannot establish audio quality, offline behavior, or performance on the user's machine.

## Behavioral acceptance matrix

| Case | Expected result |
| --- | --- |
| Example 1 and example 2 | Each button plays only its own English text |
| Empty/missing example | No empty synthesis request |
| Button click / keyboard activation | No card flip; controls are focusable and labelled |
| Same button during initialization/generation/playback | Cancel or stop; no delayed unexpected playback |
| Example 1 then example 2 quickly | Only the most recent request plays |
| Navigate during generation | Old result is ignored; new card stays silent until clicked |
| Flip to front, leave route, advance step | Audio stops; no stale updates or worker/audio resource leak |
| Legacy US/UK word button interleaving | Word and example speech never overlap |
| Stop old source after starting a new one | Old completion handler cannot reset new playback state |
| Asset missing/corrupt | Clear local error; learning continues; explicit retry works after repair |
| Oversized input | Clear unsupported-length error; never silently reads a truncated sentence |
| Feature disabled | No Kokoro worker/model initialization; ordinary flashcards remain usable |
| StrictMode remount | One active playback pipeline; old worker is disposed |
| Existing card progression | Viewed counts, difficult marks, completion, next/previous/dots unchanged |

## Offline verification

1. Prepare all assets and record their versions, hashes, and total disk size.
2. Use a fresh browser profile or clear relevant browser/model caches. Keep the local frontend and backend running.
3. Block all external hosts while permitting loopback. Do not use a blanket browser offline switch as the only check: it can also block localhost asset requests.
4. Load the app, open a flashcard, and play an example for the first time in that clean profile.
5. Capture request evidence: all inference assets must come from the local app; no remote model, voice, or CDN requests may be attempted.
6. Repeat against the production build served locally, including direct route refresh and MIME correctness for runtime files.
7. Temporarily make one prepared asset unavailable and confirm a local failure with no network fallback. Restore it safely afterward.
8. Re-run asset preparation and confirm existing valid files are reused.

Scope the no-external-request assertion to Kokoro example playback. Test legacy word controls separately because their existing Web Speech voices have a different provider policy.

## Listening and timing checks

Use at least ten representative English examples, including ordinary statements, questions, contractions, numbers, punctuation, and multiword vocabulary. Include ambiguous words such as `read` and `lead` in context and a long-input boundary case.

Record:

- Browser version, CPU/RAM, package/model/voice revisions, WASM settings.
- Cold model initialization and first-click-to-audio latency.
- Warm generation latency for short and longer supported examples.
- Repeat-play behavior from the bounded in-memory audio cache.
- Responsiveness while inference runs and memory behavior after leaving the step.
- Whether complete text is spoken, words are intelligible, and stress/pauses sound suitable for learning.

Do not claim universal pronunciation accuracy. Let the user hear real examples before treating the voice as accepted. No fixed latency guarantee is made before measurement.

## Build and automated checks

1. Record pre-change build/typecheck/lint status to distinguish existing failures from this feature.
2. Run `npm --prefix frontend run build` after implementation.
3. Run the installed TypeScript compiler with `--noEmit` against `frontend/tsconfig.json`; Vite build alone is not a typecheck.
4. Run `npm --prefix frontend run lint`, but report that the current ESLint configuration covers JS/JSX and does not establish TS/TSX lint coverage. Do not silently expand lint scope.
5. Add focused automated coverage for stale-result rejection, request replacement, and offline URL/configuration guards using existing tooling where practical. There is no configured frontend test runner; do not introduce a new framework without an explicit dependency decision.
6. Use browser integration checks for real worker/audio and offline behavior. If mocks or temporary harnesses are used, remove temporary files immediately after verification.
7. Perform the repository's first review pass over feature changes. If corrections are made, run the conditional second pass and repeat affected checks only.

Backend source and schema are not in this feature's scope. Run backend regression tests only if implementation unexpectedly touches that boundary or evidence warrants them.

## Documentation and affected files

Read each file fully before editing; preserve pre-existing working-tree changes.

| Action | Full path | Update after implementation |
| --- | --- | --- |
| Modify | `D:/workspace/JS/mindvocab/README.md` | Setup, one-time asset preparation, offline use, trial voice, troubleshooting |
| Modify | `D:/workspace/JS/mindvocab/HANDOFF.md` | Actual state, measured results, known limitations, next steps |
| Modify | `D:/workspace/JS/mindvocab/CHANGELOG.md` | One completed entry only after implementation is verified |
| Modify | `D:/workspace/JS/mindvocab/docs/structure.md` | New worker, hook, example component, preparation script |
| Modify | `D:/workspace/JS/mindvocab/plans/2026-09-25-kokoro-flashcard-trial/plan.md` | Phase status and links to verification evidence |

README must explain that a prepared local app/server is still required: this trial is not a PWA that runs with its localhost server shut down. Document model/license notices and the package-specific voice-path workaround if used.

## Rollback

- Disable the environment feature flag and rebuild/restart as appropriate.
- Remove feature-only dependencies and files if abandoning the trial, preserving unrelated user edits.
- Keep vocabulary and SRS data intact; there is no migration or generated database content to undo.
- Prepared assets may remain ignored on disk until explicitly removed; do not perform broad cleanup commands.

## Completion checklist

- [ ] Manual playback and cancellation acceptance matrix passes.
- [ ] Cold-cache, externally disconnected dev and production checks pass.
- [ ] Audio quality and performance evidence recorded honestly.
- [ ] Build/typecheck outcomes and existing limitations recorded.
- [ ] Applicable code review passes completed.
- [ ] Documentation reflects actual implemented behavior.
- [ ] No temporary test files, committed model binaries, or unrelated changes introduced.
