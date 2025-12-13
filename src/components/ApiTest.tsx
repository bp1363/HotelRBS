import { useState } from 'react';

const ApiTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://18.204.225.212:3001/api/hotel-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "CheckIn": "2025-12-01",
          "CheckOut": "2025-12-02", 
          "HotelCodes": "263678,91920,414792",
          "CityCode": "",
          "GuestNationality": "AE",
          "PreferredCurrencyCode": "AED",
          "PaxRooms": [{"Adults": 2, "Children": 0, "ChildrenAges": []}],
          "IsDetailResponse": true,
          "ResponseTime": 30,
          "Filters": {"MealType": "All", "Refundable": "true", "NoOfRooms": 1}
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>API Test</h1>
      <button onClick={testApi} disabled={loading}>
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {result && (
        <div style={{ marginTop: '20px' }}>
          <h2>Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;

