import React, { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/Moviedetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import { Toaster } from 'react-hot-toast'
import Footer from './components/Footer'
import LoginSignup from './pages/LoginSignup'
import Profile from './pages/profile'
import ForgotPassword from './pages/ForgotPassword'
import ResetPasswordOtp from './pages/ResetPasswordOtp'

// Admin Pages
import Layout from './pages/Admin/Layout'
import Dashboard from './pages/Admin/Dashboard'
import AddShows from './pages/Admin/AddShows'
import AddMovie from './pages/Admin/AddMovie'
import ListBookings from './pages/Admin/ListBookings'
import ListShows from './pages/Admin/ListShows'
import AddTrailer from './pages/Admin/AddTrailer'
import AdminProfile from './pages/Admin/AdminProfile'
import ManageUsers from './pages/Admin/ManageUsers'

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith('/admin')

  // Global login state
  const [userEmail, setUserEmail] = useState(null)

  return (
    <>
      <Toaster />
      {!isAdminRoute && <Navbar userEmail={userEmail} setUserEmail={setUserEmail} />}

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/favorite' element={<Favorite />} />
        <Route path='/login' element={<LoginSignup setUserEmail={setUserEmail} />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPasswordOtp />} />
        <Route path="/profile" element={<Profile userEmail={userEmail} setUserEmail={setUserEmail} />} />

        {/* Admin Routes */}
        <Route path='/admin/*' element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path='add-movie' element={<AddMovie />} />
          <Route path='add-shows' element={<AddShows />} />
          <Route path='add-trailer' element={<AddTrailer />} />
          <Route path='profile' element={<AdminProfile />} />
          <Route path='manage-users' element={<ManageUsers />} />
          <Route path='list-shows' element={<ListShows />} />
          <Route path='list-bookings' element={<ListBookings />} />
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
