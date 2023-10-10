import { Socket } from "socket.io";
import { SocketEvent } from "../../lib/enums/SocketEvent";
import { RedisHandler } from "./redis-handler";

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

export const SocketHandler = (socket: Socket) => {

  console.log("user connected", socket.id);

  socket.on(SocketEvent.JOIN_ROOM, async (
    joinDict: { 
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
  });

  socket.on((SocketEvent.CONFIRM_END_SESSION), async (roomID) => {
    if (await checkLastUser(socket, roomID)) clearSessionDetails(roomID);
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
async function handleJoinRoom(socket: Socket, joinDict: { roomId: string; sessionEndTime: string}) {

  socket.join(joinDict.roomId);

  const sockets = (await socket.in(joinDict.roomId).fetchSockets()).length;
  console.log("Joined room successfully. Current connections in room:", sockets);

  emitPartnerConnection(socket, joinDict.roomId, true);

  // Check redis cache for Editor content
  let cachedEditorContent = await RedisHandler.getEditorContent(joinDict.roomId);

  if (cachedEditorContent) {
    emitCodeChange(socket, joinDict.roomId, cachedEditorContent);
  }

  let cachedSessionEndTime = await RedisHandler.getSessionEndTime(joinDict.roomId);

  if (cachedSessionEndTime) {
    emitSessionTimer(socket, joinDict.roomId, cachedSessionEndTime);
  } else {
    RedisHandler.setSessionEndTime(joinDict.roomId, joinDict.sessionEndTime);
    emitSessionTimer(socket, joinDict.roomId, joinDict.sessionEndTime)
  }

  // Local (room) notification
  socket.on(SocketEvent.DISCONNECT, async () => {
    const sockets = (await socket.in(joinDict.roomId).fetchSockets()).length;
    console.log(`Leaving room. We are now left with ${sockets-1} connections`);
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
  emitEndSession(
    socket, editorContent!,
  )
}

async function handleGetSessionTimer(socket:Socket, roomId: string) {
  let endSessionTime = await RedisHandler.getSessionEndTime(roomId);
  emitSessionTimer(socket, roomId, endSessionTime!);
}

async function clearSessionDetails(roomId: string) {
  RedisHandler.delCodeChange(roomId);
  RedisHandler.delSessionEndTime(roomId);
}

/**
 *  Socket functions
 */

function emitEndSession(
    socket: Socket, 
    code: string,
  ) {
    // Return relevant room details to client
    socket.emit(SocketEvent.END_SESSION, code);
}

function emitCodeChange(socket: Socket, roomId: string, content: string) {
  socket
    .to(roomId)
    .emit(SocketEvent.CODE_UPDATE, content);
}

function emitSessionTimer(socket: Socket, roomId: string, sessionEndTime: string) {
  socket.to(roomId).emit(SocketEvent.SESSION_TIMER, sessionEndTime);
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

async function checkLastUser(socket: Socket, roomId: string) {
  const sockets = (await socket.in(roomId).fetchSockets()).length;
  if (sockets == 1) {
    return true;
  } else {
    return false;
  }
}