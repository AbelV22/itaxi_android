import sys
import os
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

# --- CONFIGURACIÓN ---
URL_ADIF = "https://www.adif.es/w/71801-barcelona-sants?pageFromPlid=335"
# Guardamos en 'public' para que sea accesible desde tu web
OUTPUT_FILE = os.path.join(os.getcwd(), "public", "trenes_sants.json")

def click_js(driver, elemento):
    driver.execute_script("arguments[0].click();", elemento)

def limpiar_nombre_tren(texto_sucio):
    # Convierte "RF - AVE 03662" en "AVE 03662"
    limpio = re.sub(r'^(RF|RI|MD|R\d+)\s*-\s*', '', texto_sucio)
    return limpio.strip()

def obtener_trenes():
    print("🚀 Iniciando Scraper de Trenes Sants (Larga Distancia)...")
    
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--window-size=1920,1080')
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # En GitHub Actions, Chrome ya suele estar instalado, webdriver_manager lo localiza
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    datos = []

    try:
        driver.get(URL_ADIF)
        wait = WebDriverWait(driver, 15)
        
        # 1. MATAR COOKIES
        try: driver.execute_script("var b=document.querySelector('#onetrust-banner-sdk'); if(b) b.remove();")
        except: pass

        # 2. NAVEGACIÓN (Llegadas -> Filtro -> Consultar)
        print("👆 Configurando filtros...")
        click_js(driver, wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "a[href='#tab-llegadas']"))))
        time.sleep(1)

        radios = driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
        if len(radios) > 1: click_js(driver, radios[1]) # Selecciona AV/Larga Distancia
        
        btn_consultar = driver.find_element(By.CSS_SELECTOR, "input[value='Consultar']")
        click_js(driver, btn_consultar)
        print("⏳ Esperando datos iniciales...")
        time.sleep(5)

        # 3. BUCLE "PAC-MAN" (Cargar más resultados)
        while True:
            try:
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
                # Buscamos el input específico de cargar más
                boton_carga = driver.find_elements(By.CSS_SELECTOR, "#tabla-horas-trenes-llegadas-load-more input")
                
                if boton_carga and boton_carga[0].is_displayed():
                    print("⬇️ Botón 'Cargar más' detectado. Pulsando...")
                    click_js(driver, boton_carga[0])
                    time.sleep(4)
                else:
                    print("✅ Fin de la lista (no hay más botones).")
                    break
            except Exception as e:
                break

        # 4. EXTRACCIÓN
        print("👀 Procesando tabla...")
        filas = driver.find_elements(By.CSS_SELECTOR, "#horas-trenes-estacion-llegadas tbody tr")
        
        whitelist = ["AVE", "AVLO", "OUIGO", "IRYO", "ALVIA", "EUROMED", "INTERCITY", "TGV", "LD"]

        for fila in filas:
            try:
                celdas = fila.find_elements(By.TAG_NAME, "td")
                if len(celdas) < 3: continue

                hora = celdas[0].text.strip()
                origen = celdas[1].text.strip()
                tipo_sucio = celdas[2].text.strip().upper()
                via = celdas[3].text.strip() if len(celdas) > 3 else "-"
                
                if not re.match(r"\d{2}:\d{2}", hora): continue

                tipo_limpio = limpiar_nombre_tren(tipo_sucio)

                # FILTRO DE SEGURIDAD (Solo Larga Distancia)
                es_valido = any(marca in tipo_limpio for marca in whitelist)
                if "RODALIES" in tipo_sucio or "CERCANIAS" in tipo_sucio: es_valido = False

                if es_valido:
                    datos.append({
                        "hora": hora,
                        "origen": origen,
                        "tren": tipo_limpio,
                        "via": via
                    })
            except: continue

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        driver.quit()

    # 5. GUARDADO
    datos.sort(key=lambda x: x['hora'])
    
    # Aseguramos que existe la carpeta public
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=4)
    
    print(f"💾 ¡ÉXITO! {len(datos)} trenes guardados en: {OUTPUT_FILE}")

if __name__ == "__main__":
    obtener_trenes()
