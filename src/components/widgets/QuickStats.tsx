import { Plane, Calendar, TrendingUp, CloudRain } from "lucide-react";

interface QuickStatsProps {
  totalVuelos?: number;
  licencia?: number;
  onViewAllFlights?: () => void;
  onViewAllEvents?: () => void;
}

export function QuickStats({ totalVuelos = 0, licencia = 0, onViewAllFlights, onViewAllEvents }: QuickStatsProps) {
  const stats = [
    {
      id: "vuelos",
      label: "Vuelos Hoy",
      value: totalVuelos.toString(),
      subtext: "llegadas pendientes",
      icon: Plane,
      iconColor: "text-info",
      valueColor: "text-info",
    },
    {
      id: "eventos",
      label: "Eventos",
      value: "4",
      subtext: "esta semana",
      icon: Calendar,
      iconColor: "text-purple-400",
      valueColor: "text-purple-400",
    },
    {
      id: "licencias",
      label: "Licencia",
      value: `${(licencia / 1000).toFixed(0)}k€`,
      subtext: "mediana actual",
      icon: TrendingUp,
      iconColor: "text-primary",
      valueColor: "text-primary",
    },
    {
      id: "weather",
      label: "Lluvia",
      value: "75%",
      subtext: "probabilidad hoy",
      icon: CloudRain,
      iconColor: "text-cyan-400",
      valueColor: "text-cyan-400",
    },
  ];

  const handleClick = (statId: string) => {
    if (statId === "vuelos" && onViewAllFlights) {
      onViewAllFlights();
    } else if (statId === "eventos" && onViewAllEvents) {
      onViewAllEvents();
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          onClick={() => handleClick(stat.id)}
          className={`card-dashboard p-4 md:p-5 transition-all ${
            (stat.id === "vuelos" || stat.id === "eventos") 
              ? "cursor-pointer hover:border-primary/30 hover:bg-accent/20" 
              : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.iconColor}`} />
          </div>
          <p className={`text-2xl md:text-4xl font-display font-bold tracking-tight ${stat.valueColor || 'text-foreground'}`}>
            {stat.value}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}
