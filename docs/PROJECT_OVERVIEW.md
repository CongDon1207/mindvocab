# Project Overview

MindVocab is a local React and Express application for vocabulary practice. SQLite stores document-style application data through Node's built-in `node:sqlite` module.

Vocabulary has a strict learning format: word, Vietnamese meaning, part of speech, optional IPA/note, two bilingual flashcard examples, and a dedicated English Fill Blank sentence. SRS sessions update review scheduling; sequential and retry sessions do not.

Imports accept either a first-sheet `.xlsx` workbook or a pasted Markdown table. Both require the same ten headers and show validation before data is saved. ChatGPT is opened only as an external browser tab after the app copies a prompt; no AI API is used.

The backend exposes routes for folders, words, sessions, attempts, import jobs, and notebook entries. The import job saves valid records transactionally and supports skip, fill-missing, or overwrite duplicate policies. Overwrite preserves the vocabulary ID and SRS metadata.

On the first schema-v2 startup, an existing SQLite database is backed up under the database directory and legacy app data is cleared once. This ensures every session has the fields needed by the new content model.
