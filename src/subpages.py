"""Gera as subpáginas dos formatos (Landing Page, Site Completo, Soluções Personalizadas).

Sem a construção animada da página principal: só um skeleton enquanto as fontes carregam.
Saídas (na raiz do projeto): landing-page.html, site-completo.html, solucoes-personalizadas.html
e assets/ (sub.css, fontes e SVGs da marca), compartilhados pelas três.
"""
import html, pathlib, re, shutil

SRC = pathlib.Path(__file__).parent
OUT = SRC.parent
TPL = (SRC / 'template.html').read_text()
SPRITE = re.search(r'<svg width="0" height="0" style="position:absolute" aria-hidden="true">.*?</svg>\n', TPL, re.S).group(0)

def mock(n):
    """the browser drawing of the n-th format card on the main page"""
    arts = re.findall(r'<article class="tile format".*?</article>', TPL, re.S)
    return re.search(r'<div class="browser" aria-hidden="true">.*?</div>\s*</div>(?=\s*<h3>)', arts[n], re.S).group(0)

e = html.escape
def icon(i): return f'<span class="ic" aria-hidden="true"><svg><use href="#{i}"/></svg></span>'


# the parts every subpage shares with the main page: fonts, the Lorz header and the Lorz footer
HEAD_ASSETS = """<link rel="preload" href="assets/fonts/Brandson.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/Advercase-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="assets/sub.css">
<script>/* skeleton only while the fonts are still on their way (first visit); nothing else animates in */
(function(d){if(!d.fonts||d.fonts.check('1em "Brandson"'))return;var h=d.documentElement;h.classList.add('sk');
var done=function(){h.classList.remove('sk');};Promise.all(['1em "Brandson"','1em "Advercase"','700 1em "Alte Haas Grotesk"','1em "Alte Haas Grotesk"'].map(function(f){return d.fonts.load(f);})).then(done,done);setTimeout(done,2500);})(document);</script>
"""
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

PAGES = [
  dict(
    slug='landing-page', idx=0, color='var(--action)', name='Landing Page', service='Criação de sites',
    title='Uma página, um <em>objetivo</em>.',
    lede='A landing page reúne numa página só o que a pessoa precisa saber para decidir: entender a oferta, confiar em quem oferece e entrar em contato. Funciona melhor quando existe uma ação principal clara.',
    facts=[('Formato', 'Página única, dividida em seções'), ('Ação principal', 'Orçamento, WhatsApp ou formulário'), ('Investimento', 'Sob proposta, depois do diagnóstico')],
    fits=['Você vai divulgar uma campanha, um lançamento ou um serviço específico.',
          'As visitas chegam por anúncios, pelas redes ou por um link na bio.',
          'Existe uma ação principal: pedir orçamento, chamar no WhatsApp ou se inscrever.',
          'Você precisa de algo no ar sem montar um site inteiro.'],
    other=[('Você tem vários serviços que merecem o mesmo destaque.', 'site-completo', 'Site Completo'),
           ('O contato precisa virar um pedido organizado ou cair direto num sistema.', 'solucoes-personalizadas', 'Soluções Personalizadas')],
    scope=[('i-layout', 'Seções definidas conforme o objetivo', 'A ordem das seções parte do que a pessoa precisa saber antes de agir.'),
           ('i-cursor', 'Chamadas para ação e caminhos de contato', 'Os botões ao longo da página levam todos à mesma ação.'),
           ('i-devices', 'Layout responsivo e navegação clara', 'Pensada primeiro para o celular, onde costuma chegar quem clica num anúncio ou num link.'),
           ('i-send', 'Contato pelo canal que você já usa', 'WhatsApp com mensagem pronta, formulário ou pedido de orçamento.'),
           ('i-search', 'Título e descrição para buscadores', 'Também definem como o link aparece quando é compartilhado.')],
    agreed='Redação dos textos, fotos, domínio, hospedagem e ferramentas de anúncio variam de projeto para projeto. O que entra fica escrito na proposta.',
    map_title='Como uma landing page costuma ser montada',
    map_note='A ordem muda conforme o objetivo. Este é um ponto de partida para a conversa.',
    map=[('Topo', 'O que é, para quem é e o botão principal, sem precisar rolar.'),
         ('Situação', 'O problema ou o desejo que a pessoa reconhece como dela.'),
         ('Oferta', 'O que está incluído e como funciona, passo a passo.'),
         ('Prova', 'Depoimentos, fotos do trabalho e números, quando existem.'),
         ('Perguntas', 'As dúvidas que costumam travar o contato, já respondidas.'),
         ('Contato', 'O botão final e as formas de atendimento.')],
    examples=[('Clínica com um tratamento novo', 'Agendar uma avaliação', 'WhatsApp com mensagem pronta', 'Como o tratamento funciona, quem atende, perguntas frequentes'),
              ('Curso com inscrições abertas', 'Inscrição na turma', 'Formulário de inscrição', 'Programa, datas, quem ensina, investimento'),
              ('Empresa de reformas anunciando na região', 'Pedido de orçamento', 'Formulário com tipo de serviço e bairro', 'Serviços, área atendida, fotos de obras')],
    faq=[('Uma landing page aparece no Google?', 'Pode aparecer, porque recebe título e descrição para buscadores. Ela funciona melhor recebendo visitas de anúncios, redes e links diretos. Para ser encontrado em buscas diferentes, um site completo tem mais páginas para isso.'),
         ('Dá para virar um site completo depois?', 'Em geral, sim. A estrutura pode ser aproveitada como página inicial ou como página de um serviço. A ampliação entra numa nova proposta.'),
         ('Posso ter mais de uma landing page?', 'Pode. Cada campanha ou serviço pode ter a sua, com o mesmo padrão visual.')],
    cta='Quer uma landing page para a sua próxima campanha?'),
  dict(
    slug='site-completo', idx=1, color='var(--accent)', name='Site Completo', service='Criação de sites',
    title='O negócio inteiro, <em>organizado</em>.',
    lede='Um site com várias páginas para apresentar serviços, história, diferenciais e formas de contato. Quem chega pelo Google, por indicação ou pelas redes encontra o que procura sem se perder.',
    facts=[('Formato', 'Várias páginas, ligadas por um menu'), ('Ação principal', 'Contato a partir de qualquer página'), ('Investimento', 'Sob proposta, depois do diagnóstico')],
    fits=['Você oferece mais de um serviço e cada um precisa de explicação própria.',
          'As pessoas pesquisam e comparam empresas antes de contratar.',
          'Você quer ser encontrado no Google por buscas diferentes.',
          'Precisa de uma referência oficial para mandar a clientes, parceiros e candidatos.'],
    other=[('Você vai divulgar uma única oferta numa campanha.', 'landing-page', 'Landing Page'),
           ('O site precisa registrar pedidos, agendar ou conversar com outros sistemas.', 'solucoes-personalizadas', 'Soluções Personalizadas')],
    scope=[('i-pages', 'Estrutura de páginas definida no briefing', 'Quais páginas existem, o que vai em cada uma e como elas se ligam.'),
           ('i-compass', 'Conteúdo e navegação tratados juntos', 'O menu e os caminhos entre as páginas partem do conteúdo, não do contrário.'),
           ('i-search', 'Configurações básicas de indexação', 'Título e descrição por página, endereços legíveis e mapa do site para os buscadores.'),
           ('i-devices', 'Layout responsivo', 'Cada página funciona no celular, no tablet e no computador.'),
           ('i-send', 'Contato a um clique de qualquer página', 'Formulário e WhatsApp sempre à mão.'),
           ('i-article', 'Área de artigos, quando faz sentido', 'Categorias e páginas de artigo para responder às dúvidas dos clientes.')],
    agreed='Quem produz cada parte do conteúdo (textos, fotos, vídeos), domínio, hospedagem e manutenção fica definido por escrito na proposta.',
    map_title='Um mapa de site comum',
    map_note='As páginas mudam de negócio para negócio. A quantidade é definida no diagnóstico.',
    map=[('Início', 'Resume quem é a empresa e leva para os serviços e para o contato.'),
         ('Serviços', 'Uma visão geral e, quando precisa, uma página para cada serviço.'),
         ('Sobre', 'História, equipe e o jeito de trabalhar.'),
         ('Trabalhos', 'Projetos, depoimentos ou estudos de caso.'),
         ('Artigos', 'Opcional: conteúdo que responde às dúvidas de quem pesquisa.'),
         ('Contato', 'Formulário, WhatsApp, endereço e horários.')],
    examples=[('Escritório de contabilidade', 'Explicar cada serviço para um público diferente', 'Formulário com o tipo de empresa', 'Uma página por serviço, equipe, artigos sobre dúvidas fiscais'),
              ('Estúdio de arquitetura', 'Mostrar projetos e o jeito de trabalhar', 'Pedido de reunião', 'Portfólio por projeto, etapas do trabalho, sobre o estúdio'),
              ('Indústria com linhas de produto', 'Apresentar o catálogo a revendedores', 'Contato comercial por região', 'Linhas de produto, área do revendedor, trabalhe conosco')],
    faq=[('Quantas páginas um site completo tem?', 'Depende do que o negócio precisa mostrar. A quantidade sai do diagnóstico e fica escrita na proposta.'),
         ('Preciso ter todos os textos prontos?', 'Não. Você conta o que faz e envia o material que já tem. A proposta deixa claro quem produz cada parte do conteúdo.'),
         ('O site já sai aparecendo no Google?', 'As configurações básicas de indexação entram no projeto. A posição nas buscas também depende de conteúdo, concorrência e tempo, e ninguém consegue garantir o primeiro lugar.')],
    cta='Quer um site que apresente o seu negócio inteiro?'),
  dict(
    slug='solucoes-personalizadas', idx=2, color='var(--red-400)', name='Soluções Personalizadas', service='Soluções personalizadas',
    title='Para o que vem <em>depois</em> do contato.',
    lede='Pedidos que se perdem no WhatsApp, planilhas copiadas à mão, informação espalhada entre pessoas. A solução pode ser uma automação simples, um sistema interno ou um painel, do tamanho do problema.',
    facts=[('Formato', 'Automação, sistema interno ou painel'), ('Ponto de partida', 'Como o processo funciona hoje'), ('Investimento', 'Sob proposta, depois do diagnóstico')],
    fits=['A equipe copia a mesma informação em mais de um lugar.',
          'Pedidos e contatos ficam em conversas e ninguém sabe em que etapa estão.',
          'Os números do mês dependem de alguém montar uma planilha.',
          'Cada pessoa da equipe precisa ver só uma parte da informação.'],
    other=[('Você ainda não tem site, ou o site não explica o que você faz.', 'site-completo', 'Site Completo'),
           ('Você precisa primeiro de uma página para uma campanha.', 'landing-page', 'Landing Page')],
    scope=[('i-plug', 'Automações e integrações', 'Contatos do site organizados sozinhos, solicitações encaminhadas aos responsáveis, formulários, planilhas e CRMs conectados.'),
           ('i-blocks', 'Sistemas personalizados', 'Cadastros, pedidos e etapas num só lugar, com acesso por função da equipe.'),
           ('i-chart', 'Dados e painéis', 'Os números do dia a dia num painel, e relatórios que se atualizam sozinhos.'),
           ('i-loop', 'Crescimento por partes', 'Começa pelo menor passo que já resolve. As próximas etapas entram quando fizerem falta.')],
    agreed='Quais ferramentas serão usadas, quem acessa o quê, o que é migrado e como fica a manutenção são definidos por escrito na proposta.',
    map_title='Um fluxo comum, do site ao painel',
    map_note='Um exemplo de automação simples. Cada etapa pode ser feita com as ferramentas que você já usa.',
    map=[('Formulário', 'A pessoa preenche o pedido no site.'),
         ('Registro', 'O pedido vira uma linha na planilha ou um cartão no CRM, com data e status.'),
         ('Aviso', 'O responsável recebe o pedido por e-mail ou mensagem.'),
         ('Painel', 'A equipe vê o que está pendente e quanto entrou no mês.')],
    examples=[('Loja que vende pelo WhatsApp', 'Pedidos anotados à mão e conferidos no fim do dia', 'Cada pedido vira um registro com status', 'Painel com o que está pendente e o que já saiu'),
              ('Prestadora de serviço com equipe externa', 'Ordens de serviço em papel ou em grupos de mensagem', 'Sistema com as etapas de cada atendimento', 'Cada técnico vê só as próprias ordens'),
              ('Curso com inscrições pelo site', 'Alguém copia cada inscrição do e-mail para a planilha', 'A inscrição cai direto na planilha', 'Confirmação enviada automaticamente')],
    faq=[('Preciso trocar as ferramentas que já uso?', 'Nem sempre. Quando dá, a solução conecta o que você já usa, como planilhas e CRMs.'),
         ('Um sistema não é caro demais para o meu caso?', 'O tamanho é definido no diagnóstico. Muitas vezes uma integração simples resolve antes de pensar em um sistema.'),
         ('E se o processo mudar depois?', 'A solução é feita por partes, e cada nova etapa entra numa proposta própria.')],
    cta='Quer organizar o que acontece depois do contato?'),
]

def page(P):
    others = [Q for Q in PAGES if Q is not P]
    flow = P['slug'] == 'solucoes-personalizadas'
    sitemap = P['slug'] == 'site-completo'
    ex_heads = ('Hoje', 'Com a solução', 'Resultado') if flow else ('Objetivo', 'Ação principal', 'Em destaque')
    if flow:
        visual = '<ol class="flow">' + ''.join(f'<li><span class="n">{i+1:02d}</span><b>{e(t)}</b><span>{e(d)}</span></li>' for i, (t, d) in enumerate(P['map'])) + '</ol>'
    elif sitemap:
        root, *kids = P['map']
        visual = (f'<div class="tree"><div class="node root"><b>{e(root[0])}</b><span>{e(root[1])}</span></div><ul>'
                  + ''.join(f'<li class="node{" opt" if t == "Artigos" else ""}"><b>{e(t)}</b><span>{e(d)}</span></li>' for t, d in kids) + '</ul></div>')
    else:
        visual = ('<div class="wire"><div class="wbar"><i></i><i></i><i></i></div><ol>'
                  + ''.join(f'<li><span class="n">{i+1}</span><div><b>{e(t)}</b><span>{e(d)}</span></div></li>' for i, (t, d) in enumerate(P['map'])) + '</ol></div>')
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(P["name"])} · Lorz</title>
<meta name="description" content="{e(P["lede"])}">
{HEAD_ASSETS}</head>
<body style="--fc:{P["color"]}">
{SPRITE}<a class="skip" href="#conteudo">Pular para o conteúdo</a>
{header('index.html?formato=' + P['slug'] + '#contato')}

<main id="conteudo">
<section class="hero"><div class="wrap hero-grid">
  <div>
    <nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="index.html#sites">Formatos</a><span aria-hidden="true">/</span><span aria-current="page">{e(P["name"])}</span></nav>
    <p class="kicker">{e(P["name"])}</p>
    <h1 class="display">{P["title"]}</h1>
    <p class="lede">{e(P["lede"])}</p>
    <div class="ctas"><a class="btn" href="index.html?formato={P["slug"]}#contato">Pedir proposta</a><a class="btn ghost" href="#escopo">Ver o escopo</a></div>
  </div>
  <div class="art">{mock(P["idx"])}</div>
</div>
<dl class="wrap facts">{''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in P["facts"])}</dl>
</section>

<section class="sec"><div class="wrap two">
  <div><h2 class="display">Para quem <em>é</em>.</h2><p class="muted">Um jeito rápido de saber se este é o formato certo para o seu momento.</p></div>
  <div class="fit">
    <h3>Faz sentido quando</h3>
    <ul class="checks">{''.join(f'<li>{e(t)}</li>' for t in P["fits"])}</ul>
    <h3>Outro formato pode servir melhor quando</h3>
    <ul class="alts">{''.join(f'<li><span>{e(t)}</span><a href="{s}.html">{e(n)} <span aria-hidden="true">→</span></a></li>' for t, s, n in P["other"])}</ul>
  </div>
</div></section>

<section class="sec band" id="escopo"><div class="wrap">
  <div class="head"><h2 class="display">O que entra no <em>escopo</em>.</h2><p class="muted">Cada projeto parte de uma conversa. Estes são os itens que costumam fazer parte deste formato.</p></div>
  <ul class="scope">{''.join(f'<li class="tile">{icon(i)}<h3>{e(t)}</h3><p>{e(d)}</p></li>' for i, t, d in P["scope"])}</ul>
  <p class="agreed">{icon("i-article")}<span><b>Definido na proposta.</b> {e(P["agreed"])}</span></p>
</div></section>

<section class="sec"><div class="wrap two map">
  <div><h2 class="display">{e(P["map_title"])}.</h2><p class="muted">{e(P["map_note"])}</p></div>
  {visual}
</div></section>

<section class="sec band"><div class="wrap">
  <div class="head"><h2 class="display">Exemplos de <em>uso</em>.</h2><p class="muted">Situações ilustrativas, para mostrar como o formato se adapta a negócios diferentes.</p></div>
  <div class="examples">{''.join(f'<article class="tile ex"><h3>{e(t)}</h3><dl><div><dt>{ex_heads[0]}</dt><dd>{e(a)}</dd></div><div><dt>{ex_heads[1]}</dt><dd>{e(b)}</dd></div><div><dt>{ex_heads[2]}</dt><dd>{e(c)}</dd></div></dl></article>' for t, a, b, c in P["examples"])}</div>
</div></section>

<section class="sec"><div class="wrap two">
  <div><h2 class="display">Perguntas <em>comuns</em>.</h2></div>
  <div class="faq">{''.join(f'<details><summary>{e(q)}<span class="pm" aria-hidden="true"></span></summary><p>{e(a)}</p></details>' for q, a in P["faq"])}</div>
</div></section>

<section class="sec band cta-sec"><div class="wrap cta-box">
  <h2 class="display">{e(P["cta"])}</h2>
  <p class="muted">Você conta o contexto e recebe por escrito o escopo, as entregas e o investimento antes de qualquer execução.</p>
  <div class="ctas"><a class="btn" href="index.html?formato={P["slug"]}#contato">Pedir proposta</a><a class="btn ghost" href="index.html#sites">Comparar formatos</a></div>
</div></section>

<section class="sec"><div class="wrap">
  <h2 class="label">Outros formatos</h2>
  <div class="others">{''.join(f'<a class="tile other" href="{Q["slug"]}.html" style="--fc:{Q["color"]}"><b>{e(Q["name"])}</b><span>{e(Q["lede"].split(".")[0])}.</span><i aria-hidden="true">→</i></a>' for Q in others)}</div>
</div></section>
</main>

{FOOTER}
</body>
</html>
'''

CSS = r'''@font-face{font-family:"Brandson";src:url(fonts/Brandson.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Alte Haas Grotesk";font-weight:400;src:url(fonts/AlteHaasGrotesk-Regular.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Alte Haas Grotesk";font-weight:700;src:url(fonts/AlteHaasGrotesk-Bold.woff2) format("woff2");font-display:swap}
@font-face{font-family:"Advercase";src:url(fonts/Advercase-Regular.woff2) format("woff2");font-display:swap}
/* the same palette and type as the main page; no build animation here */
:root{
  --navy-950:#060813;--navy-900:#0a0f23;--navy-800:#1d2031;--navy-700:#353542;--navy-500:#524f57;
  --cream-50:#fdf4ec;--cream-200:#fae4cf;--cream-300:#ddcaba;--cream-400:#b2a49b;
  --red-700:#7d1b2d;--red-600:#bb2233;--red-400:#d57375;--orange-700:#b3620d;--orange-500:#fb8603;--orange-300:#fab569;
  --bg:var(--navy-950);--bg2:var(--navy-900);--ink:var(--cream-200);--muted:var(--cream-400);
  --line:rgba(250,228,207,.12);--line-strong:rgba(250,228,207,.28);--surface:rgba(250,228,207,.035);--surface-hover:rgba(250,228,207,.07);
  --action:var(--red-600);--on-action:var(--cream-50);--accent:var(--orange-500);--ph1:var(--navy-800);--ph2:var(--navy-700);
  --font-display:"Brandson",Impact,"Arial Narrow",sans-serif;--font-heading:"Alte Haas Grotesk","Helvetica Neue",Helvetica,Arial,sans-serif;--font-body:"Advercase",Georgia,"Times New Roman",serif;
  --ease:cubic-bezier(.2,.8,.2,1);color-scheme:dark}
@media (prefers-color-scheme:light){:root{--bg:var(--cream-200);--bg2:var(--cream-50);--ink:var(--navy-900);--muted:var(--navy-500);
  --line:rgba(10,15,35,.12);--line-strong:rgba(10,15,35,.3);--surface:rgba(10,15,35,.035);--surface-hover:rgba(10,15,35,.07);--ph1:var(--cream-300);--ph2:var(--cream-400);color-scheme:light}}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font:400 18px/1.55 var(--font-body);overflow-x:hidden;-webkit-font-smoothing:antialiased}
a{color:inherit}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.skip{position:absolute;left:12px;top:-60px;z-index:50;padding:10px 14px;border-radius:8px;background:var(--accent);color:var(--navy-950);font:700 14px/1 var(--font-heading)}
.skip:focus{top:12px}
.wrap{width:100%;max-width:1240px;margin-inline:auto;padding-inline:max(16px,env(safe-area-inset-left,0px))}
@media (min-width:700px){.wrap{padding-inline:32px}}
.display{font-family:var(--font-display);font-weight:400;text-transform:uppercase;line-height:.92;letter-spacing:.01em;text-wrap:balance}
.display em{font-style:normal;color:var(--fc,var(--action))}
h3{font:700 20px/1.3 var(--font-heading);letter-spacing:-.01em}
.muted{color:var(--muted)}
.label,.kicker{font:700 12px/1.3 var(--font-heading);letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.kicker{color:var(--fc)}
p,li,dd{text-wrap:pretty}
.btn{display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:14px 26px;border-radius:99px;background:var(--action);color:var(--on-action);font:700 14px/1 var(--font-heading);letter-spacing:.06em;text-transform:uppercase;text-decoration:none;transition:background .2s}
.btn::after{content:"→";transition:transform .25s var(--ease)}
.btn:hover{background:var(--red-700)}.btn:hover::after{transform:translateX(4px)}
.btn.ghost{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 1px var(--line-strong)}
.btn.ghost:hover{background:var(--surface-hover)}
.btn.sm{min-height:42px;padding:10px 18px;font-size:12px}
.ctas{display:flex;flex-wrap:wrap;gap:12px}
.tile{background:var(--surface);border:1px solid var(--line);border-radius:18px}
.ic{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:12px;color:var(--fc);background:color-mix(in srgb,var(--fc) 14%,transparent)}
.ic svg{width:20px;height:20px}
.logo{display:block;width:88px;aspect-ratio:830/450;background:var(--ink);-webkit-mask:url(brand/lorz-logo.svg) center/contain no-repeat;mask:url(brand/lorz-logo.svg) center/contain no-repeat}

header.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 82%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;height:72px}
.nav ul{display:flex;gap:28px;list-style:none;font:400 14px/1 var(--font-heading)}
.nav ul a{text-decoration:none;color:var(--muted)}.nav ul a:hover{color:var(--ink)}

.hero{padding-block:40px 0}
.hero-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;align-items:center}
.crumbs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:28px;font:400 13px/1.4 var(--font-heading);color:var(--muted)}
.crumbs a{text-decoration:none}.crumbs a:hover{color:var(--ink);text-decoration:underline}
.crumbs [aria-current]{color:var(--ink)}
.hero h1{font-size:clamp(48px,7vw,104px);margin:14px 0 24px}
.lede{font-size:20px;max-width:52ch;color:var(--muted);margin-bottom:30px}
.art .browser{position:relative;border-radius:16px;background:var(--bg2);overflow:hidden;aspect-ratio:4/3;box-shadow:inset 0 0 0 1px var(--line),0 40px 80px -40px rgba(0,0,0,.6)}
.browser .bar{display:flex;gap:6px;align-items:center;height:30px;padding:0 14px;border-bottom:1px solid var(--line)}
.browser .bar i{width:9px;height:9px;border-radius:50%;background:var(--line-strong)}
.browser .pg{position:absolute;inset:30px 0 0;padding:18px;display:grid;gap:10px;align-content:start}
.blk{border-radius:5px;background:var(--surface-hover)}
.blk.ink{background:var(--line-strong)}.blk.red{background:var(--action)}.blk.orange{background:var(--accent)}
.pg-dash{grid-template-rows:auto 1fr auto;height:calc(100% - 30px)}
.pg-dash .kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pg-dash .kpis .blk{height:36px}
.pg-dash .bars{display:flex;align-items:flex-end;gap:8px;min-height:0;padding:10px;border-radius:6px;background:var(--surface-hover)}
.pg-dash .bars i{flex:1;border-radius:4px 4px 0 0;background:var(--accent)}.pg-dash .bars i.r{background:var(--action)}
.pg-dash .flow{display:flex;align-items:center;gap:6px}
.pg-dash .flow b{width:18px;height:18px;border-radius:5px;background:var(--line-strong)}.pg-dash .flow b.o{background:var(--accent)}.pg-dash .flow b.r{background:var(--action);border-radius:50%}
.pg-dash .flow span{flex:1;height:2px;background:repeating-linear-gradient(90deg,var(--line-strong) 0 5px,transparent 5px 10px)}
.facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;margin-top:64px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.facts div{padding:22px 24px 22px 0}
.facts div + div{padding-left:24px;border-left:1px solid var(--line)}
.facts dt{font:700 11px/1.3 var(--font-heading);letter-spacing:.14em;text-transform:uppercase;color:var(--fc)}
.facts dd{margin-top:6px;font:700 17px/1.35 var(--font-heading)}

.sec{padding-block:104px}
.band{background:var(--bg2)}
.sec h2.display{font-size:clamp(40px,5vw,72px)}
.two{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:64px;align-items:start}
.two > div:first-child p{margin-top:18px;max-width:40ch}
.head{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px;align-items:end;margin-bottom:48px}
.head p{max-width:46ch}
.fit h3{margin-bottom:14px}
.fit h3 + ul{margin-bottom:40px}
.checks,.alts{list-style:none;display:grid;gap:12px}
.checks li{position:relative;padding:14px 16px 14px 48px;border-radius:12px;background:var(--surface)}
.checks li::before{content:"";position:absolute;left:16px;top:17px;width:20px;height:20px;border-radius:50%;background:var(--fc)}
.checks li::after{content:"";position:absolute;left:22px;top:23px;width:8px;height:4px;border:2px solid var(--bg);border-top:0;border-right:0;rotate:-45deg}
.alts li{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;padding:14px 16px;border-radius:12px;box-shadow:inset 0 0 0 1px var(--line)}
.alts a{font:700 14px/1.2 var(--font-heading);color:var(--accent);text-decoration:none;white-space:nowrap}
.alts a:hover{text-decoration:underline}
.scope{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.scope li{display:grid;gap:12px;align-content:start;padding:24px}
.scope p{font-size:16px;color:var(--muted)}
.agreed{display:flex;gap:14px;align-items:flex-start;margin-top:24px;padding:18px 20px;border-radius:14px;border:1px dashed var(--line-strong);font-size:16px;color:var(--muted)}
.agreed b{color:var(--ink);font-family:var(--font-heading)}
.agreed .ic{width:34px;height:34px}

.wire{border-radius:16px;background:var(--bg2);box-shadow:inset 0 0 0 1px var(--line);overflow:hidden}
.wbar{display:flex;gap:6px;height:30px;align-items:center;padding:0 14px;border-bottom:1px solid var(--line)}.wbar i{width:9px;height:9px;border-radius:50%;background:var(--line-strong)}
.wire ol{list-style:none;display:grid;gap:10px;padding:16px}
.wire li{display:flex;gap:14px;align-items:flex-start;padding:16px;border-radius:10px;background:var(--surface-hover)}
.wire li:first-child{background:color-mix(in srgb,var(--fc) 22%,transparent)}
.wire li:last-child{background:color-mix(in srgb,var(--accent) 16%,transparent)}
.n{flex:none;display:grid;place-items:center;min-width:30px;height:30px;padding:0 6px;border-radius:8px;background:var(--bg);font:700 13px/1 var(--font-heading);color:var(--fc)}
.wire b,.tree b,.flow b{display:block;font:700 16px/1.3 var(--font-heading)}
.wire span:not(.n),.tree span,.flow li > span:not(.n){font-size:15px;color:var(--muted)}
.tree .root{padding:18px;border-radius:12px;background:color-mix(in srgb,var(--fc) 18%,transparent);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--fc) 50%,transparent)}
.tree ul{list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:12px;margin-top:28px;position:relative}
.tree ul::before{content:"";position:absolute;left:24px;right:24px;top:-15px;height:1px;background:var(--line-strong)}
.tree li{position:relative;padding:16px;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--line)}
.tree li::before{content:"";position:absolute;left:24px;top:-15px;width:1px;height:15px;background:var(--line-strong)}
.tree li.opt{box-shadow:inset 0 0 0 1px var(--line-strong);border:1px dashed transparent;background:transparent}
.flow{list-style:none;display:grid;gap:14px;counter-reset:f}
.flow li{position:relative;display:grid;grid-template-columns:auto 1fr;column-gap:14px;row-gap:2px;align-items:center;padding:18px;border-radius:12px;background:var(--surface);box-shadow:inset 0 0 0 1px var(--line)}
.flow li .n{grid-row:span 2}
.flow li + li::before{content:"";position:absolute;left:32px;top:-15px;width:2px;height:16px;background:repeating-linear-gradient(180deg,var(--fc) 0 4px,transparent 4px 7px)}
.flow li:last-child{background:color-mix(in srgb,var(--fc) 14%,transparent)}

.examples{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.ex{display:grid;gap:18px;align-content:start;padding:26px}
.ex dl{display:grid;gap:14px}
.ex dt{font:700 11px/1.3 var(--font-heading);letter-spacing:.14em;text-transform:uppercase;color:var(--fc)}
.ex dd{margin-top:4px;font-size:16px;color:var(--muted)}
.faq details{border-top:1px solid var(--line)}
.faq details:last-child{border-bottom:1px solid var(--line)}
.faq summary{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:22px 0;cursor:pointer;list-style:none;font:700 19px/1.3 var(--font-heading)}
.faq summary::-webkit-details-marker{display:none}
.pm{flex:none;position:relative;width:34px;height:34px;border-radius:50%;box-shadow:inset 0 0 0 1px var(--line-strong);transition:background .3s,box-shadow .3s}
.pm::before,.pm::after{content:"";position:absolute;left:50%;top:50%;width:12px;height:1.8px;margin:-.9px 0 0 -6px;background:currentColor;transition:transform .3s var(--ease)}
.pm::after{transform:rotate(90deg)}
details[open] .pm{background:var(--action);color:var(--on-action);box-shadow:none}
details[open] .pm::after{transform:rotate(180deg)}
.faq p{padding-bottom:22px;max-width:60ch;font-size:17px;color:var(--muted)}
.cta-box{display:grid;gap:22px;justify-items:start;max-width:900px}
.cta-box p{max-width:52ch}
.others{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px}
.other{position:relative;display:grid;gap:6px;padding:24px 64px 24px 24px;text-decoration:none;transition:border-color .25s,background .25s}
.other b{font:700 20px/1.2 var(--font-heading)}
.other span{font-size:16px;color:var(--muted)}
.other i{position:absolute;right:24px;top:50%;translate:0 -50%;width:34px;height:34px;display:grid;place-items:center;border-radius:50%;font-style:normal;color:var(--fc);background:color-mix(in srgb,var(--fc) 14%,transparent);transition:translate .3s var(--ease)}
.other:hover{border-color:var(--line-strong);background:var(--surface-hover)}
.other:hover i{translate:4px -50%}
footer.site{border-top:1px solid var(--line);padding-block:32px}
footer.site .wrap{display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap;font:400 14px/1.4 var(--font-heading);color:var(--muted)}
footer.site .logo{width:76px;background:var(--muted)}

/* skeleton: only while the fonts load on a first visit */
.sk main :is(h1,h2,h3,p,dd,dt,li > span,summary,.crumbs,b){color:transparent!important;border-radius:6px;-webkit-box-decoration-break:clone;box-decoration-break:clone;
  background:linear-gradient(90deg,var(--ph1) 0%,var(--ph2) 50%,var(--ph1) 100%) 0 0/200% 100%;animation:sk 1.2s linear infinite}
.sk main :is(h1,h2) em{color:transparent!important}
.sk main .pm,.sk main .checks li::before,.sk main .checks li::after{visibility:hidden}
@keyframes sk{to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.sk main *{animation:none!important}html{scroll-behavior:auto}}

@media (max-width:960px){
  .hero-grid,.two,.head{grid-template-columns:minmax(0,1fr)}
  .hero-grid{gap:40px}.art{order:-1;max-width:560px}
  .scope,.examples{grid-template-columns:minmax(0,1fr)}
  .two{gap:36px}.head{gap:18px}
  .sec{padding-block:80px}
}
@media (min-width:600px) and (max-width:960px){.scope,.examples{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:760px){.nav ul{display:none}}
@media (max-width:640px){
  .facts{grid-template-columns:minmax(0,1fr)}
  .facts div,.facts div + div{padding:16px 0;border-left:0}
  .facts div + div{border-top:1px solid var(--line)}
  .others{grid-template-columns:minmax(0,1fr)}
  .lede{font-size:18px}
  .nav .btn .long{display:none}
}
'''

def build():
    assets = OUT / 'assets'
    (assets / 'fonts').mkdir(parents=True, exist_ok=True); (assets / 'brand').mkdir(parents=True, exist_ok=True)
    for f in (SRC / 'fonts').glob('*.woff2'): shutil.copy(f, assets / 'fonts' / f.name)
    shutil.copy(SRC / 'brand' / 'lorz-logo.svg', assets / 'brand' / 'lorz-logo.svg')
    (assets / 'sub.css').write_text(CSS)
    for P in PAGES: (OUT / f'{P["slug"]}.html').write_text(page(P))
    import projetos_pages; done = projetos_pages.build()
    return [P['slug'] for P in PAGES] + done

if __name__ == '__main__':
    print('ok', build())
