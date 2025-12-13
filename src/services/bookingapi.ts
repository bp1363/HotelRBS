// Prebooking API services
const PROXY_SERVER_URL =
  import.meta.env.VITE_PROXY_SERVER_URL || "http://localhost:3001/api";

export interface PrebookParams {
  BookingCode: string;
  PaymentMode: string;
  CheckIn?: string;
  CheckOut?: string;
  GuestNationality?: string;
  PreferredCurrencyCode?: string;
  PaxRooms?: Array<{
    Adults: number;
    Children: number;
    ChildrenAges: number[];
  }>;
  HotelCode?: string;
}

export interface PrebookResponse {
  Status: {
    Code: string;
    Description: string;
  };
  BookingId?: string;
  BookingReference?: string;
  TotalAmount?: number;
  Currency?: string;
  ExpiryTime?: string;
  PaymentDetails?: any;
  // Add other response fields as needed based on actual API response
}

// Prebook hotel booking using Travzilla API
export const prebookHotel = async (
  params: PrebookParams
): Promise<PrebookResponse> => {
  try {
    console.log("🔒 Calling Travzilla Prebook API with params:", params);

    return await prebookHotelTravzilla(params);
  } catch (error) {
    console.error("💥 Hotel prebook error:", error);
    throw error;
  }
};

// Real API integration with Travzilla Prebook via local proxy
const prebookHotelTravzilla = async (
  params: PrebookParams
): Promise<PrebookResponse> => {
  try {
    console.log("🌐 Calling Travzilla Prebook API via local proxy...");
    const proxyUrl = `${PROXY_SERVER_URL}/hotel-prebook`;
    console.log("📍 Proxy URL:", proxyUrl);
    
    // Transform params to match API format (simple format that works)
    const requestBody = {
      BookingCode: params.BookingCode,
      PaymentMode: params.PaymentMode || "Limit"
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
    console.log("✅ Travzilla Prebook API response:", data);

    // Handle null response
    if (data === null || data === undefined) {
      console.log("📭 No prebook response received");
      return {
        Status: {
          Code: "400",
          Description: "No prebook response received",
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
    console.error("💥 Prebook API error:", error);
    throw new Error(
      `Travzilla Prebook API failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};