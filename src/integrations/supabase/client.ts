
// Fake Supabase client for backward compatibility
// This project now uses PostgreSQL directly

export const supabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: null } }),
    signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Use auth functions from /lib/auth') }),
    signOut: () => Promise.resolve({ error: new Error('Use auth functions from /lib/auth') })
  },
  from: () => ({
    select: () => ({ data: [], error: new Error('Use API functions from /lib/api') }),
    insert: () => ({ data: [], error: new Error('Use API functions from /lib/api') }),
    update: () => ({ data: [], error: new Error('Use API functions from /lib/api') }),
    delete: () => ({ data: [], error: new Error('Use API functions from /lib/api') })
  })
};
