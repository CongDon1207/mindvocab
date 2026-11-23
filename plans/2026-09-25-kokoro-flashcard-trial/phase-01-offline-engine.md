# Phase 1: Offline Engine and Assets

Status: Pending. Priority: P2. Estimate: 3h.

## Context and evidence

- [Plan](./plan.md)
- [Kokoro.js browser usage](https://github.com/hexgrad/kokoro/tree/main/kokoro.js)
- [Kokoro generation implementation](https://github.com/hexgrad/kokoro/blob/main/kokoro.js/src/kokoro.js)
- [Kokoro voice loader](https://github.com/hexgrad/kokoro/blob/main/kokoro.js/src/voices.js)
- [Transformers.js local configuration](https://huggingface.co/docs/transformers.js/custom_usage)

The documented library supports WASM in browsers. Source inspection also shows a separate voice download path. The source-level voice URL setter is not re-exported from the inspected package entry point; do not assume it is a public package API. Recheck the exact published version before implementation.

Research snapshot, 2026-09-25:

- Upstream package metadata reports `1.2.1`; the npm release artifact still needs verification. Treat this as a candidate pin, not a tested installation.
- Expected model files: `config.json`, `tokenizer.json`, `tokenizer_config.json`, and `onnx/model_quantized.onnx`. The listed q8 model is approximately 92.4 MB, plus approximately 522 kB for `voices/af_heart.bin`; runtime assets add more. [Model inventory](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/main), [ONNX inventory](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/main/onnx), [Voice inventory](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/main/voices).
- The inspected phonemizer source embeds runtime data; verify the released artifact before assuming it needs a separate eSpeak WASM download. [Phonemizer source](https://github.com/xenova/phonemizer.js/blob/main/src/phonemizer.js).
- ONNX runtime deployment must include compatible runtime modules and binaries. [Deployment reference](https://onnxruntime.ai/docs/tutorials/web/deploy.html).

## Requirements

- Use one pinned Kokoro package version and an immutable model revision.
- Start with `onnx-community/Kokoro-82M-v1.0-ONNX`, q8, and `af_heart`.
- Fetch model, tokenizer, selected voice, phonemizer/runtime support, and ONNX WASM assets from localhost during use.
- Bundle runtime JavaScript locally; remove CDN dependencies from the inference path.
- Disable remote model fallback. The separate voice loader needs its own local configuration.
- Use a worker and a single initialization promise; no model load on every click.
- Prepare runtime binaries from the actual locked dependency version, not a separately downloaded arbitrary ONNX runtime.

## Related files

All paths below are rooted at `D:/workspace/JS/mindvocab`.

| Action | Full path | Purpose |
| --- | --- | --- |
| Modify | `D:/workspace/JS/mindvocab/frontend/package.json` | Pin necessary dependency; add explicit asset preparation command |
| Modify | `D:/workspace/JS/mindvocab/frontend/package-lock.json` | Lock the verified dependency graph |
| Modify | `D:/workspace/JS/mindvocab/frontend/vite.config.ts` | Resolve local runtime assets and, if required, a narrowly scoped Kokoro compatibility transform |
| Modify | `D:/workspace/JS/mindvocab/frontend/src/vite-env.d.ts` | Type the new public environment settings |
| Modify | `D:/workspace/JS/mindvocab/frontend/.gitignore` | Exclude generated model/runtime assets and generated compatibility artifacts |
| Create | `D:/workspace/JS/mindvocab/frontend/.env.example` | Document feature flag, asset paths, voice, dtype, device, and speed |
| Create | `D:/workspace/JS/mindvocab/frontend/scripts/prepare-kokoro.mjs` | Repeatable asset provisioning and integrity validation without extra download tooling |
| Create | `D:/workspace/JS/mindvocab/frontend/src/lib/kokoro.worker.ts` | Own initialization and inference away from the UI thread |
| Generate, ignore | `D:/workspace/JS/mindvocab/frontend/public/tts/` | Local models, voice, runtime assets, and downloaded license notices |

The preparation script is justified by offline reproducibility. The worker is justified by CPU-intensive inference. Do not add a separate server or a generic speech-provider framework.

## Configuration contract

Document required values in `.env.example`, read using Vite's environment mechanism:

- `VITE_KOKORO_ENABLED`: explicit trial switch; disabled configuration does not start a worker.
- `VITE_KOKORO_MODEL_PATH`: same-origin local model directory.
- `VITE_KOKORO_VOICE_BASE_PATH`: same-origin directory containing the selected voice binary.
- `VITE_KOKORO_WASM_PATH`: same-origin runtime asset directory.
- `VITE_KOKORO_VOICE`, `VITE_KOKORO_DTYPE`, `VITE_KOKORO_DEVICE`, `VITE_KOKORO_SPEED`: trial values documented above.
- Provisioning-only settings: model/voice source and immutable revision, local destination.

Validate settings before initialization, including supported trial values, positive finite speed, and same-origin runtime asset URLs. Fail clearly rather than quietly using remote defaults. These are public build-time values; no API key is involved. Configuration changes require a development restart or production rebuild.

## Implementation steps

1. Inspect the published browser entry, exports, dependencies, voice loader, and phonemizer. Record the package version and immutable upstream revisions.
2. Confirm asset inventory with actual requests from a minimal worker smoke test. Record filenames, byte sizes, hashes, and licenses in the provisioning logic/documentation.
3. Use public local voice configuration if the pinned published version genuinely exposes it.
4. Otherwise implement one narrowly scoped, reproducible compatibility adjustment for that exact package's voice URL. Prefer a generated browser module resolved by Vite, or a package-specific build transform proven to cover both dev optimization and production worker bundling. Select one mechanism after the spike; do not ship two.
5. Guard the workaround using the expected version and source literal match count; fail if the dependency changes. Obtain the replacement path from validated environment configuration. Do not mutate `node_modules` manually, intercept global fetch, subclass inference internals, or copy the whole engine into authored application code.
6. If a workaround needs an extra file, keep it narrowly scoped and document its necessity. Generated third-party bundles are ignored build artifacts, not authored source.
7. Implement idempotent preparation: reuse verified files, download to temporary paths, validate before replacement, and remove temporary files on failure. Large assets must not be committed to Git. No Internet access should be required by an ordinary build once assets are prepared.
8. Configure the actual Transformers environment used by Kokoro, allowing local models and disabling remote models. If its full settings are not publicly re-exported, use a compatible direct dependency and verify a single resolved Transformers instance.
9. Set the exact WASM asset location. Begin with one WASM thread to avoid requiring cross-origin isolation headers; measure before considering threaded execution.
10. Verify phonemizer initialization in the worker and identify any additional files it loads. Do not assume setting ONNX paths covers those files.
11. Generate a short example and transfer PCM data plus sample rate from the worker to the main thread. Do not try to post library class instances.
12. Verify longer input handling: upstream generation can truncate tokens. Detect oversized input before truncation, using the pinned tokenizer/model limits and an inspected public route or a narrowly scoped guard. For this trial, display a clear unsupported-length error instead of speaking an incomplete example. If detection cannot be implemented cleanly, report this as a failed feasibility gate.
13. Test in Vite dev and built production assets using a clean browser profile/cache while blocking all non-loopback network traffic.

## Worker contract

- Request: `synthesize` with request ID and exact English text; optionally an invalidation message for queued work.
- Responses: initialization progress, PCM result with sample rate, or a structured error; always associate results with a request ID.
- Serialize inference. Keep only the latest pending request and skip superseded queued work.
- Do not claim active inference can be interrupted unless the pinned runtime proves it. The UI must discard stale results; worker termination on unmount releases resources.
- Avoid allocating multiple model instances under React StrictMode.

## Success criteria and risks

- [ ] Repeated preparation is safe and does not redownload valid assets.
- [ ] Clean-cache playback succeeds without external traffic in dev and production.
- [ ] Browser shows no request to a remote voice host, CDN, or model host.
- [ ] Missing assets fail locally with a useful error.
- [ ] The worker works on target Windows Chrome/Edge using WASM.
- [ ] Exact disk size and first-generation time are measured; no unverified performance promise.
- [ ] Oversized input cannot silently truncate.

If local loading cannot be made reliable with a small maintained adjustment, report the specific blocker before UI integration. A backend TTS service would be a separate architecture decision, not an automatic fallback.

Next: proceed to phase 2 only after the offline engine gate passes.
