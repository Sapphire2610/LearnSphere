"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must contain at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "https://learnsphere-24zf.onrender.com/api/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || "Registration failed.");
                return;
            }

            setSuccess(
                "Account created successfully! Redirecting to login..."
            );

            setTimeout(() => {
                router.push("/login");
            }, 1500);

        } catch (err) {
            console.error(err);
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
                <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-white/60">

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <div className="text-4xl mb-3">
                            🌷
                        </div>

                        <h1 className="text-3xl font-bold text-gray-800">
                            Create Account
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Join LearnSphere and start learning
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleRegister}
                        className="space-y-5"
                    >

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>

                            <input
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter your name"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />
                        </div>

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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
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
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(
                                        e.target.value
                                    )
                                }
                                placeholder="Confirm your password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-pink-300"
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-xl p-3">
                                {success}
                            </div>
                        )}

                        {/* Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition disabled:opacity-60"
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-6 text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-pink-500 font-semibold hover:underline"
                        >
                            Login
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}