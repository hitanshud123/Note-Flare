import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface UserData {
  username: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: number;
    username: string;
  };
  token: string;
}

export const authService = {
  async signup(userData: UserData): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        username: userData.username,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return { user, token };
  },

  async login(userData: UserData): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { username: userData.username },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const validPassword = await bcrypt.compare(
      userData.password,
      user.password,
    );

    if (!validPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    return {
      user: {
        id: user.id,
        username: user.username,
      },
      token,
    };
  },

  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
};
