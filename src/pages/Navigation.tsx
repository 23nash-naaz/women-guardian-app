
import { useState } from "react";
import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation as NavIcon, Shield } from "lucide-react";
import SafeMap from "@/components/SafeMap";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [routePoints, setRoutePoints] = useState<{
    start?: [number, number];
    end?: [number, number];
  }>({});
  const { toast } = useToast();

  const geocodeAddress = async (address: string) => {
    try {
      const { data: { secret: apiKey }, error } = await supabase
        .from('secrets')
        .select('secret')
        .eq('name', 'TOMTOM_API_KEY')
        .single();

      if (error || !apiKey) {
        throw new Error("Could not fetch API key");
      }

      const response = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lon } = data.results[0].position;
        return [lat, lon] as [number, number];
      }
      throw new Error("Address not found");
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  const handleFindRoute = async () => {
    try {
      const [startCoords, endCoords] = await Promise.all([
        geocodeAddress(startAddress),
        geocodeAddress(endAddress)
      ]);

      setRoutePoints({
        start: startCoords,
        end: endCoords
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not find one or both addresses. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setStartAddress("Current Location");
        setRoutePoints(prev => ({
          ...prev,
          start: [latitude, longitude]
        }));
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: "Could not get your current location.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Safe Navigation</h1>
            <Button variant="outline" onClick={handleCurrentLocation}>
              <MapPin className="w-4 h-4 mr-2" />
              Current Location
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NavIcon className="w-5 h-5 text-pink-600" />
                Route Planner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <Input 
                    placeholder="Starting point" 
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                  />
                  <Input 
                    placeholder="Destination"
                    value={endAddress}
                    onChange={(e) => setEndAddress(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full"
                  onClick={handleFindRoute}
                  disabled={!startAddress || !endAddress}
                >
                  Find Safest Route
                </Button>
              </div>
            </CardContent>
          </Card>

          <SafeMap 
            startPoint={routePoints.start} 
            endPoint={routePoints.end}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Nearby Safe Zones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Central Police Station</p>
                      <p className="text-sm text-gray-500">0.5 km away</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Directions
                    </Button>
                  </li>
                  <li className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Women's Safety Center</p>
                      <p className="text-sm text-gray-500">1.2 km away</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Directions
                    </Button>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Safety Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Current Area</p>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Safe
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="font-medium">Police Response Time</p>
                    <span className="text-sm">~5 mins</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SOSButton />
    </div>
  );
};

export default Navigation;
