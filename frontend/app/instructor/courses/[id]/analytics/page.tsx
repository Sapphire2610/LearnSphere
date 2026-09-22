"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Student = {
    _id: string;
    name: string;
    email: string;
};

type StudentProgress = {
    student: Student;
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
    status: "Completed" | "In Progress" | "Not Started";
};

type Assessment = {
    assessmentId: string;
    title: string;
    totalMarks: number;
    attempts: number;
    averagePercentage: number;
    passed: number;
    failed: number;
};

type Overview = {
    totalStudents: number;
    totalModules: number;
    totalLessons: number;
    averageProgress: number;
    totalAssessmentAttempts: number;
    averageAssessmentScore: number;
    passedAttempts: number;
    failedAttempts: number;
};

type AnalyticsData = {
    course: {
        _id: string;
        title: string;
    };
    overview: Overview;
    students: StudentProgress[];
    assessments: Assessment[];
};

export default function AnalyticsPage() {
    const params = useParams();
    const router = useRouter();

    const courseId = params.id as string;

    const [analytics, setAnalytics] =
        useState<AnalyticsData | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                const userString =
                    localStorage.getItem("user");

                if (!token || !userString) {
                    router.push("/login");
                    return;
                }

                const user =
                    JSON.parse(userString);

                if (user.role !== "instructor") {
                    router.push("/dashboard");
                    return;
                }

                const response =
                    await fetch(
                        `http://localhost:5000/api/analytics/course/${courseId}`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to fetch analytics"
                    );
                }

                setAnalytics(
                    data.analytics
                );
            } catch (err) {
                console.error(
                    "Analytics error:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong"
                );
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchAnalytics();
        }
    }, [courseId, router]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="text-5xl mb-4">
                        📊
                    </div>

                    <h2 className="text-2xl font-bold text-[#4b4263]">
                        Loading analytics...
                    </h2>

                    <p className="text-gray-500 mt-2">
                        Gathering your course insights ✨
                    </p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">
                <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 max-w-md w-full text-center">
                    <div className="text-5xl mb-4">
                        😕
                    </div>

                    <h2 className="text-2xl font-bold text-[#4b4263]">
                        Unable to load analytics
                    </h2>

                    <p className="text-red-500 mt-3">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            router.back()
                        }
                        className="mt-6 px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
                    >
                        ← Go Back
                    </button>
                </div>
            </main>
        );
    }

    if (!analytics) {
        return (
            <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl">
                        📭
                    </div>

                    <h2 className="text-xl font-bold text-[#4b4263] mt-4">
                        No analytics available
                    </h2>
                </div>
            </main>
        );
    }

    const overview =
        analytics.overview;

    const passRate =
        overview.totalAssessmentAttempts >
        0
            ? Math.round(
                  (overview.passedAttempts /
                      overview.totalAssessmentAttempts) *
                      100
              )
            : 0;

    return (
        <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">
            {/* ================= NAVBAR ================= */}

            <nav className="bg-white border-b border-pink-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() =>
                                router.push(
                                    `/instructor/courses/${courseId}`
                                )
                            }
                            className="text-sm text-gray-500 hover:text-[#ef6f9f] transition"
                        >
                            ← Back to Manage Course
                        </button>

                        <h1 className="text-2xl font-bold mt-1">
                            📊 Course Analytics
                        </h1>
                    </div>

                    <button
                        onClick={() =>
                            router.push(
                                "/instructor"
                            )
                        }
                        className="hidden sm:block px-5 py-2.5 rounded-2xl bg-[#eee5ff] text-[#4b4263] font-semibold hover:shadow-md transition"
                    >
                        Instructor Dashboard
                    </button>
                </div>
            </nav>

            {/* ================= PAGE CONTENT ================= */}

            <div className="max-w-7xl mx-auto px-6 py-8">

                {/* ================= COURSE HEADER ================= */}

                <section className="bg-gradient-to-r from-[#eee5ff] via-[#fff0f5] to-[#dff5ef] rounded-[2rem] p-7 md:p-9 shadow-sm border border-white mb-8">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

                        <div>
                            <p className="text-sm font-semibold text-[#ef6f9f] uppercase tracking-wide">
                                Course Performance
                            </p>

                            <h2 className="text-3xl md:text-4xl font-bold mt-2">
                                {analytics.course.title}
                            </h2>

                            <p className="text-gray-600 mt-2">
                                Track student engagement,
                                learning progress and
                                assessment performance.
                            </p>
                        </div>

                        <div className="text-6xl">
                            🎓
                        </div>
                    </div>
                </section>

                {/* ================= OVERVIEW CARDS ================= */}

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100">
                        <div className="flex items-center justify-between">
                            <div className="text-3xl">
                                👩‍🎓
                            </div>

                            <span className="text-xs font-semibold bg-pink-50 text-[#ef6f9f] px-3 py-1 rounded-full">
                                Students
                            </span>
                        </div>

                        <p className="text-3xl font-bold mt-5">
                            {overview.totalStudents}
                        </p>

                        <p className="text-gray-500 text-sm mt-1">
                            Total enrolled students
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-purple-100">
                        <div className="flex items-center justify-between">
                            <div className="text-3xl">
                                📚
                            </div>

                            <span className="text-xs font-semibold bg-purple-50 text-purple-600 px-3 py-1 rounded-full">
                                Content
                            </span>
                        </div>

                        <p className="text-3xl font-bold mt-5">
                            {overview.totalModules}
                        </p>

                        <p className="text-gray-500 text-sm mt-1">
                            Course modules
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-100">
                        <div className="flex items-center justify-between">
                            <div className="text-3xl">
                                🎥
                            </div>

                            <span className="text-xs font-semibold bg-green-50 text-green-600 px-3 py-1 rounded-full">
                                Lessons
                            </span>
                        </div>

                        <p className="text-3xl font-bold mt-5">
                            {overview.totalLessons}
                        </p>

                        <p className="text-gray-500 text-sm mt-1">
                            Total lessons
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100">
                        <div className="flex items-center justify-between">
                            <div className="text-3xl">
                                📈
                            </div>

                            <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                                Progress
                            </span>
                        </div>

                        <p className="text-3xl font-bold mt-5">
                            {overview.averageProgress}%
                        </p>

                        <p className="text-gray-500 text-sm mt-1">
                            Average course progress
                        </p>
                    </div>
                </section>

                {/* ================= ASSESSMENT OVERVIEW ================= */}

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

                    <div className="bg-[#eee5ff] rounded-3xl p-6">
                        <div className="text-3xl">
                            📝
                        </div>

                        <p className="text-3xl font-bold mt-4">
                            {overview.totalAssessmentAttempts}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                            Assessment attempts
                        </p>
                    </div>

                    <div className="bg-[#dff5ef] rounded-3xl p-6">
                        <div className="text-3xl">
                            🏆
                        </div>

                        <p className="text-3xl font-bold mt-4">
                            {overview.averageAssessmentScore}%
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                            Average assessment score
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-3xl p-6">
                        <div className="text-3xl">
                            ✅
                        </div>

                        <p className="text-3xl font-bold mt-4">
                            {overview.passedAttempts}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                            Passed attempts
                        </p>
                    </div>

                    <div className="bg-red-50 rounded-3xl p-6">
                        <div className="text-3xl">
                            ❌
                        </div>

                        <p className="text-3xl font-bold mt-4">
                            {overview.failedAttempts}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                            Failed attempts
                        </p>
                    </div>
                </section>

                {/* ================= PROGRESS SUMMARY ================= */}

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

                    <div className="bg-white rounded-3xl p-7 shadow-sm border border-pink-100">

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold">
                                    📈 Overall Progress
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Average completion across
                                    all enrolled students
                                </p>
                            </div>

                            <div className="text-3xl font-bold text-[#ef6f9f]">
                                {overview.averageProgress}%
                            </div>
                        </div>

                        <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#ef6f9f] rounded-full transition-all duration-700"
                                style={{
                                    width: `${overview.averageProgress}%`,
                                }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-7 shadow-sm border border-purple-100">

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold">
                                    🏆 Assessment Success
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    Overall assessment pass rate
                                </p>
                            </div>

                            <div className="text-3xl font-bold text-purple-600">
                                {passRate}%
                            </div>
                        </div>

                        <div className="w-full h-5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-400 rounded-full transition-all duration-700"
                                style={{
                                    width: `${passRate}%`,
                                }}
                            />
                        </div>

                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </section>

                {/* ================= STUDENT PROGRESS ================= */}

                <section className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden mb-10">

                    <div className="p-7 border-b border-gray-100">
                        <h3 className="text-xl font-bold">
                            👩‍🎓 Student Progress
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Individual learning progress
                            for enrolled students
                        </p>
                    </div>

                    {analytics.students.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="text-5xl">
                                🌱
                            </div>

                            <p className="text-gray-500 mt-3">
                                No students have enrolled yet.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">

                            {analytics.students.map(
                                (student) => (
                                    <div
                                        key={
                                            student.student._id
                                        }
                                        className="p-6 hover:bg-[#fffaf8] transition"
                                    >

                                        <div className="flex flex-col md:flex-row md:items-center gap-5">

                                            {/* Student info */}

                                            <div className="flex items-center gap-4 md:w-1/3">

                                                <div className="w-12 h-12 rounded-2xl bg-[#eee5ff] flex items-center justify-center text-xl font-bold">
                                                    {student.student.name
                                                        ?.charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <div>
                                                    <h4 className="font-bold">
                                                        {
                                                            student
                                                                .student
                                                                .name
                                                        }
                                                    </h4>

                                                    <p className="text-xs text-gray-500">
                                                        {
                                                            student
                                                                .student
                                                                .email
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Progress */}

                                            <div className="flex-1">

                                                <div className="flex justify-between mb-2 text-sm">
                                                    <span className="text-gray-500">
                                                        {
                                                            student.completedLessons
                                                        }{" "}
                                                        /{" "}
                                                        {
                                                            student.totalLessons
                                                        }{" "}
                                                        lessons
                                                    </span>

                                                    <span className="font-bold">
                                                        {
                                                            student.progressPercentage
                                                        }
                                                        %
                                                    </span>
                                                </div>

                                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                                                    <div
                                                        className="h-full bg-[#ef6f9f] rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${student.progressPercentage}%`,
                                                        }}
                                                    />

                                                </div>
                                            </div>

                                            {/* Status */}

                                            <div className="md:w-32">

                                                <span
                                                    className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                        student.status ===
                                                        "Completed"
                                                            ? "bg-green-100 text-green-700"
                                                            : student.status ===
                                                              "In Progress"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : "bg-gray-100 text-gray-600"
                                                    }`}
                                                >
                                                    {
                                                        student.status
                                                    }
                                                </span>

                                            </div>

                                        </div>
                                    </div>
                                )
                            )}

                        </div>
                    )}
                </section>

                {/* ================= ASSESSMENT PERFORMANCE ================= */}

                <section className="bg-white rounded-3xl shadow-sm border border-purple-100 overflow-hidden mb-10">

                    <div className="p-7 border-b border-gray-100">
                        <h3 className="text-xl font-bold">
                            📝 Assessment Performance
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Performance summary for each
                            assessment
                        </p>
                    </div>

                    {analytics.assessments.length === 0 ? (
                        <div className="p-10 text-center">
                            <div className="text-5xl">
                                📝
                            </div>

                            <p className="text-gray-500 mt-3">
                                No assessment attempts yet.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">

                            {analytics.assessments.map(
                                (assessment) => {

                                    const assessmentPassRate =
                                        assessment.attempts >
                                        0
                                            ? Math.round(
                                                  (assessment.passed /
                                                      assessment.attempts) *
                                                      100
                                              )
                                            : 0;

                                    return (
                                        <div
                                            key={
                                                assessment.assessmentId
                                            }
                                            className="p-6 hover:bg-[#fffaf8] transition"
                                        >

                                            <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                                                {/* Assessment */}

                                                <div className="lg:w-1/3">

                                                    <h4 className="font-bold text-lg">
                                                        {
                                                            assessment.title
                                                        }
                                                    </h4>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Total marks:{" "}
                                                        {
                                                            assessment.totalMarks
                                                        }
                                                    </p>

                                                </div>

                                                {/* Average */}

                                                <div className="lg:w-1/4">

                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Average Score
                                                    </p>

                                                    <p className="text-2xl font-bold text-[#ef6f9f]">
                                                        {
                                                            assessment.averagePercentage
                                                        }
                                                        %
                                                    </p>

                                                </div>

                                                {/* Attempts */}

                                                <div className="lg:w-1/5">

                                                    <p className="text-xs text-gray-500 mb-1">
                                                        Attempts
                                                    </p>

                                                    <p className="text-xl font-bold">
                                                        {
                                                            assessment.attempts
                                                        }
                                                    </p>

                                                </div>

                                                {/* Pass rate */}

                                                <div className="flex-1">

                                                    <div className="flex justify-between text-xs mb-2">
                                                        <span className="text-gray-500">
                                                            Pass rate
                                                        </span>

                                                        <span className="font-semibold">
                                                            {
                                                                assessmentPassRate
                                                            }
                                                            %
                                                        </span>
                                                    </div>

                                                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                                                        <div
                                                            className="h-full bg-green-400 rounded-full"
                                                            style={{
                                                                width: `${assessmentPassRate}%`,
                                                            }}
                                                        />

                                                    </div>

                                                    <div className="flex gap-3 mt-2 text-xs">

                                                        <span className="text-green-600">
                                                            ✓{" "}
                                                            {
                                                                assessment.passed
                                                            }{" "}
                                                            passed
                                                        </span>

                                                        <span className="text-red-500">
                                                            ✕{" "}
                                                            {
                                                                assessment.failed
                                                            }{" "}
                                                            failed
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>
                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}
                </section>

                {/* ================= QUICK ACTIONS ================= */}

                <section className="bg-gradient-to-r from-[#fff0f5] to-[#eee5ff] rounded-3xl p-7 border border-white">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>
                            <h3 className="text-xl font-bold">
                                Ready to manage your course? ✨
                            </h3>

                            <p className="text-gray-600 text-sm mt-1">
                                Add lessons, manage assessments
                                or preview your course.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">

                            <button
                                onClick={() =>
                                    router.push(
                                        `/instructor/courses/${courseId}`
                                    )
                                }
                                className="px-5 py-3 rounded-2xl bg-white font-semibold shadow-sm hover:shadow-md transition"
                            >
                                ⚙️ Manage Course
                            </button>

                            <button
                                onClick={() =>
                                    router.push(
                                        `/instructor/courses/${courseId}/assessments`
                                    )
                                }
                                className="px-5 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
                            >
                                📝 Assessments
                            </button>

                        </div>
                    </div>

                </section>

            </div>
        </main>
    );
}