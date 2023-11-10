export enum SocketEvent {
    CONNECTED = "connect",
    CONNECTION_ERROR = "connection_error",
    DISCONNECTING = "disconnecting",
    DISCONNECT = "disconnect",
    REQUEST_MATCH = "request_match",
    USER_UPDATE_READY = "user_update_ready",
    START_COLLABORATION = "start_collaboration",
    MATCHED = "matched",
    NO_MATCH = "no_match",
    REDIRECT_COLLABORATION = "redirect_collaboration",
    PARTNER_READY_CHANGE = "partner_ready_change",
    ROOM_CLOSED = "room_closed",
  }
  
  export default SocketEvent;