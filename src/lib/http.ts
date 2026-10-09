import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function fail(status: number, message: string): never {
  throw new ApiError(status, message);
}
export function route<P>(
  fn: (request: NextRequest, context: { params: Promise<P> }) => Promise<unknown>,
) {
  return async (request: NextRequest, context: { params: Promise<P> }) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        const origin = request.headers.get('origin');
        const expected =
          process.env.NODE_ENV === 'production'
            ? process.env.APP_ORIGIN || request.nextUrl.origin
            : `${request.nextUrl.protocol}//${request.headers.get('host') || request.nextUrl.host}`;
        if (origin && origin !== expected) fail(403, 'Request origin is not allowed');
      }
      const result = await fn(request, context);
      return result instanceof NextResponse
        ? result
        : NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
    } catch (error) {
      if (error instanceof ApiError)
        return NextResponse.json({ error: error.message }, { status: error.status });
      if (error instanceof ZodError)
        return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
      if (error instanceof SyntaxError)
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
      if ((error as { code?: number }).code === 11000)
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 },
        );
      console.error(
        'API request failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      return NextResponse.json(
        { error: 'Unable to complete this request. Please try again.' },
        { status: 503 },
      );
    }
  };
}
export function validId(id: string) {
  if (!/^[a-f\d]{24}$/i.test(id)) fail(404, 'Not found');
  return id;
}
