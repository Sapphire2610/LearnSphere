const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
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

        order: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);

moduleSchema.index({ course: 1, order: 1 });

module.exports = mongoose.model("Module", moduleSchema);