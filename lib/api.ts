import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './mongodb';
import { createSession, clearSession, currentUser, requireUser, publicUser } from './auth';
import { fail, validId } from './http';
import {
  registerSchema,
  loginSchema,
  profileSchema,
  postSchema,
  bookingSchema,
  validateSession,
  canTransition,
  overlaps,
  sessionStart,
} from './validation';
import User from '@/models/User';
import TutorPost from '@/models/TutorPost';
import Booking from '@/models/Booking';
const userFields = 'name profileImage bio university major yearOfStudy';
const populated = (q: any) =>
  q
    .populate('tutorPostId')
    .populate('studentUserId', userFields)
    .populate('tutorUserId', userFields);
export async function register(req: NextRequest) {
  const data = registerSchema.parse(await req.json());
  await connectDB();
  const user = await User.create({ ...data, password: await bcrypt.hash(data.password, 12) });
  await createSession(String(user._id));
  return NextResponse.json(publicUser(user, true), { status: 201 });
}
export async function login(req: NextRequest) {
  const data = loginSchema.parse(await req.json());
  await connectDB();
  const user = await User.findOne({ email: data.email }).select('+password');
  if (!user || !(await bcrypt.compare(data.password, user.password)))
    fail(401, 'Email or password is incorrect');
  await createSession(String(user._id));
  return publicUser(user, true);
}
export async function logout() {
  await clearSession();
  return { message: 'Signed out' };
}
export async function me() {
  const user = await currentUser();
  return user ? publicUser(user, true) : null;
}
export async function usersList(req: NextRequest) {
  await connectDB();
  const search = req.nextUrl.searchParams.get('q')?.slice(0, 80);
  const filter = search
    ? { name: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
    : {};
  return (await User.find(filter).limit(100)).map((u) => publicUser(u));
}
export async function userRead(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await connectDB();
  const user = await User.findById(validId(id));
  if (!user) fail(404, 'Profile not found');
  const viewer = await currentUser();
  return publicUser(user, String(viewer?._id) === id);
}
export async function userUpdate(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const viewer = await requireUser();
  const { id } = await ctx.params;
  if (String(viewer._id) !== id) fail(403, 'You can only edit your own profile');
  const data = profileSchema.parse(await req.json());
  return publicUser(
    await User.findByIdAndUpdate(id, data, { new: true, runValidators: true }),
    true,
  );
}
export async function userDelete(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const viewer = await requireUser();
  const { id } = await ctx.params;
  if (String(viewer._id) !== id) fail(403, 'You can only delete your own account');
  const body = await req.json();
  const stored = await User.findById(id).select('+password');
  if (typeof body.password !== 'string' || !(await bcrypt.compare(body.password, stored.password)))
    fail(400, 'Enter your current password to delete your account');
  await mongoose.connection.transaction(async (session) => {
    await User.deleteOne({ _id: id }, { session });
    await Booking.deleteMany({ $or: [{ studentUserId: id }, { tutorUserId: id }] }, { session });
    await TutorPost.deleteMany({ userId: id }, { session });
  });
  await clearSession();
  return { message: 'Account and associated data deleted' };
}
export async function postsList(req: NextRequest) {
  await connectDB();
  const p = req.nextUrl.searchParams;
  const filter: any = {};
  if (p.get('mine') === 'true') filter.userId = (await requireUser())._id;
  else filter.status = 'Active';
  if (p.get('userId') && p.get('mine') !== 'true') filter.userId = validId(p.get('userId')!);
  if (p.get('subject')) filter.subject = p.get('subject');
  if (p.get('method')) filter.tutoringMethod = { $in: [p.get('method'), 'Online & In-person'] };
  if (p.get('day')) filter.availableDays = p.get('day');
  if (p.get('price')) {
    const price = Number(p.get('price'));
    if (!Number.isFinite(price) || price < 0) fail(400, 'Choose a valid maximum price');
    filter.pricePerHour = { $lte: price };
  }
  const escape = (s: string) => s.slice(0, 120).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (p.get('q'))
    filter.$or = ['title', 'subject', 'description'].map((key) => ({
      [key]: { $regex: escape(p.get('q')!), $options: 'i' },
    }));
  if (p.get('location')) filter.location = { $regex: escape(p.get('location')!), $options: 'i' };
  const sort: any =
    p.get('sort') === 'price' ? { pricePerHour: 1, createdAt: -1 } : { createdAt: -1 };
  return TutorPost.find(filter).populate('userId', userFields).sort(sort).limit(100);
}
export async function postRead(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await ctx.params;
  const post = await TutorPost.findById(validId(id)).populate('userId', userFields);
  if (!post) fail(404, 'Tutoring post not found');
  if (post.status === 'Inactive' && String(post.userId._id) !== String((await currentUser())?._id))
    fail(404, 'Tutoring post not found');
  return post;
}
export async function postCreate(req: NextRequest) {
  const user = await requireUser();
  const data = postSchema.parse(await req.json());
  let post: any;
  await mongoose.connection.transaction(async (session) => {
    const owner = await User.findOneAndUpdate(
      { _id: user._id },
      { $inc: { bookingRevision: 1 } },
      { session },
    );
    if (!owner) fail(401, 'Please sign in to continue');
    [post] = await TutorPost.create([{ ...data, userId: user._id }], { session });
  });
  return NextResponse.json(await post.populate('userId', userFields), { status: 201 });
}
export async function postUpdate(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await ctx.params;
  const data = postSchema.parse(await req.json());
  const post = await TutorPost.findById(validId(id));
  if (!post) fail(404, 'Tutoring post not found');
  if (String(post.userId) !== String(user._id)) fail(403, 'You can only edit your own posts');
  return TutorPost.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
    'userId',
    userFields,
  );
}
export async function postDelete(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await ctx.params;
  validId(id);
  await mongoose.connection.transaction(async (session) => {
    const post = await TutorPost.findById(id).session(session);
    if (!post) fail(404, 'Tutoring post not found');
    if (String(post.userId) !== String(user._id)) fail(403, 'You can only delete your own posts');
    if (
      await Booking.exists({ tutorPostId: id, status: { $in: ['Pending', 'Accepted'] } }).session(
        session,
      )
    )
      fail(409, 'Resolve or cancel active bookings before deleting this post');
    await TutorPost.deleteOne({ _id: id }, { session });
    await Booking.deleteMany({ tutorPostId: id }, { session });
  });
  return { message: 'Post deleted' };
}
export async function bookingsList(req: NextRequest) {
  const user = await requireUser();
  const filter =
    req.nextUrl.searchParams.get('role') === 'tutor'
      ? { tutorUserId: user._id }
      : { studentUserId: user._id };
  return populated(Booking.find(filter).sort({ sessionDate: 1, startTime: 1 }).limit(200));
}
export async function bookingRead(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await ctx.params;
  const booking = await populated(Booking.findById(validId(id)));
  if (!booking) fail(404, 'Booking not found');
  if (
    ![String(booking.studentUserId._id), String(booking.tutorUserId._id)].includes(String(user._id))
  )
    fail(403, 'You cannot access this booking');
  return booking;
}
async function checkConflict(
  data: any,
  student: any,
  tutor: any,
  session: mongoose.ClientSession,
  exclude?: string,
) {
  const other = await Booking.find({
    _id: { $ne: exclude },
    sessionDate: data.sessionDate,
    status: { $in: ['Pending', 'Accepted'] },
    $or: [{ tutorUserId: { $in: [student, tutor] } }, { studentUserId: { $in: [student, tutor] } }],
  }).session(session);
  if (other.some((b) => overlaps(b, data)))
    fail(409, 'This time overlaps another booking. Choose a different time.');
}
export async function bookingCreate(req: NextRequest) {
  const user = await requireUser();
  const data = bookingSchema.parse(await req.json());
  let created: any;
  await mongoose.connection.transaction(async (session) => {
    const post = await TutorPost.findOneAndUpdate(
      { _id: data.tutorPostId },
      { $inc: { bookingRevision: 1 } },
      { new: true, session },
    );
    if (!post) fail(404, 'Tutoring post not found');
    if (String(post.userId) === String(user._id))
      fail(400, 'You cannot book your own tutoring post');
    if (post.status !== 'Active') fail(400, 'This tutoring post is inactive');
    const error = validateSession(data, post);
    if (error) fail(400, error);
    const members = await User.updateMany(
      { _id: { $in: [user._id, post.userId] } },
      { $inc: { bookingRevision: 1 } },
      { session },
    );
    if (members.matchedCount !== 2) fail(404, 'A session participant is no longer available');
    await checkConflict(data, user._id, post.userId, session);
    [created] = await Booking.create(
      [
        {
          ...data,
          studentUserId: user._id,
          tutorUserId: post.userId,
          pricePerHour: post.pricePerHour,
        },
      ],
      { session },
    );
  });
  return NextResponse.json(await populated(Booking.findById(created._id)), { status: 201 });
}
export async function bookingUpdate(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await ctx.params;
  validId(id);
  const body = await req.json();
  await mongoose.connection.transaction(async (session) => {
    const b = await Booking.findById(id).session(session);
    if (!b) fail(404, 'Booking not found');
    const role =
      String(b.studentUserId) === String(user._id)
        ? 'student'
        : String(b.tutorUserId) === String(user._id)
          ? 'tutor'
          : null;
    if (!role) fail(403, 'You cannot change this booking');
    if (body.status) {
      if (!canTransition(b.status, body.status, role))
        fail(400, 'This booking status change is not allowed');
      if (body.status === 'Accepted' && sessionStart(b.sessionDate, b.startTime) <= new Date())
        fail(400, 'A past session cannot be accepted');
      if (
        body.status === 'Completed' &&
        sessionStart(b.sessionDate, b.startTime).getTime() + b.duration * 3600000 > Date.now()
      )
        fail(400, 'Mark the session complete after its scheduled end');
      b.status = body.status;
    } else {
      if (role !== 'student' || b.status !== 'Pending')
        fail(400, 'Only your pending bookings can be rescheduled');
      const data = bookingSchema.parse({ ...body, tutorPostId: String(b.tutorPostId) });
      const post = await TutorPost.findOneAndUpdate(
        { _id: b.tutorPostId },
        { $inc: { bookingRevision: 1 } },
        { new: true, session },
      );
      if (!post || post.status !== 'Active') fail(400, 'This tutoring post is no longer available');
      const error = validateSession(data, post);
      if (error) fail(400, error);
      const members = await User.updateMany(
        { _id: { $in: [b.studentUserId, b.tutorUserId] } },
        { $inc: { bookingRevision: 1 } },
        { session },
      );
      if (members.matchedCount !== 2) fail(404, 'A session participant is no longer available');
      await checkConflict(data, b.studentUserId, b.tutorUserId, session, id);
      Object.assign(b, data);
    }
    await b.save({ session });
  });
  return populated(Booking.findById(id));
}
export async function bookingDelete(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await ctx.params;
  const b = await Booking.findById(validId(id));
  if (!b) fail(404, 'Booking not found');
  if (String(b.studentUserId) !== String(user._id))
    fail(403, 'Only the student can delete a booking');
  if (!['Cancelled', 'Rejected', 'Completed'].includes(b.status))
    fail(400, 'Cancel an active booking before deleting it');
  await Booking.deleteOne({ _id: id, status: b.status });
  return { message: 'Booking deleted' };
}
