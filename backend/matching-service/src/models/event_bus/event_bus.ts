import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Local redis url for npm run dev
function getLocalUrl(){
  if (process.env.REDIS_EVENT_BUS) {
    return process.env.REDIS_EVENT_BUS
  }
  throw new Error('REDIS_EVENT_BUS not defined')
}

export const eventBus = process.env.EVENT_BUS_CONTAINER_NAME 
                        ? new Redis({ host: process.env.EVENT_BUS_CONTAINER_NAME, tls: { servername: process.env.EVENT_BUS_CONTAINER_NAME } })
                        : new Redis(getLocalUrl());
