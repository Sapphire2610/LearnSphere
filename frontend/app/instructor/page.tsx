"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Instructor = {
    _id: string;
    name: string;
    email: string;
};

type Course = {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    price: number;
    published: boolean;
    thumbnail?: string;
    instructor?: Instructor | string;
};

type User = {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    role: string;
};

export default function InstructorDashboard() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (!token || !storedUser) {
            router.push("/login");
            return;
        }

        try {
            const parsedUser: User = JSON.parse(storedUser);

            setUser(parsedUser);

            if (parsedUser.role !== "instructor") {
                router.push("/dashboard");
                return;
            }

            fetchCourses(token);
        } catch (error) {
            console.error("User parsing error:", error);
            router.push("/login");
        }
    }, [router]);

    const fetchCourses = async (token: string) => {
        try {
            setLoading(true);

            const response = await fetch(
                "https://learnsphere-24zf.onrender.com/api/courses",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch courses"
                );
            }

            const allCourses: Course[] = Array.isArray(data)
                ? data
                : data.courses || [];

            const storedUser = localStorage.getItem("user");

            if (!storedUser) {
                setCourses([]);
                return;
            }

            const currentUser: User = JSON.parse(storedUser);

            const loggedInInstructorId =
                currentUser._id || currentUser.id;

            const instructorCourses = allCourses.filter(
                (course) => {
                    if (!course.instructor) {
                        return false;
                    }

                    const courseInstructorId =
                        typeof course.instructor === "string"
                            ? course.instructor
                            : course.instructor._id;

                    return (
                        String(courseInstructorId) ===
                        String(loggedInInstructorId)
                    );
                }
            );

            setCourses(instructorCourses);
        } catch (error) {
            console.error(
                "Fetch courses error:",
                error
            );

            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
    };

    const totalCourses = courses.length;

    const publishedCourses = courses.filter(
        (course) => course.published
    ).length;

    const draftCourses = courses.filter(
        (course) => !course.published
    ).length;

    return (
        <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">

            {/* ================= NAVBAR ================= */}

            <nav className="border-b border-pink-100 bg-white/80 backdrop-blur">

                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

                    {/* LOGO */}

                    <button
                        onClick={() => router.push("/")}
                        className="text-2xl font-bold text-[#ef6f9f]"
                    >
                        🌸 LearnSphere
                    </button>

                    {/* NAVIGATION */}

                    <div className="flex items-center gap-3">

                        {/* INSTRUCTOR ROLE */}

                        <span className="hidden text-sm font-medium text-[#766d86] sm:block">
                            Instructor 🌸
                        </span>

                        {/* STUDENT VIEW */}

                        <button
                            onClick={() =>
                                router.push("/courses")
                            }
                            className="rounded-full bg-[#eee5ff] px-5 py-2 text-sm font-semibold text-[#4b4263] transition hover:bg-purple-100"
                        >
                            🎓 Student View
                        </button>

                        {/* LOGOUT */}

                        <button
                            onClick={handleLogout}
                            className="rounded-full bg-[#ef6f9f] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </nav>

            {/* ================= MAIN ================= */}

            <section className="mx-auto max-w-7xl px-6 py-10">

                {/* HEADER */}

                <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">

                    <div>

                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#ef6f9f]">
                            Instructor Dashboard
                        </p>

                        <h1 className="text-4xl font-bold">
                            Welcome,{" "}
                            {user?.name || "Instructor"} 👋
                        </h1>

                        <p className="mt-2 text-[#766d86]">
                            Create courses, organize lessons and
                            manage your learning content.
                        </p>

                    </div>

                    {/* CREATE COURSE */}

                    <button
                        onClick={() =>
                            router.push(
                                "/instructor/courses/create"
                            )
                        }
                        className="rounded-2xl bg-[#ef6f9f] px-6 py-3 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                        ＋ Create New Course
                    </button>

                </div>

                {/* ================= STATS ================= */}

                <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    {/* TOTAL */}

                    <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">

                        <div className="mb-3 text-3xl">
                            📚
                        </div>

                        <p className="text-sm text-[#766d86]">
                            Total Courses
                        </p>

                        <p className="mt-1 text-3xl font-bold">
                            {totalCourses}
                        </p>

                    </div>

                    {/* PUBLISHED */}

                    <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">

                        <div className="mb-3 text-3xl">
                            🌷
                        </div>

                        <p className="text-sm text-[#766d86]">
                            Published Courses
                        </p>

                        <p className="mt-1 text-3xl font-bold">
                            {publishedCourses}
                        </p>

                    </div>

                    {/* DRAFT */}

                    <div className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm">

                        <div className="mb-3 text-3xl">
                            📝
                        </div>

                        <p className="text-sm text-[#766d86]">
                            Draft Courses
                        </p>

                        <p className="mt-1 text-3xl font-bold">
                            {draftCourses}
                        </p>

                    </div>

                </div>

                {/* ================= COURSE SECTION ================= */}

                <div className="mb-6">

                    <h2 className="text-2xl font-bold">
                        My Courses
                    </h2>

                    <p className="mt-1 text-sm text-[#766d86]">
                        Manage your courses and learning content.
                    </p>

                </div>

                {/* ================= LOADING ================= */}

                {loading && (

                    <div className="rounded-3xl border border-pink-100 bg-white p-12 text-center shadow-sm">

                        <div className="mb-4 text-4xl">
                            🌸
                        </div>

                        <p className="text-lg font-medium">
                            Loading your courses...
                        </p>

                    </div>

                )}

                {/* ================= NO COURSES ================= */}

                {!loading && courses.length === 0 && (

                    <div className="rounded-3xl border border-pink-100 bg-white p-12 text-center shadow-sm">

                        <div className="mb-5 text-6xl">
                            📚
                        </div>

                        <h3 className="text-2xl font-bold">
                            No courses yet
                        </h3>

                        <p className="mx-auto mt-2 max-w-md text-[#766d86]">
                            You haven't created any courses yet.
                            Start by creating your first course and
                            adding modules and lessons.
                        </p>

                        <button
                            onClick={() =>
                                router.push(
                                    "/instructor/courses/create"
                                )
                            }
                            className="mt-6 rounded-2xl bg-[#ef6f9f] px-6 py-3 font-semibold text-white shadow-md hover:opacity-90"
                        >
                            ＋ Create Your First Course
                        </button>

                    </div>

                )}

                {/* ================= COURSE GRID ================= */}

                {!loading && courses.length > 0 && (

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                        {courses.map((course) => (

                            <div
                                key={course._id}
                                className="group overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                {/* IMAGE */}

                                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-[#eee5ff] to-[#dff5ef]">

                                    {course.thumbnail ? (

                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="h-full w-full object-cover"
                                        />

                                    ) : (

                                        <span className="text-6xl">
                                            📚
                                        </span>

                                    )}

                                </div>

                                {/* CONTENT */}

                                <div className="p-6">

                                    <div className="mb-3 flex items-center justify-between">

                                        <span className="rounded-full bg-[#eee5ff] px-3 py-1 text-xs font-semibold">
                                            {course.category}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                course.published
                                                    ? "bg-[#dff5ef] text-green-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                            }`}
                                        >
                                            {course.published
                                                ? "Published"
                                                : "Draft"}
                                        </span>

                                    </div>

                                    <h3 className="line-clamp-2 text-xl font-bold">
                                        {course.title}
                                    </h3>

                                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#766d86]">
                                        {course.description}
                                    </p>

                                    <div className="mt-5 flex items-center justify-between text-sm">

                                        <span>
                                            🎓 {course.level}
                                        </span>

                                        <span className="font-semibold">
                                            {course.price === 0
                                                ? "Free"
                                                : `₹${course.price}`}
                                        </span>

                                    </div>

                                    {/* MANAGE COURSE */}

                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/instructor/courses/${course._id}`
                                            )
                                        }
                                        className="mt-5 w-full rounded-2xl bg-[#4b4263] px-5 py-3 font-semibold text-white transition hover:bg-[#3d3553]"
                                    >
                                        🛠️ Manage Course
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </section>

            {/* ================= FOOTER ================= */}

            <footer className="border-t border-pink-100 bg-white py-8 text-center">

                <p className="text-sm text-[#766d86]">
                    🌸 LearnSphere • Instructor Portal
                </p>

            </footer>

        </main>
    );
}