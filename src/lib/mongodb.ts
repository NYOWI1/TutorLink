import mongoose from 'mongoose';
import '@/models/User';
import '@/models/TutorPost';
import '@/models/Booking';
const globalDb = globalThis as typeof globalThis & { mongoPromise?: Promise<typeof mongoose> };
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Database configuration missing');
  if (!globalDb.mongoPromise)
    globalDb.mongoPromise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .catch((error) => {
        globalDb.mongoPromise = undefined;
        throw error;
      });
  return globalDb.mongoPromise;
}
