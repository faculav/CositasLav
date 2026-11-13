from PIL import Image, ImageDraw, ImageFont
import numpy as np
F='/usr/share/fonts/opentype/inter/'
nom=ImageFont.truetype(F+'Inter-SemiBold.otf',56)
reg=ImageFont.truetype(F+'Inter-Regular.otf',27); neg=ImageFont.truetype(F+'Inter-Bold.otf',27)
logo=Image.open('logo-claro.png').convert('RGBA')
a=np.asarray(logo).copy(); a[...,:3]=255; logo=Image.fromarray(a)
def poner(src,dst,nombre,cy,xder,xizq=108,ylogo=808):
    im=Image.open(src).convert('RGB'); d=ImageDraw.Draw(im)
    # nombre en dos líneas, centrado en la altura de la piedra
    d.text((xizq,cy-62),'Collar',font=nom,fill='white'); d.text((xizq,cy+8),nombre,font=nom,fill='white')
    lineas=[[('Hecho',neg),(' a mano',reg)],[('con cuero',neg),(' vacuno',reg)],[('+ piedra',neg),(' natural.',reg)],[('Producto Uruguayo.',reg)]]
    y=cy-62
    for ln in lineas:
        x=xder
        for t,f in ln: d.text((x,y),t,font=f,fill='white'); x+=d.textlength(t,font=f)
        y+=34
    lg=logo.copy(); lg.thumbnail((56,68)); im.paste(lg,(450-lg.width//2,ylogo),lg)
    im.save(dst,quality=90); return im
if __name__=='__main__':
    poner('prod-col-tierra.jpg','cuello-tierra-texto.jpg','Tierra',cy=520,xder=495)
    poner('prod-col-ocre.jpg','cuello-ocre-texto.jpg','Ocre',cy=640,xder=540,ylogo=812)
    poner('prod-col-pampa.jpg','cuello-pampa-texto.jpg','Pampa',cy=520,xder=630)
