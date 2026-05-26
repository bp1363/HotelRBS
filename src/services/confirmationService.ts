// Confirmation email service

const CONFIRMATION_API_URL = 'http://hotelrbs.us-east-1.elasticbeanstalk.com/confirmation/send'; // Custom confirmation email API

export interface ConfirmationRequest {
  customer_id?: string;
  client_reference_id?: string;
  confirmation_number: string;
  booking_reference_id?: string;
  email: string;
}

export interface ConfirmationResponse {
  success: boolean;
  message: string;
}

// Send confirmation email to customer
export const sendConfirmationEmail = async (
  customerIdOrClientRef: string, 
  confirmationNumber: string,
  email: string,
  isClientReference: boolean = false,
  bookingReferenceId?: string
): Promise<ConfirmationResponse> => {
  try {
    console.log('📧 Sending confirmation email...');
    console.log('📋 Request data:', { customerIdOrClientRef, confirmationNumber, email, isClientReference, bookingReferenceId });
    
    // Build request body matching your custom API format
    // Based on Postman: API requires customer_id and confirmation_number
    const requestBody: ConfirmationRequest = {
      ...(isClientReference 
        ? { client_reference_id: customerIdOrClientRef } 
        : { customer_id: customerIdOrClientRef }),
      confirmation_number: confirmationNumber,
      // Optional fields (include if provided)
      ...(bookingReferenceId && { booking_reference_id: bookingReferenceId }),
      ...(email && { email: email })
    };
    
    const response = await fetch(CONFIRMATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Confirmation email response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Confirmation email API error response:', errorText);
      throw new Error(`Confirmation email failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Confirmation email response data:', data);
    
    return {
      success: data.success || false,
      message: data.message || 'Confirmation email sent successfully'
    };
  } catch (error) {
    console.error('Confirmation email error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to send confirmation email. Please try again.',
    };
  }
};
