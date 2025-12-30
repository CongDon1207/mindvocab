# Changelog

## [2025-12-30]
- **Fix**: Initial Progress bug for imported words. Newly imported words (with `lastSeenAt: null`) are no longer counted as mastered at the start.
- **Fix**: Progress Synchronization across Home and Folder pages. Replaced hardcoded zeros with real-time mastered word counts.
- **Fix**: Quiz Generation logic (`questionGenerator.js`). Implemented global fallback for distractors to support small folders.
- **Fix**: Session Creation logic. Now always fills up to 10 words (if available) by combining SRS-due, New, and Oldest words.
- **Add**: Batch Progress Logic. Progress (Mastered/Learned) is now only updated upon full session completion in increments of 10.
- **Add**: Card-style SessionHeader UI with dedicated counters for "Total Words" and "Learned Words".
- **Add**: Dual Audio (US/UK) support in `FlashcardStep.tsx`.
- **Add**: Spaced Repetition System (SRS) logic integration.
- **Security**: Added `.env` to `.gitignore`.
