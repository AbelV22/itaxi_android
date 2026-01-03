import { useState } from "react";
import { Plane, Clock, Users, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const terminalStats = [
  { id: "t1", name: "T1", flights: 5, passengers: "1,070", color: "#3B82F6" },
  { id: "t2", name: "T2", flights: 4, passengers: "796", color: "#10B981" },
  { id: "puente", name: "Puente Aéreo", flights: 6, passengers: "1,175", color: "#F59E0B" },
];

const flightsData = {
  t1: [
    { flight: "IB2341", origin: "Madrid", status: "Aterrizando", time: "08:15", aircraft: "Airbus A321", passengers: 220 },
    { flight: "VY1234", origin: "París CDG", status: "En hora", time: "08:45", aircraft: "Airbus A320", passengers: 180 },
    { flight: "BA478", origin: "Londres LHR", status: "En hora", time: "09:00", aircraft: "Boeing 777", passengers: 350 },
    { flight: "LH1138", origin: "Frankfurt", status: "En hora", time: "09:30", aircraft: "Airbus A319", passengers: 140 },
  ],
  t2: [
    { flight: "FR8921", origin: "Milán BGY", status: "En hora", time: "08:30", aircraft: "Boeing 737", passengers: 189 },
    { flight: "W64521", origin: "Budapest", status: "En hora", time: "09:15", aircraft: "Airbus A321", passengers: 220 },
  ],
  puente: [
    { flight: "IB3124", origin: "Madrid", status: "Aterrizando", time: "08:00", aircraft: "Airbus A320", passengers: 180 },
    { flight: "VY1001", origin: "Madrid", status: "En hora", time: "08:30", aircraft: "Airbus A320", passengers: 180 },
    { flight: "IB3126", origin: "Madrid", status: "En hora", time: "09:00", aircraft: "Airbus A321", passengers: 220 },
  ],
};

export function FlightsView() {
  const [selectedTerminal, setSelectedTerminal] = useState("t1");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">
          Llegadas al Aeropuerto
        </h2>
        <p className="text-muted-foreground">
          Información en tiempo real de vuelos llegando a El Prat para optimizar tu posición
        </p>
      </div>

      {/* Terminal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {terminalStats.map((terminal) => (
          <div
            key={terminal.id}
            className="card-dashboard p-6 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Plane className="h-5 w-5 text-muted-foreground" />
              <span className="text-lg font-medium text-foreground">{terminal.name}</span>
            </div>
            <p className="stat-value mb-1">{terminal.flights}</p>
            <p className="text-sm text-muted-foreground mb-2">vuelos próxima hora</p>
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">{terminal.passengers} pasajeros</span>
            </div>
          </div>
        ))}
      </div>

      {/* Flights Table */}
      <div className="card-dashboard overflow-hidden">
        <Tabs value={selectedTerminal} onValueChange={setSelectedTerminal}>
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger 
              value="t1" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4"
            >
              Terminal 1
            </TabsTrigger>
            <TabsTrigger 
              value="t2" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4"
            >
              Terminal 2
            </TabsTrigger>
            <TabsTrigger 
              value="puente" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 text-primary"
            >
              Puente Aéreo
            </TabsTrigger>
          </TabsList>

          {Object.entries(flightsData).map(([terminal, flights]) => (
            <TabsContent key={terminal} value={terminal} className="m-0">
              <div className="divide-y divide-border">
                {flights.map((flight, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-6 hover:bg-accent/30 transition-colors">
                    {/* Arrow Icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <ArrowDown className="h-5 w-5 text-muted-foreground" />
                    </div>

                    {/* Flight Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-foreground">{flight.flight}</span>
                        <Badge 
                          className={cn(
                            "text-xs",
                            flight.status === "Aterrizando" 
                              ? "status-landing" 
                              : "status-ontime"
                          )}
                        >
                          {flight.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{flight.origin}</p>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="font-mono text-lg text-foreground">{flight.time}</span>
                    </div>

                    {/* Aircraft */}
                    <div className="text-right hidden md:block">
                      <p className="text-xs text-muted-foreground">Avión</p>
                      <p className="text-sm font-medium text-primary">{flight.aircraft}</p>
                    </div>

                    {/* Passengers */}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-primary font-medium">{flight.passengers}</span>
                      <span className="text-xs text-muted-foreground">pasajeros</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}