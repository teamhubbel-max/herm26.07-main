import React, { useState } from 'react';
import { Loader2, AlertCircle, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AuthPage: React.FC = () => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    loading, 
    error
  } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`🔐 Попытка ${isSignUp ? 'регистрации' : 'входа'} по email:`, formData.email);
    setAuthLoading(true);
    
    try {
      if (isSignUp) {
        console.log('📝 Регистрация нового пользователя');
        const { error } = await signUpWithEmail(
          formData.email, 
          formData.password, 
          formData.fullName
        );
        if (error) {
          console.error('❌ Ошибка регистрации:', error);
        } else {
          console.log('✅ Регистрация успешна');
        }
      } else {
        console.log('🔑 Вход существующего пользователя');
        const { error } = await signInWithEmail(formData.email, formData.password);
        if (error) {
          console.error('❌ Ошибка входа:', error);
        } else {
          console.log('✅ Вход успешен');
        }
      }
    } catch (error) {
      console.error('❌ Исключение при авторизации:', error);
    } finally {
      setAuthLoading(false);
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
            {isSignUp ? 'Создать аккаунт' : 'Добро пожаловать в Гермес'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Зарегистрируйтесь для начала работы'
              : 'Система управления проектами для современных команд'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Ошибка авторизации</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {error.includes('Неверный email или пароль') && (
                    <p className="text-sm text-red-600 mt-2">
                      💡 Возможно, вам нужно сначала <button 
                        onClick={() => setIsSignUp(true)}
                        className="underline hover:no-underline font-medium"
                      >
                        зарегистрироваться
                      </button>
                    </p>
                  )}
                  {error.includes('уже существует') && (
                    <p className="text-sm text-red-600 mt-2">
                      💡 Попробуйте <button 
                        onClick={() => setIsSignUp(false)}
                        className="underline hover:no-underline font-medium"
                      >
                        войти
                      </button> с этим email
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Полное имя
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите ваше имя"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email адрес
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Введите пароль"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {authLoading || loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span>{isSignUp ? 'Создать аккаунт' : 'Войти'}</span>
                )}
              </button>
            </form>

            {/* Toggle Sign In/Up */}
            <div className="text-center">
              <button
                onClick={() => {
                  console.log(`🔄 Переключение на ${!isSignUp ? 'регистрацию' : 'вход'}`);
                  setIsSignUp(!isSignUp);
                  setFormData({ email: '', password: '', fullName: '' });
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {isSignUp 
                  ? 'Уже есть аккаунт? Войти' 
                  : 'Нет аккаунта? Зарегистрироваться'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Продолжая, вы соглашаетесь с условиями использования
          </p>
        </div>
      </div>
    </div>
  );
};