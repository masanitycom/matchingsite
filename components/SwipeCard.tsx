'use client'

import { useState } from 'react'
import Image from 'next/image'

interface UserProfile {
  id: string
  nickname: string
  age: number
  prefecture: string
  city: string
  occupation: string
  height: number
  weight: number
  body_type: string
  bio: string
  interests: string[]
  relationship_status: string
  looking_for: string
  photos: string[]
  main_photo_url: string
  is_verified: boolean
  last_active: string
}

interface SwipeCardProps {
  profile: UserProfile
  onSwipe: (direction: 'left' | 'right' | 'up') => void
}

export default function SwipeCard({ profile, onSwipe }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [offsetX, setOffsetX] = useState(0)
  const [offsetY, setOffsetY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleStart = (clientX: number, clientY: number) => {
    setStartX(clientX)
    setStartY(clientY)
    setIsDragging(true)
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    setOffsetX(clientX - startX)
    setOffsetY(clientY - startY)
  }

  const handleEnd = () => {
    if (!isDragging) return

    const threshold = 100
    
    if (Math.abs(offsetX) > threshold) {
      onSwipe(offsetX > 0 ? 'right' : 'left')
    } else if (offsetY < -threshold) {
      onSwipe('up')
    }

    setOffsetX(0)
    setOffsetY(0)
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd()
    }
  }

  const nextPhoto = () => {
    if (profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => 
        prev === profile.photos.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevPhoto = () => {
    if (profile.photos.length > 1) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? profile.photos.length - 1 : prev - 1
      )
    }
  }

  const rotation = offsetX * 0.1
  const opacity = 1 - Math.abs(offsetX) / 500

  return (
    <div className="relative h-[600px] select-none">
      <div
        className="absolute inset-0 bg-white rounded-2xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${rotation}deg)`,
          opacity: opacity,
          transition: isDragging ? 'none' : 'all 0.3s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-2/3">
          <img
            src={profile.photos[currentPhotoIndex] || profile.main_photo_url || '/default-avatar.png'}
            alt={profile.nickname}
            className="w-full h-full object-cover"
          />
          
          {profile.is_verified && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              認証済み
            </div>
          )}

          {profile.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h2 className="text-white text-2xl font-bold">
              {profile.nickname}, {profile.age}
            </h2>
            <p className="text-white/90 text-sm">
              {profile.prefecture} {profile.city}
            </p>
          </div>
        </div>

        <div className="p-4 h-1/3 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center text-gray-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {profile.occupation || '未設定'}
            </div>

            {profile.height && (
              <div className="flex items-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                {profile.height}cm / {profile.weight}kg / {profile.body_type}
              </div>
            )}

            <div className="flex items-center text-gray-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {profile.looking_for}
            </div>

            {profile.bio && (
              <p className="text-gray-700 text-sm">{profile.bio}</p>
            )}

            {profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {offsetX !== 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {offsetX > 0 ? (
            <div className="bg-green-500 text-white px-6 py-3 rounded-full text-xl font-bold rotate-12">
              LIKE
            </div>
          ) : (
            <div className="bg-red-500 text-white px-6 py-3 rounded-full text-xl font-bold -rotate-12">
              PASS
            </div>
          )}
        </div>
      )}

      {offsetY < -50 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="bg-blue-500 text-white px-6 py-3 rounded-full text-xl font-bold">
            SUPER LIKE
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 pb-4">
        <button
          onClick={() => onSwipe('left')}
          className="bg-white shadow-lg rounded-full p-4 hover:scale-110 transition-transform"
        >
          <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={() => onSwipe('up')}
          className="bg-white shadow-lg rounded-full p-4 hover:scale-110 transition-transform"
        >
          <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>

        <button
          onClick={() => onSwipe('right')}
          className="bg-white shadow-lg rounded-full p-4 hover:scale-110 transition-transform"
        >
          <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}