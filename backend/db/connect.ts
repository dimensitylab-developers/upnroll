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
  slot.promise = mongoose.connect(MONGODB_URI).then(
    () => mongoose,
    (err: unknown) => {
      slot!.promise = null;
      throw err;
    }
  );

  return slot.promise;
}
