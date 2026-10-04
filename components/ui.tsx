'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Monitor,
  BookOpen,
  X,
  LoaderCircle,
} from 'lucide-react';
import Link from 'next/link';
import { appUrl } from '@/lib/paths';
import type { User, Post } from '@/lib/types';
export async function api<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(appUrl(url), {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
export function useResource<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(url));
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError('');
    api<T>(url)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [url, version]);
  return { data, error, loading, reload: () => setVersion((v) => v + 1), setData };
}
export function Avatar({ user, size = 'normal' }: { user?: Partial<User>; size?: string }) {
  const initials = (user?.name || 'Guest')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');
  const colors = ['mint', 'peach', 'lilac', 'blue'];
  const color = colors[(user?.name?.charCodeAt(0) || 0) % 4];
  return (
    <span className={`avatar ${color} ${size}`}>
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt={user.name || 'Profile'}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        initials
      )}
    </span>
  );
}
export function Money({ value }: { value: number }) {
  return (
    <>
      <span className="currency">฿</span>
      {value.toLocaleString('en-US')}
    </>
  );
}
export function Notice({ error }: { error: string }) {
  return error ? (
    <div className="notice error" role="alert">
      {error}
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={23} /> Finding your next connection…
    </div>
  );
}
export function Empty({
  title,
  description,
  href,
  label,
}: {
  title: string;
  description: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <BookOpen size={30} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {href && (
        <Link className="button primary" href={href}>
          {label}
        </Link>
      )}
    </div>
  );
}
export function PostCard({ post, own = false }: { post: Post; own?: boolean }) {
  return (
    <article className="post-card">
      <div className="card-top">
        <span className={`subject-badge ${post.subject.toLowerCase()}`}>
          <BookOpen size={13} />
          {post.subject}
        </span>
        <span className={`method-dot ${post.status === 'Inactive' ? 'inactive' : ''}`}>
          {post.status === 'Inactive' ? 'Inactive' : post.tutoringMethod}
        </span>
      </div>
      <Link href={`/posts/${post._id}`} className="card-title">
        <h3>{post.title}</h3>
      </Link>
      <p className="card-description">{post.description}</p>
      <div className="tutor-line">
        <Avatar user={post.userId} />
        <div>
          <Link href={`/profile/${post.userId._id}`} className="tutor-name">
            {post.userId.name}
          </Link>
          <span>{post.userId.major || post.userId.university || 'University peer'}</span>
        </div>
      </div>
      <div className="card-meta">
        <span>
          <MapPin size={14} />
          {post.location || 'Learn from anywhere'}
        </span>
        <span>
          <CalendarDays size={14} />
          {post.availableDays
            .slice(0, 3)
            .map((d) => d.slice(0, 3))
            .join(', ')}
          {post.availableDays.length > 3 ? ' + more' : ''}
        </span>
      </div>
      <div className="card-bottom">
        <div className="price">
          <Money value={post.pricePerHour} />
          <span> / hour</span>
        </div>
        <Link href={own ? `/posts/${post._id}/edit` : `/posts/${post._id}`} className="card-link">
          {own ? 'Manage post' : 'View details'}
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = [
          ...document.querySelectorAll<HTMLElement>(
            '.modal button, .modal input, .modal a, .modal select, .modal textarea',
          ),
        ].filter((n) => !n.hasAttribute('disabled'));
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', handle);
    document.querySelector<HTMLButtonElement>('.modal-close')?.focus();
    return () => {
      document.removeEventListener('keydown', handle);
      prior?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <button className="icon-button modal-close" aria-label="Close dialog" onClick={onClose}>
          <X size={20} />
        </button>
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}
export function DateLabel({ date }: { date: string }) {
  return (
    <time dateTime={date}>
      {new Date(date + 'T12:00:00+07:00').toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </time>
  );
}
export function TimeLabel({ time }: { time: string }) {
  return (
    <time dateTime={time}>
      {new Date('2000-01-01T' + time + ':00').toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}
    </time>
  );
}
export function Status({ value }: { value: string }) {
  return (
    <span className={`status ${value.toLowerCase()}`}>
      <i />
      {value}
    </span>
  );
}
