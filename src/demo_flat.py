"""Prepara a exportação estática do site do Flat Jardim Serrano para rodar dentro de demos/flat/.

O Next.js grava o endereço base de forma absoluta. Como a Lorz pode ser publicada em qualquer pasta
(GitHub Pages, o visualizador), o build do Flat é feito com um marcador no lugar do endereço base:

    NEXT_PUBLIC_BASE_PATH=/__FLATBASE__ npx next build      (no projeto do Flat)
    python3 src/demo_flat.py <pasta out/ do Flat> demos/flat

e este script troca o marcador:
  - nos atributos do HTML e no CSS, por um caminho relativo (../ conforme a profundidade do arquivo);
  - no JavaScript e nos dados de navegação, pelo endereço calculado no navegador (window.__FB),
    a partir da URL da própria página. As respostas .txt da navegação são corrigidas na chegada.
"""
import pathlib, re, shutil, sys

MARK = '/__FLATBASE__'
SITE = 'https://flatjardimserrano.com.br'
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
        if not f.is_file() or f.suffix not in ('.html', '.css', '.js', '.txt'): continue
        t = f.read_text()
        # the polyfills carry a literal U+FFFD inside strings; the escaped form behaves the same and survives any upload
        if f.suffix == '.js' and '\ufffd' in t: t = t.replace('\ufffd', '\\ufffd'); f.write_text(t)
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
        f.write_text(t)

if __name__ == '__main__':
    main(*sys.argv[1:3])
