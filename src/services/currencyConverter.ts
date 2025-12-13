/**
 * Currency Conversion Service
 * 
 * Since the hotel API only returns prices in USD, this service converts
 * USD prices to the user's preferred currency for display purposes.
 * 
 * Note: Payment is still processed in AED only (Telr requirement)
 */

// Exchange rates relative to USD (as of common rates)
// These should ideally be fetched from a real-time API, but for now using static rates
export const EXCHANGE_RATES: { [key: string]: { rate: number; symbol: string; name: string } } = {
  'USD': { rate: 1, symbol: '$', name: 'US Dollar' },
  'AED': { rate: 3.67, symbol: 'AED', name: 'UAE Dirham' },
  'SAR': { rate: 3.75, symbol: 'SAR', name: 'Saudi Riyal' },
  'EUR': { rate: 0.92, symbol: '€', name: 'Euro' },
  'GBP': { rate: 0.79, symbol: '£', name: 'British Pound' },
  'INR': { rate: 83.12, symbol: '₹', name: 'Indian Rupee' },
  'PKR': { rate: 278.50, symbol: 'PKR', name: 'Pakistani Rupee' },
  'BDT': { rate: 109.50, symbol: 'BDT', name: 'Bangladeshi Taka' },
  'EGP': { rate: 30.90, symbol: 'EGP', name: 'Egyptian Pound' },
  'JPY': { rate: 149.50, symbol: '¥', name: 'Japanese Yen' },
  'CNY': { rate: 7.24, symbol: '¥', name: 'Chinese Yuan' },
  'AUD': { rate: 1.52, symbol: 'A$', name: 'Australian Dollar' },
  'CAD': { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar' },
};

/**
 * Convert USD amount to target currency
 * @param usdAmount - Amount in USD
 * @param targetCurrency - Target currency code (e.g., 'AED', 'INR')
 * @returns Converted amount
 */
export const convertCurrency = (usdAmount: number, targetCurrency: string): number => {
  const rate = EXCHANGE_RATES[targetCurrency]?.rate || 1;
  return usdAmount * rate;
};

/**
 * Format price with currency symbol
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted price string
 */
export const formatPrice = (amount: number, currency: string, decimals: number = 2): string => {
  const currencyInfo = EXCHANGE_RATES[currency] || EXCHANGE_RATES['USD'];
  const symbol = currencyInfo.symbol;
  
  // Format number with commas and decimals
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return `${symbol} ${formatted}`;
};

/**
 * Convert and format price in one go
 * @param usdAmount - Amount in USD
 * @param targetCurrency - Target currency code
 * @param decimals - Number of decimal places
 * @returns Formatted converted price
 */
export const convertAndFormatPrice = (
  usdAmount: number, 
  targetCurrency: string, 
  decimals: number = 2
): string => {
  const converted = convertCurrency(usdAmount, targetCurrency);
  return formatPrice(converted, targetCurrency, decimals);
};

/**
 * Get currency symbol
 * @param currency - Currency code
 * @returns Currency symbol
 */
export const getCurrencySymbol = (currency: string): string => {
  return EXCHANGE_RATES[currency]?.symbol || currency;
};

/**
 * Get currency name
 * @param currency - Currency code
 * @returns Currency name
 */
export const getCurrencyName = (currency: string): string => {
  return EXCHANGE_RATES[currency]?.name || currency;
};

/**
 * Check if currency is supported
 * @param currency - Currency code
 * @returns true if supported
 */
export const isCurrencySupported = (currency: string): boolean => {
  return currency in EXCHANGE_RATES;
};

/**
 * Get all supported currencies
 * @returns Array of currency codes
 */
export const getSupportedCurrencies = (): string[] => {
  return Object.keys(EXCHANGE_RATES);
};

/**
 * Convert price object from USD to target currency
 * Useful for converting entire hotel objects
 * @param priceInUSD - Original price in USD
 * @param targetCurrency - Target currency
 * @returns Object with converted price and currency
 */
export const convertPriceObject = (
  priceInUSD: number,
  targetCurrency: string
): { price: number; currency: string; formatted: string } => {
  const converted = convertCurrency(priceInUSD, targetCurrency);
  const formatted = formatPrice(converted, targetCurrency);
  
  return {
    price: converted,
    currency: targetCurrency,
    formatted
  };
};

/**
 * Convert hotel result prices
 * Takes a hotel object and converts all price fields from USD to target currency
 * @param hotel - Hotel object with USD prices
 * @param targetCurrency - Target currency
 * @returns Hotel object with converted prices
 */
export const convertHotelPrices = (hotel: any, targetCurrency: string): any => {
  if (!hotel) return hotel;
  
  const convertedHotel = { ...hotel };
  
  // Convert main price
  if (hotel.Price && typeof hotel.Price === 'number') {
    convertedHotel.Price = convertCurrency(hotel.Price, targetCurrency);
  } else if (hotel.Price && typeof hotel.Price === 'string') {
    const usdPrice = parseFloat(hotel.Price);
    if (!isNaN(usdPrice)) {
      convertedHotel.Price = convertCurrency(usdPrice, targetCurrency);
    }
  }
  
  // Update currency code
  convertedHotel.Currency = targetCurrency;
  convertedHotel.OriginalCurrency = 'USD'; // Keep track of original
  
  // Convert room prices if available
  if (hotel.Rooms) {
    if (Array.isArray(hotel.Rooms)) {
      convertedHotel.Rooms = hotel.Rooms.map((room: any) => convertRoomPrices(room, targetCurrency));
    } else {
      convertedHotel.Rooms = convertRoomPrices(hotel.Rooms, targetCurrency);
    }
  }
  
  return convertedHotel;
};

/**
 * Convert room prices
 * @param room - Room object with USD prices
 * @param targetCurrency - Target currency
 * @returns Room object with converted prices
 */
export const convertRoomPrices = (room: any, targetCurrency: string): any => {
  if (!room) return room;
  
  const convertedRoom = { ...room };
  
  // Convert TotalFare
  if (room.TotalFare) {
    const usdPrice = typeof room.TotalFare === 'number' ? room.TotalFare : parseFloat(room.TotalFare);
    if (!isNaN(usdPrice)) {
      convertedRoom.TotalFare = convertCurrency(usdPrice, targetCurrency);
    }
  }
  
  // Convert TotalTax if present
  if (room.TotalTax) {
    const usdTax = typeof room.TotalTax === 'number' ? room.TotalTax : parseFloat(room.TotalTax);
    if (!isNaN(usdTax)) {
      convertedRoom.TotalTax = convertCurrency(usdTax, targetCurrency);
    }
  }
  
  // Convert BasePrice if present
  if (room.BasePrice) {
    const usdBasePrice = typeof room.BasePrice === 'number' ? room.BasePrice : parseFloat(room.BasePrice);
    if (!isNaN(usdBasePrice)) {
      convertedRoom.BasePrice = convertCurrency(usdBasePrice, targetCurrency);
    }
  }
  
  // Update currency
  convertedRoom.Currency = targetCurrency;
  convertedRoom.OriginalCurrency = 'USD';
  
  return convertedRoom;
};

/**
 * Log conversion for debugging
 * @param usdAmount - Original USD amount
 * @param targetCurrency - Target currency
 */
export const logConversion = (usdAmount: number, targetCurrency: string): void => {
  const converted = convertCurrency(usdAmount, targetCurrency);
  console.log(`💱 Currency Conversion: $${usdAmount} USD → ${formatPrice(converted, targetCurrency)} (Rate: ${EXCHANGE_RATES[targetCurrency]?.rate})`);
};

