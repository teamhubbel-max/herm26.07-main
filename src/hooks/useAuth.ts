import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  useEffect(() => {
    // Проверяем настройки Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const configured = !!(supabaseUrl && supabaseKey);
    setIsSupabaseConfigured(true); // Всегда показываем форму
    
    // Всегда инициализируем авторизацию
    initializeAuth();
  }, []);

  const checkDemoMode = () => {
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const userData = JSON.parse(demoUser);
        setUser(userData as User);
        setProfile({
          id: userData.id,
          email: userData.email,
          full_name: userData.full_name || 'Демо пользователь',
          avatar_url: null,
          role: 'member',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          telegram_id: null,
          telegram_username: null
        });
      } catch (error) {
        console.error('Error parsing demo user:', error);
        localStorage.removeItem('demo_user');
      }
    }
    setLoading(false);
  };

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      // Получаем текущую сессию
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        setError('Ошибка получения сессии');
        setLoading(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await loadOrCreateProfile(session.user);
      }

      // Подписываемся на изменения авторизации
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email);
          
          if (session?.user) {
            setUser(session.user);
            await loadOrCreateProfile(session.user);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (err) {
      console.error('Auth initialization error:', err);
      setError('Ошибка инициализации авторизации');
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateProfile = async (user: User) => {
    try {
      console.log('Loading/creating profile for user:', user.email);
      
      // Пытаемся найти существующий профиль
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        console.log('Existing profile found:', existingProfile);
        setProfile(existingProfile);
        return;
      }

      // Если профиль не найден, создаем новый
      if (fetchError?.code === 'PGRST116') {
        console.log('Creating new profile for user:', user.email);
        
        const newProfile = {
          id: user.id, // Уникальный ID от Google/Supabase Auth
          email: user.email || '', // Email как ключ для приглашений
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          role: 'member'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setError(`Ошибка создания профиля: ${createError.message}`);
          return;
        }

        console.log('Profile created successfully:', createdProfile);
        setProfile(createdProfile);
      } else {
        console.error('Unexpected error fetching profile:', fetchError);
        setError(`Ошибка загрузки профиля: ${fetchError.message}`);
      }
    } catch (err) {
      console.error('Profile error:', err);
      setError('Ошибка работы с профилем');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        setError(error.message);
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа через Google';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Улучшенная обработка ошибок авторизации
        if (error.message.includes('Invalid login credentials')) {
          setError('Неверный email или пароль. Проверьте данные или зарегистрируйтесь.');
        } else {
          setError(error.message);
        }
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          }
        }
      });

      if (error) {
        // Улучшенная обработка ошибок регистрации
        if (error.message.includes('User already registered')) {
          setError('Пользователь с таким email уже существует. Попробуйте войти.');
        } else {
          setError(error.message);
        }
        return { error };
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    // Очищаем демо режим
    localStorage.removeItem('demo_user');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        setUser(null);
        setProfile(null);
      }
      
      return { error };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода';
      return { error: { message: errorMessage } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      console.log('Updating profile for user:', user.id, updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('Profile updated successfully:', data);
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления профиля';
      return { data: null, error: { message: errorMessage } };
    }
  };

  const enterDemoMode = () => {
    console.log('Entering demo mode');
    const mockUser = {
      id: 'demo-user-' + Date.now(),
      email: 'demo@example.com',
      user_metadata: {
        full_name: 'Демо Пользователь'
      }
    };
    
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    setUser(mockUser as User);
    setProfile({
      id: mockUser.id,
      email: mockUser.email,
      full_name: 'Демо Пользователь',
      avatar_url: null,
      role: 'member',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      telegram_id: null,
      telegram_username: null
    });
  };

  return {
    user,
    profile,
    loading,
    error,
    isSupabaseConfigured,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
    enterDemoMode,
  };
};