import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import MovieCard from '../components/MovieCard'
import api from '../api/api'

const Favorite = () => {
  const [favoriteMovies, setFavoriteMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFavorites = async () => {
      if (!!localStorage.getItem('authToken')) {
        try {
          const res = await api.get('/auth/me/favorites')
          setFavoriteMovies(Array.isArray(res.data) ? res.data : [])
          return
        } catch (err) {
          console.error('Failed to load favorites from server', err.response?.data || err.message)
        }
      }

      const storedFavorites = JSON.parse(localStorage.getItem('favoriteMovies') || '[]')
      setFavoriteMovies(Array.isArray(storedFavorites) ? storedFavorites : [])
    }

    loadFavorites().finally(() => setLoading(false))
  }, [])

  const removeFavorite = async (movieId) => {
    if (!!localStorage.getItem('authToken')) {
      try {
        const res = await api.delete(`/auth/me/favorites/${movieId}`)
        const favorites = Array.isArray(res.data) ? res.data : []
        setFavoriteMovies(favorites)
        toast.success('Removed from favorites')
        return
      } catch (err) {
        console.error('Failed to remove favorite', err.response?.data || err.message)
        toast.error(err.response?.data?.message || 'Could not remove favorite')
      }
    }

    const updated = favoriteMovies.filter((movie) => movie._id !== movieId)
    setFavoriteMovies(updated)
    localStorage.setItem('favoriteMovies', JSON.stringify(updated))
    toast.success('Removed from favorites')
  }

  return favoriteMovies.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]'>
      <h1 className='text-lg font-medium my-4'>Your Favorite Movies</h1>
      <div className='flex flex-wrap max-sm:justify-center gap-8'>
        {favoriteMovies.map((movie) => (
          <div key={movie._id} className='relative'>
            <MovieCard movie={movie} />
            <button
              type='button'
              onClick={() => removeFavorite(movie._id)}
              className='absolute right-4 top-4 rounded-full bg-red-600/90 px-3 py-2 text-xs text-white hover:bg-red-500 transition'
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen px-4 text-center'>
      <h1 className='text-3xl font-bold'>No favorite movies yet</h1>
      <p className='text-sm text-gray-400 mt-3'>Add favorites from the movie details page to see them here.</p>
    </div>
  )
}

export default Favorite