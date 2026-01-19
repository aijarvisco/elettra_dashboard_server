import { clerkMiddleware, requireAuth } from '@clerk/express'
import type { Request, Response, NextFunction } from 'express'

export const clerkAuthMiddleware = clerkMiddleware()

export const requireAuthMiddleware = requireAuth()

export const handleAuthError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err.name === 'UnauthorizedError' || err.message.includes('Unauthenticated')) {
    res.status(401).json({ error: 'Unauthorized', code: '401' })
    return
  }
  next(err)
}
