import api from "../api/api";
import { useEffect, useMemo, useState } from "react";
import { PlayCircle } from "lucide-react";
import { useParams } from "react-router-dom";

const TrailersSection = ({ movieId: movieIdProp = "" }) => {
  const { id } = useParams();

  const [movieId, setMovieId] = useState(movieIdProp || id || "");
  const [trailers, setTrailers] = useState([]);
  const [currentTrailer, setCurrentTrailer] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [thumbs, setThumbs] = useState({});

  useEffect(() => {
    if (movieIdProp) {
      setMovieId(movieIdProp);
      return;
    }
    if (id) setMovieId(id);
  }, [id, movieIdProp]);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const url = movieId ? `/api/trailers/${movieId}` : "/api/trailers";
        const res = await api.get(url);
        const list = Array.isArray(res.data) ? res.data : [];
        setTrailers(list);
        const firstPlayable = list.find((t) => t?.videoUrl);
        setCurrentTrailer(firstPlayable || null);
      } catch (error) {
        console.error("Trailer fetch failed:", error.response?.data || error.message);
      }
    };

    fetchTrailers();
  }, [movieId]);

  useEffect(() => {
    const baseUrl = api.defaults.baseURL || "";

    const generateThumb = (videoUrl) =>
      new Promise((resolve) => {
        if (!videoUrl) return resolve("");
        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;
        video.playsInline = true;
        video.src = getVideoSrc(videoUrl, baseUrl);

        const cleanup = () => {
          video.removeAttribute("src");
          video.load();
        };

        video.addEventListener("loadeddata", () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
            cleanup();
            resolve(dataUrl);
          } catch {
            cleanup();
            resolve("");
          }
        });

        video.addEventListener("error", () => {
          cleanup();
          resolve("");
        });
      });

    const buildThumbs = async () => {
      const updates = {};
      for (const trailer of trailers) {
        const key = trailer._id || trailer.videoUrl || trailer.image;
        if (!key || thumbs[key]) continue;
        if (trailer.image || isYoutubeUrl(trailer.videoUrl)) continue;
        const thumb = await generateThumb(trailer.videoUrl);
        if (thumb) updates[key] = thumb;
      }
      if (Object.keys(updates).length > 0) {
        setThumbs((prev) => ({ ...prev, ...updates }));
      }
    };

    if (trailers.length > 0) buildThumbs();
  }, [trailers, thumbs]);

  const visibleTrailers = useMemo(() => {
    if (showAll) return trailers;
    return trailers.slice(0, 8);
  }, [trailers, showAll]);

  useEffect(() => {
    setVideoError(false);
  }, [currentTrailer]);

  const isYoutube = currentTrailer ? isYoutubeUrl(currentTrailer.videoUrl) : false;
  const videoSrc = currentTrailer ? getVideoSrc(currentTrailer.videoUrl, api.defaults.baseURL) : "";
  const currentKey =
    (currentTrailer && (currentTrailer._id || currentTrailer.videoUrl || currentTrailer.image)) || "";
  const currentPoster =
    (currentTrailer && (getThumb(currentTrailer, api.defaults.baseURL) || thumbs[currentKey])) || "";

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20">
      <p className="text-lg font-medium">Trailers</p>

      <div className="relative mt-6 aspect-video bg-black rounded-lg overflow-hidden">
        {videoSrc && !videoError ? (
          isYoutube ? (
            <iframe
              src={videoSrc}
              title="Trailer"
              allow="encrypted-media"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <video
              src={videoSrc}
              controls
              className="w-full h-full"
              poster={currentPoster || undefined}
              onError={() => setVideoError(true)}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
            Trailer video unavailable
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {visibleTrailers.map((trailer, index) => (
          <button
            key={trailer._id || index}
            onClick={() => setCurrentTrailer(trailer)}
            className="relative rounded-lg overflow-hidden focus:outline-none"
            type="button"
          >
            {getThumb(trailer, api.defaults.baseURL) || thumbs[trailer._id || trailer.videoUrl || trailer.image] ? (
              <img
                src={
                  getThumb(trailer, api.defaults.baseURL) ||
                  thumbs[trailer._id || trailer.videoUrl || trailer.image]
                }
                alt=""
                className="rounded-lg h-40 w-full object-cover"
              />
            ) : (
              <div className="h-40 w-full bg-black/40" />
            )}
            <PlayCircle className="absolute inset-0 m-auto text-white" />
          </button>
        ))}
      </div>

      {trailers.length > 8 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="px-6 py-2 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium"
          >
            {showAll ? "Show Less" : "See All Trailers"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TrailersSection;

/* ================= helpers ================= */

function isYoutubeUrl(url = "") {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYoutubeId(url = "") {
  if (!url) return "";
  if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0] || "";
  if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0] || "";
  return "";
}

function getVideoSrc(url = "", baseUrl = "") {
  if (!url) return "";
  if (isYoutubeUrl(url)) {
    const id = getYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?mute=1` : "";
  }
  if (url.startsWith("http")) return url;
  return `${baseUrl}${url}`; // ✅ for /uploads/videos/...
}

function getMediaSrc(url = "", baseUrl = "") {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${baseUrl}${url}`;
}

// ✅ if image missing, show youtube thumbnail automatically
function getThumb(trailer, baseUrl) {
  if (trailer.image) return getMediaSrc(trailer.image, baseUrl);

  if (isYoutubeUrl(trailer.videoUrl)) {
    const id = getYoutubeId(trailer.videoUrl);
    return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
  }

  return "";
}
