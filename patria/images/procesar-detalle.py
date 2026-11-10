# Foto de detalle: saca la pared, iguala luz/color al chaleco y la deja centrada
import sys, numpy as np, cv2
from PIL import Image
def procesar(src, ref, dst):
    rgb=np.asarray(Image.open(src).convert('RGB')); H,W=rgb.shape[:2]
    hsv=cv2.cvtColor(rgb,cv2.COLOR_RGB2HSV).astype(float)
    pared=((hsv[...,2]>98)&(hsv[...,1]<75)).astype(np.uint8)
    # pared = solo lo claro que toca el borde de la foto (la cebra queda adentro y no se borra)
    n,lab,st,_=cv2.connectedComponentsWithStats(pared,8); borde=np.zeros_like(pared)
    for k in range(1,n):
        x,y,w,h,ar=st[k]
        if x==0 or y==0 or x+w==W or y+h==H: borde[lab==k]=1
    pared=borde
    # grabcut a partir de esa estimación
    mask=np.where(pared>0,cv2.GC_PR_BGD,cv2.GC_PR_FGD).astype(np.uint8)
    mask[(hsv[...,2]>185)&(hsv[...,1]<45)&(pared>0)]=cv2.GC_BGD
    mask[(pared==0)&(hsv[...,2]>140)]=cv2.GC_FGD
    mask[(hsv[...,2]<110)|(hsv[...,1]>110)]=cv2.GC_FGD
    esc=0.4; sm=cv2.resize(rgb,None,fx=esc,fy=esc); mm=cv2.resize(mask,(sm.shape[1],sm.shape[0]),interpolation=cv2.INTER_NEAREST)
    bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
    cv2.grabCut(cv2.cvtColor(sm,cv2.COLOR_RGB2BGR),mm,None,bg,fg,4,cv2.GC_INIT_WITH_MASK)
    m=np.where((mm==cv2.GC_FGD)|(mm==cv2.GC_PR_FGD),255,0).astype(np.uint8)
    m=cv2.resize(m,(W,H),interpolation=cv2.INTER_LINEAR)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((7,7),np.uint8)); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats((m>127).astype(np.uint8),8)
    keep=np.zeros_like(m)
    for k in range(1,n):
        if st[k,cv2.CC_STAT_AREA]>H*W*0.002: keep[lab==k]=255
    inv=(keep==0).astype(np.uint8); n,lab,st,_=cv2.connectedComponentsWithStats(inv,4)
    for k in range(1,n):
        x,y,w,h,ar=st[k]
        if ar<H*W*0.01 and x>0 and y>0 and x+w<W and y+h<H: keep[lab==k]=255
    # manchas sueltas de sombra: componentes chicos lejos de la prenda principal
    n,lab,st,_=cv2.connectedComponentsWithStats((keep>127).astype(np.uint8),8)
    if n>2:
        grande=1+int(np.argmax(st[1:,cv2.CC_STAT_AREA]))
        cerca=cv2.dilate((lab==grande).astype(np.uint8),np.ones((25,25),np.uint8))
        for k in range(1,n):
            if k!=grande and not (cerca[lab==k]>0).any(): keep[lab==k]=0
    a=cv2.GaussianBlur(keep,(5,5),0)
    # luz y color: llevar el cuero del detalle al del chaleco (media y desvío en Lab)
    R=np.asarray(Image.open(ref).convert('RGBA')); ra=R[...,3]>200
    Rl=cv2.cvtColor(R[...,:3],cv2.COLOR_RGB2LAB).astype(float)[ra]
    D=cv2.cvtColor(rgb,cv2.COLOR_RGB2LAB).astype(float); da=a>200
    # tomar solo el cuero dominante (sin tachas/estampa): percentiles 10-80 de luminancia
    def cuero(L): 
        lo,hi=np.percentile(L[:,0],[10,70]); return L[(L[:,0]>=lo)&(L[:,0]<=hi)]
    rc=cuero(Rl); dc=cuero(D[da])
    out=D.copy()
    # solo el cuero de fondo se lleva al tono del chaleco; cebra, tachas y cordones casi no se tocan
    media=dc.mean(axis=0); dist=np.sqrt(((D-media)**2).sum(axis=2))
    peso=np.exp(-(dist**2)/(2*22.0**2))[...,None]
    # el resto (cebra, cordones) recibe solo la luz general, no el cambio de color
    luz=np.zeros_like(D); luz[...,0]=(rc[:,0].mean()-dc[:,0].mean())*0.55
    corr=np.zeros_like(D)
    for c in range(3):
        s=1.0
        if c==0: s=float(np.clip((rc[:,0].std()+1e-3)/(dc[:,0].std()+1e-3),0.9,1.1))
        corr[...,c]=(D[...,c]-dc[:,c].mean())*s+rc[:,c].mean()
    out=(D+luz)*(1-peso)+corr*peso
    out=np.clip(out,0,255).astype(np.uint8); out=cv2.cvtColor(out,cv2.COLOR_LAB2RGB)
    im=Image.fromarray(np.dstack([out,a]),'RGBA')
    bb=im.getchannel('A').point(lambda v:255 if v>60 else 0).getbbox(); im=im.crop(bb); im.thumbnail((1000,1300))
    im.save(dst,quality=88,method=6); print(dst,im.size)
I='/tmp/claude-0/-home-user-CositasLav/a0c7a990-b18e-5cae-9d74-25293d1b0935/images/'; P='/home/user/CositasLav/patria/images/'
for s,r,d in [('26','perch-pec-cria','det-pec-cria'),('27','perch-cha-cruz','det-cha-cruz'),('28','perch-cha-latte','det-cha-latte')]:
    procesar(I+s+'.webp',P+r+'.webp',P+d+'.webp')
