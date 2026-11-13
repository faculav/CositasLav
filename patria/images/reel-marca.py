# Reel de marca TIRRA v2: mismo ritmo que la referencia (cortes que arrancan cada 2 cuadros
# y van frenando), logo fijo y centrado, contrastes claro/oscuro, sonido propio sincronizado.
import os, sys, subprocess, glob, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops, ImageOps

W, H, FPS = 1080, 1920, 30
IMG = "/home/user/CositasLav/patria/images/"
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = "/usr/share/fonts/opentype/inter/"
def font(n, s): return ImageFont.truetype(FONT + n, s)
TINTA = (24, 18, 14); CHOCO = (58, 38, 27); CARAMELO = (166, 98, 48); HUESO = (241, 236, 228); BLANCO = (250, 249, 247)

# ---------- ritmo: cortes medidos en la referencia (en cuadros a 30 fps) ----------
CORTES = [2] * 25 + [3] * 9 + [4] * 5 + [5, 5, 6, 6, 7, 7, 8, 9, 10, 12, 14, 17, 20]
FINAL = 36          # cierre con el logo
# ---------- logo: siempre mismo tamaño y mismo centro ----------
LW = 250
def _logo(f):
    im = Image.open(IMG + f).convert("RGBA"); im = im.crop(im.split()[3].getbbox())
    return im.resize((LW, round(im.height * LW / im.width)), Image.LANCZOS)
L_CLARO, L_OSC = _logo("logo-claro.png"), _logo("logo.png")
LX, LY = (W - LW) // 2, (H - L_CLARO.height) // 2
# centrado óptico: la "T" alta carga el dibujo a la izquierda y abajo; se compensa por su centro de masa
_a = np.asarray(L_CLARO.split()[3]).astype(float); _ys, _xs = np.mgrid[0:_a.shape[0], 0:_a.shape[1]]
LX += round((.5 - (_a * _xs).sum() / _a.sum() / _a.shape[1]) * LW); LY -= round(((_a * _ys).sum() / _a.sum() / _a.shape[0] - .5) * L_CLARO.height)
def logo_en(fr, claro=True, sombra=False):
    fr = fr.convert("RGBA"); l = L_CLARO if claro else L_OSC
    if sombra:
        s = Image.new("RGBA", fr.size, (0, 0, 0, 0)); sh = Image.new("RGBA", l.size, (0, 0, 0, 255)); sh.putalpha(l.split()[3].point(lambda v: v * .5))
        s.paste(sh, (LX, LY + 5), sh); fr = Image.alpha_composite(fr, s.filter(ImageFilter.GaussianBlur(12)))
    fr.alpha_composite(l, (LX, LY)); return fr.convert("RGB")
def mascara_logo(w=LW):
    m = Image.new("L", (W, H), 0); m.paste(L_CLARO.split()[3], (LX, LY)); return m

# ---------- utilidades de imagen ----------
def cubrir(im, cx=.5, cy=.5, z=1.0):
    im = im.convert("RGB"); r = max(W / im.width, H / im.height) * z
    nw, nh = round(im.width * r), round(im.height * r); im = im.resize((nw, nh), Image.LANCZOS)
    x = min(max(round(cx * nw - W / 2), 0), nw - W); y = min(max(round(cy * nh - H / 2), 0), nh - H)
    return im.crop((x, y, x + W, y + H))
def contraste(im, k=1.35, br=1.0):
    a = np.asarray(im).astype(float) / 255; a = np.clip((a - .5) * k + .5, 0, 1) * br
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype("uint8"))
def bn(im, k=1.5): return contraste(ImageOps.grayscale(im).convert("RGB"), k)
def negativo_silueta(im, umbral=110):
    """como la referencia: figura blanca sobre fondo gris claro."""
    g = np.asarray(ImageOps.grayscale(im).filter(ImageFilter.GaussianBlur(2))).astype(float)
    t = np.clip((umbral + 25 - g) / 50, 0, 1)
    fondo = np.linspace(205, 150, H)[:, None] * np.ones((1, W))
    out = fondo * (1 - t) + 252 * t
    return Image.fromarray(out.astype("uint8")).convert("RGB")
def estudio(col, luz=1.3, cy=.42):
    yy, xx = np.mgrid[0:H, 0:W]; d = np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H * cy) / H) ** 2)
    f = np.clip(luz - d * 1.15, .45, luz)[..., None]
    return Image.fromarray(np.clip(np.array(col)[None, None] * f, 0, 255).astype("uint8"))
def solido(col): return Image.new("RGB", (W, H), col)
def grabado(fr, k=1.0):
    fr = fr.convert("RGB"); m = mascara_logo()
    fr = Image.composite(Image.eval(fr, lambda v: int(v * .5)), fr, m.filter(ImageFilter.GaussianBlur(1)).point(lambda v: v * .9 * k))
    luz = ImageChops.subtract(ImageChops.offset(m, 0, -3), m).filter(ImageFilter.GaussianBlur(1.3))
    som = ImageChops.subtract(ImageChops.offset(m, 0, 3), m).filter(ImageFilter.GaussianBlur(1.3))
    fr = Image.composite(Image.eval(fr, lambda v: min(255, int(v * 1.7 + 30))), fr, luz.point(lambda v: v * .8 * k))
    return Image.composite(Image.eval(fr, lambda v: int(v * .25)), fr, som.point(lambda v: v * .85 * k))
def sombra_caja(fr, box, r, blur=26, alpha=150, dx=14, dy=26):
    s = Image.new("RGBA", fr.size, (0, 0, 0, 0)); x0, y0, x1, y1 = box
    ImageDraw.Draw(s).rounded_rectangle((x0 + dx, y0 + dy, x1 + dx, y1 + dy), r, fill=(0, 0, 0, alpha))
    return Image.alpha_composite(fr.convert("RGBA"), s.filter(ImageFilter.GaussianBlur(blur)))

def clip(prefix): return [Image.open(f).convert("RGB") for f in sorted(glob.glob(os.path.join(HERE, "clip", prefix + "*.jpg")))]
CA, CE, CC = clip("a"), clip("e"), clip("c")

# ---------- escenas (cada una: f(i, n) -> imagen; el logo va encima salvo que la escena lo traiga) ----------
def paleta(i, n):
    fr = solido(CHOCO); d = ImageDraw.Draw(fr); f1, f2 = font("Inter-Bold.otf", 30), font("Inter-Medium.otf", 22); top = int(H * .6)
    d.text((40, 40), "↓  PRIMARIO", font=f1, fill=HUESO); d.text((40, top - 100), "HEX  #3A261B\nRGB  58, 38, 27", font=f2, fill=HUESO, spacing=8)
    for k, (box, c, nm, hx, tc) in enumerate([((0, top, W // 2, top + 380), TINTA, "TINTA", "#18120E", HUESO), ((W // 2, top, W, top + 380), CARAMELO, "CARAMELO", "#A66230", HUESO),
                                             ((0, top + 380, W // 2, H), HUESO, "HUESO", "#F1ECE4", TINTA), ((W // 2, top + 380, W, H), BLANCO, "BLANCO", "#FAF9F7", TINTA)]):
        d.rectangle(box, fill=c); x0, y0, x1, y1 = box; d.text((x0 + 30, y0 + 28), "↓  " + nm, font=f1, fill=tc); d.text((x0 + 30, y1 - 70), "HEX  " + hx, font=f2, fill=tc)
    return logo_en(fr, True)   # el logo cae justo en el bloque chocolate
def fondo_logo(img, claro=True, sombra=False): return lambda i, n: logo_en(img, claro, sombra)
def zoom(base, claro=True, z0=1.0, z1=1.06, cx=.5, cy=.5, sombra=True):
    return lambda i, n: logo_en(cubrir(base, cx, cy, z0 + (z1 - z0) * i / max(1, n - 1)), claro, sombra)
def video(fs, claro=True, prep=lambda x: x, start=0):
    return lambda i, n: logo_en(prep(fs[min(start + i, len(fs) - 1)]), claro, True)

def etiqueta_img(fondo_col):
    fr = estudio(fondo_col, 1.3).convert("RGBA"); tw, th = 380, 660
    cx, cy = W // 2, LY + L_CLARO.height // 2; tx, ty = cx - tw // 2, cy - th // 2 - 40
    fr = sombra_caja(fr, (tx, ty, tx + tw, ty + th), 10, 30, 160)
    g = np.linspace(1.0, .9, th)[:, None, None] * np.ones((th, tw, 1))
    card = Image.fromarray(np.clip(np.array(BLANCO)[None, None] * g, 0, 255).astype("uint8")).convert("RGBA")
    m = Image.new("L", (tw, th), 0); md = ImageDraw.Draw(m); md.rounded_rectangle((0, 0, tw - 1, th - 1), 10, fill=255); md.ellipse((tw // 2 - 15, 50, tw // 2 + 15, 80), fill=0)
    card.putalpha(m); cd = ImageDraw.Draw(card); cd.ellipse((tw // 2 - 21, 44, tw // 2 + 21, 86), outline=(200, 190, 175), width=3)
    for k, t in enumerate(["CUERO VACUNO", "Hecho a mano", "Uruguay"]):
        cd.text((tw // 2, th - 130 + k * 30), t, font=font("Inter-Bold.otf" if k == 0 else "Inter-Medium.otf", 19), fill=TINTA if k == 0 else (110, 98, 88), anchor="mm")
    fr.alpha_composite(card, (tx, ty)); ImageDraw.Draw(fr).line((W // 2, 0, W // 2, ty + 65), fill=(242, 236, 226), width=4)
    return logo_en(fr, False)
def bolsa_img():
    fr = estudio(BLANCO, 1.06, .35).convert("RGBA"); bw, bh = 620, 740
    cx, cy = W // 2, LY + L_CLARO.height // 2; bx, by = cx - bw // 2, cy - bh // 2
    s = Image.new("RGBA", fr.size, (0, 0, 0, 0)); ImageDraw.Draw(s).ellipse((bx - 20, by + bh - 40, bx + bw + 50, by + bh + 50), fill=(50, 34, 22, 140))
    fr = Image.alpha_composite(fr, s.filter(ImageFilter.GaussianBlur(28)))
    rng = np.random.default_rng(3); tex = np.asarray(Image.fromarray(rng.integers(0, 255, (bh, bw), dtype=np.uint8)).filter(ImageFilter.GaussianBlur(.8))).astype(float) / 255 - .5
    g = np.linspace(1.06, .86, bw)[None, :, None]
    b = Image.fromarray(np.clip(np.array([176, 130, 88.])[None, None] * g + tex[..., None] * 16, 0, 255).astype("uint8")).convert("RGBA"); bd = ImageDraw.Draw(b)
    bd.line((0, 64, bw, 64), fill=(148, 106, 70), width=2)
    for hx in (bw // 2 - 105, bw // 2 + 105): bd.ellipse((hx - 9, 28, hx + 9, 46), fill=(70, 48, 30))
    fr.alpha_composite(b, (bx, by)); d = ImageDraw.Draw(fr)
    d.arc((bx + bw // 2 - 105, by - 190, bx + bw // 2 + 105, by + 70), 180, 360, fill=TINTA, width=10)
    for hx in (bw // 2 - 105, bw // 2 + 105): d.line((bx + hx, by - 60, bx + hx, by + 37), fill=TINTA, width=10)
    return logo_en(fr, False)
def parche_img():
    fr = contraste(cubrir(Image.open(IMG + "piel-gamuza.jpg"), .5, .5, 1.4), 1.2, .8).convert("RGBA")
    pw, ph = 520, 400; cx, cy = W // 2, LY + L_CLARO.height // 2; px, py = cx - pw // 2, cy - ph // 2
    gr = np.asarray(Image.open(IMG + "piel-grano.jpg").convert("L").resize((pw, ph))).astype(float) / 255
    p = Image.fromarray(np.clip(np.array([176, 108, 56.])[None, None] * (.72 + .55 * gr[..., None]), 0, 255).astype("uint8")).convert("RGBA")
    m = Image.new("L", (pw, ph), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, pw - 1, ph - 1), 24, fill=255); p.putalpha(m)
    fr = sombra_caja(fr, (px, py, px + pw, py + ph), 24, 12, 180, 6, 14); fr.alpha_composite(p, (px, py)); d = ImageDraw.Draw(fr)
    for x in range(px + 30, px + pw - 30, 26): d.line((x, py + 28, x + 14, py + 28), fill=(235, 222, 196), width=4); d.line((x, py + ph - 28, x + 14, py + ph - 28), fill=(235, 222, 196), width=4)
    for y in range(py + 30, py + ph - 30, 26): d.line((px + 28, y, px + 28, y + 14), fill=(235, 222, 196), width=4); d.line((px + pw - 28, y, px + pw - 28, y + 14), fill=(235, 222, 196), width=4)
    return grabado(fr.convert("RGB"), 1.1)
def chaleco_img():
    """espalda del Chaleco Latte con el logo grabado, sobre blanco."""
    v = Image.open(IMG + "perch-cha-latte-b.webp").convert("RGBA"); k = .92 * H / v.height; v = v.resize((round(v.width * k), round(v.height * k)), Image.LANCZOS)
    fr = estudio(BLANCO, 1.05, .4).convert("RGBA"); cy = LY + L_CLARO.height // 2
    fr.alpha_composite(v, ((W - v.width) // 2, int(cy - v.height * .55)))
    return logo_en(fr, True)
def marca_caballo(i, n):
    z = 2.0 + .25 * i / max(1, n - 1)
    return contraste(cubrir(Image.open(IMG + "caballo-tirra.jpg"), .49, .445, z), 1.25)

# piezas preparadas una vez
P = {}
def prep():
    P["croco"] = contraste(cubrir(Image.open(IMG + "piel-croco.jpg"), .5, .5, 1.2), 1.5)
    P["cebra"] = contraste(cubrir(Image.open(IMG + "piel-cebra.jpg"), .5, .5, 1.15), 1.3, .8)
    P["gamuza"] = contraste(cubrir(Image.open(IMG + "piel-gamuza.jpg"), .5, .5, 1.3), 1.4)
    P["manada"] = bn(cubrir(Image.open(IMG + "v2-look-2.jpg"), .55, .55), 1.6)
    P["manada_neg"] = negativo_silueta(cubrir(Image.open(IMG + "v2-look-2.jpg"), .62, .6, 1.25), 95)
    P["dorado"] = contraste(cubrir(Image.open(IMG + "v2-look-1.jpg"), .5, .45), 1.35)
    P["manos"] = bn(cubrir(Image.open(IMG + "taller-manos.jpg")), 1.6)
    P["ojo_neg"] = negativo_silueta(CE[10], 70)
    P["pechera"] = contraste(cubrir(Image.open(IMG + "cat-chalecos.jpg"), .62, .5, 1.05), 1.3)
    P["etiq_c"] = etiqueta_img(CARAMELO); P["etiq_o"] = etiqueta_img(CHOCO)
    P["bolsa"] = bolsa_img(); P["parche"] = parche_img(); P["chaleco"] = chaleco_img()
    P["cuello"] = contraste(cubrir(Image.open(IMG + "cuello-greda.jpg"), .5, .2, 1.0), 1.3)

def secuencia():
    s = []
    # tramo rapidísimo (2 cuadros): golpes alternando oscuro / claro / color
    rap = [paleta, fondo_logo(solido(TINTA)), fondo_logo(solido(BLANCO), False), fondo_logo(P["croco"], True, True),
           fondo_logo(solido(CARAMELO)), fondo_logo(P["manada_neg"], False), video(CA), fondo_logo(solido(HUESO), False),
           fondo_logo(P["cebra"], True, True), fondo_logo(estudio(CHOCO)), fondo_logo(P["ojo_neg"], False), fondo_logo(P["manos"], True, True),
           fondo_logo(solido(BLANCO), False), fondo_logo(P["gamuza"], True, True), fondo_logo(solido(TINTA)), fondo_logo(P["dorado"], True, True),
           fondo_logo(solido(CARAMELO)), lambda i, n: P["parche"], fondo_logo(P["manada"], True, True), fondo_logo(solido(HUESO), False),
           video(CE, start=5), fondo_logo(P["manada_neg"], False), fondo_logo(P["croco"], True, True), fondo_logo(solido(BLANCO), False), paleta]
    medio = [fondo_logo(P["gamuza"], True, True), lambda i, n: P["etiq_c"], video(CA, start=10), fondo_logo(P["ojo_neg"], False), lambda i, n: P["bolsa"], fondo_logo(P["cebra"], True, True),
             fondo_logo(estudio(CHOCO)), lambda i, n: P["chaleco"], video(CC), fondo_logo(solido(CARAMELO))]
    lento = [fondo_logo(solido(BLANCO), False), lambda i, n: P["parche"], fondo_logo(P["manada_neg"], False), zoom(P["croco"], True, 1.0, 1.05), lambda i, n: P["bolsa"],
             video(CE, start=2), lambda i, n: P["etiq_o"], fondo_logo(P["manos"], True, True), lambda i, n: P["chaleco"],
             zoom(P["dorado"], True, 1.0, 1.04), fondo_logo(P["cuello"], True, True), marca_caballo, zoom(P["manada"], True, 1.0, 1.05),
             lambda i, n: P["etiq_c"], video(CC, start=8), fondo_logo(P["ojo_neg"], False), zoom(P["pechera"], True, 1.0, 1.05)]
    escenas = rap + medio + lento
    assert len(escenas) == len(CORTES), (len(escenas), len(CORTES))
    s = list(zip(CORTES, escenas))
    def cierre(i, n):
        fr = logo_en(estudio(CHOCO, 1.15), True).convert("RGBA"); a = int(255 * min(1, max(0, (i - 4) / 10)))
        d = ImageDraw.Draw(fr); y = LY + L_CLARO.height + 70
        d.text((W // 2, y), "PIELES DE NUESTRA TIERRA", font=font("Inter-SemiBold.otf", 26), fill=HUESO + (a,), anchor="mm")
        d.text((W // 2, y + 44), "Hecho a mano en Uruguay", font=font("Inter-Regular.otf", 24), fill=(196, 182, 164, a), anchor="mm")
        return fr.convert("RGB")
    s.append((FINAL, cierre)); return s

# ---------- sonido: bajo grave continuo + golpe en cada corte (todo sintetizado, sin derechos de terceros) ----------
SR = 44100
def sonido(seq, ruta):
    tot = sum(n for n, _ in seq) / FPS; t = np.arange(int(SR * (tot + .2))) / SR
    fin = (tot - FINAL / FPS)
    env = np.clip(t / .15, 0, 1) * np.where(t < fin, 1.0, np.exp(-(t - fin) * 1.2))
    dron = (np.sin(2 * np.pi * 55 * t) + .45 * np.sin(2 * np.pi * 110 * t + .3) + .2 * np.sin(2 * np.pi * 165 * t)) * .32 * env
    dron *= 1 + .12 * np.sin(2 * np.pi * .5 * t)
    out = dron.copy(); rng = np.random.default_rng(7)
    pos = 0
    for k, (n, _) in enumerate(seq):
        t0 = pos / FPS; i0 = int(t0 * SR); pos += n
        L = int(.22 * SR); tt = np.arange(L) / SR
        fuerte = 1.0 if k < len(seq) - 1 else 2.2
        click = rng.normal(0, 1, L) * np.exp(-tt * 260) * .35
        click = np.diff(np.concatenate([[0], click]))  # más agudo
        f = 95 * np.exp(-tt * 18) + 42
        bombo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * (22 if k < len(seq) - 1 else 5)) * .55
        golpe = (click + bombo) * fuerte
        j = min(len(out), i0 + L); out[i0:j] += golpe[:j - i0]
    out = np.tanh(out * 1.3) * .85
    est = np.stack([out, out], 1); pcm = (est * 32767).astype("<i2")
    w = wave.open(ruta, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()

if __name__ == "__main__":
    out = sys.argv[1]
    prep(); seq = secuencia(); tot = sum(n for n, _ in seq); print("cuadros", tot, "seg", tot / FPS, "escenas", len(seq))
    if "--hoja" in sys.argv:
        th = [f(n // 2, n).resize((135, 240)) for n, f in seq]; cols = 10
        hoja = Image.new("RGB", (135 * cols, 240 * ((len(th) + cols - 1) // cols)), (40, 40, 40))
        for k, im in enumerate(th): hoja.paste(im, ((k % cols) * 135, (k // cols) * 240))
        hoja.save(out); sys.exit()
    wav = os.path.join(HERE, "sonido.wav"); sonido(seq, wav)
    yy, xx = np.mgrid[0:H, 0:W]; VIN = np.clip(1 - .28 * (((xx - W / 2) / (W * .8)) ** 2 + ((yy - H / 2) / (H * .8)) ** 2), 0, 1)[..., None]
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", wav,
                           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    rng = np.random.default_rng(1)
    for n, f in seq:
        for i in range(n):
            a = np.asarray(f(i, n)).astype(float) * VIN + rng.integers(-3, 4, (H, W, 1))
            ff.stdin.write(np.clip(a, 0, 255).astype("uint8").tobytes())
    ff.stdin.close(); ff.wait(); print("ok", out)
