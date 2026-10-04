import { route } from '@/lib/http';
import { postsList, postCreate } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = route(postsList);
export const POST = route(postCreate);
