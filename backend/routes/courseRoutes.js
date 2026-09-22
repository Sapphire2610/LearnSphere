const express = require("express");

const {
    createCourse,
    getCourses,
    getCourseById,
    enrollCourse,
    getMyCourses
} = require("../controllers/courseController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCourses);

router.get(
    "/my-courses",
    protect,
    authorize("student"),
    getMyCourses
);

router.get("/:id", getCourseById);

router.post(
    "/",
    protect,
    authorize("instructor"),
    createCourse
);

router.post(
    "/:id/enroll",
    protect,
    authorize("student"),
    enrollCourse
);

module.exports = router;