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

function setSessionEndTime(roomId: string, sessionEndTime: string) {
    redis.set(`${roomId}_sessionEnd`, sessionEndTime);
}
  
function setCodeChange(roomId: string, content: string) {
    redis.set(`${roomId}_content`, content);
}

function setChatList(roomId: string, messages: string)  {
    redis.set(`${roomId}_chatList`, messages);
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



export const RedisHandler = {
    getSessionEndTime,
    getEditorContent,
    getChatList,
    setSessionEndTime,
    setCodeChange,
    setChatList,
    delCodeChange,
    delSessionEndTime,
    delChatList,
}
