import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/api";
import { Loading } from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckCircle2, Film, Image as ImageIcon, Upload, XCircle } from "lucide-react";

const FileCard = ({
  icon: Icon,
  title,
  subtitle,
  file,
  accept,
  onChange,
  optional,
}) => (
  <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900/40">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-100">
            {title}{" "}
            {optional ? (
              <span className="ml-1 text-xs text-gray-500">(Optional)</span>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      {file ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Selected
        </span>
      ) : (
        <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-400">
          No file
        </span>
      )}
    </div>

    <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-700 bg-gray-950/30 px-4 py-4 text-sm text-gray-300 hover:border-primary/50 hover:bg-gray-950/60 transition">
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
      <Upload className="h-4 w-4" />
      <span className="font-medium">{file ? "Change file" : "Choose file"}</span>
      {file ? (
        <span className="truncate max-w-[60%] text-xs text-gray-500">
          {file.name}
        </span>
      ) : null}
    </label>
  </div>
);

const AddTrailer = () => {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get("/api/movies");
        setMovies(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load movies.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const selectedMovieTitle = useMemo(() => {
    return movies.find((m) => m._id === selectedMovie)?.title || "";
  }, [movies, selectedMovie]);

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!selectedMovie) {
      setError("Please select a movie.");
      return;
    }
    if (!videoFile) {
      setError("Please select a trailer video file.");
      return;
    }

    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
    if (!allowedVideoTypes.includes(videoFile.type)) {
      setError("Please upload an MP4, WebM, or Ogg video.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("movieId", selectedMovie);
      formData.append("video", videoFile);
      if (imageFile) formData.append("image", imageFile);

      await api.post("/api/trailers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Trailer uploaded successfully.");
      setVideoFile(null);
      setImageFile(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload trailer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <>
      <Title text1="Upload" text2="Trailer" />

      <div className="mt-8 max-w-6xl">
        {/* Header */}
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                Trailer Upload
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose a movie, upload the trailer video, and optionally a thumbnail image.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                Required: Movie + Video
              </span>
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                Optional: Thumbnail
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Select */}
          <div className="lg:col-span-1">
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-100">Movie</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select which movie this trailer belongs to.
                  </p>
                </div>
                <Film className="h-5 w-5 text-gray-500" />
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-200">
                  Choose Movie
                </label>
                <select
                  value={selectedMovie}
                  onChange={(e) => setSelectedMovie(e.target.value)}
                  className="mt-2 w-full rounded-2xl bg-gray-950/60 border border-gray-800 px-4 py-3 text-sm text-gray-200
                             focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition"
                >
                  <option value="">Select a movie</option>
                  {movies.map((movie) => (
                    <option key={movie._id} value={movie._id}>
                      {movie.title}
                    </option>
                  ))}
                </select>

                {selectedMovieTitle ? (
                  <div className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                    <p className="text-sm text-emerald-300">
                      Selected: <span className="font-semibold">{selectedMovieTitle}</span>
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-gray-500">
                    Tip: If the dropdown is empty, make sure your movies API returns data.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Files + Submit */}
          <div className="lg:col-span-2 space-y-6">
            <FileCard
              icon={Film}
              title="Trailer Video"
              subtitle="Accepted: MP4 / WebM / Ogg. Keep file size reasonable for upload."
              file={videoFile}
              accept="video/mp4,video/webm,video/ogg"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            />

            <FileCard
              icon={ImageIcon}
              title="Thumbnail Image"
              subtitle="Optional image preview for the trailer (poster-like thumbnail)."
              file={imageFile}
              accept="image/*"
              optional
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />

            {/* Status + CTA */}
            <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  {error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <XCircle className="mt-0.5 h-4 w-4 text-red-300" />
                        <p className="text-sm text-red-300">{error}</p>
                      </div>
                    </div>
                  ) : null}

                  {success ? (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                        <p className="text-sm text-emerald-300">{success}</p>
                      </div>
                    </div>
                  ) : null}

                  <p className="text-xs text-gray-500">
                    Max size depends on your backend upload limit (multer / server config).
                  </p>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={isSubmitting}
                  className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-white
                             hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Uploading..." : "Upload Trailer"}
                </button>
              </div>

              {/* Quick clear buttons (UI only) */}
              {(videoFile || imageFile) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {videoFile ? (
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300 hover:bg-gray-900/60 transition"
                    >
                      Clear video
                    </button>
                  ) : null}
                  {imageFile ? (
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300 hover:bg-gray-900/60 transition"
                    >
                      Clear thumbnail
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddTrailer;
