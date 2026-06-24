import React, { useMemo, useState } from "react";
import api from "../../api/api";
import Title from "../../components/admin/Title";

const Input = ({ label, hint, error, className = "", ...props }) => (
  <div className={className}>
    <div className="flex items-end justify-between gap-3">
      <label className="block text-sm font-medium text-gray-200">{label}</label>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
    <input
      {...props}
      className={[
        "mt-2 w-full rounded-xl bg-gray-950/60 border px-4 py-2.5 text-sm text-gray-200",
        "border-gray-800 placeholder:text-gray-600",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
        "transition",
        error ? "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/20" : "",
      ].join(" ")}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

const Textarea = ({ label, hint, error, className = "", ...props }) => (
  <div className={className}>
    <div className="flex items-end justify-between gap-3">
      <label className="block text-sm font-medium text-gray-200">{label}</label>
      {hint && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
    <textarea
      {...props}
      className={[
        "mt-2 w-full rounded-xl bg-gray-950/60 border px-4 py-3 text-sm text-gray-200",
        "border-gray-800 placeholder:text-gray-600",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60",
        "transition min-h-28 resize-y",
        error ? "border-red-500/60 focus:border-red-500/70 focus:ring-red-500/20" : "",
      ].join(" ")}
    />
    {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
  </div>
);

const FileCard = ({ label, optional, file, onChange, accept = "image/*", required = false,}) => (
  <div className="rounded-2xl border border-gray-800 bg-gray-950/40 p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-200">
          {label}{" "}
          {optional ? (
            <span className="ml-1 text-xs text-gray-500">(Optional)</span>
          ) : null}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PNG/JPG/WebP recommended. Max size depends on your backend.
        </p>
      </div>

      {file ? (
        <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
          Selected
        </span>
      ) : (
        <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/40 px-2.5 py-1 text-xs text-gray-400">
          No file
        </span>
      )}
    </div>

    <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-gray-700 bg-gray-950/30 px-4 py-4 text-sm text-gray-300 hover:border-primary/50 hover:bg-gray-950/60 transition">
      <input type="file" accept={accept} className="hidden" required={required} onChange={onChange} />
      <span className="font-medium">{file ? "Change file" : "Choose file"}</span>
      {file ? (
        <span className="truncate max-w-[60%] text-xs text-gray-500">
          {file.name}
        </span>
      ) : null}
    </label>
  </div>
);

const ChipPreview = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((g) => (
          <span
            key={g}
            className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300"
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
};

const AddMovie = () => {
  const [form, setForm] = useState({
    title: "",
    overview: "",
    release_date: "",
    original_language: "",
    tagline: "",
    runtime: "",
    genres: "",
    director: "",
    producer: "",
    casts: "",
    crew: "",
    });

  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const genreChips = useMemo(() => {
    return form.genres
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 12);
  }, [form.genres]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !posterFile) {
      setError("Title and poster image are required.");
      return;
    }

    const payload = new FormData();
    payload.append("title", form.title);
    payload.append("overview", form.overview);
    payload.append("release_date", form.release_date);
    payload.append("original_language", form.original_language);
    payload.append("tagline", form.tagline);
    payload.append("runtime", form.runtime);
    payload.append("genres", form.genres);
    payload.append("director", form.director);
    payload.append("producer", form.producer);
    payload.append("casts", form.casts);
    payload.append("crew", form.crew);
    payload.append("poster", posterFile);
    if (backdropFile) payload.append("backdrop", backdropFile);

    setIsSubmitting(true);
    try {
      await api.post("/api/movies/upload", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Movie added successfully.");
      setForm({
        title: "",
        overview: "",
        release_date: "",
        original_language: "",
        tagline: "",
        runtime: "",
        genres: "",
        director: "",
        producer: "",
        casts: "",
        crew: "",
      });
      setPosterFile(null);
      setBackdropFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add movie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Title text1="Add" text2="Movie" />

      {/* Page container */}
      <div className="mt-8 max-w-6xl">
        {/* Header card */}
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                Movie Details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Fill basic info, upload images, then add cast & crew.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                Required: Title + Poster
              </span>
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                Optional: Backdrop
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left / main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <h3 className="text-base font-semibold text-gray-100">Basics</h3>
              <p className="mt-1 text-sm text-gray-500">
                What users see first on the movie page.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4">
                <Input label="Title" name="title" value={form.title} onChange={handleChange} placeholder="Movie title" required />

                <Textarea label="Overview" name="overview" value={form.overview} onChange={handleChange} placeholder="Short summary (1–3 lines)" />
              </div>
            </div>

            {/* Metadata */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <h3 className="text-base font-semibold text-gray-100">Metadata</h3>
              <p className="mt-1 text-sm text-gray-500">
                Used for filtering, search, and details.
              </p>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Release Date" type="date" name="release_date" value={form.release_date} onChange={handleChange} />

                <Input label="Language" name="original_language" value={form.original_language} onChange={handleChange} placeholder="en / hi / gu" hint="ISO code" />

                <Input label="Runtime (min)" type="number" min={0} name="runtime" value={form.runtime} onChange={handleChange} placeholder="120"  />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Tagline" name="tagline" value={form.tagline} onChange={handleChange} placeholder="A short memorable line"/>

                <Input label="Genres" name="genres" value={form.genres} onChange={handleChange} placeholder="Action, Drama, Comedy" hint="Comma separated" />
              </div>

              <ChipPreview title="Preview" items={genreChips} />

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Director" name="director" value={form.director} onChange={handleChange} placeholder="Director name(s)" />
                <Input label="Producer" name="producer" value={form.producer} onChange={handleChange} placeholder="Producer name(s)" />
              </div>
            </div>

            {/* Cast & crew */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <h3 className="text-base font-semibold text-gray-100">People</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add one entry per line.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4">
                <Textarea
                  label="Cast"
                  name="casts"
                  value={form.casts}
                  onChange={handleChange}
                  placeholder="One per line: Name | ProfileURL | Role(optional)"
                  hint="Example: Milla Jovovich | https://.../photo.jpg | Lead"
                />

                <Textarea
                  label="Crew"
                  name="crew"
                  value={form.crew}
                  onChange={handleChange}
                  placeholder="One per line: Name | ProfileURL | Role(optional)"
                />
              </div>
            </div>
          </div>

          {/* Right / sidebar */}
          <div className="space-y-6">
            {/* Uploads */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <h3 className="text-base font-semibold text-gray-100">Media</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload poster + optional backdrop.
              </p>

              <div className="mt-5 space-y-4">
                <FileCard
                  label="Poster Image"
                  file={posterFile}
                  required
                  onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                />

                <FileCard
                  label="Backdrop Image"
                  optional
                  file={backdropFile}
                  onChange={(e) => setBackdropFile(e.target.files?.[0] || null)}
                />
              </div>
            </div>

            {/* Status */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <h3 className="text-base font-semibold text-gray-100">Status</h3>
              <p className="mt-1 text-sm text-gray-500">
                You’ll see errors/success here.
              </p>

              <div className="mt-4 space-y-3">
                {error ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                ) : null}

                {success ? (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-300">{success}</p>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={[
                    "w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white",
                    "bg-primary hover:bg-primary/90",
                    "focus:outline-none focus:ring-2 focus:ring-primary/40",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                    "transition",
                  ].join(" ")}
                >
                  {isSubmitting ? "Adding..." : "Add Movie"}
                </button>

                <p className="text-xs text-gray-500">
                  Tip: Keep cast/crew format consistent for easier parsing later.
                </p>
              </div>
            </div>

            {/* Quick checklist */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <h3 className="text-base font-semibold text-gray-100">
                Checklist
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  Title entered
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  Poster selected
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
                  Genres comma-separated
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddMovie;
