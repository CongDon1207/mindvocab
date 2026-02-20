import NotebookEntry from '../model/NotebookEntry.js';
import xlsx from 'xlsx';
import fs from 'fs';

// SRS Intervals
const SRS_INTERVALS = [0, 3, 7, 14, 30, 90];

export const getNotebookEntries = async (req, res, next) => {
    try {
        const { due } = req.query;
        const filter = {};
        if (due === 'true') {
            filter['meta.nextReviewDate'] = { $lte: new Date() };
        }
        const entries = await NotebookEntry.find(filter).sort({ 'meta.nextReviewDate': 1 });
        res.json(entries);
    } catch (error) {
        next(error);
    }
};

export const createNotebookEntry = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const newEntry = new NotebookEntry({ title, content });
        const savedEntry = await newEntry.save();
        res.status(201).json(savedEntry);
    } catch (error) {
        next(error);
    }
};

export const getNotebookEntryById = async (req, res, next) => {
    try {
        const entry = await NotebookEntry.findById(req.params.id);
        if (!entry) {
            res.status(404);
            throw new Error('Notebook entry not found');
        }
        res.json(entry);
    } catch (error) {
        next(error);
    }
};

export const updateNotebookEntry = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const entry = await NotebookEntry.findById(req.params.id);
        if (!entry) {
            res.status(404);
            throw new Error('Notebook entry not found');
        }
        if (title !== undefined) entry.title = title;
        if (content !== undefined) entry.content = content;

        const updatedEntry = await entry.save();
        res.json(updatedEntry);
    } catch (error) {
        next(error);
    }
};

export const deleteNotebookEntry = async (req, res, next) => {
    try {
        const entry = await NotebookEntry.findById(req.params.id);
        if (!entry) {
            res.status(404);
            throw new Error('Notebook entry not found');
        }
        await entry.deleteOne();
        res.json({ message: 'Notebook entry removed' });
    } catch (error) {
        next(error);
    }
};

export const importExercises = async (req, res, next) => {
    try {
        const entryId = req.params.id;
        const mode = req.body.mode || 'replace'; // replace | append

        const entry = await NotebookEntry.findById(entryId);
        if (!entry) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            res.status(404);
            throw new Error('Notebook entry not found');
        }

        if (!req.file) {
            res.status(400);
            throw new Error('No file uploaded');
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // raw: false converts everything to formatted string (helps with numeric answers)
        const jsonRows = xlsx.utils.sheet_to_json(sheet, { defval: '', raw: false });

        const newExercises = [];
        const errors = [];

        // Process rows
        for (let i = 0; i < jsonRows.length; i++) {
            const row = jsonRows[i];
            const rowNum = i + 2; // +1 for 0-index, +1 for header

            let type = (row.type || row.Type || '').toString().trim().toLowerCase();
            let prompt = (row.prompt || row.Prompt || '').toString().trim();
            let answer = (row.answer || row.Answer || '').toString().trim();
            let explanation = (row.explanation || row.Explanation || '').toString().trim();

            if (!type && !prompt && !answer) continue; // skip empty rows

            if (type !== 'mcq' && type !== 'fill') {
                errors.push({ row: rowNum, message: 'Invalid type, must be "mcq" or "fill"' });
                continue;
            }
            if (!prompt) {
                errors.push({ row: rowNum, message: 'Missing prompt' });
                continue;
            }
            if (!answer) {
                errors.push({ row: rowNum, message: 'Missing answer' });
                continue;
            }

            if (type === 'mcq') {
                const optA = (row.option_a || row.Option_A || row['option A'] || row.option_A || '').toString().trim();
                const optB = (row.option_b || row.Option_B || row['option B'] || row.option_B || '').toString().trim();
                const optC = (row.option_c || row.Option_C || row['option C'] || row.option_C || '').toString().trim();
                const optD = (row.option_d || row.Option_D || row['option D'] || row.option_D || '').toString().trim();

                if (!optA || !optB || !optC || !optD) {
                    errors.push({ row: rowNum, message: 'Missing one or more options for MCQ' });
                    continue;
                }
                if (!['a', 'b', 'c', 'd'].includes(answer.toLowerCase())) {
                    errors.push({ row: rowNum, message: 'MCQ answer must be A, B, C, or D' });
                    continue;
                }
                newExercises.push({
                    type, prompt, answer: answer.toUpperCase(), explanation,
                    options: { A: optA, B: optB, C: optC, D: optD }
                });
            } else {
                // fill
                newExercises.push({
                    type, prompt, answer, explanation
                });
            }
        }

        // Cleanup file
        fs.unlinkSync(req.file.path);

        if (newExercises.length === 0 && errors.length > 0) {
            res.status(400);
            throw new Error(`Import failed, no valid rows. Errors: ${JSON.stringify(errors)}`);
        }

        let existingExercises = entry.exercises || [];
        let skippedCount = 0;

        if (mode === 'append') {
            const added = [];
            for (const ex of newExercises) {
                // deduplicate checking prompt and type
                const isDup = existingExercises.find(e => e.prompt === ex.prompt && e.type === ex.type);
                if (isDup) {
                    skippedCount++;
                } else {
                    added.push(ex);
                }
            }
            entry.exercises = [...existingExercises, ...added];
        } else {
            // replace
            entry.exercises = newExercises;
        }

        if (entry.exercises.length > 300) {
            // truncate to 300
            entry.exercises = entry.exercises.slice(entry.exercises.length - 300);
        }

        await entry.save();

        res.json({
            totalRows: jsonRows.length,
            importedCount: mode === 'append' ? newExercises.length - skippedCount : newExercises.length,
            skippedCount,
            errors
        });

    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(error);
    }
};

export const submitReview = async (req, res, next) => {
    try {
        const { correctCount, totalCount } = req.body;
        const entry = await NotebookEntry.findById(req.params.id);
        if (!entry) {
            res.status(404);
            throw new Error('Notebook entry not found');
        }

        if (totalCount === 0 || totalCount == null) {
            res.status(400);
            throw new Error('totalCount must be > 0');
        }

        const score = correctCount / totalCount;
        const pass = score >= 0.8;

        let currentStage = entry.meta.stage || 0;

        if (pass) {
            currentStage = Math.min(5, currentStage + 1);
        } else {
            currentStage = Math.max(0, currentStage - 1);
        }

        const intervalDays = SRS_INTERVALS[currentStage] || 0;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + intervalDays);

        entry.meta.stage = currentStage;
        entry.meta.nextReviewDate = nextDate;
        entry.meta.lastReviewedAt = new Date();
        entry.meta.lastScore = score;

        await entry.save();

        res.json({
            stage: entry.meta.stage,
            nextReviewDate: entry.meta.nextReviewDate,
            lastScore: entry.meta.lastScore
        });
    } catch (error) {
        next(error);
    }
};
