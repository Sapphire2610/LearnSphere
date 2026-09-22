"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Course = {
  _id: string;
  title: string;
};

type Module = {
  _id: string;
  title: string;
};

type Assessment = {
  _id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
  duration: number;
  published: boolean;
  module?: string;
};

type Question = {
  questionText: string;
  options: string[];
  correctAnswer: string;
  marks: number;
  order: number;
};

export default function InstructorAssessmentsPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Assessment form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [totalMarks, setTotalMarks] = useState("10");
  const [passingMarks, setPassingMarks] = useState("5");
  const [duration, setDuration] = useState("20");
  const [published, setPublished] = useState(false);

  // Question form
  const [selectedAssessment, setSelectedAssessment] =
    useState<Assessment | null>(null);

  const [questionText, setQuestionText] = useState("");
  const [option1, setOption1] = useState("");
  const [option2, setOption2] = useState("");
  const [option3, setOption3] = useState("");
  const [option4, setOption4] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionMarks, setQuestionMarks] = useState("1");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "instructor") {
        router.push("/dashboard");
        return;
      }

      fetchData(token);
    } catch (err) {
      console.error(err);
      router.push("/login");
    }
  }, [courseId, router]);

  const fetchData = async (token: string) => {
    try {
      setLoading(true);
      setError("");

      const [courseResponse, moduleResponse, assessmentResponse] =
        await Promise.all([
          fetch(
            `http://localhost:5000/api/courses/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `http://localhost:5000/api/modules/course/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),

          fetch(
            `http://localhost:5000/api/assessments/course/${courseId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        ]);

      const courseData = await courseResponse.json();
      const moduleData = await moduleResponse.json();
      const assessmentData = await assessmentResponse.json();

      if (!courseResponse.ok) {
        throw new Error(
          courseData.message || "Unable to fetch course"
        );
      }

      setCourse(courseData.course || courseData);

      setModules(
        Array.isArray(moduleData)
          ? moduleData
          : moduleData.modules || []
      );

      setAssessments(
        Array.isArray(assessmentData)
          ? assessmentData
          : assessmentData.assessments || []
      );
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to load assessment data.");
    } finally {
      setLoading(false);
    }
  };

  // CREATE ASSESSMENT
  const handleCreateAssessment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    if (!title.trim()) {
      setError("Please enter an assessment title.");
      return;
    }

    if (!totalMarks || !passingMarks) {
      setError("Please enter total and passing marks.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/assessments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            course: courseId,
            module: moduleId || undefined,
            totalMarks: Number(totalMarks),
            passingMarks: Number(passingMarks),
            duration: Number(duration),
            published,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create assessment"
        );
      }

      setMessage("Assessment created successfully! 🎉");

      setTitle("");
      setDescription("");
      setModuleId("");
      setTotalMarks("10");
      setPassingMarks("5");
      setDuration("20");
      setPublished(false);

      fetchData(token);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create assessment"
      );
    }
  };

  // CREATE QUESTION
  const handleCreateQuestion = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedAssessment) {
      setError("Please select an assessment.");
      return;
    }

    const options = [
      option1,
      option2,
      option3,
      option4,
    ].filter((option) => option.trim() !== "");

    if (!questionText.trim()) {
      setError("Please enter the question.");
      return;
    }

    if (options.length < 2) {
      setError("Please provide at least 2 options.");
      return;
    }

    if (!correctAnswer) {
      setError("Please select the correct answer.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assessment: selectedAssessment._id,
            questionText,
            options,
            correctAnswer,
            marks: Number(questionMarks),
            order: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create question"
        );
      }

      setMessage("Question added successfully! ✅");

      setQuestionText("");
      setOption1("");
      setOption2("");
      setOption3("");
      setOption4("");
      setCorrectAnswer("");
      setQuestionMarks("1");
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create question"
      );
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf8] text-[#4b4263]">
        <div className="text-center">
          <div className="mb-4 text-5xl">🌸</div>
          <p className="text-lg font-semibold">
            Loading assessments...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">

      {/* NAVBAR */}
      <nav className="border-b border-pink-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-[#ef6f9f]"
          >
            🌸 LearnSphere
          </button>

          <button
            onClick={() =>
              router.push(`/instructor/courses/${courseId}`)
            }
            className="rounded-full bg-[#eee5ff] px-5 py-2 text-sm font-semibold text-[#4b4263]"
          >
            ← Course Builder
          </button>

        </div>
      </nav>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* HEADER */}
        <div className="mb-10">

          <p className="text-sm font-semibold uppercase tracking-wider text-[#ef6f9f]">
            Assessment Management
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            {course?.title || "Course"} 📝
          </h1>

          <p className="mt-2 text-[#766d86]">
            Create quizzes and assessments for your students.
          </p>

        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 font-medium text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-medium text-red-600">
            {error}
          </div>
        )}

        {/* CREATE ASSESSMENT */}
        <div className="mb-10 rounded-3xl border border-pink-100 bg-white p-8 shadow-sm">

          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              ➕ Create Assessment
            </h2>

            <p className="mt-1 text-sm text-[#766d86]">
              Add a quiz or test to this course.
            </p>
          </div>

          <form
            onSubmit={handleCreateAssessment}
            className="grid gap-5 md:grid-cols-2"
          >

            <div className="md:col-span-2">
              <label className="mb-2 block font-semibold">
                Assessment Title
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Example: Python Basics Quiz"
                className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 outline-none focus:border-[#ef6f9f]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Describe this assessment..."
                rows={4}
                className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 outline-none focus:border-[#ef6f9f]"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Module
              </label>

              <select
                value={moduleId}
                onChange={(e) =>
                  setModuleId(e.target.value)
                }
                className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 outline-none"
              >
                <option value="">
                  Select Module
                </option>

                {modules.map((module) => (
                  <option
                    key={module._id}
                    value={module._id}
                  >
                    {module.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Duration (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={duration}
                onChange={(e) =>
                  setDuration(e.target.value)
                }
                className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Total Marks
              </label>

              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) =>
                  setTotalMarks(e.target.value)
                }
                className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Passing Marks
              </label>

              <input
                type="number"
                min="1"
                value={passingMarks}
                onChange={(e) =>
                  setPassingMarks(e.target.value)
                }
                className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">

              <input
                type="checkbox"
                checked={published}
                onChange={(e) =>
                  setPublished(e.target.checked)
                }
                className="h-5 w-5"
              />

              <label className="font-semibold">
                Publish assessment
              </label>

            </div>

            <button
              type="submit"
              className="rounded-2xl bg-[#ef6f9f] px-6 py-3 font-semibold text-white shadow-md hover:opacity-90 md:col-span-2"
            >
              Create Assessment ✨
            </button>

          </form>
        </div>

        {/* ASSESSMENTS */}
        <div className="mb-10">

          <h2 className="mb-5 text-2xl font-bold">
            📚 Existing Assessments
          </h2>

          {assessments.length === 0 ? (
            <div className="rounded-3xl border border-pink-100 bg-white p-10 text-center shadow-sm">

              <div className="mb-4 text-5xl">
                📝
              </div>

              <p className="font-semibold">
                No assessments yet
              </p>

              <p className="mt-1 text-sm text-[#766d86]">
                Create your first assessment above.
              </p>

            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">

              {assessments.map((assessment) => (

                <div
                  key={assessment._id}
                  className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h3 className="text-xl font-bold">
                        {assessment.title}
                      </h3>

                      <p className="mt-2 text-sm text-[#766d86]">
                        {assessment.description}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        assessment.published
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {assessment.published
                        ? "Published"
                        : "Draft"}
                    </span>

                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">

                    <div className="rounded-2xl bg-[#eee5ff] p-3">
                      <p className="text-xs">
                        Marks
                      </p>
                      <p className="font-bold">
                        {assessment.totalMarks}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#dff5ef] p-3">
                      <p className="text-xs">
                        Pass
                      </p>
                      <p className="font-bold">
                        {assessment.passingMarks}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-pink-50 p-3">
                      <p className="text-xs">
                        Time
                      </p>
                      <p className="font-bold">
                        {assessment.duration}m
                      </p>
                    </div>

                  </div>

                  <button
                    onClick={() =>
                      setSelectedAssessment(assessment)
                    }
                    className="mt-5 w-full rounded-2xl bg-[#4b4263] px-5 py-3 font-semibold text-white hover:bg-[#3d3553]"
                  >
                    ➕ Add Questions
                  </button>

                </div>

              ))}

            </div>
          )}

        </div>

        {/* ADD QUESTION */}
        {selectedAssessment && (
          <div className="rounded-3xl border border-purple-100 bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#ef6f9f]">
                  Adding Questions
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {selectedAssessment.title}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedAssessment(null)
                }
                className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>

            </div>

            <form
              onSubmit={handleCreateQuestion}
              className="space-y-5"
            >

              <div>
                <label className="mb-2 block font-semibold">
                  Question
                </label>

                <textarea
                  value={questionText}
                  onChange={(e) =>
                    setQuestionText(e.target.value)
                  }
                  placeholder="Example: Which keyword is used to define a function in Python?"
                  rows={3}
                  className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3 outline-none focus:border-[#ef6f9f]"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">

                <input
                  value={option1}
                  onChange={(e) =>
                    setOption1(e.target.value)
                  }
                  placeholder="Option 1"
                  className="rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
                />

                <input
                  value={option2}
                  onChange={(e) =>
                    setOption2(e.target.value)
                  }
                  placeholder="Option 2"
                  className="rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
                />

                <input
                  value={option3}
                  onChange={(e) =>
                    setOption3(e.target.value)
                  }
                  placeholder="Option 3"
                  className="rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
                />

                <input
                  value={option4}
                  onChange={(e) =>
                    setOption4(e.target.value)
                  }
                  placeholder="Option 4"
                  className="rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
                />

              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Correct Answer
                </label>

                <select
                  value={correctAnswer}
                  onChange={(e) =>
                    setCorrectAnswer(e.target.value)
                  }
                  className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
                >
                  <option value="">
                    Select correct answer
                  </option>

                  {[
                    option1,
                    option2,
                    option3,
                    option4,
                  ]
                    .filter(
                      (option) =>
                        option.trim() !== ""
                    )
                    .map((option, index) => (
                      <option
                        key={index}
                        value={option}
                      >
                        {option}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-semibold">
                  Marks
                </label>

                <input
                  type="number"
                  min="1"
                  value={questionMarks}
                  onChange={(e) =>
                    setQuestionMarks(e.target.value)
                  }
                  className="w-full rounded-2xl border border-pink-100 bg-[#fffaf8] px-4 py-3"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#ef6f9f] px-6 py-3 font-semibold text-white shadow-md hover:opacity-90"
              >
                Add Question ✅
              </button>

            </form>

          </div>
        )}

      </section>

      {/* FOOTER */}
      <footer className="border-t border-pink-100 bg-white py-8 text-center">

        <p className="text-sm text-[#766d86]">
          🌸 LearnSphere • Instructor Portal
        </p>

      </footer>

    </main>
  );
}