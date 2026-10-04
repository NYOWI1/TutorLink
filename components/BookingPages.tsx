'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MessageSquare,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import {
  api,
  useResource,
  Loading,
  Notice,
  Empty,
  Avatar,
  Status,
  DateLabel,
  TimeLabel,
  Money,
  Modal,
} from './ui';
import { PageHeading, useSession } from './TutorLinkApp';
import { BookingForm } from './PostPages';
import type { Booking, Post } from '@/lib/types';
export function BookingsPage({ requests = false }: { requests?: boolean }) {
  const { data, error, loading, reload } = useResource<Booking[]>(
    '/api/bookings' + (requests ? '?role=tutor' : ''),
  );
  const [status, setStatus] = useState('All');
  const filtered = data?.filter((b) => status === 'All' || b.status === status) || [];
  return (
    <>
      <PageHeading
        eyebrow={requests ? 'A CHANCE TO MAKE A DIFFERENCE' : 'YOUR NEXT STEPS, ALL IN ONE PLACE'}
        title={requests ? 'Your booking requests.' : 'My learning sessions.'}
        description={
          requests
            ? 'Someone’s next breakthrough could start with you.'
            : 'Keep track of your sessions and your progress.'
        }
      />
      <div className="booking-tabs">
        {['All', 'Pending', 'Accepted', 'Completed', 'Cancelled', 'Rejected'].map((s) => (
          <button key={s} className={status === s ? 'selected' : ''} onClick={() => setStatus(s)}>
            {s}
            {s === 'All' && <span>{data?.length || 0}</span>}
          </button>
        ))}
      </div>
      <Notice error={error} />
      {loading ? (
        <Loading />
      ) : filtered.length ? (
        <div className="booking-list">
          {filtered.map((b) => (
            <BookingRow key={b._id} booking={b} requests={requests} reload={reload} />
          ))}
        </div>
      ) : (
        <Empty
          title={
            status === 'All'
              ? requests
                ? 'No requests just yet'
                : 'Your next chapter is waiting'
              : `No ${status.toLowerCase()} sessions`
          }
          description={
            requests
              ? 'Keep your tutoring posts active and make your availability clear.'
              : 'Find a peer tutor and take a step toward your next goal.'
          }
          href={requests ? '/posts/mine' : '/explore'}
          label={requests ? 'Manage your posts' : 'Find a tutor'}
        />
      )}
    </>
  );
}
function BookingRow({
  booking: b,
  requests,
  reload,
}: {
  booking: Booking;
  requests: boolean;
  reload: () => void;
}) {
  const peer = requests ? b.studentUserId : b.tutorUserId;
  return (
    <article className="booking-row panel">
      <div className="booking-date-block">
        <strong>{new Date(b.sessionDate + 'T12:00:00Z').getUTCDate()}</strong>
        <span>
          {new Date(b.sessionDate + 'T12:00:00Z').toLocaleDateString('en-US', {
            month: 'short',
            timeZone: 'UTC',
          })}
        </span>
      </div>
      <div className="booking-row-info">
        <Status value={b.status} />
        <Link href={'/bookings/' + b._id}>
          <h3>{b.tutorPostId?.title || 'Tutoring session'}</h3>
        </Link>
        <div className="booking-row-meta">
          <span>
            <Avatar user={peer} size="tiny" />
            {requests ? 'Student:' : 'With'} {peer?.name || 'Former member'}
          </span>
          <span>
            <Clock3 size={14} />
            <TimeLabel time={b.startTime} /> · {b.duration}h · ICT
          </span>
        </div>
        {b.message && requests && <p className="booking-message">“{b.message}”</p>}
      </div>
      <div className="booking-row-actions">
        <strong className="price">
          <Money value={b.pricePerHour * b.duration} />
        </strong>
        <Link href={'/bookings/' + b._id} className="button outline">
          View details
          <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
export function BookingDetail({ id }: { id: string }) {
  const { user, notify } = useSession();
  const router = useRouter();
  const { data: b, error, loading, reload } = useResource<Booking>('/api/bookings/' + id);
  const [actionError, setActionError] = useState(''),
    [busy, setBusy] = useState(false),
    [modal, setModal] = useState('');
  const postResource = useResource<Post>(b?.tutorPostId ? '/api/posts/' + b.tutorPostId._id : null);
  if (loading) return <Loading />;
  if (!b)
    return (
      <>
        <Notice error={error} />
        <Empty
          title="Booking unavailable"
          description="You can view sessions involving your account."
          href="/bookings"
          label="My bookings"
        />
      </>
    );
  const tutor = b.tutorUserId._id === user?._id;
  const peer = tutor ? b.studentUserId : b.tutorUserId;
  const ended =
    Date.now() >=
    new Date(`${b.sessionDate}T${b.startTime}:00+07:00`).getTime() + b.duration * 3600000;
  async function update(status: string) {
    setBusy(true);
    setActionError('');
    try {
      await api('/api/bookings/' + id, { method: 'PUT', body: JSON.stringify({ status }) });
      setModal('');
      reload();
      notify('Booking ' + status.toLowerCase());
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    setBusy(true);
    setActionError('');
    try {
      await api('/api/bookings/' + id, { method: 'DELETE' });
      notify('Booking deleted');
      router.push('/bookings');
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link href={tutor ? '/requests' : '/bookings'} className="back-link">
        <ArrowLeft size={15} />
        {tutor ? 'Booking requests' : 'My bookings'}
      </Link>
      <PageHeading
        eyebrow="EVERY CONNECTION IS A STEP FORWARD"
        title="Your session, at a glance."
        description="All the details for your learning connection."
      />
      <div className="detail-layout">
        <section className="booking-detail panel">
          <Status value={b.status} />
          <h2>{b.tutorPostId?.title || 'Tutoring session'}</h2>
          <Link href={'/profile/' + peer._id} className="detail-tutor">
            <Avatar user={peer} />
            <div>
              <strong>{peer.name}</strong>
              <span>
                {tutor ? 'Your student' : 'Your peer tutor'} · {peer.major}
              </span>
            </div>
            <ArrowRight size={17} />
          </Link>
          <div className="detail-divider" />
          <div className="detail-facts">
            <div>
              <CalendarDays size={20} />
              <span>
                <small>SESSION DATE</small>
                <DateLabel date={b.sessionDate} />
              </span>
            </div>
            <div>
              <Clock3 size={20} />
              <span>
                <small>START TIME · ICT</small>
                <TimeLabel time={b.startTime} />
              </span>
            </div>
            <div>
              <Clock3 size={20} />
              <span>
                <small>DURATION</small>
                {b.duration} hour{b.duration !== 1 ? 's' : ''}
              </span>
            </div>
            <div>
              <MessageSquare size={20} />
              <span>
                <small>TUTORING METHOD</small>
                {b.tutorPostId?.tutoringMethod}
              </span>
            </div>
          </div>
          <h3>A note from the student</h3>
          <p className="description-full">{b.message || 'No message added.'}</p>
          {b.tutorPostId && (
            <Link href={'/posts/' + b.tutorPostId._id} className="text-link">
              View tutoring post
              <ArrowRight size={15} />
            </Link>
          )}
        </section>
        <aside>
          <section className="booking-sidebar panel">
            <span className="eyebrow">SESSION SUMMARY</span>
            <div className="booking-total">
              <span>
                {b.duration}h × ฿{b.pricePerHour}/hour
              </span>
              <strong>
                <Money value={b.pricePerHour * b.duration} />
              </strong>
            </div>
            <p className="help-text">Arrange payment directly with your tutor.</p>
            <div className="detail-divider" />
            <Notice error={actionError} />
            {tutor && b.status === 'Pending' && (
              <>
                <button
                  className="button primary full"
                  disabled={busy}
                  onClick={() => update('Accepted')}
                >
                  <Check size={17} />
                  Accept request
                </button>
                <button
                  className="button outline full"
                  disabled={busy}
                  onClick={() => setModal('Rejected')}
                >
                  <X size={17} />
                  Reject request
                </button>
              </>
            )}
            {tutor && b.status === 'Accepted' && (
              <>
                <button
                  className="button primary full"
                  disabled={busy || !ended}
                  onClick={() => update('Completed')}
                >
                  <Check size={17} />
                  Mark completed
                </button>
                {!ended && <p className="help-text">Available after the scheduled session ends.</p>}
              </>
            )}
            {!tutor && b.status === 'Pending' && (
              <button
                className="button outline full"
                disabled={!postResource.data}
                onClick={() => setModal('edit')}
              >
                <Pencil size={16} />
                Edit booking
              </button>
            )}
            {!tutor && ['Pending', 'Accepted'].includes(b.status) && (
              <button className="button danger-outline full" onClick={() => setModal('Cancelled')}>
                Cancel booking
              </button>
            )}
            {!tutor && ['Cancelled', 'Rejected', 'Completed'].includes(b.status) && (
              <button className="button danger-outline full" onClick={() => setModal('delete')}>
                <Trash2 size={16} />
                Delete booking
              </button>
            )}
            <p className="booking-status-explainer">
              {b.status === 'Pending'
                ? 'Your request is waiting for the tutor’s response.'
                : b.status === 'Accepted'
                  ? 'You’re all set. Make a note of your session time.'
                  : b.status === 'Completed'
                    ? 'Another step forward. Keep your curiosity going.'
                    : 'This session is no longer active.'}
            </p>
          </section>
        </aside>
      </div>
      {modal === 'edit' && postResource.data && (
        <Modal title="Update your session" onClose={() => setModal('')}>
          <BookingForm
            post={postResource.data}
            existing={b}
            onDone={() => {
              setModal('');
              reload();
              notify('Booking updated');
            }}
          />
        </Modal>
      )}
      {modal && modal !== 'edit' && (
        <Modal
          title={
            modal === 'delete'
              ? 'Delete this booking?'
              : modal === 'Rejected'
                ? 'Reject this request?'
                : 'Cancel this session?'
          }
          onClose={() => setModal('')}
        >
          <p>
            {modal === 'delete'
              ? 'This permanently removes the booking record for both participants.'
              : 'The other participant will see the updated status in their bookings.'}
          </p>
          <Notice error={actionError} />
          <div className="form-actions">
            <button className="button outline" onClick={() => setModal('')}>
              Go back
            </button>
            <button
              className="button danger"
              disabled={busy}
              onClick={() => (modal === 'delete' ? remove() : update(modal))}
            >
              {busy
                ? 'Updating…'
                : modal === 'delete'
                  ? 'Delete booking'
                  : modal === 'Rejected'
                    ? 'Reject request'
                    : 'Cancel session'}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
