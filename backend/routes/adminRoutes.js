const express = require("express");

const {
    getAdminDashboard,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllCourses,
    toggleCoursePublish,
    deleteCourse,
    getAllAssessments
} = require("../controllers/adminController");

const {
    protect,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ======================================================
// ADMIN DASHBOARD
// ======================================================

router.get(
    "/dashboard",
    protect,
    authorize("admin"),
    getAdminDashboard
);


// ======================================================
// USER MANAGEMENT
// ======================================================

router.get(
    "/users",
    protect,
    authorize("admin"),
    getAllUsers
);

router.put(
    "/users/:id/role",
    protect,
    authorize("admin"),
    updateUserRole
);

router.delete(
    "/users/:id",
    protect,
    authorize("admin"),
    deleteUser
);


// ======================================================
// COURSE MANAGEMENT
// ======================================================

router.get(
    "/courses",
    protect,
    authorize("admin"),
    getAllCourses
);

router.put(
    "/courses/:id/publish",
    protect,
    authorize("admin"),
    toggleCoursePublish
);

router.delete(
    "/courses/:id",
    protect,
    authorize("admin"),
    deleteCourse
);


// ======================================================
// ASSESSMENT MANAGEMENT
// ======================================================

router.get(
    "/assessments",
    protect,
    authorize("admin"),
    getAllAssessments
);


module.exports = router;