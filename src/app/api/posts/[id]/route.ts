import { route } from '@/lib/http';
import { postRead, postUpdate, postDelete } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = route(postRead);
export const PUT = route(postUpdate);
export const DELETE = route(postDelete);
