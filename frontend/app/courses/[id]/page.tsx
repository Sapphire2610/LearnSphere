"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Course = {
  _id: string;
  title: string;
  description: string;
  category?: string;
  level?: string;
  price?: number;
  thumbnail?: string;
  published?: boolean;
  instructor?: {
    _id: string;
    name: string;
    email?: string;
  };
};

type Module = {
  _id: string;
  title: string;
  description?: string;
  course:
    | string
    | {
        _id: string;
      };
  order: number;
};

type Lesson = {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isFree?: boolean;
  module: string;
};

type Assessment = {
  _id: string;
  title: string;
  description?: string;
  course: string;
  module?: string;
  totalMarks: number;
  passingMarks: number;
  duration?: number;
  published?: boolean;
};

type Review = {
  _id: string;
  student:
    | {
        _id: string;
        name: string;
      }
    | string;
  course: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
};

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // REVIEWS
  // ==========================================

  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // ==========================================
  // LOAD REVIEWS
  // ==========================================

  const loadReviews = async () => {
    try {
      const response = await fetch(
        `https://learnsphere-24zf.onrender.com/api/reviews/course/${courseId}`
      );

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      const reviewList: Review[] = Array.isArray(data.reviews)
        ? data.reviews
        : [];

      setReviews(reviewList);

      const calculatedAverage =
        reviewList.length > 0
          ? reviewList.reduce(
              (sum, review) => sum + Number(review.rating || 0),
              0
            ) / reviewList.length
          : 0;

      setAverageRating(
        Number(data.averageRating ?? calculatedAverage)
      );

      setTotalReviews(
        Number(data.totalReviews ?? reviewList.length)
      );

      // Check whether current student already reviewed
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const currentUser = JSON.parse(storedUser);

          const currentUserId =
            currentUser?._id || currentUser?.id;

          const alreadyReviewed = reviewList.some((review) => {
            const studentId =
              typeof review.student === "string"
                ? review.student
                : review.student?._id;

            return (
              String(studentId) === String(currentUserId)
            );
          });

          setHasReviewed(alreadyReviewed);
        } catch (userError) {
          console.error(
            "Unable to read current user:",
            userError
          );
        }
      }
    } catch (reviewFetchError) {
      console.error(
        "Unable to fetch reviews:",
        reviewFetchError
      );
    }
  };

  // ==========================================
  // FETCH COURSE
  // ==========================================

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        // ==========================================
        // FETCH COURSE
        // ==========================================

        const courseResponse = await fetch(
          `https://learnsphere-24zf.onrender.com/api/courses/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!courseResponse.ok) {
          throw new Error("Unable to fetch course");
        }

        const courseData = await courseResponse.json();

        setCourse(courseData.course || courseData);

        // ==========================================
        // FETCH MODULES
        // ==========================================

        const moduleResponse = await fetch(
          `https://learnsphere-24zf.onrender.com/api/modules/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let moduleList: Module[] = [];

        if (moduleResponse.ok) {
          const moduleData = await moduleResponse.json();

          const modulesFromApi =
            moduleData.modules || moduleData;

          if (Array.isArray(modulesFromApi)) {
            moduleList = modulesFromApi;
            setModules(modulesFromApi);
          }
        }

        // ==========================================
        // FETCH LESSONS
        // ==========================================

        const allLessons: Lesson[] = [];

        for (const module of moduleList) {
          try {
            const lessonResponse = await fetch(
              `https://learnsphere-24zf.onrender.com/api/lessons/module/${module._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (lessonResponse.ok) {
              const lessonData =
                await lessonResponse.json();

              const moduleLessons =
                lessonData.lessons || lessonData;

              if (Array.isArray(moduleLessons)) {
                allLessons.push(
                  ...moduleLessons.map(
                    (lesson: Lesson) => ({
                      ...lesson,
                      module: module._id,
                    })
                  )
                );
              }
            }
          } catch (lessonError) {
            console.error(
              "Unable to fetch lessons:",
              lessonError
            );
          }
        }

        setLessons(allLessons);

        // ==========================================
        // FETCH ASSESSMENTS
        // ==========================================

        const assessmentResponse = await fetch(
          `https://learnsphere-24zf.onrender.com/api/assessments/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (assessmentResponse.ok) {
          const assessmentData =
            await assessmentResponse.json();

          const assessmentList =
            assessmentData.assessments ||
            assessmentData;

          if (Array.isArray(assessmentList)) {
            setAssessments(assessmentList);
          }
        }

        // ==========================================
        // CHECK ENROLLMENT
        // ==========================================

        const myCoursesResponse = await fetch(
          "https://learnsphere-24zf.onrender.com/api/courses/my-courses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (myCoursesResponse.ok) {
          const myCoursesData =
            await myCoursesResponse.json();

          const enrolledCourses =
            myCoursesData.courses ||
            myCoursesData.enrollments ||
            myCoursesData;

          if (Array.isArray(enrolledCourses)) {
            const enrolled = enrolledCourses.some(
              (item: any) => {
                const enrolledCourse =
                  item?.course || item;

                const enrolledCourseId =
                  typeof enrolledCourse === "string"
                    ? enrolledCourse
                    : enrolledCourse?._id;

                return (
                  String(enrolledCourseId) ===
                  String(courseId)
                );
              }
            );

            setIsEnrolled(enrolled);
          }
        }

        // ==========================================
        // FETCH REVIEWS
        // ==========================================

        await loadReviews();
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load course."
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
  }, [courseId, router]);

  // ==========================================
  // ENROLL IN COURSE
  // ==========================================

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        `https://learnsphere-24zf.onrender.com/api/courses/${courseId}/enroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          data.message
            ?.toLowerCase()
            .includes("already enrolled")
        ) {
          setIsEnrolled(true);

          setSuccess(
            "You are already enrolled in this course! 🎉"
          );

          return;
        }

        throw new Error(
          data.message || "Unable to enroll"
        );
      }

      setIsEnrolled(true);

      setSuccess(
        "You are successfully enrolled in this course! 🎉"
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to enroll in course."
      );
    } finally {
      setEnrolling(false);
    }
  };

  // ==========================================
  // START LEARNING
  // ==========================================

  const handleStartLearning = () => {
    router.push(`/courses/${courseId}/learn`);
  };

  // ==========================================
  // SUBMIT REVIEW
  // ==========================================

  const handleSubmitReview = async () => {
    try {
      setReviewError("");
      setReviewSuccess("");

      if (!isEnrolled) {
        setReviewError(
          "You must be enrolled in this course to leave a review."
        );
        return;
      }

      if (hasReviewed) {
        setReviewError(
          "You have already reviewed this course."
        );
        return;
      }

      if (selectedRating === 0) {
        setReviewError(
          "Please select a rating from 1 to 5 stars."
        );
        return;
      }

      if (reviewComment.trim().length < 3) {
        setReviewError(
          "Please write at least 3 characters in your review."
        );
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setSubmittingReview(true);

      const response = await fetch(
        "https://learnsphere-24zf.onrender.com/api/reviews",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course: courseId,
            rating: selectedRating,
            comment: reviewComment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (
          data.message
            ?.toLowerCase()
            .includes("already reviewed")
        ) {
          setHasReviewed(true);
        }

        throw new Error(
          data.message || "Unable to submit review."
        );
      }

      // ==========================================
      // REVIEW SUBMITTED SUCCESSFULLY
      // ==========================================

      setReviewSuccess(
        "Your review was submitted successfully! 💗"
      );

      setSelectedRating(0);
      setReviewComment("");
      setHasReviewed(true);

      // Refresh reviews
      await loadReviews();

      // ==========================================
      // REDIRECT TO DASHBOARD
      // ==========================================

      setTimeout(() => {
        router.push("/dashboard");
      }, 1200);

    } catch (err) {
      console.error(err);

      setReviewError(
        err instanceof Error
          ? err.message
          : "Unable to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">
            📚
          </div>

          <p className="text-[#6b6280] text-lg">
            Loading course...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // COURSE NOT FOUND
  // ==========================================

  if (!course) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl border border-pink-100 shadow-lg p-8 text-center max-w-md">
          <div className="text-5xl mb-4">
            😕
          </div>

          <h1 className="text-2xl font-bold text-[#4b4263] mb-3">
            Course not found
          </h1>

          <p className="text-red-500 mb-6">
            {error || "Unable to find this course."}
          </p>

          <button
            onClick={() => router.push("/courses")}
            className="px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
          >
            ← Back to Courses
          </button>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <main className="min-h-screen bg-[#fffaf8]">

      {/* NAVBAR */}

      <nav className="bg-white border-b border-pink-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <span className="text-3xl">
              🌸
            </span>

            <span className="text-2xl font-bold text-[#4b4263]">
              Learn
              <span className="text-[#ef6f9f]">
                Sphere
              </span>
            </span>
          </button>

          <div className="flex items-center gap-4">

            <button
              onClick={() => router.push("/courses")}
              className="text-[#6b6280] hover:text-[#ef6f9f] font-medium transition"
            >
              Courses
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="px-5 py-2.5 rounded-full bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
            >
              Dashboard
            </button>

          </div>
        </div>
      </nav>

      {/* COURSE HERO */}

      <section className="px-6 py-10">
        <div className="max-w-7xl mx-auto">

          <button
            onClick={() => router.push("/courses")}
            className="text-[#6b6280] hover:text-[#ef6f9f] mb-6 transition"
          >
            ← Back to Courses
          </button>

          <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-[#dff5ef] rounded-[2.5rem] p-8 md:p-12">

            <div className="grid md:grid-cols-[1fr_320px] gap-10 items-center">

              {/* COURSE INFO */}

              <div>

                <div className="flex flex-wrap gap-2 mb-5">

                  {course.category && (
                    <span className="px-4 py-2 rounded-full bg-white/80 text-sm font-semibold text-[#4b4263]">
                      📚 {course.category}
                    </span>
                  )}

                  {course.level && (
                    <span className="px-4 py-2 rounded-full bg-white/80 text-sm font-semibold text-[#4b4263]">
                      🌱 {course.level}
                    </span>
                  )}

                </div>

                <h1 className="text-4xl md:text-5xl font-bold text-[#4b4263] leading-tight">
                  {course.title}
                </h1>

                <p className="mt-5 text-lg text-[#6b6280] leading-8 max-w-3xl">
                  {course.description}
                </p>

                {/* RATING SUMMARY */}

                <div className="flex items-center gap-3 mt-6">

                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <span
                          key={star}
                          className={
                            star <= Math.round(averageRating)
                              ? "text-yellow-400 text-xl"
                              : "text-gray-300 text-xl"
                          }
                        >
                          ★
                        </span>
                      )
                    )}
                  </div>

                  <span className="font-bold text-[#4b4263]">
                    {averageRating > 0
                      ? averageRating.toFixed(1)
                      : "No ratings yet"}
                  </span>

                  <span className="text-sm text-[#6b6280]">
                    ({totalReviews}{" "}
                    {totalReviews === 1
                      ? "review"
                      : "reviews"})
                  </span>

                </div>

                {course.instructor && (
                  <div className="flex items-center gap-3 mt-6">

                    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-xl">
                      👩‍🏫
                    </div>

                    <div>
                      <p className="text-sm text-[#6b6280]">
                        Instructor
                      </p>

                      <p className="font-semibold text-[#4b4263]">
                        {course.instructor.name}
                      </p>
                    </div>

                  </div>
                )}

              </div>

              {/* ACTION CARD */}

              <div className="bg-white rounded-3xl p-6 shadow-lg">

                <div className="text-center mb-5">

                  <div className="text-5xl mb-3">
                    🎓
                  </div>

                  <p className="text-sm text-[#6b6280]">
                    Course Content
                  </p>

                  <p className="text-2xl font-bold text-[#4b4263]">
                    {modules.length} Modules
                  </p>

                  <p className="text-sm text-[#6b6280] mt-1">
                    {lessons.length} Lessons
                  </p>

                </div>

                {isEnrolled ? (
                  <button
                    onClick={handleStartLearning}
                    className="w-full py-3.5 rounded-2xl bg-[#ef6f9f] text-white font-bold hover:opacity-90 hover:-translate-y-0.5 transition"
                  >
                    Continue Learning 🚀
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className={`w-full py-3.5 rounded-2xl text-white font-bold transition ${
                      enrolling
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#ef6f9f] hover:opacity-90 hover:-translate-y-0.5"
                    }`}
                  >
                    {enrolling
                      ? "Enrolling..."
                      : "Enroll Now ✨"}
                  </button>
                )}

                {course.price !== undefined && (
                  <p className="text-center text-sm text-[#6b6280] mt-3">
                    {course.price === 0
                      ? "Free Course 🎁"
                      : `₹${course.price}`}
                  </p>
                )}

              </div>

            </div>
          </div>

          {/* SUCCESS */}

          {success && (
            <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-green-700">
              ✅ {success}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-600">
              ⚠️ {error}
            </div>
          )}

        </div>
      </section>

      {/* COURSE CONTENT */}

      <section className="px-6 pb-20">

        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_340px] gap-8">

          {/* LEFT */}

          <div>

            {/* ABOUT */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-7 mb-8">

              <h2 className="text-2xl font-bold text-[#4b4263] mb-4">
                About this course 🌷
              </h2>

              <p className="text-[#6b6280] leading-7">
                This course provides a structured
                learning experience with modules,
                video lessons and assessments.
                Complete each lesson and test your
                knowledge along the way.
              </p>

            </div>

            {/* MODULES */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-7">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-2xl font-bold text-[#4b4263]">
                    Course Content 📖
                  </h2>

                  <p className="text-[#6b6280] mt-1">
                    {modules.length} modules ·{" "}
                    {lessons.length} lessons
                  </p>
                </div>

              </div>

              {modules.length === 0 ? (
                <div className="text-center py-10">

                  <div className="text-4xl mb-3">
                    📭
                  </div>

                  <p className="text-[#6b6280]">
                    No modules available yet.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {[...modules]
                    .sort(
                      (a, b) =>
                        a.order - b.order
                    )
                    .map((module, index) => {

                      const moduleLessons =
                        lessons
                          .filter(
                            (lesson) =>
                              lesson.module ===
                              module._id
                          )
                          .sort(
                            (a, b) =>
                              a.order - b.order
                          );

                      return (
                        <div
                          key={module._id}
                          className="rounded-2xl border border-pink-100 overflow-hidden"
                        >

                          {/* MODULE HEADER */}

                          <div className="bg-[#fffaf8] p-5 flex items-center justify-between">

                            <div className="flex items-center gap-4">

                              <div className="w-11 h-11 rounded-2xl bg-[#eee5ff] flex items-center justify-center font-bold text-[#4b4263]">
                                {index + 1}
                              </div>

                              <div>

                                <h3 className="font-bold text-[#4b4263]">
                                  {module.title}
                                </h3>

                                {module.description && (
                                  <p className="text-sm text-[#6b6280] mt-1">
                                    {module.description}
                                  </p>
                                )}

                              </div>

                            </div>

                            <span className="text-sm text-[#6b6280]">
                              {moduleLessons.length} lessons
                            </span>

                          </div>

                          {/* LESSONS */}

                          {moduleLessons.length > 0 && (
                            <div className="divide-y divide-pink-50">

                              {moduleLessons.map(
                                (lesson) => (
                                  <div
                                    key={lesson._id}
                                    className="px-5 py-4 flex items-center justify-between gap-4"
                                  >

                                    <div className="flex items-center gap-3">

                                      <div className="w-9 h-9 rounded-xl bg-[#dff5ef] flex items-center justify-center">
                                        🎥
                                      </div>

                                      <div>

                                        <p className="font-medium text-[#4b4263]">
                                          {lesson.title}
                                        </p>

                                        {lesson.duration && (
                                          <p className="text-xs text-[#6b6280]">
                                            {lesson.duration} minutes
                                          </p>
                                        )}

                                      </div>

                                    </div>

                                    {lesson.isFree && (
                                      <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                                        Free
                                      </span>
                                    )}

                                  </div>
                                )
                              )}

                            </div>
                          )}

                        </div>
                      );
                    })}

                </div>
              )}

            </div>

            {/* ASSESSMENTS */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-7 mt-8">

              <div className="flex items-center justify-between mb-6">

                <div>

                  <p className="text-sm font-semibold text-[#ef6f9f] mb-1">
                    TEST YOUR KNOWLEDGE
                  </p>

                  <h2 className="text-2xl font-bold text-[#4b4263]">
                    Assessments 📝
                  </h2>

                  <p className="text-[#6b6280] mt-1">
                    Complete quizzes to check your understanding.
                  </p>

                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#eee5ff] flex items-center justify-center text-2xl">
                  ✏️
                </div>

              </div>

              {assessments.length === 0 ? (
                <div className="text-center py-10 rounded-2xl bg-[#fffaf8]">

                  <div className="text-4xl mb-3">
                    📭
                  </div>

                  <p className="text-[#6b6280]">
                    No assessments available yet.
                  </p>

                </div>
              ) : (
                <div className="space-y-4">

                  {assessments.map(
                    (assessment) => (
                      <div
                        key={assessment._id}
                        className="rounded-2xl border border-pink-100 p-5 hover:shadow-md transition"
                      >

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                          <div className="flex items-start gap-4">

                            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl flex-shrink-0">
                              📝
                            </div>

                            <div>

                              <h3 className="text-lg font-bold text-[#4b4263]">
                                {assessment.title}
                              </h3>

                              {assessment.description && (
                                <p className="text-sm text-[#6b6280] mt-1">
                                  {assessment.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2 mt-3">

                                <span className="px-3 py-1 rounded-full bg-[#eee5ff] text-xs font-semibold text-[#4b4263]">
                                  🎯{" "}
                                  {assessment.totalMarks}{" "}
                                  Marks
                                </span>

                                <span className="px-3 py-1 rounded-full bg-[#dff5ef] text-xs font-semibold text-[#4b4263]">
                                  ✓ Pass:{" "}
                                  {assessment.passingMarks}
                                </span>

                                {assessment.duration && (
                                  <span className="px-3 py-1 rounded-full bg-pink-50 text-xs font-semibold text-[#4b4263]">
                                    ⏱️{" "}
                                    {assessment.duration}{" "}
                                    min
                                  </span>
                                )}

                              </div>

                            </div>

                          </div>

                          <button
                            onClick={() =>
                              router.push(
                                `/courses/${courseId}/assessment/${assessment._id}`
                              )
                            }
                            disabled={!isEnrolled}
                            className={`px-6 py-3 rounded-2xl font-semibold whitespace-nowrap transition ${
                              isEnrolled
                                ? "bg-[#ef6f9f] text-white hover:opacity-90 hover:-translate-y-0.5"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {isEnrolled
                              ? "Take Assessment →"
                              : "Enroll to Take Quiz"}
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* RATINGS & REVIEWS */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-7 mt-8">

              {/* REVIEW HEADER */}

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

                <div>

                  <p className="text-sm font-semibold text-[#ef6f9f] mb-1">
                    STUDENT FEEDBACK
                  </p>

                  <h2 className="text-2xl font-bold text-[#4b4263]">
                    Ratings & Reviews ⭐
                  </h2>

                  <p className="text-[#6b6280] mt-1">
                    See what other learners think about this course.
                  </p>

                </div>

                {/* RATING SUMMARY */}

                <div className="bg-[#fffaf8] rounded-2xl px-6 py-4 text-center border border-pink-100">

                  <div className="text-3xl font-bold text-[#4b4263]">
                    {averageRating > 0
                      ? averageRating.toFixed(1)
                      : "—"}
                  </div>

                  <div className="flex justify-center gap-1 my-1">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <span
                          key={star}
                          className={
                            star <= Math.round(averageRating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        >
                          ★
                        </span>
                      )
                    )}

                  </div>

                  <p className="text-xs text-[#6b6280]">
                    {totalReviews}{" "}
                    {totalReviews === 1
                      ? "review"
                      : "reviews"}
                  </p>

                </div>

              </div>

              {/* WRITE REVIEW */}

              {isEnrolled && !hasReviewed && (
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-6 mb-8">

                  <h3 className="text-lg font-bold text-[#4b4263] mb-1">
                    Share your experience 💗
                  </h3>

                  <p className="text-sm text-[#6b6280] mb-5">
                    Your feedback can help other students decide if this course is right for them.
                  </p>

                  {/* STAR SELECTOR */}

                  <div className="mb-5">

                    <p className="text-sm font-semibold text-[#4b4263] mb-2">
                      Your Rating
                    </p>

                    <div className="flex gap-2">

                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() =>
                              setSelectedRating(star)
                            }
                            className={`text-3xl transition hover:scale-110 ${
                              star <= selectedRating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            aria-label={`Rate ${star} stars`}
                          >
                            ★
                          </button>
                        )
                      )}

                    </div>

                  </div>

                  {/* COMMENT */}

                  <div className="mb-5">

                    <label
                      htmlFor="reviewComment"
                      className="block text-sm font-semibold text-[#4b4263] mb-2"
                    >
                      Your Review
                    </label>

                    <textarea
                      id="reviewComment"
                      value={reviewComment}
                      onChange={(e) =>
                        setReviewComment(
                          e.target.value
                        )
                      }
                      placeholder="What did you think about this course?"
                      maxLength={500}
                      rows={4}
                      className="w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                    />

                    <p className="text-xs text-[#6b6280] text-right mt-1">
                      {reviewComment.length}/500
                    </p>

                  </div>

                  {/* REVIEW ERROR */}

                  {reviewError && (
                    <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                      ⚠️ {reviewError}
                    </div>
                  )}

                  {/* REVIEW SUCCESS */}

                  {reviewSuccess && (
                    <div className="mb-4 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                      ✅ {reviewSuccess}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className={`px-6 py-3 rounded-2xl font-semibold text-white transition ${
                      submittingReview
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#ef6f9f] hover:opacity-90 hover:-translate-y-0.5"
                    }`}
                  >
                    {submittingReview
                      ? "Submitting..."
                      : "Submit Review ✨"}
                  </button>

                </div>
              )}

              {/* ALREADY REVIEWED */}

              {isEnrolled && hasReviewed && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-8 text-green-700">
                  ✅ You have already reviewed this course. Thank you for your feedback! 💗
                </div>
              )}

              {/* NOT ENROLLED */}

              {!isEnrolled && (
                <div className="bg-[#fffaf8] border border-pink-100 rounded-2xl px-5 py-4 mb-8 text-[#6b6280]">
                  🔒 Enroll in this course to leave a rating and review.
                </div>
              )}

              {/* REVIEWS LIST */}

              <div>

                <h3 className="text-lg font-bold text-[#4b4263] mb-5">
                  Student Reviews
                </h3>

                {reviews.length === 0 ? (
                  <div className="text-center py-10 rounded-2xl bg-[#fffaf8]">

                    <div className="text-4xl mb-3">
                      💭
                    </div>

                    <p className="font-medium text-[#4b4263]">
                      No reviews yet
                    </p>

                    <p className="text-sm text-[#6b6280] mt-1">
                      Be the first student to review this course!
                    </p>

                  </div>
                ) : (
                  <div className="space-y-4">

                    {reviews.map((review) => {

                      const studentName =
                        typeof review.student === "string"
                          ? "Student"
                          : review.student?.name || "Student";

                      return (
                        <div
                          key={review._id}
                          className="rounded-2xl border border-pink-100 p-5 hover:shadow-sm transition"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex items-center gap-3">

                              <div className="w-11 h-11 rounded-full bg-[#eee5ff] flex items-center justify-center text-xl">
                                👩🏻‍🎓
                              </div>

                              <div>

                                <p className="font-semibold text-[#4b4263]">
                                  {studentName}
                                </p>

                                <p className="text-xs text-[#6b6280]">
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString()}
                                </p>

                              </div>

                            </div>

                            <div className="flex gap-1">

                              {[1, 2, 3, 4, 5].map(
                                (star) => (
                                  <span
                                    key={star}
                                    className={
                                      star <= review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }
                                  >
                                    ★
                                  </span>
                                )
                              )}

                            </div>

                          </div>

                          <p className="text-[#6b6280] leading-7 mt-4">
                            {review.comment}
                          </p>

                        </div>
                      );
                    })}

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="space-y-6">

            {/* WHAT YOU'LL LEARN */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">

              <h3 className="text-xl font-bold text-[#4b4263] mb-5">
                What you'll learn 🌱
              </h3>

              <div className="space-y-4">

                <div className="flex gap-3">
                  <span className="text-green-500">
                    ✓
                  </span>

                  <p className="text-sm text-[#6b6280]">
                    Learn through structured lessons
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-500">
                    ✓
                  </span>

                  <p className="text-sm text-[#6b6280]">
                    Watch video-based learning content
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-500">
                    ✓
                  </span>

                  <p className="text-sm text-[#6b6280]">
                    Test your knowledge with assessments
                  </p>
                </div>

                <div className="flex gap-3">
                  <span className="text-green-500">
                    ✓
                  </span>

                  <p className="text-sm text-[#6b6280]">
                    Track your learning progress
                  </p>
                </div>

              </div>

            </div>

            {/* COURSE STATS */}

            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-6">

              <h3 className="text-xl font-bold text-[#4b4263] mb-5">
                Course at a glance ✨
              </h3>

              <div className="space-y-4">

                <div className="flex justify-between">
                  <span className="text-[#6b6280]">
                    Modules
                  </span>

                  <span className="font-bold text-[#4b4263]">
                    {modules.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6b6280]">
                    Lessons
                  </span>

                  <span className="font-bold text-[#4b4263]">
                    {lessons.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6b6280]">
                    Assessments
                  </span>

                  <span className="font-bold text-[#4b4263]">
                    {assessments.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6b6280]">
                    Level
                  </span>

                  <span className="font-bold text-[#4b4263]">
                    {course.level || "All Levels"}
                  </span>
                </div>

                <div className="border-t border-white/60 pt-4 flex justify-between">

                  <span className="text-[#6b6280]">
                    Rating
                  </span>

                  <span className="font-bold text-[#4b4263]">
                    {averageRating > 0
                      ? `⭐ ${averageRating.toFixed(1)}`
                      : "Not rated"}
                  </span>

                </div>

              </div>

            </div>

          </aside>

        </div>
      </section>

      {/* FOOTER */}

      <footer className="bg-white border-t border-pink-100 px-6 py-8">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">

            <span className="text-2xl">
              🌸
            </span>

            <span className="font-bold text-lg text-[#4b4263]">
              Learn
              <span className="text-[#ef6f9f]">
                Sphere
              </span>
            </span>

          </div>

          <p className="text-sm text-[#6b6280]">
            © 2026 LearnSphere. Learn something beautiful every day. 💗
          </p>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="text-sm font-semibold text-[#ef6f9f] hover:underline"
          >
            Dashboard →
          </button>

        </div>

      </footer>

    </main>
  );
}