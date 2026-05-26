# ElasticBean API Integration

This document explains how to integrate your ElasticBean deployed custom API for hotel search while keeping the fallback to the live UHM API.

## Overview

The hybrid search system works as follows:
1. **Primary**: Get hotel data (images, names, descriptions) from your ElasticBean database
2. **Secondary**: Get pricing and availability from the live UHM API
3. **Fallback**: Use live UHM API only if ElasticBean fails

## Setup

### 1. Configure Environment Variables

Add the following to your `.env` file:

```bash
# ElasticBean API Configuration
VITE_ELASTICBEAN_API_URL=https://your-elasticbean-api.amazonaws.com
VITE_ELASTICBEAN_API_KEY=your_elasticbean_api_key_here
```

### 2. ElasticBean API Requirements

Your ElasticBean API should implement the following endpoints:

#### POST `/hotels/search`
Search hotels in your database.

**Request Body:**
```json
{
  "city": "city_code_or_name",
  "check_in": "2024-01-15",
  "check_out": "2024-01-16",
  "guests": 2,
  "rooms": 1,
  "limit": 50,
  "offset": 0
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hotel_123",
      "name": "Grand Hotel",
      "address": "123 Main St, City",
      "city": "City Name",
      "country": "Country",
      "star_rating": "5",
      "images": ["https://example.com/image1.jpg"],
      "description": "Beautiful hotel...",
      "amenities": ["WiFi", "Pool", "Spa"],
      "location": {
        "Latitude": 40.7128,
        "Longitude": -74.0060
      },
      "hotel_code": "UHM123" // Maps to live API hotel code
    }
  ],
  "total": 150
}
```

#### GET `/hotels/{hotelId}`
Get detailed information for a single hotel.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "hotel_123",
    "name": "Grand Hotel",
    // ... same fields as search response
  }
}
```

## How It Works

### Hybrid Search Flow

1. **Search Request**: User searches for hotels
2. **ElasticBean Query**: System queries your database for hotel data
3. **Data Mapping**: Converts your database format to internal format
4. **Pricing Query**: For hotels with `hotel_code`, gets pricing from live API
5. **Data Merge**: Combines hotel data from ElasticBean with pricing from live API
6. **Fallback**: If ElasticBean fails, uses live API only

### Key Features

- **Automatic Fallback**: If ElasticBean API is down, system falls back to live API
- **Partial Success**: If pricing fails, still shows hotel data without prices
- **Hotel Code Mapping**: Uses `hotel_code` field to match hotels between systems
- **Performance**: Limits results to 50 hotels for better performance

## Database Schema Recommendations

Your hotel database should include these fields:

```sql
CREATE TABLE hotels (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  star_rating VARCHAR(10),
  images JSON, -- Array of image URLs
  description TEXT,
  amenities JSON, -- Array of amenity strings
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  hotel_code VARCHAR(50), -- Maps to live API
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Testing

### 1. Without ElasticBean API
If `VITE_ELASTICBEAN_API_URL` is not set, system uses live API only.

### 2. With ElasticBean API
Set the environment variables and the system will use hybrid search.

### 3. Testing Fallback
Temporarily make ElasticBean API return errors to test fallback behavior.

## Monitoring

Check the browser console for these log messages:
- `🔍 Starting hybrid search with ElasticBean + Live API fallback`
- `🔄 Using hybrid search (ElasticBean database + Live API pricing)`
- `⚠️ ElasticBean API not configured, using Live API only`
- `💥 Hybrid search failed, falling back to Live API only`

## Troubleshooting

### Common Issues

1. **No hotels found**: Check if your database has hotels for the searched city
2. **Missing prices**: Ensure `hotel_code` matches live API hotel codes
3. **API errors**: Check ElasticBean API logs and network requests
4. **Environment variables**: Ensure `.env` file is properly configured

### Debug Mode

Add these logs to your ElasticBean API for debugging:
- Request parameters received
- Database queries executed
- Number of results found
- Any errors encountered

## Performance Considerations

- **Indexing**: Add database indexes on city, country, and name fields
- **Caching**: Consider caching popular search results
- **Pagination**: Use limit/offset for large result sets
- **Images**: Use CDN for hotel images

## Security

- **API Key**: Keep your ElasticBean API key secure
- **Rate Limiting**: Implement rate limiting on your API
- **Input Validation**: Validate all input parameters
- **HTTPS**: Always use HTTPS for API calls
