'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import SwipeCard from '@/components/SwipeCard'
import BottomNavigation from '@/components/BottomNavigation'

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

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dailyLikesRemaining, setDailyLikesRemaining] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    fetchProfiles()
    checkDailyLimits()
  }, [user])

  const fetchProfiles = async () => {
    if (!user) return

    try {
      const { data: blockedUsers } = await supabase
        .from('blocks')
        .select('blocked_id')
        .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`)

      const blockedIds = blockedUsers?.map(b => b.blocked_id) || []

      const { data: likedUsers } = await supabase
        .from('likes')
        .select('liked_id')
        .eq('liker_id', user.id)

      const likedIds = likedUsers?.map(l => l.liked_id) || []

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'eq', user.id)
        .not('id', 'in', `(${[...blockedIds, ...likedIds].join(',')})`)
        .order('last_active', { ascending: false })
        .limit(20)

      if (error) throw error

      setProfiles(profiles || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkDailyLimits = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: userProfile } = await supabase
        .from('users')
        .select('is_premium, is_vip')
        .eq('id', user.id)
        .single()

      const { data: limits } = await supabase
        .from('daily_swipe_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      let maxLikes = 5
      if (userProfile?.is_vip) {
        maxLikes = 999
      } else if (userProfile?.is_premium) {
        maxLikes = 100
      }

      setDailyLikesRemaining(maxLikes - (limits?.likes_used || 0))
    } catch (error) {
      console.error('Error checking daily limits:', error)
    }
  }

  const handleSwipe = async (direction: 'left' | 'right' | 'up') => {
    if (!user || currentIndex >= profiles.length) return

    const currentProfile = profiles[currentIndex]

    try {
      if (direction === 'right' || direction === 'up') {
        if (dailyLikesRemaining <= 0) {
          alert('本日のいいね回数上限に達しました。プレミアムプランでより多くのいいねが可能です！')
          return
        }

        const { error: likeError } = await supabase
          .from('likes')
          .insert({
            liker_id: user.id,
            liked_id: currentProfile.id,
            is_super_like: direction === 'up'
          })

        if (likeError) throw likeError

        const today = new Date().toISOString().split('T')[0]
        const { error: limitError } = await supabase
          .from('daily_swipe_limits')
          .upsert({
            user_id: user.id,
            date: today,
            likes_used: dailyLikesRemaining === 999 ? 0 : profiles.length - dailyLikesRemaining + 1
          })

        if (limitError) throw limitError

        setDailyLikesRemaining(prev => prev - 1)

        const { data: mutualLike } = await supabase
          .from('likes')
          .select('*')
          .eq('liker_id', currentProfile.id)
          .eq('liked_id', user.id)
          .single()

        if (mutualLike) {
          alert(`マッチしました！${currentProfile.nickname}さんとメッセージを開始できます`)
        }
      }

      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Error handling swipe:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">GayConnect</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                本日のいいね: {dailyLikesRemaining}回
              </span>
            </div>
          </div>

          {currentIndex < profiles.length ? (
            <SwipeCard
              profile={profiles[currentIndex]}
              onSwipe={handleSwipe}
            />
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                本日の新しいプロフィールは以上です
              </h2>
              <p className="text-gray-600">
                明日また新しい出会いをチェックしてください
              </p>
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  )
}