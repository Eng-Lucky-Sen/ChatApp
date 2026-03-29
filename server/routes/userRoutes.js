
import express from "express";
import { login, signup, updateProfile, checkAuth } from "../controllers/userController.js";
import { protectRoute } from "../lib/middleware/auth.js";   // ✅ correct relative path

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

export default userRouter;
