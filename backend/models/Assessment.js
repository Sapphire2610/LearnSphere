const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true
        },

        totalMarks: {
            type: Number,
            default: 0
        },

        passingMarks: {
            type: Number,
            default: 0
        },

        duration: {
            type: Number,
            default: 30
        },

        published: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Assessment", assessmentSchema);