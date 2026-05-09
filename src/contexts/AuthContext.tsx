import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSessionUser(session: Session | null): User | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,
    email: u.email!,
    displayName: u.user_metadata?.displayName || u.user_metadata?.display_name || null,
    photoURL: u.user_metadata?.avatar_url || null,
    createdAt: new Date(u.created_at),
    healthProfile: null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get initial session and validate it
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Validate the session is still valid by trying to get the user
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error || !authUser) {
          // Stale session — user was deleted. Clear it.
          console.warn('Stale session detected, clearing...');
          await supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }
      }
      setUser(mapSessionUser(session));
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSessionUser(session));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName,
          },
        },
      });
      if (error) throw error;

      // If Supabase requires email confirmation, session will be null.
      // Auto-confirm via direct DB and then sign in.
      if (data.user && !data.session) {
        // Auto-confirm the user via a direct Supabase SQL call
        await supabase.rpc('confirm_user_email', { user_email: email }).catch(() => {});
        
        // Now sign in with the credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          throw new Error(
            'Account created but auto-login failed. Please try signing in manually.'
          );
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          displayName: data.displayName,
          avatar_url: data.photoURL,
        },
      });
      if (error) throw error;

      if (user) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}