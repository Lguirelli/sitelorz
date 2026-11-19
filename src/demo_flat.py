"""Prepara a exportação estática do site do Flat Jardim Serrano para rodar dentro de demos/flat/.

O Next.js grava o endereço base de forma absoluta. Como a Lorz pode ser publicada em qualquer pasta
(GitHub Pages, o visualizador), o build do Flat é feito com um marcador no lugar do endereço base:

    NEXT_PUBLIC_BASE_PATH=/__FLATBASE__ npx next build      (no projeto do Flat)
    python src/demo_flat.py <pasta out/ do Flat> demos/flat

e este script troca o marcador:
  - nos atributos do HTML e no CSS, por um caminho relativo (../ conforme a profundidade do arquivo);
  - no JavaScript e nos dados de navegação, pelo endereço calculado no navegador (window.__FB),
    a partir da URL da própria página. As respostas .txt da navegação são corrigidas na chegada.

Depois, a cópia é enxugada para servir só de demonstração (função slim):
  - sai o e-mail pessoal dos dados estruturados e do JavaScript (o telefone e o Instagram da casa, públicos, ficam);
  - as páginas ganham "noindex", para a demonstração não concorrer com o site publicado do cliente;
  - saem os arquivos que uma pasta de demonstração não usa (404, .nojekyll);
  - as fotos viram WebP (se o Pillow estiver instalado; sem ele, ficam em JPEG).

Para enxugar de novo uma cópia já preparada:  python src/demo_flat.py demos/flat
"""
import pathlib, re, shutil, sys

MARK = '/__FLATBASE__'
SITE = 'https://flatjardimserrano.com.br'
TEXT = ('.html', '.css', '.js', '.txt')
read = lambda f: f.read_text(encoding='utf-8')
def write(f, t): f.write_text(t, encoding='utf-8', newline='')
# the routes of the export; whatever comes before them in the URL is the base
BOOT = ('<script>window.__FB=location.pathname.replace(/(index\\.html)?$/,"")'
        '.replace(/(acomodacoes\\/[^/]+\\/|acomodacoes\\/|politicas\\/|404\\/)$/,"").replace(/\\/$/,"");'
        '(function(f){window.fetch=function(i,o){var u=typeof i=="string"?i:i instanceof URL?i.href:(i&&i.url)||"";'
        'if(!/\\.txt(\\?|$)/.test(u))return f.apply(this,arguments);'
        'return f.apply(this,arguments).then(function(r){return r.text().then(function(t){'
        'return new Response(t.split("' + MARK + '").join(window.__FB),{status:r.status,statusText:r.statusText,headers:r.headers})})})}})(window.fetch);</script>')

def rel(depth): return '.' if depth == 0 else '/'.join(['..'] * depth)

def main(src, dst):
    src, dst = pathlib.Path(src), pathlib.Path(dst)
    if dst.exists(): shutil.rmtree(dst)
    shutil.copytree(src, dst)
    for f in dst.rglob('*'):
        if not f.is_file() or f.suffix not in TEXT: continue
        t = read(f)
        # the polyfills carry a literal U+FFFD inside strings; the escaped form behaves the same and survives any upload
        if f.suffix == '.js' and '�' in t: t = t.replace('�', '\\ufffd'); write(f, t)
        t = t.replace(SITE + MARK, SITE)
        if MARK not in t: continue
        depth = len(f.relative_to(dst).parts) - 1
        if f.suffix == '.js':
            t = t.replace('"' + MARK, 'window.__FB+"')
            assert MARK not in t, f'marcador fora de string em {f}'
        elif f.suffix == '.html':
            # the navigation data inside inline scripts follows the runtime base; attributes become relative
            t = re.sub(r'<script>self\.__next_f\.push\(.*?</script>', lambda m: m.group(0).replace(MARK, '"+window.__FB+"'), t, flags=re.S)
            t = t.replace(MARK, rel(depth))
            t = t.replace('<head>', '<head>' + BOOT, 1)
        else:   # css (fonts) and .txt (only fetched, fixed by the fetch wrapper; left as they are)
            if f.suffix == '.css': t = t.replace(MARK, rel(depth))
        write(f, t)
    slim(dst)

# the personal e-mail, in the three ways it is written: JSON-LD (plain and escaped once or twice) and the site data in JS
EMAIL = r'[\w.+-]+@gmail\.com'
EMAIL_JSON = re.compile(r'(\\*)"email\1":\1"' + EMAIL + r'\1",')
EMAIL_JS = re.compile(r'(\bemail:")' + EMAIL + '"')
NOINDEX = '<meta name="robots" content="noindex"/>'

def slim(dst):
    dst = pathlib.Path(dst)
    for junk in ('404.html', '404', '.nojekyll'):
        p = dst / junk
        if p.is_dir(): shutil.rmtree(p)
        elif p.exists(): p.unlink()
    try: from PIL import Image
    except ImportError: Image = None; print('Pillow não instalado: as fotos ficam em JPEG')
    photos = sorted((dst / 'assets').rglob('*.jpg')) if Image else []
    for f in photos:
        Image.open(f).convert('RGB').save(f.with_suffix('.webp'), 'WEBP', quality=80, method=6); f.unlink()
    for f in dst.rglob('*'):
        if not f.is_file() or f.suffix not in TEXT: continue
        t = old = read(f)
        t = EMAIL_JS.sub(r'\1"', EMAIL_JSON.sub('', t))
        if f.suffix == '.html' and NOINDEX not in t: t = t.replace('<meta charSet="utf-8"/>', '<meta charSet="utf-8"/>' + NOINDEX, 1)
        if photos:
            # the photos of this copy; the addresses of the published site (structured data, sharing image) stay as they are
            t = re.sub(r'(?<!\.com\.br)(/assets/[\w./-]+?)\.jpg', r'\1.webp', t)
            if f.suffix == '.js': t = re.sub(r'"([\w-]+)\.jpg"', r'"\1.webp"', t)   # file names joined to the folder in the site data
        if t != old: write(f, t)
    assert not any(re.search(EMAIL, read(f)) for f in dst.rglob('*') if f.is_file() and f.suffix in TEXT), 'e-mail ainda presente'

if __name__ == '__main__':
    if len(sys.argv) == 2: slim(sys.argv[1])
    else: main(*sys.argv[1:3])
