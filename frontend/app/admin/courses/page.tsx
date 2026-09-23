"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Instructor {
    _id: string;
    name: string;
    email: string;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    instructor?: Instructor;
    category: string;
    level: string;
    price: number;
    published: boolean;
    enrollmentCount: number;
    createdAt?: string;
}

export default function AdminCoursesPage() {
    const router = useRouter();

    const [courses, setCourses] = useState<Course[]>([]);
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

            fetch("https://learnsphere-24zf.onrender.com/api/admin/courses", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(async (res) => {
                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(
                            data.message || "Failed to fetch courses"
                        );
                    }

                    return data;
                })
                .then((data) => {
                    setCourses(data.courses);
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

    // Publish / Unpublish course
    const togglePublish = async (courseId: string) => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const response = await fetch(
                `https://learnsphere-24zf.onrender.com/api/admin/courses/${courseId}/publish`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update course");
                return;
            }

            setCourses((currentCourses) =>
                currentCourses.map((course) =>
                    course._id === courseId
                        ? {
                              ...course,
                              published: data.course.published,
                          }
                        : course
                )
            );
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        }
    };

    // Delete course
    const deleteCourse = async (courseId: string) => {
        const token = localStorage.getItem("token");

        if (!token) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `https://learnsphere-24zf.onrender.com/api/admin/courses/${courseId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to delete course");
                return;
            }

            setCourses((currentCourses) =>
                currentCourses.filter(
                    (course) => course._id !== courseId
                )
            );
        } catch (error) {
            console.error(error);
            alert("Something went wrong while deleting the course.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">📚</div>
                    <p className="text-gray-600">
                        Loading courses...
                    </p>
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
                        Unable to load courses
                    </h2>

                    <p className="text-red-500 mt-2">
                        {error}
                    </p>

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

    const publishedCourses = courses.filter(
        (course) => course.published
    ).length;

    const draftCourses = courses.filter(
        (course) => !course.published
    ).length;

    const totalEnrollments = courses.reduce(
        (total, course) => total + course.enrollmentCount,
        0
    );

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
                            onClick={() => router.push("/admin")}
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => router.push("/admin/users")}
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Users
                        </button>

                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">

                    <p className="text-sm text-pink-500 font-medium">
                        ADMIN CONTROL CENTER
                    </p>

                    <h2 className="text-4xl font-bold text-gray-800 mt-2">
                        Course Management 📚
                    </h2>

                    <p className="text-gray-600 mt-2">
                        Review, publish and manage LearnSphere courses.
                    </p>

                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Courses
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            {courses.length}
                        </p>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Published
                        </p>

                        <p className="text-3xl font-bold text-green-600 mt-1">
                            {publishedCourses}
                        </p>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Enrollments
                        </p>

                        <p className="text-3xl font-bold text-pink-600 mt-1">
                            {totalEnrollments}
                        </p>
                    </div>

                </div>

                {/* Course List */}
                <div className="space-y-5">

                    {courses.map((course) => (

                        <div
                            key={course._id}
                            className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-white p-6"
                        >

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                {/* Course Information */}
                                <div className="flex-1">

                                    <div className="flex flex-wrap items-center gap-2 mb-2">

                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                course.published
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-yellow-100 text-yellow-700"
                                            }`}
                                        >
                                            {course.published
                                                ? "Published"
                                                : "Draft"}
                                        </span>

                                        <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold">
                                            {course.category}
                                        </span>

                                        <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                                            {course.level}
                                        </span>

                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-800">
                                        {course.title}
                                    </h3>

                                    <p className="text-gray-600 mt-2">
                                        {course.description}
                                    </p>

                                    <div className="flex flex-wrap gap-5 mt-4 text-sm text-gray-500">

                                        <span>
                                            👨‍🏫{" "}
                                            {course.instructor?.name ||
                                                "Unknown Instructor"}
                                        </span>

                                        <span>
                                            🎯{" "}
                                            {course.enrollmentCount}{" "}
                                            enrollments
                                        </span>

                                        <span>
                                            💰 ₹{course.price}
                                        </span>

                                    </div>

                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-40">

                                    <button
                                        onClick={() =>
                                            togglePublish(course._id)
                                        }
                                        className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                                            course.published
                                                ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                                : "bg-green-50 text-green-700 hover:bg-green-100"
                                        }`}
                                    >
                                        {course.published
                                            ? "Unpublish"
                                            : "Publish"}
                                    </button>

                                    <button
                                        onClick={() =>
                                            deleteCourse(course._id)
                                        }
                                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition"
                                    >
                                        Delete Course
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                        <div className="text-5xl mb-4">
                            📚
                        </div>

                        <h3 className="text-xl font-bold text-gray-800">
                            No courses found
                        </h3>

                        <p className="text-gray-500 mt-2">
                            There are currently no courses on LearnSphere.
                        </p>
                    </div>
                )}

            </main>
        </div>
    );
}