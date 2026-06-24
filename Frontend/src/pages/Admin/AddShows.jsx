import React, { useEffect, useMemo, useState } from "react";
import { Loading } from "../../components/Loading";
import Title from "../../components/admin/Title";
import { CheckIcon, StarIcon, Trash2, Plus, Ticket } from "lucide-react";
import { kConverter } from "../../lib/kConverter";
import api from "../../api/api";

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const baseUrl = api.defaults.baseURL || "";

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInpute, setDateTimeInpute] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const selectedMovieData = useMemo(
    () => nowPlayingMovies.find((m) => m._id === selectedMovie),
    [nowPlayingMovies, selectedMovie]
  );

  const getPosterSrc = (path = "") => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${baseUrl}${path}`;
  };

  const fetchNowPlayingMovies = async () => {
    try {
      const res = await api.get("/api/movies");
      setNowPlayingMovies(res.data);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Failed to load movies.");
    }
  };

  const handleDateTimeAdd = () => {
    if (!dateTimeInpute) return;

    const [date, time] = dateTimeInpute.split("T");
    if (!date || !time) return;

    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      if (!times.includes(time)) {
        return { ...prev, [date]: [...times, time] };
      }
      return prev;
    });

    setDateTimeInpute("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const existing = prev[date] || [];
      const filteredTimes = existing.filter((t) => t !== time);

      if (filteredTimes.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }

      return { ...prev, [date]: filteredTimes };
    });
  };

  useEffect(() => {
    fetchNowPlayingMovies();
  }, []);

  const handleAddShow = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!selectedMovie) {
      setSubmitError("Please select a movie.");
      return;
    }
    if (!showPrice) {
      setSubmitError("Please enter a show price.");
      return;
    }

    const showDateTimes = Object.entries(dateTimeSelection).flatMap(
      ([date, times]) => times.map((time) => `${date}T${time}`)
    );

    if (showDateTimes.length === 0) {
      setSubmitError("Please add at least one show time.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/shows", {
        movieId: selectedMovie,
        showPrice: Number(showPrice),
        showDateTimes,
      });

      setSubmitSuccess("Show(s) added successfully.");
      setShowPrice("");
      setDateTimeSelection({});
      setDateTimeInpute("");
    } catch (error) {
      setSubmitError(error.message || "Failed to add show.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return nowPlayingMovies.length > 0 ? (
    <>
      <Title text1="Add" text2="Shows" />

      {/* Page header */}
      <div className="mt-8 max-w-6xl">
        <div className="rounded-3xl border border-gray-800 bg-gradient-to-b from-gray-950/60 to-gray-950/30 p-6 md:p-7">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
                Schedule Shows
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Select a movie, set price, add date & time slots, then publish.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                Step 1: Pick Movie
              </span>
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                Step 2: Price
              </span>
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                Step 3: Times
              </span>
            </div>
          </div>
        </div>

        {/* Movie picker */}
        <div className="mt-6 rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-100">
                Now Playing Movies
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Click a poster to select.
              </p>
            </div>

            {selectedMovieData ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                <CheckIcon className="h-4 w-4" />
                Selected
              </span>
            ) : (
              <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-400">
                No selection
              </span>
            )}
          </div>

          <div className="mt-5">
            <div className="overflow-x-auto pb-2">
              <div className="group flex flex-nowrap gap-4 min-w-max">
                {nowPlayingMovies.map((movie) => (
                  <button
                    type="button"
                    key={movie._id}
                    onClick={() => setSelectedMovie(movie._id)}
                    className={[
                      "relative w-40 text-left transition",
                      selectedMovie === movie._id
                        ? "ring-2 ring-primary rounded-2xl"
                        : "opacity-100 group-hover:opacity-60 hover:opacity-100 hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-950/30">
                      <img
                        src={getPosterSrc(movie.poster_path)}
                        alt={movie.title}
                        className="h-56 w-full object-cover brightness-90"
                        loading="lazy"
                      />

                      <div className="absolute bottom-0 left-0 w-full bg-black/65 px-2.5 py-2 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="flex items-center gap-1 text-gray-300">
                            <StarIcon className="h-4 w-4 text-primary fill-primary" />
                            {Number(movie.vote_average || 0).toFixed(1)}
                          </p>
                          <p className="text-gray-300">
                            {kConverter(movie.vote_count || 0)} votes
                          </p>
                        </div>
                      </div>
                    </div>

                    {selectedMovie === movie._id ? (
                      <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-xl bg-primary shadow">
                        <CheckIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
                      </div>
                    ) : null}

                    <p className="mt-2 font-medium text-gray-100 truncate">
                      {movie.title}
                    </p>
                    <p className="text-gray-500 text-sm truncate">
                      {movie.release_date}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected movie details */}
        {selectedMovieData && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr] rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
            <img
              src={getPosterSrc(selectedMovieData.poster_path)}
              alt={selectedMovieData.title}
              className="w-full rounded-2xl object-cover border border-gray-800"
            />

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-gray-100">
                      {selectedMovieData.title}
                    </p>
                    {selectedMovieData.tagline ? (
                      <p className="text-sm text-gray-400">
                        {selectedMovieData.tagline}
                      </p>
                    ) : null}
                  </div>

                  <span className="inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 text-xs text-gray-300">
                    <StarIcon className="h-4 w-4 text-primary fill-primary" />
                    {Number(selectedMovieData.vote_average || 0).toFixed(1)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-300">
                  <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1">
                    {selectedMovieData.release_date}
                  </span>
                  <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1">
                    {selectedMovieData.runtime} min
                  </span>
                  <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1 uppercase">
                    {selectedMovieData.original_language}
                  </span>
                  <span className="rounded-full border border-gray-700 bg-gray-900/40 px-3 py-1">
                    {kConverter(selectedMovieData.vote_count || 0)} votes
                  </span>
                </div>
              </div>

              {(selectedMovieData.director?.length > 0 ||
                selectedMovieData.producer?.length > 0) && (
                <div className="text-sm text-gray-300 space-y-1">
                  {selectedMovieData.director?.length > 0 && (
                    <p>
                      <span className="text-gray-400">Director:</span>{" "}
                      {selectedMovieData.director.join(", ")}
                    </p>
                  )}
                  {selectedMovieData.producer?.length > 0 && (
                    <p>
                      <span className="text-gray-400">Producer:</span>{" "}
                      {selectedMovieData.producer.join(", ")}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedMovieData.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs px-3 py-1 rounded-full border border-gray-700 bg-gray-900/40 text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              {selectedMovieData.overview ? (
                <p className="text-sm leading-relaxed text-gray-400">
                  {selectedMovieData.overview}
                </p>
              ) : null}
            </div>
          </div>
        )}

        {/* Pricing + DateTime */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Price */}
          <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-100">
                  Show Price
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Set a single ticket price for these shows.
                </p>
              </div>
              <Ticket className="h-5 w-5 text-gray-500" />
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-3">
              <span className="text-sm text-gray-400">{currency}</span>
              <input
                min={0}
                type="number"
                value={showPrice}
                onChange={(e) => setShowPrice(e.target.value)}
                placeholder="Enter show price"
                className="w-full bg-transparent outline-none text-sm text-gray-200 placeholder:text-gray-600"
              />
            </div>
          </div>

          {/* DateTime */}
          <div className="rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-100">
                  Add Date & Time
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add multiple slots before publishing.
                </p>
              </div>
              <Plus className="h-5 w-5 text-gray-500" />
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="datetime-local"
                value={dateTimeInpute}
                onChange={(e) => setDateTimeInpute(e.target.value)}
                className="w-full rounded-2xl border border-gray-800 bg-gray-950/60 px-4 py-3 text-sm text-gray-200 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 transition"
              />
              <button
                type="button"
                onClick={handleDateTimeAdd}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition"
              >
                <Plus className="h-4 w-4" />
                Add Time
              </button>
            </div>

            {/* Selected slots */}
            {Object.keys(dateTimeSelection).length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium text-gray-200">
                  Selected Date-Time
                </p>

                <div className="mt-3 space-y-4">
                  {Object.entries(dateTimeSelection).map(([date, times]) => (
                    <div
                      key={date}
                      className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4"
                    >
                      <p className="text-sm font-semibold text-gray-100">
                        {date}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {times.map((time) => (
                          <span
                            key={time}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-gray-200"
                          >
                            {time}
                            <button
                              type="button"
                              onClick={() => handleRemoveTime(date, time)}
                              className="rounded-full p-1 hover:bg-white/5 transition"
                              aria-label="Remove time"
                            >
                              <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status + Submit */}
        <div className="mt-6 rounded-3xl border border-gray-800 bg-gray-950/40 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              {submitError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">{submitError}</p>
                </div>
              ) : null}

              {submitSuccess ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                  <p className="text-sm text-emerald-300">{submitSuccess}</p>
                </div>
              ) : null}

              <p className="text-xs text-gray-500">
                Note: Adding shows will create multiple show slots from your
                selected times.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddShow}
              disabled={isSubmitting}
              className="inline-flex w-full md:w-auto items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Adding..." : "Add Show"}
            </button>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default AddShows;
