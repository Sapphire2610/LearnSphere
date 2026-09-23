"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Assessment = {
  _id: string;
  title: string;
  description?: string;
  totalMarks: number;
  passingMarks: number;
  duration?: number;
};

type Question = {
  _id: string;
  questionText: string;
  options: string[];
  marks: number;
  order: number;
};

type Result = {
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
};

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();

  const courseId = params.id as string;
  const assessmentId = params.assessmentId as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        // Fetch assessment
        const assessmentResponse = await fetch(
          `https://learnsphere-24zf.onrender.com/api/assessments/${assessmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!assessmentResponse.ok) {
          throw new Error("Unable to fetch assessment");
        }

        const assessmentData = await assessmentResponse.json();

        setAssessment(
          assessmentData.assessment || assessmentData
        );

        // Fetch questions
        const questionResponse = await fetch(
          `https://learnsphere-24zf.onrender.com/api/questions/assessment/${assessmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!questionResponse.ok) {
          throw new Error("Unable to fetch questions");
        }

        const questionData = await questionResponse.json();

        setQuestions(
          questionData.questions || questionData
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load the assessment.");
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId, router]);

  const handleAnswerChange = (
    questionId: string,
    answer: string
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    if (questions.length === 0) {
      setError("No questions are available.");
      return;
    }

    const unanswered = questions.filter(
      (question) => !answers[question._id]
    );

    if (unanswered.length > 0) {
      setError(
        `Please answer all questions. ${unanswered.length} question(s) remaining.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(
        "https://learnsphere-24zf.onrender.com/api/results/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            assessmentId,
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit assessment"
        );
      }

      setResult(data.result || data);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
          <p className="text-[#6b6280] text-lg">
            Loading your assessment...
          </p>
        </div>
      </main>
    );
  }

  if (error && !assessment) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">
        <div className="bg-white rounded-3xl shadow-lg border border-pink-100 p-8 text-center max-w-md">
          <div className="text-5xl mb-4">😕</div>

          <h1 className="text-2xl font-bold text-[#4b4263] mb-3">
            Something went wrong
          </h1>

          <p className="text-red-500 mb-6">
            {error}
          </p>

          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  // -----------------------------
  // RESULT SCREEN
  // -----------------------------

  if (result) {
    return (
      <main className="min-h-screen bg-[#fffaf8] px-6 py-10">
        <div className="max-w-3xl mx-auto">

          <div className="bg-white rounded-[2rem] shadow-lg border border-pink-100 overflow-hidden">

            <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-mint-100 px-8 py-12 text-center">
              <div className="text-6xl mb-4">
                {result.passed ? "🎉" : "📚"}
              </div>

              <h1 className="text-3xl font-bold text-[#4b4263]">
                {result.passed
                  ? "Congratulations!"
                  : "Assessment Completed"}
              </h1>

              <p className="text-[#6b6280] mt-2">
                {result.passed
                  ? "You passed the assessment! ✨"
                  : "Keep learning and try again! 🌱"}
              </p>
            </div>

            <div className="p-8">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

                <div className="rounded-3xl bg-[#eee5ff] p-6 text-center">
                  <p className="text-sm text-[#6b6280]">
                    Score
                  </p>

                  <p className="text-3xl font-bold text-[#4b4263] mt-2">
                    {result.score}
                    <span className="text-lg">
                      /{result.totalMarks}
                    </span>
                  </p>
                </div>

                <div className="rounded-3xl bg-[#dff5ef] p-6 text-center">
                  <p className="text-sm text-[#6b6280]">
                    Percentage
                  </p>

                  <p className="text-3xl font-bold text-[#4b4263] mt-2">
                    {Number(result.percentage).toFixed(1)}%
                  </p>
                </div>

                <div className="rounded-3xl bg-[#ffe5ef] p-6 text-center">
                  <p className="text-sm text-[#6b6280]">
                    Status
                  </p>

                  <p
                    className={`text-xl font-bold mt-3 ${
                      result.passed
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {result.passed ? "PASSED ✓" : "NOT PASSED"}
                  </p>
                </div>

              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">

                <button
                  onClick={() =>
                    router.push(`/courses/${courseId}`)
                  }
                  className="px-6 py-3 rounded-2xl bg-[#eee5ff] text-[#4b4263] font-semibold hover:opacity-80 transition"
                >
                  ← Back to Course
                </button>

                <button
                  onClick={() =>
                    router.push("/dashboard")
                  }
                  className="px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
                >
                  Go to Dashboard 🏠
                </button>

              </div>

            </div>
          </div>

        </div>
      </main>
    );
  }

  // -----------------------------
  // QUIZ SCREEN
  // -----------------------------

  return (
    <main className="min-h-screen bg-[#fffaf8]">

      {/* Navbar */}
      <nav className="bg-white border-b border-pink-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <button
            onClick={() =>
              router.push(`/courses/${courseId}`)
            }
            className="text-xl font-bold text-[#4b4263]"
          >
            🌸 LearnSphere
          </button>

          <button
            onClick={() =>
              router.push(`/courses/${courseId}`)
            }
            className="text-[#6b6280] hover:text-[#ef6f9f] transition"
          >
            ← Back to Course
          </button>

        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Assessment Header */}
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-[#dff5ef] rounded-[2rem] p-8 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-sm font-semibold text-[#ef6f9f] mb-2">
                📝 ASSESSMENT
              </p>

              <h1 className="text-3xl font-bold text-[#4b4263]">
                {assessment?.title}
              </h1>

              <p className="text-[#6b6280] mt-2">
                {assessment?.description}
              </p>
            </div>

            <div className="bg-white/80 rounded-2xl px-5 py-4 text-center">
              <p className="text-sm text-[#6b6280]">
                Total Marks
              </p>

              <p className="text-2xl font-bold text-[#4b4263]">
                {assessment?.totalMarks}
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-3 mt-6">

            <span className="px-4 py-2 rounded-full bg-white/80 text-sm text-[#4b4263]">
              📋 {questions.length} Questions
            </span>

            <span className="px-4 py-2 rounded-full bg-white/80 text-sm text-[#4b4263]">
              🎯 Pass: {assessment?.passingMarks}
            </span>

            {assessment?.duration ? (
              <span className="px-4 py-2 rounded-full bg-white/80 text-sm text-[#4b4263]">
                ⏱️ {assessment.duration} minutes
              </span>
            ) : null}

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-600 px-5 py-4">
            ⚠️ {error}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-6">

          {questions.map((question, index) => (

            <div
              key={question._id}
              className="bg-white rounded-3xl border border-pink-100 shadow-sm p-7"
            >

              <div className="flex items-start justify-between gap-4 mb-5">

                <div className="flex gap-4">

                  <div className="w-10 h-10 rounded-2xl bg-[#eee5ff] flex items-center justify-center font-bold text-[#4b4263] flex-shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-[#4b4263]">
                      {question.questionText}
                    </h2>
                  </div>

                </div>

                <span className="text-sm text-[#6b6280] whitespace-nowrap">
                  {question.marks} mark
                  {question.marks !== 1 ? "s" : ""}
                </span>

              </div>

              <div className="space-y-3">

                {question.options.map((option) => {

                  const selected =
                    answers[question._id] === option;

                  return (
                    <label
                      key={option}
                      className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                        selected
                          ? "border-[#ef6f9f] bg-pink-50"
                          : "border-gray-200 hover:border-pink-200 hover:bg-[#fffaf8]"
                      }`}
                    >

                      <input
                        type="radio"
                        name={`question-${question._id}`}
                        value={option}
                        checked={selected}
                        onChange={() =>
                          handleAnswerChange(
                            question._id,
                            option
                          )
                        }
                        className="w-5 h-5 accent-pink-500"
                      />

                      <span className="text-[#4b4263]">
                        {option}
                      </span>

                    </label>
                  );
                })}

              </div>

            </div>

          ))}

        </div>

        {/* Submit */}
        <div className="mt-8 bg-white rounded-3xl border border-pink-100 shadow-sm p-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <div>
              <p className="font-semibold text-[#4b4263]">
                Ready to submit? 🚀
              </p>

              <p className="text-sm text-[#6b6280] mt-1">
                Make sure you've answered every question.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-8 py-4 rounded-2xl font-bold text-white transition ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#ef6f9f] hover:opacity-90 hover:-translate-y-0.5"
              }`}
            >
              {submitting
                ? "Submitting..."
                : "Submit Assessment ✓"}
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}