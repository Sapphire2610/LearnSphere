const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

// One student can review a course only once
reviewSchema.index(
    { student: 1, course: 1 },
    { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);