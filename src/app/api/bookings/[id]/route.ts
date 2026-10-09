import { route } from '@/lib/http';
import { bookingRead, bookingUpdate, bookingDelete } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = route(bookingRead);
export const PUT = route(bookingUpdate);
export const DELETE = route(bookingDelete);
