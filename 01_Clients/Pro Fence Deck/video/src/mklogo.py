from PIL import Image, ImageFilter
import numpy as np, os
B='/tmp/claude-0/-home-user/5229e18d-bbaf-5c73-8cd2-126b6ec9af59/scratchpad/'
os.makedirs(B+'assets/opt',exist_ok=True)

def crisp_upscale(im, scale):
    """Upscale a flat 2-colour logo and re-harden its alpha edge (vector-ish result)."""
    w,h = im.size
    big = im.resize((w*scale, h*scale), Image.LANCZOS)
    a = np.asarray(big.split()[-1]).astype(np.float32)/255.0
    # smoothstep around 0.5 -> crisp but still antialiased edge
    e = 0.16
    a = np.clip((a-(0.5-e))/(2*e), 0, 1)
    a = a*a*(3-2*a)
    big.putalpha(Image.fromarray((a*255).astype(np.uint8)))
    return big

# --- wordmark ---
wm = Image.open(B+'logo_cropped-Pro-fence-deck-2.png').convert('RGBA')
wm = crisp_upscale(wm, 4)                       # 1884 x 368
# tight crop to the ink
bbox = wm.split()[-1].point(lambda v: 255 if v>8 else 0).getbbox()
wm = wm.crop(bbox)
print('wordmark', wm.size)

def recolor(im, rgb):
    arr = np.asarray(im).copy()
    arr[...,0], arr[...,1], arr[...,2] = rgb
    return Image.fromarray(arr, 'RGBA')

recolor(wm, (0x25,0x38,0x6C)).save(B+'assets/opt/logo-wordmark-navy.png')
recolor(wm, (255,255,255)).save(B+'assets/opt/logo-wordmark-white.png')
# pure alpha silhouette, for use as a CSS mask (shine sweeps, gradient fills)
Image.merge('RGBA',[wm.split()[-1]]*3+[wm.split()[-1]]).save(B+'assets/opt/logo-wordmark-mask.png')

# --- icon mark ---
ic = Image.open(B+'logo_Pro-fence-deck-1.png').convert('RGBA')
ic = ic.resize((1200,1200), Image.LANCZOS)
ic.save(B+'assets/opt/logo-icon.png')

# white "P" knocked out of the navy disc -> usable as a mask on any background
a = np.asarray(ic.convert('RGB')).astype(np.float32)
lum = a.mean(axis=2)/255.0
disc = np.asarray(ic.split()[-1]).astype(np.float32)/255.0
p_alpha = np.clip((lum-0.55)/0.25,0,1)*disc          # white glyph only
p = (p_alpha*255).astype(np.uint8)
Image.merge('RGBA',[Image.fromarray(p)]*3+[Image.fromarray(p)]).save(B+'assets/opt/logo-icon-mask.png')
print('logo assets written')
