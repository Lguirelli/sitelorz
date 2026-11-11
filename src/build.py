"""Monta a landing da Lorz: embute fontes e SVGs (como data URIs) no template.

Saídas:
  ../index.html          página completa, pronta para hospedar
  argv[1] (opcional)     versão sem <html>/<head>, para o visualizador de Artifacts
"""
import base64, pathlib, sys

SRC = pathlib.Path(__file__).parent
b64 = lambda p: base64.b64encode((SRC / p).read_bytes()).decode()

tpl = (SRC / 'template.html').read_text()
for key, path in {
    'F_BRANDSON': 'fonts/Brandson.woff2',
    'F_ALTE_R': 'fonts/AlteHaasGrotesk-Regular.woff2',
    'F_ALTE_B': 'fonts/AlteHaasGrotesk-Bold.woff2',
    'F_ADVERCASE': 'fonts/Advercase-Regular.woff2',
    'RETRATO': 'brand/retrato-vetorizado.svg',
    'RETRATO_NEG': 'brand/retrato-vetorizado-negativo.svg',
    'LOGO': 'brand/lorz-logo.svg',
    'ICON': 'brand/lorz-icone.svg',
}.items():
    tpl = tpl.replace('{{%s}}' % key, b64(path))
# brand icon as a knockout mask: rounded square with the L cut out (fill-rule evenodd)
icon_mask = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill-rule="evenodd" '
             'd="M12 0h40a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12H12A12 12 0 0 1 0 52V12A12 12 0 0 1 12 0z M20 14h10v34h17v10H20z"/></svg>')
tpl = tpl.replace('{{ICON_MASK}}', base64.b64encode(icon_mask.encode()).decode())
# Hairline: o kernel (sem alteração) e as três figuras, em src/hairline/
HL_DIR = SRC / 'hairline'
tpl = tpl.replace('{{HL_KERNEL}}', (HL_DIR / 'kernel.js').read_text())
for n in ['montagem', 'bandeja', 'esteira']:
    tpl = tpl.replace('{{FIG_%s}}' % n.upper(), (HL_DIR / f'{n}.js').read_text())
# o motor da equipe de cursores e a construção por rolagem: fonte única em src/
tpl = tpl.replace('{{JS_PROJETOS}}', (SRC / 'projetos.js').read_text())
tpl = tpl.replace('{{JS_CREW}}', (SRC / 'crew.js').read_text()).replace('{{JS_SCROLL}}', (SRC / 'crew_scroll.js').read_text())
assert '{{' not in tpl, 'placeholder sem valor'

full = ('<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + tpl + '\n</html>\n')
(SRC.parent / 'index.html').write_text(full)
# as subpáginas dos formatos (sem a construção animada)
import subpages; subpages.build()
# as imagens dos projetos (src/projetos/ → assets/projetos/)
import shutil; shutil.copytree(SRC / 'projetos', SRC.parent / 'assets' / 'projetos', dirs_exist_ok=True)
if len(sys.argv) > 1:
    pathlib.Path(sys.argv[1]).write_text(tpl)
print('ok', len(full) // 1024, 'KB')
