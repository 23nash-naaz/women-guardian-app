
import { SafetyPoint, Incident } from "@/hooks/useSafetyData";

export const calculateRouteSafety = (
  coordinates: [number, number][],
  safetyPoints: SafetyPoint[],
  incidents: Incident[]
) => {
  return coordinates.map(([lng, lat]) => {
    const nearbyPoints = safetyPoints.filter(point => {
      const distance = Math.sqrt(
        Math.pow(point.longitude - lng, 2) + 
        Math.pow(point.latitude - lat, 2)
      );
      return distance < 0.01;
    });

    const nearbyIncidents = incidents.filter(incident => {
      const distance = Math.sqrt(
        Math.pow(incident.longitude - lng, 2) + 
        Math.pow(incident.latitude - lat, 2)
      );
      return distance < 0.01;
    });

    const avgSafetyScore = nearbyPoints.length > 0 
      ? nearbyPoints.reduce((acc, point) => acc + point.safety_score, 0) / nearbyPoints.length 
      : 70;

    const finalScore = Math.max(0, avgSafetyScore - (nearbyIncidents.length * 10));

    return {
      coordinate: [lng, lat],
      safetyScore: finalScore
    };
  });
};
