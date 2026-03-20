import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

export const hasDatabase = Boolean(connectionString);

if (!hasDatabase) {
  console.warn(
    "DATABASE_URL is not set. Falling back to in-memory storage for development.",
  );
}

export const pool = hasDatabase
  ? new Pool({ connectionString })
  : null;

export const db = hasDatabase && pool
  ? drizzle({ client: pool, schema })
  : undefined as unknown as ReturnType<typeof drizzle>;