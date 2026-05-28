'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

export function useAuth() {
  const { user, isLoading, setUser, setLoading, clearUser } = useAuthStore();

  useEffect(() => {
    if (user) return;
    setLoading(true);
    authService
      .me()
      .then((res) => setUser(res.data))
      .catch(() => clearUser());
  }, []);

  return { user, isLoading };
}
