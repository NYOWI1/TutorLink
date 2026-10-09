import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { connectDB } from './mongodb';
import User from '@/models/User';
import { fail } from './http';
import { basePath } from './paths';
function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32)
    throw new Error('JWT_SECRET must contain at least 32 characters');
  return new TextEncoder().encode(value);
}
export async function createSession(id: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(id)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
  (await cookies()).set('tutorlink_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: basePath || '/',
    maxAge: 604800,
  });
}
export async function clearSession() {
  (await cookies()).set('tutorlink_session', '', {
    path: basePath || '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  });
}
export async function currentUser() {
  const token = (await cookies()).get('tutorlink_session')?.value;
  if (!token) return null;
  let id: string | undefined;
  try {
    id = (await jwtVerify(token, secret(), { algorithms: ['HS256'] })).payload.sub;
  } catch {
    return null;
  }
  await connectDB();
  return id ? User.findById(id) : null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) fail(401, 'Please sign in to continue');
  return user;
}
export function publicUser(user: any, own = false) {
  return {
    _id: user._id,
    name: user.name,
    profileImage: user.profileImage,
    bio: user.bio,
    university: user.university,
    major: user.major,
    yearOfStudy: user.yearOfStudy,
    createdAt: user.createdAt,
    ...(own ? { email: user.email } : {}),
  };
}
