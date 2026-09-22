const express = require("express");

const {
    createModule,
    getModulesByCourse
} = require("../controllers/moduleController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create module
router.post(
    "/",
    protect,
    authorize("instructor"),
    createModule
);

// Get modules for a course
router.get(
    "/course/:courseId",
    getModulesByCourse
);

module.exports = router;