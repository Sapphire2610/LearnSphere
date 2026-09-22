"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Module = {
  _id: string;
  title: string;
  description: string;
  order: number;
};

type Lesson = {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration?: number;
  order: number;
  isFree?: boolean;
  module?: string;
};

type ProgressItem = {
  lesson?: {
    _id: string;
    title: string;
  };
  completed: boolean;
};

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [completing, setCompleting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD COURSE CONTENT + PROGRESS
  // --------------------------------------------------

  useEffect(() => {
    const loadLearningContent = async () => {
      try {
        setLoading(true);
        setError("");

        // Get course modules
        const moduleResponse = await fetch(
          `http://localhost:5000/api/modules/course/${courseId}`
        );

        const moduleData = await moduleResponse.json();

        if (!moduleResponse.ok) {
          setError(moduleData.message || "Unable to load modules.");
          return;
        }

        const loadedModules: Module[] = moduleData.modules || [];

        loadedModules.sort((a, b) => a.order - b.order);

        setModules(loadedModules);

        // Get lessons from all modules
        const allLessons: Lesson[] = [];

        for (const module of loadedModules) {
          const lessonResponse = await fetch(
            `http://localhost:5000/api/lessons/module/${module._id}`
          );

          const lessonData = await lessonResponse.json();

          if (lessonResponse.ok) {
            const moduleLessons: Lesson[] = lessonData.lessons || [];

            // Remember which module each lesson belongs to
            moduleLessons.forEach((lesson) => {
              lesson.module = module._id;
            });

            allLessons.push(...moduleLessons);
          }
        }

        allLessons.sort((a, b) => a.order - b.order);

        setLessons(allLessons);

        // Select first lesson
        if (allLessons.length > 0) {
          setSelectedLesson(allLessons[0]);
        }

        // ----------------------------------------------
        // GET EXISTING PROGRESS
        // ----------------------------------------------

        const token = localStorage.getItem("token");

        if (token) {
          const progressResponse = await fetch(
            `http://localhost:5000/api/progress/course/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const progressData = await progressResponse.json();

          if (progressResponse.ok) {
            const completed = (progressData.progress || [])
              .filter((item: ProgressItem) => item.completed)
              .map((item: ProgressItem) => item.lesson?._id)
              .filter(Boolean) as string[];

            setCompletedLessons(completed);
          }
        }
      } catch (error) {
        console.error("Learning content error:", error);

        setError(
          "Unable to connect to LearnSphere server."
        );
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadLearningContent();
    }
  }, [courseId]);

  // --------------------------------------------------
  // MARK LESSON AS COMPLETE
  // --------------------------------------------------

  const handleComplete = async () => {
    if (!selectedLesson) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    // Already completed
    if (completedLessons.includes(selectedLesson._id)) {
      return;
    }

    setCompleting(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/progress/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lessonId: selectedLesson._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message || "Unable to update progress."
        );
        return;
      }

      // Update UI immediately
      setCompletedLessons((previous) => {
        if (previous.includes(selectedLesson._id)) {
          return previous;
        }

        return [...previous, selectedLesson._id];
      });
    } catch (error) {
      console.error("Progress error:", error);

      alert(
        "Unable to connect to LearnSphere server."
      );
    } finally {
      setCompleting(false);
    }
  };

  // --------------------------------------------------
  // LESSON NAVIGATION
  // --------------------------------------------------

  const currentIndex = selectedLesson
    ? lessons.findIndex(
        (lesson) => lesson._id === selectedLesson._id
      )
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedLesson(
        lessons[currentIndex - 1]
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < lessons.length - 1) {
      setSelectedLesson(
        lessons[currentIndex + 1]
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // --------------------------------------------------
  // PROGRESS CALCULATION
  // --------------------------------------------------

  const progressPercentage =
    lessons.length > 0
      ? Math.round(
          (completedLessons.length / lessons.length) *
            100
        )
      : 0;

  const selectedLessonCompleted =
    selectedLesson
      ? completedLessons.includes(
          selectedLesson._id
        )
      : false;

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            🎥
          </div>

          <p className="text-[#81778d]">
            Preparing your learning room...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-6xl">
            🥺
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Something went wrong
          </h1>

          <p className="mt-2 text-[#81778d]">
            {error}
          </p>

          <button
            onClick={() =>
              router.push(
                `/courses/${courseId}`
              )
            }
            className="mt-6 rounded-xl bg-[#ef6f9f] px-6 py-3 text-white"
          >
            Back to Course
          </button>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="border-b border-pink-100 bg-white px-6 py-4">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

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
                router.push(
                  `/courses/${courseId}`
                )
              }
              className="rounded-xl px-4 py-2 text-sm hover:bg-pink-50"
            >
              📚 Course
            </button>

            <button
              onClick={() =>
                router.push("/dashboard")
              }
              className="rounded-xl px-4 py-2 text-sm hover:bg-pink-50"
            >
              Dashboard
            </button>

          </div>

        </div>

      </nav>

      {/* =================================================
          LEARNING AREA
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 py-8">

        <div className="grid gap-7 lg:grid-cols-[1fr_350px]">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div>

            {/* Back */}
            <button
              onClick={() =>
                router.push(
                  `/courses/${courseId}`
                )
              }
              className="mb-5 text-sm text-[#81778d] hover:text-[#ef6f9f]"
            >
              ← Back to course
            </button>

            {/* =================================================
                VIDEO PLAYER
            ================================================= */}

            <div className="overflow-hidden rounded-3xl bg-[#2f2940] shadow-lg">

              {selectedLesson?.videoUrl ? (

                <video
                  key={
                    selectedLesson.videoUrl
                  }
                  controls
                  className="aspect-video w-full bg-black"
                  src={
                    selectedLesson.videoUrl
                  }
                >
                  Your browser does not support
                  video playback.
                </video>

              ) : (

                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#eee5ff] to-[#ffe0eb]">

                  <div className="text-center">

                    <div className="text-7xl">
                      🎥
                    </div>

                    <p className="mt-4 text-[#81778d]">
                      Video unavailable
                    </p>

                  </div>

                </div>

              )}

            </div>

            {/* =================================================
                LESSON INFORMATION
            ================================================= */}

            {selectedLesson && (

              <div className="mt-7 rounded-3xl border border-pink-100 bg-white p-7 shadow-sm">

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-[#fff0f5] px-4 py-2 text-xs text-[#ef6f9f]">
                    🎥 Video Lesson
                  </span>

                  {selectedLesson.isFree && (
                    <span className="rounded-full bg-[#dff5ef] px-4 py-2 text-xs text-green-600">
                      Free
                    </span>
                  )}

                </div>

                {/* Title */}
                <h1 className="mt-4 text-3xl font-bold">
                  {selectedLesson.title}
                </h1>

                {/* Description */}
                <p className="mt-4 leading-7 text-[#81778d]">
                  {selectedLesson.description ||
                    "Learn this concept through the video lesson."}
                </p>

                {/* Duration */}
                {selectedLesson.duration && (
                  <p className="mt-4 text-sm text-[#81778d]">
                    ⏱️ Duration:{" "}
                    {selectedLesson.duration} minutes
                  </p>
                )}

                {/* =================================================
                    COMPLETE BUTTON
                ================================================= */}

                <div className="mt-7">

                  {selectedLessonCompleted ? (

                    <div className="flex items-center gap-3 rounded-2xl bg-[#dff5ef] px-5 py-4 text-green-600">

                      <span className="text-2xl">
                        ✅
                      </span>

                      <div>

                        <p className="font-semibold">
                          Lesson completed!
                        </p>

                        <p className="text-sm text-green-600/80">
                          Great job! Keep going 🌱
                        </p>

                      </div>

                    </div>

                  ) : (

                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="w-full rounded-2xl bg-[#ef6f9f] py-4 font-semibold text-white shadow-sm transition hover:bg-[#e45c8f] disabled:opacity-60"
                    >
                      {completing
                        ? "Saving progress... 🌸"
                        : "✓ Mark Lesson as Complete"}
                    </button>

                  )}

                </div>

                {/* =================================================
                    LESSON NAVIGATION
                ================================================= */}

                <div className="mt-8 flex items-center justify-between border-t border-pink-100 pt-6">

                  <button
                    onClick={handlePrevious}
                    disabled={
                      currentIndex <= 0
                    }
                    className="rounded-xl border border-pink-100 px-5 py-3 text-sm hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ← Previous
                  </button>

                  <span className="text-sm text-[#81778d]">
                    Lesson{" "}
                    {currentIndex + 1} of{" "}
                    {lessons.length}
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={
                      currentIndex ===
                        lessons.length - 1 ||
                      currentIndex === -1
                    }
                    className="rounded-xl bg-[#ef6f9f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e45c8f] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next →
                  </button>

                </div>

              </div>

            )}

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="h-fit overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-sm">

            {/* Sidebar Header */}
            <div className="border-b border-pink-100 bg-gradient-to-r from-[#fff0f5] to-[#eee7ff] p-6">

              <span className="text-sm text-[#81778d]">
                📚 Your Learning
              </span>

              <h2 className="mt-1 text-xl font-bold">
                Course Content
              </h2>

              <p className="mt-2 text-sm text-[#81778d]">
                {lessons.length} lesson
                {lessons.length !== 1
                  ? "s"
                  : ""}
              </p>

              {/* =================================================
                  PROGRESS BAR
              ================================================= */}

              <div className="mt-5">

                <div className="mb-2 flex justify-between text-xs">

                  <span>
                    Course progress
                  </span>

                  <span className="font-semibold">
                    {progressPercentage}%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white">

                  <div
                    className="h-full rounded-full bg-[#ef6f9f] transition-all duration-500"
                    style={{
                      width: `${progressPercentage}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-xs text-[#81778d]">
                  {completedLessons.length} of{" "}
                  {lessons.length} lessons completed
                </p>

              </div>

            </div>

            {/* =================================================
                MODULES + LESSONS
            ================================================= */}

            <div className="max-h-[600px] overflow-y-auto">

              {modules.map(
                (module, moduleIndex) => {

                  const moduleLessons =
                    lessons.filter(
                      (lesson) =>
                        lesson.module ===
                        module._id
                    );

                  return (
                    <div
                      key={module._id}
                      className="border-b border-pink-100 last:border-b-0"
                    >

                      {/* Module Header */}
                      <div className="bg-[#fffbfd] px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0f5] text-sm font-bold text-[#ef6f9f]">
                            {moduleIndex + 1}
                          </div>

                          <div>

                            <p className="text-xs text-[#81778d]">
                              Module{" "}
                              {moduleIndex + 1}
                            </p>

                            <p className="font-semibold">
                              {module.title}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* Lessons */}
                      {moduleLessons.length >
                      0 ? (

                        moduleLessons.map(
                          (lesson, index) => {

                            const active =
                              selectedLesson?._id ===
                              lesson._id;

                            const completed =
                              completedLessons.includes(
                                lesson._id
                              );

                            return (
                              <button
                                key={
                                  lesson._id
                                }
                                onClick={() =>
                                  setSelectedLesson(
                                    lesson
                                  )
                                }
                                className={`w-full border-t border-pink-50 px-5 py-4 text-left transition ${
                                  active
                                    ? "bg-[#fff0f5]"
                                    : "hover:bg-[#fffbfd]"
                                }`}
                              >

                                <div className="flex items-center gap-3">

                                  {/* Lesson Icon */}
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                      completed
                                        ? "bg-[#dff5ef] text-green-600"
                                        : active
                                        ? "bg-[#ef6f9f] text-white"
                                        : "bg-[#eee5ff]"
                                    }`}
                                  >
                                    {completed
                                      ? "✓"
                                      : active
                                      ? "▶"
                                      : index + 1}
                                  </div>

                                  {/* Lesson Name */}
                                  <div className="min-w-0">

                                    <p className="truncate text-sm font-semibold">
                                      {
                                        lesson.title
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-[#81778d]">

                                      {completed
                                        ? "✓ Completed"
                                        : "🎥 Video lesson"}

                                    </p>

                                  </div>

                                </div>

                              </button>
                            );
                          }
                        )

                      ) : (

                        <div className="px-5 py-4 text-sm text-[#81778d]">
                          No lessons added yet.
                        </div>

                      )}

                    </div>
                  );
                }
              )}

            </div>

          </aside>

        </div>

      </section>

      {/* =================================================
          BOTTOM MESSAGE
      ================================================= */}

      <section className="mx-auto max-w-7xl px-6 pb-12">

        <div className="rounded-3xl bg-gradient-to-r from-[#ffeaf2] to-[#eee7ff] px-8 py-8 text-center">

          <div className="text-3xl">
            🌱 🎓 ✨
          </div>

          <p className="mt-3 font-semibold">
            Keep learning, you're doing great! 💗
          </p>

          <p className="mt-1 text-sm text-[#81778d]">
            Every completed lesson brings you
            one step closer to your goal.
          </p>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-pink-100 bg-[#faf5ff] py-7 text-center">

        <p className="text-sm text-[#81778d]">
          LearnSphere · Learn without limits 🌸
        </p>

      </footer>

    </main>
  );
}