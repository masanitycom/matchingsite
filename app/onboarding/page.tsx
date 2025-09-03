'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
]

const BODY_TYPES = ['スリム', '普通', 'ぽっちゃり', 'がっちり', 'マッチョ']
const RELATIONSHIP_STATUS = ['シングル', 'オープンリレーションシップ', '複雑', 'その他']
const LOOKING_FOR = ['恋人', '友達', 'チャット相手', 'ネットワーキング', 'その他']

const INTERESTS = [
  '映画', '音楽', '読書', 'スポーツ', '旅行', 'グルメ', 
  'ゲーム', 'アニメ', 'アート', 'ファッション', 'フィットネス',
  'ペット', '料理', 'カフェ巡り', 'ナイトライフ', 'アウトドア'
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profile, setProfile] = useState({
    prefecture: '',
    city: '',
    occupation: '',
    height: '',
    weight: '',
    body_type: '',
    bio: '',
    interests: [] as string[],
    relationship_status: '',
    looking_for: '',
    photos: [] as File[],
    main_photo_url: '',
  })

  const handleInterestToggle = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setProfile(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 10)
    }))
  }

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const photoUrls: string[] = []
      
      for (const photo of profile.photos) {
        const fileExt = photo.name.split('.').pop()
        const fileName = `${user.id}/${Math.random()}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('photos')
          .upload(fileName, photo)

        if (uploadError) throw uploadError
        
        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)
          
          photoUrls.push(publicUrl)
        }
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          prefecture: profile.prefecture,
          city: profile.city,
          occupation: profile.occupation,
          height: profile.height ? parseInt(profile.height) : null,
          weight: profile.weight ? parseInt(profile.weight) : null,
          body_type: profile.body_type,
          bio: profile.bio,
          interests: profile.interests,
          relationship_status: profile.relationship_status,
          looking_for: profile.looking_for,
          photos: photoUrls,
          main_photo_url: photoUrls[0] || null,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      router.push('/home')
    } catch (error: any) {
      setError(error.message || 'プロフィールの更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
              <span className="text-sm text-gray-600">ステップ {step} / 4</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">基本情報</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    都道府県
                  </label>
                  <select
                    value={profile.prefecture}
                    onChange={(e) => setProfile({ ...profile, prefecture: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {PREFECTURES.map(pref => (
                      <option key={pref} value={pref}>{pref}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    市区町村
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="例: 渋谷区"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  職業
                </label>
                <input
                  type="text"
                  value={profile.occupation}
                  onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例: エンジニア"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    身長 (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="170"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    体重 (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="65"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    体型
                  </label>
                  <select
                    value={profile.body_type}
                    onChange={(e) => setProfile({ ...profile, body_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">選択</option>
                    {BODY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">詳細情報</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  自己紹介（500文字以内）
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  maxLength={500}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="あなたについて教えてください..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {profile.bio.length} / 500
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交際ステータス
                </label>
                <select
                  value={profile.relationship_status}
                  onChange={(e) => setProfile({ ...profile, relationship_status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {RELATIONSHIP_STATUS.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  探している関係
                </label>
                <select
                  value={profile.looking_for}
                  onChange={(e) => setProfile({ ...profile, looking_for: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  {LOOKING_FOR.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">趣味・興味</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      profile.interests.includes(interest)
                        ? 'bg-purple-100 border-purple-600 text-purple-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-gray-600">
                選択済み: {profile.interests.length}個
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">写真アップロード</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プロフィール写真（最大10枚）
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {profile.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {profile.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          メイン
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                戻る
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="ml-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? '保存中...' : step === 4 ? '完了' : '次へ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}