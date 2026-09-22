const Module = require("../models/Module");
const Course = require("../models/Course");

// Create a module
const createModule = async (req, res) => {
    try {
        const { title, description, course, order } = req.body;

        if (!title || !course) {
            return res.status(400).json({
                message: "Please provide title and course"
            });
        }

        const existingCourse = await Course.findById(course);

        if (!existingCourse) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Only the course instructor can add modules
        if (existingCourse.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only add modules to your own courses"
            });
        }

        const module = await Module.create({
            title,
            description,
            course,
            order
        });

        res.status(201).json({
            message: "Module created successfully",
            module
        });

    } catch (error) {
        console.error("Module creation error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get modules for a course
const getModulesByCourse = async (req, res) => {
    try {
        const modules = await Module.find({
            course: req.params.courseId
        }).sort({ order: 1 });

        res.status(200).json({
            message: "Modules fetched successfully",
            modules
        });

    } catch (error) {
        console.error("Fetch modules error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createModule,
    getModulesByCourse
};