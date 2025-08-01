import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signOut: () => Promise<void>;
  recoverSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [sessionRecoveryAttempted, setSessionRecoveryAttempted] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 1000); // 1 second timeout for faster loading

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(loadingTimeout); // Clear timeout when auth state changes
        
        console.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session');
        
        // Only clear session if it's an explicit sign out, not just session loss
        if (event === 'SIGNED_OUT') {
          console.log('🔐 User explicitly signed out');
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }
        
        // If session is null but it's not a sign out, try to recover
        if (!session) {
          console.log('🔐 Session lost, attempting recovery...');
          if (!sessionRecoveryAttempted) {
            setSessionRecoveryAttempted(true);
            const recovered = await recoverSession();
            if (!recovered) {
              console.log('🔐 Session recovery failed, clearing state');
              setSession(null);
              setUser(null);
              setRole(null);
            }
          }
          setLoading(false);
          return;
        }
        
        if (session) {
          console.log('🔐 User session active:', session.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
          setSessionRecoveryAttempted(false); // Reset recovery flag
          
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
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      clearTimeout(loadingTimeout); // Clear timeout when session check completes
      
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
  }, [sessionRecoveryAttempted]);

  const signOut = async () => {
    try {
      console.log('🔐 Explicit sign out requested');
      // Force clear the local state immediately first
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
      setSessionRecoveryAttempted(false);
      
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

  // Add session recovery function
  const recoverSession = async () => {
    try {
      console.log('🔐 Attempting to recover session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('🔐 Error recovering session:', error);
        return false;
      }
      
      if (session) {
        console.log('🔐 Session recovered successfully:', session.user?.email);
        setSession(session);
        setUser(session.user);
        setSessionRecoveryAttempted(false);
        
        // Fetch user role
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          setRole(profile?.role || null);
        } catch (error) {
          console.warn('🔐 Could not fetch user role during recovery:', error);
          setRole(null);
        }
        return true;
      } else {
        console.log('🔐 No session to recover');
        return false;
      }
    } catch (error) {
      console.error('🔐 Error in session recovery:', error);
      return false;
    }
  };

  // Add session recovery on window focus and visibility change
  useEffect(() => {
    const handleWindowFocus = () => {
      console.log('🔐 Window focused - checking session...');
      if (!user && !loading) {
        console.log('🔐 No user detected, attempting session recovery...');
        recoverSession();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔐 Page became visible - checking session...');
        if (!user && !loading) {
          console.log('🔐 No user detected on visibility change, attempting session recovery...');
          recoverSession();
        }
      }
    };

    const handleSessionRecovery = () => {
      console.log('🔐 Session recovery event triggered...');
      if (!user && !loading) {
        console.log('🔐 Attempting session recovery from custom event...');
        recoverSession();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('sessionRecovery', handleSessionRecovery);
    
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('sessionRecovery', handleSessionRecovery);
    };
  }, [user, loading]);

  // Add periodic session check
  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      if (user && !loading) {
        console.log('🔐 Periodic session check...');
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!session && user) {
            console.log('🔐 Session lost during periodic check, attempting recovery...');
            recoverSession();
          }
        });
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(sessionCheckInterval);
    };
  }, [user, loading]);

  const value = {
    user,
    session,
    loading,
    signOut,
    role,
    recoverSession,
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