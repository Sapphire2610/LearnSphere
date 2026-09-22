"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Course {
    _id: string;
    title: string;
}

interface Module {
    _id: string;
    title: string;
}

interface Assessment {
    _id: string;
    title: string;
    description?: string;
    course?: Course;
    module?: Module;
    totalMarks: number;
    passingMarks: number;
    duration: number;
    published: boolean;
    createdAt?: string;
}

export default function AdminAssessmentsPage() {

    const router = useRouter();

    const [assessments, setAssessments] =
        useState<Assessment[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ==================================================
    // LOAD ASSESSMENTS
    // ==================================================

    useEffect(() => {

        const token =
            localStorage.getItem("token");

        const userData =
            localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        try {

            const user =
                JSON.parse(userData);

            if (user.role !== "admin") {
                router.push("/dashboard");
                return;
            }

            fetch(
                "http://localhost:5000/api/admin/assessments",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            )
                .then(async (response) => {

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            "Failed to fetch assessments"
                        );
                    }

                    return data;
                })
                .then((data) => {

                    setAssessments(
                        data.assessments || []
                    );

                    setLoading(false);
                })
                .catch((err) => {

                    console.error(err);

                    setError(err.message);

                    setLoading(false);
                });

        } catch {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            router.push("/login");
        }

    }, [router]);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="text-5xl mb-4">
                        📝
                    </div>

                    <p className="text-gray-600">
                        Loading assessments...
                    </p>

                </div>

            </div>
        );
    }


    // ==================================================
    // ERROR
    // ==================================================

    if (error) {

        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">

                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">

                    <div className="text-4xl mb-4">
                        ⚠️
                    </div>

                    <h2 className="text-xl font-semibold text-gray-800">
                        Unable to load assessments
                    </h2>

                    <p className="text-red-500 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-5 px-5 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    // ==================================================
    // STATISTICS
    // ==================================================

    const publishedAssessments =
        assessments.filter(
            (assessment) =>
                assessment.published
        ).length;

    const draftAssessments =
        assessments.length -
        publishedAssessments;

    const totalMarks =
        assessments.reduce(
            (total, assessment) =>
                total + assessment.totalMarks,
            0
        );


    // ==================================================
    // PAGE
    // ==================================================

    return (

        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">


            {/* ==========================================
                NAVBAR
            ========================================== */}

            <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">

                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div>

                        <h1 className="text-2xl font-bold text-pink-600">
                            LearnSphere 🌸
                        </h1>

                        <p className="text-xs text-gray-500">
                            Admin Panel
                        </p>

                    </div>


                    <div className="flex items-center gap-4">

                        <button
                            onClick={() =>
                                router.push("/admin")
                            }
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() =>
                                router.push("/admin/users")
                            }
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Users
                        </button>

                        <button
                            onClick={() =>
                                router.push("/admin/courses")
                            }
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Courses
                        </button>

                    </div>

                </div>

            </nav>


            {/* ==========================================
                MAIN
            ========================================== */}

            <main className="max-w-7xl mx-auto px-6 py-10">


                {/* PAGE HEADER */}

                <div className="mb-8">

                    <p className="text-sm text-pink-500 font-medium">
                        ADMIN CONTROL CENTER
                    </p>

                    <h2 className="text-4xl font-bold text-gray-800 mt-2">
                        Assessment Management 📝
                    </h2>

                    <p className="text-gray-600 mt-2">
                        Review and monitor assessments
                        created on LearnSphere.
                    </p>

                </div>


                {/* ======================================
                    STAT CARDS
                ====================================== */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">


                    {/* TOTAL */}

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Total Assessments
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            {assessments.length}
                        </p>

                    </div>


                    {/* PUBLISHED */}

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Published
                        </p>

                        <p className="text-3xl font-bold text-green-600 mt-1">
                            {publishedAssessments}
                        </p>

                    </div>


                    {/* DRAFT */}

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">

                        <p className="text-sm text-gray-500">
                            Draft Assessments
                        </p>

                        <p className="text-3xl font-bold text-yellow-600 mt-1">
                            {draftAssessments}
                        </p>

                    </div>

                </div>


                {/* ======================================
                    TOTAL MARKS
                ====================================== */}

                <div className="bg-white/80 rounded-2xl p-5 shadow-sm mb-8">

                    <div className="flex items-center justify-between">

                        <div>

                            <p className="text-sm text-gray-500">
                                Combined Assessment Marks
                            </p>

                            <p className="text-3xl font-bold text-pink-600 mt-1">
                                {totalMarks}
                            </p>

                        </div>

                        <div className="text-4xl">
                            🎯
                        </div>

                    </div>

                </div>


                {/* ======================================
                    ASSESSMENT LIST
                ====================================== */}

                <div className="space-y-5">

                    {assessments.map(
                        (assessment) => (

                            <div
                                key={assessment._id}
                                className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-white p-6"
                            >

                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">


                                    {/* ==================================
                                        ASSESSMENT INFORMATION
                                    ================================== */}

                                    <div className="flex-1">


                                        {/* BADGES */}

                                        <div className="flex flex-wrap items-center gap-2 mb-3">


                                            {/* STATUS */}

                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    assessment.published
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-yellow-100 text-yellow-700"
                                                }`}
                                            >

                                                {assessment.published
                                                    ? "Published"
                                                    : "Draft"}

                                            </span>


                                            {/* MARKS */}

                                            <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">

                                                {assessment.totalMarks}
                                                {" "}
                                                Marks

                                            </span>


                                            {/* PASSING MARKS */}

                                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">

                                                Pass:
                                                {" "}
                                                {assessment.passingMarks}

                                            </span>

                                        </div>


                                        {/* TITLE */}

                                        <h3 className="text-2xl font-bold text-gray-800">

                                            {assessment.title}

                                        </h3>


                                        {/* DESCRIPTION */}

                                        <p className="text-gray-600 mt-2">

                                            {assessment.description ||
                                                "No description provided."}

                                        </p>


                                        {/* DETAILS */}

                                        <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">


                                            {/* COURSE */}

                                            <span>

                                                📚{" "}

                                                {assessment.course?.title ||
                                                    "Unknown Course"}

                                            </span>


                                            {/* MODULE */}

                                            <span>

                                                📖{" "}

                                                {assessment.module?.title ||
                                                    "Unknown Module"}

                                            </span>


                                            {/* DURATION */}

                                            <span>

                                                ⏱️{" "}

                                                {assessment.duration}
                                                {" "}
                                                minutes

                                            </span>

                                        </div>

                                    </div>


                                    {/* ==================================
                                        RIGHT SIDE
                                    ================================== */}

                                    <div className="lg:w-36">

                                        <div className="bg-pink-50 rounded-xl p-4 text-center">

                                            <p className="text-xs text-gray-500">
                                                Assessment
                                            </p>

                                            <p className="text-sm font-semibold text-pink-600 mt-1">
                                                #{assessment._id.slice(-6)}
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        )
                    )}

                </div>


                {/* ======================================
                    EMPTY STATE
                ====================================== */}

                {assessments.length === 0 && (

                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">

                        <div className="text-5xl mb-4">
                            📝
                        </div>

                        <h3 className="text-xl font-bold text-gray-800">
                            No assessments found
                        </h3>

                        <p className="text-gray-500 mt-2">
                            There are currently no
                            assessments on LearnSphere.
                        </p>

                    </div>

                )}

            </main>

        </div>
    );
}