"""O que todas as páginas compartilham: leitura e escrita dos arquivos, <head>, cabeçalho, rodapé, ícones e a
política de segurança (CSP). Usado por build.py, subpages.py e projetos_pages.py."""
import base64, hashlib, html, pathlib, re, urllib.parse

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent
ASSETS = OUT / 'assets'

e = html.escape
def read(path): return (SRC / path).read_text(encoding='utf-8')
def write(path, text): path.write_text(text, encoding='utf-8', newline='\n')

def data_uri(svg):
    """um SVG pequeno embutido no CSS (máscaras), sem base64"""
    return 'data:image/svg+xml,' + urllib.parse.quote(re.sub(r'\s+', ' ', svg).strip(), safe=" =:/,.()'-")

def minify_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s+', ' ', css)
    return re.sub(r' ?([{};]) ?', r'\1', css).replace(';}', '}').strip() + '\n'

_versions = {}
def asset(name, text=None):
    """grava assets/<name> (quando recebe o texto) e devolve o endereço com a versão do conteúdo, para o cache"""
    if text is not None:
        write(ASSETS / name, text)
        _versions[name] = hashlib.sha256(text.encode()).hexdigest()[:8]
    return f'assets/{name}?v={_versions[name]}'

_SYMBOLS = None
def sprite(page):
    """só os ícones que a página usa"""
    global _SYMBOLS
    if _SYMBOLS is None: _SYMBOLS = {i: s for s, i in re.findall(r'(<symbol id="([^"]+)".*?</symbol>)', read('sprite.svg'), re.S)}
    used = [s for i, s in _SYMBOLS.items() if f'href="#{i}"' in page]
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true">' + ''.join(used) + '</svg>' if used else ''

FONT_PRELOAD = ''.join(f'<link rel="preload" href="assets/fonts/{f}.woff2" as="font" type="font/woff2" crossorigin>\n' for f in ('Brandson', 'Advercase-Regular'))

def document(title, description, head, body, body_attrs='', frames=False):
    """a página inteira; a CSP só libera os scripts embutidos desta página (pelo hash) e os arquivos do próprio site"""
    page = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="{{{{CSP}}}}">
<title>{e(title)}</title>
<meta name="description" content="{e(description)}">
<link rel="icon" href="assets/brand/lorz-icone.svg" type="image/svg+xml">
{FONT_PRELOAD}{head}</head>
<body{body_attrs}>
{{{{SPRITE}}}}{body}</body>
</html>
'''
    page = page.replace('{{SPRITE}}', sprite(page))
    hashes = ''.join(" 'sha256-%s'" % base64.b64encode(hashlib.sha256(s.encode()).digest()).decode() for s in re.findall(r'<script>(.*?)</script>', page, re.S))
    csp = (f"default-src 'none'; script-src 'self'{hashes}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'"
           + ("; frame-src 'self'" if frames else '') + "; base-uri 'none'; form-action 'none'")
    return page.replace('{{CSP}}', csp)

# ---- subpáginas (formatos e projetos): mesmo cabeçalho e rodapé, sem a construção animada ----
SUB_HEAD = '''<link rel="stylesheet" href="{{CSS}}">
<script>/* skeleton only while the fonts are still on their way (first visit); nothing else animates in */
(function(d){if(!d.fonts||d.fonts.check('1em "Brandson"'))return;var h=d.documentElement;h.classList.add('sk');
var done=function(){h.classList.remove('sk');};Promise.all(['1em "Brandson"','1em "Advercase"','700 1em "Alte Haas Grotesk"','1em "Alte Haas Grotesk"'].map(function(f){return d.fonts.load(f);})).then(done,done);setTimeout(done,2500);})(document);</script>
'''
NAV = [('Sites', 'index.html#sites'), ('Soluções', 'index.html#solucoes'), ('Projetos', 'index.html#projetos'),
       ('Sob medida', 'index.html#sob-medida'), ('Como funciona', 'index.html#processo')]
def header(cta, current=None):
    cur = ' aria-current="true"'
    items = ''.join(f'<li><a href="{h}"{cur if t == current else ""}>{t}</a></li>' for t, h in NAV)
    return f"""<header class="top"><div class="wrap nav">
  <a class="logo" href="index.html" aria-label="Lorz, página inicial"></a>
  <nav aria-label="Principal"><ul>{items}</ul></nav>
  <a class="btn sm" href="{cta}">Solicitar <span class="long">proposta</span></a>
</div></header>"""
FOOTER = '<footer class="site"><div class="wrap"><span class="logo" aria-hidden="true"></span><span>© 2026 Lorz Marketing · Sites e soluções sob medida</span><a href="index.html">Voltar ao início</a></div></footer>'
def icon(i): return f'<span class="ic" aria-hidden="true"><svg><use href="#{i}"/></svg></span>'

def more(title, content):
    """Progressive disclosure: the part of a card that its compact version leaves out, in a dropdown that opens
    under the card (a native <details>, so it works with mouse, keyboard and touch, and without script).
    The CSS decides, by the card's own width, when the card is compact and this shows; one opens at a time."""
    return (f'<details class="more" name="card"><summary aria-label="Ver detalhes: {title}">Ver detalhes</summary>'
            f'<div class="drop">{content}</div></details>')
# Escape and a click outside close the open dropdown (the page's own script does the same on the main page)
MORE_JS = ("<script>(function(){var open=function(){return document.querySelector('details.more[open]');};"
           "addEventListener('keydown',function(e){var d=e.key==='Escape'&&open();if(d){d.open=false;d.firstElementChild.focus();}});"
           "addEventListener('click',function(e){var d=open();if(d&&!d.contains(e.target))d.open=false;});})();</script>")

def subpage(title, description, body, body_attrs, frames=False):
    return document(title, description, SUB_HEAD.replace('{{CSS}}', asset('sub.css')),
                    '<a class="skip" href="#conteudo">Pular para o conteúdo</a>\n' + body, body_attrs, frames)
