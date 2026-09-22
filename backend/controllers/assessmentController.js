const Assessment = require("../models/Assessment");
const Course = require("../models/Course");
const Module = require("../models/Module");

// Create an assessment
const createAssessment = async (req, res) => {
    try {
        const {
            title,
            description,
            course,
            module,
            totalMarks,
            passingMarks,
            duration,
            published
        } = req.body;

        if (!title || !course || !module) {
            return res.status(400).json({
                message: "Please provide title, course and module"
            });
        }

        // Check course
        const existingCourse = await Course.findById(course);

        if (!existingCourse) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Only course instructor can create assessment
        if (existingCourse.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only create assessments for your own courses"
            });
        }

        // Check module
        const existingModule = await Module.findById(module);

        if (!existingModule) {
            return res.status(404).json({
                message: "Module not found"
            });
        }

        // Make sure module belongs to the selected course
        if (existingModule.course.toString() !== course) {
            return res.status(400).json({
                message: "Module does not belong to this course"
            });
        }

        const assessment = await Assessment.create({
            title,
            description,
            course,
            module,
            totalMarks,
            passingMarks,
            duration,
            published
        });

        res.status(201).json({
            message: "Assessment created successfully",
            assessment
        });

    } catch (error) {
        console.error("Assessment creation error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get assessments for a course
const getAssessmentsByCourse = async (req, res) => {
    try {
        const assessments = await Assessment.find({
            course: req.params.courseId
        }).sort({ createdAt: -1 });

        res.status(200).json({
            message: "Assessments fetched successfully",
            assessments
        });

    } catch (error) {
        console.error("Fetch assessments error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get a single assessment
const getAssessmentById = async (req, res) => {
    try {
        const assessment = await Assessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({
                message: "Assessment not found"
            });
        }

        res.status(200).json({
            message: "Assessment fetched successfully",
            assessment
        });

    } catch (error) {
        console.error("Fetch assessment error:", error.message);

        res.status(400).json({
            message: "Invalid assessment ID"
        });
    }
};


module.exports = {
    createAssessment,
    getAssessmentsByCourse,
    getAssessmentById
};