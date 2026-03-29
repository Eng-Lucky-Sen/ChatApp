import React, { useRef, useEffect, useState, useContext } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { formatMessageTime } from '../lib/utils'
import toast from 'react-hot-toast'
import nlp from 'compromise'

// Inject global styles once
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

  /* Scrollbar */
  .chat-scroll::-webkit-scrollbar { width: 3px; }
  .chat-scroll::-webkit-scrollbar-track { background: transparent; }
  .chat-scroll::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.4); border-radius: 10px; }

  /* Message bubble entrance */
  @keyframes bubbleIn {
    from { opacity: 0; transform: translateY(10px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .bubble-in { animation: bubbleIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  /* Aurora pulse on send button */
  @keyframes auroraGlow {
    0%,100% { box-shadow: 0 0 12px 2px rgba(124,58,237,0.5); }
    50%      { box-shadow: 0 0 22px 6px rgba(79,70,229,0.7); }
  }
  .send-btn:hover { animation: auroraGlow 1.4s ease infinite; }

  /* Typing aurora */
  @keyframes dot1 { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
  @keyframes dot2 { 0%,60%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
  @keyframes dot3 { 0%,60%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
  .dot1 { animation: dot1 1s infinite; }
  .dot2 { animation: dot2 1s infinite; }
  .dot3 { animation: dot3 1s infinite; }

  /* Reaction popup */
  .reaction-bar { 
    opacity: 0; transform: translateY(6px) scale(0.9); 
    transition: all 0.18s ease; pointer-events: none;
  }
  .msg-wrap:hover .reaction-bar { 
    opacity: 1; transform: translateY(0) scale(1); pointer-events: all; 
  }

  /* Input focus glow */
  .chat-input:focus { outline: none; }
  .input-wrap:focus-within { 
    border-color: rgba(124,58,237,0.6) !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
  }

  /* Image hover */
  .msg-img { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .msg-img:hover { transform: scale(1.03); box-shadow: 0 8px 32px rgba(124,58,237,0.3); }

  /* Online pulse */
  @keyframes onlinePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
    50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
  }
  .online-dot { animation: onlinePulse 2s infinite; }

  /* Header shimmer */
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

  /* Emoji reaction item */
  .react-emoji { 
    cursor: pointer; padding: 3px 6px; border-radius: 8px; font-size: 15px;
    transition: transform 0.15s ease, background 0.15s;
  }
  .react-emoji:hover { transform: scale(1.3); background: rgba(255,255,255,0.1); }

  /* Sent checkmark */
  .check-double { color: #a78bfa; font-size: 11px; font-family: 'JetBrains Mono', monospace; }

  /* Suggestion dropdown */
  @keyframes suggestSlide {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .suggest-box {
    animation: suggestSlide 0.18s ease forwards;
  }
  .suggest-item {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; cursor: pointer; font-size: 12.5px;
    color: rgba(255,255,255,0.75); font-family: 'Sora', sans-serif;
    transition: background 0.15s ease, color 0.15s ease;
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .suggest-item:last-child { border-bottom: none; }
  .suggest-item:hover { background: rgba(124,58,237,0.2); color: #fff; }
  .suggest-item .suggest-icon { opacity: 0.4; font-size: 11px; flex-shrink: 0; }
  .suggest-item mark {
    background: none; color: #a78bfa; font-weight: 600;
  }
`

const REACTIONS = ['❤️', '😂', '👍', '😮', '🔥', '🎉']

const SUGGESTION_WORDS = [
  "hello", "hi there", "how are you", "good morning", "good afternoon",
  "good night", "good evening", "thank you", "thanks a lot", "you're welcome",
  "no problem", "sounds good", "let's meet", "what are you doing",
  "okay", "sure", "see you", "bye", "take care", "talk later",
  "on my way", "be right back", "just a minute", "call me",
  "I'll check", "let me know", "miss you", "love you",
]

const injectStyles = () => {
  if (!document.getElementById('chat-styles')) {
    const el = document.createElement('style')
    el.id = 'chat-styles'
    el.textContent = STYLES
    document.head.appendChild(el)
  }
}

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext)
  const { authUser, onlineUsers } = useContext(AuthContext)

  const scrollEnd = useRef()
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [reactions, setReactions] = useState({}) // { msgIndex: emoji }
  const [isTyping, setIsTyping] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const typingTimeout = useRef(null)

  injectStyles()

  const isOnline = onlineUsers.includes(selectedUser?._id?.toString())

  const handleSendMessage = async (e) => {
    e?.preventDefault()
    if (input.trim() === '') return
    await sendMessage({ text: input.trim() })
    setInput('')
    setSuggestions([])
  }

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

  const handleInputChange = (e) => {
    const value = e.target.value
    setInput(value)
    setIsTyping(true)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => setIsTyping(false), 1200)

    if (!value.trim()) { setSuggestions([]); return }

    // NLP: extract last meaningful word via compromise
    const doc = nlp(value)
    const lastWord = doc.terms().last().out('text').toLowerCase()
    const query = lastWord || value.toLowerCase()

    const prefixMatches = SUGGESTION_WORDS.filter(w =>
      w.toLowerCase().startsWith(query)
    )
    const containsMatches = SUGGESTION_WORDS.filter(w =>
      !w.toLowerCase().startsWith(query) && w.toLowerCase().includes(query)
    )

    setSuggestions([...new Set([...prefixMatches, ...containsMatches])].slice(0, 5))
  }

  const applySuggestion = (word) => {
    setInput(word)
    setSuggestions([])
  }

  // Highlight matched portion in suggestion
  const highlight = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark>{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    )
  }

  const handleReact = (index, emoji) => {
    setReactions(prev => ({
      ...prev,
      [index]: prev[index] === emoji ? null : emoji
    }))
  }

  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id)
  }, [selectedUser])

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

  return (
    <div className="chat-root" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,58,237,0.07) 0%, transparent 70%)',
      }} />

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 20px',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(12px)',
        background: 'rgba(255,255,255,0.02)',
        position: 'relative', zIndex: 2,
      }}>
        {/* Avatar with online ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt=""
            style={{
              width: 42, height: 42, borderRadius: '50%',
              border: isOnline ? '2px solid rgba(34,197,94,0.6)' : '2px solid rgba(255,255,255,0.1)',
              objectFit: 'cover',
              boxShadow: isOnline ? '0 0 12px rgba(34,197,94,0.3)' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          {isOnline && (
            <span className="online-dot" style={{
              position: 'absolute', bottom: 1, right: 1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #0a0819',
            }} />
          )}
        </div>

        {/* Name + status */}
        <div style={{ flex: 1 }}>
          <p className="name-shimmer" style={{ fontSize: 15, fontWeight: 600, margin: 0, lineHeight: 1 }}>
            {selectedUser.fullName}
          </p>
          <p style={{ fontSize: 11, color: isOnline ? '#4ade80' : 'rgba(255,255,255,0.3)', marginTop: 3, letterSpacing: '0.04em' }}>
            {isOnline ? '● Active now' : '○ Offline'}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src={assets.help_icon} alt="" style={{ width: 18, opacity: 0.5, cursor: 'pointer' }} className="max-md:hidden" />
          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt=""
            style={{ width: 22, opacity: 0.6, cursor: 'pointer' }}
            className="md:hidden"
          />
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        className="chat-scroll"
        style={{
          flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
          display: 'flex', flexDirection: 'column', gap: 4,
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Date chip example */}
        <div style={{ textAlign: 'center', margin: '8px 0' }}>
          <span style={{
            fontSize: 10, color: 'rgba(255,255,255,0.25)',
            background: 'rgba(255,255,255,0.04)',
            padding: '3px 12px', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.06)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>Today</span>
        </div>

        {messages.map((msg, index) => {
          const isMe = msg.senderId?.toString() === authUser._id?.toString()
          const reaction = reactions[index]

          return (
            <div
              key={index}
              className="msg-wrap"
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                marginBottom: 6,
                position: 'relative',
              }}
            >
              {/* Their avatar */}
              {!isMe && (
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt=""
                  style={{ width: 26, height: 26, borderRadius: '50%', alignSelf: 'flex-end', marginRight: 8, flexShrink: 0, opacity: 0.85 }}
                />
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
                    <span
                      key={emoji}
                      className="react-emoji"
                      onClick={() => handleReact(index, emoji)}
                      style={{ opacity: reaction === emoji ? 1 : 0.7 }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>

                {/* Bubble */}
                <div className="bubble-in">
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt=""
                      className="msg-img"
                      style={{ maxWidth: 200, borderRadius: 16, cursor: 'pointer', display: 'block' }}
                      onClick={() => window.open(msg.image)}
                    />
                  ) : (
                    <div style={{
                      padding: '9px 14px',
                      background: isMe
                        ? 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(79,70,229,0.25))'
                        : 'rgba(255,255,255,0.06)',
                      border: isMe
                        ? '1px solid rgba(124,58,237,0.3)'
                        : '1px solid rgba(255,255,255,0.07)',
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

                {/* Meta row */}
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

              {/* My avatar */}
              {isMe && (
                <img
                  src={authUser?.profilePic || assets.avatar_icon}
                  alt=""
                  style={{ width: 26, height: 26, borderRadius: '50%', alignSelf: 'flex-end', marginLeft: 8, flexShrink: 0 }}
                />
              )}
            </div>
          )
        })}

        {/* Typing indicator */}
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

      {/* ── Smart Suggestions ── */}
      {suggestions.length > 0 && (
        <div
          className="suggest-box"
          style={{
            position: 'relative', zIndex: 10,
            margin: '0 16px',
            background: 'rgba(14,11,30,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 -4px 24px rgba(124,58,237,0.15), 0 4px 16px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header label */}
          <div style={{
            padding: '5px 14px 4px',
            display: 'flex', alignItems: 'center', gap: 6,
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(167,139,250,0.5)' }}>
              ✦ Suggestions
            </span>
          </div>

          {suggestions.map((s, i) => {
            const doc = nlp(input)
            const query = doc.terms().last().out('text') || input
            return (
              <div
                key={i}
                className="suggest-item"
                onClick={() => applySuggestion(s)}
              >
                <span className="suggest-icon">↗</span>
                <span>{highlight(s, query)}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Input Bar ── */}
      <div style={{
        padding: '10px 16px 14px',
        borderTop: '1px solid var(--glass-border)',
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: 10,
        position: 'relative', zIndex: 2,
      }}>
        <div
          className="input-wrap"
          style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 24, padding: '8px 14px',
            transition: 'all 0.2s ease',
          }}
        >
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
              onMouseLeave={e => e.target.style.opacity = 0.5}
            />
          </label>
        </div>

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          className="send-btn"
          style={{
            width: 42, height: 42, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.15s ease',
            flexShrink: 0,
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img src={assets.send_button} alt="" style={{ width: 18, filter: 'brightness(0) invert(1)' }} />
        </button>
      </div>
    </div>
  )
}

export default ChatContainer