import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import {Server} from "socket.io"; 

//Create Express app and HTTP server
const app=express();
const server = http.createServer(app)

//Initialise socket.io server
export const io=new Server(server, {
    cors: {origin: "*"}
})

//store online users
export const userSocketMap={};   // { userId: socketId }
//Socket.io connection handler
io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);
    
    if(userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

//middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors());

//Routes setup
app.use("/api/status",(req,res)=> res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)

// Connect to MongoDB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=> console.log("Server is running on PORT:"+ PORT))




// // server.js
// import express from "express";
// import "dotenv/config";
// import cors from "cors";
// import http from "http";
// import { connectDB } from "./lib/db.js";
// import userRouter from "./routes/userRoutes.js";
// import messageRouter from "./routes/messageRoutes.js";
// import { Server } from "socket.io";

// // ✅ Check required env variables
// if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
//   console.error("❌ Missing environment variables. Please check your .env file.");
//   process.exit(1);
// }

// // Create Express app and HTTP server
// const app = express();
// const server = http.createServer(app);

// // Initialise socket.io server
// export const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL || "*", // restrict origin in production
//   },
// });

// // Store online users { userId: socketId }
// export const userSocketMap = {};

// // ✅ Socket.io connection handler
// io.on("connection", (socket) => {
//   const userId = socket.handshake.query.userId;
//   console.log("✅ User Connected:", userId);

//   if (userId) userSocketMap[userId] = socket.id;

//   // Emit online users to all connected clients
//   io.emit("getOnlineUsers", Object.keys(userSocketMap));

//   socket.on("disconnect", () => {
//     console.log("❌ User Disconnected:", userId);
//     delete userSocketMap[userId];
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
//   });
// });

// // Middleware setup
// app.use(express.json({ limit: "4mb" }));
// app.use(cors());

// // Routes setup
// app.use("/api/status", (req, res) => res.send("✅ Server is live"));
// app.use("/api/auth", userRouter);
// app.use("/api/messages", messageRouter);

// // Connect to MongoDB
// try {
//   await connectDB();
//   console.log("✅ MongoDB connected");
// } catch (err) {
//   console.error("❌ MongoDB connection failed:", err.message);
//   process.exit(1);
// }

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server is running on PORT: ${PORT}`));
