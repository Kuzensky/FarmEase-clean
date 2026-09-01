import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.conn) {
        return cached.conn;
    }

    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        throw new Error("MONGODB_URI is not configured");
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(mongoUri, { bufferCommands: false })
            .catch((error) => {
                cached.promise = null;
                throw error;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectDB;
