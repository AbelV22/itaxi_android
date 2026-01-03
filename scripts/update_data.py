import requests
import json
import os
from datetime import datetime

# CONFIGURACIÓN
# Leemos la clave desde los "Secretos" de GitHub (paso 3)
API_KEY = os.environ.get("API_KEY") 
BASE_URL = "http://api.aviationstack.com/v1/flights"

def obtener_datos():
    print("📡 Iniciando escaneo de radar...")
    
    # 1. Consultar API (Solo vuelos llegando a BCN)
    params = {
        'access_key': API_KEY,
        'arr_iata': 'BCN',
        # 'flight_status': 'active' # A veces falla en free tier, mejor quitamos filtros estrictos
    }
    
    try:
        response = requests.get(BASE_URL, params=params)
        data = response.json()
        
        t1_count = 0
        t2_count = 0
        
        # 2. Procesar datos
        if 'data' in data:
            for flight in data['data']:
                # Extraemos terminal y aerolínea
                arrival = flight.get('arrival', {})
                terminal = arrival.get('terminal')
                airline_data = flight.get('airline', {})
                airline = airline_data.get('name', 'Desconocida')
                
                # Lógica de "Rescate" (Si la API no dice la terminal, la adivinamos)
                if not terminal:
                    if airline in ["Vueling", "Iberia", "Lufthansa", "British Airways", "American Airlines"]: 
                        terminal = "1"
                    elif airline in ["Ryanair", "EasyJet", "Wizz Air"]: 
                        terminal = "2"
                
                # Contamos
                if str(terminal) == "1": t1_count += 1
                elif str(terminal) == "2": t2_count += 1
        
        # 3. Calcular Pax (Estimación Fermi: 160 pax media x 85% ocupación)
        pax_t1 = t1_count * 150
        pax_t2 = t2_count * 165 # Low cost suele ir más lleno
        
        # 4. Estado del Semáforo (Reglas de Negocio)
        status_t1 = "FUEGO 🔥" if pax_t1 > 1500 else ("Normal 🟢" if pax_t1 > 500 else "Calma 🧊")
        status_t2 = "FUEGO 🔥" if pax_t2 > 1000 else ("Normal 🟢" if pax_t2 > 400 else "Calma 🧊")

        # 5. Generar JSON final
        resultado = {
            "ultima_actualizacion": datetime.now().strftime("%H:%M %d/%m"),
            "resumen": {
                "total_vuelos": t1_count + t2_count,
                "total_pax": pax_t1 + pax_t2,
                "tendencia": "+12%" # Dato estático por ahora
            },
            "terminales": {
                "t1": {"vuelos": t1_count, "pax": pax_t1, "estado": status_t1},
                "t2": {"vuelos": t2_count, "pax": pax_t2, "estado": status_t2}
            },
            # Estos datos los dejamos fijos hasta la Fase 2
            "licencia": 152000, 
            "clima": {"estado": "Lluvia", "probabilidad": 75}
        }
        
        return resultado

    except Exception as e:
        print(f"❌ Error crítico: {e}")
        return None

if __name__ == "__main__":
    datos = obtener_datos()
    if datos:
        # GUARDAR EN LA CARPETA PUBLIC (IMPORTANTE)
        # GitHub Actions ejecuta desde la raíz, así que la ruta es public/data.json
        ruta_archivo = 'public/data.json'
        with open(ruta_archivo, 'w') as f:
            json.dump(datos, f)
        print(f"✅ ÉXITO: Datos guardados en {ruta_archivo}")
        print(json.dumps(datos, indent=2)) # Para ver en el log qué ha salido
    else:
        # Si falla, creamos un archivo de error para no romper la web
        print("⚠️ Generando datos de fallback por fallo de API")
