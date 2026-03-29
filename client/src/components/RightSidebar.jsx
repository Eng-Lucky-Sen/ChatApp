import React, { useState, useContext, useEffect } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'

const RightSidebar = () => {
  const { selectedUser, messages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)

  const [msgImages, setMsgImages] = useState([])
  const [activeTab, setActiveTab] = useState('media')

  const isOnline = onlineUsers.includes(selectedUser?._id?.toString())
  const msgCount = messages?.length || 0
  const imgCount = messages?.filter(m => m.image).length || 0

  useEffect(() => {
    setMsgImages(messages.filter(msg => msg.image).map(msg => msg.image))
  }, [messages])

  if (!selectedUser) return null

  return (
    <div
      className={`sidebar-right ${selectedUser ? 'max-md:hidden' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,8,25,0.6)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      {/* Top Info */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 16px 80px' }}>

        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ position: 'relative' }}>
            <img
              src={selectedUser?.profilePic || assets.avatar_icon}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                border: '2px solid rgba(124,58,237,0.4)',
                objectFit: 'cover',
              }}
            />

            {isOnline && (
              <span
                style={{
                  position: 'absolute',
                  bottom: 4,
                  right: 4,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '2px solid #0a0819',
                }}
              />
            )}
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 600 }}>
            {selectedUser.fullName}
          </h2>

          <p style={{ fontSize: 12, color: isOnline ? '#4ade80' : '#888' }}>
            {isOnline ? 'Online' : 'Offline'}
          </p>

          {selectedUser.bio && (
            <p style={{ fontSize: 12, color: '#aaa', textAlign: 'center' }}>
              {selectedUser.bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 16 }}>{msgCount}</p>
            <p style={{ fontSize: 10, color: '#888' }}>Messages</p>
          </div>
          <div>
            <p style={{ fontSize: 16 }}>{imgCount}</p>
            <p style={{ fontSize: 10, color: '#888' }}>Media</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {['media', 'files'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab ? '#7c3aed' : '#222',
                color: '#fff',
                fontSize: 11,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Media */}
        {activeTab === 'media' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
            {msgImages.length === 0 ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#555' }}>
                No media
              </p>
            ) : (
              msgImages.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={() => window.open(url)}
                  style={{
                    width: '100%',
                    height: 70,
                    objectFit: 'cover',
                    borderRadius: 8,
                    cursor: 'pointer',
                  }}
                />
              ))
            )}
          </div>
        )}

        {/* Files */}
        {activeTab === 'files' && (
          <p style={{ textAlign: 'center', color: '#555' }}>
            No files yet
          </p>
        )}
      </div>

      {/* Logout */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: 10,
            border: '#fff',
            background: '#00000000',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default RightSidebar