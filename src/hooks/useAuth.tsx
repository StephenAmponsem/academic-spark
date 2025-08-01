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
    // Set a shorter timeout for faster loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 500); // Reduced from 1000ms to 500ms

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(loadingTimeout);
        
        console.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_OUT') {
          console.log('🔐 User explicitly signed out');
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log('🔐 User session active:', session.user?.email);
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
              console.log('🔐 User role set:', profile?.role);
            } catch (error) {
              console.warn('🔐 Could not fetch user role:', error);
              setRole(null);
            }
          } else {
            setRole(null);
          }
        } else {
          setSession(null);
          setUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      
      console.log('🔐 Initial session check:', session ? 'Session exists' : 'No session');
      
      if (!session) {
        console.log('🔐 No existing session found');
        setSession(null);
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }
      
      console.log('🔐 Existing session found:', session.user?.email);
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
          console.log('🔐 User role set from existing session:', profile?.role);
        } catch (error) {
          console.warn('🔐 Could not fetch user role from existing session:', error);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    }).catch(error => {
      console.error('🔐 Error checking session:', error);
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
      console.log('🔐 Explicit sign out requested');
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
      } catch (error) {
        console.warn('Could not clear localStorage:', error);
      }
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
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

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;