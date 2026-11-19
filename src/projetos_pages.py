"""Páginas de projeto da seção "Principais projetos": conteúdo e layout.

Mesma base das subpáginas dos formatos (cabeçalho e rodapé da Lorz, src/css/sub.css, skeleton só enquanto as
fontes carregam). Saídas na raiz: projeto-<slug>.html. Imagens em assets/projetos/<pasta>/ (WebP).
Cada página mostra o projeto funcionando, a partir de demos/<pasta>/ (o Flat é preparado por src/demo_flat.py).
O texto do carrossel fica em src/js/projetos.js; aqui está a explicação completa, em linguagem de cliente.
"""
from layout import FOOTER, OUT, e, header, icon, subpage, write

PROJECTS = [
  dict(
    slug='flat-jardim-serrano', dir='flat', name='Flat Jardim Serrano', color='var(--accent)',
    category='Site completo para hospedagem',
    title='Flat Jardim <em>Serrano</em>.',
    lede='Site de uma hospedagem com sete flats para casais em Serra Negra (SP). Ajuda o hóspede a escolher o flat certo e manda o pedido de reserva pronto para o WhatsApp da casa.',
    note='',
    hero=('home', 'Página inicial do Flat Jardim Serrano no tema escuro, com o título “A serra, a dois.”',
          'celular', 'A mesma página no celular, com o botão de reserva fixo'),
    demo_note='É o site completo: navegue pelos flats, use o seletor e abra o formulário de datas. O envio abre o WhatsApp da casa.',
    fits=['Você recebe reservas ou agendamentos pelo WhatsApp e quer que o pedido já chegue completo.',
          'Você tem opções diferentes entre si (quartos, unidades, pacotes) e o cliente precisa comparar antes de escolher.',
          'As fotos do lugar são o seu melhor argumento.'],
    nots=[('Você precisa de reserva com calendário e pagamento automáticos.', 'solucoes-personalizadas', 'Soluções Personalizadas'),
          ('Você tem uma única oferta para divulgar numa campanha.', 'landing-page', 'Landing Page')],
    features=[
      dict(img='seletor', alt='Lista dos flats com o seletor “O que não pode faltar?” e os filtros de comodidades',
           title='Escolha pelo que importa',
           text='O hóspede marca o que não pode faltar, como varanda, vista ou cozinha, e o site mostra só os flats que têm tudo. Ele chama já sabendo o que quer, e a casa responde menos perguntas repetidas.'),
      dict(img='pagina', alt='Página do Flat 6 no tema claro, com título, resumo e galeria de fotos',
           title='Uma página para cada flat',
           text='Cada flat tem fotos, o que está incluso e as regras da casa. Quando entra um flat novo, basta adicionar as fotos e as informações: ele aparece no seletor, na comparação e no rodapé.'),
      dict(img='home', phone='celular', alt='Página inicial com o botão Consultar datas; no celular, o botão de reserva fixo',
           title='Pedido de reserva pronto',
           text='O hóspede escolhe as datas e o número de pessoas, e o site abre o WhatsApp com a mensagem escrita e as noites contadas. No celular, o botão de reserva fica sempre à mão.'),
      dict(img='claro', alt='Página inicial no tema claro',
           title='Claro ou escuro',
           text='O site segue o modo do celular ou do computador de quem visita, e a pessoa pode trocar quando quiser.'),
    ],
    extras=[('i-devices', 'Feito para o celular', 'A maior parte dos hóspedes chega pelo celular, então tudo foi pensado primeiro para a tela pequena.'),
            ('i-search', 'Pronto para o Google', 'Cada página tem título e descrição próprios, e o Google entende que o site é de uma hospedagem.'),
            ('i-chart', 'Você sabe o que funciona', 'Dá para medir quantas pessoas abriram o formulário de datas e quantas enviaram o pedido.'),
            ('i-database', 'Fácil de atualizar', 'Fotos, textos e regras ficam separados do visual. Mudar uma informação não mexe no resto do site.'),
            ('i-users', 'Para todo mundo', 'Funciona com teclado e com leitores de tela, e as animações respeitam quem prefere menos movimento.')],
    cta='Quer um site que leve o cliente direto para a conversa?'),
  dict(
    slug='brasa', dir='brasa', name='Brasa', color='var(--action)',
    category='Site com pedido online para hamburgueria',
    title='<em>Brasa</em>.',
    lede='Site de uma hamburgueria com cardápio, história da casa e pedido online. O cliente monta o pedido, escolhe entrega ou retirada e paga com Pix, cartão ou dinheiro, sem sair do site.',
    note='Projeto conceitual: a Brasa não é um cliente real. Na versão de teste, nenhum pedido é enviado e nada é cobrado.',
    hero=('hero', 'Abertura da Brasa com o hambúrguer em 3D separado em camadas, cada uma com o nome do ingrediente',
          'celular', 'Escolha da forma de pagamento no celular'),
    demo_note='Monte um pedido de verdade: escolha lanches, informe a entrega e veja o Pix sendo gerado. Nada é enviado nem cobrado.',
    fits=['Você vende comida, produtos ou encomendas e hoje recebe os pedidos por mensagem ou telefone.',
          'Você quer que o pedido chegue organizado: itens, endereço, forma de pagamento e troco.',
          'Você quer uma vitrine marcante, que faça o cliente parar e olhar.'],
    nots=[('O pedido precisa entrar no seu sistema de caixa, estoque ou entregas.', 'solucoes-personalizadas', 'Soluções Personalizadas'),
          ('Você só quer mostrar o cardápio e receber pedidos pelo WhatsApp.', 'landing-page', 'Landing Page')],
    features=[
      dict(img='hero', alt='O hambúrguer em 3D desmontado em pão, carne, queijo e tomate, com o nome de cada camada',
           title='Um lanche para girar',
           text='Na abertura, o hambúrguer aparece em 3D. O cliente gira com o dedo ou com o mouse e, ao descer a página, vê cada camada separada, com o nome do ingrediente.'),
      dict(img='sacola', alt='Sacola com um lanche, quantidade, recado para a cozinha e total',
           title='Sacola que não some',
           text='O cliente escolhe a quantidade e deixa um recado para a cozinha. Se fechar a página sem querer, a sacola continua lá quando ele voltar.'),
      dict(img='entrega', alt='Etapa de entrega com avisos nos campos de nome e telefone',
           title='Entrega ou retirada',
           text='Retirada no balcão sem taxa ou entrega em casa com taxa. Se faltar um dado, como o telefone ou o CEP, o site avisa no próprio campo antes de seguir.'),
      dict(img='pix', phone='celular', alt='Tela do Pix com o número do pedido e o código para copiar; no celular, a escolha da forma de pagamento',
           title='Pagamento do jeito do cliente',
           text='Pix com código para copiar e colar no aplicativo do banco, cartão na maquininha na entrega ou dinheiro com troco. No Pix, o valor e o número do pedido já vão no código.'),
    ],
    extras=[('i-plug', 'Pronto para vender de verdade', 'Para começar a receber, basta ligar o pedido à forma de pagamento da casa. O caminho já está descrito passo a passo.'),
            ('i-devices', 'Testado no celular', 'Cada etapa do pedido foi conferida no celular e no computador.'),
            ('i-loop', 'Leve, mesmo com 3D', 'O lanche em 3D só se mexe quando aparece na tela, para não pesar no celular.'),
            ('i-users', 'Para todo mundo', 'Dá para girar o lanche pelo teclado, os avisos dos campos são lidos por leitores de tela e quem prefere menos movimento vê uma versão mais calma.')],
    cta='Quer receber pedidos pelo seu próprio site?'),
  dict(
    slug='isadora-guirelli', dir='isa', name='Isadora Guirelli', color='var(--red-400)',
    category='Landing page para saúde capilar',
    title='Isadora <em>Guirelli</em>.',
    lede='Site de uma especialista em saúde capilar em Serra Negra (SP). Explica com calma os sinais de queda e afinamento dos fios e leva a pessoa até uma conversa pelo WhatsApp.',
    note='',
    hero=('home', 'Página inicial com o título “Saúde capilar” e a foto de Isadora no consultório',
          'celular', 'A página inicial no celular'),
    demo_note='Navegue pelas páginas de sinais, cuidados e atendimento. No modo celular, desça a página para ver o botão de WhatsApp.',
    fits=['Seu cliente chega com dúvidas e precisa entender o assunto antes de marcar.',
          'Você atende por indicação e quer um lugar para mandar quem pergunta “como funciona?”.',
          'Você quer explicar o seu trabalho sem prometer resultados.'],
    nots=[('Você precisa de agenda online, com horários e confirmação automáticos.', 'solucoes-personalizadas', 'Soluções Personalizadas'),
          ('Você oferece muitos serviços diferentes, cada um para um público.', 'site-completo', 'Site Completo')],
    features=[
      dict(img='home', alt='Abertura com o título, para quem é o atendimento e os botões de WhatsApp e da abordagem',
           title='Começo direto',
           text='Logo na primeira tela, a pessoa entende o que é o atendimento e já pode chamar no WhatsApp ou conhecer como ele funciona.'),
      dict(img='procura', alt='Os quatro atalhos: Sinais de atenção, Cuidados, Como funciona e Contato',
           title='Cada um no seu caminho',
           text='Quatro atalhos levam a quem quer entender os sinais, cuidar da rotina, saber como é o atendimento ou falar direto.'),
      dict(img='sinais', alt='Página “O que mudou?”, sobre os sinais nos fios',
           title='Explicações sem pressa',
           text='Páginas curtas sobre o que observar nos fios e quando procurar um dermatologista. A pessoa chega à conversa mais tranquila e com as dúvidas mais claras.'),
      dict(phone='caminhos', alt='No celular, os atalhos da página inicial com o botão de WhatsApp fixo embaixo',
           title='WhatsApp sempre perto',
           text='No celular, um botão de WhatsApp acompanha a leitura. Quando já existe outro botão de contato na tela, ele sai do caminho para não atrapalhar.'),
    ],
    extras=[('i-devices', 'Feito para o celular', 'Ajustado para telas pequenas e grandes, com o contato sempre a um toque.'),
            ('i-search', 'Encontrada na cidade', 'Cada página tem título e descrição próprios, e o Google entende que é um atendimento de saúde em Serra Negra.'),
            ('i-blocks', 'Simples de manter no ar', 'São arquivos leves que funcionam em qualquer hospedagem, sem depender de plataforma.'),
            ('i-users', 'Para todo mundo', 'Funciona com teclado e com leitores de tela, e o menu do celular abre e fecha de um jeito previsível.')],
    cta='Quer um site que explique antes de vender?'),
  dict(
    slug='belisca', dir='belisca', name='Belisca!', color='var(--accent)',
    category='Loja virtual para marcas de snacks',
    title='<em>Belisca!</em>',
    lede='Loja virtual de uma mercearia de snacks com doze produtos de marcas independentes. O cliente busca, filtra, monta o carrinho, aplica cupom e segue pelo checkout até a revisão do pedido.',
    note='Projeto conceitual: a Belisca e as marcas são fictícias. O checkout é demonstrativo e termina antes de qualquer pagamento ou coleta de dados.',
    hero=('home', 'Página inicial da Belisca com o destaque “Crocância de verdade” e três embalagens de salgados',
          'celular', 'A página inicial no celular'),
    demo_note='Navegue pelo catálogo, abra um produto e monte um carrinho. Os cupons de teste aparecem no carrinho e no rodapé. Nada é cobrado nem enviado.',
    fits=['Você vende produtos com fotos e preços e quer uma vitrine própria, fora dos marketplaces.',
          'Seu catálogo cresceu e o cliente precisa de busca e filtros para achar o que quer.',
          'Você trabalha com cupons, ofertas com prazo e frete grátis a partir de um valor.'],
    nots=[('Você tem poucos produtos e fecha a venda pelo WhatsApp.', 'landing-page', 'Landing Page'),
          ('A loja precisa conversar com estoque, nota fiscal ou sistema de gestão.', 'solucoes-personalizadas', 'Soluções Personalizadas')],
    features=[
      dict(img='catalogo', alt='Catálogo com o título “Toda a prateleira” e as seis categorias de snacks',
           title='Prateleira organizada',
           text='O catálogo tem filtros por categoria, marca, preço e tipo, e a busca fica no topo de todas as páginas. Quem chega sabendo o que quer encontra em poucos toques.'),
      dict(img='produto', alt='Página da Pipoca Gourmet Chocolate Belga, com foto da embalagem, preço com desconto e botão de adicionar ao carrinho',
           title='Página que vende o produto',
           text='Cada produto tem galeria de fotos, preço com o desconto à vista, selos, ingredientes e tabela nutricional. O botão de compra fica junto da quantidade e do total.'),
      dict(img='carrinho', phone='celular-carrinho', alt='Carrinho com dois produtos, campo de cupom e a barra de quanto falta para o frete grátis; no celular, o mesmo carrinho',
           title='Carrinho que ajuda a fechar',
           text='O carrinho fica guardado se a pessoa sair e voltar. Ele aceita cupom, mostra a economia das ofertas e avisa quanto falta para o frete grátis.'),
      dict(img='checkout', alt='Primeira etapa do checkout, com a escolha de um perfil fictício e o resumo do pedido ao lado',
           title='Checkout em etapas',
           text='Identificação, entrega, frete e revisão, uma etapa por vez, com o resumo do pedido sempre à vista. Na demonstração, perfis e endereços são fictícios e o fluxo para antes do pagamento.'),
    ],
    extras=[('i-plug', 'Pronto para vender de verdade', 'Para receber pedidos reais, falta ligar o checkout ao meio de pagamento e ao cálculo de frete da loja.'),
            ('i-devices', 'Feito para o celular', 'Menu, busca, carrinho e checkout foram pensados primeiro para a tela pequena.'),
            ('i-database', 'Catálogo num lugar só', 'Produtos, preços, categorias e destaques ficam separados do visual. Entrar um produto novo não mexe no resto da loja.'),
            ('i-loop', 'Movimento na medida', 'As animações dão ritmo à vitrine e se desligam para quem prefere menos movimento.')],
    cta='Quer uma loja com a cara da sua marca?'),
  dict(
    slug='helios-44-2', dir='helios', name='Helios 44-2', color='var(--red-400)',
    category='Página de produto em 3D',
    title='Helios <em>44-2</em>.',
    lede='Página que apresenta uma objetiva fotográfica clássica por dentro. Conforme a pessoa rola, o modelo 3D se desmonta peça por peça, e cada parte ganha nome e explicação.',
    note='Projeto conceitual: um estudo de apresentação de produto, sem cliente e sem venda.',
    hero=('home', 'Abertura da página, com a lente Helios 44-2 em 3D ao centro e o título dividido dos dois lados',
          'celular', 'A abertura da página no celular'),
    demo_note='Role a página dentro do quadro para abrir a lente. São nove capítulos, da história à vista de todas as peças em linha. O modelo 3D leva alguns segundos para carregar.',
    fits=['Seu produto tem engenharia, materiais ou detalhes que uma foto não mostra.',
          'Você quer que o cliente entenda como o produto funciona antes de falar em preço.',
          'Você precisa de uma página de lançamento que as pessoas tenham vontade de mostrar para alguém.'],
    nots=[('Você tem muitos produtos e precisa de catálogo e carrinho.', 'site-completo', 'Site Completo'),
          ('Você precisa de uma página simples para uma campanha com prazo curto.', 'landing-page', 'Landing Page')],
    features=[
      dict(img='origem', alt='Capítulo “Herdeira do Biotar”, com a lente em 3D ao centro e a ficha técnica ao lado',
           title='História e ficha técnica',
           text='A página começa pelo contexto: de onde vem o produto e os números que importam, numa ficha fácil de consultar.'),
      dict(img='optica', alt='A lente aberta em anéis, com os componentes numerados e a explicação dos grupos ópticos',
           title='O produto se abre na rolagem',
           text='Ao descer a página, o modelo 3D se separa em partes. Cada peça recebe um número, um nome e uma frase sobre o que faz.'),
      dict(img='diafragma', alt='Capítulo do diafragma, com a lente desmontada e a abertura f/2.0 em destaque',
           title='Mostra como funciona',
           text='No capítulo do diafragma, a página mostra as oito lâminas e a escala de abertura, de f/2 a f/16. A pessoa entende o que cada controle faz sem abrir um manual.'),
      dict(img='anatomia', phone='celular', alt='Todas as peças da lente alinhadas, sob o título “73 peças. Uma lente.”; no celular, a abertura da página',
           title='Do computador ao celular',
           text='O mesmo modelo 3D roda no celular, com textos e números reorganizados para a tela estreita.'),
    ],
    extras=[('i-loop', 'Leve para um 3D', 'O modelo foi comprimido para pouco mais de 3 MB, e a página mostra o progresso enquanto ele carrega.'),
            ('i-devices', 'Conferida em várias telas', 'O layout foi testado do celular ao monitor grande.'),
            ('i-search', 'Texto de verdade', 'Todo o conteúdo é texto na página, não imagem: os buscadores leem e a pessoa pode copiar.'),
            ('i-blocks', 'Serve para outros produtos', 'A mesma estrutura de capítulos funciona para qualquer produto que possa ser modelado em 3D.')],
    cta='Quer mostrar o seu produto por dentro?'),
]

def img(P, name, alt='', lazy=True):
    load = ' loading="lazy"' if lazy else ''   # the two captures at the top of the page load right away
    return f'<img src="assets/projetos/{P["dir"]}/{name}.webp" alt="{e(alt)}"{load} decoding="async">'

def shot(P, name, alt, lazy=True):
    return f'<div class="shot"><div class="bar" aria-hidden="true"><i></i><i></i><i></i></div>{img(P, name, alt, lazy)}</div>'

def phone(P, name, alt='', lazy=True):
    return f'<div class="phone">{img(P, name, alt, lazy)}</div>'

def media(P, f):
    if 'img' not in f: return f'<div class="feat-media solo">{phone(P, f["phone"], f["alt"])}</div>'
    return f'<div class="feat-media{" with-phone" if f.get("phone") else ""}">{shot(P, f["img"], f["alt"])}{phone(P, f["phone"]) if f.get("phone") else ""}</div>'

# the live project: the real site in a frame, with a computer/phone switch (the frame never animates its size)
DEMO_JS = '''<script>(function(){var w=document.querySelector('.demo');if(!w)return;var f=w.querySelector('.demo-frame');
w.querySelectorAll('[data-size]').forEach(function(b){b.addEventListener('click',function(){
  w.querySelectorAll('[data-size]').forEach(function(o){o.setAttribute('aria-pressed',String(o===b));});
  f.classList.toggle('m',b.dataset.size==='m');});});})();</script>'''

def page(P):
    others = [Q for Q in PROJECTS if Q is not P]
    h, ha, ph, pha = P['hero']
    cta = 'index.html#contato'
    demo = f'demos/{P["dir"]}/index.html'
    feats = ''.join(f'<article class="feat">{media(P, f)}<div class="feat-text"><h3>{e(f["title"])}</h3><p>{e(f["text"])}</p></div></article>'
                    for f in P['features'])
    body = f'''{header(cta, 'Projetos')}

<main id="conteudo">
<section class="hero"><div class="wrap hero-grid">
  <div>
    <nav class="crumbs" aria-label="Você está em"><a href="index.html">Início</a><span aria-hidden="true">/</span><a href="index.html#projetos">Projetos</a><span aria-hidden="true">/</span><span aria-current="page">{e(P["name"])}</span></nav>
    <h1 class="display">{P["title"]}</h1>
    <p class="lede">{e(P["lede"])}</p>
    {f'<p class="note">{e(P["note"])}</p>' if P["note"] else ''}
    <div class="ctas"><a class="btn" href="#teste">Testar o site</a><a class="btn ghost" href="{cta}">Quero um projeto assim</a></div>
  </div>
  <div class="art pr-art">{shot(P, h, ha, lazy=False)}{phone(P, ph, pha, lazy=False)}</div>
</div></section>

<section class="sec band demo" id="teste"><div class="wrap">
  <div class="head"><h2 class="display">Teste o <em>site</em>.</h2><p class="muted">{e(P["demo_note"])}</p></div>
  <div class="demo-bar">
    <div class="demo-size" role="group" aria-label="Tamanho da tela"><button type="button" data-size="d" aria-pressed="true">Computador</button><button type="button" data-size="m" aria-pressed="false">Celular</button></div>
    <a class="demo-open" href="{demo}" target="_blank" rel="noopener">Abrir em tela cheia<span aria-hidden="true"> ↗</span><span class="sr"> (abre em nova aba)</span></a>
  </div>
  <div class="demo-frame"><div class="bar" aria-hidden="true"><i></i><i></i><i></i></div><iframe src="{demo}" title="{e(P["name"])}: o site funcionando" loading="lazy" allow="clipboard-write"></iframe></div>
</div></section>

<section class="sec"><div class="wrap two">
  <div><h2 class="display">Serve para o seu <em>negócio</em>?</h2><p class="muted">Um jeito rápido de saber se um projeto assim faz sentido para você.</p></div>
  <div class="fit">
    <h3>Faz sentido quando</h3>
    <ul class="checks">{''.join(f'<li>{e(t)}</li>' for t in P["fits"])}</ul>
    <h3>Outro formato pode servir melhor quando</h3>
    <ul class="alts">{''.join(f'<li><span>{e(t)}</span><a href="{s}.html">{e(n)} <span aria-hidden="true">→</span></a></li>' for t, s, n in P["nots"])}</ul>
  </div>
</div></section>

<section class="sec band"><div class="wrap">
  <div class="head"><h2 class="display">O que o site <em>faz</em>.</h2><p class="muted">As partes que mais ajudam o cliente a decidir, e o que cada uma resolve.</p></div>
  <div class="feats">{feats}</div>
</div></section>

<section class="sec"><div class="wrap">
  <div class="head"><h2 class="display">O que vem <em>junto</em>.</h2><p class="muted">Cuidados que não aparecem à primeira vista, mas fazem diferença no dia a dia.</p></div>
  <ul class="scope">{''.join(f'<li class="tile">{icon(i)}<h3>{e(t)}</h3><p>{e(d)}</p></li>' for i, t, d in P["extras"])}</ul>
</div></section>

<section class="sec band cta-sec"><div class="wrap cta-box">
  <h2 class="display">{e(P["cta"])}</h2>
  <p class="muted">Você conta o contexto e recebe por escrito o escopo, as entregas e o investimento antes de qualquer execução.</p>
  <div class="ctas"><a class="btn" href="{cta}">Pedir proposta</a><a class="btn ghost" href="index.html#projetos">Ver todos os projetos</a></div>
</div></section>

<section class="sec"><div class="wrap">
  <h2 class="display others-title">Outros <em>projetos</em>.</h2>
  <div class="others">{''.join(f'<a class="tile other" href="projeto-{Q["slug"]}.html" style="--fc:{Q["color"]}"><b>{e(Q["name"])}</b><span>{e(Q["category"])}</span><i aria-hidden="true">→</i></a>' for Q in others)}</div>
</div></section>
</main>

{FOOTER}
{DEMO_JS}
'''
    return subpage(f'{P["name"]} · Projetos · Lorz', P['lede'], body, f' class="pr" style="--fc:{P["color"]}"', frames=True)

def build():
    for P in PROJECTS: write(OUT / f'projeto-{P["slug"]}.html', page(P))
    return ['projeto-' + P['slug'] for P in PROJECTS]
