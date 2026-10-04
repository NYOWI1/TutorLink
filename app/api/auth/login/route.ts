import { route } from '@/lib/http';
import { login } from '@/lib/api';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const POST = route(login);
