import { Ship, Clock, Anchor } from "lucide-react";
import { cn } from "@/lib/utils";

interface CruisesWidgetProps {
  cruceros?: number;
  pax?: number;
  esperaMinutos?: number;
  proximoDesembarco?: string;
}

export function CruisesWidget({ 
  cruceros = 2, 
  pax = 6500, 
  esperaMinutos = 18,
  proximoDesembarco = "11:00"
}: CruisesWidgetProps) {
  const esperaLevel = esperaMinutos <= 15 ? "low" : esperaMinutos <= 25 ? "medium" : "high";
  
  return (
    <div className="card-dashboard p-3 space-y-2">
      {/* Header compacto */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10">
            <Ship className="h-3.5 w-3.5 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground text-xs">Puerto BCN</h3>
            <p className="text-[10px] text-muted-foreground">Cruceros hoy</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1">
            <Anchor className="h-3 w-3 text-cyan-400" />
            <span className="font-display font-bold text-xl text-cyan-400">{cruceros}</span>
          </div>
        </div>
      </div>

      {/* Info rápida */}
      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
        <div>
          <span className="text-muted-foreground">Pasajeros: </span>
          <span className="font-display font-bold text-amber-400">{(pax / 1000).toFixed(1)}k</span>
        </div>
        <div>
          <span className="text-muted-foreground">Próximo: </span>
          <span className="font-display font-bold text-purple-400">{proximoDesembarco}</span>
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
          <span className="text-muted-foreground">Retén Puerto</span>
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
    </div>
  );
}
