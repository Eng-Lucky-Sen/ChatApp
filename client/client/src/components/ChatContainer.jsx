
import React, { useRef, useEffect, useState, useContext } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { formatMessageTime } from '../lib/utils'
import toast from 'react-hot-toast'
import nlp from "compromise/one";

// ─────────────────────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

  :root {
    --aurora-1: #7c3aed;
    --aurora-2: #4f46e5;
    --aurora-3: #06b6d4;
    --glass: rgba(255,255,255,0.04);
    --glass-border: rgba(255,255,255,0.08);
    --msg-me: rgba(124,58,237,0.25);
    --msg-them: rgba(255,255,255,0.06);
    --surface: rgba(10,8,25,0.85);
  }

  .chat-root * { font-family: 'Sora', sans-serif; box-sizing: border-box; }

  .chat-scroll::-webkit-scrollbar { width: 3px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }
  .chat-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 10px; }

  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .bubble-in { animation: bubbleIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  @keyframes auroraGlow {
    0%,100% { box-shadow: 0 0 12px 2px rgba(124,58,237,0.5); }
    50%      { box-shadow: 0 0 22px 6px rgba(79,70,229,0.7); }
  }
  .send-btn:hover { animation: auroraGlow 1.4s ease infinite; }

  @keyframes dot1 { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
  @keyframes dot2 { 0%,60%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
  @keyframes dot3 { 0%,60%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .dot1 { animation: dot1 1s infinite; }
  .dot2 { animation: dot2 1s infinite; }
  .dot3 { animation: dot3 1s infinite; }

  .reaction-bar { 
    opacity: 0; transform: translateY(6px) scale(0.9); 
    transition: all 0.18s ease; pointer-events: none;
  }
  .msg-wrap:hover .reaction-bar { 
    opacity: 1; transform: translateY(0) scale(1); pointer-events: all; 
  }

  .chat-input:focus { outline: none; }
  .input-wrap:focus-within { 
    border-color: rgba(124,58,237,0.6) !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  .msg-img { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .msg-img:hover { transform: scale(1.03); box-shadow: 0 8px 32px rgba(124,58,237,0.3); }

  @keyframes onlinePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
    50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }
  .online-dot { animation: onlinePulse 2s infinite; }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .name-shimmer {
    background: linear-gradient(90deg, #fff 30%, #a78bfa 50%, #fff 70%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }

  .react-emoji { 
    cursor: pointer; padding: 3px 6px; border-radius: 8px; font-size: 15px;
    transition: transform 0.15s ease, background 0.15s;
  }
  .react-emoji:hover { transform: scale(1.3); background: rgba(255,255,255,0.1); }

  .check-double { color: #a78bfa; font-size: 11px; font-family: 'JetBrains Mono', monospace; }

  @keyframes suggestSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .suggest-box { animation: suggestSlide 0.18s ease forwards; }
  .suggest-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; cursor: pointer; font-size: 12.5px;
    color: rgba(255,255,255,0.75);
    transition: background 0.15s ease, color 0.15s ease;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .suggest-item:last-child { border-bottom: none; }
  .suggest-item:hover { background: rgba(124,58,237,0.2); color: #fff; }
  .suggest-item .suggest-icon { opacity: 0.4; font-size: 11px; flex-shrink: 0; }
  .suggest-item mark { background: none; color: #a78bfa; font-weight: 600; }

  /* ── TONE ANALYZER BAR ── */
  @keyframes toneSlide {
    from { opacity: 0; transform: translateY(4px); max-height: 0; }
    to   { opacity: 1; transform: translateY(0); max-height: 60px; }
  }
  .tone-bar { animation: toneSlide 0.22s ease forwards; overflow: hidden; }

  .tone-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 11px;
    font-weight: 500; letter-spacing: 0.04em;
    transition: all 0.3s ease;
  }

  /* ── SCHEDULE MODAL ── */
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-in { animation: modalIn 0.24s cubic-bezier(0.34,1.3,0.64,1) forwards; }

  /* ── ANALYTICS PANEL ── */
  @keyframes panelSlide {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .analytics-panel { animation: panelSlide 0.3s ease forwards; }

  @keyframes barGrow {
    from { width: 0; }
  }
  .stat-bar { animation: barGrow 0.8s cubic-bezier(0.34,1.2,0.64,1) forwards; }

  /* ── SCHEDULED BADGE ── */
  @keyframes scheduledPulse {
    0%,100% { opacity: 1; } 50% { opacity: 0.5; }
  }
  .scheduled-badge { animation: scheduledPulse 2s ease infinite; }

  /* ── ICON BUTTONS ── */
  .icon-btn {
    width: 34px; height: 34px; border-radius: 50%; border: none;
    background: rgba(255,255,255,0.06);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 15px;
    transition: background 0.15s ease, transform 0.15s ease;
    color: rgba(255,255,255,0.7);
  }
  .icon-btn:hover { background: rgba(124,58,237,0.25); transform: scale(1.08); color: #fff; }
  .icon-btn.active { background: rgba(124,58,237,0.35); color: #a78bfa; }

  /* Tooltip */
  .has-tip { position: relative; }
  .has-tip::after {
    content: attr(data-tip);
    position: absolute; bottom: calc(100% + 8px); left: 50%;
    transform: translateX(-50%); white-space: nowrap;
    background: rgba(14,11,30,0.95); color: rgba(255,255,255,0.8);
    font-size: 10px; padding: 4px 8px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,0.1);
    opacity: 0; pointer-events: none;
    transition: opacity 0.15s ease;
    font-family: 'Sora', sans-serif;
  }
  .has-tip:hover::after { opacity: 1; }

  .pill-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 12px; border-radius: 20px; border: none; cursor: pointer;
    font-size: 11px; font-weight: 500; font-family: 'Sora', sans-serif;
    transition: all 0.15s ease;
  }
  .pill-btn:hover { filter: brightness(1.15); transform: translateY(-1px); }
  .pill-btn:active { transform: scale(0.96); }
`

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const REACTIONS = ['❤️', '😂', '👍', '😮', '🔥', '🎉']

const SUGGESTION_WORDS = [
  "hello", "hi there", "how are you", "good morning", "good afternoon",
  "good night", "good evening", "thank you", "thanks a lot", "you're welcome",
  "no problem", "sounds good", "let's meet", "what are you doing",
  "okay", "sure", "see you", "bye", "take care", "talk later",
  "on my way", "be right back", "just a minute", "call me",
  "I'll check", "let me know", "miss you", "love you",
]

// ─── FEATURE 1: Tone Analyzer ───────────────────────────────
// Detects emotional tone of typed message in real time.
// Purely client-side: keyword + pattern based scoring (no API needed).
const TONE_RULES = [
  { label: 'Loving', emoji: '💜', color: '#ec4899', bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.35)', keywords: ['love','miss you','heart','care','adore','darling','sweetheart'] },
  { label: 'Excited', emoji: '🚀', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', keywords: ['amazing','awesome','wow','great','fantastic','excited','can\'t wait','yes!','wooo'] },
  { label: 'Angry', emoji: '😤', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', keywords: ['hate','angry','stop','enough','seriously','stupid','idiot','worst','terrible','frustrated'] },
  { label: 'Sad', emoji: '💙', color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.35)', keywords: ['sad','sorry','upset','disappointed','hurt','miss','lonely','cry','broken'] },
  { label: 'Sarcastic', emoji: '🙃', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.35)', keywords: ['sure','obviously','clearly','wow thanks','oh great','totally','right','whatever','cool story'] },
  { label: 'Friendly', emoji: '😊', color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.35)', keywords: ['hey','hi','hello','haha','lol','hehe','😊','😄','friend','buddy','bro'] },
  { label: 'Formal', emoji: '🎩', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: 'rgba(148,163,184,0.35)', keywords: ['regarding','hereby','please','kindly','accordingly','furthermore','sincerely','dear','greetings'] },
  { label: 'Urgent', emoji: '⚡', color: '#f97316', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.35)', keywords: ['urgent','asap','immediately','now','hurry','quick','emergency','right away','need you'] },
]

const analyzeTone = (text) => {
  if (!text || text.trim().length < 3) return null
  const lower = text.toLowerCase()
  let best = null, bestScore = 0
  TONE_RULES.forEach(rule => {
    const score = rule.keywords.reduce((acc, kw) => acc + (lower.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) { bestScore = score; best = rule }
  })
  // Fallback: detect question
  if (!best && (lower.endsWith('?') || lower.startsWith('what') || lower.startsWith('why') || lower.startsWith('how') || lower.startsWith('when'))) {
    return { label: 'Curious', emoji: '🤔', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' }
  }
  if (!best && text.trim().length > 2) {
    return { label: 'Neutral', emoji: '😐', color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)' }
  }
  return best
}

// ─── FEATURE 3: Analytics data generator ────────────────────
const generateAnalytics = (messages, authUserId) => {
  if (!messages.length) return null
  const mine = messages.filter(m => m.senderId?.toString() === authUserId?.toString())
  const theirs = messages.filter(m => m.senderId?.toString() !== authUserId?.toString())
  const total = messages.length

  // Hour distribution
  const hours = Array(24).fill(0)
  messages.forEach(m => {
    const h = new Date(m.createdAt).getHours()
    hours[h]++
  })
  const peakHour = hours.indexOf(Math.max(...hours))
  const formatHour = h => h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`

  // Emoji frequency
  const emojiMap = {}
  const emojiRe = /\p{Emoji_Presentation}/gu
  messages.forEach(m => {
    if (!m.text) return
    const found = m.text.match(emojiRe) || []
    found.forEach(e => { emojiMap[e] = (emojiMap[e] || 0) + 1 })
  })
  const topEmojis = Object.entries(emojiMap).sort((a,b) => b[1]-a[1]).slice(0,5)

  // Average word count
  const avgWords = mine.length
    ? Math.round(mine.reduce((a, m) => a + (m.text?.split(' ').length || 0), 0) / mine.length)
    : 0

  // Response rate
  const responseRate = total > 1 ? Math.round((theirs.length / total) * 100) : 50

  return {
    total,
    mine: mine.length,
    theirs: theirs.length,
    peakHour: formatHour(peakHour),
    topEmojis,
    avgWords,
    responseRate,
    hourData: hours,
  }
}

// ─────────────────────────────────────────────────────────────
const injectStyles = () => {
  if (!document.getElementById('chat-styles')) {
    const el = document.createElement('style')
    el.id = 'chat-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)

  const scrollEnd = useRef()
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [reactions, setReactions] = useState({})
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeout = useRef(null)

  // ── Feature 1: Tone Analyzer
  const [tone, setTone] = useState(null)

  // ── Feature 2: Message Scheduler
  const [showScheduler, setShowScheduler] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduledMsgs, setScheduledMsgs] = useState([]) // { text, sendAt, id }
  const scheduleTimers = useRef({})

  // ── Feature 3: Analytics
  const [showAnalytics, setShowAnalytics] = useState(false)

  injectStyles()

  const isOnline = onlineUsers.includes(selectedUser?._id?.toString())

  // ── Send message handler
  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (input.trim() === '') return
    await sendMessage({ text: input.trim() })
    setInput('')
    setSuggestions([])
    setTone(null)
  }

  // ── Image handler
  const handleSendImage = async (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file')
      return
    }
    const reader = new FileReader()
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // ── Input change: suggestions + tone
  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)
    setIsTyping(true)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1200)

    // Tone analysis
    setTone(analyzeTone(value))

    // NLP suggestions
    if (!value.trim()) { setSuggestions([]); return }
    const doc = nlp(value)
    const lastWord = doc.terms().last().out('text').toLowerCase()
    const query = lastWord || value.toLowerCase()
    const prefixMatches = SUGGESTION_WORDS.filter(w => w.toLowerCase().startsWith(query))
    const containsMatches = SUGGESTION_WORDS.filter(w => !w.toLowerCase().startsWith(query) && w.toLowerCase().includes(query))
    setSuggestions([...new Set([...prefixMatches, ...containsMatches])].slice(0, 5))
  }

  const applySuggestion = (word) => {
    setInput(word)
    setSuggestions([])
    setTone(analyzeTone(word))
  }

  const highlight = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (<>{text.slice(0, idx)}<mark>{text.slice(idx, idx + query.length)}</mark>{text.slice(idx + query.length)}</>)
  }

  const handleReact = (index, emoji) => {
    setReactions(prev => ({ ...prev, [index]: prev[index] === emoji ? null : emoji }))
  }

  // ── FEATURE 2: Schedule message
  const handleScheduleMessage = () => {
    if (!input.trim()) { toast.error('Type a message first'); return }
    if (!scheduleDate || !scheduleTime) { toast.error('Pick a date and time'); return }
    const sendAt = new Date(`${scheduleDate}T${scheduleTime}`)
    if (sendAt <= new Date()) { toast.error('Choose a future time'); return }

    const id = Date.now()
    const newMsg = { id, text: input.trim(), sendAt }
    setScheduledMsgs(prev => [...prev, newMsg])

    // Auto-send at the scheduled time
    const delay = sendAt.getTime() - Date.now()
    scheduleTimers.current[id] = setTimeout(async () => {
      await sendMessage({ text: newMsg.text })
      setScheduledMsgs(prev => prev.filter(m => m.id !== id))
      toast.success(`⏰ Scheduled message sent: "${newMsg.text.slice(0, 30)}..."`)
    }, delay)

    setInput('')
    setTone(null)
    setShowScheduler(false)
    setScheduleDate('')
    setScheduleTime('')
    toast.success(`📅 Scheduled for ${sendAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`)
  }

  const cancelScheduled = (id) => {
    clearTimeout(scheduleTimers.current[id])
    delete scheduleTimers.current[id]
    setScheduledMsgs(prev => prev.filter(m => m.id !== id))
    toast('Scheduled message cancelled', { icon: '🗑️' })
  }

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id)
  }, [selectedUser])

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup timers
  useEffect(() => {
    return () => Object.values(scheduleTimers.current).forEach(clearTimeout)
  }, [])

  const analytics = generateAnalytics(messages, authUser?._id)

  // ─────────────────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────────────────
  if (!selectedUser) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '12px', height: '100%',
        background: 'radial-gradient(ellipse at 50% 60%, rgba(124,58,237,0.08) 0%, transparent 70%)',
      }} className="max-md:hidden">
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(124,58,237,0.3)',
          boxShadow: '0 0 40px rgba(124,58,237,0.2)',
        }}>
          <img src={assets.logo_icon} style={{ width: 36 }} alt="" />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, letterSpacing: '0.05em', fontFamily: 'Sora, sans-serif' }}>
          Select a conversation to begin
        </p>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div className="chat-root" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%)' }} />

      {/* ────────── HEADER ────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(255,255,255,0.02)',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={selectedUser.profilePic || assets.avatar_icon} alt=""
            style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover',
              border: isOnline ? '2px solid rgba(34,197,94,0.6)' : '2px solid rgba(255,255,255,0.1)',
              boxShadow: isOnline ? '0 0 12px rgba(34,197,94,0.3)' : 'none',
              transition: 'all 0.3s ease' }} />
          {isOnline && (
            <span className="online-dot" style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#22c55e', border: '2px solid #0a0819',
            }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <p className="name-shimmer" style={{ fontSize: 15, fontWeight: 600, margin: 0, lineHeight: 1 }}>
            {selectedUser.fullName}
          </p>
          <p style={{ fontSize: 11, color: isOnline ? '#4ade80' : 'rgba(255,255,255,0.3)', marginTop: 3, letterSpacing: '0.04em' }}>
            {isOnline ? '● Active now' : '○ Offline'}
            {scheduledMsgs.length > 0 && (
              <span className="scheduled-badge" style={{ marginLeft: 8, color: '#f59e0b', fontSize: 10 }}>
                ⏰ {scheduledMsgs.length} scheduled
              </span>
            )}
          </p>
        </div>

        {/* Header action buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

          {/* ── FEATURE 3: Analytics button */}
          <button
            className={`icon-btn has-tip ${showAnalytics ? 'active' : ''}`}
            data-tip="Chat Analytics"
            onClick={() => setShowAnalytics(v => !v)}
            title="Chat Analytics"
          >📊</button>

          <img src={assets.help_icon} alt="" style={{ width: 18, opacity: 0.5, cursor: 'pointer' }} className="max-md:hidden" />
          <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt=""
            style={{ width: 22, opacity: 0.6, cursor: 'pointer' }} className="md:hidden" />
        </div>
      </div>

      {/* ────────── ANALYTICS PANEL (Feature 3) ────────── */}
      {showAnalytics && analytics && (
        <div className="analytics-panel" style={{
          position: 'absolute', top: 70, right: 16, zIndex: 50, width: 280,
          background: 'rgba(10,8,28,0.97)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: 20,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.1)',
          overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '14px 18px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.08))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>📊 Chat Analytics</span>
              <button onClick={() => setShowAnalytics(false)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: 16, lineHeight: 1,
              }}>×</button>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(167,139,250,0.6)', margin: '4px 0 0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              This Conversation
            </p>
          </div>

          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Message split */}
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Message Split</p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
                <div style={{ flex: analytics.mine, height: 6, background: 'linear-gradient(90deg,#7c3aed,#4f46e5)', borderRadius: 4 }} />
                <div style={{ flex: analytics.theirs, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#a78bfa' }}>You — {analytics.mine} msgs</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Them — {analytics.theirs} msgs</span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Total Messages', value: analytics.total, icon: '💬' },
                { label: 'Peak Hour', value: analytics.peakHour, icon: '⏰' },
                { label: 'Avg Words / Msg', value: analytics.avgWords, icon: '✍️' },
                { label: 'Their Reply Rate', value: `${analytics.responseRate}%`, icon: '↩️' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12, padding: '10px 12px',
                }}>
                  <p style={{ fontSize: 16, margin: '0 0 4px' }}>{stat.icon}</p>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{stat.value}</p>
                  <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', margin: '2px 0 0', letterSpacing: '0.04em' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Activity chart — mini bar chart of last 24h */}
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Activity by Hour (24h)
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36 }}>
                {analytics.hourData.map((count, h) => {
                  const maxVal = Math.max(...analytics.hourData, 1)
                  const pct = (count / maxVal) * 100
                  return (
                    <div key={h} title={`${h}:00 — ${count} msgs`}
                      style={{
                        flex: 1, borderRadius: '2px 2px 0 0',
                        background: pct > 60
                          ? 'linear-gradient(180deg,#7c3aed,#4f46e5)'
                          : pct > 20
                            ? 'rgba(124,58,237,0.4)'
                            : 'rgba(255,255,255,0.08)',
                        height: `${Math.max(pct, 4)}%`,
                        transition: 'height 0.5s ease',
                        cursor: 'default',
                      }} />
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>12am</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>12pm</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>11pm</span>
              </div>
            </div>

            {/* Top emojis */}
            {analytics.topEmojis.length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Top Emojis</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {analytics.topEmojis.map(([emoji, count]) => (
                    <div key={emoji} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, padding: '4px 10px',
                    }}>
                      <span style={{ fontSize: 14 }}>{emoji}</span>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: 'JetBrains Mono, monospace' }}>×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────── MESSAGES ────────── */}
      <div className="chat-scroll" style={{
        flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
        display: 'flex', flexDirection: 'column', gap: 4,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.04)',
            padding: '3px 12px', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Today</span>
        </div>

        {/* ── Scheduled messages preview */}
        {scheduledMsgs.length > 0 && (
          <div style={{ margin: '4px 0 8px' }}>
            {scheduledMsgs.map(sm => (
              <div key={sm.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px dashed rgba(245,158,11,0.3)',
                borderRadius: 14, marginBottom: 6,
              }}>
                <span style={{ fontSize: 14 }}>⏰</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 400 }}>
                    {sm.text.length > 40 ? sm.text.slice(0, 40) + '…' : sm.text}
                  </p>
                  <p style={{ fontSize: 10, color: '#f59e0b', margin: '2px 0 0' }}>
                    Sending at {sm.sendAt.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button onClick={() => cancelScheduled(sm.id)} style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 8, padding: '3px 8px', cursor: 'pointer',
                  fontSize: 10, color: '#f87171', fontFamily: 'Sora, sans-serif',
                }}>Cancel</button>
              </div>
            ))}
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.senderId?.toString() === authUser._id?.toString()
          const reaction = reactions[index]
          return (
            <div key={index} className="msg-wrap" style={{
              display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
              marginBottom: 6, position: 'relative',
            }}>
              {!isMe && (
                <img src={selectedUser?.profilePic || assets.avatar_icon} alt=""
                  style={{ width: 26, height: 26, borderRadius: '50%', alignSelf: 'flex-end', marginRight: 8, flexShrink: 0, opacity: 0.85 }} />
              )}

              <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                {/* Reaction bar */}
                <div className="reaction-bar" style={{
                  display: 'flex', gap: 2, marginBottom: 4,
                  background: 'rgba(20,16,40,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, padding: '3px 6px',
                  backdropFilter: 'blur(12px)',
                }}>
                  {REACTIONS.map(emoji => (
                    <span key={emoji} className="react-emoji" onClick={() => handleReact(index, emoji)}
                      style={{ opacity: reaction === emoji ? 1 : 0.7 }}>{emoji}</span>
                  ))}
                </div>

                <div className="bubble-in">
                  {msg.image ? (
                    <img src={msg.image} alt="" className="msg-img"
                      style={{ maxWidth: 200, borderRadius: 16, cursor: 'pointer', display: 'block' }}
                      onClick={() => window.open(msg.image)} />
                  ) : (
                    <div style={{
                      padding: '9px 14px',
                      background: isMe
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))'
                        : 'rgba(255,255,255,0.06)',
                      border: isMe ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.07)',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backdropFilter: 'blur(8px)',
                      boxShadow: isMe ? '0 2px 16px rgba(124,58,237,0.15)' : 'none',
                    }}>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 300, lineHeight: 1.5, margin: 0, wordBreak: 'break-word' }}>
                        {msg.text}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  {reaction && (
                    <span style={{
                      fontSize: 13, background: 'rgba(255,255,255,0.08)',
                      padding: '1px 6px', borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}>{reaction}</span>
                  )}
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {formatMessageTime(msg.createdAt)}
                  </p>
                  {isMe && <span className="check-double">✓✓</span>}
                </div>
              </div>

              {isMe && (
                <img src={authUser?.profilePic || assets.avatar_icon} alt=""
                  style={{ width: 26, height: 26, borderRadius: '50%', alignSelf: 'flex-end', marginLeft: 8, flexShrink: 0 }} />
              )}
            </div>
          )
        })}

        {isTyping && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px 18px 18px 4px', padding: '10px 14px',
              display: 'flex', gap: 4, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} className={`dot${i + 1}`} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'rgba(167,139,250,0.8)', display: 'block',
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={scrollEnd} />
      </div>

      {/* ────────── FEATURE 1: TONE ANALYZER BAR ────────── */}
      {tone && input.trim().length > 2 && (
        <div className="tone-bar" style={{
          margin: '0 16px',
          padding: '7px 14px',
          background: tone.bg,
          border: `1px solid ${tone.border}`,
          borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          position: 'relative', zIndex: 10,
        }}>
          <span style={{ fontSize: 14 }}>{tone.emoji}</span>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
              Tone detected
            </span>
            <span style={{
              marginLeft: 8, fontSize: 11, fontWeight: 600,
              color: tone.color, letterSpacing: '0.04em',
            }}>{tone.label}</span>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>AI Tone Sense™</span>
        </div>
      )}

      {/* ────────── SUGGESTIONS ────────── */}
      {suggestions.length > 0 && (
        <div className="suggest-box" style={{
          position: 'relative', zIndex: 10, margin: '0 16px',
          background: 'rgba(14,11,30,0.95)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,58,237,0.25)', borderRadius: 14,
          overflow: 'hidden',
          boxShadow: '0 -4px 24px rgba(124,58,237,0.15), 0 4px 16px rgba(0,0,0,0.4)',
        }}>
          <div style={{ padding: '5px 14px 4px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.5)' }}>✦ Suggestions</span>
          </div>
          {suggestions.map((s, i) => {
            const query = nlp(input).terms().last().out('text') || input
            return (
              <div key={i} className="suggest-item" onClick={() => applySuggestion(s)}>
                <span className="suggest-icon">↗</span>
                <span>{highlight(s, query)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ────────── INPUT BAR ────────── */}
      <div style={{
        padding: '10px 16px 14px',
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'relative', zIndex: 2,
      }}>
        <div className="input-wrap" style={{
          flex: 1, display: 'flex', alignItems: 'center',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 24, padding: '8px 14px',
          transition: 'all 0.2s ease',
        }}>
          <input
            className="chat-input"
            onChange={handleInputChange}
            value={input}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
            type="text"
            placeholder="Write something..."
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: '#fff', fontSize: 13, fontFamily: 'Sora, sans-serif',
              fontWeight: 300, letterSpacing: '0.01em',
            }}
          />

          <input onChange={handleSendImage} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: 8 }}>
            <img src={assets.gallery_icon} alt="" style={{ width: 18, opacity: 0.5, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.target.style.opacity = 1}
              onMouseLeave={e => e.target.style.opacity = 0.5} />
          </label>

          {/* ── FEATURE 2: Schedule button inside input */}
          <button
            className={`has-tip ${showScheduler ? 'active' : ''}`}
            data-tip="Schedule message"
            onClick={() => setShowScheduler(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              marginLeft: 8, fontSize: 16, opacity: showScheduler ? 1 : 0.45,
              transition: 'opacity 0.2s, transform 0.2s',
              transform: showScheduler ? 'rotate(15deg)' : 'none',
              lineHeight: 1,
            }}
            title="Schedule message"
          >⏰</button>
        </div>

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          className="send-btn"
          style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s ease', flexShrink: 0,
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img src={assets.send_button} alt="" style={{ width: 18, filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>

      {/* ────────── FEATURE 2: SCHEDULE MODAL ────────── */}
      {showScheduler && (
        <div style={{
          position: 'absolute', bottom: 80, right: 16, zIndex: 100,
          width: 300,
        }}>
          <div className="modal-in" style={{
            background: 'rgba(10,8,28,0.97)',
            border: '1px solid rgba(124,58,237,0.35)',
            borderRadius: 20, overflow: 'hidden',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1)',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(79,70,229,0.1))',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>⏰ Schedule Message</p>
                <p style={{ fontSize: 10, color: 'rgba(167,139,250,0.5)', margin: '3px 0 0', letterSpacing: '0.06em' }}>
                  NOT AVAILABLE IN WHATSAPP ✦
                </p>
              </div>
              <button onClick={() => setShowScheduler(false)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer', fontSize: 18, lineHeight: 1,
              }}>×</button>
            </div>

            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Message preview */}
              {input.trim() && (
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 12,
                }}>
                  <p style={{ fontSize: 10, color: 'rgba(167,139,250,0.5)', margin: '0 0 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Message</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, wordBreak: 'break-word' }}>
                    {input.trim().length > 60 ? input.trim().slice(0, 60) + '…' : input.trim()}
                  </p>
                </div>
              )}
              {!input.trim() && (
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '4px 0' }}>
                  Type a message first ↓
                </p>
              )}

              {/* Date picker */}
              <div>
                <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Date
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%', padding: '8px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, color: '#fff', fontSize: 12,
                    fontFamily: 'Sora, sans-serif',
                    colorScheme: 'dark',
                  }}
                />
              </div>

              {/* Time picker */}
              <div>
                <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Time
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10, color: '#fff', fontSize: 12,
                    fontFamily: 'Sora, sans-serif',
                    colorScheme: 'dark',
                  }}
                />
              </div>

              {/* Quick time options */}
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 6, letterSpacing: '0.05em' }}>Quick pick</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { label: '1h later', mins: 60 },
                    { label: '3h later', mins: 180 },
                    { label: 'Tomorrow 9am', mins: null, preset: 'tom9' },
                    { label: 'Tonight 9pm', mins: null, preset: 'tonight9' },
                  ].map(opt => (
                    <button key={opt.label} className="pill-btn" onClick={() => {
                      let d
                      if (opt.mins) {
                        d = new Date(Date.now() + opt.mins * 60000)
                      } else if (opt.preset === 'tom9') {
                        d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0)
                      } else {
                        d = new Date(); d.setHours(21, 0, 0, 0)
                        if (d <= new Date()) d.setDate(d.getDate() + 1)
                      }
                      setScheduleDate(d.toISOString().split('T')[0])
                      setScheduleTime(d.toTimeString().slice(0, 5))
                    }} style={{
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      color: '#a78bfa',
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule button */}
              <button onClick={handleScheduleMessage} className="pill-btn" style={{
                width: '100%', justifyContent: 'center',
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', color: '#fff',
                padding: '10px', borderRadius: 12,
                fontSize: 13, fontWeight: 500,
                boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
              }}>
                ⏰ Schedule Message
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default ChatContainer