import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export async function createContext(opts: CreateExpressContextOptions) {
  return {
    session: null, // We would get the session from a session middleware here
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;