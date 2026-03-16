// import React from 'react'
// import { useRef ,useEffect,useContext,useState} from 'react'
// import assets, { messagesDummyData } from '../assets/assets'
// import { formatMessageTime } from '../lib/utils'
// import { ChatContext } from '../../context/ChatContext'
// import { AuthContext } from '../../context/AuthContext'
// const ChatContainer = () => {

//     const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext)

//     const { authUser, onlineUsers } = useContext(AuthContext)

//     const scrollEnd = useRef()

//     const [input, setInput] = useState('');

//     // Handle sending a message
//     const handleSendMessage = async (e) =>{
//     e.preventDefault();
//     if(input.trim() == "") return null;
//     await sendMessage({text: input.trim()});
//     setInput("")
//   }

//   // Handle sending an image
// const handleSendImage = async (e) => {
//   const file = e.target.files[0];
//   if(!file || !file.type.startsWith("image/")){
//     toast.error("select an image file")
//     return;
//   }
//   const reader = new FileReader();

//   reader.onloadend = async ()=>{
//     await sendMessage({image: reader.result})
//     e.target.value = ""
//   }

//   reader.readAsDataURL(file)
// }

// useEffect(()=>{
//   if(selectedUser){
//     getMessages(selectedUser._id)
//   }
// },[selectedUser])



//   useEffect(()=>{
//     if(scrollEnd.current && messages){
//       scrollEnd.current.scrollIntoView({behaviour : "smooth"})
//     }
//   },[messages])
//   return selectedUser ?(
//     <div>
//       {/* Chat Header */}
//       <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
//         {/* Profile Image */}
//         <img
//           src={selectedUser.profilePic || assets.avatar_icon}
//           alt=""
//           className="w-8 rounded-full"
//         />

//         {/* User Name + Status */}
//         <p className="flex-1 text-lg text-white flex items-center gap-2">
//           {selectedUser.fullName}
//           {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
//         </p>

//         {/* Back Arrow (mobile only) */}
//         <img
//           onClick={() => setSelectedUser(null)}
//           src={assets.arrow_icon}
//           alt=""
//           className="md:hidden max-w-7 cursor-pointer"
//         />

//         {/* Help Icon */}
//         <img src={assets.help_icon} alt="" className='max-md:hidden max-w-5'/>
//       </div>
//       {/*------------chat icon----------*/}
//       <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
//         {messages.map((msg,index)=>(
//           <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
//             {msg.image ? (
//               <img src={msg.image} alt="" />
//             ):(
//               <p className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? 'rounded-br-none': 'rounded-bl-none'}`}>{msg.text}</p>
//             )}
//             <div className="text-center text-xs">
//               <img src={msg.sender === authUser._id ? authUser?.profilePic || assets.avatar_icon: selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-7 rounded-full'/>
//               <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
//             </div>
//           </div>
//         ))}'
//         <div ref={scrollEnd}></div>
//       </div>

//       {/*---------bottom area--------- */}
//       <div className='absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3'>
//         <div className='flex-1 flex items-center bg-gray-100/12 px-3 rounded-full '>
//           <input onChange={(e)=> setInput(e.target.value)} value={input} onKeyDown={(e)=> e.key === "Enter" ? handleSendMessage(e) : null} type="text" placeholder="Send a message" 
//           className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400'/>
//           <input onChange={handleSendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
//           <label htmlFor="image">
//             <img src={assets.gallery_icon} alt="" className="w-5 mr-2 cursor-pointer"/>
//           </label>
//         </div>
//         <img onClick={handleSendMessage} src={assets.send_button} alt="" className="w-7 cursor-pointer" />
//       </div>


//     </div>
//   ) : (
//     <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
//       <img src={assets.logo_icon} className='max-w-16' alt="" />
//       <p className='text-lg font-medium text-white'>Chat anytime , anywhere</p>
//     </div>
//   )

// }
// export default ChatContainer

// import React, { useRef, useEffect, useContext, useState } from "react";
// import assets from "../assets/assets";
// import { formatMessageTime } from "../lib/utils";
// import { ChatContext } from "../../context/ChatContext";
// import { AuthContext } from "../../context/AuthContext";
// import { toast } from "react-hot-toast";

// const ChatContainer = () => {
//   const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
//     useContext(ChatContext);

//   const { authUser, onlineUsers } = useContext(AuthContext);
//   const scrollEnd = useRef();
//   const [input, setInput] = useState("");

//   // ✅ Handle text message send
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;
//     try {
//       await sendMessage({ text: input.trim() });
//       setInput("");
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to send message");
//     }
//   };

//   // ✅ Handle sending image
//   const handleSendImage = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !file.type.startsWith("image/")) {
//       toast.error("Please select a valid image file");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onloadend = async () => {
//       try {
//         await sendMessage({ image: reader.result });
//         e.target.value = "";
//       } catch (err) {
//         console.error(err);
//         toast.error("Image upload failed");
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   // ✅ Fetch messages when user changes
//   useEffect(() => {
//     if (selectedUser) {
//       getMessages(selectedUser._id);
//     }
//   }, [selectedUser]);

//   // ✅ Scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (scrollEnd.current) {
//       scrollEnd.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // ✅ If no chat is selected
//   if (!selectedUser) {
//     return (
//       <div className="flex flex-col items-center justify-center gap-2 text-gray-400 bg-white/10 max-md:hidden h-full">
//         <img src={assets.logo_icon} className="max-w-16" alt="" />
//         <p className="text-lg font-medium text-white">
//           Chat anytime, anywhere ✨
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="relative h-full flex flex-col bg-[#0f0f1a]">
//       {/* ---------- Header ---------- */}
//       <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-700">
//         <img
//           src={selectedUser.profilePic || assets.avatar_icon}
//           alt=""
//           className="w-8 h-8 rounded-full"
//         />
//         <p className="flex-1 text-lg text-white flex items-center gap-2">
//           {selectedUser.fullName}
//           {onlineUsers.includes(selectedUser._id) && (
//             <span className="w-2 h-2 rounded-full bg-green-500"></span>
//           )}
//         </p>
//         <img
//           onClick={() => setSelectedUser(null)}
//           src={assets.arrow_icon}
//           alt=""
//           className="md:hidden w-6 cursor-pointer"
//         />
//         <img
//           src={assets.help_icon}
//           alt=""
//           className="hidden md:block w-5 cursor-pointer"
//         />
//       </div>

//       {/* ---------- Messages Area ---------- */}
//       <div className="flex-1 overflow-y-auto p-3 space-y-3">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex items-end gap-2 ${
//               msg.senderId === authUser._id
//                 ? "justify-end"
//                 : "justify-start flex-row-reverse"
//             }`}
//           >
//             {msg.image ? (
//               <img
//                 src={msg.image}
//                 alt="sent"
//                 className="max-w-[180px] rounded-lg shadow-md"
//               />
//             ) : (
//               <p
//                 className={`p-2 text-sm font-light rounded-lg break-words max-w-[250px] text-white ${
//                   msg.senderId === authUser._id
//                     ? "bg-violet-500/30 rounded-br-none"
//                     : "bg-gray-600/30 rounded-bl-none"
//                 }`}
//               >
//                 {msg.text}
//               </p>
//             )}
//             <div className="text-center text-xs text-gray-400">
//               <img
//                 src={
//                   msg.senderId === authUser._id
//                     ? authUser?.profilePic || assets.avatar_icon
//                     : selectedUser?.profilePic || assets.avatar_icon
//                 }
//                 alt=""
//                 className="w-6 h-6 rounded-full mx-auto"
//               />
//               <p>{formatMessageTime(msg.createdAt)}</p>
//             </div>
//           </div>
//         ))}
//         <div ref={scrollEnd}></div>
//       </div>

//       {/* ---------- Input Area ---------- */}
//       <form
//         onSubmit={handleSendMessage}
//         className="flex items-center gap-3 p-3 bg-[#1a1a2e]"
//       >
//         <div className="flex items-center flex-1 bg-gray-800/40 px-4 py-2 rounded-full">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
//           />
//           <input
//             onChange={handleSendImage}
//             type="file"
//             id="image"
//             accept="image/png, image/jpeg"
//             hidden
//           />
//           <label htmlFor="image">
//             <img
//               src={assets.gallery_icon}
//               alt="gallery"
//               className="w-5 h-5 ml-2 cursor-pointer"
//             />
//           </label>
//         </div>
//         <button type="submit">
//           <img
//             src={assets.send_button}
//             alt="send"
//             className="w-7 h-7 cursor-pointer"
//           />
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatContainer;


import React, { useRef, useEffect, useContext, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } =
    useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  // ✅ Handle text message send
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await sendMessage({ text: input.trim() });
      setInput("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  // ✅ Handle sending image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await sendMessage({ image: reader.result });
        e.target.value = "";
      } catch (err) {
        console.error(err);
        toast.error("Image upload failed");
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ Fetch messages when user changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // ✅ Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ If no chat is selected
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-400 bg-white/10 max-md:hidden h-full">
        <img src={assets.logo_icon} className="max-w-16" alt="" />
        <p className="text-lg font-medium text-white">
          Chat anytime, anywhere ✨
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col bg-[#0a0a0f]">
      {/* ---------- Header ---------- */}
      <div className="flex items-center gap-3 py-3 px-4 bg-[#1f1f2e] border-b border-stone-700/50 shadow-lg">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-10 h-10 rounded-full ring-2 ring-violet-500/30"
        />
        <div className="flex-1">
          <p className="text-base font-medium text-white">
            {selectedUser.fullName}
          </p>
          {onlineUsers.includes(selectedUser._id) && (
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              online
            </p>
          )}
        </div>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden w-6 cursor-pointer opacity-70 hover:opacity-100"
        />
        <img
          src={assets.help_icon}
          alt=""
          className="hidden md:block w-5 cursor-pointer opacity-70 hover:opacity-100"
        />
      </div>

      {/* ---------- Messages Area ---------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#9494de] to-transparent
">
        {messages.map((msg, index) => {
          const isMyMessage = msg.senderId === authUser._id;
          
          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                isMyMessage ? "justify-end" : "justify-start"
              }`}
            >
              {/* Avatar - only show for received messages on left */}
              {!isMyMessage && (
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-8 h-8 rounded-full mb-1 flex-shrink-0"
                />
              )}

              {/* Message Content */}
              <div
                className={`flex flex-col ${
                  isMyMessage ? "items-end" : "items-start"
                } max-w-[75%] md:max-w-[60%]`}
              >
                {msg.image ? (
                  <div
                    className={`rounded-lg overflow-hidden shadow-lg ${
                      isMyMessage ? "bg-violet-600/20" : "bg-gray-700/30"
                    } p-1`}
                  >
                    <img
                      src={msg.image}
                      alt="sent"
                      className="max-w-full rounded-md"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 px-2 pb-1 text-right">
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-2xl shadow-md ${
                      isMyMessage
                        ? "bg-violet-600 text-white rounded-br-sm"
                        : "bg-gray-700 text-white rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        isMyMessage ? "text-violet-200" : "text-gray-400"
                      }`}
                    >
                      {formatMessageTime(msg.createdAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Avatar - only show for sent messages on right */}
              {isMyMessage && (
                <img
                  src={authUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-8 h-8 rounded-full mb-1 flex-shrink-0"
                />
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* ---------- Input Area ---------- */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-3 p-4 bg-[#1a1a2e] border-t border-stone-700/50"
      >
        <div className="flex items-center flex-1 bg-gray-800/60 px-4 py-3 rounded-full hover:bg-gray-800/80 transition-colors">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
          />
          <label htmlFor="image" className="cursor-pointer">
            <img
              src={assets.gallery_icon}
              alt="gallery"
              className="w-5 h-5 ml-2 opacity-70 hover:opacity-100 transition-opacity"
            />
          </label>
        </div>
        <button
          type="submit"
          className="bg-violet-600 p-2 rounded-full hover:bg-violet-700 transition-colors shadow-lg"
        >
          <img
            src={assets.send_button}
            alt="send"
            className="w-6 h-6"
          />
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;