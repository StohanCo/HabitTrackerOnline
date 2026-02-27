import { useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useStore } from '../store';

/**
 * Invisible component that lives inside both AuthProvider and the Router.
 * On sign-in it pulls all data from Supabase into Zustand once.
 */
export const CloudLoader: React.FC = () => {
  const { user, cloudEnabled } = useAuth();
  const loadFromCloud = useStore((s) => s.loadFromCloud);
  const loaded = useRef(false);

  useEffect(() => {
    if (!cloudEnabled || !user || loaded.current) return;
    loaded.current = true;
    loadFromCloud(user.id).catch(console.error);
  }, [user, cloudEnabled, loadFromCloud]);

  // Reset the flag when user signs out
  useEffect(() => {
    if (!user) loaded.current = false;
  }, [user]);

  return null;
};
