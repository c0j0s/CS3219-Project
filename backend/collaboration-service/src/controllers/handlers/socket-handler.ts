import { Socket } from "socket.io";
import { SocketEvent } from "../../lib/enums/SocketEvent";
import { RedisHandler } from "./redis-handler";
import { io } from "../../app";
import logger from '../../lib/utils/logger';
import { get } from "http";

/** 
 * Redis key-value pairs
 * 
 * Room endSessionTime:
 * <roomid>_sessionEnd: endSession: string
 * 
 * Room content:
 * <roomid>_content: string
 *
 * Chat messages:
 * <roomid>_messages: { TBD }
 * 
*/

// This keeps track of the userId in each session
const activeSessions = new Map<string, [string]>();

export const SocketHandler = (socket: Socket) => {

  logger.debug(`[SocketHandler]: ${socket.id} connected`)

  socket.on(SocketEvent.JOIN_ROOM, async (
    joinDict: { 
      userId: string,
      roomId: string, 
      sessionEndTime: string, 
    }
    ) => {
      await handleJoinRoom(socket, joinDict);
    }
  );

  socket.on(
    SocketEvent.CODE_CHANGE,
    (editorDict: { roomId: string; content: string }) => {
      handleCodeChange(socket, editorDict);
    }
  );

  socket.on(SocketEvent.END_SESSION, (roomID) => {
    handleEndSession(socket, roomID);
    logger.debug(`[SocketHandler]: ${socket.id} ended session`)
    // if (activeSessions.get(roomID)?.length == 1) clearSessionDetails(roomID);
  });

  socket.on((SocketEvent.CONFIRM_END_SESSION), (roomID) => {
    if (activeSessions.get(roomID)?.length == 1) clearSessionDetails(roomID);
  })

  socket.on((SocketEvent.GET_SESSION_TIMER), (roomID) => {
    handleGetSessionTimer(socket, roomID);
  })

  socket.on(
    SocketEvent.SEND_CHAT_MESSAGE,
    (messageDict: {
      roomId: string;
      message: { uuid: string; content: string; senderId: string };
    }) => {
      handleChatMessage(socket, messageDict);
    }
  );

};

/**
 * Handles joining of room and emits session timer back to client (if exists)
 * @param socket 
 * @param joinDict 
 */
export async function handleJoinRoom(socket: Socket, joinDict: { userId: string, roomId: string; sessionEndTime: string}) {

  socket.join(joinDict.roomId);

  logger.debug(`[handleJoinroom]: SocketId: ${socket.id} joined room ${joinDict.roomId}`)

  console.log(`[handleJoinroom]: SocketId: ${socket.id} joined room ${joinDict.roomId}`)

  if (activeSessions.get(joinDict.roomId)?.indexOf(joinDict.userId)! >= 0) {
    // Should emit that user is already inside.
  } else {
    // User not found in session, add to session
    if (activeSessions.has(joinDict.roomId)) {
      activeSessions.get(joinDict.roomId)?.push(joinDict.userId);
    } else {
      activeSessions.set(joinDict.roomId, [joinDict.userId]);
    }
  }

  const sockets = (await io.in(joinDict.roomId).fetchSockets()).length;

  logger.debug(`[handleJoinRoom]: Number of unique sockets: ${sockets}`)
  console.log(`[handleJoinRoom]: Number of unique sockets: ${sockets}`)
  logger.debug(`[handleJoinRoom]: Number of users in active sessions: ${activeSessions.get(joinDict.roomId)?.length}`)
  console.log(`[handleJoinRoom]: Number of users in active sessions: ${activeSessions.get(joinDict.roomId)?.length}`)

  // Broadcast to room that partner's connection is active
  io.in(joinDict.roomId).emit(SocketEvent.PARTNER_CONNECTION, {userId: joinDict.userId, status: true });

  // Check redis cache for Editor content
  let cachedEditorContent = await RedisHandler.getEditorContent(joinDict.roomId);

  if (cachedEditorContent) {
    // Unable to emit to oneself in dev environment, otherwise can use io.to(socket.id).emit()
    // Will have to broadcast the change here such that it works in both dev and prod
    // Same idea for subsequent cached logics
    io.in(joinDict.roomId).emit(SocketEvent.CODE_UPDATE, cachedEditorContent);
  }

  let cachedSessionEndTime = await RedisHandler.getSessionEndTime(joinDict.roomId);

  if (cachedSessionEndTime) {
    io.in(joinDict.roomId).emit(SocketEvent.SESSION_TIMER, cachedSessionEndTime);
  } else {
    RedisHandler.setSessionEndTime(joinDict.roomId, joinDict.sessionEndTime);
    io.in(joinDict.roomId).emit(SocketEvent.SESSION_TIMER, cachedSessionEndTime);
  }

  let cachedMessages = await RedisHandler.getMessages(joinDict.roomId);

  if (cachedMessages) {
    logger.debug(`[handleJoinRoom]: Cached messages: ${cachedMessages.toString()}`)
    io.in(joinDict.roomId).emit(SocketEvent.UPDATE_CHAT_LIST, cachedMessages.toString())
  }

  // Local (room) notification
  socket.on(SocketEvent.DISCONNECT, async () => {
    activeSessions.get(joinDict.roomId)?.splice(
      activeSessions.get(joinDict.roomId)?.indexOf(joinDict.userId)!, 1
    );
    const sockets = (await io.in(joinDict.roomId).fetchSockets()).length;
    logger.debug(`[handleJoinRoom]: Number of unique sockets: ${sockets}`)
    io.in(joinDict.roomId).emit(SocketEvent.PARTNER_CONNECTION, {userId: joinDict.userId, status: false });
  })
}

/**
 * Emits code change back to client and stores to cache
 * @param socket 
 * @param editorDict 
 */
export function handleCodeChange(socket: Socket, editorDict: { roomId: string; content: string; }) {
  socket.to(editorDict.roomId).emit(SocketEvent.CODE_UPDATE, editorDict.content);
  // Set new code change within cache
  RedisHandler.setCodeChange(editorDict.roomId, editorDict.content);
}

/**
 * Emits chat messages back to client and stores to cache
 * @param socket socket instance
 * @param messageDict message dictionay
 */

export function handleChatMessage(socket: Socket, messageDict: { roomId: string; message: { uuid: string; content: string; senderId: string; }; }) {
  RedisHandler.appendMessage(messageDict.roomId, JSON.stringify(messageDict.message));
  socket.to(messageDict.roomId).emit(SocketEvent.UPDATE_CHAT_MESSAGE, {
    uuid: messageDict.message.uuid,
    content: messageDict.message.content,
    senderId: messageDict.message.senderId,
  });
  logger.debug(`[handleCodeChange]: Setting message change for room ${messageDict.roomId}]`)
}

export async function handleEndSession(socket: Socket, roomId: string) {
  let editorContent = await RedisHandler.getEditorContent(roomId);
  socket.emit(SocketEvent.END_SESSION, editorContent);
}

export async function handleGetSessionTimer(socket: Socket, roomId: string) {
  let endSessionTime = await RedisHandler.getSessionEndTime(roomId);
  socket.emit(SocketEvent.SESSION_TIMER, endSessionTime);
}

export function clearSessionDetails(roomId: string) {
  RedisHandler.delCodeChange(roomId);
  RedisHandler.delSessionEndTime(roomId);
  RedisHandler.delMessages(roomId);
}

export { activeSessions };
