"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [price, setPrice] = useState("0");
  const [thumbnail, setThumbnail] = useState("");
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

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

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/courses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            category,
            level,
            price: Number(price),
            thumbnail,
            published,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to create course."
        );
        return;
      }

      setSuccess("Course created successfully! 🎉");

      setTimeout(() => {
        router.push("/instructor");
      }, 1200);
    } catch (error) {
      console.error("Create course error:", error);

      setError(
        "Unable to connect to LearnSphere server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fffaf8] text-[#4b4263]">

      {/* NAVBAR */}

      <nav className="border-b border-pink-100 bg-white px-6 py-4">

        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <button
            onClick={() =>
              router.push("/instructor")
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

          <button
            onClick={() =>
              router.push("/instructor")
            }
            className="rounded-xl px-4 py-2 text-sm hover:bg-pink-50"
          >
            ← Instructor Dashboard
          </button>

        </div>

      </nav>


      {/* PAGE HEADER */}

      <section className="mx-auto max-w-4xl px-6 pt-10">

        <button
          onClick={() =>
            router.push("/instructor")
          }
          className="text-sm text-[#81778d] hover:text-[#ef6f9f]"
        >
          ← Back to Dashboard
        </button>

        <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-[#ffe5ef] via-[#fff4f7] to-[#eee5ff] p-8 md:p-10">

          <span className="inline-block rounded-full bg-white/70 px-4 py-2 text-sm text-[#ef6f9f]">
            ✨ Course Creation
          </span>

          <h1 className="mt-5 text-3xl font-bold md:text-4xl">
            Create a New Course 📚
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-[#81778d]">
            Share your knowledge with learners by
            creating an engaging course on LearnSphere.
          </p>

        </div>

      </section>


      {/* FORM */}

      <section className="mx-auto max-w-4xl px-6 py-8">

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-pink-100 bg-white p-7 shadow-sm md:p-9"
        >

          {/* COURSE TITLE */}

          <div>

            <label className="text-sm font-semibold">
              Course Title *
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Complete Python Programming"
              required
              className="mt-2 w-full rounded-xl border border-pink-100 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ef6f9f]"
            />

          </div>


          {/* DESCRIPTION */}

          <div className="mt-6">

            <label className="text-sm font-semibold">
              Course Description *
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe what students will learn..."
              required
              rows={5}
              className="mt-2 w-full resize-none rounded-xl border border-pink-100 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ef6f9f]"
            />

          </div>


          {/* CATEGORY + LEVEL */}

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>

              <label className="text-sm font-semibold">
                Category *
              </label>

              <input
                type="text"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                placeholder="e.g. Programming"
                required
                className="mt-2 w-full rounded-xl border border-pink-100 bg-[#fffbfd] px-4 py-3 outline-none transition focus:border-[#ef6f9f]"
              />

            </div>


            <div>

              <label className="text-sm font-semibold">
                Difficulty Level
              </label>

              <select
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-pink-100 bg-[#fffbfd] px-4 py-3 outline-none focus:border-[#ef6f9f]"
              >

                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>

              </select>

            </div>

          </div>


          {/* PRICE */}

          <div className="mt-6">

            <label className="text-sm font-semibold">
              Course Price
            </label>

            <div className="relative mt-2">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#81778d]">
                ₹
              </span>

              <input
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                className="w-full rounded-xl border border-pink-100 bg-[#fffbfd] py-3 pl-9 pr-4 outline-none focus:border-[#ef6f9f]"
              />

            </div>

            <p className="mt-2 text-xs text-[#81778d]">
              Enter 0 if the course is free.
            </p>

          </div>


          {/* THUMBNAIL */}

          <div className="mt-6">

            <label className="text-sm font-semibold">
              Thumbnail URL
            </label>

            <input
              type="url"
              value={thumbnail}
              onChange={(event) =>
                setThumbnail(event.target.value)
              }
              placeholder="https://example.com/course-image.jpg"
              className="mt-2 w-full rounded-xl border border-pink-100 bg-[#fffbfd] px-4 py-3 outline-none focus:border-[#ef6f9f]"
            />

            <p className="mt-2 text-xs text-[#81778d]">
              Optional. You can add a course image later.
            </p>

          </div>


          {/* PUBLISH OPTION */}

          <div className="mt-7 rounded-2xl bg-[#fff7fa] p-5">

            <div className="flex items-start gap-4">

              <input
                type="checkbox"
                checked={published}
                onChange={(event) =>
                  setPublished(event.target.checked)
                }
                className="mt-1 h-5 w-5 accent-pink-500"
              />

              <div>

                <p className="font-semibold">
                  Publish course immediately
                </p>

                <p className="mt-1 text-sm leading-6 text-[#81778d]">
                  Published courses can be displayed to
                  students. Uncheck this to save the course
                  as a draft.
                </p>

              </div>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
              ❌ {error}
            </div>
          )}


          {/* SUCCESS */}

          {success && (
            <div className="mt-6 rounded-2xl bg-[#dff5ef] px-5 py-4 text-sm text-green-600">
              {success}
            </div>
          )}


          {/* BUTTONS */}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                router.push("/instructor")
              }
              className="rounded-xl border border-pink-100 px-6 py-3 text-sm font-semibold hover:bg-pink-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#ef6f9f] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e45c8f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Course... 🌸"
                : "✨ Create Course"}
            </button>

          </div>

        </form>

      </section>


      {/* FOOTER */}

      <footer className="border-t border-pink-100 bg-[#faf5ff] py-8 text-center">

        <div className="text-2xl">
          🎓 🌸 ✨
        </div>

        <p className="mt-2 text-sm text-[#81778d]">
          LearnSphere · Teach. Inspire. Empower.
        </p>

      </footer>

    </main>
  );
}