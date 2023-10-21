import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

function getEventBusUrl() {

  if (process.env.REDIS_EVENT_BUS) {
    return process.env.REDIS_EVENT_BUS;
  }
  throw new Error("REDIS_EVENT_BUS not found");
}

export const eventBus = new Redis(getEventBusUrl());