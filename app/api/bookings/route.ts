import { route } from '@/lib/http';
import { bookingsList, bookingCreate } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = route(bookingsList);
export const POST = route(bookingCreate);
