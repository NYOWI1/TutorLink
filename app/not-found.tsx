import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="standalone">
      <h1>Page not found</h1>
      <p>Let’s get you back to learning.</p>
      <Link className="button primary" href="/">
        Back to home
      </Link>
    </main>
  );
}
