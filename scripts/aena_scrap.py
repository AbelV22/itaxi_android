# =============================================================================
# 1. INSTALACIÓN
# =============================================================================
print("🛠️ Preparando herramientas...")
!apt-get remove chromium-chromedriver chromium-browser -q -y > /dev/null 2>&1
!wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
!apt-get install -y ./google-chrome-stable_current_amd64.deb > /dev/null 2>&1
!pip install selenium webdriver-manager -q

import time
import json
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# =============================================================================
# 2. CONFIGURACIÓN
# =============================================================================
def iniciar_navegador():
    options = Options()
    options.add_argument('--headless') 
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    return driver

# =============================================================================
# 3. SCRAPER DEFINITIVO (CON SCROLL INFINITO)
# =============================================================================
def obtener_todos_los_vuelos_reales():
    driver = iniciar_navegador()
    url = "https://www.aena.es/es/infovuelos.html"
    
    print(f"✈️ Entrando en {url}...")
    datos_finales = []
    
    try:
        driver.get(url)
        time.sleep(4)

        # 1. ELIMINAR COOKIES (Vital para poder hacer clicks)
        driver.execute_script("var b=document.querySelectorAll('.onetrust-pc-dark-filter, #onetrust-consent-sdk');b.forEach(e=>e.remove());")

        # 2. BUSCAR BARCELONA
        texto_busqueda = "JOSEP TARRADELLAS BARCELONA-EL PRAT"
        print(f"✍️ Buscando: '{texto_busqueda}'...")

        try:
            inp = driver.find_element(By.XPATH, "//input[contains(@placeholder, 'llegada')]")
        except:
            inp = driver.find_element(By.ID, "comboLlegada")
            
        inp.send_keys(texto_busqueda)
        time.sleep(1)

        print("🚀 Pulsando BUSCAR...")
        try:
            btn = driver.find_element(By.ID, "btnBuscadorVuelos")
            driver.execute_script("arguments[0].removeAttribute('disabled'); arguments[0].click();", btn)
        except:
            driver.find_element(By.XPATH, "//button[contains(., 'Buscar')]").click()

        print("⏳ Esperando carga inicial (8s)...")
        time.sleep(8)

        # 3. BUCLE DE CARGA INFINITA (VER MÁS)
        print("\n🔄 --- INICIANDO CARGA COMPLETA (Paginación) ---")
        clicks = 0
        
        while True:
            try:
                # Buscamos el botón por su CLASE exacta (gracias a tu diagnóstico)
                # Buscamos elementos que tengan la clase 'btn-see-more'
                btn_ver_mas = WebDriverWait(driver, 5).until(
                    EC.visibility_of_element_located((By.CLASS_NAME, "btn-see-more"))
                )
                
                # SCROLL INTELIGENTE: Lo ponemos en el centro de la pantalla
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn_ver_mas)
                time.sleep(1) # Esperar a que el scroll termine
                
                # CLIC
                driver.execute_script("arguments[0].click();", btn_ver_mas)
                clicks += 1
                
                # Imprimimos progreso cada 3 clicks para no ensuciar
                print(f"   ➕ Clic {clicks}: Cargando más vuelos... (Espera breve)")
                
                # Esperamos a que carguen los nuevos datos
                time.sleep(3) 
                
            except Exception as e:
                # Si salta error es porque el botón YA NO EXISTE (hemos llegado al final)
                print("   ✅ Fin de la carga: El botón 'Ver más' ha desaparecido.")
                break
        
        # 4. EXTRACCIÓN MASIVA DE DATOS
        print(f"\n🔍 --- LEYENDO TODOS LOS VUELOS ---")
        
        # Usamos la técnica de buscar por horas (que sabemos que funciona)
        elementos_con_hora = driver.find_elements(By.XPATH, "//*[contains(text(), ':') and string-length(text()) < 6]")
        filas_procesadas = set()

        print(f"   📊 Elementos de hora detectados: {len(elementos_con_hora)}")

        for el in elementos_con_hora:
            try:
                texto = el.text
                if re.match(r"\d{2}:\d{2}", texto): # Validar formato HH:MM
                    
                    # Subir al contenedor padre (la fila completa)
                    fila_padre = el.find_element(By.XPATH, "./../..")
                    texto_fila = fila_padre.text.replace("\n", " | ")
                    
                    if texto_fila not in filas_procesadas and len(texto_fila) > 15:
                        
                        # Parseo básico para el JSON
                        partes = texto_fila.split(" | ")
                        
                        # Intentamos extraer datos con seguridad (evitando errores de índice)
                        vuelo_obj = {
                            "hora": partes[0],
                            "vuelo": partes[3] if len(partes) > 3 else "N/A",
                            "aerolinea": partes[4] if len(partes) > 4 else "N/A",
                            "origen": partes[5] if len(partes) > 5 else "N/A",
                            "terminal": "T1" if "T1" in texto_fila else ("T2" if "T2" in texto_fila else "N/A"),
                            "estado": partes[-1],
                            "raw": texto_fila
                        }
                        
                        datos_finales.append(vuelo_obj)
                        filas_procesadas.add(texto_fila)
            except:
                continue

        print(f"\n✅ ¡ÉXITO! Se han extraído {len(datos_finales)} vuelos.")

    except Exception as e:
        print(f"❌ Error: {e}")
        driver.save_screenshot("error_final.png")
    finally:
        driver.quit()
    
    return datos_finales

# Ejecutar
lista = obtener_todos_los_vuelos_reales()

if lista:
    # Guardamos el JSON definitivo
    with open('vuelos_bcn_full.json', 'w', encoding='utf-8') as f:
        json.dump(lista, f, indent=4, ensure_ascii=False)
    print("\n📁 Archivo 'vuelos_bcn_full.json' listo para descargar.")
