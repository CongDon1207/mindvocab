---
title: "Lightweight local speech for flashcard examples"
description: "Read English examples on click using installed local voices with minimal application overhead."
status: completed
priority: P2
effort: 3h
branch: main
tags: [feature, frontend]
created: 2026-09-25
---

# Local Web Speech Flashcard Plan

## Accepted direction

The user wants low-latency, lightweight, offline English example playback. They selected a separate listen button for each example and rejected Kokoro and stored audio. This plan replaces [the cancelled Kokoro trial](../2026-09-25-kokoro-flashcard-trial/plan.md).

- Use browser `speechSynthesis` with an installed English voice reporting `localService === true`.
- Speak only after a button click. No autoplay or automatic warm-up utterances.
- Each `ex1.en` and `ex2.en` gets an independent listen/stop control.
- Reuse the current US/UK word controls through the same speech hook; enforce local-only selection consistently. If a requested accent is unavailable locally, explain that instead of substituting a different accent under its label.
- No new npm package, AI model, worker, generated audio file, persistent audio cache, backend endpoint, or database change.
- Windows may need a one-time English speech voice installation if none is exposed to the browser. The app must not download or install it automatically.

## Current code findings

- `frontend/src/components/session/FlashcardStep.tsx` is 316 lines, already above the repository limit. Its `handleSpeak` reads only `currentWord.word` and prefers Google-named voices without checking local service status.
- Example rendering has no speech control. The card container flips on click; button events must not bubble.
- Navigation includes previous/next and index dots; all need immediate speech cancellation.
- React StrictMode is enabled. Clean up listeners and speech on unmount without stale state updates.
- No frontend test runner exists; Vite build alone does not typecheck and current ESLint targets JS/JSX.
- Existing working-tree modifications belong to other work and must be preserved.

## Design

`Listen button -> shared local speech hook -> explicit installed voice -> operating-system speech output`

Discover voice metadata when the flashcard step mounts and refresh on `voiceschanged`. Keep one current utterance reference and request identity. Speak directly from the click handler once a suitable local voice exists. Cancel the previous utterance before starting another; do not build an audio queue.

## Phases

| Phase | Deliverable | Estimate | Status |
| --- | --- | --- | --- |
| [1. Local speech and controls](./phase-01-implementation.md) | Voice selection, shared playback lifecycle, example buttons | 2h | Completed |
| [2. Verification and documentation](./phase-02-validation.md) | Build and documentation completed; audible checks belong to the user | 1h | User check pending |

Estimates describe implementation effort, not playback latency, and exclude troubleshooting missing system voices.

## Acceptance criteria

1. Clicking an example reads its complete EN content, never its VI translation.
2. Only explicitly selected local English voices are used; no automatic remote fallback.
3. Clicking again stops; selecting another example replaces speech immediately.
4. Changing cards, flipping away, or leaving the step stops speech and clears queued work.
5. Word and example speech do not overlap; stale end/error events cannot reset newer playback.
6. No installed voice, unsupported browser, and synthesis errors produce clear recoverable feedback.
7. Real example playback works with Internet disconnected and localhost still available.
8. No new large assets, persistent audio storage, or runtime dependencies are introduced.
9. Measure first and subsequent click-to-start behavior on the target machine; do not promise zero latency.
10. Card progress, difficult marks, SRS, imports, and data remain unchanged.

## Remaining verification

- Which local English voices Chrome/Edge actually expose on the user's Windows installation.
- Their pronunciation quality, cold-start delay, and complete playback of representative long examples.
- Exact baseline build/typecheck failures, if any, before implementation.

Implementation completed on 2026-09-25 with a shared local-voice hook and per-example controls. Frontend build passed. The user chose to perform audible feature checks personally; the repository-wide TypeScript check still reports unrelated errors. Optional environment settings and extra browser test tooling were omitted to keep the change small.
