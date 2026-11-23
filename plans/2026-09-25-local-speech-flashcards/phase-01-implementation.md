# Phase 1: Local Speech and Example Controls

Status: Pending. Estimate: 2h. Depends on the accepted [plan](./plan.md).

## Evidence and constraints

- [MDN localService](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService): distinguishes local and remote voice services.
- [MDN voiceschanged](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event): voice inventory may change after initial discovery.
- [MDN cancel](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/cancel): cancels current speech and clears the synthesis queue.

The browser API delegates speech to a provider. Selecting a local voice reduces application overhead but does not guarantee zero CPU use or instantaneous startup. Verify audible behavior offline, not just absence of page fetch requests.

## File changes and justification

Read each file fully before editing, including files created by other ongoing work.

| Action | Full path | Purpose |
| --- | --- | --- |
| Modify | `D:/workspace/JS/mindvocab/frontend/src/components/session/FlashcardStep.tsx` | Replace inline word speech with shared hook; integrate examples and cancellation |
| Create | `D:/workspace/JS/mindvocab/frontend/src/hooks/useLocalSpeech.ts` | Centralize local voice discovery, one active utterance, errors, and cleanup |
| Create | `D:/workspace/JS/mindvocab/frontend/src/components/session/FlashcardExamples.tsx` | Extract current example section and add per-example controls |
| Create | `D:/workspace/JS/mindvocab/frontend/.env.example` | Document optional preferred example locale and speech rate |
| Modify | `D:/workspace/JS/mindvocab/frontend/src/vite-env.d.ts` | Type optional environment settings |

The hook avoids duplicating word/example playback and prevents competing queues. The example component extraction brings the existing 316-line flashcard file below 300 lines. These are the only proposed new application modules. Reuse existing `Button`, Lucide icons, panels, and notifications; keep every authored file below 300 lines.

## Voice selection rules

1. Guard availability of both `window.speechSynthesis` and `SpeechSynthesisUtterance`.
2. On mount, register a `voiceschanged` listener and read `getVoices()` immediately; remove only this listener during cleanup.
3. Normalize locale case and underscores. Eligible voices must have `localService === true` and an English language tag (`en` or `en-*`). Do not identify locality by vendor or voice name.
4. For example speech, prefer a matching optional locale setting, then an eligible default voice, then a stable ordering of the other eligible English voices. Use the selected voice's actual `lang` on the utterance. A locale preference is not an accent guarantee; there is no US/UK label on example buttons.
5. For the existing US/UK word buttons, require an eligible exact `en-US` or `en-GB` match. If missing, show the appropriate missing-local-accent message. Never read with another accent under the wrong label.
6. Assign `utterance.voice` explicitly before `speak()`. If no valid voice exists, do not call `speak()` with an unset voice, since that can choose an uncontrolled default.
7. Re-read the inventory on a user click before resolving a missing/stale selection. Keep the metadata update event-driven; no continuous polling.
8. If the initial inventory is empty, present `Voice not available yet` with retry/setup guidance and continue listening for `voiceschanged`. Do not wait indefinitely in a spinner or auto-play an earlier click when voices appear later. The user clicks again once a voice becomes available.
9. If inventory changes while speaking, do not restart speech. Re-evaluate the voice on the next explicit click.

## Configuration

- `VITE_SPEECH_LOCALE`: optional preferred example locale; `.env.example` suggests `en-US`. Without it, use the eligible local default English voice, then a stable eligible English choice.
- `VITE_SPEECH_RATE`: optional positive rate within the browser API's documented range; `.env.example` suggests `0.9`, matching current word playback. Without it, retain the browser's native utterance rate. Validate invalid values and document the native-default fallback.
- No voice display name is hardcoded. The same configured rate applies to words and examples; no settings UI or persistence is added.
- Public settings use Vite environment variables. No API key, account, or secret is required.

## Speech lifecycle

Hook contract: availability/status, active item ID, error, `speak({ id, text, locale? })`, and `stop()`. Keep utterances in a ref until completion. A stable item ID includes card ID plus `ex1`, `ex2`, `word-us`, or `word-uk`.

1. Speak directly from a user gesture after local voice selection. Avoid artificial delays, silent warm-up speech, fetches, or background synthesis.
2. If the same item is active or starting, a second click stops it rather than adding it to a queue.
3. For replacement, increment request identity before calling `cancel()` so cancellation callbacks from the old utterance are already stale. Create one new utterance and call `speak()` once.
4. Track `starting` separately from `speaking`; `onstart` indicates that the engine began speech. Permit stopping in either state.
5. Guard `onstart`, `onend`, and `onerror` with request identity and mounted state. An intentional cancel/interruption is not a user-facing failure.
6. On genuine errors, clear active state and show a short recoverable message; never retry automatically or change to an online voice.
7. Stop synchronously in previous/next/dot and flip handlers before changing the card. Also stop when the underlying current word changes independently, and on unmount.
8. Route both word buttons and example buttons through this single hook. `speechSynthesis.cancel()` affects the document's speech queue; the current app has only this speech integration. Revisit ownership if additional speech consumers are added later.
9. Keep cleanup idempotent under StrictMode. Remove event listeners, invalidate identity, cancel owned speech, and release the utterance ref without scheduling unmounted state updates.

## UI behavior

| State/action | Behavior |
| --- | --- |
| Nonempty example | Show its EN/VI text as before and a small listen button next to EN |
| Whitespace-only or missing EN | No speech request or listen control |
| Starting | Show short preparation feedback and allow stop |
| Speaking | Replace listen icon with stop; expose an accessible label |
| Finished/stopped | Return to idle |
| Missing voice/API | Show a short explanatory message and retry/setup guidance; keep learning usable |
| Click any speech/retry control | Stop event propagation so the card does not flip |

Use English for all newly authored labels, errors, accessibility text, and comments under repository rules. Preserve current translations and example content. Keep controls keyboard-operable with visible focus and concise live status announcements. Do not add an autoplay control, voice picker, or speed slider.

## Implementation order

- [ ] Record baseline checks and read target files fully.
- [ ] Extract examples section and implement the shared hook.
- [ ] Route existing word buttons through explicit local selection.
- [ ] Wire example listen/stop and all navigation cleanup paths.
- [ ] Add optional environment documentation and types.
- [ ] Confirm no app-generated audio storage or dependencies were introduced.
- [ ] Check file lengths and review the focused diff.

Next: complete the [validation matrix](./phase-02-validation.md) before declaring offline or latency acceptance.
