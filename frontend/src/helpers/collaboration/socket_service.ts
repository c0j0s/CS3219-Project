"use strict";
import ChatMessage from "@/types/chat_message";
import { SocketEvent } from "@/types/enums";
import { get } from "http";
import { SetStateAction } from "react";
import { Socket, io } from "socket.io-client";
import { getCollaborationSocketConfig } from "./collaboration_api_wrappers";

class SocketService {
  private static socketServiceInstance: SocketService | null = null;
  private socket: Socket;
  private roomId: string;
  private partnerId: string;
  private questionId: string;
  private language: string;

  constructor(
      roomId: string, 
      endpoint: string, 
      path: string, 
      partnerId: string,
      questionId: string,
      language: string,
    ) {
    this.roomId = roomId;
    this.partnerId = partnerId;
    this.questionId = questionId;
    this.language = language;
    this.socket = io(endpoint, { path: path });
    this.socket.connect();
    this.joinRoom();
  }

  public static async getInstance(
      roomId: string, 
      partnerId: string,
      questionId: string,
      language: string,
  ): Promise<SocketService> {
    if (!SocketService.socketServiceInstance) {
      const config = await getCollaborationSocketConfig();
      SocketService.socketServiceInstance = new SocketService(roomId, config.endpoint, config.path, partnerId, questionId, language);
    }
    return SocketService.socketServiceInstance;
  }

  createSocket = (endpoint: string, path: string) => {
    return io(endpoint, { path: path });
  };

  getSocket() {
    return this.socket;
  }

  getConnectionStatus() {
    return this.socket.connected;
  }

  joinRoom = () => {

    var sessionEnd = new Date();
    sessionEnd.setHours(sessionEnd.getHours() + 1); // 1 hour from now

    this.socket.emit(SocketEvent.JOIN_ROOM, { 
      roomId: this.roomId,
      sessionEndTime: sessionEnd,
    });
  };

  leaveRoom = () => {
    // This clears the things from the cache, confirming that a user has the data saved
    this.sendConfirmEndSession();
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

  sendGetSessionTimer = () => {
    this.socket.emit(SocketEvent.GET_SESSION_TIMER, this.roomId);
  } 

  receiveSessionTimer = (
    setSessionTimer: React.Dispatch<React.SetStateAction<Date>>
  ) => {
    this.socket.on(SocketEvent.SESSION_TIMER, (endSession: string) => {
      setSessionTimer(new Date(endSession));
    });
  }

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

  receivePartnerConnection = (setPartnerConnection: React.Dispatch<React.SetStateAction<boolean>>) => {
    this.socket.on(SocketEvent.PARTNER_CONNECTION, (status: boolean) => {
      setPartnerConnection(status);
    });
  }

  endSession = () => {
    this.socket.emit(SocketEvent.END_SESSION, this.roomId);
  };

  receiveEndSession = (setEndSessionState: React.Dispatch<SetStateAction<{
      partnerId: string;
      questionId: string;
      matchedLanguage: string;
      code: string;
      date: Date;
    }>>) => {
    this.socket.on(SocketEvent.END_SESSION, (code: string) => {
      console.log(`Session ended with code ${code}`);
      setEndSessionState({
        partnerId: this.partnerId,
        questionId: this.questionId,
        matchedLanguage: this.language,
        code: code,
        date: new Date(),
      });
    });
  }

  sendConfirmEndSession = () => {
    this.socket.emit(SocketEvent.CONFIRM_END_SESSION, this.roomId);
  }

}

export default SocketService;
