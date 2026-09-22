const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        score: {
            type: Number,
            required: true,
            default: 0
        },

        totalMarks: {
            type: Number,
            required: true,
            default: 0
        },

        percentage: {
            type: Number,
            required: true,
            default: 0
        },

        passed: {
            type: Boolean,
            default: false
        },

        submittedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Result", resultSchema);