import React, { useState, useEffect } from 'react';
import { useTracking } from '../../context/TrackingContext';
import toast from 'react-hot-toast';
import TrackingStatsCard from '../../components/tracking/TrackingStatsCard';
import { HiOutlineEye, HiOutlineShoppingCart, HiOutlineCurrencyDollar, HiOutlineUser } from 'react-icons/hi';

const TrackingManager: React.FC = () => {
  const { pixelId, setPixelId, isUTMEnabled, setIsUTMEnabled, saveTrackingSettings } = useTracking();
  const [localPixelId, setLocalPixelId] = useState('');
  const [localUTMEnabled, setLocalUTMEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    // Inicializa os estados locais com os valores do contexto
    setLocalPixelId(pixelId);
    setLocalUTMEnabled(isUTMEnabled);
  }, [pixelId, isUTMEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Atualiza o contexto com os valores locais
    setPixelId(localPixelId);
    setIsUTMEnabled(localUTMEnabled);

    const success = await saveTrackingSettings();

    if (success) {
      toast.success('Configurações de rastreamento salvas com sucesso!');
    } else {
      toast.error('Erro ao salvar configurações de rastreamento.');
    }

    setIsSaving(false);
  };

  const handleReset = () => {
    // Volta para os valores originais do contexto
    setLocalPixelId(pixelId);
    setLocalUTMEnabled(isUTMEnabled);
    toast.success('Formulário restaurado ao estado inicial.');
  };

  // Dados mockados para a dashboard
  const mockStats = {
    pageViews: {
      value: '5.237',
      trend: { value: 12.3, isPositive: true },
      description: 'Visualizações nos últimos 30 dias'
    },
    addToCart: {
      value: '743',
      trend: { value: 8.4, isPositive: true },
      description: 'Adições ao carrinho nos últimos 30 dias'
    },
    conversion: {
      value: '3.2%',
      trend: { value: 0.5, isPositive: true },
      description: 'Taxa de conversão média'
    },
    revenue: {
      value: 'R$ 35.842',
      trend: { value: 15.7, isPositive: true },
      description: 'Receita total nos últimos 30 dias'
    }
  };

  return (
    <div className="bg-gray-50 min-h-full rounded-lg">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configurações
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Estatísticas
          </button>
          <button
            onClick={() => setActiveTab('help')}
            className={`py-4 px-6 font-medium text-sm border-b-2 ${
              activeTab === 'help'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Ajuda
          </button>
        </nav>
      </div>

      {/* Conteúdo da aba Settings */}
      {activeTab === 'settings' && (
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações de Rastreamento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Configuração do Facebook Pixel */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Facebook Pixel</h3>
                <p className="text-gray-600 mb-4">
                  Configure o Facebook Pixel para rastreamento de conversões e otimização de anúncios.
                </p>
                
                <div className="mb-4">
                  <label htmlFor="pixelId" className="block text-gray-700 font-medium mb-2">
                    ID do Pixel
                  </label>
                  <input
                    type="text"
                    id="pixelId"
                    value={localPixelId}
                    onChange={(e) => setLocalPixelId(e.target.value)}
                    placeholder="Ex: 123456789012345"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Insira o ID do seu Facebook Pixel. Você pode encontrar isso no Gerenciador de Eventos do Facebook.
                  </p>
                </div>
              </div>

              {/* Configuração da UTMify */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Rastreamento UTM</h3>
                <p className="text-gray-600 mb-4">
                  Habilite o rastreamento UTM para capturar a origem do tráfego e campanhas de marketing.
                </p>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="utmEnabled"
                    checked={localUTMEnabled}
                    onChange={(e) => setLocalUTMEnabled(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="utmEnabled" className="ml-2 block text-gray-700 font-medium">
                    Habilitar UTMify
                  </label>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    O rastreamento UTM captura os parâmetros de origem (source), meio (medium) e campanha (campaign) 
                    em todas as URLs do seu site. Este recurso usa a biblioteca UTMify.
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conteúdo da aba Stats */}
      {activeTab === 'stats' && (
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Estatísticas de Rastreamento</h2>
            
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <TrackingStatsCard 
                  title="Visualizações de Página" 
                  value={mockStats.pageViews.value}
                  description={mockStats.pageViews.description}
                  trend={mockStats.pageViews.trend}
                  icon={<HiOutlineEye />}
                />
                <TrackingStatsCard 
                  title="Adições ao Carrinho" 
                  value={mockStats.addToCart.value}
                  description={mockStats.addToCart.description}
                  trend={mockStats.addToCart.trend}
                  icon={<HiOutlineShoppingCart />}
                />
                <TrackingStatsCard 
                  title="Taxa de Conversão" 
                  value={mockStats.conversion.value}
                  description={mockStats.conversion.description}
                  trend={mockStats.conversion.trend}
                  icon={<HiOutlineUser />}
                />
                <TrackingStatsCard 
                  title="Receita Total" 
                  value={mockStats.revenue.value}
                  description={mockStats.revenue.description}
                  trend={mockStats.revenue.trend}
                  icon={<HiOutlineCurrencyDollar />}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md text-center">
              <p className="text-gray-600">
                Os dados apresentados são exemplos. Para ver estatísticas reais, acesse o Facebook Business Manager ou UTMify.
              </p>
              <div className="flex justify-center mt-4 space-x-4">
                <a 
                  href="https://business.facebook.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Acessar Facebook Business
                </a>
                <a 
                  href="https://utmify.com.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Acessar UTMify
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da aba Help */}
      {activeTab === 'help' && (
        <div className="p-6">
          <div className="bg-white rounded-lg shadow p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Ajuda e Documentação</h2>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Facebook Pixel</h3>
                <p className="text-gray-600 mb-4">
                  O Facebook Pixel é uma ferramenta de análise que permite rastrear a atividade dos visitantes em seu site e 
                  otimizar suas campanhas publicitárias no Facebook.
                </p>
                
                <h4 className="font-medium text-gray-700 mt-4 mb-2">Como encontrar seu Pixel ID?</h4>
                <ol className="list-decimal list-inside text-gray-600 space-y-2">
                  <li>Acesse o <a href="https://business.facebook.com/events_manager" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Gerenciador de Eventos</a> do Facebook</li>
                  <li>Selecione seu Pixel na coluna esquerda</li>
                  <li>Clique em "Configurações"</li>
                  <li>Seu Pixel ID será exibido no topo da página</li>
                </ol>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">UTMify</h3>
                <p className="text-gray-600 mb-4">
                  A UTMify permite rastrear a origem do tráfego através de parâmetros UTM em suas URLs.
                </p>
                
                <h4 className="font-medium text-gray-700 mt-4 mb-2">Parâmetros UTM comuns:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li><strong>utm_source</strong>: Identifica a origem do tráfego (ex: google, facebook)</li>
                  <li><strong>utm_medium</strong>: Identifica o meio de marketing (ex: cpc, email)</li>
                  <li><strong>utm_campaign</strong>: Identifica a campanha específica (ex: black_friday)</li>
                  <li><strong>utm_content</strong>: Diferencia anúncios ou links similares (ex: logotipo, banner)</li>
                  <li><strong>utm_term</strong>: Identifica palavras-chave pagas (ex: sapatos_femininos)</li>
                </ul>
                
                <p className="text-gray-600 mt-4">
                  Para mais informações, acesse a <a href="https://utmify.com.br" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">documentação oficial da UTMify</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingManager; 