"""Gera o site da Lorz (Python 3, sem dependências):  python src/build.py

Entradas em src/: index.html (corpo da página principal), css/, js/, hairline/, sprite.svg, brand/ e o conteúdo
das subpáginas (subpages.py, projetos_pages.py).
Saídas na raiz: index.html, as subpáginas e assets/index.css, assets/index.js e assets/sub.css.
Fontes, imagens e SVGs servidos como arquivo ficam só em assets/ (não há cópia em src/).
"""
import re, sys
sys.dont_write_bytecode = True
from layout import OUT, asset, data_uri, document, minify_css, more, read, write
import subpages, projetos_pages

FIGURES = ['montagem', 'bandeja', 'esteira']
MAIN = ['prelude', 'crew', 'page', 'projetos', 'crew_scroll']   # um escopo só, nesta ordem

def css(name):
    """base.css (fontes e paleta) + a folha da página, com o logo embutido como máscara"""
    return minify_css((read('css/base.css') + read(f'css/{name}.css')).replace('{{LOGO}}', data_uri(read('brand/lorz-logo.svg'))))

def js():
    # o kernel Hairline (sem alteração), quem monta as figuras, a página e, por último, as três figuras
    main = '(() => {\n' + ''.join(read(f'js/{n}.js') for n in MAIN) + '})();\n'
    figures = ''.join('(() => {\n"use strict";\n' + read(f'hairline/{n}.js') + '})();\n' for n in FIGURES)
    return read('hairline/kernel.js') + read('js/hairline-host.js') + main + figures

def cards(body):
    """each format and solution card: <!--more--> becomes the dropdown that holds a copy of the card's list"""
    def card(m):
        art = m.group(0)
        return art.replace('<!--more-->', more(re.search(r'<h3>(.*?)</h3>', art).group(1), re.search(r'<ul>.*?</ul>', art, re.S).group(0)))
    body, n = re.subn(r'<article class="tile (?:format|sol)".*?</article>', card, body, flags=re.S)
    assert n and '<!--more-->' not in body
    return body

# marks that scripting works; if the page's script fails to load or to run, everything is shown as plain content
BOOT = ("<script>(function(d){d.classList.add('js');addEventListener('error',function(e){var t=e.target;"
        "if((t&&t.tagName==='SCRIPT')||(e.error&&/\\/assets\\/index\\.js/.test(e.filename||''))){d.classList.remove('js');"
        "if(document.body)document.body.classList.remove('locked');}},true);})(document.documentElement);</script>\n")

def build():
    index_css = asset('index.css', css('index'))
    asset('sub.css', css('sub'))
    index_js = asset('index.js', js())
    head = f'<link rel="stylesheet" href="{index_css}">\n{BOOT}<script defer src="{index_js}"></script>\n'
    write(OUT / 'index.html', document('Lorz Sites Sob Medida',
          'Criação de sites e soluções personalizadas sob medida, com proposta por escrito antes de qualquer execução.', head, cards(read('index.html'))))
    return ['index'] + subpages.build() + projetos_pages.build()

if __name__ == '__main__':
    print('ok', ', '.join(build()))
