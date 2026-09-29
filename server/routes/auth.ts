import { Router } from 'express';
import {
  verifySupabaseToken,
  getUserProfile,
  syncUserProfile,
  provisionDemoAuthUsers,
  isSupabaseReady,
  getSupabase,
} from '../db/supabase.js';
import { store } from '../db/store.js';

export const authRouter = Router();

// GET /api/auth/config - Provide public Supabase credentials to frontend safely
authRouter.get('/config', (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  res.json({
    success: true,
    data: {
      supabaseUrl,
      supabaseAnonKey,
      isConfigured: Boolean(supabaseUrl && supabaseAnonKey),
    },
  });
});

// GET /api/auth/profile - Retrieve authenticated user's profile and role from public.users
authRouter.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Bearer token required' },
    });
  }

  // 1. Verify via Supabase Auth
  if (isSupabaseReady()) {
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      // Look up public.users record
      let profile = await getUserProfile(supabaseUser.email || supabaseUser.id);
      if (!profile) {
        // Sync profile into public.users if first time login
        const defaultRole = (supabaseUser.user_metadata?.role as any) || 'underwriter';
        const name = supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User';
        profile = await syncUserProfile({
          id: supabaseUser.id,
          name,
          email: supabaseUser.email || '',
          role: defaultRole,
        });
      }

      return res.json({
        success: true,
        data: profile || {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          email: supabaseUser.email,
          role: supabaseUser.user_metadata?.role || 'underwriter',
        },
      });
    }
  }

  // 2. Fallback to mock store
  const defaultUser = Array.from(store.users.values())[0];
  res.json({
    success: true,
    data: defaultUser,
  });
});

// POST /api/auth/sync-profile - Sync user profile into public.users
authRouter.post('/sync-profile', async (req, res) => {
  const { id, name, email, role } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Email is required' },
    });
  }

  if (isSupabaseReady()) {
    const updated = await syncUserProfile({
      id,
      name: name || email.split('@')[0],
      email,
      role: role || 'underwriter',
    });
    return res.json({
      success: true,
      data: updated,
    });
  }

  const existing = Array.from(store.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
  const user = existing || {
    id: id || `usr-${Date.now()}`,
    name: name || email.split('@')[0],
    email,
    role: role || 'underwriter',
  };
  store.users.set(user.id, user);

  res.json({
    success: true,
    data: user,
  });
});

// POST /api/auth/ensure-user - Auto-provision or confirm user via Supabase Auth admin SDK
authRouter.post('/ensure-user', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: { message: 'Email and password required' } });
  }

  if (isSupabaseReady()) {
    const client = getSupabase();
    if (client?.auth?.admin) {
      try {
        await client.auth.admin.createUser({
          email: email.trim(),
          password,
          email_confirm: true,
          user_metadata: {
            name: name || email.split('@')[0],
            role: role || 'underwriter',
          },
        });
      } catch (err: any) {
        // User may already exist
      }
    }
    await syncUserProfile({
      name: name || email.split('@')[0],
      email: email.trim(),
      role: role || 'underwriter',
    });
  }

  res.json({ success: true });
});

// POST /api/auth/seed-demo - Provision demo users in Supabase Auth
authRouter.post('/seed-demo', async (req, res) => {
  if (isSupabaseReady()) {
    await provisionDemoAuthUsers();
  }
  res.json({
    success: true,
    message: 'Demo users provisioned with password: Lendy@Demo2026!',
  });
});

// GET /api/auth/me - Legacy compatibility
authRouter.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token && isSupabaseReady()) {
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      const profile = await getUserProfile(supabaseUser.email || supabaseUser.id);
      return res.json({
        success: true,
        data: profile || {
          id: supabaseUser.id,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          email: supabaseUser.email,
          role: supabaseUser.user_metadata?.role || 'underwriter',
        },
      });
    }
  }

  const user = Array.from(store.users.values())[0];
  res.json({
    success: true,
    data: user,
  });
});
