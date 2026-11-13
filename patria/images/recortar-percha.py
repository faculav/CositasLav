# Recorta una foto de chaleco en percha sobre fondo blanco -> webp transparente
import sys, numpy as np, cv2
from PIL import Image
def recortar(src, dst, tachas=False):
    rgb=np.asarray(Image.open(src).convert('RGB')).copy()
    H,W=rgb.shape[:2]; f=rgb.astype(float)
    d=255-f.min(axis=2); croma=f.max(axis=2)-f.min(axis=2)
    a=(np.clip((np.maximum(d,croma*2.2)-14)/26,0,1)*255).astype(np.uint8)
    gancho=np.zeros((H,W),bool)
    filas=np.nonzero((a>128).sum(axis=1)>W*0.25)[0]; ymad=int(filas[0]) if len(filas) else int(H*0.14)
    gancho[:ymad+4, int(W*0.3):int(W*0.7)]=True
    ag=(np.clip((np.maximum(d,croma*3.0)-8)/18,0,1)*255).astype(np.uint8)
    a[gancho]=np.maximum(a[gancho],ag[gancho])
    if tachas:
        inv=(a<=60).astype(np.uint8); n,lab,st,_=cv2.connectedComponentsWithStats(inv,4)
        for k in range(1,n):
            x,y,w,h,ar=st[k]
            if ar<1500 and x>0 and y>0 and x+w<W and y+h<H: a[lab==k]=255
    blanco=((croma<28)&(f.min(axis=2)>150)&~gancho).astype(np.uint8)
    hsv=cv2.cvtColor(rgb,cv2.COLOR_RGB2HSV)
    claro=((hsv[...,2]>110)&(hsv[...,1]<60)&(a>0)&~gancho).astype(np.uint8); claro[:int(H*0.09)]=0
    fuera=(a<30).astype(np.uint8); toca=cv2.dilate(fuera,np.ones((5,5),np.uint8))
    n,lab,st,_=cv2.connectedComponentsWithStats(claro,8); q=np.zeros_like(claro)
    for k in range(1,n):
        c=lab==k
        if st[k,cv2.CC_STAT_AREA]>40 and (toca[c]>0).any(): q|=c.astype(np.uint8)
    q=cv2.dilate(q,np.ones((3,3),np.uint8),iterations=2); q[gancho]=0; a[q>0]=0
    borde=(cv2.dilate((a<235).astype(np.uint8),np.ones((3,3),np.uint8),iterations=2)&(a>0)).astype(np.uint8)
    banda=(borde&blanco).astype(np.uint8)
    bgr=cv2.inpaint(cv2.cvtColor(rgb,cv2.COLOR_RGB2BGR),banda*255,5,cv2.INPAINT_TELEA); rgb=cv2.cvtColor(bgr,cv2.COLOR_BGR2RGB)
    a[(banda>0)&(a<200)]=0
    a2=np.clip((a.astype(float)-70)*1.8,0,255); a2[gancho]=a[gancho]
    a=cv2.GaussianBlur(a2.astype(np.uint8),(3,3),0)
    im=Image.fromarray(np.dstack([rgb,a]),'RGBA')
    return im
def lienzo_comun(pares, ancho_final=820):
    # mismas proporciones para todas: lienzo fijo centrado en el gancho
    ims=[(recortar(s, None, t), d) for s,d,t in pares]
    info=[]
    for im,d in ims:
        A=np.asarray(im.getchannel('A')); bb=im.getchannel('A').point(lambda v:255 if v>60 else 0).getbbox()
        ys,xs=np.nonzero(A[bb[1]:bb[1]+12]>100); hx=int(xs.mean())
        info.append((bb,hx))
    medio=max(max(hx-bb[0], bb[2]-hx) for bb,hx in info)+6
    alto=max(bb[3]-bb[1] for bb,hx in info)+6
    for (im,d),(bb,hx) in zip(ims,info):
        c=Image.new('RGBA',(2*medio,alto),(0,0,0,0))
        c.paste(im.crop((hx-medio, bb[1], hx+medio, bb[1]+alto)),(0,0))
        esc=ancho_final/c.width; c=c.resize((ancho_final, round(c.height*esc)), Image.LANCZOS)
        c.save(d,quality=90,method=6); print(d,c.size)
if __name__=='__main__':
    I='/tmp/claude-0/-home-user-CositasLav/a0c7a990-b18e-5cae-9d74-25293d1b0935/images/'; P='/home/user/CositasLav/patria/images/'
    lienzo_comun([(I+'21.webp',P+'perch-pec-cria.webp',False),(I+'22.webp',P+'perch-pec-cria-b.webp',False),
                  (I+'19.webp',P+'perch-cha-cruz.webp',True),(I+'20.webp',P+'perch-cha-cruz-b.webp',False),
                  (I+'23.webp',P+'perch-cha-latte.webp',False),(I+'24.webp',P+'perch-cha-latte-b.webp',False)])
