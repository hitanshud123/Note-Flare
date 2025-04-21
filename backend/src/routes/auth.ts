import express from "express";
import { authService } from "../services/authService";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { user, token } = await authService.signup(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.json({ user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

router.get("/session", authMiddleware, async (req, res) => {
  try {
    const user = await authService.getUserById(req.userId!);
    res.json({ user });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
});

export default router;
