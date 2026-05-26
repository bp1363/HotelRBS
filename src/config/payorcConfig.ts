/**
 * PayORC Payment Gateway Configuration
 * 
 * Configuration for PayORC payment gateway integration
 * Reference: https://api.payorc.com/#api-manage-payment
 * 
 * SECURITY NOTE: Never commit real credentials to version control!
 * Use environment variables for production.
 */

export const PAYORC_CONFIG = {
  // API Base URL (from Postman collection)
  apiBaseUrl: import.meta.env.VITE_PAYORC_API_BASE_URL || 'https://nodeserver.payorc.com/api/v1',
  
  // Test/Sandbox credentials
  test: {
    merchantKey: import.meta.env.VITE_PAYORC_TEST_MERCHANT_KEY || '',
    merchantSecret: import.meta.env.VITE_PAYORC_TEST_MERCHANT_SECRET || '',
  },
  
  // Live/Production credentials
  live: {
    merchantKey: import.meta.env.VITE_PAYORC_LIVE_MERCHANT_KEY || '',
    merchantSecret: import.meta.env.VITE_PAYORC_LIVE_MERCHANT_SECRET || '',
  },
  
  // Current environment
  useTestMode: import.meta.env.VITE_PAYORC_USE_TEST_MODE !== 'false', // Default to test mode
  
  // Return URLs for different payment outcomes
  returnUrls: {
    success: `${window.location.origin}/payment/success`,
    cancel: `${window.location.origin}/payment/cancelled`,
    failure: `${window.location.origin}/payment/failure`,
  },
  
  // Webhook URL (configure in backend)
  webhookUrl: import.meta.env.VITE_PAYORC_WEBHOOK_URL || '',
  
  // Supported currencies (update based on PayORC documentation)
  supportedCurrencies: ['AED', 'USD', 'EUR', 'GBP', 'SAR'],
  
  // Default currency
  defaultCurrency: 'AED',
};

/**
 * Get current PayORC credentials based on environment
 */
export const getPayORCCredentials = () => {
  return PAYORC_CONFIG.useTestMode ? PAYORC_CONFIG.test : PAYORC_CONFIG.live;
};

/**
 * Get return URLs for payment
 */
export const getPayORCReturnUrls = () => {
  return PAYORC_CONFIG.returnUrls;
};

/**
 * Check if in test mode
 */
export const isPayORCTestMode = () => {
  return PAYORC_CONFIG.useTestMode;
};

/**
 * Get API base URL
 */
export const getPayORCApiBaseUrl = () => {
  return PAYORC_CONFIG.apiBaseUrl;
};

