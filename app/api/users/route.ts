import { route } from '@/lib/http';
import { usersList, register } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = route(usersList);
export const POST = route(register);
