import { clerkMiddleware, getAuth } from '@clerk/express'
import type { Request, Response, NextFunction } from 'express'

export const clerkAuthMiddleware = clerkMiddleware()

// Custom requireAuth middleware that returns proper 401 JSON response
// instead of Clerk's default redirect behavior in development mode
export const requireAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const auth = getAuth(req)

  if (!auth || !auth.userId) {
    res.status(401).json({ error: 'Unauthorized', code: '401' })
    return
  }

  next()
}

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
