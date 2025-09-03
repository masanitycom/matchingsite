'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import BottomNavigation from '@/components/BottomNavigation'

interface Match {
  id: string
  matched_at: string
  user: {
    id: string
    nickname: string
    main_photo_url: string
    last_active: string
    is_verified: boolean
  }
  lastMessage?: {
    content: string
    created_at: string
    is_read: boolean
  }
}

export default function MatchesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    fetchMatches()
  }, [user])

  const fetchMatches = async () => {
    if (!user) return

    try {
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          id,
          matched_at,
          user1_id,
          user2_id,
          status
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active')
        .order('matched_at', { ascending: false })

      if (error) throw error

      const matchesWithProfiles = await Promise.all(
        (matchData || []).map(async (match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, nickname, main_photo_url, last_active, is_verified')
            .eq('id', otherUserId)
            .single()

          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, is_read')
            .eq('match_id', match.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            id: match.id,
            matched_at: match.matched_at,
            user: profile,
            lastMessage: lastMessage
          }
        })
      )

      setMatches(matchesWithProfiles.filter(m => m.user))
    } catch (error) {
      console.error('Error fetching matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (days > 0) return `${days}日前`
    if (hours > 0) return `${hours}時間前`
    if (minutes > 0) return `${minutes}分前`
    return '今'
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">マッチ</h1>

          {matches.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">💝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                まだマッチがありません
              </h2>
              <p className="text-gray-600 mb-6">
                新しい出会いを探してスワイプしましょう！
              </p>
              <Link
                href="/home"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200"
              >
                スワイプを開始
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/messages/${match.id}`}
                  className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={match.user.main_photo_url || '/default-avatar.png'}
                        alt={match.user.nickname}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      {match.user.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {match.user.nickname}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(match.lastMessage?.created_at || match.matched_at)}
                        </span>
                      </div>
                      
                      {match.lastMessage ? (
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {match.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-purple-600 mt-1">
                          新しいマッチ！メッセージを送ってみましょう
                        </p>
                      )}
                    </div>

                    {match.lastMessage && !match.lastMessage.is_read && (
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  )
}