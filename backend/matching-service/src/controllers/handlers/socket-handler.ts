import { Socket } from 'socket.io';
import { io } from '../../app';
import RoomManager from '../../lib/utils/roomManager';
import Preference from '../../models/types/preference';
import Partner from '../../models/types/partner';
import Room from '../../models/types/room';
import { generateRoomId } from '../../lib/utils/encoder';
import SocketEvent from '../../lib/enums/SocketEvent';
import logger from '../../lib/utils/logger';
import eventBus from '../../models/event_bus/event_bus';
import dotenv from "dotenv";

dotenv.config();

const timeout = Number(process.env.MATCHING_TIMEOUT) || 60000;
const rm: RoomManager = RoomManager.getInstance();
const connectedSockets: { [key: string]: Socket } = {};

const handleMatching = (socket: Socket, request: {
  user: Partner,
  preferences: Preference,
}) => {
  if (!rm.getActiveSockets().has(socket.id)) {
    logger.info(`[${socket.id}][handleMatching] Matching request received.`);
    rm.getActiveSockets().add(socket.id);
    setTimeout(() => {
      try {
        request.user.socketId = socket.id;
        rm.findMatchElseWait(
          request.user,
          request.preferences,
          room => handleMatched(socket, room, request.user),
          () => handleNoMatch(socket),
        )
      } catch (error) {
        notifyError(socket, error);
      }

    }, 1000);
  } else {
    logger.debug(`[${socket.id}][handleMatching] Socket is active, discard duplicate request.`);
  }
};

const handleMatched = (socket: Socket, room: Room, requester: Partner) => {
  // ensure owner does not join the room twice
  if (room.owner.id === requester.id) {
    return;
  }

  logger.debug(room, `[${socket.id}][handleMatched] Matched room(${room.id}), socket(${socket.id}) joined`);
  if (!rm.getActiveSockets().has(room.owner.socketId)) {
    notifyError(socket, "Invalid matching.");
    return;
  }
  socket.join(room.id);
  connectedSockets[room.owner.socketId].join(room.id);

  // inform partner
  socket.to(room.owner.socketId).emit(SocketEvent.MATCHED, {
    room: room.id,
    partner: requester,
    owner: room.owner.id,
    preferences: room.preferences
  })

  // inform self
  socket.emit(SocketEvent.MATCHED, {
    room: room.id,
    partner: room.owner,
    owner: room.owner.id,
    preferences: room.preferences
  })
}

let handleNoMatch = (socket: Socket) => {
  logger.debug(`[${socket.id}][handleNoMatch.callback] Timeout(${timeout}), no match found.`);
  rm.getActiveSockets().delete(socket.id);
  socket.emit(SocketEvent.NO_MATCH);
}

const handleReady = (socket: Socket, ready: boolean) => {
  logger.debug(`[${socket.id}][handleReady]: notify ready state change`);

  try {
    socket.rooms.forEach((r) => {
      if (r !== socket.id) {
        socket.to(r).emit(SocketEvent.PARTNER_READY_CHANGE, ready);
      }
    });
  } catch (error) {
    notifyError(socket, error);
  }
};

const handleStart = (socket: Socket, data: {
  questionId: string, 
  language:   string
}) => {
  logger.debug(
    `[${socket.id}][notifyStart]: Preparing collab`
  );

  socket.rooms.forEach(r => {
    if (r !== socket.id) {
      const room = rm.getRoomById(r);
      if (room) {
        const roomId = generateRoomId(
          room.owner.id,
          room.partner.id,
          data.questionId,
          data.language
        );

        const roomConfig = {
          id: roomId,
          owner: room.owner.id,
          partner: room.partner.id,
          questionId: data.questionId,
          language: data.language,
        };

        // Emit to collaboration service to create the room
        eventBus.publish('matching-collaboration', JSON.stringify({ roomId: roomId, user1: roomConfig.owner, user2: roomConfig.partner }))

        io.sockets.in(r).emit(SocketEvent.REDIRECT_COLLABORATION, roomConfig);
      }
    }
  });
};

const handleCancel = (socket: Socket) => {
  logger.debug(`[${socket.id}][handleCancel]: Close room and inform partner`);

  socket.rooms.forEach((r) => {
    if (r !== socket.id) {
      logger.debug(`[NotifyClosed]: room ${r}`);

      const room = rm.getRoomById(r);
      if (room) {
        room.owner
          ? rm.getActiveSockets().delete((room.owner as Partner).socketId)
          : {};
        room.partner
          ? rm.getActiveSockets().delete((room.partner as Partner).socketId)
          : {};
      }

      io.to(r).emit(SocketEvent.ROOM_CLOSED);
      rm.closeRoom(r);
    }
  });
}

const notifyError = (socket: Socket, error: any) => {
  logger.error(`[${socket.id}][notifyError]: `, error);
  socket.disconnect();
};

export const SocketHandler = (socket: Socket) => {
  logger.info(`[${socket.id}][Connected]`);
  connectedSockets[socket.id] = socket;

  // Handles matching request, tries to find a room first before creating one
  socket.on(SocketEvent.REQUEST_MATCH, (request: any) => handleMatching(socket, request));

  // Notifies partner of users ready status
  socket.on(SocketEvent.USER_UPDATE_READY, (ready: boolean) => handleReady(socket, ready));

  // Notify matching server that clients should already start collab
  socket.on(SocketEvent.START_COLLABORATION, (data) => handleStart(socket, data));

  socket.on(SocketEvent.DISCONNECTING, (data: any) => handleCancel(socket));
  socket.on(SocketEvent.DISCONNECT, () => {
    logger.info(`[${socket.id}][Disconnect]`)
    rm.getActiveSockets().delete(socket.id);
    delete connectedSockets[socket.id];
  });
}
