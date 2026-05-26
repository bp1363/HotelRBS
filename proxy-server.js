import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
const hotelCodeCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const app = express();
const PORT = process.env.PROXY_SERVER_PORT || 3001;

// Enable CORS for all routes with more permissive settings
app.use(
  cors({
    origin: true, // allow all origins in dev
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: false,
  })
);
app.use(express.json());

// Test endpoint to verify proxy server is working
app.get("/api/test", (req, res) => {
  console.log(
    "🧪 Test endpoint called from:",
    req.headers.origin || req.headers.host
  );
  res.json({
    success: true,
    message: "Proxy server is working!",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || "unknown",
  });
});

// Proxy endpoint for Travzilla API
app.post("/api/hotel-search", async (req, res) => {
  try {
    console.log("📤 Proxying request to LIVE UHM API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    console.log("🔐 Using LIVE API Credentials:");
    console.log("   API URL: " + apiUrl);
    console.log("   Username: " + username);
    console.log("   Password: " + password.substring(0, 3) + "***");
    console.log("   Endpoint: " + `${apiUrl}/Search`);

    const response = await fetch(`${apiUrl}/Search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ LIVE API response received");
    console.log("📊 Response Status Code:", data?.Status?.Code);
    console.log(
      "📊 Total Hotels in Response:",
      Array.isArray(data?.HotelResult)
        ? data.HotelResult.length
        : data?.HotelResult
        ? 1
        : 0
    );
    console.log("✅ Full response:", JSON.stringify(data, null, 2));

    // Debug: Log the first hotel's rooms structure
    if (data && data.HotelResult && data.HotelResult.length > 0) {
      console.log(
        "🔍 Debug - First hotel rooms structure:",
        JSON.stringify(data.HotelResult[0].Rooms, null, 2)
      );
    }

    // Handle null response (no hotels found) - return empty result from LIVE API
    if (data === null || data === undefined) {
      console.log(
        "📭 No hotels found for this search - returning empty result from LIVE API"
      );
      return res.json({
        Status: {
          Code: "204",
          Description: "No results found for the requested search",
        },
        HotelResult: [],
      });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).json({
      error: "Proxy error",
      message: error.message,
    });
  }
});

// Hotel Room endpoint
app.post("/api/hotel-room", async (req, res) => {
  try {
    console.log("🏨 Proxying hotel room request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    const response = await fetch(`${apiUrl}/HotelRoom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla hotel room response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla hotel room API error:", errorText);
      throw new Error(
        `Travzilla Hotel Room API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla hotel room response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel room proxy error:", error);
    res.status(500).json({
      error: "Hotel room proxy error",
      message: error.message,
    });
  }
});

app.post("/api/hotel-details", async (req, res) => {
  try {
    console.log("📤 Proxying hotel details request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    // Validate request body - accept both HotelCode (from frontend) and Hotelcodes (API format)
    const hotelCode = req.body.HotelCode || req.body.Hotelcodes;
    if (!hotelCode) {
      return res.status(400).json({
        error: "Bad Request",
        message: "HotelCode is required",
      });
    }

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    // Prepare request body in API format (Hotelcodes with lowercase 'c', plural)
    const language = req.body.Language || req.body.language || "en";
    const apiRequestBody = {
      Hotelcodes: String(hotelCode), // API expects plural "Hotelcodes"
      Language: language,
    };

    console.log("🔗 Calling Travzilla API:", `${apiUrl}/Hoteldetails`);
    console.log(
      "📋 API Request body:",
      JSON.stringify(apiRequestBody, null, 2)
    );

    const response = await fetch(`${apiUrl}/Hoteldetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(apiRequestBody), // Use API format
    });

    console.log("📥 Travzilla hotel details response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla API error response:", errorText);
      throw new Error(
        `Travzilla API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Travzilla hotel details response:",
      JSON.stringify(data, null, 2)
    );

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel details proxy error:", error);
    res.status(500).json({
      error: "Hotel details proxy error",
      message: error.message,
      details: error.toString(),
    });
  }
});

// Hotel Prebook endpoint
app.post("/api/hotel-prebook", async (req, res) => {
  try {
    console.log("🔒 Proxying hotel prebook request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/Prebook`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    console.log("🔐 Auth header:", authHeader);
    console.log("🔐 Auth header length:", authHeader.length);

    const response = await fetch(`${apiUrl}/Prebook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla prebook response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla prebook API error:", errorText);
      throw new Error(
        `Travzilla Prebook API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla prebook response:", data);

    // Handle null response
    if (data === null || data === undefined) {
      console.log("📭 No prebook response received");
      return res.json({
        Status: {
          Code: "400",
          Description: "No prebook response received",
        },
      });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel prebook proxy error:", error);
    res.status(500).json({
      error: "Hotel prebook proxy error",
      message: error.message,
    });
  }
});

// CountryList endpoint
app.get("/api/CountryList", async (req, res) => {
  try {
    console.log("🌍 Fetching country list from Travzilla API...");

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    const response = await fetch(`${apiUrl}/CountryList`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
    });

    console.log("📥 CountryList response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla CountryList API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ CountryList response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ CountryList proxy error:", error);
    res.status(500).json({
      error: "CountryList proxy error",
      message: error.message,
    });
  }
});

// CityList endpoint
app.post("/api/CityList", async (req, res) => {
  try {
    console.log("🏙️ Fetching city list from Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    const response = await fetch(`${apiUrl}/CityList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 CityList response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla CityList API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ CityList response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ CityList proxy error:", error);
    res.status(500).json({
      error: "CityList proxy error",
      message: error.message,
    });
  }
});

// HotelCodeList endpoint
// Hotel Code List (PFORT - hotelcodelist)

app.post("/api/hotelcodelist", async (req, res) => {
  try {
    console.log("🏨 /api/hotelcodelist called");
    console.log("📥 Request body:", req.body);

    const { CountryCode, CityCode } = req.body;

    // -----------------------------
    // 1️⃣ Validate input
    // -----------------------------
    if (!CountryCode || !CityCode) {
      return res.status(400).json({
        error: "CountryCode and CityCode are required",
      });
    }

    // -----------------------------
    // 2️⃣ Cache key
    // -----------------------------
    const cacheKey = `${CountryCode}_${CityCode}`;

    // -----------------------------
    // 3️⃣ Cache HIT (with TTL)
    // -----------------------------
    const cached = hotelCodeCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      console.log("⚡ Cache HIT:", cacheKey);
      return res.status(200).json(cached.data);
    }

    console.log("🐢 Cache MISS:", cacheKey);

    // -----------------------------
    // 4️⃣ Prepare PFORT request
    // -----------------------------
    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";

    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    const startTime = Date.now();

    // -----------------------------
    // 5️⃣ Call PFORT API
    // -----------------------------
    const response = await fetch(`${apiUrl}/hotelcodelist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        CountryCode: String(CountryCode),
        CityCode: String(CityCode),
      }),
    });

    const rawText = await response.text();

    console.log("⏱ PFORT time:", Date.now() - startTime, "ms");

    if (!response.ok) {
      return res.status(502).json({
        error: "PFORT hotelcodelist HTTP failure",
        status: response.status,
        raw: rawText,
      });
    }

    // -----------------------------
    // 6️⃣ Parse response
    // -----------------------------
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        error: "Invalid JSON from PFORT",
        raw: rawText,
      });
    }

    const hotels = Array.isArray(data?.HotelList) ? data.HotelList : [];

    console.log("✅ PFORT hotelcodelist success, hotels:", hotels.length);

    // -----------------------------
    // 7️⃣ Reduce payload size
    // -----------------------------
    const lightHotels = hotels.map(h => ({
      HotelCode: h.HotelCode,
      HotelName: h.HotelName,
    }));

    // -----------------------------
    // 8️⃣ Normalized response
    // -----------------------------
    const responseData = {
      Status: {
        Code: "200",
        Message: "Success",
      },
      HotelList: lightHotels,
    };

    // -----------------------------
    // 9️⃣ Save to cache with TTL
    // -----------------------------
    hotelCodeCache.set(cacheKey, {
      data: responseData,
      expires: Date.now() + CACHE_TTL,
    });

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("❌ hotelcodelist backend error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});






// Customer lookup endpoint
app.get("/api/customer/:email", async (req, res) => {
  try {
    console.log("👤 Proxying customer lookup request...");
    console.log("📧 Email:", req.params.email);

    const customerApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(
      `${customerApiUrl}/customer/${req.params.email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📥 Customer lookup response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer lookup API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer lookup response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer lookup proxy error:", error);
    res.status(500).json({
      error: "Customer lookup proxy error",
      message: error.message,
    });
  }
});

// Booking reference generation endpoint
app.post("/api/bookings/reference", async (req, res) => {
  try {
    console.log("📋 Proxying booking reference generation request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const bookingApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${bookingApiUrl}/bookings/reference`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Booking reference response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Booking reference API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Booking reference response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Booking reference proxy error:", error);
    res.status(500).json({
      error: "Booking reference proxy error",
      message: error.message,
    });
  }
});

// Custom booking lookup endpoint (GET) - Fetch bookings by customer_id
app.get("/api/bookings/custom", async (req, res) => {
  try {
    console.log("🔍 Proxying custom booking lookup request...");
    console.log("📋 Query params:", req.query);

    const bookingApiUrl = "https://api.hotelrbs.com";
    const customerId = req.query.customer_id;

    console.log("🔑 Customer ID:", customerId);

    if (!customerId) {
      return res.status(400).json({
        error: "Missing customer_id parameter",
      });
    }

    // Use GET request with customer_id parameter
    const url = `${bookingApiUrl}/bookings/get?customer_id=${encodeURIComponent(
      customerId
    )}`;
    console.log("🌐 Calling backend URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Custom booking lookup response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Custom booking API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Custom booking lookup response:",
      JSON.stringify(data, null, 2)
    );

    res.json(data);
  } catch (error) {
    console.error("❌ Custom booking lookup proxy error:", error);
    res.status(500).json({
      error: "Custom booking lookup proxy error",
      message: error.message,
    });
  }
});

// Add booking details to custom backend
app.post("/api/bookings/add", async (req, res) => {
  try {
    console.log("📝 Adding booking details to custom backend...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const bookingApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${bookingApiUrl}/bookings/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Add booking response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Add booking API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Booking added successfully:",
      JSON.stringify(data, null, 2)
    );

    res.json(data);
  } catch (error) {
    console.error("❌ Add booking proxy error:", error);
    res.status(500).json({
      error: "Add booking proxy error",
      message: error.message,
    });
  }
});

// Cancel booking in custom backend
app.post("/api/bookings/cancel", async (req, res) => {
  try {
    console.log("🚫 Cancelling booking in custom backend...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const bookingApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${bookingApiUrl}/bookings/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Cancel booking response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Cancel booking API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Booking cancelled successfully:",
      JSON.stringify(data, null, 2)
    );

    res.json(data);
  } catch (error) {
    console.error("❌ Cancel booking proxy error:", error);
    res.status(500).json({
      error: "Cancel booking proxy error",
      message: error.message,
    });
  }
});

// Hotel booking endpoint
app.post("/api/hotel-book", async (req, res) => {
  try {
    console.log("🏨 Proxying hotel booking request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));
    console.log("📋 Request body keys:", Object.keys(req.body || {}));
    console.log("📋 BookingCode:", req.body?.BookingCode);
    console.log("📋 BookingType:", req.body?.BookingType);
    console.log("📋 PaymentMode:", req.body?.PaymentMode);
    console.log(
      "📋 CustomerDetails:",
      JSON.stringify(req.body?.CustomerDetails, null, 2)
    );
    console.log("📋 CustomerDetails count:", req.body?.CustomerDetails?.length);
    console.log("📋 TotalFare:", req.body?.TotalFare);
    console.log("📋 EmailId:", req.body?.EmailId);
    console.log("📋 PhoneNumber:", req.body?.PhoneNumber);
    console.log("📋 PhoneNumber type:", typeof req.body?.PhoneNumber);

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    console.log("🔗 LIVE API URL:", `${apiUrl}/HotelBook`);
    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 Full endpoint URL:", `${apiUrl}/HotelBook`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    // Validate required fields
    if (!req.body.BookingCode) {
      console.error("❌ Missing BookingCode");
      return res.status(400).json({
        error: "Bad Request",
        message: "BookingCode is required",
      });
    }

    if (!req.body.PaymentMode) {
      console.error("❌ Missing PaymentMode");
      return res.status(400).json({
        error: "Bad Request",
        message: "PaymentMode is required",
      });
    }

    if (
      !req.body.CustomerDetails ||
      !Array.isArray(req.body.CustomerDetails) ||
      req.body.CustomerDetails.length === 0
    ) {
      console.error("❌ Missing or invalid CustomerDetails");
      return res.status(400).json({
        error: "Bad Request",
        message: "CustomerDetails array is required and must not be empty",
      });
    }

    // Ensure PaymentMode is valid (Limit or Credit)
    const validPaymentModes = ["Limit", "Credit"];
    if (!validPaymentModes.includes(req.body.PaymentMode)) {
      console.error("❌ Invalid PaymentMode:", req.body.PaymentMode);
      return res.status(400).json({
        error: "Bad Request",
        message: `PaymentMode must be one of: ${validPaymentModes.join(", ")}`,
      });
    }

    // Validate required fields first
    if (!req.body.PaymentMode) {
      console.error("❌ Missing PaymentMode");
      return res.status(400).json({
        error: "Bad Request",
        message: "PaymentMode is required",
      });
    }

    // Build request body matching Postman example order exactly:
    // CustomerDetails, BookingType, ClientReferenceId, BookingReferenceId, PaymentMode, GuestNationality, TotalFare, EmailId, PhoneNumber
    // Note: Postman example does NOT include BookingCode, but API may still need it

    // Use object with specific property order to match Postman
    const requestBody = {
      // CustomerDetails first (as shown in Postman)
      CustomerDetails: req.body.CustomerDetails,
      // Then BookingType
      BookingType: req.body.BookingType || "Voucher",
      // Then ClientReferenceId
      ClientReferenceId: req.body.ClientReferenceId,
      // Then BookingReferenceId
      BookingReferenceId: req.body.BookingReferenceId,
      // PaymentMode comes AFTER BookingReferenceId
      PaymentMode: req.body.PaymentMode,
      // Then GuestNationality
      GuestNationality: req.body.GuestNationality || "AE",
      // Then TotalFare
      TotalFare: req.body.TotalFare,
      // Then EmailId
      EmailId: req.body.EmailId,
      // Finally PhoneNumber
      PhoneNumber: req.body.PhoneNumber,
    };

    // Add BookingCode if provided (Postman doesn't show it, but API likely needs it)
    if (req.body.BookingCode) {
      // Prepend BookingCode to the object (will be first in JSON)
      const requestBodyWithCode = {
        BookingCode: req.body.BookingCode,
        ...requestBody,
      };
      console.log("📋 Including BookingCode in request");
      console.log("📤 Sending request to LIVE API...");
      console.log(
        "📤 Request body keys (in order):",
        Object.keys(requestBodyWithCode)
      );
      console.log("📤 PaymentMode value:", requestBodyWithCode.PaymentMode);
      const requestBodyString = JSON.stringify(requestBodyWithCode);
      console.log("📤 Final request body:", requestBodyString);

      var finalRequestBody = requestBodyString;
    } else {
      console.log("⚠️ No BookingCode provided");
      console.log("📤 Sending request to LIVE API...");
      console.log("📤 Request body keys (in order):", Object.keys(requestBody));
      console.log("📤 PaymentMode value:", requestBody.PaymentMode);
      const requestBodyString = JSON.stringify(requestBody);
      console.log("📤 Final request body:", requestBodyString);

      var finalRequestBody = requestBodyString;
    }

    const response = await fetch(`${apiUrl}/HotelBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: finalRequestBody,
    });

    console.log("📥 Travzilla hotel booking response status:", response.status);
    console.log("📥 Response statusText:", response.statusText);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Try to get response text first to see what we're getting
    const responseText = await response.text();
    console.log("📥 Raw response text:", responseText);
    console.log("📥 Response text length:", responseText.length);

    let data;
    try {
      data = JSON.parse(responseText);
      console.log("✅ Parsed response JSON:", JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error("❌ Failed to parse response as JSON:", parseError);
      console.error("❌ Response text:", responseText);
      throw new Error(
        `Invalid JSON response: ${responseText.substring(0, 200)}`
      );
    }

    console.log("✅ Booking Status Code:", data?.Status?.Code);
    console.log("✅ Booking Status Description:", data?.Status?.Description);
    console.log("✅ BookingStatus:", data?.BookingStatus);
    console.log("✅ ConfirmationNumber:", data?.ConfirmationNumber);

    if (!response.ok) {
      console.error("❌ Travzilla hotel booking API error response:");
      console.error("   Status Code:", response.status);
      console.error("   API Status Code:", data?.Status?.Code);
      console.error("   API Status Description:", data?.Status?.Description);
      console.error("   Full Error Response:", JSON.stringify(data, null, 2));
    }

    // Return the response even if status is not OK, let frontend handle it
    res.status(response.status).json(data);
  } catch (error) {
    console.error("❌ Hotel booking proxy error:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      error: "Hotel booking proxy error",
      message: error.message,
      details: error.toString(),
    });
  }
});

// Customer login endpoint
app.post("/api/customer/login", async (req, res) => {
  try {
    console.log("🔐 Proxying customer login request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const customerApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${customerApiUrl}/customer/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Customer login response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer login API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer login response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer login proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Customer login failed",
      error: error.message,
    });
  }
});

// Customer signup endpoint
app.post("/api/customer/signup", async (req, res) => {
  try {
    console.log("📝 Proxying customer signup request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const customerApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${customerApiUrl}/customer/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Customer signup response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer signup API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer signup response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer signup proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Customer signup failed",
      error: error.message,
    });
  }
});

// Customer update profile endpoint
app.put("/api/customer/:customerId", async (req, res) => {
  try {
    console.log("✏️ Proxying customer profile update request...");
    console.log("👤 Customer ID:", req.params.customerId);
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const customerApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(
      `${customerApiUrl}/customer/${req.params.customerId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    console.log("📥 Customer update response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer update API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer update response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer update proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Customer profile update failed",
      error: error.message,
    });
  }
});

// Send confirmation email endpoint
app.post("/api/confirmation/send", async (req, res) => {
  try {
    console.log("📧 Proxying confirmation email request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const confirmationApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${confirmationApiUrl}/confirmation/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Confirmation email response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Confirmation email API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Confirmation email response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Confirmation email proxy error:", error);
    res.status(500).json({
      error: "Confirmation email proxy error",
      message: error.message,
    });
  }
});

// Add hotel details to custom backend
app.post("/api/hotel/add-hotel", async (req, res) => {
  try {
    console.log("🏨 Adding hotel to custom backend...");
    console.log("📋 Hotel data:", JSON.stringify(req.body, null, 2));

    const backendApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${backendApiUrl}/hotel/add-hotel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Add hotel response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Add hotel API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Hotel added successfully:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Add hotel proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add hotel",
      error: error.message,
    });
  }
});

// Add hotel room to custom backend
app.post("/api/hotelRoom/add", async (req, res) => {
  try {
    console.log("🛏️ Adding hotel room to custom backend...");
    console.log("📋 Room data:", JSON.stringify(req.body, null, 2));

    const backendApiUrl = "https://api.hotelrbs.com";

    const response = await fetch(`${backendApiUrl}/hotelRoom/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Add room response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Add room API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Room added successfully:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Add room proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add room",
      error: error.message,
    });
  }
});

// Cancel booking endpoint
app.post("/api/hotel-cancel", async (req, res) => {
  try {
    console.log("🚫 Hotel cancel request received");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/Cancel`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    console.log("🔐 Auth header:", authHeader);

    const response = await fetch(`${apiUrl}/Cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla cancel response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla cancel API error:", errorText);
      throw new Error(
        `Travzilla Cancel API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla cancel response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel cancel proxy error:", error);
    res.status(500).json({
      error: "Hotel cancel proxy error",
      message: error.message,
    });
  }
});

// Booking Details Based on Date endpoint
app.post("/api/booking-details-by-date", async (req, res) => {
  try {
    console.log("📅 Fetching booking details by date range...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/BookingDetailsBasedOnDate`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch(`${apiUrl}/BookingDetailsBasedOnDate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Booking details response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla booking details API error:", errorText);
      throw new Error(
        `Travzilla Booking Details API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Travzilla booking details response:",
      JSON.stringify(data, null, 2)
    );
    console.log("📊 Response structure analysis:");
    console.log("   - Response keys:", Object.keys(data));
    console.log("   - Status:", data.Status);
    console.log("   - Has Bookings array?", Array.isArray(data.Bookings));
    console.log(
      "   - Has BookingDetails array?",
      Array.isArray(data.BookingDetails)
    );
    console.log("   - Has Data array?", Array.isArray(data.Data));
    if (data.Bookings)
      console.log("   - Bookings count:", data.Bookings.length);
    if (data.BookingDetails)
      console.log("   - BookingDetails count:", data.BookingDetails.length);
    if (data.Data) console.log("   - Data count:", data.Data.length);

    res.json(data);
  } catch (error) {
    console.error("❌ Booking details proxy error:", error);
    res.status(500).json({
      error: "Booking details proxy error",
      message: error.message,
    });
  }
});

// Booking Detail by Reference ID endpoint
app.post("/api/booking-detail", async (req, res) => {
  try {
    console.log("🔍 Fetching booking detail by reference ID...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://pfort.travelapihost.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "UHM|Hotel_RBS";
    const password = process.env.API_PASSWORD || "zjpUPOjhAGf47Uso";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/BookingDetail`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch(`${apiUrl}/BookingDetail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Booking detail response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla booking detail API error:", errorText);
      throw new Error(
        `Travzilla Booking Detail API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Travzilla booking detail response:",
      JSON.stringify(data, null, 2)
    );
    console.log("📊 Booking detail structure:");
    console.log("   - Response keys:", Object.keys(data));
    console.log("   - Status:", data.Status);
    if (data.BookingDetail) {
      console.log("   - Has booking detail:", true);
      console.log(
        "   - Confirmation Number:",
        data.BookingDetail.ConfirmationNo
      );
      console.log("   - Booking Status:", data.BookingDetail.BookingStatus);
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Booking detail proxy error:", error);
    res.status(500).json({
      error: "Booking detail proxy error",
      message: error.message,
    });
  }
});

// Wishlist endpoints - Forward to remote hotel API backend
const REMOTE_BACKEND_URL = "https://api.hotelrbs.com";

// Add to wishlist endpoint
app.post("/api/wishlist/add", async (req, res) => {
  try {
    console.log("💖 Adding hotel to wishlist...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const response = await fetch(`${REMOTE_BACKEND_URL}/wishlist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Wishlist add response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Wishlist add API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Hotel added to wishlist successfully:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Wishlist add proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist",
      error: error.message,
    });
  }
});

// Get wishlist endpoint
app.get("/api/wishlist/:customer_id", async (req, res) => {
  try {
    console.log("📋 Fetching wishlist for customer:", req.params.customer_id);

    const response = await fetch(
      `${REMOTE_BACKEND_URL}/wishlist/${req.params.customer_id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📥 Wishlist get response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Wishlist get API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Wishlist fetched from backend:", data);

    // Transform response to match expected format
    // If backend returns array directly, wrap it in the expected structure
    let transformedData;
    if (Array.isArray(data)) {
      transformedData = {
        success: true,
        data: data,
        count: data.length,
      };
    } else if (data.success !== undefined) {
      // Backend already returns in correct format
      transformedData = data;
    } else {
      // Unknown format, wrap it
      transformedData = {
        success: true,
        data: Array.isArray(data) ? data : [data],
        count: Array.isArray(data) ? data.length : 1,
      };
    }

    console.log("✅ Transformed wishlist response:", transformedData);
    res.json(transformedData);
  } catch (error) {
    console.error("❌ Wishlist get proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
});

// Remove from wishlist endpoint
app.delete("/api/wishlist/remove", async (req, res) => {
  try {
    console.log("🗑️ Removing hotel from wishlist...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const response = await fetch(`${REMOTE_BACKEND_URL}/wishlist/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Wishlist remove response status:", response.status);

    // Try to parse as JSON, fallback to text if it fails
    let data;
    const contentType = response.headers.get("content-type");

    try {
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log(
          "⚠️ Non-JSON response from remote API:",
          text.substring(0, 200)
        );
        data = {
          success: false,
          message:
            "Remote API endpoint not found or not configured for DELETE method",
          status: response.status,
        };
      }
    } catch (parseError) {
      console.error("❌ Failed to parse response:", parseError.message);
      data = {
        success: false,
        message: "Invalid response from remote API",
        status: response.status,
      };
    }

    // Pass through the response (both 200 OK and 404 Not Found are valid for JSON responses)
    if (response.ok) {
      console.log("✅ Hotel removed from wishlist successfully:", data);
      res.status(response.status).json(data);
    } else if (
      response.status === 404 &&
      contentType &&
      contentType.includes("application/json")
    ) {
      console.log("ℹ️ Hotel not found in wishlist:", data);
      res.status(response.status).json(data);
    } else {
      console.error("❌ Backend error response:", data);
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error("❌ Wishlist remove proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
      error: error.message,
    });
  }
});


app.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying Travzilla API calls...`);
  console.log(`👤 Proxying Customer API calls...`);
  console.log(`✏️ Proxying Customer Profile Update API calls...`);
  console.log(`📋 Proxying Booking API calls...`);
  console.log(`🏨 Proxying Hotel Booking API calls...`);
  console.log(`🛏️ Proxying Hotel & Room Storage API calls...`);
  console.log(`🚫 Proxying Hotel Cancel API calls...`);
  console.log(`📅 Proxying Booking Details by Date API calls...`);
  console.log(`🔎 Proxying Booking Detail by Reference ID API calls...`);
  console.log(`💖 Proxying Wishlist API calls to remote hotel API backend...`);
});
