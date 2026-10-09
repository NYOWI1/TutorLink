import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerSchema,
  postSchema,
  bookingSchema,
  validateSession,
  canTransition,
  overlaps,
} from '../src/lib/validation';
const post = { availableDays: ['Monday'], availableTimes: { start: '09:00', end: '18:00' } };
const data = {
  tutorPostId: 'a'.repeat(24),
  sessionDate: '2030-01-07',
  startTime: '10:00',
  duration: 1,
  message: '',
};
test('requires a strong enough password and valid email', () => {
  assert.equal(
    registerSchema.safeParse({ name: 'Test', email: 'bad', password: 'short' }).success,
    false,
  );
});
test('post validation requires availability and meeting location', () => {
  const base = {
    title: 'Learn Java',
    subject: 'Programming',
    description: 'A clear explanation of Java programming.',
    pricePerHour: 0,
    tutoringMethod: 'In-person',
    location: '',
    availableDays: ['Monday'],
    availableTimes: { start: '09:00', end: '18:00' },
  };
  assert.equal(postSchema.safeParse(base).success, false);
  assert.equal(postSchema.safeParse({ ...base, location: 'Library' }).success, true);
  assert.equal(
    postSchema.safeParse({ ...base, location: 'Library', availableDays: [] }).success,
    false,
  );
});
test('bookings reject invalid duration', () => {
  assert.equal(bookingSchema.safeParse({ ...data, duration: 0 }).success, false);
  assert.equal(bookingSchema.safeParse({ ...data, duration: -1 }).success, false);
});
test('session validates future date, weekday, window and calendar date', () => {
  const now = new Date('2029-01-01');
  assert.equal(validateSession(data, post, now), null);
  assert.match(validateSession({ ...data, sessionDate: '2028-01-03' }, post, now)!, /future/);
  assert.match(validateSession({ ...data, sessionDate: '2030-01-08' }, post, now)!, /day/);
  assert.match(validateSession({ ...data, startTime: '17:30' }, post, now)!, /hours/);
  assert.match(validateSession({ ...data, sessionDate: '2030-02-30' }, post, now)!, /valid date/);
});
test('status transitions enforce actor permissions', () => {
  assert.equal(canTransition('Pending', 'Accepted', 'tutor'), true);
  assert.equal(canTransition('Pending', 'Accepted', 'student'), false);
  assert.equal(canTransition('Accepted', 'Cancelled', 'student'), true);
  assert.equal(canTransition('Completed', 'Accepted', 'tutor'), false);
  assert.equal(canTransition('Accepted', 'Completed', 'student'), false);
});
test('overlap check allows adjacent sessions', () => {
  assert.equal(
    overlaps({ startTime: '10:00', duration: 1 }, { startTime: '11:00', duration: 1 }),
    false,
  );
  assert.equal(
    overlaps({ startTime: '10:00', duration: 1.5 }, { startTime: '11:00', duration: 1 }),
    true,
  );
});
