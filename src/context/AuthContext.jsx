import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { authStorage, setAuthFailureHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authStorage.get());

  useEffect(() => {
    setAuthFailureHandler(() => setSession(null));
    return () => setAuthFailureHandler(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const { data } = await api.post('/login', { username, password });
    const next = {
      user: data.user,
      access_token: data.tokens.access_token,
      refresh_token: data.tokens.refresh_token,
    };
    authStorage.set(next);
    setSession(next);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const current = authStorage.get();
    try {
      if (current?.refresh_token) {
        await api.post('/logout', { refresh_token: current.refresh_token });
      }
    } catch {
      // local logout is enough even if the server call fails
    }
    authStorage.clear();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.access_token),
      login,
      logout,
    }),
    [session, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}