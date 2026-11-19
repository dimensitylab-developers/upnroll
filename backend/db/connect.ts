import mongoose from "mongoose";
import { getConfig } from "@/lib/config";

/**
 * Cache Components (`"use cache"`) forbids awaiting a Promise that was created
 * outside the cache scope. Mongoose reuses one connect Promise, and React
 * `cache()` uses a module Map — both trip that check.
 *
 * Rules here:
 * 1. Only one caller runs mongoose.connect(); others wait via a NEW Promise.
 * 2. Even the owner wraps connect in a Promise created in this call stack.
 */
let connectClaimed = false;

function waitUntilConnected(timeoutMs = 20_000): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("MongoDB connection timed out while waiting for an in-flight connect."));
    }, timeoutMs);

    const onConnected = () => {
      cleanup();
      resolve(mongoose);
    };
    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };
    const cleanup = () => {
      clearTimeout(timer);
      mongoose.connection.off("connected", onConnected);
      mongoose.connection.off("error", onError);
    };

    mongoose.connection.once("connected", onConnected);
    mongoose.connection.once("error", onError);

    if (mongoose.connection.readyState === 1) {
      cleanup();
      resolve(mongoose);
    }
  });
}

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;

  if (connectClaimed || mongoose.connection.readyState === 2) {
    return waitUntilConnected();
  }

  connectClaimed = true;
  const { MONGODB_URI } = getConfig();
  mongoose.set("bufferCommands", false);

  try {
    // Wrap so the awaited Promise is created in this call stack (Cache Components).
    await new Promise<void>((resolve, reject) => {
      mongoose
        .connect(MONGODB_URI, {
          family: 4,
          serverSelectionTimeoutMS: 20_000,
          connectTimeoutMS: 20_000,
        })
        .then(
          () => resolve(),
          async (err: unknown) => {
            if (mongoose.connection.readyState !== 0) {
              try {
                await mongoose.disconnect();
              } catch {
                /* ignore */
              }
            }
            reject(err);
          }
        );
    });
    return mongoose;
  } finally {
    connectClaimed = false;
  }
}
