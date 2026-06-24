import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import { Loading } from '../components/Loading'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import getMediaUrl from '../lib/mediaUrl'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const navigate = useNavigate()
  const baseUrl = api.defaults.baseURL || ""
  const [bookings,setBookings] = useState([])
  const [isLoading,setIsLoading] = useState(true)
  const [error,setError] = useState("")

  const getMyBookings = async () =>{
    try {
      const res = await api.get("/api/bookings/my")
      setBookings(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      if (err?.response?.status === 401) {
        navigate("/login")
        return
      }
      setError(err?.response?.data?.message || "Failed to load bookings.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    getMyBookings()
  },[])

  return !isLoading ? (
    <div className='relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]'>
      <div>
        <h1  className='text-lg font-semibold mb-4'>My Bookings</h1>

        {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

        {bookings.length === 0 && !error && (
          <p className='text-gray-400'>No bookings yet.</p>
        )}

        {bookings.map((item)=>(
          <div key={item._id} className='flex flex-col md:flex-row justify-between bg-primary/8 border border-primary/20 rounded-lg mt-4 p-2 max-w-3xl'>
            <div className='flex felx-col md:flex-row'>
              <img src={getMediaUrl(item.show?.movie?.poster_path, baseUrl)} alt=""  className='md:max-w-45 aspect-video h-auto object-cover object-bottom rounded'/>
              <div className='flex felx-col p-4'>
                <p className='text-lg font-semibold'>{item.show?.movie?.title || "Movie"}</p>
                <p className='text-gray-400 text-sm'>
                  {item.show?.movie?.runtime ? timeFormat(item.show.movie.runtime) : "N/A"}
                </p>
                <p className='text-gray-400 text-sm mt-auto'>
                  {item.show?.showDateTime ? dateFormat(item.show.showDateTime) : "N/A"}
                </p>
               
              </div>
            </div>

            <div className='flex flex-col md:items-end md:text-right justify-between p-4'>
              <div className='flex items-center gap-4'>
                <p className='text-2xl font-semibold mb-3'>{currency}{item.amount ?? 0}</p>
                {!item.isPaid && <button className='bg-primary px-4 py-1.5 mb-3 text-sm rounded-full font-medium cursor-pointer'>Pay Now</button> }
              </div>
              <div className='text-sm'>
                <p><span className='text-gray-400'>Total Tickets:</span>{item.bookedSeats?.length || 0}</p>
                <p><span className='text-gray-400'>Seat Number:</span>{item.bookedSeats?.join(", ") || "-"}</p>
              </div>
            </div>
          </div>
        ))}
      </div>  
    </div>
  ) : <Loading/>
}

export default MyBookings
