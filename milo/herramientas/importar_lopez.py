#!/usr/bin/env python3
"""
Importa los alimentos (perros y gatos) de distribuidoralopez.com.uy
a milo/alimentos.js y descarga las fotos a milo/images/alimentos/.

Uso (desde la carpeta milo/):
    python3 herramientas/importar_lopez.py           (solo baja fotos nuevas)
    python3 herramientas/importar_lopez.py --fotos   (vuelve a bajar todas las fotos)

Se puede volver a correr cuando cambien los precios: regenera
alimentos.js completo. Los precios son los publicados por la
distribuidora; si querés aplicar un margen, cambiá MARGEN.
"""
import html
import io
import json
import os
import re
import sys
import unicodedata
import urllib.request

BASE = "https://distribuidoralopez.com.uy/wp-json/wc/store/v1/products"
CATEGORIAS_ALIMENTO = {214, 105, 102, 593}   # Alimentos, Perros, Gatos, Suplementos
CAT_GATOS = 102
MARGEN = 1.0          # 1.0 = mismo precio; 1.10 = +10 %
REDONDEO = 10         # redondear precios a múltiplos de 10

AQUI = os.path.dirname(os.path.abspath(__file__))
MILO = os.path.dirname(AQUI)
DIR_FOTOS = os.path.join(MILO, "images", "alimentos")
SALIDA = os.path.join(MILO, "alimentos.js")

UA = {"User-Agent": "Mozilla/5.0 (MiloRaciones importador)"}


def bajar(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def traer_productos():
    todos, pagina = {}, 1
    while True:
        datos = json.loads(bajar(f"{BASE}?per_page=100&page={pagina}"))
        if not datos:
            break
        for p in datos:
            todos[p["id"]] = p
        pagina += 1
    return list(todos.values())


# ── limpieza de nombres ────────────────────────────────────────────
def sin_tildes(t):
    return "".join(c for c in unicodedata.normalize("NFD", t) if unicodedata.category(c) != "Mn")


MARCAS_CONOCIDAS = [
    "Pro Plan", "Proplan", "Purina Pro Plan", "Dog Chow", "Cat Chow", "Equilibrio", "Equilíbrio", "Frost",
    "Biofresh", "Hills", "Hill's", "Hill’s", "Brit", "Farmina N&D", "N&D", "Lager", "Primocao", "Primocão",
    "Primoção", "Primogato", "Nero", "Maxine", "Max", "Pedigree", "Whiskas", "Excellent", "Eukanuba",
    "Virbac", "Rosco", "Vittamax", "VittaMax", "Three Cats", "Three Dogs", "Matisse", "Connie", "Canfeed",
    "Can feed", "Special Dog", "Special Cat", "Wits", "Dogui", "Prot 21", "Prot21", "Ecopet", "Keller",
    "Old Prince", "Vitalflex", "Sabrositos", "Natural Dog", "Tiernitos", "Rex", "Vitalcan", "Dog Selection",
    "Rusty", "The Golden Choice", "Astro", "Nhock", "Royal Canin", "Agility", "Nutrique", "Jazz",
    "Toky", "Big Boss", "Mon Ami", "Optimum", "Threedog",
]

NORMALIZAR_MARCA = {
    "equilíbrio": "Equilibrio", "equilibrio": "Equilibrio",
    "primoção": "Primocão", "primocão": "Primocão", "primocao": "Primocão",
    "natural & delicious": "Farmina N&D", "n&d": "Farmina N&D", "nyd": "Farmina N&D", "farmina n&d": "Farmina N&D",
    "hill's": "Hill's", "hill’s": "Hill's", "hills": "Hill's",
    "purina pro plan": "Pro Plan", "proplan": "Pro Plan", "pro plan": "Pro Plan",
    "vittamax": "VittaMax", "can feed": "Canfeed", "prot 21": "Prot21", "ecopet natural": "Ecopet",
    "threedog": "Three Dogs",
}

RE_PESO = re.compile(
    r"(\d+(?:[.,]\d+)?)\s*(?:\+\s*(\d+(?:[.,]\d+)?))?\s*(kg|kgs|kilos?|grs?|g|lbs?)\b\.?", re.I)

PALABRAS_CHICAS = {"de", "y", "en", "para", "con", "a", "el", "la", "del", "x", "e"}
SIGLAS = {"sb", "lb", "mb", "smb", "rp", "rm", "rg", "hpm", "n&d", "s", "m", "l", "xl", "ii"}


def a_num(t):
    return float(t.replace(",", "."))


def fmt_num(n):
    return (f"{n:.2f}".rstrip("0").rstrip(".")).replace(".", ",")


def pre(n):
    n = html.unescape(n).replace("’", "'")
    n = re.sub(r"(\d)\s*kg\s*\+\s*(\d+(?:[.,]\d+)?\s*kg)", r"\1+\2", n, flags=re.I)

    def edad(m):
        a, b = a_num(m.group(1)), a_num(m.group(4))
        es_edad = b > a or (m.group(2) == "" and m.group(3) != "")
        return f"+{m.group(1)} {m.group(4)}" if es_edad else m.group(0)
    n = re.sub(r"\b1\+\s*", "", n)
    n = re.sub(r"\b(\d+(?:[.,]\d+)?)(\s*)\+(\s*)(\d+(?:[.,]\d+)?)(?=\s*(?:kg|lb))", edad, n, flags=re.I)
    n = re.sub(r"\b(\d{1,2})\+(?=\s|$)", r"+\1", n)   # "Adulto 7+ Mature" -> "Adulto +7 Mature"
    return n


def extraer_peso(nombre):
    """Devuelve (kg_total, etiqueta) usando el último peso del nombre."""
    nombre = pre(nombre)
    if re.search(r"\bx\s*\d+\s*unidades\b", nombre, re.I):
        m = re.search(r"\bx\s*(\d+)\s*unidades\b", nombre, re.I)
        return None, f"x{m.group(1)} unidades"
    ms = list(RE_PESO.finditer(nombre))
    if not ms:
        return None, None
    m = ms[-1]
    a = a_num(m.group(1))
    b = a_num(m.group(2)) if m.group(2) else 0
    unidad = m.group(3).lower()
    if unidad.startswith("lb"):
        kg = round((a + b) * 0.4536, 1)
        etiqueta = f"{fmt_num(kg)} kg"
    elif unidad.startswith("g"):
        kg = (a + b) / 1000
        etiqueta = f"{fmt_num(a + b)} g"
    else:
        kg = a + b
        etiqueta = f"{fmt_num(a)}+{fmt_num(b)} kg" if b else f"{fmt_num(a)} kg"
    return kg, etiqueta


def capitalizar(t):
    out = []
    for i, w in enumerate(t.split()):
        lw = w.lower()
        if lw in SIGLAS and len(lw) <= 4 and i > 0:
            out.append(w.upper())
        elif lw in PALABRAS_CHICAS and i > 0:
            out.append(lw)
        elif w.isupper() and len(w) > 4:
            out.append(w.capitalize())
        elif w[:1].islower():
            out.append(w[:1].upper() + w[1:])
        else:
            out.append(w)
    return " ".join(out)


def limpiar_nombre(nombre):
    n = pre(nombre)
    n = re.sub(r"\bCan\s+feed\b|\bCaed\b", "Canfeed", n, flags=re.I)
    n = re.sub(r"\s*\+\s+\d+\s*(?!(?:kg|kgs|kilos?|g|grs?|lbs?)\b)[A-Za-zÀ-ÿ].*$", "", n, flags=re.I)
    n = re.sub(r"\s*x?\s*\d*\s*(kg)?\s*envio\.t\.pais.*$", "", n, flags=re.I)
    n = re.sub(r"\bx\s*\d+\s*unidades\b", "", n, flags=re.I)
    n = re.sub(r"\s*[–-]\s*Ver Variante.*$", "", n, flags=re.I)
    # regalos / promos de la distribuidora: todo lo que viene tras " + texto"
    n = re.sub(r"\s*\+\s*(?=[^\d\s])(?!\d).*$", "", n)
    n = re.sub(r"\s*\+\s*\d+\s*(pate|pagos|sachet|pouch)s?\b.*$", "", n, flags=re.I)
    n = re.sub(r"\b\d+\s*pagos\b", "", n, flags=re.I)
    n = re.sub(r"\s*/\s*super premium", " Super Premium", n, flags=re.I)
    # estilo MercadoLibre: "Alimento X Para Perro Adulto ... En Bolsa De 15kg"
    n = re.sub(r"^\s*alimentos?\s+(para\s+(perros?|gatos?|mascotas)\s+)?", "", n, flags=re.I)
    n = re.sub(r"\ben bolsa de\b", "", n, flags=re.I)
    n = re.sub(r"\benvase de\b[^A-Za-z]*(kg|g)?", "", n, flags=re.I)
    n = re.sub(r"\bsabor mix\b", "", n, flags=re.I)
    n = re.sub(r"\bpara (perro|gato)\b", r"\1", n, flags=re.I)
    n = re.sub(r"\bde raza\b", "", n, flags=re.I)
    n = re.sub(r"\bcomida\b|\bcroquetas caninas\b|\balimento\b", "", n, flags=re.I)
    n = re.sub(r"^\s*((de|perro|gato)\s+)+", "", n, flags=re.I)
    # sacar pesos y restos tipo "20+10 (30kg)"
    n = RE_PESO.sub("", n)
    n = re.sub(r"\(\s*\)", "", n)
    n = re.sub(r"\b\d+\s*\+\s*\d+\b", "", n)
    # palabras repetidas consecutivas y frases repetidas (Hill's Science Diet ... Hill's Science Diet)
    palabras = n.split()
    vistas, limpias = set(), []
    for w in palabras:
        clave = sin_tildes(w.lower())
        if clave in vistas and len(clave) > 3 and clave not in {"adulto", "gato", "perro", "raza"}:
            continue
        vistas.add(clave)
        limpias.append(w)
    n = " ".join(limpias)
    n = re.sub(r"\b(\w+)\s+\1\b", r"\1", n, flags=re.I)
    n = re.sub(r"\s+", " ", n).strip(" -–/,.")
    n = re.sub(r"\bProplan\b", "Pro Plan", n, flags=re.I)
    n = re.sub(r"\bSeletion\b", "Selection", n, flags=re.I)
    n = re.sub(r"\bGatoAdulto\b", "Gato Adulto", n)
    n = re.sub(r"\bCan feed\b", "Canfeed", n, flags=re.I)
    n = re.sub(r"\bN&d\b", "N&D", n)
    return capitalizar(n)


def marca_de(p, nombre):
    limpio = sin_tildes(limpiar_nombre(nombre).lower()).replace("’", "'")
    for m in sorted(MARCAS_CONOCIDAS, key=len, reverse=True):
        ml = sin_tildes(m.lower()).replace("’", "'")
        if limpio.startswith(ml + " ") or limpio == ml:
            return NORMALIZAR_MARCA.get(m.lower(), m)
    for a in p["attributes"]:
        if a["taxonomy"] == "pa_marca" and a["terms"]:
            m = html.unescape(a["terms"][0]["name"]).strip()
            return NORMALIZAR_MARCA.get(m.lower(), m)
    nl = sin_tildes(nombre.lower()).replace("’", "'")
    mejor = None
    for m in MARCAS_CONOCIDAS:
        ml = sin_tildes(m.lower()).replace("’", "'")
        idx = nl.find(ml)
        if idx >= 0 and (mejor is None or idx < mejor[0] or (idx == mejor[0] and len(ml) > len(mejor[1]))):
            mejor = (idx, m)
    if mejor:
        return NORMALIZAR_MARCA.get(mejor[1].lower(), mejor[1])
    return nombre.split()[0] if nombre else "Otra"


def atributo(p, tax):
    for a in p["attributes"]:
        if a["taxonomy"] == tax and a["terms"]:
            return html.unescape(a["terms"][0]["name"]).strip()
    return None


def es_gato(p, nombre):
    t = sin_tildes(nombre.lower())
    if re.search(r"\b(gato|gatos|gatito|cat|cats|kitten|felino)\b|primogato|whiskas|cat chow", t):
        return True
    if re.search(r"\b(perro|perros|dog|dogs|cachorro|puppy|canino)\b", t):
        return False
    return any(c["id"] == CAT_GATOS for c in p["categories"])


def precio_final(pesos):
    v = pesos * MARGEN
    return int(round(v / REDONDEO) * REDONDEO) if MARGEN != 1.0 else int(round(v))


def mejor_foto(img):
    """La versión más grande disponible hasta ~800 px (o la original)."""
    opciones = []
    for parte in (img.get("srcset") or "").split(","):
        trozos = parte.strip().split()
        if len(trozos) == 2 and trozos[1].endswith("w"):
            opciones.append((int(trozos[1][:-1]), trozos[0]))
    buenas = [o for o in opciones if o[0] <= 1024]
    if buenas:
        return max(buenas)[1]
    return img.get("src") or img.get("thumbnail")


FORZAR_FOTOS = "--fotos" in sys.argv


def bajar_foto(url, destino):
    from PIL import Image  # pillow
    try:
        im = Image.open(io.BytesIO(bajar(url)))
        im = im.convert("RGBA")
        fondo = Image.new("RGB", im.size, (255, 255, 255))
        fondo.paste(im, mask=im.split()[3])
        fondo.thumbnail((640, 640), Image.LANCZOS)
        fondo.save(destino, "JPEG", quality=84, optimize=True, progressive=True)
        return True
    except Exception as e:  # noqa: BLE001
        print("  sin foto:", url, e, file=sys.stderr)
        return False


def main():
    os.makedirs(DIR_FOTOS, exist_ok=True)
    productos = [p for p in traer_productos()
                 if any(c["id"] in CATEGORIAS_ALIMENTO for c in p["categories"]) and p.get("is_in_stock", True)]
    print(f"{len(productos)} alimentos en la distribuidora")

    grupos = {}
    for p in productos:
        bruto = html.unescape(p["name"])
        nombre = limpiar_nombre(bruto)
        if not nombre or re.search(r"para mascotas", nombre, re.I):
            continue  # publicaciones genéricas sin producto concreto
        kg, etiqueta = extraer_peso(bruto)
        precio = int(p["prices"]["price"] or 0)
        if precio <= 0:
            continue
        cat = "gatos" if es_gato(p, bruto) else "perros"
        marca = marca_de(p, bruto)
        if re.search(r"\borejas?\b", bruto, re.I):
            cat, marca = "snacks", "Natural"
        clave = (cat, sin_tildes(nombre.lower()))
        g = grupos.setdefault(clave, {
            "nombre": nombre, "marca": marca, "cat": cat, "opciones": {}, "oferta": False,
            "etapa": atributo(p, "pa_etapa-de-vida-de-la-mascota"),
            "raza": atributo(p, "pa_tamano-de-la-raza"),
            "sabor": atributo(p, "pa_sabor"),
            "fotos": [], "ids": [],
        })
        g["ids"].append(p["id"])
        if p.get("on_sale"):
            g["oferta"] = True
        if p["images"]:
            g["fotos"].append((p["id"], mejor_foto(p["images"][0])))
        etiqueta = etiqueta or atributo(p, "pa_peso-de-la-unidad") or "Unidad"
        previo = g["opciones"].get(etiqueta)
        if previo is None or precio < previo["precio"]:
            g["opciones"][etiqueta] = {"etiqueta": etiqueta, "kg": kg, "precio": precio_final(precio)}

    salida = []
    for (cat, _), g in sorted(grupos.items(), key=lambda x: (x[1]["marca"].lower(), x[1]["nombre"].lower())):
        pid = "al-" + str(min(g["ids"]))
        foto = None
        destino = os.path.join(DIR_FOTOS, pid + ".jpg")
        if os.path.exists(destino) and not FORZAR_FOTOS:
            foto = "images/alimentos/" + pid + ".jpg"
        else:
            for _, url in g["fotos"]:
                if bajar_foto(url, destino):
                    foto = "images/alimentos/" + pid + ".jpg"
                    break
        partes = [x for x in (g["etapa"], g["raza"] and ("Razas " + g["raza"].lower()), g["sabor"]) if x]
        opciones = sorted(g["opciones"].values(), key=lambda o: (o["kg"] is None, o["kg"] or 0, o["precio"]))
        for o in opciones:
            if o["kg"] is None:
                del o["kg"]
            else:
                o["kg"] = round(o["kg"], 3)
        salida.append({
            "id": pid,
            "nombre": g["nombre"],
            "marca": g["marca"],
            "cat": cat,
            "desc": " · ".join(partes),
            "opciones": opciones,
            "tag": "Oferta" if g["oferta"] else None,
            "img": foto,
        })

    with open(SALIDA, "w", encoding="utf-8") as f:
        f.write("/* =========================================================\n"
                "   MILO RACIONES — alimentos (generado automáticamente)\n"
                "   Fuente: distribuidoralopez.com.uy\n"
                "   NO editar a mano: correr herramientas/importar_lopez.py\n"
                "   ========================================================= */\n\n")
        f.write("const ALIMENTOS = ")
        f.write(json.dumps(salida, ensure_ascii=False, indent=1))
        f.write(";\n")
    print(f"{len(salida)} productos ({sum(len(x['opciones']) for x in salida)} presentaciones) -> {SALIDA}")


if __name__ == "__main__":
    main()
