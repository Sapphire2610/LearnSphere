const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Create a review
const createReview = async (req, res) => {
    try {
        const { course, rating, comment } = req.body;

        if (!course || !rating || !comment) {
            return res.status(400).json({
                message: "Course, rating and comment are required"
            });
        }

        // Check whether course exists
        const existingCourse = await Course.findById(course);

        if (!existingCourse) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Check whether student is enrolled
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: course
        });

        if (!enrollment) {
            return res.status(403).json({
                message: "You must be enrolled in this course to review it"
            });
        }

        // Check whether student already reviewed this course
        const existingReview = await Review.findOne({
            student: req.user.id,
            course: course
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this course"
            });
        }

        const review = await Review.create({
            student: req.user.id,
            course,
            rating,
            comment
        });

        const populatedReview = await Review.findById(review._id)
            .populate("student", "name")
            .populate("course", "title");

        res.status(201).json({
            message: "Review created successfully",
            review: populatedReview
        });
    } catch (error) {
        console.error("Create review error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Get all reviews for a course
const getCourseReviews = async (req, res) => {
    try {
        const { courseId } = req.params;

        const reviews = await Review.find({
            course: courseId
        })
            .populate("student", "name")
            .sort({ createdAt: -1 });

        // Calculate average rating
        const totalReviews = reviews.length;

        const averageRating =
            totalReviews > 0
                ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                  totalReviews
                : 0;

        res.json({
            message: "Reviews fetched successfully",
            totalReviews,
            averageRating: Number(averageRating.toFixed(1)),
            reviews
        });
    } catch (error) {
        console.error("Get reviews error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Update a review
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        // Only the student who created the review can update it
        if (review.student.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only update your own review"
            });
        }

        if (rating !== undefined) {
            review.rating = rating;
        }

        if (comment !== undefined) {
            review.comment = comment;
        }

        await review.save();

        const updatedReview = await Review.findById(review._id)
            .populate("student", "name")
            .populate("course", "title");

        res.json({
            message: "Review updated successfully",
            review: updatedReview
        });
    } catch (error) {
        console.error("Update review error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findById(id);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        // Only the student who created the review can delete it
        if (review.student.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own review"
            });
        }

        await Review.findByIdAndDelete(id);

        res.json({
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error("Delete review error:", error);

        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    createReview,
    getCourseReviews,
    updateReview,
    deleteReview
};