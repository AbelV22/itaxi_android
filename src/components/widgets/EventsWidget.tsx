import { Calendar, MapPin, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Event {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  attendees: number;
  type: "Deportes" | "Música" | "Tecnología" | "Cultura";
}

const upcomingEvents: Event[] = [
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
];

const typeColors: Record<string, string> = {
  Deportes: "bg-success/20 text-success border border-success/30",
  Música: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  Tecnología: "bg-info/20 text-info border border-info/30",
  Cultura: "bg-primary/20 text-primary border border-primary/30",
};

interface EventsWidgetProps {
  expanded?: boolean;
  limit?: number;
}

export function EventsWidget({ expanded = false, limit = 3 }: EventsWidgetProps) {
  const displayEvents = expanded ? upcomingEvents : upcomingEvents.slice(0, limit);

  return (
    <div className="card-dashboard p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Calendar className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Eventos Barcelona</h3>
            <p className="text-sm text-muted-foreground">Próximos eventos de alto tráfico</p>
          </div>
        </div>
        {!expanded && (
          <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
            Ver todos
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayEvents.map((event) => (
          <div 
            key={event.id}
            className="flex items-start justify-between p-4 rounded-xl border border-border hover:border-primary/30 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={typeColors[event.type]}>
                  {event.type}
                </Badge>
              </div>
              
              <h4 className="font-medium text-foreground mb-2">{event.title}</h4>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {event.date}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-primary">
              <Users className="h-4 w-4" />
              <span className="font-medium">{event.attendees.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}