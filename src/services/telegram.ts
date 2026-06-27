// Service to wrap Telegram WebApp SDK functionality safely

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

// Check if app is running inside Telegram
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
};

// Retrieve the raw WebApp instance
export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined') {
    return window.Telegram?.WebApp;
  }
  return null;
};

// Fetch current user details
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initDataUnsafe && webApp.initDataUnsafe.user) {
    return webApp.initDataUnsafe.user as TelegramUser;
  }
  
  // Return fallback user for local web browser development
  return {
    id: 123456789,
    first_name: "Alexander",
    last_name: "Pierce",
    username: "alex_pierce_dev",
    language_code: "en",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  };
};

// Get current theme parameters
export const getTelegramThemeParams = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.themeParams) {
    return webApp.themeParams;
  }
  return null;
};

// Initialize WebApp and signal ready
export const initTelegramWebApp = () => {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
    
    // Enable closing confirmation to prevent accidental swipes
    if (webApp.enableClosingConfirmation) {
      webApp.enableClosingConfirmation();
    }
  }
};

// Trigger Haptic Feedback
export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.HapticFeedback) {
    try {
      if (['success', 'warning', 'error'].includes(type)) {
        webApp.HapticFeedback.notificationOccurred(type);
      } else {
        webApp.HapticFeedback.impactOccurred(type);
      }
    } catch (e) {
      console.warn("Failed to trigger haptic feedback:", e);
    }
  } else {
    console.log(`[Haptic Simulated] ${type}`);
  }
};

// Control Native Main Button
interface MainButtonConfig {
  text: string;
  color?: string;
  textColor?: string;
  onClick: () => void;
  isVisible?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
}

let activeClickCallback: (() => void) | null = null;

export const configureMainButton = (config: MainButtonConfig) => {
  const webApp = getTelegramWebApp();
  if (!webApp || !webApp.MainButton) {
    return {
      update: (newConfig: Partial<MainButtonConfig>) => console.log("[MainButton Simulated Update]", newConfig),
      hide: () => console.log("[MainButton Simulated Hide]"),
      show: () => console.log("[MainButton Simulated Show]")
    };
  }

  const btn = webApp.MainButton;

  // Cleanup old click handler
  if (activeClickCallback) {
    btn.offClick(activeClickCallback);
  }

  // Set new configs
  btn.setText(config.text);
  
  if (config.color) btn.setParams({ color: config.color });
  if (config.textColor) btn.setParams({ text_color: config.textColor });
  
  activeClickCallback = config.onClick;
  btn.onClick(activeClickCallback);

  if (config.isVisible) {
    btn.show();
  } else {
    btn.hide();
  }

  if (config.isActive !== false) {
    btn.enable();
  } else {
    btn.disable();
  }

  if (config.isLoading) {
    btn.showProgress();
  } else {
    btn.hideProgress();
  }

  return {
    update: (newParams: Partial<MainButtonConfig>) => {
      if (newParams.text) btn.setText(newParams.text);
      if (newParams.color || newParams.textColor) {
        btn.setParams({
          color: newParams.color,
          text_color: newParams.textColor
        });
      }
      if (newParams.onClick) {
        btn.offClick(activeClickCallback);
        activeClickCallback = newParams.onClick;
        btn.onClick(activeClickCallback);
      }
      if (newParams.isVisible !== undefined) {
        newParams.isVisible ? btn.show() : btn.hide();
      }
      if (newParams.isActive !== undefined) {
        newParams.isActive ? btn.enable() : btn.disable();
      }
      if (newParams.isLoading !== undefined) {
        newParams.isLoading ? btn.showProgress() : btn.hideProgress();
      }
    },
    hide: () => btn.hide(),
    show: () => btn.show()
  };
};

export const hideMainButton = () => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.MainButton) {
    webApp.MainButton.hide();
  }
};
