import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Building, Hotel } from 'lucide-react';
import { useDynamicHotelCodes } from '@/hooks/useDynamicHotelCodes';

const HotelCodeTester: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [testResults, setTestResults] = useState<string>('');

  const {
    countries,
    cities,
    hotels,
    hotelCodes,
    loadingCountries,
    loadingCities,
    loadingHotels,
    error,
    fetchCities,
    fetchHotels,
    fetchHotelsByNames,
  } = useDynamicHotelCodes();

  const handleCountrySelect = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    setSelectedCity('');
    setTestResults('');
    await fetchCities(countryCode);
  };

  const handleCitySelect = async (cityCode: string) => {
    setSelectedCity(cityCode);
    setTestResults('');
    if (selectedCountry) {
      await fetchHotels(selectedCountry, cityCode);
    }
  };

  const handleTestByNames = async () => {
    setTestResults('Testing with country: United Arab Emirates, city: Dubai...');
    try {
      await fetchHotelsByNames('United Arab Emirates', 'Dubai');
      setTestResults('✅ Successfully fetched hotel codes for Dubai!');
    } catch (error) {
      setTestResults(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const selectedCountryName = countries.find(c => c.Code === selectedCountry)?.Name || '';
  const selectedCityName = cities.find(c => c.CityCode === selectedCity)?.CityName || '';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hotel className="h-5 w-5" />
            Dynamic Hotel Code Fetcher
          </CardTitle>
          <CardDescription>
            Test the dynamic hotel code fetching flow: Countries → Cities → Hotels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Country Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Step 1: Select Country
            </h3>
            {loadingCountries ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading countries...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {countries.slice(0, 12).map((country) => (
                  <Button
                    key={country.Code}
                    variant={selectedCountry === country.Code ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCountrySelect(country.Code)}
                    className="text-xs"
                  >
                    {country.Name}
                  </Button>
                ))}
              </div>
            )}
            {selectedCountry && (
              <Badge variant="secondary">
                Selected: {selectedCountryName} ({selectedCountry})
              </Badge>
            )}
          </div>

          {/* Step 2: City Selection */}
          {selectedCountry && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Step 2: Select City
              </h3>
              {loadingCities ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading cities...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {cities.slice(0, 12).map((city) => (
                    <Button
                      key={city.CityCode}
                      variant={selectedCity === city.CityCode ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCitySelect(city.CityCode)}
                      className="text-xs"
                    >
                      {city.CityName}
                    </Button>
                  ))}
                </div>
              )}
              {selectedCity && (
                <Badge variant="secondary">
                  Selected: {selectedCityName} ({selectedCity})
                </Badge>
              )}
            </div>
          )}

          {/* Step 3: Hotel Results */}
          {selectedCity && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                Step 3: Hotel Codes
              </h3>
              {loadingHotels ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading hotels...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      Found {hotels.length} hotels
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Hotel Codes: {hotelCodes || 'None'}
                    </p>
                  </div>
                  {hotels.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {hotels.slice(0, 5).map((hotel) => (
                        <div key={hotel.HotelCode} className="text-xs p-2 bg-gray-50 rounded">
                          <span className="font-medium">{hotel.HotelCode}</span> - {hotel.HotelName}
                        </div>
                      ))}
                      {hotels.length > 5 && (
                        <div className="text-xs text-gray-500 p-2">
                          ... and {hotels.length - 5} more hotels
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Test */}
          <div className="space-y-3">
            <h3 className="font-semibold">Quick Test</h3>
            <Button onClick={handleTestByNames} disabled={loadingHotels}>
              Test Dubai Hotels
            </Button>
            {testResults && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm">{testResults}</p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">Error: {error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelCodeTester;

