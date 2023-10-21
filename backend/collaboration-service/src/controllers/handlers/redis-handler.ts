import { redis } from '../../models/db';

const EXPIRY = 3610; // 1 hour 10 seconds

/**
 * Getters
 */

async function getEditorContent(roomId: string) {
    return await redis.get(`${roomId}_content`);
}

async function getSessionEndTime(roomId: string) {
    return await redis.hget(`${roomId}`, 'sessionEndTime');
}

async function getMessages(roomId: string) {    
    // Retrieve the whole list
    return await redis.lrange(`${roomId}_messages`, 0, -1);
}

async function getSessionDetails(roomId: string) {
    // Returns { sessionEndTime: string, users: string[] }
    return await redis.hgetall(roomId); 
}

async function getUserIds(roomId: string) {
    // Returns "userId1,userId2" 
    return await redis.hget(roomId, 'users');
}

/**
 * Setters
 */

function setSessionDetails(roomId: string, sessionDetails: { sessionEndTime: string, users: string[] }) {
    redis.hset(roomId, sessionDetails);
    redis.expire(roomId, EXPIRY, 'XX'); 
}

function setUserIds(roomId: string, userIds: string) {
    redis.hset(roomId, 'users', userIds);
}
  
function setCodeChange(roomId: string, content: string) {
    redis.set(`${roomId}_content`, content);    
    redis.expire(`${roomId}_messages`, EXPIRY, 'NX');
}

function appendMessage(roomId: string, message: string) {
    redis.lpush(`${roomId}_messages`, message);
    redis.expire(`${roomId}_messages`, EXPIRY, 'NX');
}

/**
 * Deletes
 */

function delCodeChange(roomId: string) {
    redis.del(`${roomId}_content`);
}

function delMessages(roomId: string) {
    redis.del(`${roomId}_messages`)
}

function delSessionDetails(roomId: string) {
    redis.del(roomId);
}

/**
 * Checks
 */
function doesRoomIdExist(roomId: string) {
    return redis.exists(roomId);
}

export const RedisHandler = {
    getSessionEndTime,
    getEditorContent,
    getMessages,
    getSessionDetails,
    getUserIds,
    setSessionDetails,
    setCodeChange,
    setUserIds,
    appendMessage,
    delCodeChange,
    delMessages,
    delSessionDetails,
    doesRoomIdExist
}
