import { expect, test } from 'bun:test';
import { createContext } from './context';
import { createCaller } from './router';
import { updateSchema } from './schemas';

test('swipe saves data to database', async () => {
  const ctx = await createContext();
  const caller = createCaller(ctx);

  const data = await caller.get();

  const result = updateSchema.safeParse(data);

  expect(result.data?.status).toBe('active');
  expect(result.data?.id).toBe(4);
});
