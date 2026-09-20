'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  is_read: boolean
  created_at: string
}

const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  welcome: { bg: 'bg-green-100', text: 'text-green-700', label: 'XOŞ GƏLDİN' },
  system: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'SİSTEM' },
  exam: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'İMTAHAN' },
  result: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'NƏTİCƏ' },
  payment: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'ÖDƏNİŞ' },
  news: { bg: 'bg-pink-100', text: 'text-pink-700', label: 'XƏBƏR' },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']
  return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function InboxClient({
  messages: initialMessages,
  unreadCount: initialUnread,
}: {
  messages: Message[]
  unreadCount: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState(initialMessages)
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'activity'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const unreadCount = messages.filter(m => !m.is_read).length
  const totalCount = messages.length
  const lastMessage = messages[0]

  const filtered = useMemo(() => {
    if (activeTab === 'unread') return messages.filter(m => !m.is_read)
    if (activeTab === 'activity') return messages.filter(m => m.type === 'exam' || m.type === 'result')
    return messages
  }, [messages, activeTab])

  async function openMessage(msg: Message) {
    setSelectedId(msg.id)
    setSelectedMessage(msg)

    if (!msg.is_read) {
      await supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m))
      router.refresh()
    }
  }

  async function markAllRead() {
    const unreadIds = messages.filter(m => !m.is_read).map(m => m.id)
    if (unreadIds.length === 0) return
    await supabase.from('messages').update({ is_read: true }).in('id', unreadIds)
    setMessages(prev => prev.map(m => ({ ...m, is_read: true })))
    router.refresh()
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* ═══ BANNER ═══ */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl">
            📬
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Məktub qutusu</h1>
            <p className="text-sm opacity-90">
              İmtahan, qeydiyyat və sistem bildirişlərini buradan izləyin.
            </p>
          </div>
        </div>
        <div className="absolute right-4 bottom-0 text-8xl opacity-10">✉️</div>
      </div>

      {/* ═══ STAT KARTLAR ═══ */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📬</span>
            <span className="text-xs text-gray-500 font-medium">Oxunmamış</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{unreadCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📨</span>
            <span className="text-xs text-gray-500 font-medium">Ümumi</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔔</span>
            <span className="text-xs text-gray-500 font-medium">Son bildiriş</span>
          </div>
          <div className="text-sm font-bold text-gray-900">
            {lastMessage ? formatDate(lastMessage.created_at) : '—'}
          </div>
        </div>
      </div>

      {/* ═══ TABS ═══ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-4">
          <div className="flex gap-1">
            {[
              { id: 'all', label: 'Hamısı', count: totalCount },
              { id: 'unread', label: 'Oxunmamış', count: unreadCount },
              { id: 'activity', label: 'Fəaliyyətlərim', count: messages.filter(m => m.type === 'exam' || m.type === 'result').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-4 py-3 text-sm font-medium transition flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              Hamısını oxundu et
            </button>
          )}
        </div>

        {/* ═══ MESAJ SİYAHISI + DETAL ═══ */}
        <div className="grid md:grid-cols-[380px_1fr] min-h-[500px]">
          {/* Sol - siyahı */}
          <div className="border-r border-gray-100 overflow-y-auto max-h-[600px]">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm text-gray-500">
                  {activeTab === 'unread' ? 'Oxunmamış məktub yoxdur' : 'Heç bir məktub yoxdur'}
                </p>
              </div>
            ) : (
              <div>
                {filtered.map((msg) => {
                  const style = TYPE_STYLES[msg.type] || TYPE_STYLES.system
                  const isSelected = selectedId === msg.id
                  return (
                    <button
                      key={msg.id}
                      onClick={() => openMessage(msg)}
                      className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition relative ${
                        isSelected ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                          {msg.type === 'welcome' && '🎉'}
                          {msg.type === 'exam' && '📝'}
                          {msg.type === 'result' && '🏆'}
                          {msg.type === 'system' && '⚙️'}
                          {msg.type === 'payment' && '💰'}
                          {msg.type === 'news' && '📰'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <p className={`text-sm truncate ${!msg.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                            {msg.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {msg.body.slice(0, 60)}...
                          </p>
                        </div>
                        {!msg.is_read && (
                          <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sağ - detallı */}
          <div className="p-6">
            {selectedMessage ? (
              <div>
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${(TYPE_STYLES[selectedMessage.type] || TYPE_STYLES.system).bg} ${(TYPE_STYLES[selectedMessage.type] || TYPE_STYLES.system).text}`}>
                      {(TYPE_STYLES[selectedMessage.type] || TYPE_STYLES.system).label}
                    </span>
                    <span className="text-xs text-gray-400">
                      📅 {formatDate(selectedMessage.created_at)} • 🕐 {formatTime(selectedMessage.created_at)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedMessage.title}
                  </h2>
                </div>

                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.body}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-6xl mb-4">✉️</p>
                  <p className="text-gray-500">Məktubu oxumaq üçün seçin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
