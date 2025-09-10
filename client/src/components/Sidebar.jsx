// import React from 'react'
// import assets, { userDummyData } from '../assets/assets'
// import { useNavigate } from 'react-router-dom'

// const Sidebar = ({selectedUser, setSelectedUser}) => {
//     const navigate = useNavigate();
//   return (
//     <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${selectedUser ? "max-md:hidden" : ''}`}>
//       <div className='pb-5'>
//         <div className='flex justify-between items-center'>
//             <img src={assets.logo} alt="logo" className='max-w-40' />
//             <div className="relative py-2 group">
//                 <img src={assets.menu_icon} alt="Menu" className='max-h-5' cursor-pointer />
//                 <div className='absolute top-full right-0 z-20 w-32 p-5 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block'>
//                     <p onClick={()=>navigate('/profile')} className='cursor-pointer text-sm'>Edit Profile</p>
//                     <hr className="my-2 border-t border-gray-500"/>
//                     <p className='cursor-pointer text-sm'>Logout</p>
//                 </div>
//             </div>
//         </div>

//             <div className='bg-[#282242] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
//                 <img src={assets.search_icon} alt="Search" className='w-3' />
//                 <input type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='Search User...' />
//             </div>

//       </div>

//         <div className='flex flex-col'>
//             {userDummyData.map((user,index)=>(
//                 <div>
//                     <img src={user?.profilePic || assets.avatar_icon} alt="" className='w-[35px]aspect-[1/1] rounded-full' />
//                     <div className='flex flex-col leading-5'></div>
//                     <p>{user.fullName}</p>
//                     {
//                         index < 3
//                         ? <span className='text-green-400 text-xs'>Online</span>
//                         : <span className='text-neutral-400 text-xs'>Offline</span>
//                     }
//                 </div>
                
//             ))}
//         </div>

//     </div>
//   )
// }

// export default Sidebar



import React, { useContext, useEffect, useState } from 'react'
import assets, { userDummyData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import { ChatContext } from '../../context/ChatContext'

const Sidebar = () => {

  const {getUsers, users, selectedUser, setSelectedUser, unseenMessages, setUnseenMessages } = useContext(ChatContext)
  const {logout, onlineUsers} = useContext(AuthContext)
  const[input, setInput] = useState(false)
  const navigate = useNavigate();
  const filteredUsers = input ? users.filter((user)=>user.fullName.toLowerCase()) : users;

  useEffect(()=>{
    getUsers();
  },[onlineUsers])

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-scroll text-white ${
        selectedUser ? 'max-md:hidden' : ''
      }`}
    >
      {/* Header Section */}
      <div className="pb-5 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="logo" className="max-w-32" />

          {/* Menu Dropdown */}
          <div className="relative group">
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="max-h-5 cursor-pointer"
            />
            <div className="absolute top-full right-0 z-20 w-40 mt-2 rounded-lg bg-[#282142] border border-gray-600 text-gray-100 shadow-lg hidden group-hover:block">
              <p
                onClick={() => navigate('/profile')}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-[#3a2b61] rounded-t-lg"
              >
                Edit Profile
              </p>
              <hr className="border-gray-600" />
              <p onClick={()=> logout()} className="cursor-pointer px-4 py-2 text-sm hover:bg-[#3a2b61] rounded-b-lg">
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-[#282242] rounded-full flex items-center gap-2 py-2 px-4 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input onChange={(e)=>setInput(e.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex flex-col mt-5 space-y-3">
        {filteredUsers.map((user, index) => (
          <div onClickCapture={()=>{setSelectedUser(user); setUnseenMessages(prev=>({...prev, [user._id]:0}))}}
            key={index}
            className={`relative flex items-center gap-3 p-2 rounded-lg hover:bg-[#282242] cursor-pointer transition max-sm:text-sm ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}
            onClick={() => setSelectedUser?.(user)}
          >
            <img
              src={user?.profilePic || assets.avatar_icon}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-gray-600"
            />
            <div className="flex flex-col leading-5">
              <p className="text-sm font-medium">{user.fullName}</p>
              {onlineUsers.includes(user._id) ? (
                <span className="text-green-400 text-xs">Online</span>
              ) : (
                <span className="text-neutral-400 text-xs">Offline</span>
              )}
            </div>
            {unseenMessages[user._id]>0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50'>{unseenMessages[user._id]}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Sidebar
