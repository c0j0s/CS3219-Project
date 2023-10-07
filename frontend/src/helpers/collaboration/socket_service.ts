"use strict";
import ChatMessage from "@/types/chat_message";
import { SocketEvent } from "@/types/enums";
import { Socket, io } from "socket.io-client";

class SocketService {
  socket: Socket;
  roomId: string;

  constructor(roomId: string, endpoint: string, path: string) {
    this.roomId = roomId;
    this.socket = this.createSocket(endpoint, path);
    this.connectToService();
    this.joinRoom();
  }

  createSocket = (endpoint: string, path: string) => {
    return io(endpoint, { path: path });
  };

  connectToService = () => {
    this.socket.on(SocketEvent.CONNECT, () => {
      console.log("Socket connected to collaboration service");
    });
  };

  getSocket() {
    return this.socket;
  }

  getConnectionStatus() {
    return this.socket.connected;
  }

  joinRoom = () => {
    this.socket.emit(SocketEvent.JOIN_ROOM, this.roomId);
  };

  leaveRoom = () => {
    this.socket.disconnect();
  };

  sendCodeChange = (content: string) => {
    this.socket.emit(SocketEvent.CODE_CHANGE, {
      roomId: this.roomId,
      content: content,
    });
  };

  receiveCodeUpdate = (
    setCurrentCode: React.Dispatch<React.SetStateAction<string>>
  ) => {
    this.socket.on(SocketEvent.CODE_UPDATE, (content: string) => {
      setCurrentCode(content);
    });
  };

  sendChatMessage = (message: ChatMessage) => {
    this.socket.emit(SocketEvent.SEND_CHAT_MESSAGE, {
      roomId: this.roomId,
      message: message,
    });
  };

  updateChatMessages = (
    setNewMessages: React.Dispatch<React.SetStateAction<ChatMessage>>
  ) => {
    this.socket.on(SocketEvent.UPDATE_CHAT_MESSAGE, (message: ChatMessage) => {
      setNewMessages(message);
    });
  };
}

export default SocketService;
