import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { initSupabase, getSupabase } from '../lib/supabase';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string, role?: 'loan_officer' | 'underwriter' | 'admin') => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile & role from public.users using the session access token
  const fetchProfile = async (currentSession: Session | null, authUser?: SupabaseAuthUser) => {
    if (!currentSession && !authUser) {
      setUser(null);
      return;
    }

    try {
      const headers: Record<string, string> = {};
      if (currentSession?.access_token) {
        headers['Authorization'] = `Bearer ${currentSession.access_token}`;
      }

      const res = await fetch('/api/auth/profile', { headers });
      const json = await res.json();

      if (json?.success && json?.data) {
        setUser(json.data);
      } else if (authUser) {
        // Fallback user shape if profile lookup failed
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: authUser.user_metadata?.role || 'underwriter',
        });
      }
    } catch (err) {
      console.warn('Failed to fetch user profile from public.users:', err);
      if (authUser) {
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: authUser.user_metadata?.role || 'underwriter',
        });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function setupAuth() {
      try {
        const client = await initSupabase();

        if (client) {
          // 1. Get initial session
          const { data: { session: initialSession } } = await client.auth.getSession();
          if (isMounted) {
            setSession(initialSession);
            if (initialSession) {
              await fetchProfile(initialSession, initialSession.user);
            }
          }

          // 2. Listen to Supabase Auth state changes
          const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, newSession) => {
            if (!isMounted) return;
            setSession(newSession);
            if (newSession) {
              await fetchProfile(newSession, newSession.user);
            } else {
              setUser(null);
            }
            setLoading(false);
          });

          if (isMounted) {
            setLoading(false);
          }

          return () => {
            subscription.unsubscribe();
          };
        } else {
          // Supabase client unavailable, check for stored fallback demo user
          const savedDemoUser = localStorage.getItem('lendy_demo_user');
          if (savedDemoUser && isMounted) {
            try {
              setUser(JSON.parse(savedDemoUser));
            } catch (e) {
              // ignore
            }
          }
          if (isMounted) setLoading(false);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        const savedDemoUser = localStorage.getItem('lendy_demo_user');
        if (savedDemoUser && isMounted) {
          try {
            setUser(JSON.parse(savedDemoUser));
          } catch (e) {
            // ignore
          }
        }
        if (isMounted) setLoading(false);
      }
    }

    setupAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const client = getSupabase() || (await initSupabase());

    if (!client) {
      // Fallback demo login if Supabase credentials are not yet entered
      const demoUsers: Record<string, User> = {
        'arjun.kapoor@lendy.finance': { id: 'usr-1', name: 'Arjun Kapoor', email: 'arjun.kapoor@lendy.finance', role: 'underwriter' },
        'sunita.rao@lendy.finance': { id: 'usr-2', name: 'Sunita Rao', email: 'sunita.rao@lendy.finance', role: 'loan_officer' },
        'devon.patel@lendy.finance': { id: 'usr-3', name: 'Devon Patel', email: 'devon.patel@lendy.finance', role: 'admin' },
      };
      const found = demoUsers[email.toLowerCase()] || demoUsers['arjun.kapoor@lendy.finance'];
      setUser(found);
      localStorage.setItem('lendy_demo_user', JSON.stringify(found));
      localStorage.setItem('lendy_demo_token', `demo-session-${found.id}:${found.email}`);
      setLoading(false);
      return { success: true };
    }

    try {
      let { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // If login failed, attempt to auto-provision / confirm user via backend admin SDK
        try {
          const nameMap: Record<string, { name: string; role: 'loan_officer' | 'underwriter' | 'admin' }> = {
            'arjun.kapoor@lendy.finance': { name: 'Arjun Kapoor', role: 'underwriter' },
            'sunita.rao@lendy.finance': { name: 'Sunita Rao', role: 'loan_officer' },
            'devon.patel@lendy.finance': { name: 'Devon Patel', role: 'admin' },
          };
          const meta = nameMap[email.toLowerCase()] || { name: email.split('@')[0], role: 'underwriter' };

          await fetch('/api/auth/ensure-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email.trim(),
              password,
              name: meta.name,
              role: meta.role,
            }),
          });

          // Retry sign-in with password now that user is confirmed
          const retryRes = await client.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (!retryRes.error && retryRes.data.session) {
            data = retryRes.data;
            error = null;
          }
        } catch (e) {
          // ignore ensure-user error
        }
      }

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      setSession(data.session);
      if (data.session) {
        await fetchProfile(data.session, data.user);
      }
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Login failed.' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: 'loan_officer' | 'underwriter' | 'admin' = 'underwriter'
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    const client = getSupabase() || (await initSupabase());

    if (!client) {
      const demoUser: User = {
        id: `usr-${Date.now()}`,
        name,
        email,
        role,
      };
      setUser(demoUser);
      localStorage.setItem('lendy_demo_user', JSON.stringify(demoUser));
      localStorage.setItem('lendy_demo_token', `demo-session-${demoUser.id}:${demoUser.email}`);
      setLoading(false);
      return { success: true };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { name, role },
        },
      });

      if (error) {
        setLoading(false);
        return { success: false, error: error.message };
      }

      // Sync into public.users
      await fetch('/api/auth/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user?.id,
          name,
          email,
          role,
        }),
      });

      // If email confirmation is required and no session returned, ensure via admin API
      let activeSession = data.session;
      let activeUser = data.user;
      if (!activeSession) {
        try {
          await fetch('/api/auth/ensure-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password, name, role }),
          });
          const retry = await client.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (retry.data?.session) {
            activeSession = retry.data.session;
            activeUser = retry.data.user;
          }
        } catch (e) {
          // ignore
        }
      }

      setSession(activeSession);
      if (activeSession) {
        await fetchProfile(activeSession, activeUser || undefined);
      }
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'Signup failed.' };
    }
  };

  const signOut = async () => {
    const client = getSupabase();
    if (client) {
      await client.auth.signOut();
    }
    localStorage.removeItem('lendy_demo_user');
    localStorage.removeItem('lendy_demo_token');
    setSession(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (session) {
      await fetchProfile(session, session.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
