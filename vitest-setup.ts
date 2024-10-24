import { afterAll, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
});
