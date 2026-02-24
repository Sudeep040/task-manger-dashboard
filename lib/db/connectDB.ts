declare global {
  // eslint-disable-next-line no-var
  var __mongoose: { conn: any; promise: Promise<any> | null } | undefined;
}

import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";

if (!MONGO_URI) {
  // Do not crash on module import in environments where env is not set yet.
  // The caller should ensure MONGO_URI is provided before calling connectDB.
}

const cached = global.__mongoose || (global.__mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

