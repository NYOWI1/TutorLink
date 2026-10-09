'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  MapPin,
  Monitor,
  Pencil,
  Trash2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  api,
  Avatar,
  Money,
  Loading,
  useResource,
  Notice,
  Empty,
  Modal,
  TimeLabel,
  Status,
} from './ui';
import { PageHeading, useSession } from './TutorLinkApp';
import { days, subjects } from '@/lib/validation';
import type { Post } from '@/lib/types';
export function PostForm({ id }: { id?: string }) {
  const { data, error: loadError, loading } = useResource<Post>(id ? '/api/posts/' + id : null);
  if (id && loading) return <Loading />;
  if (id && !data) return <Notice error={loadError} />;
  return <PostEditor key={id || 'new'} post={data || undefined} />;
}
function PostEditor({ post }: { post?: Post }) {
  const { user, notify } = useSession();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    post?.availableDays || ['Monday', 'Wednesday', 'Friday'],
  );
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  if (post && post.userId._id !== user?._id)
    return (
      <Empty
        title="This isn’t your tutoring post"
        description="You can manage the posts you create."
        href="/posts/mine"
        label="My posts"
      />
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const f = new FormData(e.currentTarget);
    const body = {
      ...Object.fromEntries(f),
      availableDays: selected,
      availableTimes: { start: f.get('start'), end: f.get('end') },
    };
    try {
      const p = await api<Post>(post ? '/api/posts/' + post._id : '/api/posts', {
        method: post ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      notify(post ? 'Your tutoring post has been updated' : 'Your tutoring post is live!');
      router.push('/posts/' + p._id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link href="/posts/mine" className="back-link">
        <ArrowLeft size={15} />
        My tutoring posts
      </Link>
      <PageHeading
        eyebrow="SOMEONE COULD USE YOUR SUPERPOWER"
        title={post ? 'Give your post a refresh.' : 'Share what you know.'}
        description="A clear, friendly offer is the start of a great learning connection."
      />
      <div className="editor-layout">
        <form className="form-panel panel" onSubmit={submit}>
          <Notice error={error} />
          <h3>
            <span className="step-number">1</span>Your tutoring offer
          </h3>
          <label>
            Post title
            <input
              name="title"
              defaultValue={post?.title}
              required
              minLength={5}
              maxLength={120}
              placeholder="e.g. Java & OOP, made simple"
            />
          </label>
          <div className="form-grid">
            <label>
              Subject
              <select name="subject" defaultValue={post?.subject || 'Programming'}>
                {subjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Price per hour (THB)
              <input
                type="number"
                name="pricePerHour"
                defaultValue={post?.pricePerHour ?? 250}
                required
                min={0}
                max={10000}
                step="1"
              />
            </label>
          </div>
          <label>
            Description
            <textarea
              name="description"
              rows={5}
              defaultValue={post?.description}
              required
              minLength={20}
              maxLength={3000}
              placeholder="Tell students what you can help with, who it’s for, and how you like to teach."
            />
          </label>
          <h3>
            <span className="step-number">2</span>Where & when
          </h3>
          <div className="form-grid">
            <label>
              Tutoring method
              <select
                name="tutoringMethod"
                defaultValue={post?.tutoringMethod || 'Online & In-person'}
              >
                <option>Online</option>
                <option>In-person</option>
                <option>Online & In-person</option>
              </select>
            </label>
            <label>
              Location
              <input
                name="location"
                defaultValue={post?.location}
                maxLength={160}
                placeholder="e.g. AU Library / Google Meet"
              />
            </label>
          </div>
          <fieldset>
            <legend>
              Available days <span className="required">*</span>
            </legend>
            <div className="day-picker">
              {days.map((d) => (
                <label key={d} className={selected.includes(d) ? 'checked' : ''}>
                  <input
                    type="checkbox"
                    checked={selected.includes(d)}
                    onChange={() =>
                      setSelected((s) => (s.includes(d) ? s.filter((x) => x !== d) : [...s, d]))
                    }
                  />
                  {d.slice(0, 3)}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="form-grid">
            <label>
              Available from
              <input
                name="start"
                type="time"
                defaultValue={post?.availableTimes.start || '09:00'}
                required
              />
            </label>
            <label>
              Available until
              <input
                name="end"
                type="time"
                defaultValue={post?.availableTimes.end || '18:00'}
                required
              />
            </label>
          </div>
          <p className="help-text">
            All session times are in Bangkok time (ICT, UTC+7). This window applies to each selected
            day.
          </p>
          <label>
            Post status
            <select name="status" defaultValue={post?.status || 'Active'}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <span className="help-text">Inactive posts are hidden from the marketplace.</span>
          </label>
          <div className="form-actions">
            <Link className="button outline" href="/posts/mine">
              Cancel
            </Link>
            <button className="button primary" disabled={busy}>
              {busy ? 'Saving…' : post ? 'Save changes' : 'Publish tutoring post'}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </form>
        <aside>
          <section className="editor-tip panel">
            <span className="tip-symbol">✦</span>
            <h3>
              A great post starts
              <br />
              with a little clarity.
            </h3>
            <p>You don’t need to know everything. Just be a few steps ahead and ready to help.</p>
            <ul>
              <li>Be specific about the topics you teach.</li>
              <li>Tell students what level you can help with.</li>
              <li>Keep your availability up to date.</li>
              <li>Pick a price that feels fair to you.</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
export function PostDetail({ id }: { id: string }) {
  const { user, notify } = useSession();
  const router = useRouter();
  const { data: post, error, loading } = useResource<Post>('/api/posts/' + id);
  const [booking, setBooking] = useState(false),
    [deleting, setDeleting] = useState(false),
    [actionError, setActionError] = useState(''),
    [busy, setBusy] = useState(false);
  if (loading) return <Loading />;
  if (!post)
    return (
      <>
        <Notice error={error} />
        <Empty
          title="This post is unavailable"
          description="Explore the marketplace to find another learning connection."
          href="/explore"
          label="Explore tutors"
        />
      </>
    );
  const own = post.userId._id === user?._id;
  async function remove() {
    setBusy(true);
    setActionError('');
    try {
      await api('/api/posts/' + id, { method: 'DELETE' });
      notify('Tutoring post deleted');
      router.push('/posts/mine');
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link href={own ? '/posts/mine' : '/explore'} className="back-link">
        <ArrowLeft size={15} />
        {own ? 'My posts' : 'Back to explore'}
      </Link>
      <div className="detail-layout">
        <section>
          <article className="post-detail panel">
            <div className="detail-badges">
              <span className={`subject-badge ${post.subject.toLowerCase()}`}>
                <BookOpen size={14} />
                {post.subject}
              </span>
              <Status value={post.status} />
            </div>
            <h1>{post.title}</h1>
            <Link href={'/profile/' + post.userId._id} className="detail-tutor">
              <Avatar user={post.userId} />
              <div>
                <strong>{post.userId.name}</strong>
                <span>
                  {post.userId.major} · Year {post.userId.yearOfStudy}
                </span>
              </div>
              <ArrowUpRight size={17} />
            </Link>
            <div className="detail-divider" />
            <h3>Let’s make it click</h3>
            <p className="description-full">{post.description}</p>
            <h3>How we’ll learn</h3>
            <div className="detail-facts">
              <div>
                <Monitor size={20} />
                <span>
                  <small>TUTORING METHOD</small>
                  {post.tutoringMethod}
                </span>
              </div>
              <div>
                <MapPin size={20} />
                <span>
                  <small>LOCATION</small>
                  {post.location || 'Learn from anywhere'}
                </span>
              </div>
              <div>
                <CalendarDays size={20} />
                <span>
                  <small>AVAILABLE DAYS</small>
                  {post.availableDays.join(', ')}
                </span>
              </div>
              <div>
                <Clock3 size={20} />
                <span>
                  <small>AVAILABLE HOURS · ICT</small>
                  <span>
                    <TimeLabel time={post.availableTimes.start} /> –{' '}
                    <TimeLabel time={post.availableTimes.end} />
                  </span>
                </span>
              </div>
            </div>
          </article>
          <section className="about-tutor panel">
            <h3>Meet your peer tutor</h3>
            <div className="tutor-line">
              <Avatar user={post.userId} />
              <div>
                <strong>{post.userId.name}</strong>
                <span>{post.userId.university || 'University peer'}</span>
              </div>
            </div>
            <p>{post.userId.bio || 'Connect with your tutor to talk about your learning goals.'}</p>
            <Link href={'/profile/' + post.userId._id} className="text-link">
              View full profile
              <ArrowUpRight size={15} />
            </Link>
          </section>
        </section>
        <aside>
          <div className="booking-sidebar panel">
            <span className="eyebrow">A STEP TOWARD YOUR NEXT AHA!</span>
            <div className="detail-price">
              <Money value={post.pricePerHour} />
              <span> / hour</span>
            </div>
            <p>Personal guidance. A pace that’s yours.</p>
            <div className="detail-divider" />
            {own ? (
              <>
                <Link href={'/posts/' + id + '/edit'} className="button primary full">
                  <Pencil size={16} />
                  Edit tutoring post
                </Link>
                <button className="button danger-outline full" onClick={() => setDeleting(true)}>
                  <Trash2 size={16} />
                  Delete post
                </button>
                <p className="help-text">You’re viewing your own tutoring post.</p>
              </>
            ) : (
              <>
                <button
                  className="button primary full"
                  disabled={post.status !== 'Active'}
                  onClick={() =>
                    user
                      ? setBooking(true)
                      : router.push('/login?next=' + encodeURIComponent('/posts/' + id))
                  }
                >
                  Book a session
                  <ArrowRight size={17} />
                </button>
                <div className="booking-note">
                  <ShieldCheck size={17} />
                  <span>Your tutor will confirm your request. No payment is collected here.</span>
                </div>
              </>
            )}
          </div>
          <div className="detail-quote">
            “A little help can make
            <br />a big difference.”<span>THAT’S THE TUTORLINK WAY</span>
          </div>
        </aside>
      </div>
      {booking && (
        <Modal title="Your next breakthrough" onClose={() => setBooking(false)}>
          <BookingForm
            post={post}
            onDone={(booking) => {
              setBooking(false);
              notify('Session requested! Your tutor will respond soon.');
              router.push('/bookings/' + booking._id);
            }}
          />
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete this tutoring post?" onClose={() => setDeleting(false)}>
          <p>
            This removes the post and its resolved booking history. Posts with active bookings must
            be resolved first.
          </p>
          <Notice error={actionError} />
          <div className="form-actions">
            <button className="button outline" onClick={() => setDeleting(false)}>
              Keep post
            </button>
            <button className="button danger" disabled={busy} onClick={remove}>
              {busy ? 'Deleting…' : 'Delete post'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function BookingForm({
  post,
  existing,
  onDone,
}: {
  post: Post;
  existing?: any;
  onDone: (booking: any) => void;
}) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [duration, setDuration] = useState(existing?.duration || 1);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    try {
      const result = await api(existing ? '/api/bookings/' + existing._id : '/api/bookings', {
        method: existing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...Object.fromEntries(form), tutorPostId: post._id, duration }),
      });
      onDone(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <p className="booking-form-intro">
        {post.title}
        <br />
        <span>with {post.userId?.name || 'your tutor'}</span>
      </p>
      <div className="availability-info">
        <CalendarDays size={16} />
        <span>
          {post.availableDays.join(', ')}
          <br />
          <TimeLabel time={post.availableTimes.start} /> –{' '}
          <TimeLabel time={post.availableTimes.end} /> · Bangkok time
        </span>
      </div>
      <Notice error={error} />
      <div className="form-grid">
        <label>
          Session date
          <input
            type="date"
            name="sessionDate"
            defaultValue={existing?.sessionDate}
            required
            min={today}
          />
        </label>
        <label>
          Start time
          <input
            type="time"
            name="startTime"
            defaultValue={existing?.startTime || post.availableTimes.start}
            required
          />
        </label>
      </div>
      <label>
        Duration
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
          {[0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8].map((d) => (
            <option key={d} value={d}>
              {d} hour{d !== 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </label>
      <label>
        A note for your tutor
        <textarea
          name="message"
          rows={3}
          defaultValue={existing?.message}
          maxLength={1000}
          placeholder="What would you like help with?"
        />
      </label>
      <div className="booking-total">
        <span>Session total</span>
        <strong>
          <Money value={(existing?.pricePerHour ?? post.pricePerHour) * duration} />
        </strong>
      </div>
      <p className="help-text">
        Arrange any payment directly with your tutor. TutorLink does not process payments.
      </p>
      <button className="button primary full" disabled={busy}>
        {busy ? 'Sending…' : existing ? 'Save booking changes' : 'Request session'}
        <ArrowRight size={17} />
      </button>
    </form>
  );
}
