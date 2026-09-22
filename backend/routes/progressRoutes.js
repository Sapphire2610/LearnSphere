const express = require("express");

const {
    completeLesson,
    getCourseProgress
} = require("../controllers/progressController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Mark lesson as completed
router.post(
    "/complete",
    protect,
    authorize("student"),
    completeLesson
);

// Get course progress
router.get(
    "/course/:courseId",
    protect,
    authorize("student"),
    getCourseProgress
);

module.exports = router;