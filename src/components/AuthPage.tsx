import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TelegramVerificationModal } from './TelegramVerificationModal';

export const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { isSupabaseConfigured } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        setErrors({ general: error.message });
      }
    } catch (error) {
      setErrors({ general: 'Ошибка входа через Google' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Войдите в Гермес
          </h1>
          <p className="text-gray-600">
            Система управления проектами для современных команд
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Description */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Вход через Google</h2>
              <p className="text-gray-600">Используйте свой Google аккаунт для входа в систему</p>
            </div>

            {/* Google Auth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-300 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-lg">Войти через Google</span>
                </>
              )}
            </button>

            {!isSupabaseConfigured && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-sm text-yellow-800">
                  Google OAuth требует настройки Supabase. 
                  <br />
                  Подключите базу данных для использования авторизации.
                </p>
              </div>
            )}

            {/* Temporary Demo Access */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  // Симулируем успешную авторизацию для демо
                  const mockUser = {
                    id: 'demo-user',
                    email: 'demo@example.com',
                    full_name: 'Демо Пользователь'
                  };
                  
                  // Сохраняем в localStorage как признак "авторизации"
                  localStorage.setItem('demo_user', JSON.stringify(mockUser));
                  window.location.reload();
                }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200"
              >
                Демо режим (без авторизации)
              </button>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">
                  {errors.general}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Продолжая, вы соглашаетесь с нашими условиями использования
          </p>
        </div>
      </div>
    </div>
  );
};