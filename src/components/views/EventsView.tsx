import { useState } from "react";
import { Calendar, MapPin, Users, Clock, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalendarEvent {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  attendees: number;
  type: "Deportes" | "Música" | "Tecnología" | "Cultura";
}

const events: CalendarEvent[] = [
  {
    id: "1",
    title: "FC Barcelona vs Real Madrid",
    location: "Camp Nou",
    date: "viernes, 15 de marzo",
    time: "21:00h",
    attendees: 98000,
    type: "Deportes",
  },
  {
    id: "2",
    title: "Primavera Sound 2024",
    location: "Parc del Fòrum",
    date: "sábado, 1 de junio",
    time: "16:00h",
    attendees: 65000,
    type: "Música",
  },
  {
    id: "3",
    title: "Mobile World Congress",
    location: "Fira Gran Via",
    date: "lunes, 26 de febrero",
    time: "09:00h",
    attendees: 100000,
    type: "Tecnología",
  },
  {
    id: "4",
    title: "Concierto Coldplay",
    location: "Estadi Olímpic",
    date: "lunes, 20 de mayo",
    time: "20:30h",
    attendees: 55000,
    type: "Música",
  },
  {
    id: "5",
    title: "Feria de Abril",
    location: "Fòrum",
    date: "jueves, 18 de abril",
    time: "12:00h",
    attendees: 30000,
    type: "Cultura",
  },
  {
    id: "6",
    title: "Zurich Marató Barcelona",
    location: "Centro Ciudad",
    date: "domingo, 10 de marzo",
    time: "08:30h",
    attendees: 20000,
    type: "Deportes",
  },
];

const typeColors: Record<string, string> = {
  Deportes: "bg-success/20 text-success border border-success/30",
  Música: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  Tecnología: "bg-info/20 text-info border border-info/30",
  Cultura: "bg-primary/20 text-primary border border-primary/30",
};

const tabs = [
  { id: "licencias", label: "Licencias", icon: "📊" },
  { id: "eventos", label: "Eventos", icon: "📅", active: true },
  { id: "vuelos", label: "Vuelos", icon: "✈️" },
  { id: "cruceros", label: "Cruceros", icon: "🚢" },
  { id: "trenes", label: "Trenes", icon: "🚂" },
  { id: "vehiculos", label: "Vehículos", icon: "🚗" },
  { id: "mes", label: "Del Mes", icon: "👤" },
];

export function EventsView() {
  const [activeTab, setActiveTab] = useState("eventos");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={tab.active ? "default" : "outline"}
            size="sm"
            className={cn(
              "gap-2",
              tab.active && "bg-primary text-primary-foreground"
            )}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Map Placeholder */}
      <div className="card-dashboard p-6 min-h-[300px] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Decorative dots for map effect */}
          <div className="absolute top-16 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="absolute top-24 left-1/3 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div className="absolute top-32 right-1/3 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-24 left-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-32 right-1/4 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "2s" }} />
          
          {/* Center marker */}
          <div className="relative">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center mt-4">
              <p className="text-foreground font-medium">Mapa interactivo de Barcelona</p>
              <p className="text-sm text-muted-foreground">Próximamente con ubicación en tiempo real</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="card-dashboard-hover p-5">
            <div className="flex items-start justify-between mb-3">
              <Badge className={typeColors[event.type]}>
                {event.type}
              </Badge>
              <div className="flex items-center gap-1 text-primary">
                <Users className="h-4 w-4" />
                <span className="font-medium">{event.attendees.toLocaleString()}</span>
              </div>
            </div>
            
            <h3 className="font-semibold text-foreground mb-3">{event.title}</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}