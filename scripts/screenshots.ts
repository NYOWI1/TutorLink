import { chromium } from '@playwright/test';
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1050 } });
const origin = process.env.SCREENSHOT_ORIGIN || 'http://localhost:3000';
await page.goto(origin + '/login?demo=1');
await page.getByLabel('Email address').fill('maya@tutorlink.demo');
await page.getByLabel('Password', { exact: true }).fill('TutorLink2026!');
await page.getByRole('button', { name: 'Sign in', exact: true }).click();
await page.getByRole('heading', { name: /Hey, Maya/ }).waitFor();
for (const [path, file, heading] of [
  ['/', 'home', 'Find your learning connection.'],
  ['/explore', 'explore', 'Find your kind of tutor.'],
  ['/posts/new', 'create-post', 'Share what you know.'],
  ['/profile', 'profile', 'My profile.'],
  ['/posts/mine', 'my-posts', 'My tutoring posts.'],
  ['/bookings', 'bookings', 'My learning sessions.'],
  ['/requests', 'requests', 'Your booking requests.'],
]) {
  await page.goto(origin + path);
  await page.getByRole('heading', { name: heading, exact: true }).waitFor();
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `public/screenshots/${file}.png`, fullPage: true });
}
const posts = await page.request.get(origin + '/api/posts?q=Java').then((r) => r.json());
await page.goto(
  origin +
    '/posts/' +
    posts.find((post: { title: string }) => post.title === 'Java & OOP, made simple')._id,
);
await page.getByRole('heading', { name: 'Java & OOP, made simple', exact: true }).waitFor();
await page.waitForLoadState('networkidle');
await page.screenshot({ path: 'public/screenshots/post-details.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(origin + '/');
await page.getByRole('heading', { name: 'Find your learning connection.' }).waitFor();
await page.waitForLoadState('networkidle');
await page.screenshot({ path: 'public/screenshots/mobile.png', fullPage: true });
await browser.close();
console.log('Nine application screenshots saved.');
