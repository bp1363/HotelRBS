/**
 * PayORC Payment Gateway Integration Service
 * 
 * This service handles all interactions with the PayORC payment gateway.
 * Based on PayORC API documentation from Postman collection.
 * 
 * All API calls should be proxied through the backend to avoid CORS issues
 * and to keep credentials secure.
 * 
 * API Base URL: https://nodeserver.payorc.com/api/v1
 * Authentication: merchant-key and merchant-secret in headers
 * 
 * Flow:
 * 1. Create order → Get order ID and payment URL
 * 2. Redirect customer to PayORC payment page
 * 3. Customer completes payment
 * 4. PayORC redirects back to success/failure/cancel URL
 * 5. Verify payment status via transaction-details API
 */

import { getPayORCApiBaseUrl, getPayORCReturnUrls } from '@/config/payorcConfig';

// Backend proxy endpoints (to avoid CORS and keep credentials secure)
const BACKEND_API_BASE = import.meta.env.VITE_BACKEND_API_BASE || 'http://127.0.0.1:5001';
const CREATE_ORDER_ENDPOINT = `${BACKEND_API_BASE}/api/payorc/create-order`;
const CHECK_STATUS_ENDPOINT = `${BACKEND_API_BASE}/api/payorc/check-status`;
const MANAGE_PAYMENT_ENDPOINT = `${BACKEND_API_BASE}/api/payorc/manage-payment`;

/**
 * PayORC Order Item Interface
 */
export interface PayORCItem {
  title: string;
  description: string;
  quantity: number;
  unit_price: string;
  discount_amount?: string;
  reference_id?: string;
  image_url?: string;
  product_url?: string;
  gender?: string;
  category?: string;
  color?: string;
  product_material?: string;
  size_type?: string;
  size?: string;
  brand?: string;
  is_refundable?: boolean;
}

/**
 * Create Order Request Interface
 * Based on PayORC API structure from Postman collection
 */
export interface CreateOrderRequest {
  // Customer information
  customer: {
    m_customer_id?: string; // Merchant customer ID
    name: string; // Full name
    email: string;
    mobile: string; // Phone number without country code
    code?: string; // Country code (e.g., "971", "966")
  };
  
  // Order information
  order: {
    m_order_id: string; // Merchant order ID (your internal order reference)
    amount: string; // Amount as string (e.g., "100.00")
    currency: string; // Currency code (e.g., "AED", "USD")
    description?: string;
    quantity?: string;
    convenience_fee?: string; // Optional convenience fee
  };
  
  // Order items
  items?: PayORCItem[];
  
  // Billing address
  billing?: {
    address_line1?: string;
    address_line2?: string;
    city?: string;
    province?: string;
    country?: string; // ISO country code (e.g., "AE")
    pin?: string; // Postal/ZIP code
  };
  
  // Shipping address (optional)
  shipping?: {
    shipping_name?: string;
    shipping_email?: string;
    shipping_code?: string;
    shipping_mobile?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    province?: string;
    country?: string;
    pin?: string;
    location_pin?: string;
    shipping_currency?: string;
    shipping_amount?: string;
  };
  
  // Return URLs
  returnUrls: {
    success: string;
    cancel: string;
    failure: string;
  };
  
  // Optional metadata
  metadata?: Record<string, any>;
}

/**
 * Create Order Response Interface
 * Based on PayORC API response structure
 */
export interface CreateOrderResponse {
  order_id?: string; // PayORC order ID (p_order_id)
  transaction_id?: string; // Transaction ID if available
  payment_url?: string; // URL to redirect customer for payment (hosted page)
  iframe_url?: string; // URL for iframe embedding (iframe mode)
  status?: string; // Order status
  amount?: string;
  currency?: string;
  // Additional response fields may be present
  [key: string]: any;
}

/**
 * Check Order Status Request
 */
export interface CheckOrderStatusRequest {
  p_order_id: string; // PayORC order ID from create response
}

/**
 * Check Order Status Response Interface
 * Based on PayORC transaction-details API
 */
export interface CheckOrderStatusResponse {
  p_order_id: string;
  transaction_id?: string;
  status: string; // Payment status
  amount?: string;
  currency?: string;
  payment_method?: string;
  card_bin?: string;
  processor?: string;
  created_at?: string;
  updated_at?: string;
  // Additional fields from PayORC response
  [key: string]: any;
}

/**
 * Manage Payment Request Interface
 * For VOID, REFUND, etc.
 */
export interface ManagePaymentRequest {
  action: 'VOID' | 'REFUND' | 'CAPTURE'; // Payment action
  transaction_id: string; // Transaction ID from order
  amount?: {
    currencyCode: string;
    value: string;
  };
  reason?: string; // Reason for void/refund
}

/**
 * Manage Payment Response Interface
 */
export interface ManagePaymentResponse {
  success: boolean;
  transaction_id: string;
  action: string;
  status?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Create a payment order with PayORC (via backend proxy)
 * 
 * @param orderData - Order details following PayORC API structure
 * @returns Promise with order ID and payment URL
 */
export const createPayORCOrder = async (
  orderData: CreateOrderRequest
): Promise<CreateOrderResponse> => {
  try {
    console.log('🔐 Creating PayORC order via backend proxy...');
    console.log('💰 Amount:', orderData.order.amount, orderData.order.currency);

    // Use return URLs from config if not provided
    const returnUrls = orderData.returnUrls || getPayORCReturnUrls();

    // Send request to backend proxy (not directly to PayORC)
    const response = await fetch(CREATE_ORDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...orderData,
        returnUrls,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create order');
    }

    const data: CreateOrderResponse = result.data;
    
    // Validate response has required fields
    if (!data || !data.order_id) {
      console.error('❌ Invalid PayORC response:', data);
      throw new Error('Invalid response from payment gateway. Please check backend configuration.');
    }
    
    console.log('✅ PayORC order created successfully');
    console.log('📋 Order ID (p_order_id):', data.order_id);
    if (data.iframe_url) {
      console.log('🖼️ Iframe URL:', data.iframe_url);
    }
    if (data.payment_url) {
      console.log('🔗 Payment URL (redirect):', data.payment_url);
    }
    if (data.transaction_id) {
      console.log('🔖 Transaction ID:', data.transaction_id);
    }

    return data;
  } catch (error) {
    console.error('❌ Error creating PayORC order:', error);
    throw error;
  }
};

/**
 * Check the status of an order (via backend proxy)
 * Uses PayORC transaction-details API
 * 
 * @param pOrderId - PayORC order ID (p_order_id) from create response
 * @returns Promise with order status and transaction details
 */
export const checkPayORCOrderStatus = async (
  pOrderId: string
): Promise<CheckOrderStatusResponse> => {
  try {
    console.log('🔍 Checking PayORC order status via backend proxy...');
    console.log('📋 Order ID (p_order_id):', pOrderId);

    // Send request to backend proxy (not directly to PayORC)
    const response = await fetch(CHECK_STATUS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_order_id: pOrderId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to check order status');
    }

    const data: CheckOrderStatusResponse = result.data;
    
    console.log('✅ Order status retrieved');
    console.log('💳 Status:', data.status);
    if (data.transaction_id) {
      console.log('🔖 Transaction ID:', data.transaction_id);
    }

    return data;
  } catch (error) {
    console.error('❌ Error checking PayORC order status:', error);
    throw error;
  }
};

/**
 * Manage payment (VOID, REFUND, CAPTURE) via backend proxy
 * 
 * @param manageData - Payment management details
 * @returns Promise with management result
 */
export const managePayORCPayment = async (
  manageData: ManagePaymentRequest
): Promise<ManagePaymentResponse> => {
  try {
    console.log('🔄 Managing PayORC payment via backend proxy...');
    console.log('📋 Action:', manageData.action);
    console.log('🔖 Transaction ID:', manageData.transaction_id);

    const response = await fetch(MANAGE_PAYMENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(manageData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Backend API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || `Failed to ${manageData.action.toLowerCase()} payment`);
    }

    const data: ManagePaymentResponse = result.data;
    
    console.log(`✅ Payment ${manageData.action} processed successfully`);
    console.log('🔖 Transaction ID:', data.transaction_id);

    return data;
  } catch (error) {
    console.error(`❌ Error managing PayORC payment (${manageData.action}):`, error);
    throw error;
  }
};

/**
 * Check if payment was successful
 * Based on PayORC status values
 * 
 * @param status - Payment status from PayORC
 * @returns true if payment is successful
 */
export const isPaymentSuccessful = (status: string): boolean => {
  const successStatuses = ['AUTHORIZED', 'CAPTURED', 'SUCCESS', 'COMPLETED', 'SETTLED'];
  return successStatuses.includes(status.toUpperCase());
};

/**
 * Check if payment was declined/failed
 * 
 * @param status - Payment status from PayORC
 * @returns true if payment failed
 */
export const isPaymentFailed = (status: string): boolean => {
  const failedStatuses = ['DECLINED', 'FAILED', 'CANCELLED', 'VOIDED', 'ERROR'];
  return failedStatuses.includes(status.toUpperCase());
};

/**
 * Environment configuration helper
 * 
 * Note: Credentials are managed by backend for security
 */
export const getPayORCEnvironment = () => {
  return {
    backendUrl: BACKEND_API_BASE,
    apiBaseUrl: getPayORCApiBaseUrl(),
    // Credentials (merchant-key, merchant-secret) managed server-side
  };
};
