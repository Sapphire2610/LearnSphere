"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    name: string;
    email: string;
    role: "student" | "instructor" | "admin";
    createdAt?: string;
}

export default function AdminUsersPage() {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(userData);

            if (user.role !== "admin") {
                router.push("/dashboard");
                return;
            }

            fetch("http://localhost:5000/api/admin/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(async (res) => {
                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(
                            data.message || "Failed to fetch users"
                        );
                    }

                    return data;
                })
                .then((data) => {
                    setUsers(data.users);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setError(err.message);
                    setLoading(false);
                });
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
        }
    }, [router]);

    const updateRole = async (
        userId: string,
        newRole: "student" | "instructor" | "admin"
    ) => {
        const token = localStorage.getItem("token");

        if (!token) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/users/${userId}/role`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        role: newRole,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to update role");
                return;
            }

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user._id === userId
                        ? { ...user, role: newRole }
                        : user
                )
            );
        } catch (error) {
            console.error(error);
            alert("Something went wrong while updating the role.");
        }
    };

    const deleteUser = async (userId: string) => {
        const token = localStorage.getItem("token");

        if (!token) return;

        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `http://localhost:5000/api/admin/users/${userId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Unable to delete user");
                return;
            }

            setUsers((currentUsers) =>
                currentUsers.filter((user) => user._id !== userId)
            );
        } catch (error) {
            console.error(error);
            alert("Something went wrong while deleting the user.");
        }
    };

    const getRoleStyle = (role: string) => {
        if (role === "admin") {
            return "bg-purple-100 text-purple-700";
        }

        if (role === "instructor") {
            return "bg-blue-100 text-blue-700";
        }

        return "bg-pink-100 text-pink-700";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-5xl mb-4">👥</div>
                    <p className="text-gray-600">
                        Loading users...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
                    <div className="text-4xl mb-4">⚠️</div>

                    <h2 className="text-xl font-semibold">
                        Unable to load users
                    </h2>

                    <p className="text-red-500 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="mt-5 px-5 py-2 rounded-xl bg-pink-500 text-white hover:bg-pink-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

            {/* Navbar */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                    <div>
                        <h1 className="text-2xl font-bold text-pink-600">
                            LearnSphere 🌸
                        </h1>

                        <p className="text-xs text-gray-500">
                            Admin Panel
                        </p>
                    </div>

                    <div className="flex items-center gap-4">

                        <button
                            onClick={() => router.push("/admin")}
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => router.push("/admin/courses")}
                            className="text-sm text-gray-600 hover:text-pink-600"
                        >
                            Courses
                        </button>

                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-6 py-10">

                {/* Header */}
                <div className="mb-8">

                    <p className="text-sm text-pink-500 font-medium">
                        ADMIN CONTROL CENTER
                    </p>

                    <h2 className="text-4xl font-bold text-gray-800 mt-2">
                        User Management 👥
                    </h2>

                    <p className="text-gray-600 mt-2">
                        View and manage all LearnSphere users.
                    </p>

                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Users
                        </p>

                        <p className="text-3xl font-bold text-gray-800 mt-1">
                            {users.length}
                        </p>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Students
                        </p>

                        <p className="text-3xl font-bold text-pink-600 mt-1">
                            {
                                users.filter(
                                    (user) => user.role === "student"
                                ).length
                            }
                        </p>
                    </div>

                    <div className="bg-white/80 rounded-2xl p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Instructors
                        </p>

                        <p className="text-3xl font-bold text-blue-600 mt-1">
                            {
                                users.filter(
                                    (user) => user.role === "instructor"
                                ).length
                            }
                        </p>
                    </div>

                </div>

                {/* Users Table */}
                <div className="bg-white/85 backdrop-blur-sm rounded-2xl shadow-sm border border-white overflow-hidden">

                    <div className="px-6 py-5 border-b border-gray-100">

                        <h3 className="text-xl font-bold text-gray-800">
                            All Users
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            {users.length} users registered on the platform
                        </p>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-pink-50">

                                <tr>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        User
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Email
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Role
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Change Role
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {users.map((user) => {

                                    const currentUser =
                                        JSON.parse(
                                            localStorage.getItem("user") || "{}"
                                        );

                                    const isCurrentUser =
                                        currentUser._id === user._id ||
                                        currentUser.id === user._id;

                                    return (
                                        <tr
                                            key={user._id}
                                            className="border-t border-gray-100 hover:bg-pink-50/40 transition"
                                        >

                                            <td className="px-6 py-5">

                                                <div className="flex items-center gap-3">

                                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-lg">
                                                        👤
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-800">
                                                            {user.name}
                                                        </p>

                                                        <p className="text-xs text-gray-400">
                                                            ID: {user._id.slice(-6)}
                                                        </p>
                                                    </div>

                                                </div>

                                            </td>

                                            <td className="px-6 py-5 text-sm text-gray-600">
                                                {user.email}
                                            </td>

                                            <td className="px-6 py-5">

                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getRoleStyle(
                                                        user.role
                                                    )}`}
                                                >
                                                    {user.role}
                                                </span>

                                            </td>

                                            <td className="px-6 py-5">

                                                <select
                                                    value={user.role}
                                                    disabled={isCurrentUser}
                                                    onChange={(e) =>
                                                        updateRole(
                                                            user._id,
                                                            e.target.value as
                                                            | "student"
                                                            | "instructor"
                                                            | "admin"
                                                        )
                                                    }
                                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 disabled:bg-gray-100 disabled:text-gray-400"
                                                >

                                                    <option value="student">
                                                        Student
                                                    </option>

                                                    <option value="instructor">
                                                        Instructor
                                                    </option>

                                                    <option value="admin">
                                                        Admin
                                                    </option>

                                                </select>

                                            </td>

                                            <td className="px-6 py-5">

                                                <button
                                                    disabled={isCurrentUser}
                                                    onClick={() =>
                                                        deleteUser(user._id)
                                                    }
                                                    className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 transition"
                                                >
                                                    {isCurrentUser
                                                        ? "Current Admin"
                                                        : "Delete"}
                                                </button>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>

                </div>

            </main>
        </div>
    );
}