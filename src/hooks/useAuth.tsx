import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second timeout for faster loading

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(loadingTimeout); // Clear timeout when auth state changes
        
        if (event === 'SIGNED_OUT' || !session) {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user role from profiles
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
            setRole(profile?.role || null);
          } catch (error) {
            setRole(null);
          }
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(loadingTimeout); // Clear timeout when session check completes
      
      if (!session) {
        setSession(null);
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user role from profiles
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setRole(profile?.role || null);
        } catch (error) {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    }).catch(error => {
      clearTimeout(loadingTimeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      // Force clear the local state immediately first
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
      
      // Clear localStorage manually
      try {
        localStorage.removeItem('sb-nhuxwgmafdjchljvqlna-auth-token');
        // Clear any other Supabase-related items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore localStorage errors
      }
      
      // Try to call Supabase signOut but don't wait for it
      supabase.auth.signOut().catch((error) => {
        // Ignore Supabase signOut errors
      });
    } catch (error) {
      // Still clear local state even if there's an error
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}