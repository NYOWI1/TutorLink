import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import mongoose from 'mongoose';
import { seed } from './seed';
// Load local configuration before selecting the database; Next.js starts later.
try {
  process.loadEnvFile('.env.local');
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
let mongo: MongoMemoryReplSet | undefined;
if (!process.env.MONGODB_URI) {
  await mkdir('.data/mongo', { recursive: true });
  process.env.MONGOMS_DOWNLOAD_DIR ||= process.cwd() + '/.data/bin';
  mongo = await MongoMemoryReplSet.create({
    instanceOpts: [{ dbPath: process.cwd() + '/.data/mongo', port: 27018 }],
    replSet: { name: 'tutorlink', count: 1, storageEngine: 'wiredTiger' },
  });
  process.env.MONGODB_URI = mongo.getUri('tutorlink');
  console.log('Local MongoDB is running; data persists in .data/mongo.');
}
process.env.JWT_SECRET ||= randomBytes(48).toString('hex');
process.env.APP_ORIGIN ||= 'http://localhost:3000';
await mongoose.connect(process.env.MONGODB_URI!);
if (mongo) await seed();
await mongoose.disconnect();
const child = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'dev', '--hostname', '0.0.0.0'],
  { stdio: 'inherit', env: process.env },
);
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  child.kill('SIGTERM');
  await mongo?.stop({ doCleanup: false });
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
child.on('exit', stop);
