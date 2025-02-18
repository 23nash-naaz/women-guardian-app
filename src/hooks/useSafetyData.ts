
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SafetyPoint {
  id: string;
  latitude: number;
  longitude: number;
  safety_score: number;
  incident_count: number;
}

export interface Incident {
  id: string;
  latitude: number;
  longitude: number;
  incident_type: string;
  description: string;
  created_at: string;
}

export const useSafetyData = () => {
  const [safetyPoints, setSafetyPoints] = useState<SafetyPoint[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

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

  return { safetyPoints, incidents };
};
