import { test, expect } from '@playwright/test';
test('marketplace is responsive and search works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Find your learning connection.' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Web development, one step at a time' }),
  ).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/home.png', fullPage: true });
  await page.goto('/explore');
  await page.getByRole('textbox', { name: 'Search posts' }).fill('calculus');
  await expect(page.getByRole('heading', { name: 'Calculus without the confusion' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Java & OOP, made simple' })).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Search posts' }).fill('');
  await expect(page.getByRole('heading', { name: 'Java & OOP, made simple' })).toBeVisible();
  await page.screenshot({ path: 'test-results/screenshots/explore.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Find your learning connection.' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'test-results/screenshots/mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('link', { name: 'Explore tutors', exact: true })).toBeVisible();
  const missing = await page.goto('/this-page-does-not-exist');
  expect(missing?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
test('register, profile CRUD, post CRUD and booking workflow enforce ownership', async ({
  browser,
}) => {
  const student = await browser.newContext();
  const tutor = await browser.newContext();
  const s = await student.newPage(),
    t = await tutor.newPage();
  const stamp = Date.now();
  async function register(page: any, name: string, email: string) {
    await page.goto('/register');
    await page.getByLabel('Full name').fill(name);
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('TestPass2026!');
    await page.getByLabel('University').fill('Assumption University');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: new RegExp('Hey, ' + name.split(' ')[0]) }),
    ).toBeVisible();
    return await page.request.get('/api/auth/me').then((r: any) => r.json());
  }
  const tutorUser = await register(t, 'Test Tutor', `tutor${stamp}@example.com`);
  const studentUser = await register(s, 'Test Student', `student${stamp}@example.com`);
  await t.goto('/posts/new');
  await t.getByLabel('Post title').fill('Test Java Fundamentals');
  await t
    .getByLabel('Description', { exact: true })
    .fill('Learn the core ideas of Java with patient, practical examples.');
  await t.getByLabel('Location', { exact: true }).fill('AU Library');
  for (const d of ['Tue', 'Thu', 'Sat', 'Sun']) await t.getByText(d, { exact: true }).check();
  await t.getByRole('button', { name: 'Publish tutoring post' }).click();
  await expect(t.getByRole('heading', { name: 'Test Java Fundamentals' })).toBeVisible();
  const postId = t.url().split('/').pop()!;
  await t.screenshot({ path: 'test-results/screenshots/post-details.png', fullPage: true });
  expect(
    (await s.request.put('/api/posts/' + postId, { data: { title: 'Hacked' } })).status(),
  ).toBe(400);
  const original = await t.request.get('/api/posts/' + postId).then((r) => r.json());
  expect((await s.request.put('/api/posts/' + postId, { data: original })).status()).toBe(403);
  expect((await s.request.delete('/api/posts/' + postId)).status()).toBe(403);
  expect(
    (
      await t.request.post('/api/bookings', {
        data: { tutorPostId: postId, sessionDate: '2030-01-07', startTime: '10:00', duration: 1 },
      })
    ).status(),
  ).toBe(400);
  await s.goto('/posts/' + postId);
  await s.getByRole('button', { name: 'Book a session' }).click();
  const future = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  await s.getByLabel('Session date').fill(future);
  await s.getByLabel('Start time').fill('10:00');
  await s.getByLabel('A note for your tutor').fill('Help me understand Java classes.');
  await s.getByRole('button', { name: 'Request session' }).click();
  await expect(s.getByRole('heading', { name: 'Your session, at a glance.' })).toBeVisible();
  const bookingId = s.url().split('/').pop()!;
  await s.getByRole('button', { name: 'Edit booking' }).click();
  await s.getByLabel('Start time').fill('11:00');
  await s.getByRole('button', { name: 'Save booking changes' }).click();
  await expect(s.getByText('11:00 AM', { exact: true })).toBeVisible();
  const overlap = await s.request.post('/api/bookings', {
    data: { tutorPostId: postId, sessionDate: future, startTime: '11:00', duration: 1 },
  });
  expect(overlap.status()).toBe(409);
  await t.goto('/bookings/' + bookingId);
  await t.getByRole('button', { name: 'Accept request' }).click();
  await expect(t.getByText('Accepted', { exact: true })).toBeVisible();
  expect(
    (await t.request.put('/api/bookings/' + bookingId, { data: { status: 'Completed' } })).status(),
  ).toBe(400);
  await s.reload();
  await expect(s.getByText('Accepted', { exact: true })).toBeVisible();
  await s.getByRole('button', { name: 'Cancel booking', exact: true }).click();
  await s.getByRole('dialog').getByRole('button', { name: 'Cancel session' }).click();
  await expect(s.getByText('Cancelled', { exact: true })).toBeVisible();
  await s.getByRole('button', { name: 'Delete booking', exact: true }).click();
  await s.getByRole('dialog').getByRole('button', { name: 'Delete booking' }).click();
  await expect(s.getByRole('heading', { name: 'My learning sessions.' })).toBeVisible();
  await t.goto('/posts/' + postId + '/edit');
  await t.getByLabel('Post title').fill('Updated Java Fundamentals');
  await t.getByRole('button', { name: 'Save changes' }).click();
  await expect(t.getByRole('heading', { name: 'Updated Java Fundamentals' })).toBeVisible();
  await t.getByRole('button', { name: 'Delete post', exact: true }).click();
  await t.getByRole('dialog').getByRole('button', { name: 'Delete post', exact: true }).click();
  await expect(t.getByRole('heading', { name: 'My tutoring posts.' })).toBeVisible();
  await s.goto('/profile/edit');
  await s.getByLabel('Full name').fill('Updated Student');
  await s.getByLabel('About you').fill('I love learning with my peers.');
  await s.getByRole('button', { name: 'Save changes' }).click();
  await expect(s.getByRole('heading', { name: 'Updated Student' })).toBeVisible();
  expect(
    (
      await t.request.put('/api/users/' + studentUser._id, { data: { name: 'Unauthorized' } })
    ).status(),
  ).toBe(403);
  await s.getByRole('button', { name: 'Delete account', exact: true }).click();
  await s.getByLabel('Confirm your current password').fill('TestPass2026!');
  await s.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(
    s.getByRole('heading', { name: 'Your next breakthrough starts here.' }),
  ).toBeVisible();
  await t.request.delete('/api/users/' + tutorUser._id, { data: { password: 'TestPass2026!' } });
  await student.close();
  await tutor.close();
});
