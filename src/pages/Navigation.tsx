
import Navbar from "@/components/Navbar";
import SOSButton from "@/components/SOSButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation as NavIcon, Shield } from "lucide-react";
import SafeMap from "@/components/SafeMap";

const Navigation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Safe Navigation</h1>
            <Button variant="outline">
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
                  <Input placeholder="Starting point" />
                  <Input placeholder="Destination" />
                </div>
                <Button className="w-full">
                  Find Safest Route
                </Button>
              </div>
            </CardContent>
          </Card>

          <SafeMap />

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
