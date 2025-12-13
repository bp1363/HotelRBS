import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { searchHotels } from '@/services/hotelApi';

const ApiTestComponent = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchHotels({
        CheckIn: "2025-10-27",
        CheckOut: "2025-10-28",
        CityCode: "DXB",
        GuestNationality: "AE",
        PreferredCurrencyCode: "AED",
        PaxRooms: [
          {
            Adults: 1,
            Children: 0,
            ChildrenAges: [],
          },
        ],
        IsDetailResponse: true,
        ResponseTime: 30,
        Filters: {
          MealType: "All",
          Refundable: "true",
          NoOfRooms: 1,
        },
      });
      
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">API Test</h3>
      <Button onClick={testApi} disabled={loading}>
        {loading ? 'Testing...' : 'Test Hotel API'}
      </Button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <h4 className="font-semibold">Success!</h4>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
