
import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useToast } from "./ui/use-toast";

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

const SafeMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const [safetyPoints, setSafetyPoints] = useState<SafetyPoint[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialize map
    mapRef.current = L.map(mapContainer.current).setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapRef.current);

    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current?.setView([latitude, longitude], 15);
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

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [toast]);

  useEffect(() => {
    // Fetch initial safety points
    const fetchSafetyPoints = async () => {
      const { data, error } = await supabase
        .from("route_safety_points")
        .select("*");

      if (error) {
        console.error("Error fetching safety points:", error);
        return;
      }

      setSafetyPoints(data);
    };

    // Fetch initial incidents
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from("safety_incidents")
        .select("*")
        .eq("verified", true);

      if (error) {
        console.error("Error fetching incidents:", error);
        return;
      }

      setIncidents(data);
    };

    fetchSafetyPoints();
    fetchIncidents();

    // Subscribe to real-time updates
    const safetyChannel = supabase
      .channel("safety-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "route_safety_points" },
        (payload) => {
          console.log("Safety point update:", payload);
          fetchSafetyPoints(); // Refresh safety points
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "safety_incidents" },
        (payload) => {
          console.log("Incident update:", payload);
          fetchIncidents(); // Refresh incidents
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(safetyChannel);
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        layer.remove();
      }
    });

    // Add safety points
    safetyPoints.forEach((point) => {
      const color = point.safety_score > 70 ? "green" : 
                   point.safety_score > 40 ? "yellow" : "red";
      
      L.circle([point.latitude, point.longitude], {
        color,
        fillColor: color,
        fillOpacity: 0.2,
        radius: 100
      }).addTo(mapRef.current!);
    });

    // Add incident markers
    incidents.forEach((incident) => {
      L.marker([incident.latitude, incident.longitude])
        .bindPopup(`
          <strong>${incident.incident_type}</strong><br>
          ${incident.description}<br>
          <small>Reported: ${new Date(incident.created_at).toLocaleString()}</small>
        `)
        .addTo(mapRef.current!);
    });
  }, [safetyPoints, incidents]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Safety information is updated in real-time. Areas marked in red should be avoided.
          </AlertDescription>
        </Alert>
        <div ref={mapContainer} className="h-[500px] w-full rounded-lg" />
      </div>
    </Card>
  );
};

export default SafeMap;
