# Recorta el collar real (tira + argolla + piedra) de la foto y lo apoya en el busto
import numpy as np, cv2
from PIL import Image
P='/home/user/CositasLav/patria/images/'
# guías en coordenadas de la foto de 900x900: tira izquierda, tira derecha, argolla, piedra (cx,cy,rx,ry)
G={
 'tierra':dict(izq=[(90,0),(150,180),(345,375)], der=[(450,0),(458,180),(398,375)], arg=(372,402), piedra=(393,532,62,122), ancho=34),
 'ocre':  dict(izq=[(170,20),(240,280),(410,480)], der=[(860,20),(760,220),(600,400),(460,490)], arg=(430,500), piedra=(420,660,82,160), ancho=40),
 'pampa': dict(izq=[(210,120),(300,260),(450,370)], der=[(700,40),(660,200),(510,370)], arg=(480,380), piedra=(480,524,122,122), ancho=36),
 'greda': dict(izq=[(170,20),(240,240),(410,410)], der=[(660,20),(600,220),(450,410)], arg=(430,430), piedra=(440,600,92,152), ancho=34),
}
def recortar(f):
    g=G[f]; im=np.asarray(Image.open(P+'prod-col-%s.jpg'%f).convert('RGB')); H,W=im.shape[:2]
    mask=np.full((H,W),cv2.GC_BGD,np.uint8)
    banda=np.zeros((H,W),np.uint8); centro=np.zeros((H,W),np.uint8)
    for lado in ('izq','der'):
        pts=np.array(g[lado]+[g['arg']],np.int32)
        cv2.polylines(banda,[pts],False,1,g['ancho']*3); cv2.polylines(centro,[pts],False,1,max(4,g['ancho']//4))
    cx,cy,rx,ry=g['piedra']
    cv2.ellipse(banda,(cx,cy),(int(rx*1.15),int(ry*1.12)),0,0,360,1,-1)
    cv2.ellipse(centro,(cx,cy),(int(rx*0.7),int(ry*0.75)),0,0,360,1,-1)
    cv2.circle(banda,g['arg'],22,1,-1)
    mask[banda>0]=cv2.GC_PR_BGD
    # dentro de la banda: lo oscuro/saturado distinto de la piel es probable cuero
    hsv=cv2.cvtColor(im,cv2.COLOR_RGB2HSV)
    mask[(banda>0)&(hsv[...,2]<90)]=cv2.GC_PR_FGD
    mask[centro>0]=cv2.GC_FGD
    bg=np.zeros((1,65)); fg=np.zeros((1,65))
    cv2.grabCut(cv2.cvtColor(im,cv2.COLOR_RGB2BGR),mask,None,bg,fg,6,cv2.GC_INIT_WITH_MASK)
    m=np.where((mask==1)|(mask==3),255,0).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((3,3),np.uint8)); m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats((m>0).astype(np.uint8))
    keep=np.zeros_like(m)
    for k in range(1,n):
        if st[k,4]>800: keep[lab==k]=255
    # quedarse cerca del recorrido de la tira o dentro de la piedra
    cerca=np.zeros((H,W),np.uint8)
    for lado in ('izq','der'):
        pts=np.array(g[lado]+[g['arg']],np.int32); cv2.polylines(cerca,[pts],False,1,int(g['ancho']*1.9))
    zona_piedra=np.zeros((H,W),np.uint8); cv2.ellipse(zona_piedra,(cx,cy),(int(rx*1.12),int(ry*1.1)),0,0,360,1,-1)
    cv2.circle(zona_piedra,g['arg'],20,1,-1)
    keep[(cerca==0)&(zona_piedra==0)]=0
    V=hsv[...,2]; Sat=hsv[...,1]; tira=(zona_piedra==0)
    if f in ('pampa','greda'): keep[tira&(V>105)]=0                       # tira negra: fuera lo claro (piel, letras)
    if f=='tierra': keep[tira&(V>135)]=0
    if f=='ocre': keep[tira&(V<72)]=0                                    # tira suela: fuera las sombras de piel
    keep[(zona_piedra>0)&(V>200)&(Sat<40)&(f!='pampa')]=0                # letras blancas sobre la piedra
    keep=cv2.morphologyEx(keep,cv2.MORPH_OPEN,np.ones((5,5),np.uint8)); keep=cv2.morphologyEx(keep,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats((keep>0).astype(np.uint8)); k2=np.zeros_like(keep)
    for k in range(1,n):
        if st[k,4]>1500: k2[lab==k]=255
    keep=k2
    if f=='greda':   # letras del texto pegadas a la piedra: se rellenan con la piedra y se corta lo de afuera
        letras=((V>185)&(Sat<60)&(zona_piedra>0)).astype(np.uint8)
        letras=cv2.dilate(letras,np.ones((3,3),np.uint8),iterations=2)
        im=cv2.cvtColor(cv2.inpaint(cv2.cvtColor(im,cv2.COLOR_RGB2BGR),letras*255,5,cv2.INPAINT_TELEA),cv2.COLOR_BGR2RGB)
        keep[:, cx+int(rx*0.9):][(np.arange(H)>cy-ry*0.6)[:,None].repeat(W-(cx+int(rx*0.9)),1)]=0
    if f=='ocre':    # la tira izquierda está en sombra: se arma espejando la derecha sobre la argolla
        ax=g['arg'][0]; ancho_der=W-ax
        izq=np.zeros_like(keep); imz=im.copy()
        der_a=keep[:, ax:]; der_c=im[:, ax:]
        w=min(ax, der_a.shape[1])
        izq[:, ax-w:ax]=der_a[:, :w][:, ::-1]
        sel=izq>0
        imz[:, ax-w:ax][sel[:, ax-w:ax]]=der_c[:, :w][:, ::-1][sel[:, ax-w:ax]]
        piedra_m=np.zeros((H,W),np.uint8); cv2.ellipse(piedra_m,(cx,cy),(int(rx*1.12),int(ry*1.1)),0,0,360,1,-1)
        keep=np.where(np.arange(W)[None,:]<ax, np.where(piedra_m>0, keep, izq), keep)
        im=np.where((np.arange(W)[None,:,None]<ax)&(piedra_m[...,None]==0), imz, im)
    a=cv2.GaussianBlur(keep,(3,3),0)
    return im,a
if __name__=='__main__':
    import sys
    for f in sys.argv[1:]:
        im,a=recortar(f)
        Image.fromarray(np.dstack([im,a]),'RGBA').save('/tmp/claude-0/-home-user-CositasLav/a0c7a990-b18e-5cae-9d74-25293d1b0935/scratchpad/col/rc-%s.png'%f)
        print(f,'ok')

def apoyar(f, alto_piedra=100, arg_dest=(462,252), fundido=(175,105)):
    g=G[f]; im,a=recortar(f)
    s=alto_piedra/(2*g['piedra'][3])
    H,W=a.shape
    M=np.float32([[s,0,arg_dest[0]-g['arg'][0]*s],[0,s,arg_dest[1]-g['arg'][1]*s]])
    CW,CH=900,1165
    rgb=cv2.warpAffine(im,M,(CW,CH),flags=cv2.INTER_AREA)
    al=cv2.warpAffine(a,M,(CW,CH),flags=cv2.INTER_LINEAR).astype(float)
    # las puntas de la tira se pierden detrás del cuello
    y=np.arange(CH)[:,None]; y0=arg_dest[1]-fundido[0]; y1=arg_dest[1]-fundido[1]
    t=np.clip((y-y0)/(y1-y0),0,1); al*=t*t*(3-2*t)
    # sombra suave sobre el busto
    som=cv2.GaussianBlur(al,(0,0),5); som=np.roll(np.roll(som,6,0),3,1)*0.28
    out_a=np.clip(al+som*(1-al/255),0,255)
    out_rgb=(rgb*(al[...,None]/255)+np.array([60,48,40])*(som[...,None]*(1-al[...,None]/255)/255))/np.maximum(out_a[...,None]/255,1e-3)
    o=Image.fromarray(np.dstack([np.clip(out_rgb,0,255).astype(np.uint8),out_a.astype(np.uint8)]),'RGBA')
    o.save(P+'collar-%s.webp'%f,quality=88,method=6)
    return o
