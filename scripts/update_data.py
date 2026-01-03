import requests
import json
import os
from datetime import datetime, timedelta

# CONFIGURACIÓN
API_KEY = os.environ.get("API_KEY") 
BASE_URL = "http://api.aviationstack.com/v1/flights"

def obtener_datos():
    print("📡 Escaneando radar avanzado para iTaxiBcn...")
    
    # Pedimos vuelos activos y programados para tener la previsión del día
    params = {
        'access_key': API_KEY,
        'arr_iata': 'BCN',
        # Limitamos a 100 para no saturar la respuesta en pruebas, 
        # en producción quitamos el limit o paginamos si pagamos
        'limit': 100 
    }
    
    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()
        
        # --- ESTRUCTURAS DE DATOS ---
        # 1. Los 4 Contadores (Top Cards)
        kpis = {
            "t1": {"vuelos": 0, "pax": 0},
            "t2": {"vuelos": 0, "pax": 0},
            "puente": {"vuelos": 0, "pax": 0}, # Subconjunto T1
            "t2c": {"vuelos": 0, "pax": 0}     # Subconjunto T2 (EasyJet)
        }
        
        # 2. La Gráfica (Evolución por Hora) - Inicializamos las 24h a 0
        evolucion_por_hora = {str(h).zfill(2): 0 for h in range(24)}
        
        # 3. La Lista Detallada (Tabla inferior)
        lista_vuelos = []

        if 'data' in data:
            for flight in data['data']:
                # --- EXTRACCIÓN ---
                arrival = flight.get('arrival', {})
                departure = flight.get('departure', {})
                airline = flight.get('airline', {}).get('name', 'Desconocida')
                flight_iata = flight.get('flight', {}).get('iata', 'UNK')
                modelo_avion = flight.get('aircraft', {}).get('iata', 'Jet') # Ej: 320
                status_raw = flight.get('flight_status', 'scheduled')
                
                # Hora estimada de llegada
                hora_str = arrival.get('estimated', datetime.now().isoformat())
                dt_llegada = datetime.fromisoformat(hora_str.replace("Z", "+00:00")) # Ajuste UTC básico
                hora_corta = dt_llegada.strftime("%H:%M")
                hora_bloque = dt_llegada.strftime("%H") # Para la gráfica (ej: "14")

                # Terminal (Lógica de Inferencia)
                terminal = arrival.get('terminal')
                if not terminal:
                    if airline in ["Vueling", "Iberia", "Lufthansa", "British Airways", "Qatar Airways"]: terminal = "1"
                    elif airline in ["Ryanair", "EasyJet", "Wizz Air", "Transavia"]: terminal = "2"
                    else: terminal = "1" # Ante la duda, T1

                # Clasificación Especial
                origen_iata = departure.get('iata', '')
                es_puente = (origen_iata == "MAD" and airline in ["Iberia", "Vueling", "Air Nostrum"])
                es_easyjet = ("easyJet" in airline)

                # Pasajeros (Estimación Física)
                pax = 160
                if es_puente: pax = 180
                elif es_easyjet: pax = 170
                elif modelo_avion in ["380", "747", "777", "350"]: pax = 300 # Aviones grandes
                
                # --- LLENADO DE DATOS ---
                
                # A. KPIs (Tarjetas)
                if str(terminal) == "1":
                    kpis["t1"]["vuelos"] += 1
                    kpis["t1"]["pax"] += pax
                    if es_puente:
                        kpis["puente"]["vuelos"] += 1
                        kpis["puente"]["pax"] += pax
                elif str(terminal) == "2":
                    kpis["t2"]["vuelos"] += 1
                    kpis["t2"]["pax"] += pax
                    if es_easyjet:
                        kpis["t2c"]["vuelos"] += 1
                        kpis["t2c"]["pax"] += pax

                # B. Gráfica (Solo sumamos si es del día de hoy)
                if hora_bloque in evolucion_por_hora:
                    evolucion_por_hora[hora_bloque] += pax

                # C. Lista Detallada (Formateo para UI)
                # Traducir estado para el "badge" amarillo/gris
                estado_ui = "En hora"
                estilo_estado = "secondary" # gris
                if status_raw == "active" or status_raw == "landed":
                    estado_ui = "Aterrizando"
                    estilo_estado = "warning" # amarillo/naranja
                
                lista_vuelos.append({
                    "id": flight_iata,
                    "aerolinea": airline,
                    "origen": departure.get('airport', origen_iata),
                    "hora": hora_corta,
                    "terminal": f"T{terminal}",
                    "es_puente": es_puente,
                    "es_t2c": es_easyjet,
                    "avion": f"Airbus/Boeing {modelo_avion}", # Simplificación visual
                    "pax": pax,
                    "estado": estado_ui,
                    "estado_color": estilo_estado
                })

        # Ordenar lista por hora
        lista_vuelos.sort(key=lambda x: x['hora'])

        # --- JSON FINAL ---
        resultado = {
            "meta": {
                "update_time": datetime.now().strftime("%H:%M"),
                "total_vuelos": len(lista_vuelos)
            },
            "resumen_cards": kpis,      # Para las 4 tarjetas de arriba
            "grafica": [                # Para la curva naranja
                {"name": h, "pax": p} for h, p in evolucion_por_hora.items()
            ],
            "vuelos": lista_vuelos,      # Para la lista detallada de abajo
            
            # Datos fijos Fase 1 (Licencia/Clima)
            "extras": {
                "licencia": 152000,
                "licencia_tendencia": "+1.2%",
                "clima_prob": 75,
                "clima_estado": "Lluvia"
            }
        }
        
        return resultado

    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    datos = obtener_datos()
    if datos:
        with open('public/data.json', 'w') as f:
            json.dump(datos, f)
        print("✅ Datos iTaxiBcn generados correctamente")
