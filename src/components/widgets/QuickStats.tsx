import { Car, Plane, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCard {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
}

const stats: StatCard[] = [
  {
    label: "Taxistas activos",
    value: "2,847",
    subtext: "en la plataforma",
    icon: Car,
  },
  {
    label: "Precio actual",
    value: "€182K",
    subtext: "mediana licencia",
    icon: TrendingUp,
  },
  {
    label: "Grupos de compra",
    value: "24",
    subtext: "disponibles",
    icon: Users,
  },
  {
    label: "Ahorro medio",
    value: "32%",
    subtext: "en compras grupales",
    icon: Car,
  },
];

export function QuickStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className="card-dashboard-hover p-5 text-center"
        >
          <div className="flex items-center justify-center mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className="stat-value mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.subtext}</p>
        </div>
      ))}
    </div>
  );
}