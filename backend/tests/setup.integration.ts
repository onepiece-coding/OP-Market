import { config } from "dotenv";
import { beforeAll, afterAll, beforeEach } from "vitest";

config({ path: ".env.test", override: true });

type PrismaClientExtended = typeof import("../src/db/prisma.js").prismaClient;

let prismaClient: PrismaClientExtended;

beforeAll(async () => {
  const prisma = await import("../src/db/prisma.js");
  prismaClient = prisma.prismaClient;
  await prismaClient.$connect();
});

beforeEach(async () => {
  await prismaClient.$executeRawUnsafe(`
    TRUNCATE TABLE
      "order_events",
      "order_products",
      "orders",
      "cart_items",
      "addresses",
      "refresh_tokens",
      "one_time_tokens",
      "products",
      "users"
    RESTART IDENTITY CASCADE;
  `);
});

afterAll(async () => {
  await prismaClient.$disconnect();
});
