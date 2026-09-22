const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
    {
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
            required: true
        },

        questionText: {
            type: String,
            required: true,
            trim: true
        },

        options: {
            type: [String],
            required: true,
            validate: {
                validator: function (value) {
                    return value.length >= 2;
                },
                message: "A question must have at least 2 options"
            }
        },

        correctAnswer: {
            type: String,
            required: true
        },

        marks: {
            type: Number,
            default: 1
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

questionSchema.index({ assessment: 1, order: 1 });

module.exports = mongoose.model("Question", questionSchema);