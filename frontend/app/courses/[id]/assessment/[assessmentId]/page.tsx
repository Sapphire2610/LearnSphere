"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Assessment = {
  _id: string;
  title: string;
  description?: string;
  course: string | { _id: string };
  module?: string | { _id: string };
  totalMarks: number;
  passingMarks: number;
  duration?: number;
  published?: boolean;
};

type Question = {
  _id: string;
  assessment: string;
  questionText: string;
  options: string[];
  marks: number;
  order: number;
};

type Result = {
  _id?: string;
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

  const [assessment, setAssessment] =
    useState<Assessment | null>(null);

  const [questions, setQuestions] =
    useState<Question[]>([]);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [submitting, setSubmitting] =
    useState(false);

  const [result, setResult] =
    useState<Result | null>(null);

  /* =========================================
     LOAD ASSESSMENT
  ========================================= */

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          router.push("/login");
          return;
        }

        /* -----------------------------
           GET ASSESSMENT
        ----------------------------- */

        const assessmentResponse =
          await fetch(
            `http://localhost:5000/api/assessments/${assessmentId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const assessmentData =
          await assessmentResponse.json();

        console.log(
          "Assessment response:",
          assessmentData
        );

        if (!assessmentResponse.ok) {
          throw new Error(
            assessmentData.message ||
              "Unable to load assessment"
          );
        }

        const assessmentObject =
          assessmentData.assessment ||
          assessmentData;

        setAssessment(
          assessmentObject
        );

        /* -----------------------------
           GET QUESTIONS
        ----------------------------- */

        const questionResponse =
          await fetch(
            `http://localhost:5000/api/questions/assessment/${assessmentId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const questionData =
          await questionResponse.json();

        console.log(
          "Questions response:",
          questionData
        );

        if (!questionResponse.ok) {
          throw new Error(
            questionData.message ||
              "Unable to load questions"
          );
        }

        const questionList =
          questionData.questions ||
          questionData;

        if (Array.isArray(questionList)) {
          const sortedQuestions =
            [...questionList].sort(
              (a, b) =>
                (a.order || 0) -
                (b.order || 0)
            );

          setQuestions(
            sortedQuestions
          );
        }

      } catch (err) {
        console.error(
          "Assessment loading error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assessment"
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      courseId &&
      assessmentId
    ) {
      loadAssessment();
    }
  }, [
    courseId,
    assessmentId,
    router,
  ]);

  /* =========================================
     SELECT ANSWER
  ========================================= */

  const selectAnswer = (
    questionId: string,
    answer: string
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  /* =========================================
     SUBMIT ASSESSMENT
  ========================================= */

  const submitAssessment = async () => {
    try {
      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      /* Check unanswered questions */

      const unansweredQuestions =
        questions.filter(
          (question) =>
            !answers[question._id]
        );

      if (
        unansweredQuestions.length > 0
      ) {
        setError(
          `Please answer all questions before submitting. ${unansweredQuestions.length} question${
            unansweredQuestions.length > 1
              ? "s"
              : ""
          } remaining.`
        );

        return;
      }

      setSubmitting(true);

      /* -----------------------------
         SEND RESULT TO BACKEND
      ----------------------------- */

      const response =
        await fetch(
          "http://localhost:5000/api/results/submit",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              assessmentId:
                assessmentId,

              answers:
                answers,
            }),
          }
        );

      const data =
        await response.json();

      console.log(
        "Submit response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to submit assessment"
        );
      }

      const resultData =
        data.result || data;

      setResult(resultData);

    } catch (err) {
      console.error(
        "Assessment submission error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit assessment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">

        <div className="text-center">

          <div className="text-6xl mb-5">
            📝
          </div>

          <h1 className="text-2xl font-bold text-[#4b4263]">
            Loading Assessment...
          </h1>

          <p className="mt-2 text-[#6b6280]">
            Getting your questions ready ✨
          </p>

        </div>

      </main>
    );
  }

  /* =========================================
     ASSESSMENT NOT FOUND
  ========================================= */

  if (!assessment) {
    return (
      <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">

        <div className="max-w-md w-full bg-white rounded-3xl border border-pink-100 shadow-lg p-8 text-center">

          <div className="text-6xl mb-5">
            😕
          </div>

          <h1 className="text-2xl font-bold text-[#4b4263]">
            Assessment Not Found
          </h1>

          <p className="text-red-500 mt-3">
            {error ||
              "Unable to find this assessment."}
          </p>

          <button
            onClick={() =>
              router.push(
                `/courses/${courseId}`
              )
            }
            className="mt-7 px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
          >
            ← Back to Course
          </button>

        </div>

      </main>
    );
  }

  /* =========================================
     RESULT SCREEN
  ========================================= */

  if (result) {
    return (
      <main className="min-h-screen bg-[#fffaf8]">

        {/* NAVBAR */}

        <nav className="bg-white border-b border-pink-100 px-6 py-4">

          <div className="max-w-6xl mx-auto flex items-center justify-between">

            <button
              onClick={() =>
                router.push("/")
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

            <button
              onClick={() =>
                router.push(
                  "/dashboard"
                )
              }
              className="px-5 py-2.5 rounded-full bg-[#ef6f9f] text-white font-semibold"
            >
              Dashboard
            </button>

          </div>

        </nav>

        {/* RESULT */}

        <section className="px-6 py-14">

          <div className="max-w-3xl mx-auto">

            <div className="bg-white rounded-[2.5rem] border border-pink-100 shadow-lg p-8 md:p-12 text-center">

              <div className="text-7xl mb-5">
                {result.passed
                  ? "🎉"
                  : "📚"}
              </div>

              <p className="text-sm font-bold uppercase tracking-wider text-[#ef6f9f]">
                Assessment Completed
              </p>

              <h1 className="text-3xl md:text-4xl font-bold text-[#4b4263] mt-2">
                {assessment.title}
              </h1>

              {/* SCORE CIRCLE */}

              <div className="mt-8 flex justify-center">

                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex flex-col items-center justify-center">

                  <span className="text-4xl font-bold text-[#4b4263]">
                    {Math.round(
                      Number(
                        result.percentage
                      )
                    )}
                    %
                  </span>

                  <span className="text-sm text-[#6b6280]">
                    Score
                  </span>

                </div>

              </div>

              {/* SCORE DETAILS */}

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mt-8">

                <div className="rounded-2xl bg-[#fffaf8] p-5">

                  <p className="text-sm text-[#6b6280]">
                    Marks
                  </p>

                  <p className="text-2xl font-bold text-[#4b4263] mt-1">
                    {result.score} /{" "}
                    {result.totalMarks}
                  </p>

                </div>

                <div className="rounded-2xl bg-[#fffaf8] p-5">

                  <p className="text-sm text-[#6b6280]">
                    Status
                  </p>

                  <p
                    className={`text-2xl font-bold mt-1 ${
                      result.passed
                        ? "text-green-600"
                        : "text-orange-500"
                    }`}
                  >
                    {result.passed
                      ? "Passed ✓"
                      : "Try Again"}
                  </p>

                </div>

              </div>

              {/* MESSAGE */}

              <div
                className={`mt-8 rounded-2xl px-5 py-4 ${
                  result.passed
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-orange-50 text-orange-700 border border-orange-200"
                }`}
              >
                {result.passed
                  ? "Great job! You successfully passed this assessment. 🌟"
                  : "Keep learning and come back stronger. You can do it! 💪"}
              </div>

              {/* BUTTONS */}

              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">

                <button
                  onClick={() =>
                    router.push(
                      `/courses/${courseId}`
                    )
                  }
                  className="px-6 py-3 rounded-2xl border border-pink-200 text-[#4b4263] font-semibold hover:bg-pink-50 transition"
                >
                  ← Back to Course
                </button>

                <button
                  onClick={() =>
                    router.push(
                      "/dashboard"
                    )
                  }
                  className="px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
                >
                  Dashboard →
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>
    );
  }

  /* =========================================
     NO QUESTIONS
  ========================================= */

  if (questions.length === 0) {
    return (
      <main className="min-h-screen bg-[#fffaf8]">

        <nav className="bg-white border-b border-pink-100 px-6 py-4">

          <div className="max-w-6xl mx-auto flex justify-between items-center">

            <div className="flex items-center gap-2">

              <span className="text-3xl">
                🌸
              </span>

              <span className="text-2xl font-bold text-[#4b4263]">
                Learn
                <span className="text-[#ef6f9f]">
                  Sphere
                </span>
              </span>

            </div>

            <button
              onClick={() =>
                router.push(
                  `/courses/${courseId}`
                )
              }
              className="text-[#6b6280] font-semibold hover:text-[#ef6f9f]"
            >
              ← Back
            </button>

          </div>

        </nav>

        <section className="px-6 py-16">

          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-pink-100 shadow-lg p-10 text-center">

            <div className="text-6xl">
              📭
            </div>

            <h1 className="text-2xl font-bold text-[#4b4263] mt-5">
              No Questions Yet
            </h1>

            <p className="text-[#6b6280] mt-3">
              The instructor hasn't added
              questions to this assessment yet.
            </p>

            <button
              onClick={() =>
                router.push(
                  `/courses/${courseId}`
                )
              }
              className="mt-7 px-6 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold"
            >
              ← Back to Course
            </button>

          </div>

        </section>

      </main>
    );
  }

  /* =========================================
     CURRENT QUESTION
  ========================================= */

  const question =
    questions[currentQuestion];

  const answeredCount =
    Object.keys(answers).length;

  const progress =
    (answeredCount /
      questions.length) *
    100;

  /* =========================================
     MAIN QUIZ PAGE
  ========================================= */

  return (
    <main className="min-h-screen bg-[#fffaf8]">

      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className="bg-white border-b border-pink-100 px-6 py-4">

        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <button
            onClick={() =>
              router.push("/")
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

          <button
            onClick={() =>
              router.push(
                `/courses/${courseId}`
              )
            }
            className="text-[#6b6280] font-semibold hover:text-[#ef6f9f] transition"
          >
            ← Exit Assessment
          </button>

        </div>

      </nav>

      {/* =====================================
          ASSESSMENT HEADER
      ===================================== */}

      <section className="px-6 pt-8">

        <div className="max-w-4xl mx-auto">

          <div className="rounded-3xl p-7 bg-gradient-to-r from-pink-100 via-purple-100 to-[#dff5ef]">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-sm font-bold text-[#ef6f9f] uppercase tracking-wide">
                  Assessment 📝
                </p>

                <h1 className="text-3xl font-bold text-[#4b4263] mt-1">
                  {assessment.title}
                </h1>

                {assessment.description && (
                  <p className="text-[#6b6280] mt-2">
                    {assessment.description}
                  </p>
                )}

              </div>

              <div className="flex flex-wrap gap-2">

                <span className="px-4 py-2 rounded-full bg-white/80 text-sm font-semibold text-[#4b4263]">
                  🎯{" "}
                  {assessment.totalMarks}{" "}
                  Marks
                </span>

                <span className="px-4 py-2 rounded-full bg-white/80 text-sm font-semibold text-[#4b4263]">
                  ✓ Pass:{" "}
                  {assessment.passingMarks}
                </span>

                {assessment.duration && (
                  <span className="px-4 py-2 rounded-full bg-white/80 text-sm font-semibold text-[#4b4263]">
                    ⏱️{" "}
                    {assessment.duration}{" "}
                    min
                  </span>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          PROGRESS BAR
      ===================================== */}

      <section className="px-6 pt-6">

        <div className="max-w-4xl mx-auto">

          <div className="flex justify-between mb-2 text-sm">

            <span className="font-semibold text-[#4b4263]">
              Question{" "}
              {currentQuestion + 1}{" "}
              of {questions.length}
            </span>

            <span className="text-[#6b6280]">
              {answeredCount}/
              {questions.length} answered
            </span>

          </div>

          <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-[#ef6f9f] rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

      </section>

      {/* =====================================
          QUESTION CARD
      ===================================== */}

      <section className="px-6 py-8">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-[2rem] border border-pink-100 shadow-sm p-7 md:p-10">

            {/* QUESTION HEADER */}

            <div className="flex justify-between items-center mb-7">

              <span className="px-4 py-2 rounded-full bg-[#eee5ff] text-sm font-bold text-[#4b4263]">
                Question{" "}
                {currentQuestion + 1}
              </span>

              <span className="text-sm text-[#6b6280]">
                {question.marks}{" "}
                {question.marks === 1
                  ? "mark"
                  : "marks"}
              </span>

            </div>

            {/* QUESTION */}

            <h2 className="text-xl md:text-2xl font-bold text-[#4b4263] leading-relaxed">
              {question.questionText}
            </h2>

            {/* OPTIONS */}

            <div className="space-y-4 mt-8">

              {question.options.map(
                (option, index) => {

                  const selected =
                    answers[
                      question._id
                    ] === option;

                  return (
                    <button
                      key={`${question._id}-${index}`}
                      type="button"
                      onClick={() =>
                        selectAnswer(
                          question._id,
                          option
                        )
                      }
                      className={`w-full text-left p-5 rounded-2xl border-2 flex items-center gap-4 transition ${
                        selected
                          ? "border-[#ef6f9f] bg-pink-50"
                          : "border-pink-100 bg-white hover:bg-[#fffaf8] hover:border-pink-200"
                      }`}
                    >

                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${
                          selected
                            ? "bg-[#ef6f9f] text-white"
                            : "bg-[#eee5ff] text-[#4b4263]"
                        }`}
                      >
                        {String.fromCharCode(
                          65 + index
                        )}
                      </div>

                      <span className="font-medium text-[#4b4263]">
                        {option}
                      </span>

                      {selected && (
                        <span className="ml-auto text-xl text-[#ef6f9f]">
                          ✓
                        </span>
                      )}

                    </button>
                  );
                }
              )}

            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-600">
                ⚠️ {error}
              </div>
            )}

            {/* NAVIGATION */}

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-9 pt-6 border-t border-pink-100">

              <button
                type="button"
                disabled={
                  currentQuestion === 0
                }
                onClick={() =>
                  setCurrentQuestion(
                    (previous) =>
                      Math.max(
                        previous - 1,
                        0
                      )
                  )
                }
                className={`px-6 py-3 rounded-2xl font-semibold transition ${
                  currentQuestion === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#eee5ff] text-[#4b4263] hover:opacity-80"
                }`}
              >
                ← Previous
              </button>

              {currentQuestion <
              questions.length - 1 ? (

                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestion(
                      (previous) =>
                        Math.min(
                          previous + 1,
                          questions.length -
                            1
                        )
                    )
                  }
                  className="px-7 py-3 rounded-2xl bg-[#ef6f9f] text-white font-semibold hover:opacity-90 transition"
                >
                  Next Question →
                </button>

              ) : (

                <button
                  type="button"
                  onClick={
                    submitAssessment
                  }
                  disabled={submitting}
                  className={`px-7 py-3 rounded-2xl text-white font-bold transition ${
                    submitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#ef6f9f] hover:opacity-90"
                  }`}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Assessment ✓"}
                </button>

              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          QUESTION NAVIGATOR
      ===================================== */}

      <section className="px-6 pb-12">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6">

            <h3 className="font-bold text-[#4b4263] mb-4">
              Questions
            </h3>

            <div className="flex flex-wrap gap-3">

              {questions.map(
                (item, index) => {

                  const answered =
                    Boolean(
                      answers[
                        item._id
                      ]
                    );

                  const current =
                    index ===
                    currentQuestion;

                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() =>
                        setCurrentQuestion(
                          index
                        )
                      }
                      className={`w-11 h-11 rounded-xl font-bold transition ${
                        current
                          ? "bg-[#ef6f9f] text-white"
                          : answered
                          ? "bg-[#dff5ef] text-[#4b4263]"
                          : "bg-[#eee5ff] text-[#4b4263] hover:bg-pink-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                }
              )}

            </div>

            <div className="flex flex-wrap gap-5 mt-5 text-xs text-[#6b6280]">

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ef6f9f]" />
                Current
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#dff5ef]" />
                Answered
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#eee5ff]" />
                Not answered
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          FOOTER
      ===================================== */}

      <footer className="bg-white border-t border-pink-100 px-6 py-8">

        <div className="max-w-6xl mx-auto text-center">

          <p className="text-sm text-[#6b6280]">
            LearnSphere · Learn something beautiful every day. 🌸
          </p>

        </div>

      </footer>

    </main>
  );
}