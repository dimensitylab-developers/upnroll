import mongoose from "mongoose";
import { getConfig } from "@/lib/config";

/**
 * Mongoose connection singleton, cached across hot-reloads in dev.
 * Server-only — never import outside src/server/** or server entry points.
 */

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __upnrollMongoose: MongooseCache | undefined;
}

const cache: MongooseCache = global.__upnrollMongoose ?? { conn: null, promise: null };
if (!global.__upnrollMongoose) global.__upnrollMongoose = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const { MONGODB_URI } = getConfig();
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
