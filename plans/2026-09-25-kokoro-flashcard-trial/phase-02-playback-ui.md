# Phase 2: Playback and Flashcard Controls

Status: Pending. Priority: P2. Estimate: 3h. Depends on phase 1.

## Context

- [Plan](./plan.md)
- [Offline engine](./phase-01-offline-engine.md)
- [Web Audio user-gesture guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

The user explicitly selected manual per-example buttons. No automatic playback or autoplay setting belongs in this implementation.

## User-visible behavior

| Event | Expected behavior |
| --- | --- |
| Open or flip a flashcard | Show examples; do not speak or initialize the model automatically |
| Click an example's listen button | Prepare the engine if needed, generate that exact English example, and play it |
| Initialization or synthesis in progress | Show a short status; keep card navigation responsive and allow cancel |
| Click the same active button again | Cancel pending playback or stop current audio |
| Click the other example | Stop the previous example; only the latest request may play |
| Audio finishes | Return the button to its idle state |
| Previous/next/dot navigation | Immediately stop audio and invalidate pending results |
| Flip to the front or leave the step | Stop audio and prevent any pending result from playing |
| Missing English example | Render no listen button for that example |
| Engine or asset failure | Explain the problem with a retry action; vocabulary remains usable |

Reuse the existing rounded example panels, typography, `Button`, and Lucide volume icon. A playing button becomes a stop control. Keep status compact so the fixed-height back face still scrolls correctly. Authored labels, accessibility text, errors, and comments must be English under repository rules, for example `Listen to example 1`, `Stop`, `Preparing voice`, and `Try again`.

## Related files

| Action | Full path | Responsibility |
| --- | --- | --- |
| Modify | `D:/workspace/JS/mindvocab/frontend/src/components/session/FlashcardStep.tsx` | Integrate playback lifecycle and extract the example section |
| Create | `D:/workspace/JS/mindvocab/frontend/src/components/session/FlashcardExamples.tsx` | Render existing example content and independent audio controls |
| Create | `D:/workspace/JS/mindvocab/frontend/src/hooks/useExampleSpeech.ts` | Own worker lifecycle, request identity, Web Audio, state, and cleanup |
| Modify | `D:/workspace/JS/mindvocab/frontend/src/lib/kokoro.worker.ts` | Complete request serialization, errors, and PCM result handling |

The component extraction is required because the existing flashcard file is 316 lines. Extract the complete example section and rendering helper; target less than 300 lines after integrating the hook. Avoid a broader card redesign. The hook separates asynchronous playback from presentation and makes cleanup independently understandable.

## Playback architecture

`Example button -> playback hook -> Kokoro worker -> PCM + sample rate -> Web Audio -> speakers`

- State: idle, initializing, generating, playing, or error; include active example identity.
- Create/resume AudioContext inside the click handler before awaiting model loading, to satisfy browser audio policies.
- Own one playback source at a time; stop and disconnect it before replacement.
- Reuse the model while the flashcard step remains mounted. Terminate the worker and close audio resources when leaving it.
- Maintain a monotonic request ID and card identity. Check both before applying progress, errors, audio results, and playback completion callbacks.
- Keep at most the current card's two PCM results in memory, keyed by exact text, voice, model revision, and speed. Clear on card change or configuration change; no IndexedDB/audio files.
- Navigation cancels playback immediately; in-flight computation may finish in the worker, but its output cannot play. Drop obsolete queued requests.
- On worker failure, clear a rejected initialization state so explicit retry can create a fresh worker. No automatic retry loop.
- Coordinate with legacy word playback: starting an example cancels `speechSynthesis`; starting a US/UK word stops and invalidates example playback.
- On card changes and unmount, cancel owned legacy word speech as well to prevent overlap.

## Implementation sequence

1. Extract the current examples section into `FlashcardExamples.tsx` without changing existing text, translation display, or inferred-source badge behavior.
2. Implement the hook with lazy initialization, explicit state transitions, latest-request checks, and cleanup.
3. Connect worker output to Web Audio using the returned sample rate rather than a browser-default assumption.
4. Implement same-button stop and cross-example replacement. Stale results and stale `onended` handlers must not change the new request's state.
5. Wire all navigation routes, flip-to-front, and unmount to stop/invalidate. Do not rely solely on asynchronous React effects for immediate stop.
6. Prevent click propagation on listen, stop, and retry controls so they do not flip the card.
7. Add descriptive accessible labels, keyboard activation, visible focus, and a polite live status region. Do not announce synthetic percentage progress when total bytes are unknown.
8. Handle playback permission failure by returning a clear retry/play action. Reset error state only through a current request or explicit retry.
9. Apply the feature flag: disabled or invalid configuration must not instantiate Kokoro or alter normal learning flow.
10. Verify every changed/new authored source file remains below 300 lines.

## Success criteria

- [ ] Only a user click starts speech.
- [ ] Exact EN text is read; VI translations are not sent to Kokoro.
- [ ] Clicking controls never triggers a card flip.
- [ ] No overlapping audio or speech from a previous card.
- [ ] Rapid clicks and navigation during cold initialization behave correctly.
- [ ] Audio errors do not affect viewed-card counts or session completion.
- [ ] Worker/model initialization is not duplicated under StrictMode.
- [ ] Keyboard and compact viewport behavior remain usable.

## Risks and constraints

- Cold startup may take noticeable time; communicate state and keep navigation usable.
- WASM inference speed depends on hardware; report measurements before adding an optimization path.
- Legacy word voices may be remote. Preserve that existing feature's scope; never use it as an automatic fallback for failed example synthesis.
- No microphone permission, audio upload, database write, or external speech request is needed.

Next: run the validation matrix and document measured results in phase 3.
