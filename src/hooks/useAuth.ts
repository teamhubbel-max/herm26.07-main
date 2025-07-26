import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { db } from '../lib/database';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  useEffect(() => {
    // Проверяем, настроен ли Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    // Синхронная проверка настроек Supabase
    const supabaseConfigured = !!(supabaseUrl && supabaseKey);
    setIsSupabaseConfigured(supabaseConfigured);
    
    if (supabaseConfigured) {
      // Только если Supabase настроен - проверяем сессию
      
      const getInitialSession = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            setUser(session.user);
            await loadProfile(session.user.id);
          } else {
            setUser(null);
            setProfile(null);
          }
        } catch (err) {
          console.error('Error getting session:', err);
          setError('Ошибка подключения к Supabase, переключаемся в локальный режим');
          setIsSupabaseConfigured(false);
        }
      };

      getInitialSession();
      
      // Подписка на изменения авторизации
      try {
        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null);
            
            if (session?.user) {
              await loadProfile(session.user.id);
            } else {
              setProfile(null);
            }
          }
        );
        
        return () => {
          authSubscription.unsubscribe();
        };
      } catch (err) {
        console.error('Error setting up auth listener:', err);
        setIsSupabaseConfigured(false);
      }
    } else {
      // Supabase не настроен - сразу показываем форму авторизации
      console.log('Supabase not configured, using local mode');
    }
  }, []);

  const loadProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      return;
    }
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: user?.email || '',
            full_name: user?.user_metadata?.full_name || '',
            avatar_url: user?.user_metadata?.avatar_url
          })
          .select()
          .single();

        if (createError) throw createError;
        setProfile(newProfile);
      } else if (error) {
        throw error;
      } else {
        setProfile(profile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      return { error: null };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода';
      return { error: { message: errorMessage } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        return { error: new Error('Пользователь не авторизован') };
      }

      if (!isSupabaseConfigured) {
        // Обновляем локальный профиль
        const updatedProfile = { ...profile, ...updates } as Profile;
        setProfile(updatedProfile);
        return { data: updatedProfile, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления профиля';
      return { data: null, error: { message: errorMessage } };
    }
  };

  return {
    user,
    profile,
    error,
    isSupabaseConfigured,
    signOut,
    updateProfile,
  };
};