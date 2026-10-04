'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Compass,
  GraduationCap,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  UserRound,
  Users,
  X,
  Inbox,
  Check,
  Clock3,
} from 'lucide-react';
import type { User, Post, Booking } from '@/lib/types';
import {
  api,
  Avatar,
  PostCard,
  useResource,
  Loading,
  Notice,
  Empty,
  DateLabel,
  TimeLabel,
} from './ui';
import { AuthPage, ProfilePage } from './UserPages';
import { PostForm, PostDetail } from './PostPages';
import { BookingsPage, BookingDetail } from './BookingPages';
import { subjects, days } from '@/lib/validation';
const SessionContext = createContext<{
  user: User | null;
  refresh: () => Promise<void>;
  notify: (message: string) => void;
}>({ user: null, refresh: async () => {}, notify: () => {} });
export const useSession = () => useContext(SessionContext);
const nav = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore tutors', icon: Compass },
  { href: '/posts/mine', label: 'My tutoring posts', icon: LayoutGrid },
  { href: '/bookings', label: 'My bookings', icon: CalendarDays },
  { href: '/requests', label: 'Booking requests', icon: Inbox },
  { href: '/profile', label: 'My profile', icon: UserRound },
];
export default function TutorLinkApp({ path }: { path: string }) {
  const [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState('');
  const router = useRouter();
  const refresh = async () => {
    setUser(await api('/api/auth/me'));
    setReady(true);
  };
  useEffect(() => {
    refresh().catch(() => setReady(true));
  }, []);
  useEffect(() => {
    setMenu(false);
  }, [path]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  const isAuth = path === '/login' || path === '/register';
  const protectedRoute =
    ['/posts/new', '/posts/mine', '/bookings', '/requests', '/profile'].includes(path) ||
    path.endsWith('/edit') ||
    path.startsWith('/bookings/');
  useEffect(() => {
    if (ready && !user && protectedRoute) router.replace('/login?next=' + encodeURIComponent(path));
  }, [ready, user, protectedRoute, path, router]);
  const requests = useResource<Booking[]>(user ? '/api/bookings?role=tutor' : null);
  const count = requests.data?.filter((b) => b.status === 'Pending').length || 0;
  const value = {
    user,
    refresh,
    notify: (message: string) => {
      setToast(message);
      requests.reload();
    },
  };
  if (isAuth)
    return (
      <SessionContext.Provider value={value}>
        <AuthPage mode={path === '/login' ? 'login' : 'register'} />
        {toast && (
          <div className="toast" role="status">
            <Check size={18} />
            {toast}
          </div>
        )}
      </SessionContext.Provider>
    );
  const active =
    nav.find((n) => n.href === path)?.label ||
    (path === '/posts/new'
      ? 'Create tutoring post'
      : path.startsWith('/posts/')
        ? 'Tutoring post'
        : path.startsWith('/bookings/')
          ? 'Booking details'
          : 'Profile');
  return (
    <SessionContext.Provider value={value}>
      <div className="app-shell">
        {menu && (
          <button
            className="sidebar-overlay"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <aside className={`sidebar ${menu ? 'open' : ''}`}>
          <Link href="/" className="brand">
            <span className="brand-mark">
              <GraduationCap size={23} />
            </span>
            Tutor<span>Link</span>
            <span className="brand-period">.</span>
          </Link>
          <div className="workspace-label">YOUR LEARNING SPACE</div>
          <nav>
            {nav.map((n) => (
              <Link
                href={n.href}
                key={n.href}
                className={`nav-item ${path === n.href ? 'active' : ''}`}
              >
                <n.icon size={19} />
                {n.label}
                {n.href === '/requests' && count > 0 && <span className="nav-count">{count}</span>}
              </Link>
            ))}
          </nav>
          <Link href="/posts/new" className="button primary sidebar-create">
            <Plus size={18} />
            Create a tutoring post
          </Link>
          <div className="sidebar-note">
            <span className="note-icon">
              <Sparkles size={20} />
            </span>
            <h4>A little help goes a long way.</h4>
            <p>Share what you know. Help a fellow student grow.</p>
            <Link href="/posts/new">
              Become a peer tutor
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="sidebar-bottom">
            {user ? (
              <>
                <Link className="sidebar-user" href="/profile">
                  <Avatar user={user} />
                  <span>
                    <strong>{user.name}</strong>
                    <small>{user.major || 'TutorLink member'}</small>
                  </span>
                </Link>
                <button
                  className="icon-button"
                  title="Sign out"
                  aria-label="Sign out"
                  onClick={async () => {
                    await api('/api/auth/logout', { method: 'POST' });
                    await refresh();
                    router.push('/');
                    setToast('You have signed out');
                  }}
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <Link className="sidebar-user" href="/login">
                <Avatar />
                <span>
                  <strong>Your next chapter</strong>
                  <small>
                    Sign in to get started <ArrowRight size={12} />
                  </small>
                </span>
              </Link>
            )}
          </div>
        </aside>
        <div className="main-shell">
          <header className="topbar">
            <div className="breadcrumb">
              <button
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                onClick={() => setMenu(true)}
              >
                <Menu size={22} />
              </button>
              <span>Workspace</span>
              <span className="slash">/</span>
              <strong>{active}</strong>
            </div>
            <div className="topbar-right">
              <span className="semester">
                <span />
                Made for university life
              </span>
              {user ? (
                <Link href="/profile" aria-label="Your profile">
                  <Avatar user={user} size="small" />
                </Link>
              ) : (
                <Link href="/login" className="sign-in">
                  Sign in
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </header>
          <main className="main-content">
            {protectedRoute && (!ready || !user) ? (
              <Loading />
            ) : path === '/' ? (
              <HomePage />
            ) : path === '/explore' ? (
              <ExplorePage />
            ) : path === '/posts/mine' ? (
              <MyPosts />
            ) : path === '/posts/new' ? (
              <PostForm />
            ) : path.match(/^\/posts\/[^/]+\/edit$/) ? (
              <PostForm id={path.split('/')[2]} />
            ) : path.match(/^\/posts\/[^/]+$/) ? (
              <PostDetail id={path.split('/')[2]} />
            ) : path === '/bookings' ? (
              <BookingsPage />
            ) : path === '/requests' ? (
              <BookingsPage requests />
            ) : path.match(/^\/bookings\/[^/]+$/) ? (
              <BookingDetail id={path.split('/')[2]} />
            ) : path === '/profile' ? (
              <ProfilePage />
            ) : path === '/profile/edit' ? (
              <ProfilePage edit />
            ) : path.match(/^\/profile\/[^/]+$/) ? (
              <ProfilePage id={path.split('/')[2]} />
            ) : (
              <Empty
                title="This page isn’t here"
                description="Find your next learning connection on the home page."
                href="/"
                label="Back to home"
              />
            )}
          </main>
          <footer className="footer">
            <span>© {new Date().getFullYear()} TutorLink</span>
            <span>
              Made for students, by students.<span className="footer-dot">✦</span>
            </span>
          </footer>
        </div>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
    </SessionContext.Provider>
  );
}
function HomePage() {
  const { user } = useSession();
  const { data: posts, error, loading } = useResource<Post[]>('/api/posts');
  const bookings = useResource<Booking[]>(user ? '/api/bookings' : null);
  const requests = useResource<Booking[]>(user ? '/api/bookings?role=tutor' : null);
  const [category, setCategory] = useState('All subjects');
  const [query, setQuery] = useState('');
  const router = useRouter();
  const upcoming = bookings.data?.filter(
    (b) =>
      b.status === 'Accepted' && new Date(`${b.sessionDate}T${b.startTime}:00+07:00`) > new Date(),
  )[0];
  const visible =
    posts?.filter((p) => category === 'All subjects' || p.subject === category).slice(0, 6) || [];
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">A GOOD DAY TO LEARN SOMETHING NEW</div>
          <h1>
            {user ? `Hey, ${user.name.split(' ')[0]}` : 'Your next breakthrough starts here'}
            <span className="wave">{user ? ' 👋' : '.'}</span>
          </h1>
          <p>A little guidance. A new perspective. A step closer to your goals.</p>
        </div>
        <Link href="/posts/new" className="button outline">
          <Plus size={17} />
          Offer tutoring
        </Link>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="tiny-star">✦</span> BETTER TOGETHER
          </div>
          <h2>
            Big ideas.
            <br />
            Brighter futures.
            <br />
            <span>One connection away.</span>
          </h2>
          <p>
            Find a peer who gets it. Learn at your pace,
            <br className="desktop-break" /> and turn “I don’t get it” into “I’ve got this.”
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push('/explore?q=' + encodeURIComponent(query));
            }}
          >
            <Search size={19} />
            <input
              aria-label="Search tutoring subjects"
              placeholder="What would you like to learn?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button aria-label="Find tutors">
              <ArrowRight size={20} />
            </button>
          </form>
          <div className="hero-caption">
            <span className="avatar-stack">
              <span>JL</span>
              <span>MT</span>
              <span>SK</span>
            </span>
            <span>Your campus. Your people. Your potential.</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-star star-one">✧</span>
          <span className="art-star star-two">✦</span>
          <div className="art-pill pill-top">
            <span className="art-icon">
              <GraduationCap size={22} />
            </span>
            A fresh perspective
          </div>
          <div className="book-stack">
            <div className="book book-bottom">
              <span>GROW TOGETHER</span>
            </div>
            <div className="book book-middle">
              <span>A LITTLE CURIOSITY</span>
            </div>
            <div className="book book-top">
              <span>MAKE IT CLICK</span>
              <span className="book-symbol">✳</span>
            </div>
            <div className="book-pages" />
          </div>
          <div className="art-pill pill-bottom">
            <span className="art-check">
              <Check size={15} />
            </span>
            Your “aha!” moment awaits
          </div>
          <span className="art-dot dot-one" />
          <span className="art-dot dot-two" />
        </div>
      </section>
      <div className="stats-row">
        <div className="stat">
          <span className="stat-icon mint">
            <BookOpen size={20} />
          </span>
          <div>
            <strong>
              {posts?.length ?? '—'}
              <small>Active tutoring posts</small>
            </strong>
          </div>
          <span className="stat-note">
            Find your fit
            <ArrowUpRight size={14} />
          </span>
        </div>
        <div className="stat">
          <span className="stat-icon lilac">
            <CalendarDays size={20} />
          </span>
          <div>
            <strong>
              {bookings.data?.filter((b) => ['Pending', 'Accepted'].includes(b.status)).length ?? 0}
              <small>Your upcoming sessions</small>
            </strong>
          </div>
          <Link href="/bookings" className="stat-note">
            View bookings
            <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="stat">
          <span className="stat-icon peach">
            <Inbox size={20} />
          </span>
          <div>
            <strong>
              {requests.data?.filter((b) => b.status === 'Pending').length ?? 0}
              <small>Pending booking requests</small>
            </strong>
          </div>
          <Link href="/requests" className="stat-note">
            View requests
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="home-columns">
        <section className="recommendations">
          <div className="section-heading">
            <div>
              <h2>
                Find your learning connection<span className="heading-dot">.</span>
              </h2>
              <p>A little expertise, right on your campus.</p>
            </div>
            <Link href="/explore" className="text-link">
              Explore all
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="category-tabs">
            {['All subjects', ...subjects].map((s) => (
              <button
                key={s}
                className={category === s ? 'selected' : ''}
                onClick={() => setCategory(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <Notice error={error} />
          {loading ? (
            <Loading />
          ) : visible.length ? (
            <div className="posts-grid">
              {visible.map((p) => (
                <PostCard key={p._id} post={p} />
              ))}
            </div>
          ) : (
            <Empty
              title="No tutoring posts yet"
              description="Be the first to share what you know in this subject."
              href="/posts/new"
              label="Create a post"
            />
          )}
        </section>
        <aside className="home-aside">
          <section className="up-next panel">
            <div className="section-heading">
              <h3>On your calendar</h3>
              <CalendarDays size={18} />
            </div>
            {upcoming ? (
              <>
                <span className="next-label">YOUR NEXT SESSION</span>
                <h4>{upcoming.tutorPostId.title}</h4>
                <div className="next-tutor">
                  <Avatar user={upcoming.tutorUserId} size="small" />
                  with {upcoming.tutorUserId.name}
                </div>
                <div className="next-date">
                  <CalendarDays size={15} />
                  <DateLabel date={upcoming.sessionDate} />
                </div>
                <div className="next-date">
                  <Clock3 size={15} />
                  <TimeLabel time={upcoming.startTime} /> · {upcoming.duration} hour
                  {upcoming.duration !== 1 ? 's' : ''}
                </div>
                <Link href={`/bookings/${upcoming._id}`} className="button outline full">
                  View session
                  <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <div className="calendar-illustration">
                  <CalendarDays size={32} />
                  <span>✦</span>
                </div>
                <h4>Make room for an aha!</h4>
                <p>Your next learning session will show up here.</p>
                <Link href="/explore" className="text-link">
                  Find your tutor
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </section>
          <section className="knowledge-panel">
            <div className="knowledge-art">
              <BookOpen size={33} />
              <span>✦</span>
              <span>✧</span>
            </div>
            <span className="eyebrow">YOU KNOW MORE THAN YOU THINK</span>
            <h3>
              Someone could use
              <br />
              your superpower.
            </h3>
            <p>Great at a subject? Make a difference and earn a little along the way.</p>
            <Link className="button dark full" href="/posts/new">
              Share your knowledge
              <ArrowUpRight size={16} />
            </Link>
          </section>
          <div className="community-note">
            <Users size={18} />
            <p>
              One community.
              <br />
              <strong>Endless possibilities.</strong>
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
function ExplorePage() {
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState(''),
    [method, setMethod] = useState(''),
    [price, setPrice] = useState(''),
    [day, setDay] = useState(''),
    [location, setLocation] = useState(''),
    [sort, setSort] = useState('newest');
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    setQ(new URLSearchParams(window.location.search).get('q') || '');
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 250);
    return () => clearTimeout(t);
  }, [q]);
  const params = new URLSearchParams({ q: debounced, subject, method, price, day, location, sort });
  const { data, error, loading } = useResource<Post[]>('/api/posts?' + params);
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE HELP, A BIG DIFFERENCE"
        title="Find your kind of tutor."
        description="Learn from someone who’s been where you are."
      />
      <div className="explore-layout">
        <aside className="filter-panel panel">
          <h3>Refine your search</h3>
          <label>
            Subject
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Tutoring method
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="">Any method</option>
              <option>Online</option>
              <option>In-person</option>
            </select>
          </label>
          <label>
            Maximum price (THB/hour)
            <input
              type="number"
              min="0"
              max="10000"
              placeholder="Any budget"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <label>
            Available day
            <select value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">Any day</option>
              {days.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label>
            Location
            <input
              placeholder="Campus, library…"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>
          <button
            className="button outline full"
            onClick={() => {
              setQ('');
              setSubject('');
              setMethod('');
              setPrice('');
              setDay('');
              setLocation('');
            }}
          >
            Reset filters
          </button>
          <p className="filter-tip">
            <Sparkles size={16} />
            The right connection can change everything.
          </p>
        </aside>
        <section>
          <div className="explore-search">
            <Search size={20} />
            <input
              aria-label="Search posts"
              placeholder="Search a subject, topic, or skill…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="results-heading">
            <span>
              {loading ? 'Searching…' : `${data?.length || 0} tutoring posts`}
              <span> to help you move forward</span>
            </span>
            <select aria-label="Sort posts" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="price">Price: low to high</option>
            </select>
          </div>
          <Notice error={error} />
          {loading ? (
            <Loading />
          ) : data?.length ? (
            <div className="posts-grid explore-grid">
              {data.map((p) => (
                <PostCard post={p} key={p._id} />
              ))}
            </div>
          ) : (
            <Empty
              title="No matches just yet"
              description="Try another topic or adjust your filters."
            />
          )}
        </section>
      </div>
    </>
  );
}
function MyPosts() {
  const { data, error, loading } = useResource<Post[]>('/api/posts?mine=true');
  return (
    <>
      <PageHeading
        eyebrow="YOUR KNOWLEDGE, SHARED"
        title="My tutoring posts."
        description="Keep your offers up to date and help someone take the next step."
        action={
          <Link className="button primary" href="/posts/new">
            <Plus size={17} />
            Create a post
          </Link>
        }
      />
      <Notice error={error} />
      {loading ? (
        <Loading />
      ) : data?.length ? (
        <div className="posts-grid my-posts-grid">
          {data.map((p) => (
            <PostCard post={p} key={p._id} own />
          ))}
        </div>
      ) : (
        <Empty
          title="Your knowledge belongs here"
          description="Create your first tutoring post and connect with students."
          href="/posts/new"
          label="Create your first post"
        />
      )}
    </>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
