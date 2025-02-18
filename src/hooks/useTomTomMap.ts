
import { useEffect, useRef, useState } from "react";
import * as tt from "@tomtom-international/web-sdk-maps";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useTomTomMap = () => {
  const mapRef = useRef<tt.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>(null);

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

      mapRef.current = tt.map({
        key: apiKey,
        container: mapContainer.current,
        center: [0, 0],
        zoom: 13,
        style: 'main'
      });

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

  return { mapRef, mapContainer, apiKey };
};
