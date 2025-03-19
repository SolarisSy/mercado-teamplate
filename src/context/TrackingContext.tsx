import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthContext';

interface TrackingContextType {
  pixelId: string;
  setPixelId: (id: string) => void;
  isUTMEnabled: boolean;
  setIsUTMEnabled: (enabled: boolean) => void;
  saveTrackingSettings: () => Promise<boolean>;
}

// Chaves utilizadas para armazenar as configurações no localStorage
const PIXEL_ID_KEY = 'facebook_pixel_id';
const UTM_ENABLED_KEY = 'utmify_enabled';

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pixelId, setPixelId] = useState<string>('');
  const [isUTMEnabled, setIsUTMEnabled] = useState<boolean>(false);
  const { isAdminAuthenticated } = useAdminAuth();

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const storedPixelId = localStorage.getItem(PIXEL_ID_KEY);
    const storedUTMEnabled = localStorage.getItem(UTM_ENABLED_KEY);

    if (storedPixelId) {
      setPixelId(storedPixelId);
    }

    if (storedUTMEnabled) {
      setIsUTMEnabled(storedUTMEnabled === 'true');
    }
  }, []);

  // Implementar script do Facebook Pixel quando houver um ID
  useEffect(() => {
    if (pixelId) {
      // Remover script anterior se existir
      const existingScript = document.getElementById('facebook-pixel');
      if (existingScript) {
        existingScript.remove();
      }

      // Adicionar script do Facebook Pixel
      const script = document.createElement('script');
      script.id = 'facebook-pixel';
      script.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(script);

      // Adicionar noscript tag para usuários sem JavaScript
      const noscript = document.createElement('noscript');
      noscript.id = 'facebook-pixel-noscript';
      noscript.innerHTML = `
        <img height="1" width="1" style="display:none"
          src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"
        />
      `;
      document.body.appendChild(noscript);
    }

    return () => {
      // Limpar script do pixel ao desmontar
      const script = document.getElementById('facebook-pixel');
      const noscript = document.getElementById('facebook-pixel-noscript');
      
      if (script) script.remove();
      if (noscript) noscript.remove();
    };
  }, [pixelId]);

  // Implementar script UTMify quando habilitado
  useEffect(() => {
    if (isUTMEnabled) {
      // Remover script anterior se existir
      const existingScript = document.getElementById('utmify-script');
      if (existingScript) {
        existingScript.remove();
      }

      // Adicionar script da UTMify
      const script = document.createElement('script');
      script.id = 'utmify-script';
      script.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
      script.setAttribute('data-utmify-prevent-xcod-sck', '');
      script.setAttribute('data-utmify-prevent-subids', '');
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      // Limpar script da UTMify ao desabilitar
      if (!isUTMEnabled) {
        const script = document.getElementById('utmify-script');
        if (script) script.remove();
      }
    };
  }, [isUTMEnabled]);

  // Salvar configurações no localStorage
  const saveTrackingSettings = async (): Promise<boolean> => {
    try {
      localStorage.setItem(PIXEL_ID_KEY, pixelId);
      localStorage.setItem(UTM_ENABLED_KEY, isUTMEnabled.toString());
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações de rastreamento:', error);
      return false;
    }
  };

  return (
    <TrackingContext.Provider 
      value={{ 
        pixelId, 
        setPixelId, 
        isUTMEnabled, 
        setIsUTMEnabled,
        saveTrackingSettings 
      }}
    >
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
}; 