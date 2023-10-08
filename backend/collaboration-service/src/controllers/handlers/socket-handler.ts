import { Server, Socket } from "socket.io";
import { SocketEvent } from "../../lib/enums/SocketEvent";
import { Redis } from 'ioredis';

import { redis } from '../../models/db';

/** 
 <roomid>_details: {
  end_session: Date()
  partner: string,
}

<roomid>_content: string

*/

export const SocketHandler = (socket: Socket) => {
  console.log("user connected", socket.id);

  socket.on(SocketEvent.JOIN_ROOM, async (
    joinDict: { 
      roomId: string, 
      endSession: Date, 
      partnerId: string
    }
    ) => {

      // Join the roomId
      socket.join(joinDict.roomId);

      // Check redis cache
      await checkCachedContent(joinDict, socket);
      await checkCachedRoomDetails(joinDict, socket);
    }
  );

  socket.on(
    SocketEvent.CODE_CHANGE,
    (editorDict: { roomId: string; content: string }) => {

      // Emit code changes to client
      emitCodeChange(socket, editorDict.roomId, editorDict.content);

      // Set new code change within cache
      setCodeChange(editorDict.roomId, editorDict.content);
    }
  );

  socket.on(SocketEvent.END_SESSION, (roomID) => {
    // Handle leave room functionality
  });

  socket.on(SocketEvent.DISCONNECT, () => {
    console.log("user disconnected", socket.id);
  });

  socket.on(
    SocketEvent.SEND_CHAT_MESSAGE,
    (messageDict: {
      roomId: string;
      message: { uuid: string; content: string; senderId: string };
    }) => {
      emitChatMessage(socket, messageDict.roomId, messageDict.message);
    }
  );
};


function emitChatMessage(socket: Socket, roomId: string, message: { uuid: string; content: string; senderId: string; }) {
  socket.to(roomId).emit(SocketEvent.UPDATE_CHAT_MESSAGE, {
    uuid: message.uuid,
    content: message.content,
    senderId: message.senderId,
  });
}

// Utility functions

async function checkCachedRoomDetails(joinDict: { roomId: string; endSession: Date; partnerId: string; }, socket: Socket) {
  let cachedRoomDetails = await getRoomDetails(joinDict.roomId);

  if (cachedRoomDetails) {
    let roomDetails = JSON.parse(cachedRoomDetails);
    emitSessionTimer(socket, joinDict.roomId, roomDetails.endSession);
  } else {
    setRoomDetails(redis, joinDict.roomId, joinDict.endSession, joinDict.partnerId);
    emitSessionTimer(socket, joinDict.roomId, joinDict.endSession);
  }
}

async function checkCachedContent(joinDict: { roomId: string; endSession: Date; partnerId: string; }, socket : Socket) {
  let cachedEditorContent = await getEditorContent(joinDict.roomId);

  if (cachedEditorContent) {
    emitCodeChange(socket, joinDict.roomId, cachedEditorContent);
  }
}

// Socket handler functions

function emitCodeChange(socket: Socket, roomId: string, content: string) {
  socket
    .to(roomId)
    .emit(SocketEvent.CODE_UPDATE, content);
}

function emitSessionTimer(socket: Socket, roomId: string, sessionTimer: Date) {
  socket.to(roomId).emit(SocketEvent.SESSION_TIMER, sessionTimer);
}

// Redis handler functions

async function getEditorContent(roomId: string) {
  return await redis.get(`${roomId}_content`);
}

async function getRoomDetails(roomId: string) {
  return await redis.get(`${roomId}_roomDetails`);
}

function setRoomDetails(redis: Redis, roomId: string, endSession: Date, partnerId: string) {
  redis.set(`${roomId}_roomDetails`, JSON.stringify({
    endSession: endSession,
    partnerId: partnerId
  }));
}

function setCodeChange(roomId: string, content: string) {
  redis.set(`${roomId}_content`, content);
}
