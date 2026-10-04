'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { appUrl } from '@/lib/paths';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Pencil,
  MapPin,
  BookOpen,
  Trash2,
  Check,
} from 'lucide-react';
import { api, Avatar, useResource, Notice, Loading, Empty, PostCard, Modal } from './ui';
import { useSession, PageHeading } from './TutorLinkApp';
import type { User, Post } from '@/lib/types';
export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { refresh, notify } = useSession();
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [demo, setDemo] = useState(false);
  const [email, setEmail] = useState(''),
    [password, setPassword] = useState('');
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      setEmail('maya@tutorlink.demo');
      setPassword('TutorLink2026!');
      setDemo(true);
    }
  }, []);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      await api(mode === 'login' ? '/api/auth/login' : '/api/users', {
        method: 'POST',
        body: JSON.stringify({ ...Object.fromEntries(form), email, password }),
      });
      await refresh();
      notify(mode === 'login' ? 'Welcome back!' : 'Welcome to TutorLink!');
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next?.startsWith('/') && !next.startsWith('//') ? next : '/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <div className="auth-story">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <GraduationCap size={23} />
          </span>
          Tutor<span>Link</span>.
        </Link>
        <div>
          <span className="hero-kicker">✦ LEARNING IS BETTER TOGETHER</span>
          <h1>
            A little connection.
            <br />A lot of possibility.
          </h1>
          <p>
            You don’t have to figure it all out alone.
            <br />
            Your next breakthrough is one peer away.
          </p>
          <div className="auth-art">
            <BookOpen size={90} />
            <span>✦</span>
            <span>✧</span>
          </div>
          <div className="auth-points">
            <span>
              <Check size={17} />
              Learn from your university peers
            </span>
            <span>
              <Check size={17} />
              Share what you know
            </span>
            <span>
              <Check size={17} />
              Grow at your own pace
            </span>
          </div>
        </div>
        <small>Made for students, by students.</small>
      </div>
      <main className="auth-form-wrap">
        <Link href="/" className="back-link">
          <ArrowLeft size={16} />
          Back to marketplace
        </Link>
        <div className="auth-form">
          <span className="eyebrow">YOUR LEARNING SPACE AWAITS</span>
          <h1>{mode === 'login' ? 'Welcome back.' : 'Let’s grow together.'}</h1>
          <p>
            {mode === 'login'
              ? 'Sign in to pick up where you left off.'
              : 'One account to learn, teach, and connect.'}
          </p>
          <Notice error={error} />
          <form onSubmit={submit}>
            {mode === 'register' && (
              <label>
                Full name
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@university.edu"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === 'register' ? 8 : 1}
                maxLength={128}
                placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
            {mode === 'register' && (
              <label>
                University
                <input name="university" placeholder="Where do you study?" maxLength={120} />
              </label>
            )}
            <button className="button primary full" disabled={busy}>
              {busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
            <Link href={mode === 'login' ? '/register' : '/login'}>
              {mode === 'login' ? 'Join TutorLink' : 'Sign in'}
            </Link>
          </p>
          {mode === 'login' && !demo && process.env.NODE_ENV === 'development' && (
            <Link
              href="/login?demo=1"
              className="demo-link"
              onClick={() => {
                setEmail('maya@tutorlink.demo');
                setPassword('TutorLink2026!');
                setDemo(true);
              }}
            >
              Exploring locally? Try the seeded demo account
              <ArrowUpRightIcon />
            </Link>
          )}
          {demo && (
            <p className="help-text">
              Demo credentials are filled in. Sign in to explore the local sample data.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
function ArrowUpRightIcon() {
  return <ArrowRight size={13} />;
}
export function ProfilePage({ id, edit = false }: { id?: string; edit?: boolean }) {
  const { user, refresh, notify } = useSession();
  const router = useRouter();
  const target = id || user?._id;
  const profile = useResource<User>(target ? '/api/users/' + target : null);
  const posts = useResource<Post[]>(
    target ? '/api/posts?' + (target === user?._id ? 'mine=true' : 'userId=' + target) : null,
  );
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState(false);
  const own = target === user?._id;
  if (profile.loading) return <Loading />;
  if (!profile.data)
    return (
      <>
        <Notice error={profile.error} />
        <Empty
          title="Profile unavailable"
          description="This member’s profile could not be found."
        />
      </>
    );
  const p = profile.data;
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      profile.setData(
        await api('/api/users/' + target, {
          method: 'PUT',
          body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
        }),
      );
      await refresh();
      notify('Your profile has been updated');
      router.push('/profile');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/users/' + target, {
        method: 'DELETE',
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      notify('Your account has been deleted');
      window.location.assign(appUrl('/'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (edit && own)
    return (
      <>
        <PageHeading
          eyebrow="MAKE YOURSELF AT HOME"
          title="Edit your profile."
          description="Let your peers get to know the person behind the knowledge."
        />
        <form className="form-panel panel" onSubmit={save}>
          <Notice error={error} />
          <h3>The basics</h3>
          <div className="form-grid">
            <label>
              Full name
              <input name="name" defaultValue={p.name} required minLength={2} maxLength={80} />
            </label>
            <label>
              University
              <input name="university" defaultValue={p.university} maxLength={120} />
            </label>
            <label>
              Major
              <input name="major" defaultValue={p.major} maxLength={120} />
            </label>
            <label>
              Year of study
              <select name="yearOfStudy" defaultValue={p.yearOfStudy}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Profile image URL
            <input
              name="profileImage"
              type="url"
              defaultValue={p.profileImage}
              placeholder="https://…"
            />
            <span className="help-text">
              Use a public HTTPS image URL, or leave blank for your initials.
            </span>
          </label>
          <label>
            About you
            <textarea
              name="bio"
              rows={5}
              defaultValue={p.bio}
              maxLength={1000}
              placeholder="What do you love learning? What can you help with?"
            />
          </label>
          <div className="form-actions">
            <Link href="/profile" className="button outline">
              Cancel
            </Link>
            <button className="button primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </>
    );
  return (
    <>
      <PageHeading
        eyebrow={own ? 'YOUR CORNER OF THE COMMUNITY' : 'MEET YOUR LEARNING CONNECTION'}
        title={own ? 'My profile.' : p.name + '.'}
        description={
          own
            ? 'A little about you. A lot you can share.'
            : 'Get to know the peer behind the expertise.'
        }
        action={
          own ? (
            <Link href="/profile/edit" className="button outline">
              <Pencil size={16} />
              Edit profile
            </Link>
          ) : undefined
        }
      />
      <section className="profile-panel panel">
        <Avatar user={p} size="large" />
        <div>
          <h2>{p.name}</h2>
          <p>
            {p.major || 'University student'} · Year {p.yearOfStudy}
          </p>
          {p.university && (
            <span className="profile-university">
              <GraduationCap size={17} />
              {p.university}
            </span>
          )}
          {own && <span className="profile-email">{p.email}</span>}
        </div>
        <span className="profile-member">
          <span />
          TutorLink community
        </span>
      </section>
      <div className="profile-about panel">
        <h3>A little about {own ? 'me' : p.name.split(' ')[0]}</h3>
        <p>{p.bio || 'This member hasn’t added a bio yet.'}</p>
      </div>
      <div className="section-heading profile-posts-heading">
        <h2>{own ? 'My tutoring posts' : 'Tutoring with ' + p.name.split(' ')[0]}</h2>
        <span>{posts.data?.length || 0} posts</span>
      </div>
      <Notice error={posts.error} />
      {posts.loading ? (
        <Loading />
      ) : posts.data?.length ? (
        <div className="posts-grid my-posts-grid">
          {posts.data.map((post) => (
            <PostCard key={post._id} post={post} own={own} />
          ))}
        </div>
      ) : (
        <Empty
          title="No tutoring posts yet"
          description={
            own
              ? 'Turn your knowledge into someone’s next breakthrough.'
              : 'Check back soon for new tutoring offers.'
          }
          href={own ? '/posts/new' : undefined}
          label="Create a post"
        />
      )}
      {own && (
        <div className="danger-zone">
          <div>
            <h3>Delete account</h3>
            <p>Permanently delete your profile, posts, and all associated bookings.</p>
          </div>
          <button
            className="button danger-outline"
            onClick={() => {
              setError('');
              setDeleting(true);
            }}
          >
            <Trash2 size={16} />
            Delete account
          </button>
        </div>
      )}
      {deleting && (
        <Modal title="Delete your account?" onClose={() => setDeleting(false)}>
          <p>
            This permanently removes your profile, tutoring posts, and bookings, including those
            shared with other members. This cannot be undone.
          </p>
          <form onSubmit={remove}>
            <Notice error={error} />
            <label>
              Confirm your current password
              <input name="password" type="password" required autoComplete="current-password" />
            </label>
            <div className="form-actions">
              <button type="button" className="button outline" onClick={() => setDeleting(false)}>
                Keep my account
              </button>
              <button className="button danger" disabled={busy}>
                {busy ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
