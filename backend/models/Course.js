const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        thumbnail: {
            type: String,
            default: ""
        },

        level: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            default: "Beginner"
        },

        price: {
            type: Number,
            default: 0
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

module.exports = mongoose.model("Course", courseSchema);