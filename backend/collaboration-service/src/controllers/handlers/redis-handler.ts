import { redis } from '../../models/db';

async function getEditorContent(roomId: string) {
    return await redis.get(`${roomId}_content`);
}

async function getSessionEndTime(roomId: string) {
    return await redis.get(`${roomId}_sessionEnd`);
}

async function getChatList(roomId: string) {
    return await redis.get(`${roomId}_chatList`);
}

async function getMessages(roomId: string) {    
    // Retrieve the whole list
    return await redis.lrange(`${roomId}_messages`, 0, -1);
}

function setSessionEndTime(roomId: string, sessionEndTime: string) {
    redis.set(`${roomId}_sessionEnd`, sessionEndTime);
}
  
function setCodeChange(roomId: string, content: string) {
    redis.set(`${roomId}_content`, content);
}

function setChatList(roomId: string, messages: string)  {
    redis.set(`${roomId}_chatList`, messages);
}

function appendMessage(roomId: string, message: string) {
    redis.lpush(`${roomId}_messages`, message);
}

function delCodeChange(roomId: string) {
    redis.del(`${roomId}_content`);
}

function delSessionEndTime(roomId: string) {
    redis.del(`${roomId}_sessionEnd`);
}

function delChatList(roomId: string) {
    redis.del(`${roomId}_chatList`)
}

function delMessages(roomId: string) {
    redis.del(`${roomId}_messages`)
}

export const RedisHandler = {
    getSessionEndTime,
    getEditorContent,
    getChatList,
    getMessages,
    setSessionEndTime,
    setCodeChange,
    setChatList,
    appendMessage,
    delCodeChange,
    delSessionEndTime,
    delChatList,
    delMessages
}
