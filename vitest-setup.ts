import { afterAll, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

afterAll(() => {
  vi.clearAllMocks();
});
