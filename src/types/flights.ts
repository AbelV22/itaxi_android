// Tipos compartidos para vuelos y datos del dashboard

export interface VueloRaw {
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

export interface Vuelo {
  id: string;
  aerolinea: string;
  origen: string;
  hora: string;
  terminal: string;
  es_puente: boolean;
  es_t2c: boolean;
  avion: string;
  pax: number;
  estado: string;
  estado_color: string;
}

export interface DashboardData {
  meta: { update_time: string; total_vuelos: number };
  resumen_cards: {
    t1: { vuelos: number; pax: number };
    t2: { vuelos: number; pax: number };
    puente: { vuelos: number; pax: number };
    t2c: { vuelos: number; pax: number };
  };
  grafica: { name: string; pax: number }[];
  vuelos: Vuelo[];
  extras: {
    licencia: number;
    licencia_tendencia: string;
    clima_prob: number;
    clima_estado: string;
  };
}

export interface ExtrasData {
  licencia: number;
  licencia_tendencia: string;
  clima_prob: number;
  clima_estado: string;
}
