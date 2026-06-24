import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, Calendar1Icon, Clock10Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {

  const navigate = useNavigate()

  return (
    <div className='relative h-screen bg-[url("/backgroundImage.png")] bg-cover bg-center'>
      
      {/* Overlay */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10'></div>

      {/* Content */}
      <div className='relative z-10 flex flex-col items-start justify-center gap-5 px-6 md:px-16 lg:px-36 h-full'>

        <img
          src={assets.marvelLogo}
          alt="Marvel"
          className='h-10 mt-20'
        />

        <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-xl'>
          Guardians <br /> of the Galaxy
        </h1>

        {/* Meta Info */}
        <div className='flex flex-wrap items-center gap-3 text-sm text-gray-200'>
          <span className='px-3 py-1 rounded-full bg-white/10 backdrop-blur'>
            Action • Adventure • Sci-Fi
          </span>

          <span className='flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur'>
            <Calendar1Icon className='w-4 h-4' /> 2018
          </span>

          <span className='flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur'>
            <Clock10Icon className='w-4 h-4' /> 2h 8m
          </span>
        </div>

        <p className='max-w-md text-gray-300 text-sm md:text-base leading-relaxed'>
          In a post-apocalyptic world where cities ride on wheels and consume each
          other to survive, two people meet in London and try to stop a conspiracy.
        </p>

        <button
          onClick={() => navigate('/movies')}
          className='group flex items-center gap-2 px-7 py-3 text-sm bg-primary hover:bg-primary-dull transition-all rounded-full font-medium shadow-lg'
        >
          Explore Movies
          <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
        </button>

      </div>
    </div>
  )
}

export default HeroSection
