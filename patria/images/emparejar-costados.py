# Empareja los costados (de la sisa al ruedo) con una línea suave
import sys, numpy as np, cv2
from PIL import Image
def emparejar(path):
    im=np.asarray(Image.open(path).convert('RGBA')).copy(); H,W=im.shape[:2]
    a=im[...,3]; m=a>128
    cuenta=m.sum(axis=1); mx=cuenta.max()
    filas=np.arange(H)
    y0=int(np.argmax((filas>H*0.3)&(cuenta>0.88*mx)))+2               # debajo de la sisa
    cand=np.nonzero(cuenta>0.62*mx)[0]; y1=int(cand[-1])-2             # antes del ruedo (sin cordones)
    ys=np.arange(y0,y1); L=[];R=[]
    for y in ys:
        xs=np.nonzero(m[y])[0]; L.append(xs[0]); R.append(xs[-1])
    L=np.array(L,float); R=np.array(R,float)
    # ajuste robusto: mediana móvil + polinomio de grado 2
    def suave(v):
        med=np.array([np.median(v[max(0,i-25):i+25]) for i in range(len(v))])
        p=np.polyfit(ys,med,2); return np.polyval(p,ys)
    Ls=suave(L)+2; Rs=suave(R)-2
    # en las puntas, pasar de a poco del borde original al borde parejo
    T=min(40,len(ys)//4); t=np.ones(len(ys))
    t[:T]=np.linspace(0,1,T); t[-T:]=np.minimum(t[-T:],np.linspace(1,0,T))
    Ls=L*(1-t)+Ls*t; Rs=R*(1-t)+Rs*t
    nuevo=a.copy()
    rellenar=np.zeros((H,W),np.uint8)
    for k,y in enumerate(ys):
        l=int(round(Ls[k])); r=int(round(Rs[k]))
        nuevo[y,:max(l,0)]=0; nuevo[y,r+1:]=0
        for x0,x1 in ((l,l+30),(r-30,r+1)):                              # solo una franja junto al borde
            seg=a[y,x0:x1]<200; rellenar[y,x0:x1][seg]=1; nuevo[y,x0:x1]=255
    # transición suave arriba/abajo de la zona
    rgb=cv2.cvtColor(im[...,:3],cv2.COLOR_RGB2BGR)
    rgb=cv2.inpaint(rgb,rellenar*255,4,cv2.INPAINT_TELEA); rgb=cv2.cvtColor(rgb,cv2.COLOR_BGR2RGB)
    zona=np.zeros((H,W),np.uint8); zona[y0:y1]=1
    bl=cv2.GaussianBlur(nuevo,(3,3),0); nuevo=np.where(zona>0,bl,a)
    Image.fromarray(np.dstack([rgb,nuevo]).astype(np.uint8),'RGBA').save(path,quality=90,method=6)
    print(path,'zona',y0,y1)
for p in sys.argv[1:]: emparejar(p)
