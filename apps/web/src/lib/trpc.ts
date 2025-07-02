import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../server/src/router';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    {
      url: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8787/trpc',
    },
  ],
}); 