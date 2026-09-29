import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

let serverSupabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  serverSupabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  console.log('✅ Connected to Supabase backend:', supabaseUrl);
} else {
  console.log('ℹ️ Supabase environment variables not configured. Operating in high-fidelity fallback mode.');
}

export const getSupabase = (): SupabaseClient | null => {
  return serverSupabaseClient;
};

export const isSupabaseReady = (): boolean => {
  return Boolean(serverSupabaseClient);
};

export const LOAN_DOCUMENTS_BUCKET = 'loan-documents';

/**
 * Ensures the `loan-documents` storage bucket exists in Supabase.
 */
export async function ensureLoanDocumentsBucket(): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    if (listError) {
      console.warn('Could not list Supabase storage buckets:', listError.message);
      return false;
    }

    const bucketExists = buckets?.some((b) => b.id === LOAN_DOCUMENTS_BUCKET || b.name === LOAN_DOCUMENTS_BUCKET);
    if (!bucketExists) {
      const { error: createError } = await client.storage.createBucket(LOAN_DOCUMENTS_BUCKET, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      if (createError) {
        console.warn('Could not create storage bucket:', createError.message);
        return false;
      }
      console.log(`✅ Supabase Storage bucket "${LOAN_DOCUMENTS_BUCKET}" created successfully.`);
    }
    return true;
  } catch (err: any) {
    console.warn('Error verifying Supabase storage bucket:', err.message);
    return false;
  }
}

/**
 * Validates a Supabase JWT token received from client Authorization header
 */
export async function verifySupabaseToken(token: string) {
  const client = getSupabase();
  if (!client || !token) return null;

  try {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user;
  } catch (err: any) {
    console.warn('Error verifying Supabase token:', err.message);
    return null;
  }
}

/**
 * Retrieves user profile & role from public.users table
 */
export async function getUserProfile(identifier: string) {
  const client = getSupabase();
  if (!client || !identifier) return null;

  try {
    const isEmail = identifier.includes('@');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    let query = client.from('users').select('id, name, email, role, created_at');
    if (isEmail) {
      query = query.ilike('email', identifier.trim());
    } else if (isUuid) {
      query = query.eq('id', identifier.trim());
    } else {
      query = query.ilike('email', identifier.trim());
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.warn('Error querying public.users:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Failed to retrieve user profile:', err.message);
    return null;
  }
}

/**
 * Syncs authenticated Supabase user profile into public.users
 */
export async function syncUserProfile(profile: {
  id?: string;
  name: string;
  email: string;
  role?: 'loan_officer' | 'underwriter' | 'admin';
}) {
  const client = getSupabase();
  if (!client) return null;

  try {
    const role = profile.role || 'underwriter';
    const payload: any = {
      name: profile.name,
      email: profile.email.toLowerCase().trim(),
      role,
    };
    const isUuid = profile.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.id);
    if (isUuid) {
      payload.id = profile.id;
    }

    const { data, error } = await client
      .from('users')
      .upsert(payload, { onConflict: 'email' })
      .select()
      .single();

    if (error) {
      console.warn('Error syncing user profile:', error.message);
      return null;
    }
    return data;
  } catch (err: any) {
    console.warn('Failed to sync user profile:', err.message);
    return null;
  }
}

/**
 * Provisions synthetic demo accounts in Supabase Auth if service role is enabled
 */
export async function provisionDemoAuthUsers() {
  const client = getSupabase();
  if (!client) return;

  const demoPassword = 'Lendy@Demo2026!';
  const demoAccounts = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      email: 'arjun.kapoor@lendy.finance',
      name: 'Arjun Kapoor',
      role: 'underwriter' as const,
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      email: 'sunita.rao@lendy.finance',
      name: 'Sunita Rao',
      role: 'loan_officer' as const,
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      email: 'devon.patel@lendy.finance',
      name: 'Devon Patel',
      role: 'admin' as const,
    },
  ];

  try {
    // 1. Ensure public.users table has the profiles
    for (const acc of demoAccounts) {
      await syncUserProfile(acc);

      // 2. If service role client has auth.admin access, provision auth user
      if (client.auth?.admin?.createUser) {
        try {
          const { error } = await client.auth.admin.createUser({
            email: acc.email,
            password: demoPassword,
            email_confirm: true,
            user_metadata: {
              name: acc.name,
              role: acc.role,
            },
          });
          if (error && !error.message.includes('already exists') && !error.message.includes('unique')) {
            console.warn(`Notice provisioning ${acc.email} in Supabase Auth:`, error.message);
          }
        } catch (createUserErr: any) {
          // Ignore if user already exists
        }
      }
    }
    console.log('✅ Demo users verified in Supabase Auth & public.users');
  } catch (err: any) {
    console.warn('Notice during demo users provisioning:', err.message);
  }
}
