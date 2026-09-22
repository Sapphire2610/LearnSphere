const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

// Create a new course
const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            thumbnail,
            level,
            price
        } = req.body;

        // Check required fields
        if (!title || !description || !category) {
            return res.status(400).json({
                message: "Please provide title, description and category"
            });
        }

        // Create course
        const course = await Course.create({
            title,
            description,
            category,
            thumbnail,
            level,
            price,
            instructor: req.user.id
        });

        res.status(201).json({
            message: "Course created successfully",
            course
        });

    } catch (error) {
        console.error("Course creation error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createCourse
};

// Get all courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate("instructor", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Courses fetched successfully",
            courses
        });

    } catch (error) {
        console.error("Fetch courses error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    createCourse,
    getCourses
};

// Get a single course by ID
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate("instructor", "name email");

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.status(200).json({
            message: "Course fetched successfully",
            course
        });

    } catch (error) {
        console.error("Fetch course error:", error.message);

        res.status(400).json({
            message: "Invalid course ID"
        });
    }
};
module.exports = {
    createCourse,
    getCourses,
    getCourseById
};
// Enroll in a course
const enrollCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        const studentId = req.user.id;

        // Check if course exists
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId
        });

        if (existingEnrollment) {
            return res.status(400).json({
                message: "Already enrolled in this course"
            });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId
        });

        res.status(201).json({
            message: "Enrolled successfully",
            enrollment
        });

    } catch (error) {
        console.error("Enrollment error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    enrollCourse
};

// Get courses enrolled by the logged-in student
const getMyCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user.id
        })
            .populate("course")
            .sort({ enrolledAt: -1 });

        res.status(200).json({
            message: "Enrolled courses fetched successfully",
            enrollments
        });

    } catch (error) {
        console.error("Fetch enrolled courses error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};
module.exports = {
    createCourse,
    getCourses,
    getCourseById,
    enrollCourse,
    getMyCourses
};
