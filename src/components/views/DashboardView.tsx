import { useState, useEffect } from "react";
import { RefreshCw, Plane, LogIn, LogOut, Train, Users, Clock, ChevronRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos para vuelos.json (estructura real del scraper)
interface VueloRaw {
  hora: string;
  vuelo: string;
  aerolinea: string;
  origen: string;
  terminal: string;
  sala: string;
  estado: string;
  dia_relativo: number;
}

interface TrenSants {
  hora: string;
  origen: string;
  tren: string;
  via: string;
}

interface DashboardViewProps {
  onTerminalClick?: (terminalId: string) => void;
  onViewAllFlights?: () => void;
  onViewAllEvents?: () => void;
  onViewFullDay?: () => void;
  onViewTrainsFullDay?: () => void;
  onViewLicenses?: () => void;
}

// Función para parsear hora "HH:MM" a minutos del día
const parseHora = (hora: string): number => {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

// Determinar tipo de terminal basado en los datos reales del scraper
const getTerminalType = (vuelo: VueloRaw): 't1' | 't2' | 't2c' | 'puente' => {
  const terminal = vuelo.terminal?.toUpperCase() || "";
  const codigosVuelo = vuelo.vuelo?.toUpperCase() || "";
  const origen = vuelo.origen?.toUpperCase() || "";
  
  if (terminal.includes("T2C") || terminal.includes("EASYJET")) return "t2c";
  if (codigosVuelo.includes("EJU") || codigosVuelo.includes("EZY")) return "t2c";
  if (origen.includes("MADRID") && codigosVuelo.includes("IBE")) return "puente";
  if (terminal.includes("T2A") || terminal.includes("T2B")) return "t2";
  if (terminal.includes("T1")) return "t1";
  return "t2";
};

// Tiempos de retén estimados por terminal y hora del día
const getEsperaReten = (terminalId: string, currentHour: number): number => {
  const isPeakHour = (currentHour >= 10 && currentHour <= 14) || (currentHour >= 18 && currentHour <= 21);
  const baseWait: Record<string, number> = { t1: 25, t2: 15, t2c: 12, puente: 8 };
  const base = baseWait[terminalId] || 20;
  return isPeakHour ? base + 12 : base;
};

// Extraer tipo de tren limpio
const getTipoTren = (tren: string): string => {
  if (!tren) return "";
  const tipo = tren.split("\n")[0].trim();
  if (tipo.includes("IRYO") || tipo.includes("IL -")) return "IRYO";
  if (tipo.includes("OUIGO")) return "OUIGO";
  if (tipo.includes("TGV")) return "TGV";
  return tipo;
};

// Color por tipo de tren
const getTrenColorClass = (tren: string): string => {
  const tipo = getTipoTren(tren);
  switch (tipo) {
    case "AVE": return "text-red-400";
    case "IRYO": return "text-purple-400";
    case "OUIGO": return "text-pink-400";
    case "TGV": return "text-indigo-400";
    default: return "text-muted-foreground";
  }
};

// Extraer ciudad
const getCiudad = (origen: string): string => {
  if (!origen) return "";
  if (origen.toLowerCase().includes("madrid")) return "Madrid";
  if (origen.toLowerCase().includes("sevilla")) return "Sevilla";
  if (origen.toLowerCase().includes("málaga")) return "Málaga";
  if (origen.toLowerCase().includes("valència") || origen.toLowerCase().includes("valencia")) return "València";
  if (origen.toLowerCase().includes("paris")) return "París";
  return origen.split(" ")[0].split("-")[0];
};

export function DashboardView({ onTerminalClick, onViewAllFlights, onViewAllEvents, onViewFullDay, onViewTrainsFullDay, onViewLicenses }: DashboardViewProps) {
  const [vuelos, setVuelos] = useState<VueloRaw[]>([]);
  const [trenes, setTrenes] = useState<TrenSants[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    Promise.all([
      fetch("/vuelos.json?t=" + Date.now()).then(res => res.json()).catch(() => []),
      fetch("/trenes_sants.json?t=" + Date.now()).then(res => res.json()).catch(() => [])
    ]).then(([vuelosData, trenesData]) => {
      setVuelos(Array.isArray(vuelosData) ? vuelosData : []);
      const uniqueTrenes = (trenesData as TrenSants[]).filter((tren, index, self) =>
        index === self.findIndex(t => t.hora === tren.hora && t.tren === tren.tren)
      );
      setTrenes(uniqueTrenes);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
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

  // Filter and sort flights
  const vuelosActivos = vuelos.filter(v => !v.estado?.toLowerCase().includes("cancelado"));
  const vuelosSorted = [...vuelosActivos].sort((a, b) => {
    if (a.dia_relativo !== b.dia_relativo) return a.dia_relativo - b.dia_relativo;
    return parseHora(a.hora) - parseHora(b.hora);
  });

  // Group by terminal
  const terminalData: Record<string, { vuelos: VueloRaw[] }> = {
    t1: { vuelos: [] }, t2: { vuelos: [] }, t2c: { vuelos: [] }, puente: { vuelos: [] }
  };
  vuelosSorted.forEach(vuelo => {
    const type = getTerminalType(vuelo);
    terminalData[type].vuelos.push(vuelo);
  });

  // Count flights per hour and terminal
  const countByHourAndTerminal: Record<string, Record<number, number>> = {
    t1: {}, t2: {}, t2c: {}, puente: {}
  };
  Object.entries(terminalData).forEach(([terminal, data]) => {
    data.vuelos.forEach(v => {
      const hour = parseInt(v.hora?.split(":")[0] || "0", 10);
      countByHourAndTerminal[terminal][hour] = (countByHourAndTerminal[terminal][hour] || 0) + 1;
    });
  });

  const getVuelosPorHora = (terminalId: string, horaOffset: number) => {
    const targetHour = (currentHour + horaOffset) % 24;
    return countByHourAndTerminal[terminalId][targetHour] || 0;
  };

  // Terminal config
  const terminals = [
    { id: "t1", name: "T1", vuelosEstaHora: getVuelosPorHora("t1", 0), espera: getEsperaReten("t1", currentHour), contribuidores: 3 },
    { id: "t2", name: "T2", vuelosEstaHora: getVuelosPorHora("t2", 0), espera: getEsperaReten("t2", currentHour), contribuidores: 2 },
    { id: "puente", name: "Puente", vuelosEstaHora: getVuelosPorHora("puente", 0), espera: getEsperaReten("puente", currentHour), contribuidores: 1 },
  ];

  // Próximos trenes
  const proximosTrenes = trenes.filter(tren => {
    const [h, m] = tren.hora.split(":").map(Number);
    const trenMinutes = h * 60 + m;
    return trenMinutes >= currentMinutes - 5 && trenMinutes <= currentMinutes + 120;
  }).slice(0, 4);

  const trenesProximaHora = trenes.filter(tren => {
    const [h, m] = tren.hora.split(":").map(Number);
    const trenMinutes = h * 60 + m;
    return trenMinutes >= currentMinutes && trenMinutes < currentMinutes + 60;
  }).length;

  return (
    <div className="space-y-4 animate-fade-in pb-20">

      {/* === ACTION BUTTONS - SOLID STYLE === */}
      <div className="grid grid-cols-2 gap-3">
        <button className="relative flex items-center justify-center gap-2.5 p-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-semibold shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)]">
          <LogIn className="h-5 w-5" />
          <span>Entro al retén</span>
        </button>
        <button className="flex items-center justify-center gap-2.5 p-4 rounded-xl bg-amber-500 hover:bg-amber-400 transition-all text-black font-semibold">
          <LogOut className="h-5 w-5" />
          <span>Salgo del retén</span>
        </button>
      </div>

      {/* === AEROPUERTO SECTION === */}
      <section className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aeropuerto BCN</span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En vivo
            </span>
          </div>
          <button onClick={onViewFullDay} className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Ver día <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Terminal Cards - Clean, Big Numbers */}
        <div className="grid grid-cols-3 gap-2">
          {terminals.map(term => {
            const esperaLevel = term.espera <= 10 ? "low" : term.espera <= 25 ? "medium" : "high";
            const isHighDemand = term.vuelosEstaHora >= 8;
            
            return (
              <button
                key={term.id}
                onClick={() => onTerminalClick?.(term.id)}
                className="relative p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all group text-left"
              >
                {/* Terminal Name */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{term.name}</span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
                
                {/* BIG NUMBER - The hero */}
                <div className="mb-2">
                  <span className={cn(
                    "font-mono font-black text-4xl tabular-nums tracking-tight",
                    isHighDemand ? "text-white" : "text-muted-foreground/60"
                  )}>
                    {term.vuelosEstaHora}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">vuelos/h</span>
                </div>

                {/* Retén Status Badge - High Contrast */}
                <div className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold",
                  esperaLevel === "low" && "bg-emerald-500 text-white",
                  esperaLevel === "medium" && "bg-amber-400 text-black",
                  esperaLevel === "high" && "bg-red-500 text-white"
                )}>
                  <Clock className="h-2.5 w-2.5" />
                  ~{term.espera} min
                </div>

                {/* Social Proof */}
                {term.contribuidores > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-[9px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{term.contribuidores} taxistas informaron</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* === TRENES SANTS - DEPARTURE BOARD STYLE === */}
      <section className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Train className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estación Sants</span>
            <span className="font-mono text-lg font-bold text-white tabular-nums">{trenesProximaHora}</span>
            <span className="text-[10px] text-muted-foreground">/hora</span>
          </div>
          <button onClick={onViewTrainsFullDay} className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Ver día <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {/* Departure Board Table */}
        <div className="rounded-xl bg-black/40 border border-white/5 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[60px_1fr_80px] gap-2 px-3 py-2 bg-white/[0.02] border-b border-white/5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Hora</span>
            <span>Origen</span>
            <span className="text-right">Operador</span>
          </div>
          
          {/* Train Rows */}
          <div className="divide-y divide-white/5">
            {proximosTrenes.length > 0 ? proximosTrenes.map((tren, idx) => {
              const [h, m] = tren.hora.split(":").map(Number);
              const trenMinutes = h * 60 + m;
              const minutosRestantes = trenMinutes - currentMinutes;
              const isInminente = minutosRestantes <= 15 && minutosRestantes >= 0;
              
              return (
                <div 
                  key={idx}
                  className={cn(
                    "grid grid-cols-[60px_1fr_80px] gap-2 px-3 py-2.5 items-center transition-colors",
                    isInminente && "bg-amber-500/10"
                  )}
                >
                  {/* Time - Monospace */}
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "font-mono text-sm font-bold tabular-nums",
                      isInminente ? "text-amber-400" : "text-white"
                    )}>
                      {tren.hora}
                    </span>
                    {isInminente && (
                      <span className="text-[9px] text-amber-400 font-medium">
                        {minutosRestantes > 0 ? `${minutosRestantes}'` : "¡Ya!"}
                      </span>
                    )}
                  </div>
                  
                  {/* Origin */}
                  <div className="flex items-center gap-1.5 text-sm text-white/90 truncate">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{getCiudad(tren.origen)}</span>
                  </div>
                  
                  {/* Operator Badge */}
                  <div className="text-right">
                    <span className={cn(
                      "font-mono text-xs font-semibold",
                      getTrenColorClass(tren.tren)
                    )}>
                      {getTipoTren(tren.tren)}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                No hay trenes próximos
              </div>
            )}
          </div>
        </div>
      </section>

      {/* === QUICK NAV BUTTONS === */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onViewAllEvents}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20">
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-foreground">Eventos</p>
            <p className="text-[10px] text-muted-foreground">Congresos y conciertos</p>
          </div>
        </button>

        <button
          onClick={onViewLicenses}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-all group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <span className="text-lg">🚕</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-foreground">Licencias</p>
            <p className="text-[10px] text-muted-foreground">Precio actual</p>
          </div>
        </button>
      </div>
    </div>
  );
}
