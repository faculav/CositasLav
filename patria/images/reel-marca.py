# Reel de marca TIRRA: logo fijo al centro, fondos que cambian al ritmo.
import os, sys, subprocess, glob, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageChops

W, H, FPS = 1080, 1920, 30
IMG = "/home/user/CositasLav/patria/images/"
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = "/usr/share/fonts/opentype/inter/"
def font(n, s): return ImageFont.truetype(FONT + n, s)

# paleta de la marca
TINTA = (31, 24, 19); CHOCO = (58, 38, 27); CARAMELO = (150, 92, 50); HUESO = (241, 236, 228); FONDO = (251, 250, 248)

LOGO_W = 300
logo_osc = Image.open(IMG + "logo.png").convert("RGBA")
logo_cla = Image.open(IMG + "logo-claro.png").convert("RGBA")
def logo(claro=True, w=LOGO_W):
    l = logo_cla if claro else logo_osc
    return l.resize((w, round(l.height * w / l.width)), Image.LANCZOS)

def cubrir(im, cx=0.5, cy=0.5, zoom=1.0):
    """recorta la imagen para llenar 1080x1920 centrada en (cx,cy)."""
    im = im.convert("RGB"); r = max(W / im.width, H / im.height) * zoom
    nw, nh = round(im.width * r), round(im.height * r)
    im = im.resize((nw, nh), Image.LANCZOS)
    x = min(max(round(cx * nw - W / 2), 0), nw - W); y = min(max(round(cy * nh - H / 2), 0), nh - H)
    return im.crop((x, y, x + W, y + H))

def pegar_logo(fr, claro=True, sombra=True, w=LOGO_W, dy=0):
    fr = fr.convert("RGBA"); l = logo(claro, w)
    x, y = (W - l.width) // 2, (H - l.height) // 2 + dy
    if sombra:
        s = Image.new("RGBA", fr.size, (0, 0, 0, 0)); a = l.split()[3].point(lambda v: v * 0.45)
        sh = Image.new("RGBA", l.size, (0, 0, 0, 255)); sh.putalpha(a); s.paste(sh, (x, y + 6), sh)
        fr = Image.alpha_composite(fr, s.filter(ImageFilter.GaussianBlur(14)))
    fr.alpha_composite(l, (x, y)); return fr.convert("RGB")

def grabar(fr, w=LOGO_W, fuerza=1.0, dy=0):
    """logo grabado (bajo relieve) en el cuero: más oscuro adentro, luz en el borde de abajo."""
    fr = fr.convert("RGB"); l = logo(True, w); a = l.split()[3]
    m = Image.new("L", fr.size, 0); x, y = (W - l.width) // 2, (H - l.height) // 2 + dy; m.paste(a, (x, y))
    mb = m.filter(ImageFilter.GaussianBlur(1.2))
    osc = Image.eval(fr, lambda v: int(v * 0.55))
    fr = Image.composite(osc, fr, mb.point(lambda v: v * 0.85 * fuerza))
    # sombra interna arriba y brillo abajo
    luz = ImageChops.subtract(ImageChops.offset(m, 0, -3), m).filter(ImageFilter.GaussianBlur(1.5))
    som = ImageChops.subtract(ImageChops.offset(m, 0, 3), m).filter(ImageFilter.GaussianBlur(1.5))
    fr = Image.composite(Image.eval(fr, lambda v: min(255, int(v * 1.6 + 25))), fr, luz.point(lambda v: v * 0.7 * fuerza))
    fr = Image.composite(Image.eval(fr, lambda v: int(v * 0.3)), fr, som.point(lambda v: v * 0.8 * fuerza))
    return fr

def vineta(fr, k=0.45):
    yy, xx = np.mgrid[0:H, 0:W]; d = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H / 2) / (H * 0.75)) ** 2)
    v = np.clip(1 - k * d ** 2, 0, 1)[..., None]
    return Image.fromarray((np.asarray(fr).astype(float) * v).astype("uint8"))
VIN = None

def grano(fr, amt=6):
    a = np.asarray(fr).astype(np.int16); n = np.random.randint(-amt, amt + 1, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype("uint8"))

# ---------------- mockups dibujados ----------------
def fondo_estudio(col, luz=1.25):
    """fondo liso con luz de estudio (más claro arriba al centro)."""
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * 0.35) / H) ** 2)
    f = np.clip(luz - d * 1.1, 0.55, luz)[..., None]
    return Image.fromarray(np.clip(np.array(col)[None, None] * f, 0, 255).astype("uint8"))

def paleta():
    fr = Image.new("RGB", (W, H), CHOCO); d = ImageDraw.Draw(fr)
    f1, f2 = font("Inter-Bold.otf", 30), font("Inter-Medium.otf", 22)
    top = int(H * 0.6)
    bloques = [((0, top, W // 2, top + 380), TINTA, "TINTA", "#1F1813", HUESO),
               ((W // 2, top, W, top + 380), CARAMELO, "CARAMELO", "#965C32", HUESO),
               ((0, top + 380, W // 2, H), HUESO, "HUESO", "#F1ECE4", TINTA),
               ((W // 2, top + 380, W, H), FONDO, "BLANCO", "#FBFAF8", TINTA)]
    d.text((40, 40), "↓  PRIMARIO", font=f1, fill=HUESO); d.text((40, top - 110), "HEX  #3A261B\nRGB  58, 38, 27", font=f2, fill=HUESO, spacing=8)
    d.ellipse((W - 84, 36, W - 44, 76), outline=HUESO, width=2); d.text((W - 64, 56), "1", font=f2, fill=HUESO, anchor="mm")
    for i, (box, c, n, hx, tc) in enumerate(bloques):
        d.rectangle(box, fill=c); x0, y0, x1, y1 = box
        d.text((x0 + 30, y0 + 28), "↓  " + n, font=f1, fill=tc)
        d.ellipse((x1 - 74, y0 + 24, x1 - 34, y0 + 64), outline=tc, width=2); d.text((x1 - 54, y0 + 44), str(i + 2), font=f2, fill=tc, anchor="mm")
        d.text((x0 + 30, y1 - 70), "HEX  " + hx, font=f2, fill=tc)
    return pegar_logo(fr, True, False, dy=-int(H * 0.12))

def etiqueta():
    fr = fondo_estudio(CHOCO, 1.35).convert("RGBA")
    tw, th = 400, 700; tx, ty = (W - tw) // 2, (H - th) // 2 + 40
    # hilo
    d = ImageDraw.Draw(fr)
    d.line((W // 2 - 4, 0, W // 2 - 3, ty + 70), fill=(236, 230, 220), width=5); d.line((W // 2 + 4, 0, W // 2 + 3, ty + 70), fill=(220, 212, 200), width=5)
    # sombra de la etiqueta
    s = Image.new("RGBA", fr.size, (0, 0, 0, 0)); ImageDraw.Draw(s).rounded_rectangle((tx + 18, ty + 30, tx + tw + 18, ty + th + 30), 10, fill=(0, 0, 0, 150))
    fr = Image.alpha_composite(fr, s.filter(ImageFilter.GaussianBlur(28)))
    # cartón con leve degradé
    card = Image.new("RGBA", (tw, th)); g = np.linspace(1.0, 0.9, th)[:, None, None]
    card = Image.fromarray(np.dstack([np.clip(np.array(HUESO)[None, None] * g * np.ones((th, tw, 1)), 0, 255).astype("uint8"), np.full((th, tw), 255, "uint8")]), "RGBA")
    m = Image.new("L", (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 10, fill=255); md.ellipse((tw // 2 - 16, 54, tw // 2 + 16, 86), fill=0)
    card.putalpha(m); cd = ImageDraw.Draw(card)
    cd.ellipse((tw // 2 - 22, 48, tw // 2 + 22, 92), outline=(200, 190, 175), width=3)
    f = font("Inter-Medium.otf", 19); fb = font("Inter-Bold.otf", 19)
    for i, (t, ff) in enumerate([("CUERO VACUNO", fb), ("Hecho a mano", f), ("Uruguay", f)]):
        cd.text((tw // 2, th - 150 + i * 30), t, font=ff, fill=TINTA if i == 0 else (110, 98, 88), anchor="mm")
    fr.alpha_composite(card, (tx, ty))
    d = ImageDraw.Draw(fr); d.line((W // 2, 0, W // 2, ty + 70), fill=(240, 234, 224), width=4)
    fr = fr.convert("RGB")
    l = logo(False, 230); fr2 = fr.convert("RGBA"); fr2.alpha_composite(l, ((W - l.width) // 2, (H - l.height) // 2)); return fr2.convert("RGB")

def bolsa():
    fr = fondo_estudio(HUESO, 1.08).convert("RGBA")
    bw, bh = 640, 760; bx, by = (W - bw) // 2, (H - bh) // 2 + 110
    s = Image.new("RGBA", fr.size, (0, 0, 0, 0)); sd = ImageDraw.Draw(s)
    sd.ellipse((bx - 30, by + bh - 40, bx + bw + 60, by + bh + 50), fill=(60, 40, 25, 120))
    fr = Image.alpha_composite(fr, s.filter(ImageFilter.GaussianBlur(30)))
    # papel kraft con textura
    rng = np.random.default_rng(3); base = np.array([176, 132, 92], float)
    tex = rng.normal(0, 6, (bh, bw))
    tex = np.asarray(Image.fromarray(((tex - tex.min()) / (np.ptp(tex)) * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))).astype(float) / 255 - 0.5
    g = np.linspace(1.06, 0.88, bw)[None, :]
    papel = np.clip(base[None, None] * (g[..., None]) + tex[..., None] * 18, 0, 255).astype("uint8")
    b = Image.fromarray(papel).convert("RGBA"); bd = ImageDraw.Draw(b)
    bd.line((0, 70, bw, 70), fill=(150, 108, 72), width=2)  # doblez de arriba
    bd.polygon([(bw - 10, 70), (bw, 70), (bw, bh), (bw - 10, bh)], fill=(140, 100, 66))
    # agujeros y manijas de cuerda
    for hx in (bw // 2 - 110, bw // 2 + 110): bd.ellipse((hx - 9, 30, hx + 9, 48), fill=(70, 48, 30))
    fr.alpha_composite(b, (bx, by)); d = ImageDraw.Draw(fr)
    for hx in (bw // 2 - 110, bw // 2 + 110): pass
    d.arc((bx + bw // 2 - 110, by - 200, bx + bw // 2 + 110, by + 80), 180, 360, fill=CHOCO, width=10)
    d.line((bx + bw // 2 - 110, by - 60, bx + bw // 2 - 110, by + 39), fill=CHOCO, width=10)
    d.line((bx + bw // 2 + 110, by - 60, bx + bw // 2 + 110, by + 39), fill=CHOCO, width=10)
    l = logo(False, 250); y = by + (bh - l.height) // 2 + 10
    fr.alpha_composite(l, ((W - l.width) // 2, y))
    return fr.convert("RGB")

def parche():
    """parche de cuero caramelo cosido sobre gamuza chocolate, logo grabado."""
    fondo = cubrir(Image.open(IMG + "piel-gamuza.jpg"), 0.5, 0.5, 1.4)
    fondo = Image.eval(fondo, lambda v: int(v * 0.85))
    pw, ph = 560, 420; px, py = (W - pw) // 2, (H - ph) // 2
    cuero = cubrir(Image.open(IMG + "piel-pelo.jpg"), 0.3, 0.6, 1.0).crop((0, 0, pw, ph))
    gr = np.asarray(Image.open(IMG + "piel-grano.jpg").convert("L").resize((pw, ph))).astype(float) / 255
    col = np.array([168, 104, 56], float)
    arr = np.clip(col[None, None] * (0.75 + 0.5 * gr[..., None]), 0, 255).astype("uint8")
    p = Image.fromarray(arr).filter(ImageFilter.GaussianBlur(0.6))
    m = Image.new("L", (pw, ph), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, pw - 1, ph - 1), 26, fill=255)
    fr = fondo.convert("RGBA")
    s = Image.new("RGBA", fr.size, (0, 0, 0, 0)); ImageDraw.Draw(s).rounded_rectangle((px + 6, py + 14, px + pw + 6, py + ph + 14), 26, fill=(0, 0, 0, 170))
    fr = Image.alpha_composite(fr, s.filter(ImageFilter.GaussianBlur(12)))
    pr = p.convert("RGBA"); pr.putalpha(m); fr.alpha_composite(pr, (px, py))
    d = ImageDraw.Draw(fr)
    # costura
    for i in range(0, 2 * (pw + ph) - 120, 26):
        def punto(t):
            a, b2 = pw - 60, ph - 60
            if t < a: return px + 30 + t, py + 30, 1
            t -= a
            if t < b2: return px + pw - 30, py + 30 + t, 0
            t -= b2
            if t < a: return px + pw - 30 - t, py + ph - 30, 1
            t -= a; return px + 30, py + ph - 30 - t, 0
        x, y, hor = punto(i)
        if hor: d.line((x, y, x + 14, y), fill=(232, 220, 196), width=4)
        else: d.line((x, y, x, y + 14), fill=(232, 220, 196), width=4)
    fr = fr.convert("RGB")
    return grabar(fr, 240, 1.0)

# ---------------- escenas ----------------
def foto(nombre, cx=0.5, cy=0.5, z=1.0): return Image.open(IMG + nombre)
def clip(prefix):
    return [Image.open(f).convert("RGB") for f in sorted(glob.glob(os.path.join(HERE, "clip", prefix + "*.jpg")))]

np.random.seed(1)
ESC = []  # (frames, funcion(i, n) -> imagen)
def estatica(img_fn, n, zoom=(1.0, 1.05), logo_fn=None, cx=0.5, cy=0.5):
    base = img_fn()
    def f(i):
        z = zoom[0] + (zoom[1] - zoom[0]) * i / max(1, n - 1)
        fr = cubrir(base, cx, cy, z) if base.size != (W, H) or z != 1.0 else base
        return logo_fn(fr) if logo_fn else fr
    ESC.append((n, f))
def video(prefix, n, logo_fn, start=0):
    fs = clip(prefix)
    ESC.append((n, lambda i: logo_fn(fs[min(start + i, len(fs) - 1)])))

claro = lambda fr: pegar_logo(fr, True)
oscuro = lambda fr: pegar_logo(fr, False, False)
B = 15  # medio pulso (0,5 s)

estatica(paleta, 2 * B, (1, 1))
video("a", B + 3, claro)
# logo + nombre
def nombre():
    def f(i):
        fr = Image.new("RGB", (W, H), CHOCO)
        t = min(1, i / 8); e = 1 - (1 - t) ** 3
        fr = fondo_estudio(CHOCO, 1.2)
        frr = fr.convert("RGBA"); l = logo(True, LOGO_W)
        x = (W - l.width) // 2 - int(200 * e); frr.alpha_composite(l, (x, (H - l.height) // 2))
        d = ImageDraw.Draw(frr); fnt = font("Inter-Bold.otf", 64)
        txt = Image.new("RGBA", (420, 200), (0, 0, 0, 0)); ImageDraw.Draw(txt).text((0, 30), "Cuero\nde Uruguay", font=fnt, fill=HUESO + (int(255 * e),), spacing=4)
        frr.alpha_composite(txt, (W // 2 - 10 + int(60 * (1 - e)), H // 2 - 100))
        return frr.convert("RGB")
    ESC.append((B + 6, f))
nombre()
estatica(lambda: Image.open(IMG + "piel-croco.jpg"), B, (1.15, 1.22), claro)
estatica(lambda: grabar(cubrir(Image.open(IMG + "piel-gamuza.jpg"), 0.5, 0.5, 1.3), LOGO_W, 1.0), B, (1, 1))
estatica(etiqueta, 2 * B, (1, 1.03))
video("e", B + 3, claro)
estatica(lambda: Image.open(IMG + "piel-cebra.jpg"), B, (1.1, 1.18), lambda fr: pegar_logo(Image.eval(fr, lambda v: int(v * 0.6)), True))
estatica(bolsa, 2 * B, (1, 1.03))
estatica(lambda: Image.open(IMG + "caballo-tirra.jpg"), 2 * B, (1.9, 2.15), None, 0.49, 0.44)
estatica(lambda: Image.open(IMG + "v2-look-2.jpg"), B, (1.0, 1.05), claro, 0.5, 0.55)
estatica(parche, 2 * B, (1, 1.04))
estatica(lambda: Image.open(IMG + "taller-manos.jpg"), B, (1.0, 1.05), claro)
video("c", B + 3, claro)
estatica(lambda: Image.open(IMG + "cat-chalecos.jpg"), B, (1.05, 1.1), claro, 0.62, 0.5)
# cierre
def cierre():
    base = fondo_estudio(CHOCO, 1.2)
    def f(i):
        fr = pegar_logo(base, True, True, 340, -60).convert("RGBA")
        t = min(1, max(0, (i - 6) / 12)); d = ImageDraw.Draw(fr)
        a = int(255 * t)
        d.text((W // 2, H // 2 + 240), "PIELES DE NUESTRA TIERRA", font=font("Inter-SemiBold.otf", 28), fill=HUESO + (a,), anchor="mm")
        d.text((W // 2, H // 2 + 290), "Hecho a mano en Uruguay", font=font("Inter-Regular.otf", 26), fill=(200, 186, 168, a), anchor="mm")
        return fr.convert("RGB")
    ESC.append((3 * B + 15, f))
cierre()

total = sum(n for n, _ in ESC); print("frames", total, "seg", total / FPS)
yy, xx = np.mgrid[0:H, 0:W]
VIN = np.clip(1 - 0.35 * (((xx - W / 2) / (W * 0.8)) ** 2 + ((yy - H / 2) / (H * 0.8)) ** 2), 0, 1)[..., None]

out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "tirra-reel.mp4")
prev = None
if "--hoja" in sys.argv:
    thumbs = [f(n // 2).resize((180, 320)) for n, f in ESC]
    hoja = Image.new("RGB", (180 * 8, 320 * ((len(thumbs) + 7) // 8)))
    for k, t in enumerate(thumbs): hoja.paste(t, ((k % 8) * 180, (k // 8) * 320))
    hoja.save(os.path.join(HERE, "hoja.jpg")); sys.exit()
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                       "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
for n, f in ESC:
    for i in range(n):
        fr = np.asarray(f(i)).astype(float) * VIN
        a = np.clip(fr + np.random.randint(-4, 5, (H, W, 1)), 0, 255).astype("uint8")
        ff.stdin.write(a.tobytes())
ff.stdin.close(); ff.wait(); print("ok", out)
