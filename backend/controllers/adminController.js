const User = require("../models/User");
const Course = require("../models/Course");
const Assessment = require("../models/Assessment");
const Enrollment = require("../models/Enrollment");


// ======================================================
// ADMIN DASHBOARD
// ======================================================

const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const totalStudents = await User.countDocuments({
            role: "student"
        });

        const totalInstructors = await User.countDocuments({
            role: "instructor"
        });

        const totalAdmins = await User.countDocuments({
            role: "admin"
        });

        const totalCourses = await Course.countDocuments();

        const publishedCourses = await Course.countDocuments({
            published: true
        });

        const draftCourses = await Course.countDocuments({
            published: false
        });

        const totalAssessments = await Assessment.countDocuments();

        const totalEnrollments = await Enrollment.countDocuments();

        res.json({
            message: "Admin dashboard data fetched successfully",

            statistics: {
                totalUsers,
                totalStudents,
                totalInstructors,
                totalAdmins,
                totalCourses,
                publishedCourses,
                draftCourses,
                totalAssessments,
                totalEnrollments
            }
        });

    } catch (error) {
        console.error("Admin dashboard error:", error);

        res.status(500).json({
            message: "Unable to fetch admin dashboard data",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL USERS
// ======================================================

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({
            message: "Users fetched successfully",
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            message: "Unable to fetch users",
            error: error.message
        });
    }
};


// ======================================================
// UPDATE USER ROLE
// ======================================================

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!["student", "instructor", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Prevent admin from changing their own role
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                message: "You cannot change your own admin role"
            });
        }

        user.role = role;

        await user.save();

        res.json({
            message: "User role updated successfully",

            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Update role error:", error);

        res.status(500).json({
            message: "Unable to update user role",
            error: error.message
        });
    }
};


// ======================================================
// DELETE USER
// ======================================================

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting their own account
        if (id === req.user.id) {
            return res.status(400).json({
                message: "You cannot delete your own admin account"
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(id);

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error("Delete user error:", error);

        res.status(500).json({
            message: "Unable to delete user",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL COURSES
// ======================================================

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("instructor", "name email")
            .sort({ createdAt: -1 });

        const coursesWithEnrollments = await Promise.all(
            courses.map(async (course) => {

                const enrollmentCount =
                    await Enrollment.countDocuments({
                        course: course._id
                    });

                return {
                    ...course.toObject(),
                    enrollmentCount
                };
            })
        );

        res.json({
            message: "Courses fetched successfully",
            courses: coursesWithEnrollments
        });

    } catch (error) {
        console.error("Get admin courses error:", error);

        res.status(500).json({
            message: "Unable to fetch courses",
            error: error.message
        });
    }
};


// ======================================================
// PUBLISH / UNPUBLISH COURSE
// ======================================================

const toggleCoursePublish = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        course.published = !course.published;

        await course.save();

        res.json({
            message: course.published
                ? "Course published successfully"
                : "Course unpublished successfully",

            course: {
                _id: course._id,
                title: course.title,
                published: course.published
            }
        });

    } catch (error) {
        console.error("Toggle course publish error:", error);

        res.status(500).json({
            message: "Unable to update course status",
            error: error.message
        });
    }
};


// ======================================================
// DELETE COURSE
// ======================================================

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        await Course.findByIdAndDelete(id);

        res.json({
            message: "Course deleted successfully"
        });

    } catch (error) {
        console.error("Delete course error:", error);

        res.status(500).json({
            message: "Unable to delete course",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL ASSESSMENTS
// ======================================================

const getAllAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find()
            .populate("course", "title")
            .populate("module", "title")
            .sort({ createdAt: -1 });

        res.json({
            message: "Assessments fetched successfully",
            assessments
        });

    } catch (error) {
        console.error(
            "Get admin assessments error:",
            error
        );

        res.status(500).json({
            message: "Unable to fetch assessments",
            error: error.message
        });
    }
};


// ======================================================
// EXPORTS
// ======================================================

module.exports = {
    getAdminDashboard,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllCourses,
    toggleCoursePublish,
    deleteCourse,
    getAllAssessments
};