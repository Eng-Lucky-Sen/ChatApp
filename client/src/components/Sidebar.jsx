import React, { useContext, useEffect, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext)
  const { logout, onlineUsers } = useContext(AuthContext)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filteredUsers = search
    ? users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()))
    : users

  const onlineList = filteredUsers.filter(u =>
    onlineUsers.includes(u._id?.toString())
  )

  const offlineList = filteredUsers.filter(u =>
    !onlineUsers.includes(u._id?.toString())
  )

  useEffect(() => {
    getUsers()
  }, [onlineUsers])

  const selectUser = (user) => {
    setSelectedUser(user)
    setUnseenMessages(prev => ({ ...prev, [user._id]: 0 }))
  }

  const UserCard = ({ user }) => {
    const isOnline = onlineUsers.includes(user._id?.toString())
    const unseen = unseenMessages[user._id]
    const isActive = selectedUser?._id === user._id

    return (
      <div
        onClick={() => selectUser(user)}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition 
        ${isActive ? 'bg-violet-500/20' : 'hover:bg-violet-500/10'}`}
      >
        <div className="relative">
          <img
            src={user?.profilePic || assets.avatar_icon}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black"></span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-white truncate">{user.fullName}</p>
          <p className="text-xs text-gray-400">
            {isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        {unseen > 0 && (
          <span className="text-xs bg-violet-600 text-white px-2 py-0.5 rounded-full">
            {unseen}
          </span>
        )}
      </div>
    )
  }

  return (
    <div
      className={`sidebar-left ${selectedUser ? 'max-md:hidden' : ''}`}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10,8,25,0.5)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 12px',
      }}
    >

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <img src={assets.logo} alt="" className="h-6" />

        <div className="relative group">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 cursor-pointer">
            <img src={assets.menu_icon} className="w-4" />
          </div>

          <div className="absolute right-0 mt-2 hidden group-hover:block bg-[#1a1633] border border-white/10 rounded-lg overflow-hidden">
            <div
              onClick={() => navigate('/profile')}
              className="px-4 py-2 text-sm text-white hover:bg-violet-500/20 cursor-pointer"
            >
              Edit Profile
            </div>
            <div className="border-t border-white/10"></div>
            <div
              onClick={logout}
              className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              Logout
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg mb-4">
        <img src={assets.search_icon} className="w-3 opacity-50" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-transparent outline-none text-white text-sm flex-1 placeholder-gray-400"
        />
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto space-y-1">

        {onlineList.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-1">Online</p>
            {onlineList.map(user => (
              <UserCard key={user._id} user={user} />
            ))}
          </>
        )}

        {offlineList.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mt-3 mb-1">Others</p>
            {offlineList.map(user => (
              <UserCard key={user._id} user={user} />
            ))}
          </>
        )}

        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-6">
            No users found
          </p>
        )}
      </div>
    </div>
  )
}

export default Sidebar