import { useState, useEffect } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Детальное логирование для отладки
const authLogger = {
  info: (message: string, data?: any) => {
    console.log(`🔐 AUTH INFO: ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`❌ AUTH ERROR: ${message}`, error);
  },
  success: (message: string, data?: any) => {
    console.log(`✅ AUTH SUCCESS: ${message}`, data);
  }
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);

  useEffect(() => {
    authLogger.info('Инициализация системы авторизации');
    
    // Проверяем настройки Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    authLogger.info('Проверка конфигурации Supabase', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey,
      url: supabaseUrl ? 'configured' : 'missing',
      key: supabaseKey ? 'configured' : 'missing'
    });
    
    const configured = !!(supabaseUrl && supabaseKey);
    setIsSupabaseConfigured(configured);
    
    if (configured) {
      initializeAuth();
    } else {
      authLogger.error('Supabase не настроен');
      setLoading(false);
    }
  }, []);

  const initializeAuth = async () => {
    try {
      authLogger.info('Начало инициализации авторизации');
      setLoading(true);
      
      // Получаем текущую сессию
      authLogger.info('Получение текущей сессии');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        authLogger.error('Ошибка получения сессии', sessionError);
        setError('Ошибка получения сессии');
        setLoading(false);
        return;
      }

      if (session?.user) {
        authLogger.success('Активная сессия найдена', { 
          userId: session.user.id, 
          email: session.user.email 
        });
        setUser(session.user);
        await loadOrCreateProfile(session.user);
      } else {
        authLogger.info('Активная сессия не найдена');
      }

      // Подписываемся на изменения авторизации
      authLogger.info('Подписка на изменения авторизации');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          authLogger.info('Изменение состояния авторизации', { 
            event, 
            userId: session?.user?.id,
            email: session?.user?.email 
          });
          
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
        authLogger.info('Отписка от изменений авторизации');
        subscription.unsubscribe();
      };
    } catch (err) {
      authLogger.error('Ошибка инициализации авторизации', err);
      setError('Ошибка инициализации авторизации');
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateProfile = async (user: User) => {
    try {
      authLogger.info('Загрузка/создание профиля пользователя', { 
        userId: user.id, 
        email: user.email 
      });
      
      // Пытаемся найти существующий профиль
      authLogger.info('Поиск существующего профиля');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        authLogger.success('Существующий профиль найден', existingProfile);
        setProfile(existingProfile);
        return;
      }

      // Если профиль не найден, создаем новый
      if (fetchError?.code === 'PGRST116') {
        authLogger.info('Профиль не найден, создаем новый');
        
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          role: 'member'
        };

        authLogger.info('Данные нового профиля', newProfile);

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          authLogger.error('Ошибка создания профиля', createError);
          setError(`Ошибка создания профиля: ${createError.message}`);
          return;
        }

        authLogger.success('Профиль успешно создан', createdProfile);
        setProfile(createdProfile);
      } else {
        authLogger.error('Неожиданная ошибка при загрузке профиля', fetchError);
        setError(`Ошибка загрузки профиля: ${fetchError?.message || 'Unknown error'}`);
      }
    } catch (err) {
      authLogger.error('Общая ошибка работы с профилем', err);
      setError('Ошибка работы с профилем');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      authLogger.info('Попытка входа по email', { email });
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        authLogger.error('Ошибка входа по email', { 
          error, 
          email,
          errorCode: error.message 
        });
        
        const errorMessage = (error as any).message?.toLowerCase() || '';
        if (errorMessage.includes('invalid login credentials') || 
            errorMessage.includes('invalid_credentials') ||
            errorMessage.includes('invalid credentials')) {
          setError('Неверный email или пароль. Проверьте данные или зарегистрируйтесь.');
        } else {
          setError((error as any).message || 'Ошибка входа');
        }
        return { error };
      }

      authLogger.success('Успешный вход по email', { 
        userId: data.user?.id, 
        email: data.user?.email 
      });
      return { data, error: null };
    } catch (err) {
      authLogger.error('Исключение при входе по email', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      authLogger.info('Попытка регистрации по email', { email, fullName });
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
        authLogger.error('Ошибка регистрации', error);
        
        const errorMessage = (error as any).message?.toLowerCase() || '';
        if (errorMessage.includes('user already registered') || 
            errorMessage.includes('already registered')) {
          setError('Пользователь с таким email уже существует. Попробуйте войти.');
        } else {
          setError((error as any).message || 'Ошибка регистрации');
        }
        return { error };
      }

      authLogger.success('Успешная регистрация', { 
        userId: data.user?.id, 
        email: data.user?.email 
      });
      return { data, error: null };
    } catch (err) {
      authLogger.error('Исключение при регистрации', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const signOut = async () => {
    authLogger.info('Попытка выхода из системы');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        authLogger.success('Успешный выход из системы');
        setUser(null);
        setProfile(null);
        setError(null);
      } else {
        authLogger.error('Ошибка выхода из системы', error);
      }
      
      return { error };
    } catch (err) {
      authLogger.error('Исключение при выходе', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода';
      return { error: { message: errorMessage } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      authLogger.info('Обновление профиля', { userId: user.id, updates });

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        authLogger.error('Ошибка обновления профиля', error);
        throw error;
      }

      authLogger.success('Профиль успешно обновлен', data);
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      authLogger.error('Исключение при обновлении профиля', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления профиля';
      return { data: null, error: { message: errorMessage } };
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    isSupabaseConfigured,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile,
  };
};