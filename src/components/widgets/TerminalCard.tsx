import { Plane, Users, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalCardProps {
  id: string;
  name: string;
  vuelos: number;
  pax: number;
  esperaMinutos: number;
  color: string;
  nextFlight?: { hora: string; origen: string };
  onClick?: () => void;
}

export function TerminalCard({ 
  id, 
  name, 
  vuelos, 
  pax, 
  esperaMinutos, 
  color, 
  nextFlight,
  onClick 
}: TerminalCardProps) {
  // Determinar si la espera es alta (>25min) o baja (<10min)
  const esperaLevel = esperaMinutos <= 10 ? "low" : esperaMinutos <= 25 ? "medium" : "high";
  
  return (
    <button 
      onClick={onClick}
      className="w-full card-dashboard p-3 hover:border-primary/30 transition-all group text-left"
    >
      {/* Header con nombre y flecha */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <span className="font-display font-semibold text-sm text-foreground">{name}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      {/* Stats row */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex items-center gap-1">
          <Plane className="h-3 w-3 text-muted-foreground" />
          <span className="font-display font-bold text-lg" style={{ color }}>{vuelos}</span>
          <span className="text-[10px] text-muted-foreground">vuelos</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-amber-400" />
          <span className="font-display font-bold text-amber-400">{(pax / 1000).toFixed(1)}k</span>
        </div>
      </div>
      
      {/* Tiempo de retén */}
      <div className={cn(
        "flex items-center justify-between p-2 rounded-lg text-xs",
        esperaLevel === "low" && "bg-success/10 border border-success/20",
        esperaLevel === "medium" && "bg-amber-500/10 border border-amber-500/20",
        esperaLevel === "high" && "bg-destructive/10 border border-destructive/20"
      )}>
        <div className="flex items-center gap-1.5">
          <Clock className={cn(
            "h-3 w-3",
            esperaLevel === "low" && "text-success",
            esperaLevel === "medium" && "text-amber-400",
            esperaLevel === "high" && "text-destructive"
          )} />
          <span className="text-muted-foreground">Retén</span>
        </div>
        <span className={cn(
          "font-display font-bold",
          esperaLevel === "low" && "text-success",
          esperaLevel === "medium" && "text-amber-400",
          esperaLevel === "high" && "text-destructive"
        )}>
          ~{esperaMinutos} min
        </span>
      </div>
      
      {/* Próximo vuelo */}
      {nextFlight && (
        <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
          <span>Próximo:</span>
          <span className="font-medium text-foreground">{nextFlight.hora}</span>
          <span>desde</span>
          <span className="font-medium text-foreground">{nextFlight.origen}</span>
        </div>
      )}
    </button>
  );
}
