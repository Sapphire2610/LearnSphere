"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Statistics {
    totalUsers: number;
    totalStudents: number;
    totalInstructors: number;
    totalAdmins: number;
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalAssessments: number;
    totalEnrollments: number;
}

export default function AdminDashboard() {
    const router = useRouter();

    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (user.role !== "admin") {
                router.push("/dashboard");
                return;
            }

            fetch("http://localhost:5000/api/admin/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(async (res) => {
                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.message || "Failed to fetch dashboard");
                    }

                    return data;
                })
                .then((data) => {
                    setStatistics(data.statistics);
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">🌸</div>
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800">
                        Unable to load dashboard
                    </h2>
                    <p className="text-red-500 mt-2">{error}</p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-5 px-5 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!statistics) return null;

    const statCards = [
        {
            title: "Total Users",
            value: statistics.totalUsers,
            icon: "👥",
        },
        {
            title: "Students",
            value: statistics.totalStudents,
            icon: "🎓",
        },
        {
            title: "Instructors",
            value: statistics.totalInstructors,
            icon: "👨‍🏫",
        },
        {
            title: "Admins",
            value: statistics.totalAdmins,
            icon: "🛡️",
        },
        {
            title: "Total Courses",
            value: statistics.totalCourses,
            icon: "📚",
        },
        {
            title: "Published Courses",
            value: statistics.publishedCourses,
            icon: "✅",
        },
        {
            title: "Draft Courses",
            value: statistics.draftCourses,
            icon: "📝",
        },
        {
            title: "Assessments",
            value: statistics.totalAssessments,
            icon: "🧪",
        },
        {
            title: "Enrollments",
            value: statistics.totalEnrollments,
            icon: "🎯",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

            {/* Navbar */}
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
                            onClick={() => router.push("/dashboard")}
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Student Dashboard
                        </button>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 rounded-xl bg-pink-500 text-white text-sm hover:bg-pink-600 transition"
                        >
                            Logout
                        </button>

                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-10">
                    <p className="text-sm text-pink-500 font-medium">
                        ADMIN CONTROL CENTER
                    </p>

                    <h2 className="text-4xl font-bold text-gray-800 mt-2">
                        Dashboard 📊
                    </h2>

                    <p className="text-gray-600 mt-2">
                        Monitor users, courses, assessments and enrollments.
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                    {statCards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white hover:shadow-md transition"
                        >
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        {card.title}
                                    </p>

                                    <p className="text-3xl font-bold text-gray-800 mt-2">
                                        {card.value}
                                    </p>
                                </div>

                                <div className="text-4xl">
                                    {card.icon}
                                </div>

                            </div>
                        </div>
                    ))}

                </div>

                {/* Course Overview */}
                <section className="mt-10">

                    <h3 className="text-2xl font-bold text-gray-800 mb-5">
                        Course Overview 📚
                    </h3>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white">

                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">
                                Published Courses
                            </span>

                            <span className="font-semibold text-gray-800">
                                {statistics.publishedCourses} /{" "}
                                {statistics.totalCourses}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3">

                            <div
                                className="bg-pink-500 h-3 rounded-full transition-all"
                                style={{
                                    width:
                                        statistics.totalCourses > 0
                                            ? `${(statistics.publishedCourses /
                                                statistics.totalCourses) *
                                            100
                                            }%`
                                            : "0%",
                                }}
                            />

                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">

                            <div className="bg-green-50 rounded-xl p-4">
                                <p className="text-sm text-gray-500">
                                    Published
                                </p>

                                <p className="text-2xl font-bold text-green-600">
                                    {statistics.publishedCourses}
                                </p>
                            </div>

                            <div className="bg-yellow-50 rounded-xl p-4">
                                <p className="text-sm text-gray-500">
                                    Drafts
                                </p>

                                <p className="text-2xl font-bold text-yellow-600">
                                    {statistics.draftCourses}
                                </p>
                            </div>

                        </div>

                    </div>

                </section>

                {/* Quick Actions */}
                <section className="mt-10">

                    <h3 className="text-2xl font-bold text-gray-800 mb-5">
                        Quick Actions ⚡
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        <button
                            onClick={() => router.push("/admin/users")}
                            className="bg-white/80 p-6 rounded-2xl text-left shadow-sm border border-white hover:shadow-md hover:-translate-y-1 transition"
                        >
                            <div className="text-3xl mb-3">👥</div>

                            <h4 className="font-bold text-gray-800">
                                Manage Users
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                                View and manage LearnSphere users.
                            </p>
                        </button>

                        <button
                            onClick={() => router.push("/admin/courses")}
                            className="bg-white/80 p-6 rounded-2xl text-left shadow-sm border border-white hover:shadow-md hover:-translate-y-1 transition"
                        >
                            <div className="text-3xl mb-3">📚</div>

                            <h4 className="font-bold text-gray-800">
                                Manage Courses
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                                Review and manage courses.
                            </p>
                        </button>

                        <button
                            onClick={() => router.push("/admin/assessments")}
                            className="bg-white/80 p-6 rounded-2xl text-left shadow-sm border border-white hover:shadow-md hover:-translate-y-1 transition"
                        >
                            <div className="text-3xl mb-3">📝</div>

                            <h4 className="font-bold text-gray-800">
                                Assessments
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                                View platform assessments.
                            </p>
                        </button>

                    </div>

                </section>

            </main>
        </div>
 
);
}