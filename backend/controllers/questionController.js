const Question = require("../models/Question");
const Assessment = require("../models/Assessment");

// Create a question
const createQuestion = async (req, res) => {
    try {
        const {
            assessment,
            questionText,
            options,
            correctAnswer,
            marks,
            order
        } = req.body;

        if (
            !assessment ||
            !questionText ||
            !options ||
            !correctAnswer
        ) {
            return res.status(400).json({
                message: "Please provide assessment, question, options and correct answer"
            });
        }

        // Check assessment
        const existingAssessment = await Assessment.findById(assessment);

        if (!existingAssessment) {
            return res.status(404).json({
                message: "Assessment not found"
            });
        }

        // Check whether the logged-in instructor owns the course
        const Course = require("../models/Course");

        const course = await Course.findById(
            existingAssessment.course
        );

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        if (course.instructor.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only add questions to your own assessments"
            });
        }

        // Make sure correct answer is one of the options
        if (!options.includes(correctAnswer)) {
            return res.status(400).json({
                message: "Correct answer must be one of the provided options"
            });
        }

        const question = await Question.create({
            assessment,
            questionText,
            options,
            correctAnswer,
            marks,
            order
        });

        res.status(201).json({
            message: "Question created successfully",
            question
        });

    } catch (error) {
        console.error("Question creation error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get questions for an assessment
const getQuestionsByAssessment = async (req, res) => {
    try {
        const questions = await Question.find({
            assessment: req.params.assessmentId
        })
        .select("-correctAnswer")
        .sort({ order: 1 });

        res.status(200).json({
            message: "Questions fetched successfully",
            questions
        });

    } catch (error) {
        console.error("Fetch questions error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    createQuestion,
    getQuestionsByAssessment
};