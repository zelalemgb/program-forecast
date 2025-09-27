import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>; 
  signUp: (email: string, password: string) => Promise<{ error: any; userId?: string }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!isMounted) return;
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    const MAX_RETRIES = 3;

    const fetchSession = async () => {
      for (let attempt = 1; attempt <= MAX_RETRIES && isMounted; attempt++) {
        let shouldRetry = false;
        try {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            throw error;
          }

          if (!isMounted) {
            return;
          }

          setSession(data.session);
          setUser(data.session?.user ?? null);
          return;
        } catch (error) {
          console.error("Failed to fetch auth session:", error);
          shouldRetry = attempt < MAX_RETRIES;

          if (shouldRetry) {
            if (attempt === 1) {
              toast({
                title: "Restoring session…",
                description: "We're reconnecting to Supabase. You can refresh if this takes too long.",
              });
            }

            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          } else {
            toast({
              title: "Unable to restore session",
              description: "Please refresh the page to try again.",
              variant: "destructive",
            });
          }
        } finally {
          if (!shouldRetry && isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (networkError) {
      console.error("Network error during sign in:", networkError);
      return { error: { message: "Network connection failed. Please check your internet connection or try again later." } };
    }
  };

  const signUp: AuthContextValue["signUp"] = async (email, password) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl }
      });
      return { error, userId: data?.user?.id };
    } catch (networkError) {
      console.error("Network error during sign up:", networkError);
      return { error: { message: "Network connection failed. Please check your internet connection or try again later." } };
    }
  };

  const signOut: AuthContextValue["signOut"] = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
