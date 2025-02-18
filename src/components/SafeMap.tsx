import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import * as tt from "@tomtom-international/web-sdk-maps";
import * as ttapi from "@tomtom-international/web-sdk-services";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { useToast } from "@/hooks/use-toast";

interface SafetyPoint {
  id: string;
  latitude: number;
  longitude: number;
  safety_score: number;
  incident_count: number;
}

interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  incident_type: string;
  description: string;
  created_at: string;
}

interface Props {
  startPoint?: [number, number];
  endPoint?: [number, number];
}

const SafeMap = ({ startPoint, endPoint }: Props) => {
  const mapRef = useRef<tt.Map | null>(null);
  const [safetyPoints, setSafetyPoints] = useState<SafetyPoint[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>(null);

  // Fetch API key once at component mount
  useEffect(() => {
    const fetchApiKey = async () => {
      const { data } = await supabase
        .from('secrets')
        .select('*')
        .eq('name', 'TOMTOM_API_KEY')
        .maybeSingle();

      if (data) {
        setApiKey(data.secret);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current || mapRef.current || !apiKey) return;

      // Initialize TomTom map
      mapRef.current = tt.map({
        key: apiKey,
        container: mapContainer.current,
        center: [0, 0],
        zoom: 13,
        style: 'main'
      });

      // Get user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          mapRef.current?.setCenter([longitude, latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Could not get your current location. Using default view.",
            variant: "destructive",
          });
        }
      );
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [apiKey, toast]);

  // Calculate route safety score based on nearby safety points and incidents
  const calculateRouteSafety = (coordinates: [number, number][]) => {
    return coordinates.map(([lng, lat]) => {
      const nearbyPoints = safetyPoints.filter(point => {
        const distance = Math.sqrt(
          Math.pow(point.longitude - lng, 2) + 
          Math.pow(point.latitude - lat, 2)
        );
        return distance < 0.01; // Roughly 1km radius
      });

      const nearbyIncidents = incidents.filter(incident => {
        const distance = Math.sqrt(
          Math.pow(incident.longitude - lng, 2) + 
          Math.pow(incident.latitude - lat, 2)
        );
        return distance < 0.01;
      });

      // Calculate safety score
      const avgSafetyScore = nearbyPoints.length > 0 
        ? nearbyPoints.reduce((acc, point) => acc + point.safety_score, 0) / nearbyPoints.length 
        : 70; // Default safety score if no data

      // Reduce safety score based on nearby incidents
      const finalScore = Math.max(0, avgSafetyScore - (nearbyIncidents.length * 10));

      return {
        coordinate: [lng, lat],
        safetyScore: finalScore
      };
    });
  };

  // Draw route on map
  const drawRoute = async () => {
    if (!mapRef.current || !startPoint || !endPoint || !apiKey) return;

    try {
      // Calculate route using TomTom API
      const routeOptions = {
        key: apiKey,
        locations: [
          `${startPoint[0]},${startPoint[1]}`,
          `${endPoint[0]},${endPoint[1]}`
        ]
      };

      const response = await ttapi.services.calculateRoute(routeOptions);
      
      if (!response.routes || !response.routes[0]) {
        throw new Error("No route found");
      }

      const coordinates = response.routes[0].legs[0].points.map(
        point => [point.longitude, point.latitude] as [number, number]
      );

      // Calculate safety scores for route points
      const safetyScores = calculateRouteSafety(coordinates);

      // Draw route segments with color based on safety score
      for (let i = 0; i < safetyScores.length - 1; i++) {
        const color = safetyScores[i].safetyScore > 60 ? '#FFD700' : '#FF0000';
        
        const lineString: GeoJSON.Feature = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              safetyScores[i].coordinate,
              safetyScores[i + 1].coordinate
            ]
          }
        };

        if (mapRef.current.getLayer(`route-segment-${i}`)) {
          mapRef.current.removeLayer(`route-segment-${i}`);
          mapRef.current.removeSource(`route-segment-${i}`);
        }

        mapRef.current.addLayer({
          id: `route-segment-${i}`,
          type: 'line',
          source: {
            type: 'geojson',
            data: lineString
          },
          paint: {
            'line-color': color,
            'line-width': 6
          }
        });
      }

      // Fit map to show entire route
      const bounds = new tt.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord as tt.LngLatLike));
      mapRef.current.fitBounds(bounds, { padding: 50 });

    } catch (error) {
      console.error("Error calculating route:", error);
      toast({
        title: "Route Error",
        description: "Could not calculate the route. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch safety data
  useEffect(() => {
    const fetchSafetyData = async () => {
      const [safetyPointsRes, incidentsRes] = await Promise.all([
        supabase.from("route_safety_points").select("*"),
        supabase.from("safety_incidents").select("*").eq("verified", true)
      ]);

      if (safetyPointsRes.error) {
        console.error("Error fetching safety points:", safetyPointsRes.error);
        return;
      }

      if (incidentsRes.error) {
        console.error("Error fetching incidents:", incidentsRes.error);
        return;
      }

      setSafetyPoints(safetyPointsRes.data);
      setIncidents(incidentsRes.data);
    };

    fetchSafetyData();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("safety-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "route_safety_points" },
        () => fetchSafetyData()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "safety_incidents" },
        () => fetchSafetyData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update route when points change or safety data updates
  useEffect(() => {
    if (startPoint && endPoint) {
      drawRoute();
    }
  }, [startPoint, endPoint, safetyPoints, incidents, apiKey]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Routes are color-coded based on safety: Yellow for safer areas, Red for areas with reported incidents.
          </AlertDescription>
        </Alert>
        <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
      </div>
    </Card>
  );
};

export default SafeMap;
