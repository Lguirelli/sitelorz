// A altura real do cabeçalho define quanto sobra para a hero na primeira tela.
const topo = document.querySelector('.topo');
function medirTopo() {
  document.documentElement.style.setProperty('--header-height', topo.getBoundingClientRect().height + 'px');
}
new ResizeObserver(medirTopo).observe(topo);
medirTopo();

const produtos = [
  { nome: 'Clássico da Brasa', tipo: 'Carne', preco: 29, foto: 0,
    itens: 'Carne na chapa, queijo, tomate grosso e molho da casa',
    texto: 'Carne na chapa, queijo que amolece nas bordas e tomate cortado grosso no pão tostado. Foi o primeiro lanche que saiu da garagem.' },
  { nome: 'Duplo da Chapa', tipo: 'Carne', preco: 36, foto: 1,
    itens: 'Duas carnes, queijo e picles',
    texto: 'Duas carnes, queijo e picles. Para quem quer mais crosta de chapa em cada mordida.' },
  { nome: 'Crocante de Frango', tipo: 'Frango', preco: 32, foto: 2,
    itens: 'Frango empanado e salada de repolho',
    texto: 'Frango empanado com salada de repolho. A mordida estala antes de chegar ao molho.' },
  { nome: 'Bosque na Brasa', tipo: 'Vegetal', preco: 34, foto: 3,
    itens: 'Cogumelos dourados, folhas e molho da casa',
    texto: 'Cogumelos dourados na chapa, folhas e molho da casa. A opção sem carne do balcão.' }
];

const $ = s => document.querySelector(s);
const dialog = $('dialog');
const reais = v => 'R$ ' + v.toLocaleString('pt-BR');
const reaisCompleto = v => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function el(tag, attrs = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === 'class') n.className = v; else if (k.startsWith('on')) n[k] = v; else n.setAttribute(k, v);
  }
  n.append(...filhos);
  return n;
}

function abrir(titulo, conteudo) {
  $('#title').textContent = titulo;
  $('#body').replaceChildren(conteudo);
  dialog.showModal();
}

function mostrarProduto(i) {
  const p = produtos[i];
  const painel = el('div', { class: 'painel' },
    el('p', {}, p.texto),
    el('p', { class: 'painel-preco' }, el('span', { class: 'etiqueta' }, reais(p.preco)), el('span', {}, p.tipo)),
    el('button', { class: 'botao botao-tomate', type: 'button', onclick: () => window.Pedido.adicionar(i) }, 'Adicionar à sacola'));
  abrir(p.nome, painel);
}

const mais = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="3"/></svg>';

function item(i) {
  const p = produtos[i];
  const b = el('button', { class: 'item', type: 'button', 'aria-label': p.nome + ', ' + reaisCompleto(p.preco) + '. Ver detalhes e adicionar à sacola', onclick: () => mostrarProduto(i) });
  b.innerHTML = '<span class="item-tipo">' + p.tipo + '</span>'
    + '<img src="assets/' + p.foto + '.webp" alt="" width="418" height="418" loading="lazy">'
    + '<span class="item-nome">' + p.nome + '</span>'
    + '<span class="item-itens">' + p.itens + '</span>'
    + '<span class="etiqueta item-preco">' + reais(p.preco) + '</span>'
    + '<span class="item-mais">' + mais + '</span>';
  return b;
}

const lista = $('#menuTrack');
const tipos = ['Todos', 'Carne', 'Frango', 'Vegetal'];
for (const tipo of tipos) {
  const b = el('button', { type: 'button', 'aria-pressed': 'false', onclick: () => {
    for (const f of $('#filters').children) f.setAttribute('aria-pressed', String(f === b));
    lista.replaceChildren(...produtos.map((_, i) => i).filter(i => tipo === 'Todos' || produtos[i].tipo === tipo).map(item));
  } }, tipo);
  $('#filters').append(b);
}
$('#filters button').click();

$('#close').onclick = () => dialog.close();
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

window.Brasa = { produtos, el, reaisCompleto };

const form = $('#clube form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const campo = $('#email');
  const aviso = $('#notice');
  if (!campo.value.trim()) {
    aviso.textContent = 'Escreva seu e-mail para participar.';
    aviso.dataset.tipo = 'erro'; campo.setAttribute('aria-invalid', 'true'); campo.focus(); return;
  }
  if (!campo.checkValidity()) {
    aviso.textContent = 'Confira o e-mail. Ele precisa ter um @ e um domínio, como voce@exemplo.com.';
    aviso.dataset.tipo = 'erro'; campo.setAttribute('aria-invalid', 'true'); campo.focus(); return;
  }
  campo.removeAttribute('aria-invalid');
  aviso.dataset.tipo = 'ok';
  aviso.textContent = 'Pronto. Cadastro demonstrativo concluído, nenhum e-mail foi enviado.';
  form.reset();
});
