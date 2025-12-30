# WORKING CONVENTIONS (AGENTS) - mindvocab

## 1) Language
- Mandatory: all responses, change descriptions, code comments, etc. must be written in Vietnamese.

## 2) Core principles (non-negotiable)
- Clarify ambiguity first: if the request is unclear or missing information, ask at most 1–2 questions before starting; do not guess.
- Stay within scope: only implement what the ticket/PRD/user context explicitly requires; do not add features.
- Minimal changes: prefer small, idempotent patches; avoid large refactors unless strictly necessary.
- Reuse before rewriting: prefer existing modules/utilities; avoid duplication.
- File length limit: keep each file under 300 LOC; if it exceeds, stop and propose splitting the file.
- Config/secrets: read only from environment variables; never hardcode.
- Clean up: remove any temporary debug/test files immediately after finishing.

## 3) File-reading rules (mandatory)
- Before editing/creating files: read all relevant files in full to understand context.
- Before starting a new task: read at minimum `README.md`, `HANDOFF.md`, `CHANGELOG.md`, stucture.json, and any relevant files in `docs/*`.

## 4) Skills: discover and load dynamically from `.claude/skills`
Goal: do not hardcode the skills list in AGENTS.md; always reference dynamically from the repository.

- Skills source: `.claude/skills/**/SKILL.md`.
- Convention: each skill is a folder containing `SKILL.md` that starts with a YAML frontmatter including `name` and `description`.
- Activation rules:
  - If the user calls a skill by name (e.g., “use skill `ui-styling`”), you must load that skill.
  - If the described work clearly matches the `description` of one or more skills, proactively select the minimum necessary skill(s) and load them.
  - If multiple skills fit, choose the smallest set that covers the request; if still ambiguous, ask 1 question to confirm.
- How to load a skill:
  - Open the exact file `.claude/skills/<skill-name>/SKILL.md` and follow the workflow inside (read only what is needed to execute).
  - If the skill points to `references/` or `scripts/`, open only the needed files; prefer running/patching existing scripts over writing new ones.
- Fallback:
  - If the skill cannot be found in `.claude/skills`, state it clearly and proceed with the normal (minimal) approach.

## 5) Tooling priority (concise)
- Code edits/local repo: file operations + shell commands.
- API signatures/version changes: prefer official documentation (Context7 if available).
- Real-time info/news: use Web Search.
- Web UI automation (when needed): use `chrome-devtools-MCP`.

## 6) Response format (every answer)
- Requirement: quote 1–2 lines of the user’s request (verbatim).
- Plan: 2–3 steps you will take.
- Changes: list modified files as `path:line` plus a minimal-change description.
- Test: commands to run + pass criteria; state whether a service restart is needed and why.
- Result: summarize changes + root cause (if a bug) + final status.

## 7) Command execution discipline
- Run only necessary commands; avoid destructive commands (`rm`, `git reset`, …) unless the user explicitly requests.
- Every command must have a timeout: default 60s; if it may hang/stream long, cap at 70–80s and stop if exceeded.
- If you hit permission/resource errors: explain clearly and propose a safe manual step.
- Do not add new dependencies unless truly necessary and the user has agreed.

## 8) Auto-Docs (project state memory)
After completing an “impactful” change (feature/bugfix/contract/schema/architecture change), update briefly:

- `README.md`: stable information (stack/versions/overview) if affected.
- `HANDOFF.md`: current status + next steps + latest test results.
- `CHANGELOG.md`: add one line in the format:
  - `YYYY-MM-DD: <Fix|Add|Change|Remove> <what> at <path/module> - <impact/reason> (completed).`
