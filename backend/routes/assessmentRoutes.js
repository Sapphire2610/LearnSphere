const express = require("express");

const {
    createAssessment,
    getAssessmentsByCourse,
    getAssessmentById
} = require("../controllers/assessmentController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create assessment
router.post(
    "/",
    protect,
    authorize("instructor"),
    createAssessment
);

// Get assessments for a course
router.get(
    "/course/:courseId",
    getAssessmentsByCourse
);

// Get single assessment
router.get(
    "/:id",
    getAssessmentById
);

module.exports = router;