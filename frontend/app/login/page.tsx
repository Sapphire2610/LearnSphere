"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

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
                setError(
                    data.message || "Invalid email or password."
                );
                return;
            }

            // Store login information
            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            // Redirect based on role
            if (data.user.role === "admin") {
                router.push("/admin");
            } else if (data.user.role === "instructor") {
                router.push("/instructor");
            } else {
                router.push("/dashboard");
            }

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to LearnSphere server."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8">

                    {/* Logo / Icon */}
                    <div className="text-center mb-8">

                        <div className="text-4xl mb-3">
                            🌷
                        </div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome Back
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Login to continue learning with LearnSphere
                        </p>

                    </div>

                    {/* Login Form */}
                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

                        {/* Email */}
                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />

                        </div>

                        {/* Password */}
                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />

                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? "Logging in..."
                                : "Login"}
                        </button>

                    </form>

                    {/* Register Link */}
                    <div className="text-center mt-6 text-sm text-gray-600">

                        Don't have an account?{" "}

                        <Link
                            href="/register"
                            className="text-pink-500 font-semibold hover:underline"
                        >
                            Create Account
                        </Link>

                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-4">

                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-pink-500 transition"
                        >
                            ← Back to Home
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}