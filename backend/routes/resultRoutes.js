const express = require("express");

const {
    submitAssessment,
    getMyResults
} = require("../controllers/resultController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Submit assessment
router.post(
    "/submit",
    protect,
    authorize("student"),
    submitAssessment
);

// Get logged-in student's results
router.get(
    "/my-results",
    protect,
    authorize("student"),
    getMyResults
);

module.exports = router;