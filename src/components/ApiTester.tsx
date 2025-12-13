import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { searchHotels } from '@/services/hotelApi';

const ApiTester = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useRealApi, setUseRealApi] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Temporarily modify the API service to use real API
      if (useRealApi) {
        // This will try the real API
        const response = await fetch('http://pfort.travelapihost.com/HotelServiceRest/Search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_USERNAME || 'UHM|Hotel_RBS'}:${import.meta.env.VITE_API_PASSWORD || 'zjpUPOjhAGf47Uso'}`),
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            CheckIn: "2025-10-27",
            CheckOut: "2025-10-28",
            CityCode: "DXB",
            GuestNationality: "AE",
            PreferredCurrencyCode: "AED",
            PaxRooms: [{ Adults: 1, Children: 0, ChildrenAges: [] }],
            IsDetailResponse: true,
            ResponseTime: 30,
            Filters: { MealType: "All", Refundable: "true", NoOfRooms: 1 }
          }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setResult(data);
      } else {
        // Use the service function (which will use mock data in development)
        const response = await searchHotels({
          CheckIn: "2025-10-27",
          CheckOut: "2025-10-28",
          CityCode: "DXB",
          GuestNationality: "AE",
          PreferredCurrencyCode: "AED",
          PaxRooms: [{ Adults: 1, Children: 0, ChildrenAges: [] }],
          IsDetailResponse: true,
          ResponseTime: 30,
          Filters: { MealType: "All", Refundable: "true", NoOfRooms: 1 }
        });
        
        setResult(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">API Tester</h3>
      
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useRealApi}
            onChange={(e) => setUseRealApi(e.target.checked)}
            className="rounded"
          />
          <span>Use Real API (may fail due to CORS)</span>
        </label>
      </div>
      
      <Button onClick={testApi} disabled={loading} className="mb-4">
        {loading ? 'Testing...' : 'Test Hotel API'}
      </Button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <h4 className="font-semibold">Error:</h4>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <h4 className="font-semibold">Success!</h4>
          <p>Found {result.HotelResult?.length || 0} hotels</p>
          <details className="mt-2">
            <summary className="cursor-pointer font-semibold">View Response</summary>
            <pre className="text-xs mt-2 overflow-auto max-h-40">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default ApiTester;

