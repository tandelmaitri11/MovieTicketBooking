import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Loading } from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import { assets } from '../assets/assets'
import isoTimeFormat from '../lib/isoTimeFormat'
import toast from 'react-hot-toast'
import api from '../api/api'
import buildShowDateMap from '../lib/showDateMap'


const SeatLayout = () => {

  const groupRows =  [["A","B"],["c","D"],["E","F"],["G","H"],["I","J"]]

  const { id, date } = useParams()
  const [selectedSeats,setSelectedSeats] = useState([])
  const [selectedTime,setSelectedTime] = useState(null)
  const [show,setShow] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [paymentResponse, setPaymentResponse] = useState(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState(localStorage.getItem("userEmail") || "")
  const [customerPhone, setCustomerPhone] = useState("")
  const [now, setNow] = useState(new Date())

  const navigate = useNavigate()
  const getShow = async () =>{
    try {
      const [movieRes, showsRes] = await Promise.all([
        api.get(`/api/movies/${id}`),
        api.get(`/api/shows/movie/${id}`),
      ])

      setShow({
        movie: movieRes.data,
        dateTime: buildShowDateMap(showsRes.data),
      })
    } catch (error) {
      console.error("Failed to load show data", error)
    }
  }

  const loadRazorpayScript = async () => {
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSeatClick = (seatId) =>{
    if(!selectedTime){
      return toast("please select time first")
    }

    if (selectedTime.isExpired) {
      return toast("This showtime has already ended")
    }

    const occupiedSeats = new Set(Object.keys(selectedTime?.occupiedSeats || {}))
    if (occupiedSeats.has(seatId)) {
      return toast("This seat is already booked")
    }

    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId) : [...prev,seatId])
  }

  const handleCustomerFormSubmit = async () => {
    if (!selectedTime || selectedTime.isExpired) {
      return toast("Cannot book an expired showtime")
    }
    if (!customerName.trim()) return toast("Please enter your name")
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return toast("Please enter a valid email")
    if (!customerPhone.trim()) return toast("Please enter your phone number")

    try {
      setCheckoutLoading(true)
      await api.post("/api/bookings", {
        showId: selectedTime.showId,
        bookedSeats: selectedSeats,
        paymentId: paymentResponse.razorpay_payment_id,
        customerName,
        customerEmail,
        customerPhone,
      })

      toast.success("Booking confirmed")
      navigate("/my-bookings")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Booking failed")
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleProceedToCheckout = async () => {
    if (!selectedTime) return toast("Please pick a showtime first")
    if (selectedTime.isExpired) return toast("Cannot checkout for an expired showtime")
    if (selectedSeats.length === 0) return toast("Select at least one seat")

    const token = localStorage.getItem("authToken")
    if (!token) {
      localStorage.setItem("redirectAfterLogin", `/movies/${id}/${date}`)
      return navigate("/login")
    }

    try {
      setCheckoutLoading(true)
      const orderRes = await api.post("/api/bookings/order", {
        showId: selectedTime.showId,
        bookedSeats: selectedSeats,
      })

      const { orderId, amount, currency, key } = orderRes.data
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        toast.error("Unable to load Razorpay SDK")
        return
      }

      const options = {
        key,
        amount,
        currency,
        name: show?.movie?.title || "Movie Ticket Booking",
        description: `Booking ${selectedSeats.length} seat(s)`,
        order_id: orderId,
        notes: {
          seats: selectedSeats.join(", "),
          showTime: isoTimeFormat(selectedTime.time),
          movie: show?.movie?.title,
          totalSeats: selectedSeats.length,
        },
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
          emi: true,
        },
        handler: async (response) => {
          try {
            setPaymentResponse(response)
            setShowCustomerForm(true)
            setCheckoutLoading(false)
          } catch (err) {
            toast.error("Payment verification failed")
            setCheckoutLoading(false)
          }
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
        prefill: {
          email: localStorage.getItem("userEmail") || "",
        },
        theme: {
          color: "#2563eb",
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      toast.error(error?.response?.data?.message || "Booking failed")
    } finally {
      setCheckoutLoading(false)
    }
  }
  
  const renderSeats = (row,count = 9) =>(
    <div key={row} className='flex gap-2 mt-2'>
      <div className='flex flex-wrap items.center justify-center gap-2'>
        {Array.from({length:count},(_,i) => {
          const seatId = `${row}${i+1}`;
          const isBooked = Boolean(selectedTime?.occupiedSeats?.[seatId])
          return(
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              disabled={isBooked}
              className={`h-8 w-8 rounded border border-primary/60 transition ${isBooked ? "bg-gray-400 text-gray-200 cursor-not-allowed" : selectedSeats.includes(seatId) ? "bg-primary text-white" : "hover:bg-primary/10"}`}>
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  )
  useEffect(()=>{
    getShow()
  },[id])

  useEffect(() => {
    setSelectedSeats([])
  }, [selectedTime])

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const showTimes = useMemo(() => {
    if (!show?.dateTime?.[date]) return []
    return show.dateTime[date].map((item) => ({
      ...item,
      isExpired: new Date(item.time) <= now,
    }))
  }, [show?.dateTime, date, now])

  const selectedTimeExpired = Boolean(selectedTime && new Date(selectedTime.time) <= now)

  return  show ? (
    <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50'>
      {/* Available Timings */}
      <div className='w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30'>
      <p className='text-lg font-semibold px-6'>Available Timings</p>
      <div className='mt-5 space-y-1'>
        {showTimes.map((item)=>(
          <div
            key={item.time}
            onClick={() => !item.isExpired && setSelectedTime(item)}
            className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md transition ${item.isExpired ? "bg-gray-600 text-gray-300 cursor-not-allowed" : selectedTime?.time === item.time ? "bg-primary text-white" : "cursor-pointer hover:bg-primary/20"}`}>
            <ClockIcon className='w-4 h-4'/>
            <p className='text-sm'>{ isoTimeFormat(item.time)}</p>
            {item.isExpired && <span className='ml-2 text-xs text-red-300'>Expired</span>}
          </div>
        ))}
        {showTimes.length === 0 && (
          <p className='px-6 text-sm text-gray-400'>No showtimes for this date.</p>
        )}
      </div>
      </div>

      {/*Seats Layout */}
      <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
        {!showCustomerForm && (
          <>
            <h1 className='text-2xl font-semibold mb-4'> Select Your seat</h1>
            <img src={assets.screenImage} alt="screen" />
            <p className='text-gray-400 text-sm mb-3'>SCREEN SIDE</p>

            <div className='flex items-center gap-4 mb-6 text-xs text-gray-300'>
              <div className='flex items-center gap-2'>
                <span className='h-3 w-3 rounded-full bg-gray-400' />
                Booked
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-3 w-3 rounded-full bg-primary' />
                Selected
              </div>
              <div className='flex items-center gap-2'>
                <span className='h-3 w-3 rounded-full border border-primary/60' />
                Available
              </div>
            </div>

            <div className='w-full max-w-md mb-6 rounded-xl border border-primary/20 bg-slate-950/70 p-4 text-sm text-gray-200'>
              <p className='font-semibold text-white mb-3'>Booking Summary</p>
              <p>Movie: {show?.movie?.title}</p>
              <p>Show time: {selectedTime ? isoTimeFormat(selectedTime.time) : "Not selected"}</p>
              <p>Seats: {selectedSeats.join(", ")}</p>
              <p>Price each: ${selectedTime?.showPrice?.toFixed(2) || "0.00"}</p>
              <p className='mt-2 font-semibold'>Payable: ${((selectedTime?.showPrice || 0) * selectedSeats.length).toFixed(2)}</p>
            </div>

            <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
              <div className='grid grid-cols-2 md:grid-cols-1 gap-8md:gap-2 mb-6'>
                {groupRows[0].map(row => renderSeats(row))}
              </div>

              <div className='grid grid-cols-2 gap-11'>
                {groupRows.slice(1).map((group,idx)=>(
                  <div key={idx}>
                    {group.map(row => renderSeats(row))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {showCustomerForm && (
          <div className='w-full max-w-md mb-6 rounded-xl border border-primary/20 bg-slate-950/70 p-4 text-sm text-gray-200'>
            <p className='font-semibold text-white mb-3'>Enter Contact Details</p>
            <div className='space-y-3'>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder='Full name'
                className='w-full rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
              />
              <input
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder='Email address'
                className='w-full rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
              />
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder='Phone number'
                className='w-full rounded-xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'
              />
            </div>
          </div>
        )}

        <button
          onClick={showCustomerForm ? handleCustomerFormSubmit : handleProceedToCheckout}
          disabled={checkoutLoading || selectedTimeExpired}
          className={`flex items-center gap-1 mt-20 px-10 py-3 text-sm rounded-full font-medium transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${selectedTimeExpired ? 'bg-gray-500 text-gray-200' : 'bg-primary hover:bg-primary-dull'}`}>
          {checkoutLoading ? "Processing..." : showCustomerForm ? "Confirm Booking" : "Pay Now"}
          <ArrowRightIcon  strokeWidth={3} className='w-4 h-4'/>
        </button>

      </div>
    </div>
  ) : (
    <Loading/>
  )
}

export default SeatLayout
