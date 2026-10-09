import { route } from '@/lib/http';
import { userRead, userUpdate, userDelete } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = route(userRead);
export const PUT = route(userUpdate);
export const DELETE = route(userDelete);
