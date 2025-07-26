import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

/**
 * ==========================================================================
 * ХУК АВТОРИЗАЦИИ (useAuth)
 * ==========================================================================
 * 
 * Простой и надежный хук авторизации с минимальной логикой.
 * Поддерживает только email/password авторизацию.
 * 
 * ФУНКЦИОНАЛЬНОСТЬ:
 * - Вход по email и паролю
 * - Регистрация новых пользователей  
 * - Автоматическое создание профиля
 * - Выход из системы
 * - Обновление профиля
 * 
 * СОСТОЯНИЕ:
 * - user: данные пользователя из Supabase Auth
 * - profile: профиль пользователя из таблицы profiles
 * - loading: состояние загрузки
 * - error: сообщение об ошибке
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔐 AUTH: Инициализация авторизации');
      
      // Получаем текущую сессию
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log('✅ AUTH: Найдена активная сессия:', session.user.email);
        setUser(session.user);
        await loadUserProfile(session.user);
      } else {
        console.log('ℹ️ AUTH: Активная сессия не найдена');
      }

      // Подписываемся на изменения
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 AUTH: Изменение состояния:', event);
          
          if (session?.user) {
            setUser(session.user);
            await loadUserProfile(session.user);
          } else {
            setUser(null);
            setProfile(null);
          }
          setError(null);
        }
      );

      return () => subscription.unsubscribe();
    } catch (err) {
      console.error('❌ AUTH: Ошибка инициализации:', err);
      setError('Ошибка инициализации авторизации');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (user: User) => {
    try {
      console.log('👤 AUTH: Загрузка профиля пользователя');
      
      // Ищем существующий профиль
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        console.log('✅ AUTH: Профиль найден');
        setProfile(existingProfile);
        return;
      }

      // Создаем новый профиль если не существует
      if (fetchError?.code === 'PGRST116') {
        console.log('📝 AUTH: Создание нового профиля');
        
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'member'
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          console.error('❌ AUTH: Ошибка создания профиля:', createError);
          throw createError;
        }

        console.log('✅ AUTH: Профиль создан');
        setProfile(createdProfile);
      } else {
        throw fetchError;
      }
    } catch (err) {
      console.error('❌ AUTH: Ошибка работы с профилем:', err);
      setError('Ошибка загрузки профиля пользователя');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔑 AUTH: Попытка входа:', email);
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('❌ AUTH: Ошибка входа:', error.message);
        
        if (error.message.includes('Invalid login credentials')) {
          setError('Неверный email или пароль. Проверьте данные или зарегистрируйтесь.');
        } else {
          setError(error.message);
        }
        return { error };
      }

      console.log('✅ AUTH: Успешный вход');
      return { data, error: null };
    } catch (err) {
      console.error('❌ AUTH: Исключение при входе:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка входа';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      console.log('📝 AUTH: Попытка регистрации:', email);
      setError(null);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || ''
          }
        }
      });

      if (error) {
        console.error('❌ AUTH: Ошибка регистрации:', error.message);
        
        if (error.message.includes('User already registered')) {
          setError('Пользователь с таким email уже существует. Попробуйте войти.');
        } else {
          setError(error.message);
        }
        return { error };
      }

      console.log('✅ AUTH: Успешная регистрация');
      return { data, error: null };
    } catch (err) {
      console.error('❌ AUTH: Исключение при регистрации:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка регистрации';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 AUTH: Выход из системы');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AUTH: Ошибка выхода:', error);
        setError('Ошибка выхода из системы');
        return { error };
      }

      console.log('✅ AUTH: Успешный выход');
      setUser(null);
      setProfile(null);
      setError(null);
      
      return { error: null };
    } catch (err) {
      console.error('❌ AUTH: Исключение при выходе:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка выхода';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }

      console.log('👤 AUTH: Обновление профиля');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ AUTH: Ошибка обновления профиля:', error);
        throw error;
      }

      console.log('✅ AUTH: Профиль обновлен');
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('❌ AUTH: Исключение при обновлении профиля:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ошибка обновления профиля';
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    updateProfile
  };
};