import { StarsIcon } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import getMediaUrl from "../lib/mediaUrl";
import timeFormat from "../lib/timeFormat";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const baseUrl = api.defaults.baseURL || "";

  const openMovie = () => {
    navigate(`/movies/${movie._id}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="group w-72 rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-lg">
      {/* IMAGE */}
      <div className="relative h-56 w-full overflow-hidden cursor-pointer" onClick={openMovie}>
        <img
          src={getMediaUrl(movie.backdrop_path || movie.poster_path, baseUrl)}
          alt={movie.title}
          className="h-full w-full object-cover object-right-bottom transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Rating chip */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur border border-white/10">
          <StarsIcon className="w-4 text-primary fill-primary" />
          <span className="text-xs text-white">
            {movie.vote_average ? movie.vote_average.toFixed(1) : "0.0"}
          </span>
        </div>
        {typeof movie.vote_count === "number" && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-1 text-[11px] text-white/90">
            {movie.vote_count.toLocaleString()} votes
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        {/* TITLE */}
        <p className="font-semibold text-base leading-tight truncate">
          {movie.title}
        </p>

        {/* INFO */}
        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
          {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
          {" • "}
          {movie.genres?.slice(0, 2).map((g) => g.name).join(" • ") || "Genre"}
          {" • "}
          {movie.runtime ? timeFormat(movie.runtime) : "N/A"}
        </p>

        {movie.director?.length > 0 && (
          <p className="text-xs text-gray-500 mt-2 truncate">
            Director: <span className="text-gray-300">{movie.director[0]}</span>
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={openMovie}
            className="px-5 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium shadow-md"
          >
            Buy Tickets
          </button>

          <span className="text-xs text-gray-400">
            Tap for details
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
