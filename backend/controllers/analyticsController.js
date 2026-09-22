const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Lesson = require("../models/Lesson");
const Result = require("../models/Result");

// ==========================================
// GET COURSE ANALYTICS
// ==========================================

const getCourseAnalytics = async (req, res) => {
    try {
        const { courseId } = req.params;

        // --------------------------------------
        // 1. CHECK COURSE OWNERSHIP
        // --------------------------------------

        const Course = require("../models/Course");

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // Only the instructor who owns the course
        // can view its analytics.

        if (
            course.instructor.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                message: "You are not authorized to view these analytics"
            });
        }

        // --------------------------------------
        // 2. GET ENROLLED STUDENTS
        // --------------------------------------

        const enrollments = await Enrollment.find({
            course: courseId
        }).populate(
            "student",
            "name email"
        );

        const totalStudents =
            enrollments.length;

        // --------------------------------------
        // 3. GET COURSE LESSONS
        // --------------------------------------

        const modules = await require("../models/Module")
            .find({
                course: courseId
            });

        const moduleIds =
            modules.map(
                (module) => module._id
            );

        const lessons =
            await Lesson.find({
                module: {
                    $in: moduleIds
                }
            });

        const totalLessons =
            lessons.length;

        // --------------------------------------
        // 4. GET PROGRESS DATA
        // --------------------------------------

        const progressRecords =
            await Progress.find({
                course: courseId,
                completed: true
            });

        // --------------------------------------
        // 5. CALCULATE COURSE PROGRESS
        // --------------------------------------

        let totalProgress = 0;

        const studentProgress =
            enrollments.map(
                (enrollment) => {

                    const studentId =
                        enrollment.student._id.toString();

                    const completedLessons =
                        progressRecords.filter(
                            (progress) =>
                                progress.student.toString() ===
                                studentId
                        ).length;

                    const percentage =
                        totalLessons > 0
                            ? Math.round(
                                  (completedLessons /
                                      totalLessons) *
                                      100
                              )
                            : 0;

                    totalProgress +=
                        percentage;

                    return {
                        student: {
                            _id:
                                enrollment.student._id,
                            name:
                                enrollment.student.name,
                            email:
                                enrollment.student.email
                        },

                        completedLessons,

                        totalLessons,

                        progressPercentage:
                            percentage,

                        status:
                            percentage >= 100
                                ? "Completed"
                                : percentage > 0
                                ? "In Progress"
                                : "Not Started"
                    };
                }
            );

        const averageProgress =
            totalStudents > 0
                ? Math.round(
                      totalProgress /
                          totalStudents
                  )
                : 0;

        // --------------------------------------
        // 6. GET ASSESSMENT RESULTS
        // --------------------------------------

        const results =
            await Result.find({
                course: courseId
            }).populate(
                "assessment",
                "title totalMarks passingMarks"
            );

        const totalAttempts =
            results.length;

        // --------------------------------------
        // 7. CALCULATE AVERAGE SCORE
        // --------------------------------------

        let averageScore = 0;

        if (totalAttempts > 0) {

            const totalPercentage =
                results.reduce(
                    (sum, result) =>
                        sum +
                        Number(
                            result.percentage || 0
                        ),
                    0
                );

            averageScore =
                Math.round(
                    totalPercentage /
                        totalAttempts
                );
        }

        // --------------------------------------
        // 8. PASSED / FAILED STUDENTS
        // --------------------------------------

        const passedAttempts =
            results.filter(
                (result) =>
                    result.passed === true
            ).length;

        const failedAttempts =
            results.filter(
                (result) =>
                    result.passed === false
            ).length;

        // --------------------------------------
        // 9. ASSESSMENT SUMMARY
        // --------------------------------------

        const assessmentSummary = {};

        results.forEach(
            (result) => {

                const assessmentId =
                    result.assessment?._id?.toString();

                if (!assessmentId) {
                    return;
                }

                if (
                    !assessmentSummary[
                        assessmentId
                    ]
                ) {

                    assessmentSummary[
                        assessmentId
                    ] = {
                        assessmentId,

                        title:
                            result.assessment
                                .title,

                        totalMarks:
                            result.assessment
                                .totalMarks,

                        attempts: 0,

                        totalPercentage: 0,

                        passed: 0,

                        failed: 0
                    };
                }

                assessmentSummary[
                    assessmentId
                ].attempts += 1;

                assessmentSummary[
                    assessmentId
                ].totalPercentage +=
                    Number(
                        result.percentage || 0
                    );

                if (result.passed) {
                    assessmentSummary[
                        assessmentId
                    ].passed += 1;
                } else {
                    assessmentSummary[
                        assessmentId
                    ].failed += 1;
                }
            }
        );

        const assessments =
            Object.values(
                assessmentSummary
            ).map(
                (assessment) => ({

                    assessmentId:
                        assessment.assessmentId,

                    title:
                        assessment.title,

                    totalMarks:
                        assessment.totalMarks,

                    attempts:
                        assessment.attempts,

                    averagePercentage:
                        Math.round(
                            assessment.totalPercentage /
                                assessment.attempts
                        ),

                    passed:
                        assessment.passed,

                    failed:
                        assessment.failed
                })
            );

        // --------------------------------------
        // 10. RESPONSE
        // --------------------------------------

        res.status(200).json({

            message:
                "Course analytics fetched successfully",

            analytics: {

                course: {
                    _id: course._id,
                    title: course.title
                },

                overview: {

                    totalStudents,

                    totalModules:
                        modules.length,

                    totalLessons,

                    averageProgress,

                    totalAssessmentAttempts:
                        totalAttempts,

                    averageAssessmentScore:
                        averageScore,

                    passedAttempts,

                    failedAttempts
                },

                students:
                    studentProgress,

                assessments
            }
        });

    } catch (error) {

        console.error(
            "Course analytics error:",
            error
        );

        res.status(500).json({

            message:
                "Unable to fetch course analytics",

            error:
                error.message
        });
    }
};

module.exports = {
    getCourseAnalytics
};
