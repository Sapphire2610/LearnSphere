"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Course = {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  level?: string;
  price?: number;
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
  course: string | { _id: string };
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

export default function CourseBuilderPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  // ==========================================
  // STATE
  // ==========================================

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Module form
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [addingModule, setAddingModule] = useState(false);

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonDescription, setLessonDescription] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState("");
  const [lessonModule, setLessonModule] = useState("");
  const [lessonIsFree, setLessonIsFree] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);

  // ==========================================
  // LOAD COURSE
  // ==========================================

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      // ------------------------------------------
      // COURSE
      // ------------------------------------------

      const courseResponse = await fetch(
        `https://learnsphere-24zf.onrender.com/api/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const courseData = await courseResponse.json();

      if (!courseResponse.ok) {
        throw new Error(
          courseData.message || "Unable to load course"
        );
      }

      const loadedCourse = courseData.course || courseData;

      setCourse(loadedCourse);

      // ------------------------------------------
      // MODULES
      // ------------------------------------------

      const moduleResponse = await fetch(
        `https://learnsphere-24zf.onrender.com/api/modules/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (moduleResponse.ok) {
        const moduleData = await moduleResponse.json();

        const moduleList =
          moduleData.modules || moduleData;

        if (Array.isArray(moduleList)) {
          const sortedModules = [...moduleList].sort(
            (a: Module, b: Module) => a.order - b.order
          );

          setModules(sortedModules);

          // Automatically select first module
          if (
            sortedModules.length > 0 &&
            !lessonModule
          ) {
            setLessonModule(sortedModules[0]._id);
          }

          // ------------------------------------------
          // LESSONS
          // ------------------------------------------

          const allLessons: Lesson[] = [];

          for (const module of sortedModules) {
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
                "Unable to load lessons:",
                lessonError
              );
            }
          }

          setLessons(allLessons);
        }
      }
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

  // ==========================================
  // USE EFFECT
  // ==========================================

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  // ==========================================
  // ADD MODULE
  // ==========================================

  const handleAddModule = async () => {
    try {
      setError("");
      setSuccess("");

      if (!moduleTitle.trim()) {
        setError("Please enter a module title.");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setAddingModule(true);

      const response = await fetch(
        "https://learnsphere-24zf.onrender.com/api/modules",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: moduleTitle.trim(),
            description: moduleDescription.trim(),
            course: courseId,
            order: modules.length + 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create module"
        );
      }

      setSuccess("Module added successfully! 📚");

      setModuleTitle("");
      setModuleDescription("");

      await loadCourse();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add module."
      );
    } finally {
      setAddingModule(false);
    }
  };

  // ==========================================
  // ADD LESSON
  // ==========================================

  const handleAddLesson = async () => {
    try {
      setError("");
      setSuccess("");

      // Validate title
      if (!lessonTitle.trim()) {
        setError("Please enter a lesson title.");
        return;
      }

      // Validate module
      if (!lessonModule) {
        setError("Please select a module.");
        return;
      }

      // Validate video URL
      if (!lessonVideoUrl.trim()) {
        setError("Please enter a video URL.");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      setAddingLesson(true);

      // Count lessons inside selected module
      const moduleLessonCount = lessons.filter(
        (lesson) =>
          String(lesson.module) === String(lessonModule)
      ).length;

      // IMPORTANT:
      // Backend expects:
      // title
      // module
      // videoUrl
      // NOT moduleId or videoURL

      const lessonPayload = {
        title: lessonTitle.trim(),

        description: lessonDescription.trim(),

        module: lessonModule,

        videoUrl: lessonVideoUrl.trim(),

        duration: lessonDuration
          ? Number(lessonDuration)
          : 0,

        order: moduleLessonCount + 1,

        isFree: lessonIsFree,
      };

      console.log(
        "Creating lesson with payload:",
        lessonPayload
      );

      const response = await fetch(
        "https://learnsphere-24zf.onrender.com/api/lessons",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(lessonPayload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create lesson"
        );
      }

      setSuccess(
        "Lesson added successfully! 🎥"
      );

      // Clear form
      setLessonTitle("");
      setLessonDescription("");
      setLessonVideoUrl("");
      setLessonDuration("");
      setLessonIsFree(false);

      // Reload course
      await loadCourse();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to add lesson."
      );
    } finally {
      setAddingLesson(false);
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
            Loading course builder...
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
        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 text-center max-w-md">
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
            onClick={() =>
              router.push("/instructor")
            }
            className="px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
          >
            ← Back to Instructor Dashboard
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

      {/* ==========================================
          NAVBAR
      ========================================== */}

      <nav className="bg-white border-b border-pink-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          <button
            onClick={() =>
              router.push("/instructor")
            }
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

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.push(
                  `/instructor/courses/${courseId}/analytics`
                )
              }
              className="px-4 py-2 rounded-full bg-[#dff5ef] text-[#4b4263] font-semibold hover:opacity-90 transition"
            >
              📊 Analytics
            </button>

            <button
              onClick={() =>
                router.push(
                  `/instructor/courses/${courseId}/assessments`
                )
              }
              className="px-4 py-2 rounded-full bg-[#eee5ff] text-[#4b4263] font-semibold hover:opacity-90 transition"
            >
              📝 Assessments
            </button>

            <button
              onClick={() =>
                router.push("/instructor")
              }
              className="px-4 py-2 rounded-full bg-pink-100 text-[#4b4263] font-semibold hover:opacity-90 transition"
            >
              ← Dashboard
            </button>

          </div>
        </div>
      </nav>

      {/* ==========================================
          PAGE HEADER
      ========================================== */}

      <section className="px-6 py-10">
        <div className="max-w-7xl mx-auto">

          <button
            onClick={() =>
              router.push("/instructor")
            }
            className="text-[#6b6280] hover:text-[#ef6f9f] mb-5 transition"
          >
            ← Back to Instructor Dashboard
          </button>

          <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-[#dff5ef] rounded-[2.5rem] p-8 md:p-10">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div>
                <p className="text-sm font-semibold text-[#ef6f9f] mb-2">
                  COURSE BUILDER
                </p>

                <h1 className="text-4xl font-bold text-[#4b4263]">
                  {course.title}
                </h1>

                <p className="text-[#6b6280] mt-3 max-w-2xl">
                  Build your course by adding modules,
                  lessons and assessments.
                </p>
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/courses/${courseId}`
                  )
                }
                className="px-6 py-3 rounded-2xl bg-white text-[#4b4263] font-semibold shadow-sm hover:shadow-md transition"
              >
                👀 View Student Course
              </button>

            </div>
          </div>

          {/* ==========================================
              SUCCESS / ERROR
          ========================================== */}

          {success && (
            <div className="mt-6 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-green-700">
              ✅ {success}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-600">
              ⚠️ {error}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          COURSE BUILDER
      ========================================== */}

      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-8">

          {/* ==========================================
              LEFT SIDE
          ========================================== */}

          <div className="space-y-8">

            {/* ==========================================
                MODULE LIST
            ========================================== */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-7">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <p className="text-sm font-semibold text-[#ef6f9f]">
                    COURSE STRUCTURE
                  </p>

                  <h2 className="text-2xl font-bold text-[#4b4263]">
                    Modules & Lessons 📚
                  </h2>

                  <p className="text-[#6b6280] mt-1">
                    {modules.length} modules ·{" "}
                    {lessons.length} lessons
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-[#eee5ff] flex items-center justify-center text-2xl">
                  📖
                </div>

              </div>

              {modules.length === 0 ? (

                <div className="text-center py-12 rounded-2xl bg-[#fffaf8]">
                  <div className="text-4xl mb-3">
                    📭
                  </div>

                  <p className="font-semibold text-[#4b4263]">
                    No modules yet
                  </p>

                  <p className="text-sm text-[#6b6280] mt-1">
                    Add your first module using the form.
                  </p>
                </div>

              ) : (

                <div className="space-y-5">

                  {[...modules]
                    .sort(
                      (a, b) =>
                        a.order - b.order
                    )
                    .map(
                      (module, index) => {

                        const moduleLessons =
                          lessons
                            .filter(
                              (lesson) =>
                                String(
                                  lesson.module
                                ) ===
                                String(module._id)
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

                            {/* Module Header */}

                            <div className="bg-[#fffaf8] p-5">

                              <div className="flex items-center justify-between gap-4">

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
                                  {moduleLessons.length}{" "}
                                  lessons
                                </span>

                              </div>
                            </div>

                            {/* Lessons */}

                            {moduleLessons.length === 0 ? (

                              <div className="px-5 py-5 text-sm text-[#6b6280]">
                                No lessons added yet.
                              </div>

                            ) : (

                              <div className="divide-y divide-pink-50">

                                {moduleLessons.map(
                                  (lesson) => (
                                    <div
                                      key={
                                        lesson._id
                                      }
                                      className="px-5 py-4 flex items-center justify-between gap-4"
                                    >

                                      <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-xl bg-[#dff5ef] flex items-center justify-center">
                                          🎥
                                        </div>

                                        <div>

                                          <p className="font-medium text-[#4b4263]">
                                            {
                                              lesson.title
                                            }
                                          </p>

                                          <div className="flex flex-wrap gap-2 mt-1">

                                            {lesson.duration !==
                                              undefined && (
                                              <span className="text-xs text-[#6b6280]">
                                                ⏱️{" "}
                                                {
                                                  lesson.duration
                                                }{" "}
                                                min
                                              </span>
                                            )}

                                            {lesson.isFree && (
                                              <span className="text-xs text-green-600 font-semibold">
                                                Free
                                              </span>
                                            )}

                                          </div>

                                        </div>

                                      </div>

                                      {lesson.videoUrl && (
                                        <a
                                          href={
                                            lesson.videoUrl
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm font-semibold text-[#ef6f9f] hover:underline"
                                        >
                                          Video ↗
                                        </a>
                                      )}

                                    </div>
                                  )
                                )}

                              </div>
                            )}

                          </div>
                        );
                      }
                    )}

                </div>
              )}
            </div>

            {/* ==========================================
                QUICK ACTIONS
            ========================================== */}

            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-3xl p-7">

              <h2 className="text-2xl font-bold text-[#4b4263] mb-5">
                Course Tools 🛠️
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">

                <button
                  onClick={() =>
                    router.push(
                      `/instructor/courses/${courseId}/assessments`
                    )
                  }
                  className="bg-white rounded-2xl p-5 text-left hover:shadow-md transition"
                >
                  <div className="text-3xl mb-3">
                    📝
                  </div>

                  <p className="font-bold text-[#4b4263]">
                    Assessments
                  </p>

                  <p className="text-sm text-[#6b6280] mt-1">
                    Create quizzes and questions
                  </p>
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/instructor/courses/${courseId}/analytics`
                    )
                  }
                  className="bg-white rounded-2xl p-5 text-left hover:shadow-md transition"
                >
                  <div className="text-3xl mb-3">
                    📊
                  </div>

                  <p className="font-bold text-[#4b4263]">
                    Analytics
                  </p>

                  <p className="text-sm text-[#6b6280] mt-1">
                    View student progress
                  </p>
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/courses/${courseId}`
                    )
                  }
                  className="bg-white rounded-2xl p-5 text-left hover:shadow-md transition"
                >
                  <div className="text-3xl mb-3">
                    🎓
                  </div>

                  <p className="font-bold text-[#4b4263]">
                    Student View
                  </p>

                  <p className="text-sm text-[#6b6280] mt-1">
                    Preview your course
                  </p>
                </button>

              </div>
            </div>

          </div>

          {/* ==========================================
              RIGHT SIDE
          ========================================== */}

          <aside className="space-y-6">

            {/* ==========================================
                ADD MODULE
            ========================================== */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-11 h-11 rounded-2xl bg-[#eee5ff] flex items-center justify-center text-xl">
                  📚
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#4b4263]">
                    Add Module
                  </h2>

                  <p className="text-sm text-[#6b6280]">
                    Create a new course section
                  </p>
                </div>

              </div>

              <div className="space-y-4">

                <div>
                  <label className="block text-sm font-semibold text-[#4b4263] mb-2">
                    Module Title
                  </label>

                  <input
                    type="text"
                    value={moduleTitle}
                    onChange={(e) =>
                      setModuleTitle(
                        e.target.value
                      )
                    }
                    placeholder="Example: Introduction to Python"
                    className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#4b4263] mb-2">
                    Description
                  </label>

                  <textarea
                    value={moduleDescription}
                    onChange={(e) =>
                      setModuleDescription(
                        e.target.value
                      )
                    }
                    placeholder="Brief module description"
                    rows={3}
                    className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                  />
                </div>

                <button
                  onClick={handleAddModule}
                  disabled={addingModule}
                  className={`w-full py-3 rounded-2xl font-semibold text-white transition ${
                    addingModule
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#ef6f9f] hover:opacity-90"
                  }`}
                >
                  {addingModule
                    ? "Adding..."
                    : "Add Module ✨"}
                </button>

              </div>
            </div>

            {/* ==========================================
                ADD LESSON
            ========================================== */}

            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-11 h-11 rounded-2xl bg-[#dff5ef] flex items-center justify-center text-xl">
                  🎥
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#4b4263]">
                    Add Lesson
                  </h2>

                  <p className="text-sm text-[#6b6280]">
                    Add a video lesson
                  </p>
                </div>

              </div>

              {modules.length === 0 ? (

                <div className="rounded-2xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
                  ⚠️ Create a module first before
                  adding a lesson.
                </div>

              ) : (

                <div className="space-y-4">

                  {/* Module */}

                  <div>
                    <label className="block text-sm font-semibold text-[#4b4263] mb-2">
                      Select Module
                    </label>

                    <select
                      value={lessonModule}
                      onChange={(e) =>
                        setLessonModule(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200"
                    >
                      <option value="">
                        Select a module
                      </option>

                      {modules
                        .sort(
                          (a, b) =>
                            a.order - b.order
                        )
                        .map((module) => (
                          <option
                            key={module._id}
                            value={module._id}
                          >
                            {module.order}.{" "}
                            {module.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Lesson title */}

                  <div>
                    <label className="block text-sm font-semibold text-[#4b4263] mb-2">
                      Lesson Title
                    </label>

                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) =>
                        setLessonTitle(
                          e.target.value
                        )
                      }
                      placeholder="Example: Python Variables"
                      className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200"
                    />
                  </div>

                  {/* Video URL */}

                  <div>
                    <label className="block text-sm font-semibold text-[#4b4263] mb-2">
                      Video URL
                    </label>

                    <input
                      type="url"
                      value={lessonVideoUrl}
                      onChange={(e) =>
                        setLessonVideoUrl(
                          e.target.value
                        )
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200"
                    />

                    <p className="text-xs text-[#6b6280] mt-2">
                      Paste the video link that students
                      will use for this lesson.
                    </p>
                  </div>

                  {/* Description */}

                  <div>
                    <label className="block text-sm font-semibold text-[#4b4263] mb-2">
                      Lesson Description
                    </label>

                    <textarea
                      value={lessonDescription}
                      onChange={(e) =>
                        setLessonDescription(
                          e.target.value
                        )
                      }
                      placeholder="What will students learn?"
                      rows={3}
                      className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200 resize-none"
                    />
                  </div>

                  {/* Duration */}

                  <div>
                    <label className="block text-sm font-semibold text-[#4b4263] mb-2">
                      Duration (minutes)
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={lessonDuration}
                      onChange={(e) =>
                        setLessonDuration(
                          e.target.value
                        )
                      }
                      placeholder="10"
                      className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 text-[#4b4263] outline-none focus:ring-2 focus:ring-pink-200"
                    />
                  </div>

                  {/* Free lesson */}

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={lessonIsFree}
                      onChange={(e) =>
                        setLessonIsFree(
                          e.target.checked
                        )
                      }
                      className="w-4 h-4"
                    />

                    <span className="text-sm text-[#4b4263]">
                      Make this lesson free
                    </span>

                  </label>

                  {/* Add lesson */}

                  <button
                    onClick={handleAddLesson}
                    disabled={addingLesson}
                    className={`w-full py-3 rounded-2xl font-semibold text-white transition ${
                      addingLesson
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#ef6f9f] hover:opacity-90"
                    }`}
                  >
                    {addingLesson
                      ? "Adding Lesson..."
                      : "Add Lesson 🎥"}
                  </button>

                </div>
              )}
            </div>

            {/* ==========================================
                COURSE SUMMARY
            ========================================== */}

            <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl p-6">

              <h3 className="text-xl font-bold text-[#4b4263] mb-5">
                Course Summary ✨
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
                    Category
                  </span>

                  <span className="font-bold text-[#4b4263]">
                    {course.category ||
                      "General"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-[#6b6280]">
                    Level
                  </span>

                  <span className="font-bold text-[#4b4263]">
                    {course.level ||
                      "All Levels"}
                  </span>
                </div>

                <div className="border-t border-white/60 pt-4 flex justify-between">
                  <span className="text-[#6b6280]">
                    Status
                  </span>

                  <span
                    className={`font-bold ${
                      course.published
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {course.published
                      ? "Published"
                      : "Draft"}
                  </span>
                </div>

              </div>
            </div>

          </aside>
        </div>
      </section>

      {/* ==========================================
          FOOTER
      ========================================== */}

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
            © 2026 LearnSphere. Learn something
            beautiful every day. 💗
          </p>

          <button
            onClick={() =>
              router.push("/instructor")
            }
            className="text-sm font-semibold text-[#ef6f9f] hover:underline"
          >
            Instructor Dashboard →
          </button>

        </div>

      </footer>

    </main>
  );
}