import { test, expect, request as playwrightRequest } from '@playwright/test';
import mongoose from 'mongoose';
import Booking from '../../models/Booking';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
test('booking concurrency, rejection, completion, privacy and account cascades', async () => {
  test.skip(!origin.includes('localhost'), 'This fixture test uses the local development database');
  const tutor = await playwrightRequest.newContext({ baseURL: origin }),
    student = await playwrightRequest.newContext({ baseURL: origin }),
    stranger = await playwrightRequest.newContext({ baseURL: origin });
  const contexts = [tutor, student, stranger];
  const ids: string[] = [];
  const stamp = Date.now();
  const offer = {
    title: 'API test mathematics',
    subject: 'Mathematics',
    description: 'A test offer for the booking workflow and permissions.',
    pricePerHour: 100,
    tutoringMethod: 'Online',
    location: '',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    availableTimes: { start: '09:00', end: '18:00' },
    status: 'Active',
  };
  try {
    for (const [i, ctx] of contexts.entries()) {
      const r = await ctx.post('/api/users', {
        data: {
          name: 'API Test ' + i,
          email: `apitest${stamp}-${i}@example.com`,
          password: 'TestPass2026!',
        },
      });
      expect(r.status()).toBe(201);
      ids.push((await r.json())._id);
    }
    const publicProfile = await stranger.get('/api/users/' + ids[0]).then((r) => r.json());
    expect(publicProfile).not.toHaveProperty('email');
    expect(publicProfile).not.toHaveProperty('password');
    const created = await tutor.post('/api/posts', { data: offer });
    expect(created.status()).toBe(201);
    const post = await created.json();
    const future = new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10);
    const data = { tutorPostId: post._id, sessionDate: future, startTime: '10:00', duration: 1 };
    const results = await Promise.all([
      student.post('/api/bookings', { data }),
      student.post('/api/bookings', { data }),
    ]);
    expect(results.map((r) => r.status()).sort()).toEqual([201, 409]);
    const booking = await results.find((r) => r.status() === 201)!.json();
    expect((await stranger.get('/api/bookings/' + booking._id)).status()).toBe(403);
    expect(
      (
        await student.put('/api/bookings/' + booking._id, { data: { status: 'Accepted' } })
      ).status(),
    ).toBe(400);
    expect((await tutor.delete('/api/posts/' + post._id)).status()).toBe(409);
    expect(
      (await tutor.put('/api/bookings/' + booking._id, { data: { status: 'Rejected' } })).status(),
    ).toBe(200);
    expect((await student.delete('/api/bookings/' + booking._id)).status()).toBe(200);
    expect(
      (
        await tutor.put('/api/posts/' + post._id, { data: { ...offer, status: 'Inactive' } })
      ).status(),
    ).toBe(200);
    expect((await student.get('/api/posts/' + post._id)).status()).toBe(404);
    expect((await student.post('/api/bookings', { data })).status()).toBe(400);
    expect((await tutor.put('/api/posts/' + post._id, { data: offer })).status()).toBe(200);
    const b2 = await student.post('/api/bookings', { data }).then((r) => r.json());
    expect(
      (await tutor.put('/api/bookings/' + b2._id, { data: { status: 'Accepted' } })).status(),
    ).toBe(200);
    // A historical accepted-session fixture exercises completion without accepting invalid past requests.
    await mongoose.connect(
      process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27018/tutorlink?replicaSet=tutorlink',
    );
    await Booking.updateOne({ _id: b2._id }, { sessionDate: '2020-01-01' });
    const completed = await tutor.put('/api/bookings/' + b2._id, { data: { status: 'Completed' } });
    expect(completed.status()).toBe(200);
    expect((await completed.json()).status).toBe('Completed');
    expect((await student.delete('/api/bookings/' + b2._id)).status()).toBe(200);
    const b3 = await student.post('/api/bookings', { data }).then((r) => r.json());
    expect(
      (
        await tutor.delete('/api/users/' + ids[0], { data: { password: 'TestPass2026!' } })
      ).status(),
    ).toBe(200);
    expect((await student.get('/api/bookings/' + b3._id)).status()).toBe(404);
    expect((await student.get('/api/posts/' + post._id)).status()).toBe(404);
    expect((await student.get('/api/auth/me').then((r) => r.json()))._id).toBe(ids[1]);
  } finally {
    for (const [i, ctx] of contexts.entries()) {
      if (ids[i]) await ctx.delete('/api/users/' + ids[i], { data: { password: 'TestPass2026!' } });
      await ctx.dispose();
    }
    await mongoose.disconnect();
  }
});
