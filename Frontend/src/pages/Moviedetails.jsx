import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import { Loading } from '../components/Loading'

const Moviedetails = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [show, setShow] = useState(null)
  const [relatedMovies, setRelatedMovies] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔐 Login check
  const isLoggedIn = !!localStorage.getItem("authToken")

  // 🎬 GET MOVIE BY ID (BACKEND)
  const getShow = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/api/movies/${id}`)

      setShow({
        movie: res.data,
        datTime: [] // later replace with show timing API
      })

      // 🔁 fetch other movies
      const allMovies = await axios.get(`http://localhost:3000/api/movies`)
      setRelatedMovies(allMovies.data.filter(m => m._id !== id))

    } catch (err) {
      console.error("Failed to load movie", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getShow()
  }, [id])

  // 🎟 Buy ticket handler
  const handleBuyTickets = () => {
    if (!isLoggedIn) {
      localStorage.setItem("redirectAfterLogin", `/movies/${id}`)
      navigate("/login")
      return
    }

    document
      .getElementById("dateSelect")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  if (loading) return <Loading />
  if (!show) return <p className="text-center mt-40">Movie not found</p>

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

        <img
          src={show.movie.poster_path}
          alt=""
          className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover'
        />

        <div className='relative flex flex-col gap-3'>
          <p className='text-primary'>
            {show.movie.original_language?.toUpperCase() || "ENGLISH"}
          </p>

          <h1 className='text-4xl font-semibold max-w-96 text-balance'>
            {show.movie.title}
          </h1>

          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>

          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>
            {show.movie.overview}
          </p>

          <p>
            {timeFormat(show.movie.runtime)} ·{" "}
            {show.movie.genres.map(g => g.name).join(", ")} ·{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          <div className='flex items-center flex-wrap gap-4 mt-4'>
            <button className='flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer'>
              <PlayCircleIcon className='w-5 h-5' />
              Watch Trailer
            </button>

            <button
              onClick={handleBuyTickets}
              className={`px-10 py-3 text-sm rounded-md font-medium transition
                ${isLoggedIn
                  ? "bg-primary hover:bg-primary-dull cursor-pointer"
                  : "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                }`}
            >
              {isLoggedIn ? "Buy Tickets" : "Login to Book"}
            </button>

            <button className='bg-gray-700 p-2.5 rounded-full'>
              <Heart className='w-5 h-5' />
            </button>
          </div>
        </div>
      </div>

      {/* CAST (OPTIONAL SAFE CHECK) */}
      {show.movie.casts?.length > 0 && (
        <>
          <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>

          <div className='overflow-x-auto no-scroller mt-8 pb-4'>
            <div className='flex items-center gap-4 w-max px-4'>
              {show.movie.casts.slice(0, 2).map((cast, index) => (
                <div key={index} className='flex flex-col items-center'>
                  <img
                    src={cast.profile_path}
                    className='rounded-full h-20 aspect-square object-cover'
                  />
                  <p className='font-medium text-xs mt-3'>{cast.name}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* BOOKING SECTION */}
      <DateSelect dateTime={show.datTime} id={id} />

      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>

      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {relatedMovies.slice(0, 4).map(movie => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>

      <div className='flex justify-center mt-20'>
        <button
          onClick={() => {
            navigate('/movies')
            scrollTo(0, 0)
          }}
          className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium'
        >
          Show More
        </button>
      </div>
    </div>
  )
}

export default Moviedetails
