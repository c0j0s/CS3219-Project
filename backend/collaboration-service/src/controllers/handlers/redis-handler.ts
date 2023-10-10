import { redis } from '../../models/db';

async function getEditorContent(roomId: string) {
    return await redis.get(`${roomId}_content`);
}

async function getSessionEndTime(roomId: string) {
    return await redis.get(`${roomId}_sessionEnd`);
}

function setSessionEndTime(roomId: string, sessionEndTime: string) {
    redis.set(`${roomId}_sessionEnd`, sessionEndTime);
}
  
function setCodeChange(roomId: string, content: string) {
    redis.set(`${roomId}_content`, content);
}

function delCodeChange(roomId: string) {
    redis.del(`${roomId}_content`);
}

function delSessionEndTime(roomId: string) {
    redis.del(`${roomId}_sessionEnd`);
}

export const RedisHandler = {
    getSessionEndTime,
    getEditorContent,
    setSessionEndTime,
    setCodeChange,
    delCodeChange,
    delSessionEndTime,
}
