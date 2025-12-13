// Customer API service

const PROXY_BASE_URL = '/api';

export interface Customer {
  customer_id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  nationality: string;
  gender: string;
  profile_url?: string;
  phone: string;
  created_at: string;
}

export interface UpdateCustomerRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  age?: number;
  nationality?: string;
  gender?: string;
  profile_url?: string;
}

export interface UpdateCustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

// Update customer profile
export const updateCustomerProfile = async (
  customerId: string,
  updates: UpdateCustomerRequest
): Promise<UpdateCustomerResponse> => {
  try {
    console.log('✏️ Updating customer profile:', customerId);
    console.log('📝 Updates:', updates);

    const response = await fetch(`${PROXY_BASE_URL}/customer/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Profile update failed: ${response.status} ${response.statusText}`);
    }

    const data: UpdateCustomerResponse = await response.json();
    console.log('✅ Profile updated successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw error;
  }
};
