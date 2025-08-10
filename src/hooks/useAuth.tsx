import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleError, AppError } from '@/lib/errorHandler';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  signUp: (email: string, password: string, userType: 'student' | 'lecturer') => Promise<{ success: boolean; user?: User; error?: string }>;
  signOut: () => Promise<void>;
  updateUserRole: (newRole: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Enhanced cache with localStorage persistence and faster access
const profileCache = new Map<string, { role: string; full_name: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for better persistence
const CACHE_KEY = 'auth_profile_cache';

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// Load cache from localStorage on module load
if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.entries(parsed).forEach(([key, value]) => {
        profileCache.set(key, value as any);
      });
    }
  } catch (error) {
    console.warn('Failed to load auth cache from localStorage:', error);
  }
}

// Save cache to localStorage
const saveCache = () => {
  if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
    try {
      const cacheObj = Object.fromEntries(profileCache);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObj));
    } catch (error) {
      console.warn('Failed to save auth cache to localStorage:', error);
    }
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileFetchRef = useRef<Promise<string> | null>(null);
  const isInitialized = useRef(false);

  // Ultra-fast profile fetching with aggressive caching
  const fetchUserProfile = useCallback(async (userId: string): Promise<string> => {
    // Check cache first with immediate return
    const cached = profileCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('⚡ Using cached profile for user:', userId);
      return cached.role;
    }

    // Prevent multiple simultaneous profile fetches
    if (profileFetchRef.current) {
      await profileFetchRef.current;
      const cachedAfterWait = profileCache.get(userId);
      if (cachedAfterWait) return cachedAfterWait.role;
    }

    // Create new profile fetch promise with timeout
    profileFetchRef.current = (async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
        });

        const fetchPromise = (async () => {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', userId)
            .single();
          
          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it with timeout
            console.log('🔐 Profile not found, creating new profile...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                full_name: 'User',
                role: 'student'
              })
              .select('role')
              .single();
            
            if (createError) {
              console.warn('🔐 Profile creation failed, using fallback role');
              return 'student';
            } else {
              const role = newProfile?.role || 'student';
              // Cache the new profile
              profileCache.set(userId, { 
                role, 
                full_name: 'User', 
                timestamp: Date.now() 
              });
              saveCache();
              return role;
            }
          } else if (profileError) {
            console.warn('🔐 Profile fetch error, using fallback role');
            return 'student';
          } else {
            const role = profile?.role || 'student';
            // Cache the profile
            profileCache.set(userId, { 
              role, 
              full_name: profile?.full_name || 'User', 
              timestamp: Date.now() 
            });
            saveCache();
            return role;
          }
        })();

        // Race between fetch and timeout
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        return result;
      } catch (error) {
        console.warn('🔐 Profile fetch failed, using fallback role:', error);
        return 'student';
      }
    })();

    const result = await profileFetchRef.current;
    profileFetchRef.current = null;
    return result;
  }, []);

  useEffect(() => {
    // Ultra-fast loading with minimal timeout
    const loadingTimeout = setTimeout(() => {
      if (!isInitialized.current) {
        setLoading(false);
        isInitialized.current = true;
      }
    }, 50); // Reduced to 50ms for immediate response

    // Set up auth state listener with immediate state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        clearTimeout(loadingTimeout);
        
        console.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_OUT') {
          console.log('🔐 User explicitly signed out');
          // Immediate state updates
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          isInitialized.current = true;
          // Clear cache for signed out user
          if (user) {
            profileCache.delete(user.id);
            saveCache();
          }
          return;
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            console.log('🔐 User session active:', session.user?.email);
            // Immediate state updates for better UX
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            isInitialized.current = true;
            
            if (session?.user) {
              // Fetch user role in background without blocking UI
              fetchUserProfile(session.user.id).then(userRole => {
                setRole(userRole);
                console.log('🔐 User role set:', userRole);
              }).catch(error => {
                console.warn('🔐 Role fetch failed, using default:', error);
                setRole('student');
              });
            } else {
              setRole(null);
            }
          } else {
            setSession(null);
            setUser(null);
            setRole(null);
            setLoading(false);
            isInitialized.current = true;
          }
        } else if (event === 'USER_UPDATED') {
          // Handle user updates (including email confirmation)
          console.log('🔐 User updated:', session?.user?.email);
          if (session) {
            setSession(session);
            setUser(session?.user ?? null);
            // Check if email is confirmed for signup flow
            if (session.user?.email_confirmed_at) {
              setLoading(false);
              isInitialized.current = true;
            }
          }
        } else {
          // For other events, ensure loading is set to false
          setLoading(false);
          isInitialized.current = true;
        }
      }
    );

    // Check for existing session with parallel processing
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(loadingTimeout);
        
        if (!session) {
          console.log('🔐 No existing session found');
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
          isInitialized.current = true;
          return;
        }
        
        console.log('🔐 Existing session found:', session.user?.email);
        // Immediate state updates
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        isInitialized.current = true;
        
        if (session?.user) {
          // Fetch user role in background without blocking UI
          fetchUserProfile(session.user.id).then(userRole => {
            setRole(userRole);
            console.log('🔐 User role set from existing session:', userRole);
          }).catch(error => {
            console.warn('🔐 Role fetch failed, using default:', error);
            setRole('student');
          });
        } else {
          setRole(null);
        }
      } catch (error) {
        console.error('🔐 Error checking session:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
        isInitialized.current = true;
      }
    };

    // Start session check immediately
    checkExistingSession();

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const updateUserRole = async (newRole: string) => {
    if (!user) return;
    
    try {
      // Update cache immediately for instant UI response
      setRole(newRole);
      const cached = profileCache.get(user.id);
      if (cached) {
        profileCache.set(user.id, {
          ...cached,
          role: newRole,
          timestamp: Date.now()
        });
        saveCache();
      }

      // Update database in background
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', user.id);
      
      if (error) {
        // Revert on error
        setRole(cached?.role || 'student');
        handleError(error, 'auth', false);
      } else {
        console.log('🔐 User role updated to:', newRole);
      }
    } catch (error) {
      // Revert on error
      const cached = profileCache.get(user.id);
      setRole(cached?.role || 'student');
      handleError(error as Error, 'auth', false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 Explicit sign out requested');
      // Immediate state updates for instant UI response
      setUser(null);
      setSession(null);
      setRole(null);
      setLoading(false);
      isInitialized.current = true;
      
      // Clear localStorage immediately with safety checks
      if (typeof window !== 'undefined' && isLocalStorageAvailable()) {
        try {
          localStorage.removeItem('sb-nhuxwgmafdjchljvqlna-auth-token');
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) {
              localStorage.removeItem(key);
            }
          });
          // Clear auth cache
          profileCache.clear();
          localStorage.removeItem(CACHE_KEY);
        } catch (error) {
          console.warn('Could not clear localStorage:', error);
        }
      }
      
      // Sign out from Supabase in background
      supabase.auth.signOut().catch(error => {
        console.error('Error during sign out:', error);
      });
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({ email, password });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);
      
      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        setError('No user data received');
        setLoading(false);
        return { success: false, error: 'No user data received' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, userType: 'student' | 'lecturer') => {
    setLoading(true);
    setError(null);
    
    try {
      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Registration timeout')), 10000)
      );
      
      const authPromise = supabase.auth.signUp({ email, password });
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);
      
      if (error) {
        setError(error.message);
        setLoading(false);
        return { success: false, error: error.message };
      }
      
      if (data.user) {
        // Set user immediately for better UX
        setUser(data.user);
        
        // Assign role in background
        try {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert([
              { 
                user_id: data.user.id, 
                role: userType,
                created_at: new Date().toISOString()
              }
            ]);
          
          if (roleError) {
            console.warn('Role assignment failed:', roleError);
            // Don't fail the signup if role assignment fails
          }
        } catch (roleError) {
          console.warn('Role assignment error:', roleError);
        }
        
        setLoading(false);
        return { success: true, user: data.user };
      } else {
        setError('No user data received');
        setLoading(false);
        return { success: false, error: 'No user data received' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    role,
    updateUserRole,
    error,
    signIn,
    signUp,
    clearError,
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