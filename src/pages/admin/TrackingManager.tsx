import { useState, useEffect } from 'react';
import customFetch from '../../utils/customFetch';
import toast from 'react-hot-toast';

// Definição de tipos para os dados de rastreamento
interface TrackingConfig {
  id: string;
  name: string;
  type: 'facebook' | 'utmify' | 'gtm'; // Tipos de rastreamento suportados
  pixelId?: string; // ID do Pixel do Facebook
  gtmId?: string; // ID do Google Tag Manager
  utmifySettings?: {
    preventXcodSck: boolean;
    preventSubids: boolean;
    [key: string]: boolean; // Permite acessar propriedades dinamicamente
  };
  isActive: boolean;
  events?: Array<{
    name: string;
    isActive: boolean;
    description: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Eventos padrão para rastreamento
const defaultEvents = [
  { name: 'PageView', isActive: true, description: 'Visualização de página' },
  { name: 'ViewContent', isActive: true, description: 'Visualização de produto' },
  { name: 'AddToCart', isActive: true, description: 'Adição ao carrinho' },
  { name: 'InitiateCheckout', isActive: true, description: 'Início de checkout' },
  { name: 'Purchase', isActive: true, description: 'Compra finalizada' },
  { name: 'CompleteRegistration', isActive: true, description: 'Cadastro completo' },
  { name: 'Contact', isActive: false, description: 'Contato realizado' },
  { name: 'Search', isActive: true, description: 'Pesquisa no site' },
];

const TrackingManager = () => {
  const [trackingConfigs, setTrackingConfigs] = useState<TrackingConfig[]>([]);
  const [currentConfig, setCurrentConfig] = useState<TrackingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'facebook' | 'utmify' | 'gtm' | 'utm-builder'>('facebook');
  const [testUrl, setTestUrl] = useState('');
  const [utmParams, setUtmParams] = useState({
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: ''
  });
  const [generatedUrl, setGeneratedUrl] = useState('');

  // Carregar configurações de rastreamento
  useEffect(() => {
    fetchTrackingConfigs();
  }, []);

  const fetchTrackingConfigs = async () => {
    try {
      setIsLoading(true);
      // Simular dados para demonstração
      setTimeout(() => {
        const defaultConfig = {
          id: '1',
          name: 'Pixel do Facebook',
          type: 'facebook',
          pixelId: '',
          isActive: false,
          events: [...defaultEvents],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as TrackingConfig;
        
        setTrackingConfigs([defaultConfig]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao carregar configurações de rastreamento:', error);
      toast.error('Falha ao carregar configurações de rastreamento');
      setIsLoading(false);
    }
  };

  const handleEditConfig = (config: TrackingConfig) => {
    setCurrentConfig(config);
    setShowForm(true);
    setActiveTab(config.type);
  };

  const handleAddConfig = (type: 'facebook' | 'utmify' | 'gtm') => {
    const newConfig: TrackingConfig = {
      id: Date.now().toString(),
      name: type === 'facebook' ? 'Pixel do Facebook' : 
            type === 'utmify' ? 'UTMify' : 'Google Tag Manager',
      type,
      pixelId: '',
      gtmId: '',
      utmifySettings: {
        preventXcodSck: true,
        preventSubids: true
      },
      isActive: false,
      events: [...defaultEvents],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentConfig(newConfig);
    setShowForm(true);
    setActiveTab(type);
  };

  const handleSaveConfig = async () => {
    if (!currentConfig) return;

    try {
      setIsLoading(true);
      // Simular salvamento
      setTimeout(() => {
        const updatedConfig = {
          ...currentConfig,
          updatedAt: new Date().toISOString()
        };

        if (trackingConfigs.some(config => config.id === currentConfig.id)) {
          setTrackingConfigs(prev => 
            prev.map(config => config.id === currentConfig.id ? updatedConfig : config)
          );
          toast.success('Configuração atualizada com sucesso');
        } else {
          setTrackingConfigs(prev => [...prev, updatedConfig]);
          toast.success('Configuração criada com sucesso');
        }

        setShowForm(false);
        setCurrentConfig(null);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Falha ao salvar configuração');
      setIsLoading(false);
    }
  };

  const handleUtmParamChange = (param: keyof typeof utmParams, value: string) => {
    setUtmParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const generateUtmUrl = () => {
    if (!testUrl) {
      toast.error('Informe uma URL base para gerar o link com UTM');
      return;
    }

    try {
      const url = new URL(testUrl);
      
      if (utmParams.source) url.searchParams.set('utm_source', utmParams.source);
      if (utmParams.medium) url.searchParams.set('utm_medium', utmParams.medium);
      if (utmParams.campaign) url.searchParams.set('utm_campaign', utmParams.campaign);
      if (utmParams.term) url.searchParams.set('utm_term', utmParams.term);
      if (utmParams.content) url.searchParams.set('utm_content', utmParams.content);

      setGeneratedUrl(url.toString());
    } catch (error) {
      toast.error('URL inválida. Certifique-se de incluir http:// ou https://');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gerenciamento de Rastreamento</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleAddConfig('facebook')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            + Facebook Pixel
          </button>
          <button
            onClick={() => handleAddConfig('utmify')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            disabled={isLoading}
          >
            + UTMify
          </button>
          <button
            onClick={() => handleAddConfig('gtm')}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
            disabled={isLoading}
          >
            + Google Tag Manager
          </button>
        </div>
      </div>

      {/* Tabs de navegação */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('facebook')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'facebook'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Facebook Pixel
          </button>
          <button
            onClick={() => setActiveTab('utmify')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'utmify'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            UTMify
          </button>
          <button
            onClick={() => setActiveTab('gtm')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'gtm'
                ? 'border-gray-500 text-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Google Tag Manager
          </button>
          <button
            onClick={() => setActiveTab('utm-builder')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'utm-builder'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gerador de UTM
          </button>
        </nav>
      </div>

      {activeTab === 'utm-builder' ? (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Gerador de URL com parâmetros UTM</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL Base
            </label>
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://www.seusite.com.br/pagina"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source (origem)
              </label>
              <input
                type="text"
                value={utmParams.source}
                onChange={(e) => handleUtmParamChange('source', e.target.value)}
                placeholder="facebook, google, instagram"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Ex: facebook, google, newsletter</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medium (mídia)
              </label>
              <input
                type="text"
                value={utmParams.medium}
                onChange={(e) => handleUtmParamChange('medium', e.target.value)}
                placeholder="cpc, email, social"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Ex: cpc, banner, email</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign (campanha)
              </label>
              <input
                type="text"
                value={utmParams.campaign}
                onChange={(e) => handleUtmParamChange('campaign', e.target.value)}
                placeholder="black_friday_2023"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Ex: promo_verao, black_friday</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Term (termo)
              </label>
              <input
                type="text"
                value={utmParams.term}
                onChange={(e) => handleUtmParamChange('term', e.target.value)}
                placeholder="sapatos+masculinos"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Ex: palavras-chave (para campanhas pagas)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (conteúdo)
              </label>
              <input
                type="text"
                value={utmParams.content}
                onChange={(e) => handleUtmParamChange('content', e.target.value)}
                placeholder="banner_topo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Ex: versão_a, banner_topo</p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <button
              onClick={generateUtmUrl}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
              disabled={!testUrl}
            >
              Gerar URL com UTM
            </button>
            
            {generatedUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Gerada com UTM
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={generatedUrl}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedUrl)
                        .then(() => toast.success('URL copiada'))
                        .catch(() => toast.error('Falha ao copiar. Tente manualmente.'));
                    }}
                    className="bg-gray-200 px-4 py-2 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-300"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <h3 className="mt-6 text-lg font-medium text-gray-900">Configurações de Rastreamento</h3>
          <p className="mt-2 text-sm text-gray-500">
            Esta funcionalidade está em desenvolvimento. Em breve você poderá configurar aqui o rastreamento para {activeTab === 'facebook' ? 'Facebook Pixel' : activeTab === 'utmify' ? 'UTMify' : 'Google Tag Manager'}.
          </p>
          <div className="mt-6">
            <button
              onClick={() => handleSaveConfig()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Iniciar configuração
            </button>
          </div>
        </div>
      )}

      {/* Código do UTMify */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Código do UTMify</h3>
        <p className="text-sm text-gray-600 mb-4">
          Copie o código abaixo e adicione-o ao seu site para começar a usar o UTMify para rastreamento:
        </p>
        
        <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-auto">
          <pre className="text-sm">
            <code>{`<!-- UTMify Tracking Code -->
<script
  src="https://cdn.utmify.com.br/scripts/utms/latest.js"
  data-utmify-prevent-xcod-sck
  data-utmify-prevent-subids
  async
  defer
></script>
<!-- End UTMify Tracking Code -->`}</code>
          </pre>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`<!-- UTMify Tracking Code -->
<script
  src="https://cdn.utmify.com.br/scripts/utms/latest.js"
  data-utmify-prevent-xcod-sck
  data-utmify-prevent-subids
  async
  defer
></script>
<!-- End UTMify Tracking Code -->`)
                .then(() => toast.success('Código copiado para a área de transferência'))
                .catch(() => toast.error('Falha ao copiar'));
            }}
            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
          >
            Copiar Código
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrackingManager; 