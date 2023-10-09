import { Server, Socket } from "socket.io";
import { SocketEvent } from "../../lib/enums/SocketEvent";
import { RedisHandler } from "./redis-handler";
import { redis } from '../../models/db';

/** 
 * Redis key-value pairs
 * 
 * Room details:
 * <roomid>_details: {
 *  endSession: Date()
 *  partner: string,
 * }
 * 
 * Room content:
 * <roomid>_content: string
 *
 * Chat messages:
 * <roomid>_messages: { TBD }
 * 
*/

export const SocketHandler = (socket: Socket) => {

  console.log("user connected", socket.id);

  socket.on(SocketEvent.JOIN_ROOM, async (
    joinDict: { 
      roomId: string, 
      endSession: Date, 
      partnerId: string,
      questionId: string,
      language: string,
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
  });

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
 * Handles joining of room and emits session timer back to client (if applicable)
 * @param socket 
 * @param joinDict 
 */
async function handleJoinRoom(socket: Socket, joinDict: { roomId: string; endSession: Date; partnerId: string; }) {

  socket.join(joinDict.roomId);

  emitPartnerConnection(socket, joinDict.roomId, true);

  // Check redis cache for Editor content
  let cachedEditorContent = await RedisHandler.getEditorContent(joinDict.roomId);

  if (cachedEditorContent) {
    emitCodeChange(socket, joinDict.roomId, cachedEditorContent);
  }

  let cachedRoomDetails = await RedisHandler.getRoomDetails(joinDict.roomId);

  // Check for room details from cache (namely end time)
  if (cachedRoomDetails) {
    let roomDetails = JSON.parse(cachedRoomDetails);
    emitSessionTimer(socket, joinDict.roomId, roomDetails.endSession);
  } else {
    RedisHandler.setRoomDetails(joinDict.roomId, joinDict.endSession, joinDict.partnerId);
    emitSessionTimer(socket, joinDict.roomId, joinDict.endSession);
  }

  // Local (room) notification
  socket.on(SocketEvent.DISCONNECT, () => {
    emitPartnerConnection(socket, joinDict.roomId, false);
  })
}

/**
 * Emits code change back to client and stores to cache
 * @param socket 
 * @param editorDict 
 */
function handleCodeChange(socket: Socket, editorDict: { roomId: string; content: string; }) {
  emitCodeChange(socket, editorDict.roomId, editorDict.content);

  // Set new code change within cache
  RedisHandler.setCodeChange(editorDict.roomId, editorDict.content);
}

/**
 * Emits chat messages back to client and stores to cache
 * @param socket socket instance
 * @param messageDict message dictionay
 */

function handleChatMessage(socket: Socket, messageDict: { roomId: string; message: { uuid: string; content: string; senderId: string; }; }) {
  emitChatMessage(socket, messageDict.roomId, messageDict.message);
  // TODO: Write to cache
}

async function handleEndSession(socket: Socket, roomId: string) {
  let editorContent = await RedisHandler.getEditorContent(roomId);
  let roomDetails = await RedisHandler.getRoomDetails(roomId);
  emitEndSession(
    socket, 
    {
      code: editorContent!,
      endSession: JSON.parse(roomDetails!).endSession,
    }
  )
}

/**
 *  Socket functions
 */

function emitEndSession(
    socket: Socket, 
    roomDetails: {
      code: string,
      endSession: string,
    }
  ) {
    // Return relevant room details to client
    socket.emit(SocketEvent.END_SESSION, roomDetails);
}

function emitCodeChange(socket: Socket, roomId: string, content: string) {
  socket
    .to(roomId)
    .emit(SocketEvent.CODE_UPDATE, content);
}

function emitSessionTimer(socket: Socket, roomId: string, sessionTimer: Date) {
  socket.to(roomId).emit(SocketEvent.SESSION_TIMER, sessionTimer);
}

function emitChatMessage(socket: Socket, roomId: string, message: { uuid: string; content: string; senderId: string; }) {
  socket.to(roomId).emit(SocketEvent.UPDATE_CHAT_MESSAGE, {
    uuid: message.uuid,
    content: message.content,
    senderId: message.senderId,
  });
}

function emitPartnerConnection(socket: Socket, roomId: string, status: boolean) {
  socket.to(roomId).emit(SocketEvent.PARTNER_CONNECTION, status);
}