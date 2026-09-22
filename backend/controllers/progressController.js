const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");

// Mark a lesson as completed
const completeLesson = async (req, res) => {
    try {
        const { lessonId } = req.body;

        if (!lessonId) {
            return res.status(400).json({
                message: "Lesson ID is required"
            });
        }

        // Find lesson
        const lesson = await Lesson.findById(lessonId);

        if (!lesson) {
            return res.status(404).json({
                message: "Lesson not found"
            });
        }

        // Find module and course
        const Module = require("../models/Module");

        const module = await Module.findById(lesson.module);

        if (!module) {
            return res.status(404).json({
                message: "Module not found"
            });
        }

        // Check whether student is enrolled
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: module.course
        });

        if (!enrollment) {
            return res.status(403).json({
                message: "You must enroll in this course first"
            });
        }

        // Find existing progress
        let progress = await Progress.findOne({
            student: req.user.id,
            lesson: lessonId
        });

        if (progress) {
            progress.completed = true;
            progress.completedAt = new Date();

            await progress.save();
        } else {
            progress = await Progress.create({
                student: req.user.id,
                course: module.course,
                lesson: lessonId,
                completed: true,
                completedAt: new Date()
            });
        }

        res.status(200).json({
            message: "Lesson marked as completed ✅",
            progress
        });

    } catch (error) {
        console.error("Complete lesson error:", error);

        res.status(500).json({
            message: "Unable to update lesson progress"
        });
    }
};


// Get student's progress for a course
const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;

        const progress = await Progress.find({
            student: req.user.id,
            course: courseId
        })
            .populate("lesson", "title")
            .sort({ createdAt: 1 });

        res.status(200).json({
            progress
        });

    } catch (error) {
        console.error("Get progress error:", error);

        res.status(500).json({
            message: "Unable to fetch course progress"
        });
    }
};


module.exports = {
    completeLesson,
    getCourseProgress
};