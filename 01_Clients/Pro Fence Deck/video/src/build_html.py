"""Assemble the Pro Fence Deck motion piece from template + optimised assets."""
import base64, json, os, sys

B = '/tmp/claude-0/-home-user/5229e18d-bbaf-5c73-8cd2-126b6ec9af59/scratchpad/'

def b64(path, mime):
    return f'data:{mime};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def fonts():
    faces, css = [
        ('Poppins', 400, 'poppins-400.woff2'), ('Poppins', 600, 'poppins-600.woff2'),
        ('Poppins', 700, 'poppins-700.woff2'), ('Poppins', 800, 'poppins-800.woff2'),
        ('Poppins', 900, 'poppins-900.woff2'),
        ('Lato', 400, 'lato-400.woff2'), ('Lato', 700, 'lato-700.woff2'), ('Lato', 900, 'lato-900.woff2'),
    ], []
    for fam, wt, f in faces:
        css.append("@font-face{font-family:'%s';font-style:normal;font-weight:%d;font-display:block;"
                   "src:url(%s) format('woff2')}" % (fam, wt, b64(B + 'fonts/' + f, 'font/woff2')))
    return '\n'.join(css)

GRAIN = ("url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E"
         "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E"
         "%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")")


def build(profile, out_name, inline):
    src = B + f'assets/{profile}/'
    man = json.load(open(src + 'manifest.json'))
    assets = {}
    for k, m in man.items():
        p = src + m['file']
        assets[k] = b64(p, 'image/jpeg') if inline else 'assets/%s/%s' % (profile, m['file'])
    # logo art is always inlined: CSS mask-image is CORS-checked and will not
    # load over file://, which is how the headless renderer opens the page.
    assets['wordmask'] = b64(B + 'assets/opt/logo-wordmark-mask.png', 'image/png')
    assets['icon'] = b64(B + 'assets/opt/logo-icon.png', 'image/png')

    html = open(B + 'template.html', encoding='utf-8').read()
    # file:// has no Content-Type header, so without this the browser decodes the
    # page as windows-1252 and every ·, ★ and curly quote turns into mojibake.
    html = '<meta charset="utf-8">\n' + html
    html = html.replace('__FONTS__', fonts() + '\n:root{--grain:%s}' % GRAIN)
    html = html.replace('__ASSETS__',
                        'window.__A=' + json.dumps(assets) + ';\nwindow.__M=' + json.dumps(man) + ';')
    open(B + out_name, 'w', encoding='utf-8').write(html)
    print(f'{out_name}: {os.path.getsize(B + out_name)/1e6:.2f} MB  ({len(man)} images, inline={inline})')


if __name__ == '__main__':
    build('full', 'render.html', inline=False)   # local render, file:// refs, fast
    build('web',  'pfd-video.html', inline=True) # self-contained, publishable
