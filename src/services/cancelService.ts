// Cancel Service for Hotel Bookings
// Handles cancellation of confirmed hotel bookings

export interface CancelRequest {
  ConfirmationNumber: string;
}

export interface CancelResponse {
  Status: {
    Code: string;
    Description: string;
  };
  ConfirmationNumber?: string;
  CancellationFee?: number;
  RefundAmount?: number;
  Currency?: string;
}

const PROXY_SERVER_URL = import.meta.env.VITE_PROXY_SERVER_URL || 'http://localhost:3001';

/**
 * Cancel a hotel booking using the confirmation number
 * @param confirmationNumber - The booking confirmation number to cancel
 * @returns Promise<CancelResponse> - The cancellation response
 */
export const cancelHotelBooking = async (
  confirmationNumber: string
): Promise<CancelResponse> => {
  try {
    console.log("🚫 Calling Travzilla Cancel API via local proxy...");
    console.log("📋 Confirmation Number:", confirmationNumber);
    
    const proxyUrl = `${PROXY_SERVER_URL}/api/hotel-cancel`;
    console.log("📍 Proxy URL:", proxyUrl);
    
    const requestBody: CancelRequest = {
      ConfirmationNumber: confirmationNumber
    };
    
    console.log("📤 Request Body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Proxy response error:", errorText);
      throw new Error(
        `Proxy server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla Cancel API response:", data);

    // Handle null response
    if (data === null || data === undefined) {
      console.log("📭 No cancel response received");
      return {
        Status: {
          Code: "400",
          Description: "No cancel response received",
        },
      };
    }

    // Check if the response has the expected structure
    if (data.Status) {
      return data;
    } else {
      // Transform response if needed
      return {
        Status: {
          Code: "200",
          Description: "Successful",
        },
        ...data,
      };
    }
  } catch (error) {
    console.error("💥 Cancel API error:", error);
    throw new Error(
      `Travzilla Cancel API failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

/**
 * Validate confirmation number format
 * @param confirmationNumber - The confirmation number to validate
 * @returns boolean - Whether the confirmation number is valid
 */
export const validateConfirmationNumber = (confirmationNumber: string): boolean => {
  if (!confirmationNumber || confirmationNumber.trim().length === 0) {
    return false;
  }
  
  // Basic validation - confirmation numbers are typically 6-10 characters
  if (confirmationNumber.length < 3 || confirmationNumber.length > 20) {
    return false;
  }
  
  return true;
};

/**
 * Format cancellation response for display
 * @param response - The cancellation response
 * @returns string - Formatted message for display
 */
export const formatCancellationMessage = (response: CancelResponse): string => {
  if (response.Status.Code === "200" || response.Status.Code === "201") {
    let message = `✅ Booking cancelled successfully!\n`;
    message += `Confirmation Number: ${response.ConfirmationNumber || 'N/A'}\n`;
    
    if (response.CancellationFee !== undefined) {
      message += `Cancellation Fee: ${response.Currency || 'USD'} ${response.CancellationFee}\n`;
    }
    
    if (response.RefundAmount !== undefined) {
      message += `Refund Amount: ${response.Currency || 'USD'} ${response.RefundAmount}\n`;
    }
    
    return message;
  } else {
    return `❌ Cancellation failed: ${response.Status.Description}`;
  }
};
