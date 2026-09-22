"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">

      {/* ================= NAVBAR ================= */}
      <nav className="w-full bg-white/90 backdrop-blur-md border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <span className="text-3xl">🌸</span>

            <span className="text-2xl font-bold text-[#4b4263]">
              Learn<span className="text-[#ef6f9f]">Sphere</span>
            </span>
          </button>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#6b6280]">
            <button
              onClick={() => router.push("/")}
              className="hover:text-[#ef6f9f] transition"
            >
              Home
            </button>

            <button
              onClick={() => router.push("/courses")}
              className="hover:text-[#ef6f9f] transition"
            >
              Courses
            </button>

            <button
              onClick={() => router.push("/login")}
              className="hover:text-[#ef6f9f] transition"
            >
              Learn
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-2.5 rounded-full bg-[#ef6f9f] text-white font-semibold shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition"
          >
            Login
          </button>

        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-pink-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-20 -right-24 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-60" />

        <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28">

          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* Hero Text */}
            <div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 border border-pink-100 text-[#ef6f9f] text-sm font-semibold mb-6">
                ✨ Learn something new every day
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Learn.
                <span className="text-[#ef6f9f]"> Grow.</span>
                <br />
                Achieve. 🚀
              </h1>

              <p className="mt-6 text-lg leading-8 text-[#6b6280] max-w-xl">
                Welcome to LearnSphere, your friendly online learning
                platform where knowledge meets curiosity. Explore courses,
                watch lessons, take assessments and track your progress.
              </p>

              {/* Hero Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">

                <button
                  onClick={() => router.push("/courses")}
                  className="px-7 py-3.5 rounded-2xl bg-[#ef6f9f] text-white font-bold shadow-md hover:opacity-90 hover:-translate-y-1 transition"
                >
                  Explore Courses 📚
                </button>

                <button
                  onClick={() => router.push("/login")}
                  className="px-7 py-3.5 rounded-2xl bg-white border border-pink-200 text-[#4b4263] font-bold shadow-sm hover:bg-pink-50 transition"
                >
                  Get Started ✨
                </button>

              </div>

            </div>

            {/* Hero Illustration */}
            <div className="relative">

              <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-[#dff5ef] rounded-[3rem] p-8 md:p-12 shadow-xl">

                <div className="bg-white rounded-[2rem] p-7 shadow-lg">

                  <div className="flex items-center justify-between mb-6">

                    <div>
                      <p className="text-sm text-[#6b6280]">
                        Welcome back 👋
                      </p>

                      <h3 className="text-xl font-bold mt-1">
                        Your Learning Space
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-2xl">
                      📚
                    </div>

                  </div>

                  {/* Progress */}
                  <div className="bg-[#fffaf8] rounded-2xl p-5 mb-4">

                    <div className="flex justify-between mb-3">

                      <span className="font-semibold">
                        Your Progress
                      </span>

                      <span className="text-[#ef6f9f] font-bold">
                        72%
                      </span>

                    </div>

                    <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden">

                      <div
                        className="h-full bg-[#ef6f9f] rounded-full"
                        style={{ width: "72%" }}
                      />

                    </div>

                  </div>

                  {/* Course Cards */}
                  <div className="grid grid-cols-2 gap-4">

                    <div className="rounded-2xl bg-[#eee5ff] p-5">

                      <div className="text-3xl mb-3">
                        💻
                      </div>

                      <p className="font-bold">
                        Programming
                      </p>

                      <p className="text-sm text-[#6b6280] mt-1">
                        12 Lessons
                      </p>

                    </div>

                    <div className="rounded-2xl bg-[#dff5ef] p-5">

                      <div className="text-3xl mb-3">
                        🌐
                      </div>

                      <p className="font-bold">
                        Web Development
                      </p>

                      <p className="text-sm text-[#6b6280] mt-1">
                        18 Lessons
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* Floating decoration */}
              <div className="absolute -top-6 -right-4 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl">
                ✨
              </div>

              <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl">
                🌱
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FEATURES ================= */}
      <section className="px-6 py-20 bg-white">

        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-14">

            <p className="text-[#ef6f9f] font-semibold mb-3">
              WHY LEARNSPHERE?
            </p>

            <h2 className="text-4xl font-bold">
              Everything you need to learn better 💗
            </h2>

            <p className="mt-4 text-[#6b6280]">
              LearnSphere brings courses, lessons, assessments and
              progress tracking together in one simple platform.
            </p>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Feature 1 */}
            <div className="rounded-3xl bg-[#fffaf8] border border-pink-100 p-7 hover:-translate-y-1 hover:shadow-lg transition">

              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-3xl mb-5">
                📚
              </div>

              <h3 className="text-xl font-bold mb-2">
                Interactive Courses
              </h3>

              <p className="text-[#6b6280] leading-6">
                Explore structured courses created to make learning
                simple and engaging.
              </p>

            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl bg-[#fffaf8] border border-pink-100 p-7 hover:-translate-y-1 hover:shadow-lg transition">

              <div className="w-14 h-14 rounded-2xl bg-[#eee5ff] flex items-center justify-center text-3xl mb-5">
                🎥
              </div>

              <h3 className="text-xl font-bold mb-2">
                Video Learning
              </h3>

              <p className="text-[#6b6280] leading-6">
                Watch lessons at your own pace and learn from
                anywhere, anytime.
              </p>

            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl bg-[#fffaf8] border border-pink-100 p-7 hover:-translate-y-1 hover:shadow-lg transition">

              <div className="w-14 h-14 rounded-2xl bg-[#dff5ef] flex items-center justify-center text-3xl mb-5">
                📝
              </div>

              <h3 className="text-xl font-bold mb-2">
                Assessments
              </h3>

              <p className="text-[#6b6280] leading-6">
                Test your knowledge with quizzes and instantly
                see your results.
              </p>

            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl bg-[#fffaf8] border border-pink-100 p-7 hover:-translate-y-1 hover:shadow-lg transition">

              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl mb-5">
                📈
              </div>

              <h3 className="text-xl font-bold mb-2">
                Track Progress
              </h3>

              <p className="text-[#6b6280] leading-6">
                Keep track of completed lessons and see how far
                you've come.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="px-6 py-20 bg-[#fffaf8]">

        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">

            <p className="text-[#ef6f9f] font-semibold mb-3">
              HOW IT WORKS
            </p>

            <h2 className="text-4xl font-bold">
              Start learning in 3 simple steps 🌷
            </h2>

          </div>

          <div className="grid md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="text-center">

              <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-100 flex items-center justify-center text-4xl mb-5">
                🔐
              </div>

              <div className="text-sm font-bold text-[#ef6f9f] mb-2">
                STEP 01
              </div>

              <h3 className="text-xl font-bold mb-2">
                Create an Account
              </h3>

              <p className="text-[#6b6280]">
                Sign in to your LearnSphere account and enter
                your personal learning space.
              </p>

            </div>

            {/* Step 2 */}
            <div className="text-center">

              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#eee5ff] flex items-center justify-center text-4xl mb-5">
                🔎
              </div>

              <div className="text-sm font-bold text-[#ef6f9f] mb-2">
                STEP 02
              </div>

              <h3 className="text-xl font-bold mb-2">
                Choose a Course
              </h3>

              <p className="text-[#6b6280]">
                Browse available courses and enroll in the ones
                that match your interests.
              </p>

            </div>

            {/* Step 3 */}
            <div className="text-center">

              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#dff5ef] flex items-center justify-center text-4xl mb-5">
                🚀
              </div>

              <div className="text-sm font-bold text-[#ef6f9f] mb-2">
                STEP 03
              </div>

              <h3 className="text-xl font-bold mb-2">
                Learn & Grow
              </h3>

              <p className="text-[#6b6280]">
                Watch lessons, complete assessments and track
                your learning progress.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 py-20">

        <div className="max-w-5xl mx-auto">

          <div className="rounded-[2.5rem] bg-gradient-to-r from-pink-100 via-purple-100 to-[#dff5ef] p-10 md:p-16 text-center">

            <div className="text-5xl mb-5">
              🌸
            </div>

            <h2 className="text-4xl font-bold">
              Ready to start learning?
            </h2>

            <p className="mt-4 text-[#6b6280] max-w-xl mx-auto">
              Join LearnSphere and turn your curiosity into
              knowledge, one lesson at a time.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="mt-8 px-8 py-4 rounded-2xl bg-[#ef6f9f] text-white font-bold shadow-md hover:opacity-90 hover:-translate-y-1 transition"
            >
              Start Learning ✨
            </button>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-white border-t border-pink-100 px-6 py-8">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-2">

            <span className="text-2xl">
              🌸
            </span>

            <span className="font-bold text-lg">
              Learn<span className="text-[#ef6f9f]">Sphere</span>
            </span>

          </div>

          <p className="text-sm text-[#6b6280]">
            © 2026 LearnSphere. Learn something beautiful every day. 💗
          </p>

          <button
            onClick={() => router.push("/login")}
            className="text-sm font-semibold text-[#ef6f9f] hover:underline"
          >
            Login →
          </button>

        </div>

      </footer>

    </main>
  );
}