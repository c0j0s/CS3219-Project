import redis from '../../models/db';

async function getEditorContent(roomId: string) {
    return await redis.get(`${roomId}_content`);
}

async function getSessionEndTime(roomId: string) {
    return await redis.get(`${roomId}_sessionEnd`);
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

function appendMessage(roomId: string, message: string) {
    redis.lpush(`${roomId}_messages`, message);
}

function delCodeChange(roomId: string) {
    redis.del(`${roomId}_content`);
}

function delSessionEndTime(roomId: string) {
    redis.del(`${roomId}_sessionEnd`);
}

function delMessages(roomId: string) {
    redis.del(`${roomId}_messages`)
}

export const RedisHandler = {
    getSessionEndTime,
    getEditorContent,
    getMessages,
    setSessionEndTime,
    setCodeChange,
    appendMessage,
    delCodeChange,
    delSessionEndTime,
    delMessages
}
