import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dateOptions = Object.keys(dateTime).sort((a, b) => new Date(a) - new Date(b))

  const isDateDisabled = (date) => {
    const dateValue = new Date(date)
    dateValue.setHours(0, 0, 0, 0)

    if (dateValue < today) return true

    const shows = dateTime[date] || []
    const now = new Date()
    return shows.every((item) => new Date(item.time) <= now)
  }

  const selectDate = (date) => {
    if (isDateDisabled(date)) return
    setSelected(date)
  }

  const onBookHandler = () => {
    // 🔐 Login check
    const isLoggedIn = !!localStorage.getItem("authToken")

    if (!isLoggedIn) {
      // Save full redirect path (movie + selected date if exists)
      const redirectPath = selected
        ? `/movies/${id}/${selected}`
        : `/movies/${id}`

      localStorage.setItem("redirectAfterLogin", redirectPath)
      navigate("/login")
      return
    }

    if (!selected) {
      return toast.error("Please select a date")
    }

    navigate(`/movies/${id}/${selected}`)
    scrollTo(0, 0)
  }

  return (
    <div id='dateSelect' className='pt-30'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 bg-primary/10 border border-primary/20 rounded-lg'>
        <div>
          <p className='text-lg font-semibold'>Choose Date</p>

          <div className='flex items-center gap-6 text-sm mt-5'>
            <ChevronLeftIcon width={28} />

            <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>
              {dateOptions.map((date) => {
                const disabled = isDateDisabled(date)
                return (
                  <button
                    key={date}
                    type='button'
                    onClick={() => selectDate(date)}
                    disabled={disabled}
                    className={`flex flex-col items-center justify-center h-14 w-14 rounded transition
                      ${selected === date
                        ? "bg-primary text-white"
                        : disabled
                        ? "border border-gray-500 bg-gray-900 text-gray-400 cursor-not-allowed"
                        : "border border-primary/70 hover:bg-primary/10"
                      }`}
                  >
                    <span>{new Date(date).getDate()}</span>
                    <span>
                      {new Date(date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    {disabled && (
                      <span className='text-[10px] text-red-300 mt-1'>Expired</span>
                    )}
                  </button>
                )
              })}
            </span>

            <ChevronRightIcon width={28} />
          </div>
        </div>

        {/* 🔒 BOOK NOW */}
        <button
          onClick={onBookHandler}
          className='bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer'
        >
          Book Now
        </button>
      </div>
    </div>
  )
}

export default DateSelect
