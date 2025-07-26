import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TelegramVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onSuccess: () => void;
}

export const TelegramVerificationModal: React.FC<TelegramVerificationModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onSuccess
}) => {
  const [step, setStep] = useState(1); // 1 - инструкции, 2 - ввод кода
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [botLinkCopied, setBotLinkCopied] = useState(false);

  const botUsername = 'hermes_project_bot'; // Замените на ваш бот
  const botLink = `https://t.me/${botUsername}`;

  const copyBotLink = async () => {
    try {
      await navigator.clipboard.writeText(botLink);
      setBotLinkCopied(true);
      setTimeout(() => setBotLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError('Код должен содержать 6 цифр');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Проверяем код через API
      const response = await fetch('/api/telegram/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          code: verificationCode
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message || 'Неверный код верификации');
      }
    } catch (err) {
      setError('Ошибка при проверке кода');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <span>Подключение Telegram</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Подключите Telegram для уведомлений
                </h3>
                <p className="text-gray-600">
                  Получайте уведомления о задачах, дедлайнах и изменениях в проектах
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Инструкция:</h4>
                <ol className="text-sm text-blue-800 space-y-2">
                  <li>1. Перейдите в Telegram бота</li>
                  <li>2. Отправьте команду: <code className="bg-blue-100 px-1 rounded">/verify {userEmail}</code></li>
                  <li>3. Получите код верификации</li>
                  <li>4. Введите код в следующем шаге</li>
                </ol>
              </div>

              <div className="flex items-center space-x-3">
                <a
                  href={botLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Открыть бота</span>
                </a>
                <button
                  onClick={copyBotLink}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Копировать ссылку"
                >
                  {botLinkCopied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                Я отправил команду в боте
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Введите код верификации
                </h3>
                <p className="text-gray-600">
                  Введите 6-значный код, который прислал бот
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код верификации
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setVerificationCode(value);
                    setError('');
                  }}
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">{error}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setVerificationCode('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
                <button
                  onClick={verifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Подтвердить</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};