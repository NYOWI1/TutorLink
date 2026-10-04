import { chromium, expect } from '@playwright/test';
const origin = process.env.SMOKE_ORIGIN;
if (!origin) throw new Error('Set SMOKE_ORIGIN to the full deployed app URL');
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const contexts = [await browser.newContext(), await browser.newContext()];
const pages = await Promise.all(contexts.map((c) => c.newPage()));
const ids: string[] = [];
const stamp = Date.now();
const password = 'SmokePass2026!';
try {
  for (const [i, page] of pages.entries()) {
    await page.goto(origin + '/register');
    await page.getByLabel('Full name').fill(i === 0 ? 'Smoke Tutor' : 'Smoke Student');
    await page.getByLabel('Email address').fill(`smoke${stamp}-${i}@example.com`);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('University').fill('Assumption University');
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    await expect(page.getByRole('heading', { name: /Hey, Smoke/ })).toBeVisible({ timeout: 30000 });
    ids.push((await page.request.get(origin + '/api/auth/me').then((r) => r.json()))._id);
  }
  const [t, s] = pages;
  await t.goto(origin + '/posts/new');
  await t.getByLabel('Post title').fill('Deployment smoke test tutoring');
  await t
    .getByLabel('Description', { exact: true })
    .fill('Temporary tutoring post for verifying the live booking workflow.');
  await t.getByLabel('Location', { exact: true }).fill('University library');
  for (const day of ['Tue', 'Thu', 'Sat', 'Sun']) await t.getByText(day, { exact: true }).check();
  await t.getByRole('button', { name: 'Publish tutoring post' }).click();
  await expect(t.getByRole('heading', { name: 'Deployment smoke test tutoring' })).toBeVisible();
  const postId = t.url().split('/').pop()!;
  await t.request.post(origin + '/api/auth/logout');
  await t.goto(origin + '/login');
  await t.getByLabel('Email address').fill(`smoke${stamp}-0@example.com`);
  await t.getByLabel('Password', { exact: true }).fill(password);
  await t.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(t.getByRole('heading', { name: /Hey, Smoke/ })).toBeVisible();
  await s.goto(origin + '/posts/' + postId);
  await s.getByRole('button', { name: 'Book a session' }).click();
  await s
    .getByLabel('Session date')
    .fill(new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10));
  await s.getByLabel('Start time').fill('11:00');
  await s.getByRole('button', { name: 'Request session' }).click();
  await expect(s.getByRole('heading', { name: 'Your session, at a glance.' })).toBeVisible();
  const bookingId = s.url().split('/').pop()!;
  await t.goto(origin + '/bookings/' + bookingId);
  await t.getByRole('button', { name: 'Accept request' }).click();
  await expect(t.getByText('Accepted', { exact: true })).toBeVisible();
  await s.reload();
  await expect(s.getByText('Accepted', { exact: true })).toBeVisible();
  await s.getByRole('button', { name: 'Cancel booking', exact: true }).click();
  await s.getByRole('dialog').getByRole('button', { name: 'Cancel session' }).click();
  await expect(s.getByText('Cancelled', { exact: true })).toBeVisible();
  expect((await s.request.delete(origin + '/api/bookings/' + bookingId)).status()).toBe(200);
  expect((await t.request.delete(origin + '/api/posts/' + postId)).status()).toBe(200);
  await s.goto(origin + '/profile/edit');
  await s.getByLabel('About you').fill('Temporary deployment verification profile.');
  await s.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    s.getByText('Temporary deployment verification profile.', { exact: true }),
  ).toBeVisible();
  const invalidOrigin = await s.request.post(origin + '/api/auth/logout', {
    headers: { origin: 'https://unrelated.example' },
  });
  expect(invalidOrigin.status()).toBe(403);
  await s.setViewportSize({ width: 390, height: 844 });
  await s.goto(origin + '/');
  await expect(s.getByRole('heading', { name: /Hey, Smoke/ })).toBeVisible();
  expect(await s.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await s.screenshot({ path: '/tmp/tutorlink-production-mobile.png', fullPage: true });
  console.log(
    'Production HTTPS smoke test passed: registration, login, profile update, post creation, booking, acceptance, cancellation, deletion, CSRF origin check, and mobile layout.',
  );
} finally {
  for (const [i, page] of pages.entries()) {
    if (ids[i]) {
      const r = await page.request.delete(origin + '/api/users/' + ids[i], { data: { password } });
      if (r.status() !== 200) console.warn('Cleanup account failed:', r.status());
    }
  }
  await browser.close();
}
