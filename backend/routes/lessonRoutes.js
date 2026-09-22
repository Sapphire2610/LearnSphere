const express = require("express");

const {
    createLesson,
    getLessonsByModule,
    getLessonById
} = require("../controllers/lessonController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Create lesson
router.post(
    "/",
    protect,
    authorize("instructor"),
    createLesson
);

// Get lessons for a module
router.get(
    "/module/:moduleId",
    getLessonsByModule
);

// Get single lesson
router.get(
    "/:id",
    getLessonById
);

module.exports = router;