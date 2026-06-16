from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np, math, os

W=H=960
NAVY=(34,52,107); YELLOW=(255,209,63); RED=(214,40,57); CREAM=(255,247,230); BLACK=(18,18,22)
FB="/usr/share/fonts/truetype/freefont/FreeSansBold.ttf"
def font(sz): return ImageFont.truetype(FB,sz)
LOGO=Image.open("/tmp/logo_trim.png").convert("RGBA")

def halftone(size,bg,dot,step=26,maxr=8):
    im=Image.new("RGB",size,bg); d=ImageDraw.Draw(im)
    for y in range(0,size[1]+step,step):
        for x in range(0,size[0]+step,step):
            r=maxr*(0.4+0.6*(y/size[1]))
            d.ellipse([x-r,y-r,x+r,y+r],fill=dot)
    return im

def starburst(draw,cx,cy,rin,rout,n,fill,outline=None,ow=0):
    pts=[]
    for i in range(n*2):
        ang=math.pi*i/n - math.pi/2
        r=rout if i%2==0 else rin
        pts.append((cx+r*math.cos(ang),cy+r*math.sin(ang)))
    draw.polygon(pts,fill=fill,outline=outline,width=ow)

def outlined_text(d,xy,text,fnt,fill,stroke,sw,anchor="mm"):
    d.text(xy,text,font=fnt,fill=fill,anchor=anchor,stroke_width=sw,stroke_fill=stroke)

def place_logo(im,maxw,cy):
    lw=maxw; lh=int(LOGO.height*lw/LOGO.width)
    lg=LOGO.resize((lw,lh))
    im.paste(lg,(W//2-lw//2,cy-lh//2),lg)

def comic_frame(im):
    d=ImageDraw.Draw(im)
    m=26
    d.rectangle([m,m,W-m,H-m],outline=BLACK,width=14)
    d.rectangle([m+18,m+18,W-m-18,H-m-18],outline=YELLOW,width=4)
    return im

def wrap(d,text,fnt,maxw):
    words=text.split(); lines=[]; cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if d.textlength(t,font=fnt)<=maxw: cur=t
        else: lines.append(cur); cur=w
    if cur: lines.append(cur)
    return lines

def caption_card(path,lines_spec,bg=NAVY,dot=(46,66,130),banner=RED,sub=None):
    im=halftone((W,H),bg,dot)
    # diagonal speed lines
    ov=Image.new("RGBA",(W,H),(0,0,0,0)); od=ImageDraw.Draw(ov)
    for i in range(-H,W,46):
        od.line([(i,0),(i+260,H)],fill=(255,255,255,16),width=7)
    im=Image.alpha_composite(im.convert("RGBA"),ov).convert("RGB")
    d=ImageDraw.Draw(im)
    starburst(d,W//2,H//2,180,400,16,YELLOW,outline=BLACK,ow=10)
    starburst(d,W//2,H//2,150,330,16,banner,outline=BLACK,ow=8)
    # text
    n=len(lines_spec); fnt=font(120 if max(len(x) for x in lines_spec)<10 else 92)
    total=n*( (fnt.size)+18 ); y=H//2-total//2+fnt.size//2
    for ln in lines_spec:
        f=fnt
        while d.textlength(ln,font=f)>W-260 and f.size>50:
            f=font(f.size-6)
        outlined_text(d,(W//2,y),ln,f,CREAM,BLACK,10)
        y+=f.size+18
    if sub:
        outlined_text(d,(W//2,H-150),sub,font(46),YELLOW,BLACK,6)
    comic_frame(im); im.save(path); print("wrote",path)

def intro_card(path):
    im=halftone((W,H),NAVY,(46,66,130))
    d=ImageDraw.Draw(im)
    starburst(d,W//2,H//2-40,200,430,18,YELLOW,outline=BLACK,ow=12)
    starburst(d,W//2,H//2-40,170,360,18,(255,255,255),outline=BLACK,ow=8)
    place_logo(im,640,H//2-70)
    d=ImageDraw.Draw(im)
    outlined_text(d,(W//2,H//2+110),"EVERY BACKYARD",font(70),NAVY,(255,255,255),6)
    outlined_text(d,(W//2,H//2+190),"HAS A STORY...",font(70),RED,(255,255,255),6)
    comic_frame(im); im.save(path); print("wrote",path)

def end_card(path):
    im=halftone((W,H),CREAM,(232,222,200))
    d=ImageDraw.Draw(im)
    # top banner
    d.rectangle([0,0,W,150],fill=NAVY)
    outlined_text(d,(W//2,75),"BACKYARD. SAVED.",font(64),YELLOW,BLACK,6)
    place_logo(im,720,H//2-70)
    d=ImageDraw.Draw(im)
    outlined_text(d,(W//2,H//2+70),"Fence repairs. Deck upgrades.",font(40),NAVY,(255,255,255),3)
    outlined_text(d,(W//2,H//2+125),"Backyard transformations.",font(40),NAVY,(255,255,255),3)
    # CTA pill
    pw,ph=620,96; px=W//2-pw//2; py=H-210
    d.rounded_rectangle([px,py,px+pw,py+ph],radius=48,fill=RED,outline=BLACK,width=8)
    outlined_text(d,(W//2,py+ph//2),"BOOK YOUR ESTIMATE TODAY",font(38),(255,255,255),BLACK,4)
    comic_frame(im); im.save(path); print("wrote",path)

os.makedirs("/tmp/build/cards",exist_ok=True)
intro_card("/tmp/build/cards/00_intro.png")
caption_card("/tmp/build/cards/01_diy.png",["DIY ONLY","MADE IT","WORSE."],bg=RED,dot=(180,30,45),banner=NAVY)
caption_card("/tmp/build/cards/02_bbq.png",["BAD TIMING.","WORSE FENCE."],bg=NAVY,dot=(46,66,130),banner=RED,sub="THE BBQ IS IN ONE HOUR")
caption_card("/tmp/build/cards/03_pros.png",["TIME TO","CALL THE","PROS."],bg=(20,28,60),dot=(40,54,110),banner=YELLOW,sub="...one search away")
end_card("/tmp/build/cards/99_end.png")
print("ALL CARDS DONE")
