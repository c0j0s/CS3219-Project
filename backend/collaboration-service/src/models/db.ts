import Redis, { Redis as ioRedis } from 'ioredis';
import createMockClient from 'ioredis-mock';
import dotenv from 'dotenv';

dotenv.config();

function getRedisUrl() {
    if (process.env.REDIS_URL) {
      return process.env.REDIS_URL;
    }
    throw new Error("REDIS_URL not found");
}

let redis: ioRedis;

if (process.env.NODE_ENV === 'test') {
  redis = new createMockClient();
} else {
  redis = new Redis(getRedisUrl());
}

export default redis;
