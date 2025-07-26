import React, { useState } from 'react';
import { X, Brain, Send, Copy, Check, Zap, Target, Sparkles } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  platform: string;
  engagementRate: number;
  likes: number;
  shares: number;
  comments: number;
}

interface PostGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPosts: Post[];
}

export const PostGeneratorModal: React.FC<PostGeneratorModalProps> = ({
  isOpen,
  onClose,
  selectedPosts
}) => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('professional');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const platforms = [
    { value: 'LinkedIn', label: 'LinkedIn', limit: 3000 },
    { value: 'Twitter', label: 'Twitter', limit: 280 },
    { value: 'Facebook', label: 'Facebook', limit: 2000 },
    { value: 'Instagram', label: 'Instagram', limit: 1500 }
  ];

  const tones = [
    { value: 'professional', label: 'Профессиональный' },
    { value: 'casual', label: 'Неформальный' },
    { value: 'humorous', label: 'С юмором' },
    { value: 'inspiring', label: 'Вдохновляющий' },
    { value: 'educational', label: 'Образовательный' }
  ];

  const generatePost = async () => {
    setIsGenerating(true);
    
    // Имитация генерации поста через AI
    setTimeout(() => {
      const mockGeneratedPost = `🚀 Запускаем новую эру управления проектами!

После анализа ${selectedPosts.length} успешных постов наших коллег, мы поняли: главное — это не только функциональность, но и пользовательский опыт.

${prompt}

Наша команда работает над созданием инструмента, который объединяет:
✅ Интуитивный интерфейс
✅ Мощную аналитику
✅ Seamless интеграции
✅ AI-помощник для оптимизации

Что для вас самое важное в инструментах управления проектами?

#ProjectManagement #Innovation #SaaS #TeamWork`;

      setGeneratedPost(mockGeneratedPost);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Генерация поста с помощью ИИ</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Input */}
            <div className="space-y-6">
              {/* Selected Posts */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Выбранные посты для анализа ({selectedPosts.length})
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-3">
                  {selectedPosts.map(post => (
                    <div key={post.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {post.platform}
                        </span>
                        <span className="text-xs text-gray-500">
                          {post.engagementRate}% вовлеченность
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Платформа</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {platforms.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label} (макс. {p.limit} символов)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тон сообщения</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {tones.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваш промпт
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Опишите, о чем должен быть пост. ИИ проанализирует выбранные посты и создаст новый контент на основе ваших требований..."
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generatePost}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span>Генерирую...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Сгенерировать пост</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Side - Output */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-900">Сгенерированный пост</h3>
                  {generatedPost && (
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Скопировано' : 'Копировать'}</span>
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 min-h-80">
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Brain className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">ИИ анализирует посты</h4>
                      <p className="text-gray-600">Создаю уникальный контент на основе ваших требований...</p>
                    </div>
                  ) : generatedPost ? (
                    <div>
                      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {platform}
                          </span>
                          <span className="text-sm text-gray-500">
                            {generatedPost.length} / {platforms.find(p => p.value === platform)?.limit} символов
                          </span>
                        </div>
                        <div className="prose prose-sm max-w-none">
                          <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
                            {generatedPost}
                          </pre>
                        </div>
                      </div>
                      
                      {/* Post Metrics Prediction */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-800 mb-2">Прогноз метрик</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-800">156</div>
                            <div className="text-green-600">Лайки</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-800">23</div>
                            <div className="text-green-600">Репосты</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-800">4.2%</div>
                            <div className="text-green-600">Вовлеченность</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <Target className="w-12 h-12 text-gray-300 mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Готов к генерации</h4>
                      <p className="text-gray-600">Добавьте ваш промпт и нажмите "Сгенерировать пост"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Советы для лучшего результата</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Будьте конкретными в описании темы</li>
                  <li>• Укажите целевую аудиторию</li>
                  <li>• Добавьте call-to-action</li>
                  <li>• Используйте ключевые слова вашей ниши</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};