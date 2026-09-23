"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://learnsphere-24zf.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save login information
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Role-based redirection
      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (data.user.role === "instructor") {
        router.push("/instructor");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Unable to connect to LearnSphere server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf8] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">
            🎓
          </div>

          <h1 className="text-3xl font-bold text-[#4b4263]">
            Learn<span className="text-[#ef6f9f]">Sphere</span>
          </h1>

          <p className="mt-2 text-[#81778d]">
            Welcome back, learner! 🌸
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] border border-pink-100 shadow-lg p-8">

          <div className="text-center mb-7">
            <h2 className="text-2xl font-bold text-[#4b4263]">
              Welcome Back 💗
            </h2>

            <p className="mt-2 text-sm text-[#81778d]">
              Login to continue your learning journey.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
              🌷 {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#5b526d]">
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-pink-100 bg-[#fffafb] px-4 py-3 outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-[#5b526d]">
                Password
              </label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-pink-100 bg-[#fffafb] px-4 py-3 outline-none focus:ring-2 focus:ring-pink-200"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#ef6f9f] py-3.5 font-semibold text-white shadow-md hover:bg-[#e85c91] transition disabled:opacity-60"
            >
              {loading ? "Logging in... 🌸" : "Login 💕"}
            </button>

          </form>

          {/* Register */}
          <div className="mt-7 text-center text-sm text-[#81778d]">
            Don't have an account?{" "}

            <button
              onClick={() => router.push("/register")}
              className="font-semibold text-[#ef6f9f] hover:underline"
            >
              Create one 🌷
            </button>
          </div>
        </div>

        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="block mx-auto mt-6 text-sm text-[#81778d] hover:text-[#ef6f9f]"
        >
          ← Back to LearnSphere
        </button>

      </div>
    </main>
  );
}