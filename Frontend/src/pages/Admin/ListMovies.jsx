import React, { useEffect, useMemo, useRef, useState } from "react";
import { Loading } from "../../components/Loading";
import Title from "../../components/admin/Title";
import api from "../../api/api";
import { AlertCircle, RefreshCcw, Pencil, PlayCircle } from "lucide-react";
import { dateFormat } from "../../lib/dateFormat";

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
    {children}
  </span>
);

const ListMovies = () => {
  const [movies, setMovies] = useState([]);
  const [shows, setShows] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieForm, setMovieForm] = useState({
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
    isActive: true,
  });
  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [backdropPreview, setBackdropPreview] = useState("");
  const posterInputRef = useRef(null);
  const backdropInputRef = useRef(null);
  const [selectedShow, setSelectedShow] = useState(null);
  const [showForm, setShowForm] = useState({ showPrice: "", showDateTime: "" });
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");

  const fetchMovies = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/movies");
      setMovies(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load movies.");
    } finally {
      setLoading(false);
    }
  };

  const fetchShows = async (movieId) => {
    try {
      const res = await api.get(`/api/shows/movie/${movieId}`);
      setShows(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load shows.");
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const setSelectedMovieData = (movie) => {
    setSelectedMovie(movie);
    setSuccess("");
    setError("");
    setSelectedShow(null);
    setShowForm({ showPrice: "", showDateTime: "" });

    setMovieForm({
      title: movie.title || "",
      overview: movie.overview || "",
      release_date: movie.release_date || "",
      original_language: movie.original_language || "",
      tagline: movie.tagline || "",
      runtime: movie.runtime ? String(movie.runtime) : "",
      genres: movie.genres ? movie.genres.map((g) => g.name).join(", ") : "",
      director: movie.director ? movie.director.join(", ") : "",
      producer: movie.producer ? movie.producer.join(", ") : "",
      casts: movie.casts
        ? movie.casts
            .map((cast) => `${cast.name}|${cast.profile_path || ""}|${cast.role || ""}`)
            .join("\n")
        : "",
      crew: movie.crew
        ? movie.crew
            .map((crew) => `${crew.name}|${crew.profile_path || ""}|${crew.role || ""}`)
            .join("\n")
        : "",
      isActive: movie.isActive !== false,
    });
    setPosterFile(null);
    setBackdropFile(null);
    setPosterPreview(movie.poster_path || "");
    setBackdropPreview(movie.backdrop_path || "");

    fetchShows(movie._id);
  };

  const filteredMovies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return movies;
    return movies.filter((m) => (m.title || "").toLowerCase().includes(q));
  }, [movies, query]);

  const handleMovieFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMovieForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleShowFormChange = (e) => {
    const { name, value } = e.target;
    setShowForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetPosterSelection = () => {
    setPosterFile(null);
    setPosterPreview(selectedMovie?.poster_path || "");
    if (posterInputRef.current) posterInputRef.current.value = "";
  };

  const resetBackdropSelection = () => {
    setBackdropFile(null);
    setBackdropPreview(selectedMovie?.backdrop_path || "");
    if (backdropInputRef.current) backdropInputRef.current.value = "";
  };

  const handleUpdateMovie = async (e) => {
    e.preventDefault();
    if (!selectedMovie) return;
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = new FormData();
      payload.append("title", movieForm.title);
      payload.append("overview", movieForm.overview);
      payload.append("release_date", movieForm.release_date);
      payload.append("original_language", movieForm.original_language);
      payload.append("tagline", movieForm.tagline);
      payload.append("runtime", movieForm.runtime ? String(movieForm.runtime) : "");
      payload.append("genres", movieForm.genres);
      payload.append("director", movieForm.director);
      payload.append("producer", movieForm.producer);
      payload.append("casts", movieForm.casts);
      payload.append("crew", movieForm.crew);
      payload.append("isActive", String(movieForm.isActive));
      if (posterFile) payload.append("poster", posterFile);
      if (backdropFile) payload.append("backdrop", backdropFile);

      await api.put(`/api/movies/${selectedMovie._id}`, payload);
      setSuccess("Movie updated successfully.");
      fetchMovies();
      fetchShows(selectedMovie._id);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update movie.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditShow = (show) => {
    setSelectedShow(show);
    setShowForm({
      showPrice: show.showPrice ? String(show.showPrice) : "",
      showDateTime: show.showDateTime
        ? new Date(show.showDateTime).toISOString().slice(0, 16)
        : "",
    });
    setSuccess("");
    setError("");
  };

  const handleUpdateShow = async (e) => {
    e.preventDefault();
    if (!selectedShow) return;
    setSubmitLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.put(`/api/shows/${selectedShow._id}`, {
        showPrice: showForm.showPrice ? Number(showForm.showPrice) : undefined,
        showDateTime: showForm.showDateTime || undefined,
      });
      setSuccess("Show updated successfully.");
      fetchShows(selectedMovie._id);
      const updatedShow = shows.find((s) => s._id === selectedShow._id);
      setSelectedShow(updatedShow || null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update show.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const rows = useMemo(() => {
    return filteredMovies.map((movie) => ({
      ...movie,
      showsCount: movie._id ? shows.filter((show) => show.movie?._id === movie._id).length : 0,
    }));
  }, [filteredMovies, shows]);

  if (loading) return <Loading />;

  return (
    <>
      <Title text1="List" text2="Movies" />

      <div className="mt-6 max-w-7xl space-y-6">
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                Movie Library
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a movie to edit details and update showtimes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                <PlayCircle className="h-4 w-4 mr-2 text-gray-400" />
                Total: {movies.length}
              </Badge>

              <button
                type="button"
                onClick={fetchMovies}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-700 bg-gray-900/40 px-4 py-2 text-sm text-gray-200 hover:bg-gray-900/60 transition"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-300" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
          ) : null}

          {success ? (
            <div className="mt-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-sm text-emerald-200">{success}</p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-3xl border border-gray-800 bg-gray-950/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-300">Search movies</p>
                  <p className="text-xs text-gray-500">Filter by title before selecting a movie.</p>
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-w-[240px] rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Search title..."
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-gray-800 bg-gray-950/40">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="text-left text-gray-400 bg-gray-950/60">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Release</th>
                    <th className="p-3 font-medium">Language</th>
                    <th className="p-3 font-medium">Shows</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((movie) => (
                    <tr key={movie._id} className="border-t border-gray-800 hover:bg-gray-950/60 transition">
                      <td className="p-3 font-medium text-gray-100">{movie.title}</td>
                      <td className="p-3">{movie.release_date || "-"}</td>
                      <td className="p-3 uppercase">{movie.original_language || "-"}</td>
                      <td className="p-3">{movie.showsCount}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs ${movie.isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                          {movie.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setSelectedMovieData(movie)}
                          className="rounded-2xl border border-gray-700 bg-gray-900/40 px-3 py-2 text-xs text-gray-200 hover:bg-gray-900/60 transition"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!rows.length ? (
                    <tr>
                      <td className="p-3 text-gray-500" colSpan={6}>
                        No movies found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedMovie ? (
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <h3 className="text-lg font-semibold text-gray-100">Edit Movie</h3>
              <p className="mt-1 text-sm text-gray-500">Update title, metadata, cast, crew, and active status.</p>

              <form onSubmit={handleUpdateMovie} className="mt-6 space-y-5">
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm text-gray-200">
                    Title
                    <input
                      name="title"
                      value={movieForm.title}
                      onChange={handleMovieFormChange}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </label>

                  <label className="block text-sm text-gray-200">
                    Release Date
                    <input
                      type="date"
                      name="release_date"
                      value={movieForm.release_date}
                      onChange={handleMovieFormChange}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm text-gray-200">
                    Language
                    <input
                      name="original_language"
                      value={movieForm.original_language}
                      onChange={handleMovieFormChange}
                      placeholder="en"
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block text-sm text-gray-200">
                    Runtime (min)
                    <input
                      type="number"
                      min="0"
                      name="runtime"
                      value={movieForm.runtime}
                      onChange={handleMovieFormChange}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                <label className="block text-sm text-gray-200">
                  Tagline
                  <input
                    name="tagline"
                    value={movieForm.tagline}
                    onChange={handleMovieFormChange}
                    className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </label>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm text-gray-200">
                    Poster
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setPosterFile(file);
                        if (file) {
                          setPosterPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none file:cursor-pointer file:border-0 file:bg-gray-900/80 file:px-3 file:py-2 file:text-xs file:text-gray-100"
                    />
                    {posterFile ? (
                      <button
                        type="button"
                        onClick={resetPosterSelection}
                        className="mt-2 text-xs text-gray-300 hover:text-white"
                      >
                        Reset poster selection
                      </button>
                    ) : null}
                  </label>

                  <label className="block text-sm text-gray-200">
                    Backdrop
                    <input
                      ref={backdropInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setBackdropFile(file);
                        if (file) {
                          setBackdropPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none file:cursor-pointer file:border-0 file:bg-gray-900/80 file:px-3 file:py-2 file:text-xs file:text-gray-100"
                    />
                    {backdropFile ? (
                      <button
                        type="button"
                        onClick={resetBackdropSelection}
                        className="mt-2 text-xs text-gray-300 hover:text-white"
                      >
                        Reset backdrop selection
                      </button>
                    ) : null}
                  </label>
                </div>

                {posterPreview || backdropPreview ? (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    {posterPreview ? (
                      <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-3">
                        <p className="text-xs text-gray-400">
                          {posterFile ? "Selected poster preview" : "Current poster preview"}
                        </p>
                        <img src={posterPreview} alt="Poster preview" className="mt-3 w-full rounded-xl object-cover" />
                      </div>
                    ) : null}
                    {backdropPreview ? (
                      <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-3">
                        <p className="text-xs text-gray-400">
                          {backdropFile ? "Selected backdrop preview" : "Current backdrop preview"}
                        </p>
                        <img src={backdropPreview} alt="Backdrop preview" className="mt-3 w-full rounded-xl object-cover" />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <label className="block text-sm text-gray-200">
                  Overview
                  <textarea
                    name="overview"
                    value={movieForm.overview}
                    onChange={handleMovieFormChange}
                    className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[140px]"
                  />
                </label>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm text-gray-200">
                    Genres
                    <input
                      name="genres"
                      value={movieForm.genres}
                      onChange={handleMovieFormChange}
                      placeholder="Action, Drama"
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block text-sm text-gray-200">
                    Director(s)
                    <input
                      name="director"
                      value={movieForm.director}
                      onChange={handleMovieFormChange}
                      placeholder="Name1, Name2"
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="block text-sm text-gray-200">
                    Producer(s)
                    <input
                      name="producer"
                      value={movieForm.producer}
                      onChange={handleMovieFormChange}
                      placeholder="Name1, Name2"
                      className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>

                  <label className="block text-sm text-gray-200">
                    Active
                    <div className="mt-2 flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={movieForm.isActive}
                        onChange={handleMovieFormChange}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-900 text-primary accent-primary"
                      />
                      <span className="text-sm text-gray-300">Show this movie in app</span>
                    </div>
                  </label>
                </div>

                <label className="block text-sm text-gray-200">
                  Casts (one per line: name|profile_path|role)
                  <textarea
                    name="casts"
                    value={movieForm.casts}
                    onChange={handleMovieFormChange}
                    placeholder="Actor Name|/path|Role"
                    className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                  />
                </label>

                <label className="block text-sm text-gray-200">
                  Crew (one per line: name|profile_path|role)
                  <textarea
                    name="crew"
                    value={movieForm.crew}
                    onChange={handleMovieFormChange}
                    placeholder="Crew Name|/path|Role"
                    className="mt-2 w-full rounded-2xl border border-gray-800 bg-gray-950/70 px-4 py-3 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-darker disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitLoading ? "Saving..." : "Save Movie"}
                </button>
              </form>
            </section>

            <section className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Showtimes</h3>
                  <p className="mt-1 text-sm text-gray-500">Update price or date/time for individual shows.</p>
                </div>
                <Badge>{shows.length} shows</Badge>
              </div>

              <div className="mt-5 overflow-x-auto rounded-3xl border border-gray-800 bg-gray-950/50">
                <table className="w-full text-sm text-gray-300">
                  <thead>
                    <tr className="text-left text-gray-400 bg-gray-950/60">
                      <th className="p-3 font-medium">Show Time</th>
                      <th className="p-3 font-medium">Price</th>
                      <th className="p-3 font-medium">Booked</th>
                      <th className="p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((show) => (
                      <tr key={show._id} className="border-t border-gray-800 hover:bg-gray-950/60 transition">
                        <td className="p-3">{show.showDateTime ? dateFormat(show.showDateTime) : "-"}</td>
                        <td className="p-3">{show.showPrice != null ? show.showPrice : "-"}</td>
                        <td className="p-3">{Object.keys(show.occupiedSeats || {}).length}</td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleEditShow(show)}
                            className="rounded-2xl border border-gray-700 bg-gray-900/40 px-3 py-2 text-xs text-gray-200 hover:bg-gray-900/60 transition"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}

                    {!shows.length ? (
                      <tr>
                        <td className="p-3 text-gray-500" colSpan={4}>
                          No shows for this movie.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {selectedShow ? (
                <form onSubmit={handleUpdateShow} className="mt-6 space-y-4 rounded-3xl border border-gray-800 bg-gray-950/40 p-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-100">Edit show #{selectedShow._id.slice(-6)}</p>
                    <p className="text-xs text-gray-500">Current show time and price can be updated here.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-gray-200">
                      Show price
                      <input
                        name="showPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={showForm.showPrice}
                        onChange={handleShowFormChange}
                        className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </label>

                    <label className="block text-sm text-gray-200">
                      Show date & time
                      <input
                        name="showDateTime"
                        type="datetime-local"
                        value={showForm.showDateTime}
                        onChange={handleShowFormChange}
                        className="mt-2 w-full rounded-xl border border-gray-800 bg-gray-950/70 px-4 py-2 text-sm text-gray-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-darker disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitLoading ? "Saving..." : "Save Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedShow(null)}
                      className="inline-flex items-center justify-center rounded-full border border-gray-700 bg-gray-900/50 px-5 py-2.5 text-sm text-gray-200 transition hover:bg-gray-900/70"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </section>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ListMovies;
