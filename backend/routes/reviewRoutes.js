const express = require("express");

const {
    createReview,
    getCourseReviews,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create a review
router.post(
    "/",
    protect,
    authorize("student"),
    createReview
);

// Get all reviews for a course
router.get(
    "/course/:courseId",
    getCourseReviews
);

// Update own review
router.put(
    "/:id",
    protect,
    authorize("student"),
    updateReview
);

// Delete own review
router.delete(
    "/:id",
    protect,
    authorize("student"),
    deleteReview
);

module.exports = router;