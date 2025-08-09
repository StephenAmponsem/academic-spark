import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleError, AppError } from '@/lib/errorHandler';

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
    // Set a much shorter timeout for faster loading
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 200); // Reduced from 500ms to 200ms for faster UI

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
            // Fetch user role from profiles with auto-creation fallback
            try {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', session.user.id)
                .single();
              
              if (profileError && profileError.code === 'PGRST116') {
                // Profile doesn't exist, create it
                console.log('🔐 Profile not found, creating new profile...');
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                    role: 'student' // Default role
                  })
                  .select('role')
                  .single();
                
                if (createError) {
                  handleError(createError, 'auth', false);
                  setRole('student'); // Fallback to student role
                } else {
                  setRole(newProfile?.role || 'student');
                  console.log('🔐 New profile created with role:', newProfile?.role);
                }
              } else if (profileError) {
                handleError(profileError, 'auth', false);
                setRole('student'); // Fallback to student role
              } else {
                setRole(profile?.role || 'student');
                console.log('🔐 User role set:', profile?.role);
              }
            } catch (error) {
              handleError(error as Error, 'auth', false);
              setRole('student'); // Fallback to student role
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
        // Fetch user role from profiles with auto-creation fallback
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', session.user.id)
            .single();
          
          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log('🔐 Profile not found in existing session, creating new profile...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
                role: 'student' // Default role
              })
              .select('role')
              .single();
            
            if (createError) {
              handleError(createError, 'auth', false);
              setRole('student'); // Fallback to student role
            } else {
              setRole(newProfile?.role || 'student');
              console.log('🔐 New profile created from existing session with role:', newProfile?.role);
            }
          } else if (profileError) {
            handleError(profileError, 'auth', false);
            setRole('student'); // Fallback to student role
          } else {
            setRole(profile?.role || 'student');
            console.log('🔐 User role set from existing session:', profile?.role);
          }
        } catch (error) {
          handleError(error as Error, 'auth', false);
          setRole('student'); // Fallback to student role
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

  const updateUserRole = async (newRole: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);
      
      if (error) {
        handleError(error, 'auth', false);
      } else {
        setRole(newRole);
        console.log('🔐 User role updated to:', newRole);
      }
    } catch (error) {
      handleError(error as Error, 'auth', false);
    }
  };

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
    updateUserRole,
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