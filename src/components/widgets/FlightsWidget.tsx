import { Plane, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Terminal {
  id: string;
  name: string;
  arrivals: number;
  passengers: string;
}

const terminals: Terminal[] = [
  { id: "t1", name: "T1", arrivals: 5, passengers: "1,070" },
  { id: "t2", name: "T2", arrivals: 4, passengers: "796" },
  { id: "puente", name: "Puente Aéreo", arrivals: 6, passengers: "1,175" },
];

interface FlightsWidgetProps {
  expanded?: boolean;
}

export function FlightsWidget({ expanded = false }: FlightsWidgetProps) {
  return (
    <div className="card-dashboard p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
            <Plane className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Llegadas Aeropuerto</h3>
            <p className="text-sm text-muted-foreground">Próxima hora</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {terminals.map((terminal) => (
          <div 
            key={terminal.id}
            className="text-center p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Plane className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{terminal.name}</span>
            </div>
            
            <p className="stat-value mb-1">{terminal.arrivals}</p>
            <p className="text-sm text-muted-foreground mb-2">vuelos próxima hora</p>
            
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">{terminal.passengers} pasajeros</span>
            </div>
          </div>
        ))}
      </div>

      {!expanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hora punta estimada</span>
            <span className="font-semibold text-primary flex items-center gap-1">
              <Clock className="h-4 w-4" />
              14:30 - 16:00
            </span>
          </div>
        </div>
      )}
    </div>
  );
}