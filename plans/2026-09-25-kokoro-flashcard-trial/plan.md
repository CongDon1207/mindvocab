---
title: "Local Kokoro speech for flashcard examples"
description: "Add manually triggered English example playback with local Kokoro inference."
status: cancelled
priority: P2
effort: 8h
branch: main
tags: [feature, frontend, experimental]
created: 2026-09-25
---

# Local Kokoro Flashcard Trial

**Superseded on 2026-09-25:** The user rejected model/audio storage overhead and selected built-in local Web Speech voices. Use [the replacement plan](../2026-09-25-local-speech-flashcards/plan.md). This document and its phase files are historical proposals, not implementation instructions.

## Confirmed scope

- The user selected **manual playback for each English example only**.
- Add a listen/stop button to each nonempty `ex1.en` and `ex2.en`.
- No autoplay, autoplay toggle, Vietnamese speech, voice picker, or speed picker.
- Proposed trial voice: American English `af_heart`; synthesis speed 1.0.
- Run Kokoro in a browser worker, initially using WASM and q8 weights.
- Prepare assets once with Internet access, or copy a prepared asset pack.
- During use, example text and synthesis stay on this machine. Localhost static-file requests are allowed; external TTS requests are not.
- Existing word US/UK controls remain Web Speech controls; this trial's offline guarantee covers the new example playback, not those legacy voices.
- This deliverable is a plan. No dependencies, models, or application changes have been installed.

## Existing implementation

- `FlashcardStep.tsx` uses Web Speech for `currentWord.word`; examples only render text.
- The card root flips on click, so audio controls must stop event propagation.
- Previous/next/dot navigation and leaving the flashcard step must invalidate pending speech.
- `FlashcardStep.tsx` is already 316 lines. Extract the example section before extending it; keep authored files below 300 lines.
- React StrictMode is enabled. Effects and cleanup must tolerate setup/cleanup repetition.
- No frontend test runner is configured. The build does not run TypeScript checking, and ESLint currently targets JS/JSX rather than TS/TSX.
- The working tree already contains unrelated edits. Preserve them and review only this feature's changes.

## Architecture decision

Use `kokoro-js` inside one lazily created worker per mounted flashcard step. A React hook owns playback, request identity, cleanup, and a bounded cache of the current card's audio. Reuse the existing UI button.

**Feasibility gate:** upstream voice loading has a remote default that local model configuration alone does not disable. Phase 1 must prove local model, tokenizer, voice, and runtime loading in both development and production. No cloud fallback or architecture switch is implicit.

## Phases

| Phase | Deliverable | Estimate | Status |
| --- | --- | --- | --- |
| [1. Offline engine and assets](./phase-01-offline-engine.md) | Reproducible local setup and cold-cache offline proof | 3h | Pending |
| [2. Playback and flashcard controls](./phase-02-playback-ui.md) | Per-example listen/stop with race-safe lifecycle | 3h | Pending |
| [3. Verification and handoff](./phase-03-validation.md) | Behavioral, audio, offline, and build evidence | 2h | Pending |

Estimates are engineering estimates, excluding downloads and unexpected package compatibility work.

## Acceptance criteria

1. Each available English example can be played independently after a click.
2. Clicking playback never flips the card; no speech starts automatically.
3. Stop, navigation, flipping to the front, and leaving the step prevent stale speech.
4. At most one example or legacy word utterance plays at a time.
5. With prepared assets and a clean browser cache, example playback works while external traffic is blocked.
6. Missing/corrupt assets produce a recoverable error, never a remote fallback.
7. Long input is never silently truncated; unsupported input is clearly reported in the trial.
8. SRS, card completion, imports, and stored vocabulary are unchanged.
9. Actual pronunciation and timings are recorded on the user's target machine; naturalness is not assumed from documentation.

## Implementation boundaries

- No database migration, new backend endpoint, Python server, or persistent audio storage.
- No WebGPU path in the first trial; add it only if measured performance justifies a follow-up.
- New runtime dependencies are limited to Kokoro and any direct runtime configuration dependency proven necessary in phase 1.
- Configuration belongs in environment variables and a committed `.env.example`; no secrets are needed.

## Open validation items

- Exact released package compatibility and a maintainable local voice-loading mechanism.
- Cold initialization, warm generation time, total asset size, and memory on the target machine.
- Listening acceptance for the proposed `af_heart` voice.
