import requests
import json
import os
import sys
from datetime import datetime

# CONFIGURACIÓN
API_KEY = os.environ.get("API_KEY") 
BASE_URL = "http://api.aviationstack.com/v1/flights"

def obtener_datos():
    print("📡 Escaneando radar iTaxiBcn (Lógica Estricta)...")
    
    if not API_KEY:
        print("❌ ERROR: No hay API_KEY configurada.")
        sys.exit(1)

    params = {
        'access_key': API_KEY,
        'arr_iata': 'BCN',
        'limit': 100 
    }
    
    try:
        response = requests.get(BASE_URL, params=params)
        try:
            data = response.json()
        except:
            print(f"❌ Error JSON. Status: {response.status_code}")
            sys.exit(1)
            
        if 'error' in data:
            print(f"❌ API Error: {data['error']}")
            sys.exit(1)

        # --- ESTRUCTURAS ---
        kpis = {
            "t1": {"vuelos": 0, "pax": 0},
            "t2": {"vuelos": 0, "pax": 0},
            "puente": {"vuelos": 0, "pax": 0}, 
            "t2c": {"vuelos": 0, "pax": 0}
        }
        evolucion_por_hora = {str(h).zfill(2): 0 for h in range(24)}
        lista_vuelos = []

        if 'data' in data:
            for flight in data['data']:
                try:
                    # --- FILTRO 1: ESTADO DEL VUELO ---
                    status_raw = flight.get('flight_status', 'scheduled')
                    # Si el vuelo está cancelado o desviado, NO NOS INTERESA.
                    if status_raw in ['cancelled', 'diverted']:
                        continue

                    # --- EXTRACCIÓN ---
                    arrival = flight.get('arrival') or {}
                    departure = flight.get('departure') or {}
                    airline_obj = flight.get('airline') or {}
                    flight_obj = flight.get('flight') or {}
                    aircraft_obj = flight.get('aircraft') or {}

                    # --- LÓGICA DE TIEMPO (CORREGIDA) ---
                    # 1. Intentamos coger la estimada (Radar)
                    hora_str = arrival.get('estimated')
                    
                    # 2. Si es null, cogemos la programada (Billete)
                    if not hora_str:
                        hora_str = arrival.get('scheduled')
                    
                    # 3. Si las dos son null, DESCARTAMOS el vuelo (No inventamos datos)
                    if not hora_str:
                        print(f"⚠️ Saltando vuelo {flight_obj.get('iata')} sin horario.")
                        continue

                    # Procesamos la hora (quitamos la Z de UTC si existe)
                    dt_llegada = datetime.fromisoformat(hora_str.replace("Z", "+00:00"))
                    hora_corta = dt_llegada.strftime("%H:%M")
                    hora_bloque = dt_llegada.strftime("%H")

                    # --- RESTO DE LÓGICA (Igual que antes) ---
                    airline = airline_obj.get('name', 'Desconocida')
                    flight_iata = flight_obj.get('iata', 'UNK')
                    modelo_avion = aircraft_obj.get('iata', 'Jet')
                    
                    terminal = arrival.get('terminal')
                    if not terminal:
                        if airline in ["Vueling", "Iberia", "Lufthansa", "British Airways", "Qatar Airways"]: terminal = "1"
                        elif airline in ["Ryanair", "EasyJet", "Wizz Air", "Transavia"]: terminal = "2"
                        else: terminal = "1"

                    origen_iata = departure.get('iata', 'UNK')
                    es_puente = (origen_iata == "MAD" and airline in ["Iberia", "Vueling", "Air Nostrum"])
                    es_easyjet = ("easyJet" in airline)

                    pax = 160
                    if es_puente: pax = 180
                    elif es_easyjet: pax = 170
                    elif modelo_avion in ["380", "747", "777", "350"]: pax = 300 
                    
                    # KPIs
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

                    if hora_bloque in evolucion_por_hora:
                        evolucion_por_hora[hora_bloque] += pax

                    estado_ui = "En hora"
                    estilo_estado = "secondary"
                    if status_raw in ["active", "landed"]:
                        estado_ui = "Aterrizando"
                        estilo_estado = "warning"
                    
                    lista_vuelos.append({
                        "id": flight_iata,
                        "aerolinea": airline,
                        "origen": departure.get('airport', origen_iata),
                        "hora": hora_corta,
                        "terminal": f"T{terminal}",
                        "es_puente": es_puente,
                        "es_t2c": es_easyjet,
                        "avion": f"{modelo_avion}",
                        "pax": pax,
                        "estado": estado_ui,
                        "estado_color": estilo_estado
                    })
                
                except Exception as e_inner:
                    continue

        lista_vuelos.sort(key=lambda x: x['hora'])

        resultado = {
            "meta": {
                "update_time": datetime.now().strftime("%H:%M"),
                "total_vuelos": len(lista_vuelos)
            },
            "resumen_cards": kpis,
            "grafica": [{"name": h, "pax": p} for h, p in evolucion_por_hora.items()],
            "vuelos": lista_vuelos,
            "extras": {
                "licencia": 152000,
                "licencia_tendencia": "+1.2%",
                "clima_prob": 75,
                "clima_estado": "Lluvia"
            }
        }
        return resultado

    except Exception as e:
        print(f"❌ Error Crítico: {e}")
        sys.exit(1)

if __name__ == "__main__":
    datos = obtener_datos()
    if datos:
        os.makedirs('public', exist_ok=True)
        with open('public/data.json', 'w') as f:
            json.dump(datos, f)
        print("✅ Datos iTaxiBcn generados correctamente")
    else:
        sys.exit(1)
