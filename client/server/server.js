// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import http from "http";
// import { connectDB } from "./lib/db.js";
// import userRouter from "./routes/userRoutes.js";
// import messageRouter from "./routes/messageRoutes.js";
// import { Server } from "socket.io";

// dotenv.config();

// const app = express();
// const server = http.createServer(app);

// export const io = new Server(server, {
//   cors: { origin: "*" },
// });

// export const userSocketMap = {};

// export const getReceiverSocketId = (userId) => {
//   return userSocketMap[userId];
// };

// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId;

//   console.log("User Connected:", userId);

//   if (userId) userSocketMap[userId] = socket.id;

//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("User Disconnected:", userId);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// app.use(express.json({ limit: "4mb" }));
// app.use(cors());

// app.use("/api/status", (req, res) => res.send("Server is live"));
// app.use("/api/auth", userRouter);
// app.use("/api/messages", messageRouter);

// await connectDB();

// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () =>
//   console.log("Server is running on PORT:", PORT)
// );

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup
export const io = new Server(server, {
  cors: { origin: "*" },
});

export const userSocketMap = {};

export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

// ✅ Socket connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("User Connected:", userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected:", userId);

    if (userId) {
      delete userSocketMap[userId];
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// ✅ Middlewares
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// ✅ Routes
app.get("/api/status", (req, res) => {
  res.send("Server is live 🚀");
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// ✅ Start Server Safely
const startServer = async () => {
  try {
    // 🔍 Debug ENV (remove after testing)
    console.log("Checking ENV...");
    console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Missing ❌");

    // ✅ Connect DB
    await connectDB();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();