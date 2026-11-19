"""Subpáginas dos formatos (Landing Page, Site Completo, Soluções Personalizadas): conteúdo e layout.

Sem a construção animada da página principal: só um skeleton enquanto as fontes carregam.
Saídas na raiz: landing-page.html, site-completo.html, solucoes-personalizadas.html. O CSS fica em src/css/sub.css.
"""
import re
from layout import FOOTER, MORE_JS, OUT, e, header, icon, more, read, subpage, write

def mock(n):
    """the browser drawing of the n-th format card on the main page"""
    arts = re.findall(r'<article class="tile format".*?</article>', read('index.html'), re.S)
    return re.search(r'<div class="browser" aria-hidden="true">.*?</div>\s*</div>(?=\s*<h3>)', arts[n], re.S).group(0)

PAGES = [
  dict(
    slug='landing-page', idx=0, color='var(--action)', name='Landing Page',
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
    slug='site-completo', idx=1, color='var(--accent)', name='Site Completo',
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
    slug='solucoes-personalizadas', idx=2, color='var(--red-400)', name='Soluções Personalizadas',
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

# Progressive disclosure (layout.more): the compact version of a card keeps the essentials; the rest opens in a dropdown.
def scope_card(n, i, t, d):
    return f'<li class="tile">{icon(i)}<h3>{e(t)}</h3><p>{e(d)}</p>{more(e(t), f"<p>{e(d)}</p>")}</li>'

def example_card(n, heads, t, *vals):
    rows = [f'<div><dt>{h}</dt><dd>{e(v)}</dd></div>' for h, v in zip(heads, vals)]
    # the compact card keeps the first row; the dropdown brings the others
    return f'<article class="tile ex"><h3>{e(t)}</h3><dl>{"".join(rows)}</dl>{more(e(t), "<dl>" + "".join(rows[1:]) + "</dl>")}</article>'

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
    body = f'''{header('index.html?formato=' + P['slug'] + '#contato')}

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
  <ul class="scope">{''.join(scope_card(n, *s) for n, s in enumerate(P["scope"], 1))}</ul>
  <p class="agreed">{icon("i-article")}<span><b>Definido na proposta.</b> {e(P["agreed"])}</span></p>
</div></section>

<section class="sec"><div class="wrap two map">
  <div><h2 class="display">{e(P["map_title"])}.</h2><p class="muted">{e(P["map_note"])}</p></div>
  {visual}
</div></section>

<section class="sec band"><div class="wrap">
  <div class="head"><h2 class="display">Exemplos de <em>uso</em>.</h2><p class="muted">Situações ilustrativas, para mostrar como o formato se adapta a negócios diferentes.</p></div>
  <div class="examples">{''.join(example_card(n, ex_heads, *x) for n, x in enumerate(P["examples"], 1))}</div>
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
{MORE_JS}
'''
    return subpage(f'{P["name"]} · Lorz', P['lede'], body, f' style="--fc:{P["color"]}"')

def build():
    for P in PAGES: write(OUT / f'{P["slug"]}.html', page(P))
    return [P['slug'] for P in PAGES]
