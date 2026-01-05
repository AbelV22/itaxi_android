import { useState } from "react";
import { Cloud, CloudRain, Sun, Droplets, Wind, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherFloatingProps {
  clima_prob?: number;
  clima_estado?: string;
  temp?: number;
}

export function WeatherFloating({ clima_prob = 20, clima_estado = "soleado", temp = 18 }: WeatherFloatingProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isRainAlert = clima_prob >= 50;
  
  const getWeatherIcon = () => {
    if (isRainAlert) return <CloudRain className="h-4 w-4" />;
    if (clima_estado?.toLowerCase().includes("nub")) return <Cloud className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  return (
    <div className="fixed top-2 right-2 z-50 md:top-4 md:right-4">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-md transition-all",
            isRainAlert 
              ? "bg-rain/20 text-rain border border-rain/30 animate-pulse" 
              : "bg-background/80 text-foreground border border-border"
          )}
        >
          {getWeatherIcon()}
          <span className="font-display">{temp}°</span>
          {isRainAlert && <span>{clima_prob}%</span>}
        </button>
      ) : (
        <div className="bg-background/95 backdrop-blur-md rounded-xl border border-border shadow-xl p-3 min-w-[160px] animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getWeatherIcon()}
              <span className="font-display font-bold text-lg">{temp}°C</span>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-muted rounded-full"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground capitalize mb-2">{clima_estado}</p>
          
          <div className="space-y-1">
            <div className={cn(
              "flex items-center justify-between text-xs p-1.5 rounded-lg",
              isRainAlert ? "bg-rain/10 text-rain" : "bg-muted"
            )}>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                <span>Lluvia</span>
              </div>
              <span className="font-display font-bold">{clima_prob}%</span>
            </div>
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-muted">
              <div className="flex items-center gap-1">
                <Wind className="h-3 w-3" />
                <span>Viento</span>
              </div>
              <span className="font-display font-medium">12 km/h</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
