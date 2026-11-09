from PIL import Image, ImageFilter, ImageChops
import numpy as np, sys
S='/tmp/claude-0/-home-user-CositasLav/a0c7a990-b18e-5cae-9d74-25293d1b0935/'
h=Image.open(S+'images/15.png').convert('RGB'); a=np.asarray(h).astype(float)
d=255-a.min(axis=2); al=np.clip((d-10)/30,0,1)*255
H=h.copy(); H.putalpha(Image.fromarray(al.astype('uint8')).filter(ImageFilter.GaussianBlur(.7)))
bb=H.getchannel('A').point(lambda v:255 if v>40 else 0).getbbox(); H=H.crop(bb)
print('hanger bbox',bb,H.size)
H.save(S+'scratchpad/perch/hanger.png')
# params: ancho percha (fracción del ancho del chaleco), y del tope de la madera (px chaleco), dx
P={'pec-cria':(0.80,30,0),'pec-cria-b':(0.80,30,0),'cha-cruz':(0.80,40,0),'cha-cruz-b':(0.80,40,0)}
if len(sys.argv)>1: exec(sys.argv[1])
# en la percha recortada: tope de la madera y centro
wood_top=360-bb[1]; cx=765-bb[0]
out={}
for k,(fw,top,dx) in P.items():
    v=Image.open('perch-%s.webp'%k).convert('RGBA')
    # quitar halo claro del borde
    A=v.getchannel('A').filter(ImageFilter.MinFilter(3)); v.putalpha(A)
    s=fw*v.width/ (1490-40)
    hs=H.resize((round(H.width*s),round(H.height*s)),Image.LANCZOS)
    hy=top-round(wood_top*s)          # y de la percha (negativa: el gancho sobresale)
    hx=round(v.width/2+dx-cx*s)
    off=max(0,-hy)
    W=max(v.width,hx+hs.width)-min(0,hx); 
    c=Image.new('RGBA',(v.width,v.height+off),(0,0,0,0))
    sh=Image.new('RGBA',c.size,(0,0,0,0))
    c.alpha_composite(hs,(hx,hy+off))
    c.alpha_composite(v,(0,off))
    out[k]=(c,off)
    c.save('perch-%s.webp'%k.replace('-','~'),quality=88,method=6) if False else None
    c.save(S+'scratchpad/perch/new-%s.png'%k)
    print(k,c.size,'hook-top-offset',off,'scale',round(s,3))
