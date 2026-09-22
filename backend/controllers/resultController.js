const Result = require("../models/Result");
const Assessment = require("../models/Assessment");
const Question = require("../models/Question");
const Enrollment = require("../models/Enrollment");

// Submit an assessment
const submitAssessment = async (req, res) => {
    try {
        const { assessmentId, answers } = req.body;

        if (!assessmentId || !answers) {
            return res.status(400).json({
                message: "Please provide assessment ID and answers"
            });
        }

        // Find assessment
        const assessment = await Assessment.findById(assessmentId);

        if (!assessment) {
            return res.status(404).json({
                message: "Assessment not found"
            });
        }

        // Check whether student is enrolled in the course
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            course: assessment.course
        });

        if (!enrollment) {
            return res.status(403).json({
                message: "You must be enrolled in this course"
            });
        }

        // Get all questions
        const questions = await Question.find({
            assessment: assessmentId
        });

        if (questions.length === 0) {
            return res.status(400).json({
                message: "This assessment has no questions"
            });
        }

        let score = 0;

        // Check each answer
        questions.forEach((question) => {
            const studentAnswer = answers[question._id.toString()];

            if (studentAnswer === question.correctAnswer) {
                score += question.marks;
            }
        });

        // Calculate total marks from questions
        const totalMarks = questions.reduce(
            (total, question) => total + question.marks,
            0
        );

        // Calculate percentage
        const percentage = (score / totalMarks) * 100;

        // Check pass/fail
        const passed = score >= assessment.passingMarks;

        // Store result
        const result = await Result.create({
            student: req.user.id,
            assessment: assessmentId,
            course: assessment.course,
            score,
            totalMarks,
            percentage,
            passed
        });

        res.status(201).json({
            message: "Assessment submitted successfully",
            result
        });

    } catch (error) {
        console.error("Assessment submission error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get student's results
const getMyResults = async (req, res) => {
    try {
        const results = await Result.find({
            student: req.user.id
        })
            .populate("assessment", "title")
            .populate("course", "title")
            .sort({ submittedAt: -1 });

        res.status(200).json({
            message: "Results fetched successfully",
            results
        });

    } catch (error) {
        console.error("Fetch results error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    submitAssessment,
    getMyResults
};