const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
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

        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true
        },

        videoUrl: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: Number,
            default: 0
        },

        order: {
            type: Number,
            default: 1
        },

        isFree: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

lessonSchema.index({ module: 1, order: 1 });

module.exports = mongoose.model("Lesson", lessonSchema);