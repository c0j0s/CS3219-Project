"use strict";
import ChatMessage from "@/types/chat_message";
import { SocketEvent } from "@/types/enums";
import { get } from "http";
import { SetStateAction } from "react";
import { Socket, io } from "socket.io-client";
import { getCollaborationSocketConfig } from "./collaboration_api_wrappers";

class SocketService {
  private socket: Socket;
  private userId: string;
  private roomId: string;
  private partnerId: string;
  private questionId: string;
  private language: string;

  constructor(
      userId: string,
      roomId: string, 
      endpoint: string, 
      path: string, 
      partnerId: string,
      questionId: string,
      language: string,
    ) {
    this.userId = userId;
    this.roomId = roomId;
    this.partnerId = partnerId;
    this.questionId = questionId;
    this.language = language;
    this.socket = io(endpoint, { path: path });
    this.socket.connect();
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
      userId: this.userId,
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
      console.log("Receiving code update ", content)
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
    this.socket.on(SocketEvent.PARTNER_CONNECTION, ( partnerDict : { userId: string, status: boolean}) => {
      console.log(`My userId: ${this.userId}`)
      console.log(`Partner ${partnerDict.userId} is ${partnerDict.status}`);
      setPartnerConnection(partnerDict.status);
    });
  }

  endSession = () => {
    this.socket.emit(SocketEvent.END_SESSION, this.roomId);
  };

  sendChatList = (messages: ChatMessage[]) => {
    console.log(`Sending chatList: ${JSON.stringify(messages)}`)
    this.socket.emit(SocketEvent.SEND_CHAT_LIST, { roomId: this.roomId, messages: JSON.stringify(messages) });
  }

  receiveChatList = (setMessages: React.Dispatch<SetStateAction<ChatMessage[]>>) => {
    this.socket.on(SocketEvent.UPDATE_CHAT_LIST, (messages: string) => {
      console.log(`"Chat list received: ${messages}`)      
      setMessages(JSON.parse(`[${messages}]`).reverse())
    })
  }

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

  leaveSession = () => {
    console.log("Trying to end session")
    this.socket.emitWithAck(SocketEvent.END_SESSION, this.roomId, async (response: string) => {
      console.log(`Session ended with code ${response}`);
    });
  }

}

export default SocketService;
