import type { Request, Response, NextFunction } from "express";
import { vi } from "vitest";

// disable auth
export const disableAuth = vi.fn(
  async (_req: Request, _res: Response, next: NextFunction) => next()
);
