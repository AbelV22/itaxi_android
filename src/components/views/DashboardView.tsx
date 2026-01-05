import { useState, useEffect } from "react";
import { RefreshCw, Plane, Clock } from "lucide-react";
import { TerminalCard } from "@/components/widgets/TerminalCard";
import { TrainsWidget } from "@/components/widgets/TrainsWidget";
import { CruisesWidget } from "@/components/widgets/CruisesWidget";
import { WeatherFloating } from "@/components/widgets/WeatherFloating";
import { EventsWidget } from "@/components/widgets/EventsWidget";
import { LicensePriceWidget } from "@/components/widgets/LicensePriceWidget";

// Tipos para vuelos.json
interface VueloRaw {
  id: string;
  origen: string;
  destino: string;
  fecha: string;
  hora_prog: string;
  hora_est: string;
  terminal: string;
  estado: string;
  aerolinea: string;
}

// Tipos para data.json (extras)
interface ExtrasData {
  licencia: number;
  licencia_tendencia: string;
  clima_prob: number;
  clima_estado: string;
}

interface DashboardViewProps {
  onTerminalClick?: (terminalId: string) => void;
  onViewAllFlights?: () => void;
  onViewAllEvents?: () => void;
}

// Función para parsear hora "HH:MM" a minutos del día
const parseHora = (hora: string): number => {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + (m || 0);
};

// Determinar tipo de terminal
const getTerminalType = (vuelo: VueloRaw): 't1' | 't2' | 't2c' | 'puente' => {
  const term = vuelo.terminal?.toUpperCase() || "";
  const airline = vuelo.id?.toUpperCase() || "";
  const origen = vuelo.origen?.toUpperCase() || "";
  
  // Puente Aéreo: vuelos IBE desde Madrid
  if (airline.startsWith("IBE") && origen.includes("MADRID")) {
    return "puente";
  }
  
  // T2C: EasyJet (EZY, EJU)
  if (airline.startsWith("EZY") || airline.startsWith("EJU")) {
    return "t2c";
  }
  
  // T1 vs T2 por terminal
  if (term.includes("1")) return "t1";
  if (term.includes("2")) return "t2";
  
  // Default
  return "t2";
};

// Tiempos de retén estimados por terminal y hora
const getEsperaReten = (terminalId: string, hora: number): number => {
  // Hora punta: 10-14h y 18-21h
  const isPeakHour = (hora >= 10 && hora <= 14) || (hora >= 18 && hora <= 21);
  
  const baseWait: Record<string, number> = {
    t1: 30,
    t2: 20,
    t2c: 15,
    puente: 10
  };
  
  return isPeakHour ? baseWait[terminalId] + 15 : baseWait[terminalId];
};

export function DashboardView({ onTerminalClick, onViewAllFlights, onViewAllEvents }: DashboardViewProps) {
  const [vuelos, setVuelos] = useState<VueloRaw[]>([]);
  const [extras, setExtras] = useState<ExtrasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateTime, setUpdateTime] = useState<string>("");

  useEffect(() => {
    Promise.all([
      fetch("/vuelos.json?t=" + Date.now()).then(res => res.json()).catch(() => []),
      fetch("/data.json?t=" + Date.now()).then(res => res.json()).catch(() => null)
    ]).then(([vuelosData, dataJson]) => {
      console.log("📡 Vuelos cargados:", vuelosData?.length || 0);
      setVuelos(Array.isArray(vuelosData) ? vuelosData : []);
      if (dataJson?.extras) setExtras(dataJson.extras);
      if (dataJson?.meta?.update_time) setUpdateTime(dataJson.meta.update_time);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <RefreshCw className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Conectando radar...</p>
      </div>
    );
  }

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = currentHour * 60 + now.getMinutes();

  // Filtrar y ordenar vuelos por hora
  const vuelosSorted = [...vuelos]
    .filter(v => v.hora_prog || v.hora_est)
    .sort((a, b) => parseHora(a.hora_est || a.hora_prog) - parseHora(b.hora_est || b.hora_prog));

  // Agrupar por terminal
  const terminalData: Record<string, { vuelos: VueloRaw[]; pax: number }> = {
    t1: { vuelos: [], pax: 0 },
    t2: { vuelos: [], pax: 0 },
    t2c: { vuelos: [], pax: 0 },
    puente: { vuelos: [], pax: 0 }
  };

  vuelosSorted.forEach(vuelo => {
    const type = getTerminalType(vuelo);
    terminalData[type].vuelos.push(vuelo);
    // Estimar ~180 pax por vuelo (promedio)
    terminalData[type].pax += 180;
  });

  // Config visual de terminales
  const terminals = [
    { id: "t1", name: "Terminal 1", color: "#3B82F6" },
    { id: "t2", name: "Terminal 2", color: "#10B981" },
    { id: "puente", name: "Puente Aéreo", color: "#8B5CF6" },
    { id: "t2c", name: "T2C EasyJet", color: "#F97316" },
  ];

  const totalVuelos = vuelosSorted.length;

  return (
    <div className="space-y-3 animate-fade-in pb-20">
      {/* Weather Floating */}
      <WeatherFloating 
        clima_prob={extras?.clima_prob} 
        clima_estado={extras?.clima_estado}
        temp={18}
      />

      {/* Header compacto con info clave */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Plane className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-sm">Aeropuerto BCN</h2>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Radar activo</span>
              {updateTime && <span className="ml-1">· {updateTime}</span>}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-display font-bold text-2xl text-primary">{totalVuelos}</p>
          <p className="text-[10px] text-muted-foreground">vuelos 24h</p>
        </div>
      </div>

      {/* Terminal Cards Grid - Optimizado móvil */}
      <div className="grid grid-cols-2 gap-2">
        {terminals.map(term => {
          const data = terminalData[term.id];
          const nextFlight = data.vuelos[0];
          return (
            <TerminalCard
              key={term.id}
              id={term.id}
              name={term.name}
              vuelos={data.vuelos.length}
              pax={data.pax}
              esperaMinutos={getEsperaReten(term.id, currentHour)}
              color={term.color}
              nextFlight={nextFlight ? {
                hora: nextFlight.hora_est || nextFlight.hora_prog,
                origen: nextFlight.origen
              } : undefined}
              onClick={() => onTerminalClick?.(term.id)}
            />
          );
        })}
      </div>

      {/* Próximos 5 vuelos rápido */}
      <div className="card-dashboard p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Próximos aterrizajes</span>
          <button 
            onClick={onViewAllFlights}
            className="text-[10px] text-primary hover:underline"
          >
            Ver todos →
          </button>
        </div>
        <div className="space-y-1.5">
          {vuelosSorted.slice(0, 5).map((vuelo, idx) => {
            const termType = getTerminalType(vuelo);
            const termColor = terminals.find(t => t.id === termType)?.color || "#666";
            return (
              <div 
                key={idx}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-primary min-w-[40px]">
                    {vuelo.hora_est || vuelo.hora_prog}
                  </span>
                  <div className="truncate max-w-[100px]">
                    <span className="text-foreground">{vuelo.origen}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">{vuelo.id}</span>
                  <span 
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                    style={{ 
                      backgroundColor: `${termColor}15`, 
                      color: termColor,
                      border: `1px solid ${termColor}30`
                    }}
                  >
                    {termType === 'puente' ? 'PA' : termType.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transporte Grid - Trenes y Cruceros */}
      <div className="grid grid-cols-2 gap-2">
        <TrainsWidget />
        <CruisesWidget />
      </div>

      {/* Secondary widgets - Solo visible en pantallas grandes */}
      <div className="hidden md:grid md:grid-cols-2 gap-4">
        <EventsWidget onViewAllClick={onViewAllEvents} />
        <LicensePriceWidget 
          precio={extras?.licencia || 0} 
          tendencia={extras?.licencia_tendencia || "estable"} 
        />
      </div>

      {/* Mobile: Eventos y Licencia compactos */}
      <div className="md:hidden space-y-2">
        <EventsWidget onViewAllClick={onViewAllEvents} />
        <LicensePriceWidget 
          precio={extras?.licencia || 0} 
          tendencia={extras?.licencia_tendencia || "estable"} 
        />
      </div>
    </div>
  );
}
