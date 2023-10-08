import { redis } from '../../models/db';

async function getEditorContent(roomId: string) {
    return await redis.get(`${roomId}_content`);
}
  
async function getRoomDetails(roomId: string) {
    return await redis.get(`${roomId}_roomDetails`);
}

  
