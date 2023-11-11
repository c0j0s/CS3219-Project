import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else if (process.env.NODE_ENV === "test") {
  prisma = new PrismaClient({
    datasourceUrl: process.env.TEST_DATABASE_URL,
  });
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

const db = prisma;

export default db;
