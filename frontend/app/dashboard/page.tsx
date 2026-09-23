"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail?: string;
  price: number;
};

type Enrollment = {
  _id: string;
  course: Course;
  status: string;
  enrolledAt: string;
};

type Result = {
  _id: string;
  assessment: {
    title: string;
  };
  course: {
    title: string;
  };
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    const currentUser = JSON.parse(storedUser);
    setUser(currentUser);

    const fetchDashboardData = async () => {
      try {
        const [coursesResponse, resultsResponse] = await Promise.all([
          fetch("https://learnsphere-24zf.onrender.com/api/courses/my-courses", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("https://learnsphere-24zf.onrender.com/api/results/my-results", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const coursesData = await coursesResponse.json();
        const resultsData = await resultsResponse.json();

        if (coursesResponse.ok) {
          setCourses(coursesData.enrollments || []);
        }

        if (resultsResponse.ok) {
          setResults(resultsData.results || []);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    router.push("/login");
  };

  const completedCourses = courses.filter(
    (course) => course.status === "completed"
  ).length;

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce(
            (total, result) => total + result.percentage,
            0
          ) / results.length
        )
      : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🌸</div>
          <p className="text-[#6b6178]">
            Preparing your learning space...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">

      {/* Navbar */}
      <nav className="bg-white border-b border-pink-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <span className="text-3xl">🎓</span>

            <span className="text-2xl font-bold">
              Learn<span className="text-[#ef6f9f]">Sphere</span>
            </span>
          </button>

          <div className="flex items-center gap-4">

            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold">
                {user?.name}
              </p>

              <p className="text-xs text-[#81778d]">
                Student 🌸
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#ffe1eb] flex items-center justify-center text-xl">
              👩🏻‍🎓
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-pink-200 px-4 py-2 text-sm hover:bg-pink-50 transition"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* Dashboard */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="rounded-[2rem] bg-gradient-to-r from-[#ffe9f1] to-[#eee7ff] p-8 md:p-10 relative overflow-hidden">

          <div className="relative z-10">

            <p className="text-sm font-medium text-[#81778d]">
              Welcome back, {user?.name || "Learner"}! 🌷
            </p>

            <h1 className="mt-2 text-3xl md:text-4xl font-bold">
              Ready to keep learning?
            </h1>

            <p className="mt-3 max-w-xl text-[#71677e]">
              Continue your courses, complete assessments and
              keep growing your skills every day.
            </p>

            <button
              onClick={() => router.push("/courses")}
              className="mt-6 rounded-xl bg-[#ef6f9f] px-6 py-3 font-semibold text-white shadow-sm hover:bg-[#e85c91] transition"
            >
              Explore Courses ✨
            </button>

          </div>

          <div className="absolute right-8 bottom-[-10px] text-8xl opacity-80 hidden md:block">
            🌸
          </div>

        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-5">

          <div className="rounded-2xl bg-white border border-pink-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📚</span>
              <span className="text-3xl font-bold">
                {courses.length}
              </span>
            </div>

            <p className="mt-4 text-[#81778d]">
              Enrolled Courses
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-pink-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🌱</span>
              <span className="text-3xl font-bold">
                {completedCourses}
              </span>
            </div>

            <p className="mt-4 text-[#81778d]">
              Completed Courses
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-pink-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-3xl">📊</span>
              <span className="text-3xl font-bold">
                {averageScore}%
              </span>
            </div>

            <p className="mt-4 text-[#81778d]">
              Average Score
            </p>
          </div>

        </div>

        {/* My Courses */}
        <section className="mt-12">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-2xl font-bold">
                My Courses 📚
              </h2>

              <p className="mt-1 text-sm text-[#81778d]">
                Continue where you left off.
              </p>
            </div>

            <button
              onClick={() => router.push("/courses")}
              className="text-sm font-semibold text-[#ef6f9f] hover:underline"
            >
              View all →
            </button>

          </div>

          {courses.length === 0 ? (

            <div className="rounded-2xl border border-pink-100 bg-white p-10 text-center">

              <div className="text-5xl">
                🌷
              </div>

              <h3 className="mt-4 text-xl font-bold">
                No courses yet
              </h3>

              <p className="mt-2 text-[#81778d]">
                Start your learning journey by exploring our courses.
              </p>

              <button
                onClick={() => router.push("/courses")}
                className="mt-5 rounded-xl bg-[#ef6f9f] px-6 py-3 text-white font-semibold"
              >
                Explore Courses
              </button>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

              {courses.map((enrollment) => (

                <div
                  key={enrollment._id}
                  className="rounded-3xl bg-white border border-pink-100 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition"
                >

                  {/* Course image */}
                  <div className="h-40 bg-gradient-to-br from-[#ffe0eb] to-[#e9ddff] flex items-center justify-center text-6xl">
                    📚
                  </div>

                  <div className="p-6">

                    <span className="inline-block rounded-full bg-[#fff0f5] px-3 py-1 text-xs text-[#ef6f9f]">
                      {enrollment.course?.category || "General"}
                    </span>

                    <h3 className="mt-3 text-xl font-bold">
                      {enrollment.course?.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#81778d] line-clamp-2">
                      {enrollment.course?.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-sm">

                      <span className="text-[#81778d]">
                        🌱 {enrollment.course?.level}
                      </span>

                      <span
                        className={
                          enrollment.status === "completed"
                            ? "text-green-500 font-medium"
                            : "text-[#ef6f9f] font-medium"
                        }
                      >
                        {enrollment.status === "completed"
                          ? "Completed ✓"
                          : "In Progress"}
                      </span>

                    </div>

                    <button
                      onClick={() => router.push("/courses")}
                      className="mt-5 w-full rounded-xl bg-[#f7e9ff] py-3 font-semibold hover:bg-[#eee0fa] transition"
                    >
                      Continue Learning →
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* Results */}
        <section className="mt-12">

          <div className="mb-6">

            <h2 className="text-2xl font-bold">
              Recent Results 📝
            </h2>

            <p className="mt-1 text-sm text-[#81778d]">
              Keep an eye on your assessment progress.
            </p>

          </div>

          {results.length === 0 ? (

            <div className="rounded-2xl bg-white border border-pink-100 p-8 text-center">

              <div className="text-4xl">
                ✨
              </div>

              <p className="mt-3 text-[#81778d]">
                You haven't completed any assessments yet.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {results.map((result) => (

                <div
                  key={result._id}
                  className="rounded-2xl bg-white border border-pink-100 p-5 shadow-sm"
                >

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                    <div>

                      <h3 className="font-bold">
                        {result.assessment.title}
                      </h3>

                      <p className="mt-1 text-sm text-[#81778d]">
                        {result.course.title}
                      </p>

                    </div>

                    <div className="flex items-center gap-6">

                      <div className="text-center">
                        <p className="text-xl font-bold">
                          {Math.round(result.percentage)}%
                        </p>

                        <p className="text-xs text-[#81778d]">
                          {result.score}/{result.totalMarks} marks
                        </p>
                      </div>

                      <span
                        className={
                          result.passed
                            ? "rounded-full bg-[#dff5ef] px-4 py-2 text-sm text-green-600"
                            : "rounded-full bg-[#fff0f5] px-4 py-2 text-sm text-[#ef6f9f]"
                        }
                      >
                        {result.passed
                          ? "Passed 🎉"
                          : "Keep Learning 🌱"}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </section>

      {/* Footer */}
      <footer className="border-t border-pink-100 bg-[#faf5ff] py-8 text-center">

        <p className="text-sm text-[#81778d]">
          Made with 💗 for learners everywhere · © 2026 LearnSphere
        </p>

      </footer>

    </main>
  );
}