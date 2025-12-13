import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";

interface MapboxConfigProps {
  onTokenSet: (token: string) => void;
}

const MapboxConfig = ({ onTokenSet }: MapboxConfigProps) => {
  const [token, setToken] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      localStorage.setItem('mapbox_token', token.trim());
      onTokenSet(token.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Mapbox Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-orange-800">Mapbox Token Required</p>
                <p className="text-orange-700 mt-1">
                  To display the interactive map, please provide your Mapbox public token.
                </p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-sm font-medium mb-2">
                  Mapbox Public Token
                </label>
                <Input
                  id="token"
                  type="password"
                  placeholder="pk.eyJ1Ij..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={!token.trim()}>
                Set Token & Load Map
              </Button>
            </form>
            
            <div className="text-xs text-muted-foreground space-y-2">
              <p>
                <strong>Need a token?</strong> Visit{" "}
                <a 
                  href="https://account.mapbox.com/access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>{" "}
                to get your free public token.
              </p>
              <p>
                Your token will be stored locally in your browser for this session.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapboxConfig;