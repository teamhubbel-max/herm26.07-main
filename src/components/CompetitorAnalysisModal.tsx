import React, { useState } from 'react';
import { X, Link, BarChart3, Download, RefreshCw, Globe, DollarSign } from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  website: string;
  pricing: {
    plan: string;
    price: number;
    features: string[];
  }[];
}

interface CompetitorAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitors: Competitor[];
}

export const CompetitorAnalysisModal: React.FC<CompetitorAnalysisModalProps> = ({
  isOpen,
  onClose,
  competitors
}) => {
  const [urls, setUrls] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    
    // Имитация анализа
    setTimeout(() => {
      const mockData = {
        competitors: urls.split('\n').filter(Boolean).map((url, index) => ({
          name: `Competitor ${index + 1}`,
          url: url.trim(),
          pricing: [
            { plan: 'Basic', price: Math.floor(Math.random() * 100) + 50 },
            { plan: 'Pro', price: Math.floor(Math.random() * 200) + 150 },
            { plan: 'Enterprise', price: Math.floor(Math.random() * 500) + 300 }
          ],
          features: ['Feature A', 'Feature B', 'Feature C'],
          lastUpdated: new Date()
        })),
        summary: {
          avgBasicPrice: 89,
          avgProPrice: 245,
          avgEnterprisePrice: 567,
          recommendations: [
            'Ваши цены конкурентоспособны в базовом сегменте',
            'Рассмотрите возможность снижения цены Pro плана',
            'Enterprise план можно увеличить на 15%'
          ]
        }
      };
      
      setAnalysisData(mockData);
      setIsLoading(false);
    }, 3000);
  };

  const exportData = () => {
    if (!analysisData) return;
    
    const csvContent = analysisData.competitors.map((comp: any) => 
      `${comp.name},${comp.url},${comp.pricing.map((p: any) => `${p.plan}:${p.price}`).join(';')}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'competitor-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Анализ цен конкурентов</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* URL Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Link className="w-4 h-4 inline mr-1" />
              Ссылки на сайты конкурентов
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Введите ссылки на сайты конкурентов, каждая с новой строки:&#10;https://competitor1.com&#10;https://competitor2.com&#10;https://competitor3.com"
            />
            <p className="text-sm text-gray-500 mt-2">
              Парсер автоматически извлечет информацию о ценах и тарифных планах
            </p>
          </div>

          {/* Selected Competitors */}
          {competitors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Выбранные конкуренты</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {competitors.map(competitor => (
                  <div key={competitor.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                      <a
                        href={competitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="text-sm text-gray-600">
                      {competitor.pricing.length} тарифных планов
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 mb-6">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !urls.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <BarChart3 className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Анализирую...' : 'Начать анализ'}</span>
            </button>
            
            {analysisData && (
              <button
                onClick={exportData}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span>Экспорт данных</span>
              </button>
            )}
          </div>

          {/* Analysis Results */}
          {analysisData && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-900 mb-4">Сводка по ценам</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">${analysisData.summary.avgBasicPrice}</div>
                    <div className="text-sm text-blue-700">Средняя цена Basic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">${analysisData.summary.avgProPrice}</div>
                    <div className="text-sm text-blue-700">Средняя цена Pro</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">${analysisData.summary.avgEnterprisePrice}</div>
                    <div className="text-sm text-blue-700">Средняя цена Enterprise</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-900 mb-4">Рекомендации</h3>
                <ul className="space-y-2">
                  {analysisData.summary.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span className="text-green-800">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Детальный анализ</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Конкурент</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Basic</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Pro</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Enterprise</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Обновлено</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {analysisData.competitors.map((comp: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">{comp.name}</div>
                              <div className="text-sm text-gray-500">{comp.url}</div>
                            </div>
                          </td>
                          {comp.pricing.map((plan: any, planIndex: number) => (
                            <td key={planIndex} className="px-4 py-3">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{plan.price}</span>
                              </div>
                            </td>
                          ))}
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {comp.lastUpdated.toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <RefreshCw className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Анализируем конкурентов</h3>
              <p className="text-gray-600">Парсим сайты и извлекаем информацию о ценах...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};