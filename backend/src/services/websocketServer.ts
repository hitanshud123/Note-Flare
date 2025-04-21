import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const wss = new WebSocketServer({ noServer: true });

interface ActiveConnections {
  [noteId: string]: Set<string>;
}

const activeConnections: ActiveConnections = {};
const userConnections: Map<string, WebSocket> = new Map();

wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
  console.log("Connection received");
  const urlParams = new URLSearchParams(request.url?.split("?")[1]);
  const noteId = urlParams.get("noteId");
  const userId = urlParams.get("userId");

  if (!noteId || !userId) {
    console.error("Invalid connection parameters:", { noteId, userId });
    ws.close();
    return;
  }

  userConnections.set(userId, ws);

  if (!activeConnections[noteId]) {
    activeConnections[noteId] = new Set();
  }
  activeConnections[noteId].add(userId);

  if (activeConnections[noteId].size > 1) {
    activeConnections[noteId].forEach((userId) => {
      sendMessage(
        JSON.stringify({
          type: "collaborators",
          otherCollaborators: true,
        }),
        userId,
      );
    });
  }

  ws.on("message", (message: string) => {
    const change = JSON.parse(message);
    console.log("Received message:", change);
    broadcastChange(noteId, change, userId);
  });

  ws.on("close", () => {
    if (activeConnections[noteId]) {
      activeConnections[noteId].delete(userId);
      if (activeConnections[noteId].size === 0) {
        delete activeConnections[noteId];
      } else if (activeConnections[noteId].size === 1) {
        sendMessage(
          JSON.stringify({
            type: "collaborators",
            otherCollaborators: false,
          }),
          Array.from(activeConnections[noteId])[0],
        );
      }
    } else {
      console.warn(
        `Attempted to delete userId from non-existent noteId: ${noteId}`,
      );
    }
    userConnections.delete(userId);
  });
});

function broadcastChange(noteId: string, change: any, senderId: string) {
  if (activeConnections[noteId] && activeConnections[noteId].size > 1) {
    activeConnections[noteId].forEach((userId) => {
      if (userId !== senderId) {
        sendMessage(
          JSON.stringify({
            type: "update",
            ...JSON.parse(JSON.stringify(change)),
          }),
          userId,
        );
      }
    });
  }
}

function sendMessage(message: string, userId: string) {
  const userWs = userConnections.get(userId);
  if (userWs && userWs.readyState === WebSocket.OPEN) {
    userWs.send(message);
  }
}

export { wss };
