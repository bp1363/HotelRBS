/**
 * Telr Payment Gateway Integration Service
 * 
 * This service handles all interactions with the Telr payment gateway.
 * All API calls are proxied through the backend to avoid CORS issues.
 * 
 * Flow:
 * 1. Create order → Get payment URL
 * 2. Redirect customer to Telr payment page
 * 3. Customer completes payment
 * 4. Telr redirects back to success/failure/cancel URL
 * 5. Verify payment status via status check API
 */

// Backend proxy endpoints (to avoid CORS)
const BACKEND_API_BASE = 'http://127.0.0.1:5001';
const CREATE_ORDER_ENDPOINT = `${BACKEND_API_BASE}/api/telr/create-order`;
const CHECK_STATUS_ENDPOINT = `${BACKEND_API_BASE}/api/telr/check-status`;

// No credentials needed on frontend - handled by backend proxy

/**
 * Create Order Request Interface
 */
interface CreateOrderRequest {
  cartId: string;
  amount: string; // e.g., "1" or "12.99"
  currency: string; // e.g., "AED", "USD"
  description: string;
  customer: {
    ref: string; // Customer ID or reference
    email: string;
    forenames: string;
    surname: string;
    addressLine1: string;
    city: string;
    country: string; // ISO country code
    phone: string;
  };
  returnUrls: {
    authorised: string;
    declined: string;
    cancelled: string;
  };
}

/**
 * Create Order Response Interface
 */
interface CreateOrderResponse {
  method: string;
  trace: string;
  order: {
    ref: string; // Telr order reference
    url: string; // Payment page URL to redirect customer
    cartid: string;
    test: number;
    amount: string;
    currency: string;
    description: string;
  };
}

/**
 * Check Order Status Response Interface
 */
interface CheckOrderStatusResponse {
  method: string;
  trace: string;
  order: {
    ref: string;
    cartid: string;
    test: number;
    amount: string;
    currency: string;
    description: string;
    status: {
      code: number; // 3 = Authorised, 2 = Declined, -1 = Cancelled, etc.
      text: string; // "Authorised", "Declined", "Cancelled"
    };
    transaction: {
      ref: string;
      type: string;
      class: string;
      status: string;
      code: string;
      message: string;
    };
    paymethod?: string;
    card?: {
      last4: string;
      type: {
        name: string;
        code: string;
      };
      country: {
        name: string;
        code: string;
      };
      expiry: {
        month: string;
        year: string;
      };
    };
  };
}

/**
 * Create a payment order with Telr (via backend proxy)
 * 
 * @param orderData - Order details including customer info and amounts
 * @returns Promise with order reference and payment URL
 */
export const createTelrOrder = async (
  orderData: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  try {
    console.log('🔐 Creating Telr payment order via backend proxy...');
    console.log('💰 Amount:', orderData.amount, orderData.currency);

    // Send request to backend proxy (not directly to Telr)
    const response = await fetch(CREATE_ORDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create payment order');
    }

    const data: CreateOrderResponse = result.data;
    
    // Validate response has required fields
    if (!data || !data.order || !data.order.ref || !data.order.url) {
      console.error('❌ Invalid Telr response:', data);
      throw new Error('Invalid response from payment gateway. Please check backend configuration.');
    }
    
    console.log('✅ Telr order created successfully');
    console.log('📋 Order Reference:', data.order.ref);
    console.log('🔗 Payment URL:', data.order.url);

    return data;
  } catch (error) {
    console.error('❌ Error creating Telr order:', error);
    throw error;
  }
};

/**
 * Check the status of a payment order (via backend proxy)
 * 
 * @param orderRef - Telr order reference from create response
 * @returns Promise with order status and transaction details
 */
export const checkTelrOrderStatus = async (
  orderRef: string
): Promise<CheckOrderStatusResponse> => {
  try {
    console.log('🔍 Checking Telr order status via backend proxy...');
    console.log('📋 Order Reference:', orderRef);

    // Send request to backend proxy (not directly to Telr)
    const response = await fetch(CHECK_STATUS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderRef })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to check payment status');
    }

    const data: CheckOrderStatusResponse = result.data;
    
    console.log('✅ Order status retrieved');
    console.log('💳 Status:', data.order.status.text, `(${data.order.status.code})`);
    console.log('🔖 Transaction Ref:', data.order.transaction?.ref);

    return data;
  } catch (error) {
    console.error('❌ Error checking Telr order status:', error);
    throw error;
  }
};

/**
 * Helper function to interpret Telr status codes
 * 
 * @param statusCode - Telr status code
 * @returns Human-readable status
 */
export const interpretTelrStatus = (statusCode: number): string => {
  const statusMap: { [key: number]: string } = {
    '-2': 'Blocked',
    '-1': 'Cancelled',
    '0': 'Not Paid',
    '1': 'Pending',
    '2': 'Declined',
    '3': 'Authorised',
    '4': 'Void',
    '5': 'Credited',
    '6': 'Settled',
    '7': 'Refunded'
  };

  return statusMap[statusCode] || 'Unknown';
};

/**
 * Check if payment was successful
 * 
 * @param statusCode - Telr status code
 * @returns true if payment is authorised/successful
 */
export const isPaymentSuccessful = (statusCode: number): boolean => {
  // Status code 3 = Authorised (successful payment)
  return statusCode === 3;
};

/**
 * Environment configuration helper
 * 
 * Note: Credentials are managed by backend for security
 */
export const getTelrEnvironment = () => {
  return {
    backendUrl: BACKEND_API_BASE,
    // Credentials managed server-side for security
  };
};

