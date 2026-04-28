import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, _setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, axios } = useContext(AuthContext);

  // ✅ wrapper to reset unseen count when user is selected
  const setSelectedUser = (user) => {
    if (user?._id) {
      setUnseenMessages((prev) => {
        const updated = { ...prev };
        delete updated[user._id]; // clear unseen count for opened chat
        return updated;
      });
    }
    _setSelectedUser(user);
  };

  // ✅ Get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Send message to selected user
  const sendMessage = async (messageData) => {
    if (!selectedUser?._id) return;

    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        // avoid duplicate messages
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === data.newMessage._id)) return prev;
          return [...prev, data.newMessage];
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ✅ Handle new incoming messages safely
  const handleNewMessage = async (newMessage) => {
    if (selectedUser && newMessage.senderId === selectedUser._id) {
      // message for currently opened chat → mark as seen
      newMessage.seen = true;
      setMessages((prev) => {
        if (prev.some((msg) => msg._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });

      try {
        await axios.put(`/api/messages/mark/${newMessage._id}`);
      } catch (err) {
        console.error("Mark as read failed:", err.message);
      }
    } else {
      // message for another user → increment unseen counter
      setUnseenMessages((prev) => ({
        ...prev,
        [newMessage.senderId]: prev[newMessage.senderId]
          ? prev[newMessage.senderId] + 1
          : 1,
      }));
    }
  };

  // ✅ Attach listener once & clean properly
  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    setSelectedUser,
    getUsers,
    getMessages,
    sendMessage,
    unseenMessages,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
