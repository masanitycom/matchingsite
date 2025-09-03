'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  sender_id: string
  content: string
  message_type: string
  media_url: string | null
  created_at: string
  is_read: boolean
}

interface MatchUser {
  id: string
  nickname: string
  main_photo_url: string
  is_verified: boolean
}

export default function MessagePage({ params }: { params: { matchId: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [matchUser, setMatchUser] = useState<MatchUser | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    fetchMatchInfo()
    fetchMessages()
    subscribeToMessages()
  }, [user, params.matchId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMatchInfo = async () => {
    if (!user) return

    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', params.matchId)
        .single()

      if (error) throw error

      const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, nickname, main_photo_url, is_verified')
        .eq('id', otherUserId)
        .single()

      setMatchUser(profile)
    } catch (error) {
      console.error('Error fetching match info:', error)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', params.matchId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
      markMessagesAsRead(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const markMessagesAsRead = async (messages: Message[]) => {
    if (!user) return

    const unreadMessages = messages.filter(
      msg => msg.sender_id !== user.id && !msg.is_read
    )

    if (unreadMessages.length > 0) {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadMessages.map(m => m.id))
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${params.matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${params.matchId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newMessage.trim() || sending) return

    setSending(true)

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          match_id: params.matchId,
          sender_id: user.id,
          content: newMessage.trim(),
          message_type: 'text'
        })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('メッセージの送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    }
    
    return date.toLocaleDateString('ja-JP', { 
      month: 'numeric', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      <div className="bg-white shadow-sm px-4 py-3 flex items-center space-x-3">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {matchUser && (
          <>
            <img
              src={matchUser.main_photo_url || '/default-avatar.png'}
              alt={matchUser.nickname}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 flex items-center">
                {matchUser.nickname}
                {matchUser.is_verified && (
                  <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </h2>
            </div>
          </>
        )}

        <button className="p-2 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👋</div>
            <p className="text-gray-600">
              会話を始めてみましょう！
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                      {formatTime(message.created_at)}
                      {isOwn && message.is_read && ' ✓✓'}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full hover:from-purple-700 hover:to-pink-700 transition duration-200 disabled:opacity-50"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  )
}