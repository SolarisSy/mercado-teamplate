import { useState, useEffect, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

interface AnalyticsConfig {
  facebookPixelId: string;
  googleAnalyticsId: string;
  utmifyEnabled: boolean;
  trackViewContent: boolean;
  trackAddToCart: boolean;
  trackInitiateCheckout: boolean;
  trackPurchase: boolean;
  customEvents: { name: string; enabled: boolean }[];
}

const defaultConfig: AnalyticsConfig = {
  facebookPixelId: "",
  googleAnalyticsId: "",
  utmifyEnabled: false,
  trackViewContent: true,
  trackAddToCart: true,
  trackInitiateCheckout: true,
  trackPurchase: true,
  customEvents: [
    { name: "page_view", enabled: true },
    { name: "search", enabled: true },
    { name: "category_view", enabled: true }
  ]
};

const AnalyticsManager = () => {
  const [config, setConfig] = useState<AnalyticsConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newEventName, setNewEventName] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, "settings", "analytics");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setConfig(docSnap.data() as AnalyticsConfig);
        } else {
          // Se não existir, use os valores padrão
          setConfig(defaultConfig);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
        toast.error("Não foi possível carregar as configurações de analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleAddCustomEvent = () => {
    if (!newEventName.trim()) {
      toast.error("O nome do evento não pode estar vazio");
      return;
    }

    if (config.customEvents.find(event => event.name === newEventName)) {
      toast.error("Este evento já existe");
      return;
    }

    setConfig({
      ...config,
      customEvents: [...config.customEvents, { name: newEventName, enabled: true }]
    });
    setNewEventName("");
  };

  const handleToggleCustomEvent = (index: number) => {
    const updatedEvents = [...config.customEvents];
    updatedEvents[index].enabled = !updatedEvents[index].enabled;
    setConfig({
      ...config,
      customEvents: updatedEvents
    });
  };

  const handleDeleteCustomEvent = (index: number) => {
    const updatedEvents = [...config.customEvents];
    updatedEvents.splice(index, 1);
    setConfig({
      ...config,
      customEvents: updatedEvents
    });
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, "settings", "analytics");
      await setDoc(docRef, config);
      toast.success("Configurações salvas com sucesso");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Analytics e Pixel</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Configurações de Rastreamento</h2>
        
        {/* Facebook Pixel */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID do Pixel do Facebook
          </label>
          <input
            type="text"
            name="facebookPixelId"
            value={config.facebookPixelId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: 123456789012345"
          />
          <p className="mt-1 text-sm text-gray-500">
            Encontre seu Pixel ID no <a href="https://business.facebook.com/events_manager/pixels/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Business Manager</a>
          </p>
        </div>
        
        {/* Google Analytics */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID do Google Analytics (GA4)
          </label>
          <input
            type="text"
            name="googleAnalyticsId"
            value={config.googleAnalyticsId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: G-XXXXXXXXXX"
          />
        </div>
        
        {/* UTMify */}
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="utmifyEnabled"
              name="utmifyEnabled"
              checked={config.utmifyEnabled}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="utmifyEnabled" className="ml-2 block text-sm font-medium text-gray-700">
              Habilitar UTMify
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Ativa o rastreamento avançado de UTMs com o UTMify
          </p>
          
          {config.utmifyEnabled && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">O seguinte script será adicionado ao seu site:</p>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {`<script
  src="https://cdn.utmify.com.br/scripts/utms/latest.js"
  data-utmify-prevent-xcod-sck
  data-utmify-prevent-subids
  async
  defer
></script>`}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Eventos de Rastreamento</h2>
        <p className="mb-4 text-sm text-gray-600">
          Configure quais eventos serão rastreados automaticamente pelo Facebook Pixel
        </p>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="trackViewContent"
              name="trackViewContent"
              checked={config.trackViewContent}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="trackViewContent" className="ml-2 block text-sm font-medium text-gray-700">
              ViewContent (visualização de produto)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="trackAddToCart"
              name="trackAddToCart"
              checked={config.trackAddToCart}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="trackAddToCart" className="ml-2 block text-sm font-medium text-gray-700">
              AddToCart (adicionar ao carrinho)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="trackInitiateCheckout"
              name="trackInitiateCheckout"
              checked={config.trackInitiateCheckout}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="trackInitiateCheckout" className="ml-2 block text-sm font-medium text-gray-700">
              InitiateCheckout (iniciar checkout)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="trackPurchase"
              name="trackPurchase"
              checked={config.trackPurchase}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="trackPurchase" className="ml-2 block text-sm font-medium text-gray-700">
              Purchase (compra finalizada)
            </label>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-2">Eventos Personalizados</h3>
        <div className="space-y-3 mb-4">
          {config.customEvents.map((event, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`customEvent-${index}`}
                  checked={event.enabled}
                  onChange={() => handleToggleCustomEvent(index)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`customEvent-${index}`} className="ml-2 block text-sm font-medium text-gray-700">
                  {event.name}
                </label>
              </div>
              <button
                onClick={() => handleDeleteCustomEvent(index)}
                className="text-red-600 hover:text-red-800"
                title="Remover evento"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center">
          <input
            type="text"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nome do novo evento"
          />
          <button
            onClick={handleAddCustomEvent}
            className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors"
          >
            Adicionar
          </button>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          disabled={isSaving}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  );
};

export default AnalyticsManager; 