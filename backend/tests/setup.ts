import { beforeAll, afterAll } from 'vitest';
import { closeDb } from '../src/config/db.js';

beforeAll(async () => {
  // Setup fixtures, mock data, etc.
});

afterAll(async () => {
  await closeDb();
});
