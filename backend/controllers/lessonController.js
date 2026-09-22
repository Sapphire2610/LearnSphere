const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const Course = require("../models/Course");

// Create a lesson
const createLesson = async (req, res) => {
    try {
        const {
            title,
            description,
            module,
            videoUrl,
            duration,
            order,
            isFree
        } = req.body;

        if (!title || !module || !videoUrl) {
            return res.status(400).json({
                message: "Please provide title, module and video URL"
            });
        }

        // Check if module exists
        const existingModule = await Module.findById(module);

        if (!existingModule) {
            return res.status(404).json({
                message: "Module not found"
            });
        }

        // Find the course containing this module
        const course = await Course.findById(existingModule.course);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Only the course instructor can add lessons
        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only add lessons to your own courses"
            });
        }

        const lesson = await Lesson.create({
            title,
            description,
            module,
            videoUrl,
            duration,
            order,
            isFree
        });

        res.status(201).json({
            message: "Lesson created successfully",
            lesson
        });

    } catch (error) {
        console.error("Lesson creation error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get lessons for a module
const getLessonsByModule = async (req, res) => {
    try {
        const lessons = await Lesson.find({
            module: req.params.moduleId
        }).sort({ order: 1 });

        res.status(200).json({
            message: "Lessons fetched successfully",
            lessons
        });

    } catch (error) {
        console.error("Fetch lessons error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get a single lesson
const getLessonById = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
            .populate("module", "title course");

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        res.status(200).json({
            message: "Lesson fetched successfully",
            lesson
        });

    } catch (error) {
        console.error("Fetch lesson error:", error.message);

        res.status(400).json({
            message: "Invalid lesson ID"
        });
    }
};


module.exports = {
    createLesson,
    getLessonsByModule,
    getLessonById
};