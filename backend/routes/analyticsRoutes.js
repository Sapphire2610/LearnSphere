const express = require("express");

const {
    getCourseAnalytics
} = require("../controllers/analyticsController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// GET COURSE ANALYTICS
// ==========================================
// Only instructors can view course analytics.

router.get(
    "/course/:courseId",
    protect,
    authorize("instructor"),
    getCourseAnalytics
);

module.exports = router;