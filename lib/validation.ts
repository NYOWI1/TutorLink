import { z } from 'zod';
export const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;
export const subjects = [
  'Programming',
  'Mathematics',
  'Business',
  'Languages',
  'Science',
  'Design',
] as const;
const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a valid time');
export const profileSchema = z.object({
  name: text(2, 80),
  bio: text(0, 1000).default(''),
  university: text(0, 120).default(''),
  major: text(0, 120).default(''),
  yearOfStudy: z.coerce.number().int().min(1).max(8).default(1),
  profileImage: z
    .union([z.literal(''), z.url().regex(/^https:\/\//, 'Use an HTTPS image URL')])
    .default(''),
});
export const registerSchema = profileSchema.extend({
  email: z.email().trim().toLowerCase().max(254),
  password: z.string().min(8, 'Password must have at least 8 characters').max(128),
});
export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(128),
});
export const postSchema = z
  .object({
    title: text(5, 120),
    subject: z.enum(subjects),
    description: text(20, 3000),
    pricePerHour: z.coerce.number().min(0).max(10000),
    tutoringMethod: z.enum(['Online', 'In-person', 'Online & In-person']),
    location: text(0, 160).default(''),
    availableDays: z
      .array(z.enum(days))
      .min(1, 'Select at least one available day')
      .transform((a) => [...new Set(a)]),
    availableTimes: z
      .object({ start: time, end: time })
      .refine((a) => a.end > a.start, 'End time must be after start time'),
    status: z.enum(['Active', 'Inactive']).default('Active'),
  })
  .refine((p) => p.tutoringMethod === 'Online' || p.location.length > 0, {
    message: 'Add a meeting location',
    path: ['location'],
  });
export const bookingSchema = z.object({
  tutorPostId: z.string().regex(/^[a-f\d]{24}$/i),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: time,
  duration: z.coerce.number().min(0.5).max(8).multipleOf(0.5),
  message: text(0, 1000).default(''),
});
export function sessionStart(date: string, start: string) {
  return new Date(`${date}T${start}:00+07:00`);
}
export function minutes(time: string) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
export function validateSession(
  data: z.infer<typeof bookingSchema>,
  post: { availableDays: string[]; availableTimes: { start: string; end: string } },
  now = new Date(),
) {
  const start = sessionStart(data.sessionDate, data.startTime);
  if (
    !Number.isFinite(start.getTime()) ||
    new Date(`${data.sessionDate}T12:00:00Z`).toISOString().slice(0, 10) !== data.sessionDate
  )
    return 'Choose a valid date';
  if (start <= now) return 'Choose a future session date and time';
  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: 'Asia/Bangkok',
  }).format(start);
  if (!post.availableDays.includes(weekday)) return 'Your tutor is not available on this day';
  if (
    minutes(data.startTime) < minutes(post.availableTimes.start) ||
    minutes(data.startTime) + data.duration * 60 > minutes(post.availableTimes.end)
  )
    return 'The session must fit within the tutor’s available hours';
  return null;
}
export function overlaps(
  a: { startTime: string; duration: number },
  b: { startTime: string; duration: number },
) {
  return (
    minutes(a.startTime) < minutes(b.startTime) + b.duration * 60 &&
    minutes(b.startTime) < minutes(a.startTime) + a.duration * 60
  );
}
export function canTransition(status: string, next: string, role: 'student' | 'tutor') {
  return role === 'student'
    ? ['Pending', 'Accepted'].includes(status) && next === 'Cancelled'
    : (status === 'Pending' && ['Accepted', 'Rejected'].includes(next)) ||
        (status === 'Accepted' && next === 'Completed');
}
