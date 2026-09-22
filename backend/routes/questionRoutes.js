const express = require("express");

const {
    createQuestion,
    getQuestionsByAssessment
} = require("../controllers/questionController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create question
router.post(
    "/",
    protect,
    authorize("instructor"),
    createQuestion
);

// Get questions for an assessment
router.get(
    "/assessment/:assessmentId",
    protect,
    getQuestionsByAssessment
);

module.exports = router;