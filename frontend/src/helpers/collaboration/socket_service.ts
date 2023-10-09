"use strict";
import ChatMessage from "@/types/chat_message";
import { SocketEvent } from "@/types/enums";
import { SetStateAction } from "react";
import { Socket, io } from "socket.io-client";

class SocketService {
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
    this.socket = this.createSocket(endpoint, path);
    this.joinRoom();
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
      endSession: sessionEnd,
      partnerId: this.partnerId
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
    this.socket.on(SocketEvent.END_SESSION, ( cachedDetails: {
      code: string,
      endSession: string, // Date of session end
    }) => {
      console.log(`Session ended with code ${cachedDetails.code} at ${cachedDetails.endSession}`);
      setEndSessionState({
        partnerId: this.partnerId,
        questionId: this.questionId,
        matchedLanguage: this.language,
        code: cachedDetails.code,
        date: new Date(cachedDetails.endSession),
      });
    });
  }

  sendConfirmEndSession = () => {
    this.socket.emit(SocketEvent.CONFIRM_END_SESSION, this.roomId);
  }

}

export default SocketService;
