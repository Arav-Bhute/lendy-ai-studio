import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken, getUserProfile, isSupabaseReady } from '../db/supabase.js';
import { store } from '../db/store.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'loan_officer' | 'underwriter' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication Middleware using Supabase Auth
 * Validates the Supabase JWT token and retrieves the user profile and role from public.users
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication token required.' },
    });
  }

  // 1. Verify via Supabase Auth
  if (isSupabaseReady()) {
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      // Retrieve role from public.users table
      const profile = await getUserProfile(supabaseUser.email || supabaseUser.id);
      req.user = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        role: profile?.role || supabaseUser.user_metadata?.role || 'underwriter',
      };
      return next();
    }
  }

  // 2. Demo token check (for mock / fallback mode)
  if (token.startsWith('mock-jwt-token-') || token.startsWith('demo-session-') || token === 'demo-token') {
    let matchedUser = Array.from(store.users.values())[0];
    if (token.includes(':')) {
      const emailOrRole = token.split(':')[1]?.toLowerCase();
      const found = Array.from(store.users.values()).find(
        u => u.email.toLowerCase() === emailOrRole || u.role === emailOrRole
      );
      if (found) matchedUser = found;
    }
    req.user = {
      id: matchedUser.id,
      email: matchedUser.email,
      name: matchedUser.name,
      role: matchedUser.role,
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: { code: 'INVALID_TOKEN', message: 'Invalid or expired authentication session.' },
  });
}

/**
 * Role-based authorization middleware
 */
export function requireRole(allowedRoles: Array<'loan_officer' | 'underwriter' | 'admin'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role "${req.user.role}" does not have permission.`,
        },
      });
    }

    next();
  };
}
