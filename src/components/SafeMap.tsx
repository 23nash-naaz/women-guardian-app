
import { useEffect } from "react";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";
import * as tt from "@tomtom-international/web-sdk-maps";
import * as ttapi from "@tomtom-international/web-sdk-services";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import { useToast } from "@/hooks/use-toast";
import { useTomTomMap } from "@/hooks/useTomTomMap";
import { useSafetyData } from "@/hooks/useSafetyData";
import { calculateRouteSafety } from "@/utils/safetyCalculations";

interface Props {
  startPoint?: [number, number];
  endPoint?: [number, number];
}

const SafeMap = ({ startPoint, endPoint }: Props) => {
  const { mapRef, mapContainer, apiKey } = useTomTomMap();
  const { safetyPoints, incidents } = useSafetyData();
  const { toast } = useToast();

  useEffect(() => {
    const drawRoute = async () => {
      if (!mapRef.current || !startPoint || !endPoint || !apiKey) return;

      try {
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
          point => [point.lon, point.lat] as [number, number]
        );

        const safetyScores = calculateRouteSafety(coordinates, safetyPoints, incidents);

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

    if (startPoint && endPoint) {
      drawRoute();
    }
  }, [startPoint, endPoint, safetyPoints, incidents, apiKey, mapRef, toast]);

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
