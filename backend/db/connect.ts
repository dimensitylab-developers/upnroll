import mongoose from "mongoose";
import { getConfig } from "@/lib/config";

/**
 * One connection promise per Mongoose module instance.
 * Next can compile more than one copy when backend/ and frontend/ resolve
 * different node_modules trees. A process-global connection object would
 * make the other copy skip connect(), and its queries then buffer until timeout.
 */
type ConnectSlot = {
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __upnrollMongoose: WeakMap<object, ConnectSlot> | undefined;
}

const slots = global.__upnrollMongoose ?? new WeakMap<object, ConnectSlot>();
if (!global.__upnrollMongoose) global.__upnrollMongoose = slots;

async function resetFailedConnect(slot: ConnectSlot): Promise<void> {
  slot.promise = null;
  // Drop a half-open client so the next call starts clean instead of
  // stacking connect() on a stuck "connecting" topology.
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
    } catch {
      /* ignore — next connect() still replaces the client */
    }
  }
}

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;

  let slot = slots.get(mongoose);
  if (!slot) {
    slot = { promise: null };
    slots.set(mongoose, slot);
  }

  if (mongoose.connection.readyState === 2 && slot.promise) return slot.promise;

  const { MONGODB_URI } = getConfig();
  mongoose.set("bufferCommands", false);
  // family: 4 avoids Windows/Node preferring IPv6 for Atlas hosts when the
  // local path cannot complete TLS (secureConnect timeouts).
  slot.promise = mongoose
    .connect(MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 20_000,
      connectTimeoutMS: 20_000,
    })
    .then(
      () => mongoose,
      async (err: unknown) => {
        await resetFailedConnect(slot!);
        throw err;
      }
    );

  return slot.promise;
}
