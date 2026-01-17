import axios from "axios";
import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import { useParams } from "react-router-dom";

const TrailersSection = () => {
  const { id } = useParams();
  const [trailers, setTrailers] = useState([]);
  const [currentTrailer, setCurrentTrailer] = useState(null);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/trailers/${id}`
        );
        setTrailers(res.data);
        setCurrentTrailer(res.data[0]);
      } catch (error) {
        console.error("Trailer fetch failed:", error.response?.data || error.message);
      }
    };

    fetchTrailers();
  }, [id]);

  if (!currentTrailer) return null;

  const embedUrl = getEmbedUrl(currentTrailer.videoUrl);

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20">
      <p className="text-lg font-medium">Trailers</p>

      <div className="relative mt-6 aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          title="Trailer"
          allow="encrypted-media"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {trailers.map((trailer, index) => (
          <div
            key={index}
            onClick={() => setCurrentTrailer(trailer)}
            className="cursor-pointer"
          >
            <img
              src={trailer.image}
              alt=""
              className="rounded-lg h-40 object-cover"
            />
            <PlayCircle className="absolute inset-0 m-auto text-white" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailersSection;

function getEmbedUrl(url) {
  const id = url.split("v=")[1]?.split("&")[0];
  return `https://www.youtube.com/embed/${id}?mute=1`;
}
