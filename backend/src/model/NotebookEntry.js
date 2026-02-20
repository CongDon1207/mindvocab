import mongoose from 'mongoose';

const exerciseItemSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['mcq', 'fill']
    },
    prompt: {
        type: String,
        required: true,
        maxlength: 500
    },
    options: {
        A: String,
        B: String,
        C: String,
        D: String
    },
    answer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        maxlength: 800
    }
});

const notebookEntrySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true
        },
        exercises: {
            type: [exerciseItemSchema],
            default: [],
            validate: [arrayLimit, '{PATH} exceeds the limit of 300']
        },
        meta: {
            stage: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            nextReviewDate: {
                type: Date,
                default: Date.now
            },
            lastReviewedAt: {
                type: Date
            },
            lastScore: {
                type: Number,
                min: 0,
                max: 1
            }
        }
    },
    {
        timestamps: true
    }
);

function arrayLimit(val) {
    return val.length <= 300;
}

const NotebookEntry = mongoose.model('NotebookEntry', notebookEntrySchema);

export default NotebookEntry;
