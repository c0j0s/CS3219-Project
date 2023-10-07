import { Socket } from "socket.io";
import { io } from "../../app";
import RoomManager from "../../lib/utils/roomManager";
import Preferences from "../../models/types/preferences";
import Partner from "../../models/types/partner";
import Room from "../../models/types/room";
import Logger from "../../lib/utils/logger";
import { generateRoomId } from "../../lib/utils/encoder";

const timeout = Number(process.env.MATCHING_TIMEOUT) || 60000;
const rm: RoomManager = RoomManager.getInstance();
const activeSockets = new Set();

const handleMatching = (
  socket: Socket,
  request: {
    user: Partner;
    preferences: Preferences;
  }
) => {
  try {
    if (!activeSockets.has(socket.id)) {
      Logger.debug(`[${socket.id}][handleMatching] Matching request received.`);
      setTimeout(() => {
        request.user.socketId = socket.id;
        rm.findMatchElseCreateRoom(
          request.user,
          request.preferences,
          (room) => handleMatched(socket, room, request.user),
          (room) => handleCreateRoom(socket, room)
        );
      }, 2000);
      activeSockets.add(socket.id);
    }
  } catch (error) {
    notifyError(socket, error);
  }
};

const handleMatched = (socket: Socket, room: Room, requester: Partner) => {
  // ensure owner does not join the room twice
  if (room.owner.id === requester.id) {
    return;
  }

  Logger.debug(
    `[${socket.id}][handleMatched] Matched with room_${room.id}, ${socket.id} to join`
  );
  socket.join(room.id);

  // inform owner
  socket.to(room.id).emit("matched", {
    room: room.id,
    partner: requester,
    owner: room.owner.id,
    preferences: room.preference,
  });

  // inform self
  socket.emit("matched", {
    room: room.id,
    partner: room.owner,
    owner: room.owner.id,
  });
};

const handleCreateRoom = (socket: Socket, room: Room) => {
  Logger.debug(
    `[${socket.id}][handleCreateRoom] Created room_${room.id}, ${socket.id} to join`
  );
  socket.join(room.id);

  // Register timeout handler
  setTimeout(() => {
    if (!room.matched) {
      Logger.debug(`[${socket.id}][handleCreateRoom.callback] Timeout`);

      socket.emit("no_match");
      rm.closeRoom(room.id);
    }
  }, timeout);
};

const handleReady = (socket: Socket, ready: boolean) => {
  Logger.debug(`[${socket.id}][handleReady]: notify ready state change`);

  try {
    socket.rooms.forEach((r) => {
      if (r !== socket.id) {
        socket.to(r).emit("partner_ready_change", ready);
      }
    });
  } catch (error) {
    notifyError(socket, error);
  }
};

const handleStart = (socket: Socket, problemId: string) => {
  Logger.debug(
    `[${socket.id}][notifyStart]: Generating room id for collab session`
  );

  socket.rooms.forEach((r) => {
    if (r !== socket.id) {
      const room = rm.getRoomById(r);
      if (room) {
        const lang = rm.chooseRandomItem(room.preference.languages) as string;
        const roomId = generateRoomId(
          room.owner.id,
          room.partner.id,
          problemId,
          lang
        );

        const roomConfig = {
          id: roomId,
          owner: room.owner.id,
          partner: room.partner.id,
          questionId: problemId,
          language: lang,
        };

        io.sockets.in(r).emit("redirect_collaboration", roomConfig);
      }
    }
  });
};

const handleCancel = (socket: Socket) => {
  Logger.debug(`[${socket.id}][handleCancel]: Close room and inform partner`);
  console.log(socket.rooms);

  socket.rooms.forEach((r) => {
    if (r !== socket.id) {
      Logger.debug(`[NotifyClosed]: room ${r}`);

      const room = rm.getRoomById(r);
      if (room) {
        room.owner
          ? activeSockets.delete((room.owner as Partner).socketId)
          : {};
        room.partner
          ? activeSockets.delete((room.partner as Partner).socketId)
          : {};
      }

      io.to(r).emit("room_closed");
      rm.closeRoom(r);
    }
  });
};

const notifyError = (socket: Socket, error: any) => {
  Logger.debug(`[${socket.id}][notifyError]: `, error);
  socket.disconnect();
};

export const SocketHandler = (socket: Socket) => {
  Logger.debug("Socket connected: " + socket.id);

  // Handles matching request, tries to find a room first before creating one
  socket.on("request_match", (request: any) => handleMatching(socket, request));

  // Notifies partner of users ready status
  socket.on("user_update_ready", (ready: boolean) =>
    handleReady(socket, ready)
  );

  // Notify matching server that clients should already start collab
  socket.on("start_collaboration", (problemId: string) =>
    handleStart(socket, problemId)
  );

  socket.on("disconnecting", (data: any) => handleCancel(socket));
  socket.on("disconnect", () => {
    activeSockets.delete(socket.id);
  });
};
