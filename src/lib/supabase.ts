// Using mock backend instead of Supabase
import { mockBackend } from './mockBackend';

// Create a Supabase-like interface using our mock backend
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const { user, error } = await mockBackend.signIn(email, password);
      return { 
        data: { user, session: user ? { user } : null },
        error 
      };
    },
    
    signUp: async ({ email, password, options }: { 
      email: string; 
      password: string; 
      options?: { data?: { displayName?: string } } 
    }) => {
      const displayName = options?.data?.displayName || 'User';
      const { user, error } = await mockBackend.signUp(email, password, displayName);
      return { 
        data: { user, session: user ? { user } : null },
        error 
      };
    },
    
    signOut: async () => {
      const { error } = await mockBackend.signOut();
      return { error };
    },
    
    getSession: async () => {
      const { user } = await mockBackend.getSession();
      return { 
        data: { 
          session: user ? { 
            user: {
              id: user.id,
              email: user.email,
              created_at: user.createdAt,
              user_metadata: {
                displayName: user.displayName,
                avatar_url: user.photoURL,
              }
            } 
          } : null 
        },
        error: null 
      };
    },
    
    updateUser: async ({ data }: { data: { displayName?: string; avatar_url?: string } }) => {
      const { user, error } = await mockBackend.updateUser({
        displayName: data.displayName,
        photoURL: data.avatar_url,
      });
      return { 
        data: { user },
        error 
      };
    },
    
    onAuthStateChange: (callback: (event: string, session: { user: { id: string; email: string; created_at: string; user_metadata: { displayName: string; avatar_url: string | null } } } | null) => void) => {
      const subscription = mockBackend.onAuthStateChange((user) => {
        callback('SIGNED_IN', user ? { 
          user: {
            id: user.id,
            email: user.email,
            created_at: user.createdAt,
            user_metadata: {
              displayName: user.displayName,
              avatar_url: user.photoURL,
            }
          } 
        } : null);
      });
      
      return {
        data: { subscription },
      };
    },
  },
};