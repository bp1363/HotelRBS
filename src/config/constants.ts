// Application configuration constants
export const APP_CONFIG = {
  // Default search parameters
  DEFAULT_GUEST_NATIONALITY: "AE",
  DEFAULT_CURRENCY: "USD",
  
  // Default dates (fallback when no search parameters available)
  // These will be dynamically set to today/tomorrow
  DEFAULT_CHECK_IN: "2025-01-15",
  DEFAULT_CHECK_OUT: "2025-01-16",
  
  // API settings
  DEFAULT_RESPONSE_TIME: 120,
  DEFAULT_GUESTS: 2,
  DEFAULT_ROOMS: 1,
  DEFAULT_CHILDREN: 0,
  
  // Hotel search settings
  DEFAULT_HOTEL_LIMIT: 20,
} as const;

// Helper function to get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Helper function to get date N days from now
export const getDateFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};
