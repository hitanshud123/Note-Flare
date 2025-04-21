import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        notes: {
          orderBy: {
            dateCreated: "desc",
          },
          include: {
            sharedWith: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        sharedNotes: {
          orderBy: {
            dateCreated: "desc",
          },
          include: {
            sharedWith: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const allNotes = {
      notes: user.notes,
      sharedNotes: user.sharedNotes,
    };
    res.json(allNotes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, body, tags } = req.body;
    const note = await prisma.note.create({
      data: {
        title,
        body,
        tags,
        ownerId: req.userId!,
      },
    });
    res.status(201).json(note);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, body, tags } = req.body;

    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { ownerId: req.userId },
          { sharedWith: { some: { id: req.userId } } },
        ],
      },
    });

    if (!note) {
      res.status(404).json({
        message: "Note not found or access denied",
      });
      return;
    }

    const updatedNote = await prisma.note.update({
      where: { id: parseInt(id) },
      data: { title, body, tags },
    });
    res.json(updatedNote);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { ownerId: req.userId },
          { sharedWith: { some: { id: req.userId } } },
        ],
      },
    });

    if (!note) {
      res.status(404).json({
        message: "Note not found or access denied",
      });
      return;
    }

    if (note.ownerId !== req.userId) {
      await prisma.note.update({
        where: { id: parseInt(id) },
        data: { sharedWith: { disconnect: { id: req.userId } } },
      });
    } else {
      await prisma.note.delete({
        where: { id: parseInt(id) },
      });
    }
    res.json({ message: "Note deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/:id/share", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { usernames } = req.body;

    if (!Array.isArray(usernames)) {
      res.status(400).json({
        message: "Please provide a list of usernames",
      });
      return;
    }

    const usersToShare = await prisma.user.findMany({
      where: {
        username: {
          in: Array.from(new Set(usernames)),
        },
      },
    });

    if (usersToShare.length !== usernames.length) {
      res.status(404).json({ message: "Some users not found" });
      return;
    }

    if (usersToShare.some((user: { id: number }) => user.id === req.userId)) {
      res.status(400).json({
        message: "Cannot share note with yourself",
      });
      return;
    }

    const note = await prisma.note.findFirst({
      where: {
        id: parseInt(id),
        ownerId: req.userId,
      },
      include: {
        sharedWith: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!note) {
      res.status(404).json({
        message: "Note not found or access denied",
      });
      return;
    }

    const usersToKeepIds = usersToShare.map((user: { id: number }) => user.id);

    const usersToDisconnect = note.sharedWith.filter(
      (existingUser: { id: number }) =>
        !usersToKeepIds.includes(existingUser.id),
    );

    await prisma.note.update({
      where: { id: parseInt(id) },
      data: {
        sharedWith: {
          connect: usersToShare.map((user: { id: number }) => ({
            id: user.id,
          })),
          disconnect: usersToDisconnect.map((user: { id: number }) => ({
            id: user.id,
          })),
        },
      },
    });

    res.json({
      message: "Note shared successfully",
      sharedWith: usersToShare.map(
        (user: { username: string; id: number }) => ({
          username: user.username,
          id: user.id,
        }),
      ),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
