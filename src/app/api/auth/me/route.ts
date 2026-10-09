import { route } from '@/lib/http';
import { me } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = route(me);
