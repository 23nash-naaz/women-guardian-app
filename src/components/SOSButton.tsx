
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

const SOSButton = () => {
  const [isActive, setIsActive] = useState(false);
  const { toast } = useToast();

  const handleSOS = () => {
    setIsActive(true);
    toast({
      title: "SOS Activated",
      description: "Emergency contacts and local authorities have been notified.",
      variant: "destructive",
    });

    // Simulated emergency contact
    setTimeout(() => {
      setIsActive(false);
      toast({
        title: "Help is on the way",
        description: "Stay calm and remain in a safe location.",
      });
    }, 2000);
  };

  return (
    <Button
      variant="destructive"
      size="lg"
      className={`rounded-full w-20 h-20 fixed bottom-8 right-8 shadow-lg transition-all duration-300 ${
        isActive ? "animate-pulse" : ""
      }`}
      onClick={handleSOS}
    >
      <AlertTriangle className="w-8 h-8" />
    </Button>
  );
};

export default SOSButton;
