/**
 * Telr Payment Gateway Configuration
 * 
 * Store your Telr credentials here or use environment variables
 * 
 * SECURITY NOTE: Never commit real credentials to version control!
 * Use environment variables for production.
 */

export const TELR_CONFIG = {
  // Test/Sandbox credentials
  test: {
    storeId: import.meta.env.VITE_TELR_TEST_STORE_ID || '',
    authKey: import.meta.env.VITE_TELR_TEST_AUTH_KEY || '',
  },
  
  // Live/Production credentials
  live: {
    storeId: import.meta.env.VITE_TELR_LIVE_STORE_ID || '',
    authKey: import.meta.env.VITE_TELR_LIVE_AUTH_KEY || '',
  },
  
  // Current environment
  useTestMode: import.meta.env.VITE_TELR_USE_TEST_MODE !== 'false', // Default to test mode
  
  // Return URLs for different payment outcomes
  returnUrls: {
    authorised: `${window.location.origin}/payment/success`,
    declined: `${window.location.origin}/payment/failure`,
    cancelled: `${window.location.origin}/payment/cancelled`,
  },
  
  // Webhook URL (configure in backend)
  webhookUrl: import.meta.env.VITE_TELR_WEBHOOK_URL || '',
  
  // Supported currencies
  supportedCurrencies: ['AED', 'USD', 'EUR', 'GBP', 'SAR'],
  
  // Default currency
  defaultCurrency: 'AED',
};

/**
 * Get current Telr credentials based on environment
 */
export const getTelrCredentials = () => {
  return TELR_CONFIG.useTestMode ? TELR_CONFIG.test : TELR_CONFIG.live;
};

/**
 * Get return URLs for payment
 */
export const getTelrReturnUrls = () => {
  return TELR_CONFIG.returnUrls;
};

/**
 * Check if in test mode
 */
export const isTelrTestMode = () => {
  return TELR_CONFIG.useTestMode;
};

