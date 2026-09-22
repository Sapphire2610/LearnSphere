"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Course = {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  thumbnail?: string;
  price: number;
  instructor?: {
    name: string;
    email: string;
  };
};

type Enrollment = {
  course: {
    _id: string;
  };
  status: string;
};

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/courses"
        );

        const data = await response.json();

        if (response.ok) {
          setCourses(data.courses || []);
        }

        const token = localStorage.getItem("token");

        if (token) {
          const enrollmentResponse = await fetch(
            "http://localhost:5000/api/courses/my-courses",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const enrollmentData =
            await enrollmentResponse.json();

          if (enrollmentResponse.ok) {
            setEnrollments(
              enrollmentData.enrollments || []
            );
          }
        }
      } catch (error) {
        console.error(
          "Course loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const isEnrolled = (courseId: string) => {
    return enrollments.some(
      (enrollment) =>
        enrollment.course?._id === courseId
    );
  };

  const handleEnroll = async (courseId: string) => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setEnrolling(courseId);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/courses/${courseId}/enroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Unable to enroll."
        );
        return;
      }

      setMessage("🎉 Successfully enrolled!");

      const enrollmentResponse = await fetch(
        "http://localhost:5000/api/courses/my-courses",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const enrollmentData =
        await enrollmentResponse.json();

      if (enrollmentResponse.ok) {
        setEnrollments(
          enrollmentData.enrollments || []
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to connect to LearnSphere server."
      );
    } finally {
      setEnrolling(null);
    }
  };

  // ==========================================
  // FILTER OPTIONS
  // ==========================================

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        courses
          .map((course) => course.category)
          .filter(Boolean)
      )
    );

    return ["All", ...uniqueCategories];
  }, [courses]);

  const levels = [
    "All",
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  // ==========================================
  // FILTER COURSES
  // ==========================================

  const filteredCourses = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return courses.filter((course) => {
      // Search
      const matchesSearch =
        searchText === "" ||
        course.title
          .toLowerCase()
          .includes(searchText) ||
        course.description
          .toLowerCase()
          .includes(searchText) ||
        course.category
          .toLowerCase()
          .includes(searchText);

      // Category
      const matchesCategory =
        category === "All" ||
        course.category === category;

      // Level
      const matchesLevel =
        level === "All" ||
        course.level === level;

      // Price
      let matchesPrice = true;

      if (priceFilter === "Free") {
        matchesPrice = course.price === 0;
      }

      if (priceFilter === "Paid") {
        matchesPrice = course.price > 0;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLevel &&
        matchesPrice
      );
    });
  }, [
    courses,
    search,
    category,
    level,
    priceFilter,
  ]);

  // ==========================================
  // CLEAR FILTERS
  // ==========================================

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLevel("All");
    setPriceFilter("All");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "All" ||
    level !== "All" ||
    priceFilter !== "All";

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">

      {/* ================= NAVBAR ================= */}

      <nav className="bg-white border-b border-pink-100 px-6 py-4">

        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="flex items-center gap-2"
          >
            <span className="text-3xl">
              🎓
            </span>

            <span className="text-2xl font-bold">
              Learn
              <span className="text-[#ef6f9f]">
                Sphere
              </span>
            </span>
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="rounded-xl px-4 py-2 text-sm hover:bg-pink-50 transition"
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                router.push("/login")
              }
              className="rounded-xl border border-pink-200 px-4 py-2 text-sm hover:bg-pink-50 transition"
            >
              Login
            </button>

          </div>

        </div>

      </nav>

      {/* ================= HEADER ================= */}

      <section className="max-w-7xl mx-auto px-6 pt-12">

        <div className="text-center">

          <span className="inline-block rounded-full bg-[#fff0f5] border border-pink-100 px-5 py-2 text-sm">
            🌸 Learn something wonderful
          </span>

          <h1 className="mt-5 text-4xl md:text-5xl font-bold">
            Explore Our{" "}
            <span className="text-[#ef6f9f]">
              Courses
            </span>{" "}
            📚
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-[#81778d]">
            Discover courses designed to help you
            learn new skills, grow your knowledge
            and reach your goals.
          </p>

        </div>

        {/* ================= SEARCH ================= */}

        <div className="max-w-3xl mx-auto mt-8">

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
              🔎
            </span>

            <input
              type="text"
              placeholder="Search courses, topics or categories..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-2xl border border-pink-100 bg-white px-12 py-4 outline-none focus:ring-2 focus:ring-pink-200 shadow-sm"
            />

          </div>

        </div>

        {/* ================= FILTERS ================= */}

        <div className="max-w-5xl mx-auto mt-5">

          <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">

            <div className="flex flex-col md:flex-row gap-4">

              {/* Category */}

              <div className="flex-1">

                <label className="block text-xs font-semibold text-[#81778d] mb-2">
                  🏷️ Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* Level */}

              <div className="flex-1">

                <label className="block text-xs font-semibold text-[#81778d] mb-2">
                  📊 Level
                </label>

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value)
                  }
                  className="w-full rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                >
                  {levels.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>

              </div>

              {/* Price */}

              <div className="flex-1">

                <label className="block text-xs font-semibold text-[#81778d] mb-2">
                  💰 Price
                </label>

                <select
                  value={priceFilter}
                  onChange={(e) =>
                    setPriceFilter(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-pink-100 bg-[#fffafc] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pink-200"
                >
                  <option value="All">
                    All Courses
                  </option>

                  <option value="Free">
                    Free Courses
                  </option>

                  <option value="Paid">
                    Paid Courses
                  </option>
                </select>

              </div>

              {/* Clear */}

              <div className="flex items-end">

                <button
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="w-full md:w-auto rounded-xl px-5 py-3 text-sm font-semibold border border-pink-200 bg-[#fff0f5] text-[#ef6f9f] hover:bg-pink-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ✨ Clear
                </button>

              </div>

            </div>

            {/* Filter summary */}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">

              <p className="text-[#81778d]">
                Showing{" "}
                <span className="font-bold text-[#4b4263]">
                  {filteredCourses.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-[#4b4263]">
                  {courses.length}
                </span>{" "}
                courses
              </p>

              {hasActiveFilters && (
                <span className="text-[#ef6f9f] font-medium">
                  Filters applied 🌷
                </span>
              )}

            </div>

          </div>

        </div>

        {/* ================= MESSAGE ================= */}

        {message && (
          <div className="max-w-2xl mx-auto mt-5 rounded-xl bg-[#fff0f5] border border-pink-100 px-5 py-3 text-center text-sm">
            {message}
          </div>
        )}

      </section>

      {/* ================= COURSES ================= */}

      <section className="max-w-7xl mx-auto px-6 py-12">

        {loading ? (

          <div className="text-center py-20">

            <div className="text-5xl mb-4">
              🌷
            </div>

            <p className="text-[#81778d]">
              Finding lovely courses for you...
            </p>

          </div>

        ) : filteredCourses.length === 0 ? (

          <div className="text-center py-20">

            <div className="text-6xl">
              🥺
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              No courses found
            </h2>

            <p className="mt-2 text-[#81778d]">
              Try changing your search or filters.
            </p>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-[#ef6f9f] px-6 py-3 text-sm font-semibold text-white hover:bg-[#e85c91] transition"
              >
                Clear Filters ✨
              </button>
            )}

          </div>

        ) : (

          <>

            {/* Results heading */}

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-2xl font-bold">
                  Available Courses
                </h2>

                <p className="text-sm text-[#81778d] mt-1">
                  Find your next learning adventure 🌱
                </p>
              </div>

              <div className="hidden sm:block rounded-full bg-[#eee5ff] px-4 py-2 text-sm font-semibold">
                {filteredCourses.length}{" "}
                course
                {filteredCourses.length !== 1
                  ? "s"
                  : ""}
              </div>

            </div>

            {/* Course cards */}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">

              {filteredCourses.map(
                (course) => {

                  const enrolled =
                    isEnrolled(course._id);

                  return (

                    <div
                      key={course._id}
                      onClick={() =>
                        router.push(
                          `/courses/${course._id}`
                        )
                      }
                      className="group cursor-pointer overflow-hidden rounded-3xl bg-white border border-pink-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition"
                    >

                      {/* ================= THUMBNAIL ================= */}

                      <div className="h-48 bg-gradient-to-br from-[#ffe0eb] via-[#fff0f5] to-[#e8ddff] flex items-center justify-center text-7xl relative">

                        {course.thumbnail ? (

                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />

                        ) : (

                          "📚"

                        )}

                        {/* Level */}

                        <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm">
                          {course.level}
                        </div>

                        {/* Price badge */}

                        <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold shadow-sm">
                          {course.price === 0
                            ? "Free"
                            : `₹${course.price}`}
                        </div>

                      </div>

                      {/* ================= CONTENT ================= */}

                      <div className="p-6">

                        <span className="inline-block rounded-full bg-[#fff0f5] px-3 py-1 text-xs text-[#ef6f9f]">
                          {course.category}
                        </span>

                        <h2 className="mt-3 text-xl font-bold group-hover:text-[#ef6f9f] transition">
                          {course.title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#81778d] line-clamp-3">
                          {course.description}
                        </p>

                        {/* Instructor */}

                        {course.instructor && (
                          <div className="mt-4 flex items-center gap-2 text-sm text-[#81778d]">

                            <span className="w-8 h-8 rounded-full bg-[#eee5ff] flex items-center justify-center">
                              👩🏻‍🏫
                            </span>

                            <span>
                              {course.instructor.name}
                            </span>

                          </div>
                        )}

                        {/* Bottom */}

                        <div className="mt-6 flex items-center justify-between">

                          <span className="font-bold text-[#4b4263]">
                            {course.price === 0
                              ? "Free 💗"
                              : `₹${course.price}`}
                          </span>

                          {enrolled ? (

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  "/dashboard"
                                );
                              }}
                              className="rounded-xl bg-[#dff5ef] px-5 py-2.5 text-sm font-semibold text-green-600 hover:bg-[#d1eee7] transition"
                            >
                              Enrolled ✓
                            </button>

                          ) : (

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnroll(
                                  course._id
                                );
                              }}
                              disabled={
                                enrolling ===
                                course._id
                              }
                              className="rounded-xl bg-[#ef6f9f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e85c91] transition disabled:opacity-60"
                            >
                              {enrolling ===
                              course._id
                                ? "Joining... 🌸"
                                : "Enroll 💕"}
                            </button>

                          )}

                        </div>

                      </div>

                    </div>

                  );
                }
              )}

            </div>

          </>

        )}

      </section>

      {/* ================= CTA ================= */}

      <section className="px-6 pb-16">

        <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-r from-[#ffeaf2] to-[#eee7ff] px-8 py-12 text-center">

          <div className="text-4xl">
            🌱 ✨ 📚
          </div>

          <h2 className="mt-4 text-3xl font-bold">
            Keep growing, one lesson at a time.
          </h2>

          <p className="mt-3 text-[#81778d]">
            Your next skill is waiting for you.
          </p>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-pink-100 bg-[#faf5ff] py-7 text-center">

        <p className="text-sm text-[#81778d]">
          LearnSphere · Learn without limits 🌸
        </p>

      </footer>

    </main>
  );
}