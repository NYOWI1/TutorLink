import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'TutorLink — Learn together, go further',
  description:
    'Connect with university peers. Find a tutor, share what you know, and make your next breakthrough.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
