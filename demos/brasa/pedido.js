// Pedido da Brasa: sacola, entrega, pagamento, revisão e confirmação.
// Tudo roda no navegador. No modo de demonstração nada é cobrado nem enviado.
// Para vender de verdade, troque CONFIG.provedor por um provedor real (veja `provedores` abaixo).
(() => {
  'use strict';

  const CONFIG = {
    modoDemonstracao: true,
    provedor: 'demonstracao',
    // Valores de exemplo: confirme com a casa antes de publicar.
    taxaEntrega: 6,
    pedidoMinimo: 0,
    // Pix: preencha com a chave real da casa. Vazio = código de demonstração, que nenhum banco aceita.
    chavePix: '',
    recebedorPix: 'BRASA',
    cidadePix: 'CIDADE',
    chaveArmazenamento: 'brasa-pedido-v1'
  };

  const { produtos, el, reaisCompleto } = window.Brasa;
  const dialog = document.querySelector('dialog');
  const titulo = document.querySelector('#title');
  const corpo = document.querySelector('#body');
  const botaoSacola = document.querySelector('#bag');

  // ---------- Estado e armazenamento ----------
  const vazio = () => ({
    itens: {},
    entrega: { modo: 'retirada', nome: '', telefone: '', cep: '', rua: '', numero: '', complemento: '', bairro: '' },
    pagamento: { metodo: 'pix', cartao: 'credito', trocoPara: '' },
    observacao: ''
  });
  let estado = vazio();
  let ultimoPedido = null;

  function salvar() {
    try { localStorage.setItem(CONFIG.chaveArmazenamento, JSON.stringify({ estado, ultimoPedido })); } catch {}
  }
  function carregar() {
    try {
      const dados = JSON.parse(localStorage.getItem(CONFIG.chaveArmazenamento) || 'null');
      if (dados && dados.estado) {
        estado = { ...vazio(), ...dados.estado, entrega: { ...vazio().entrega, ...dados.estado.entrega }, pagamento: { ...vazio().pagamento, ...dados.estado.pagamento } };
        for (const id of Object.keys(estado.itens)) if (!produtos[id] || !(estado.itens[id] > 0)) delete estado.itens[id];
        ultimoPedido = dados.ultimoPedido || null;
      }
    } catch {}
  }

  // ---------- Contas ----------
  const centavos = v => Math.round(v * 100);
  const quantidadeTotal = () => Object.values(estado.itens).reduce((s, q) => s + q, 0);
  const subtotal = () => Object.entries(estado.itens).reduce((s, [id, q]) => s + centavos(produtos[id].preco) * q, 0) / 100;
  const taxa = () => (estado.entrega.modo === 'entrega' && quantidadeTotal() ? CONFIG.taxaEntrega : 0);
  const total = () => (centavos(subtotal()) + centavos(taxa())) / 100;

  function adicionar(id, qtd = 1) {
    estado.itens[id] = Math.min(20, (estado.itens[id] || 0) + qtd);
    if (estado.itens[id] <= 0) delete estado.itens[id];
    salvar(); atualizarBotao();
  }
  function definir(id, qtd) {
    if (qtd <= 0) delete estado.itens[id]; else estado.itens[id] = Math.min(20, qtd);
    salvar(); atualizarBotao();
  }
  function atualizarBotao() {
    const n = quantidadeTotal();
    botaoSacola.querySelector('b').textContent = n;
    botaoSacola.setAttribute('aria-label', 'Abrir sacola, ' + n + (n === 1 ? ' item' : ' itens'));
  }

  // ---------- Formatação e validação ----------
  const so = (v, re) => v.replace(re, '');
  function mascaraTelefone(v) {
    const d = so(v, /\D/g).slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  const mascaraCep = v => { const d = so(v, /\D/g).slice(0, 8); return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; };
  const lerValor = v => { const n = parseFloat(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return Number.isFinite(n) ? n : NaN; };

  function validarEntrega(e) {
    const erros = {};
    if (e.nome.trim().length < 2) erros.nome = 'Escreva o nome de quem vai receber o pedido.';
    const tel = so(e.telefone, /\D/g);
    if (tel.length < 10 || tel.length > 11) erros.telefone = 'Use DDD e número, por exemplo (11) 91234-5678.';
    if (e.modo === 'entrega') {
      if (so(e.cep, /\D/g).length !== 8) erros.cep = 'O CEP tem 8 números, como 01310-100.';
      if (e.rua.trim().length < 3) erros.rua = 'Escreva a rua ou avenida.';
      if (!e.numero.trim()) erros.numero = 'Escreva o número. Sem número, use "s/n".';
      if (e.bairro.trim().length < 2) erros.bairro = 'Escreva o bairro.';
    }
    return erros;
  }
  function validarPagamento(p) {
    const erros = {};
    if (!['pix', 'cartao', 'dinheiro'].includes(p.metodo)) erros.metodo = 'Escolha uma forma de pagamento.';
    if (p.metodo === 'dinheiro' && p.trocoPara.trim()) {
      const v = lerValor(p.trocoPara);
      if (!Number.isFinite(v)) erros.trocoPara = 'Escreva só o valor, por exemplo 50 ou 100.';
      else if (v < total()) erros.trocoPara = `O valor precisa ser maior que o total de ${reaisCompleto(total())}.`;
    }
    return erros;
  }

  // ---------- Pix (BR Code "copia e cola", padrão EMV do Banco Central) ----------
  function crc16(texto) {
    let crc = 0xffff;
    for (let i = 0; i < texto.length; i++) {
      crc ^= texto.charCodeAt(i) << 8;
      for (let b = 0; b < 8; b++) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
  const campo = (id, valor) => id + String(valor.length).padStart(2, '0') + valor; // taste-skill-ignore: identificadores de campo do padrão EMV do Pix, não são rótulos
  const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 ]/g, '').toUpperCase();
  function codigoPix(valor, txid) {
    const chave = CONFIG.chavePix || 'CHAVE-PIX-DA-BRASA-NAO-CONFIGURADA';
    const conta = campo('00', 'br.gov.bcb.pix') + campo('01', chave); // taste-skill-ignore: identificadores de campo do padrão EMV do Pix, não são rótulos
    const base = campo('00', '01') + campo('26', conta) + campo('52', '0000') + campo('53', '986') // taste-skill-ignore: identificadores de campo do padrão EMV do Pix, não são rótulos
      + campo('54', valor.toFixed(2)) + campo('58', 'BR') + campo('59', semAcento(CONFIG.recebedorPix).slice(0, 25))
      + campo('60', semAcento(CONFIG.cidadePix).slice(0, 15)) + campo('62', campo('05', txid.slice(0, 25))) + '6304'; // taste-skill-ignore: identificadores de campo do padrão EMV do Pix, não são rótulos
    return base + crc16(base);
  }

  // ---------- Provedores de pagamento ----------
  // Cada provedor recebe o pedido montado e devolve { numero, status }.
  // status: 'aguardando_pagamento' (Pix) ou 'confirmado' (cartão ou dinheiro na entrega/retirada).
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const provedores = {
    demonstracao: {
      async criarPedido(pedido) {
        await espera(900);
        if (new URLSearchParams(location.search).has('falha')) throw new Error('A conexão caiu antes de o pedido chegar ao balcão.');
        return { numero: String(Math.floor(1000 + Math.random() * 9000)), status: pedido.pagamento.metodo === 'pix' ? 'aguardando_pagamento' : 'confirmado' };
      },
      async consultarPagamento() { await espera(700); return 'pago'; }
    },
    // Exemplo de integração real: o servidor da casa cria a cobrança no gateway (Mercado Pago, Pagar.me, Stripe…)
    // e devolve número e status. O navegador nunca vê dados de cartão nem chaves secretas.
    servidor: {
      async criarPedido(pedido) {
        const r = await fetch('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido) });
        if (!r.ok) throw new Error('O balcão não respondeu. Tente de novo em instantes.');
        return r.json();
      },
      async consultarPagamento(numero) {
        const r = await fetch('/api/pedidos/' + encodeURIComponent(numero));
        if (!r.ok) throw new Error('Não deu para consultar o pagamento agora.');
        return (await r.json()).pagamento;
      }
    }
  };
  const provedor = () => provedores[CONFIG.provedor] || provedores.demonstracao;

  // ---------- Interface ----------
  const ETAPAS = ['Sacola', 'Entrega', 'Pagamento', 'Revisão'];
  const nomesMetodo = { pix: 'Pix', cartao: 'Cartão na maquininha', dinheiro: 'Dinheiro' };

  function abrirJanela(texto, conteudo, etapa) {
    titulo.textContent = texto;
    const partes = [];
    if (etapa !== undefined) partes.push(trilha(etapa));
    partes.push(conteudo);
    if (CONFIG.modoDemonstracao) partes.push(el('p', { class: 'nota nota-demo' }, 'Modo de demonstração: nenhum pedido é enviado e nada é cobrado.'));
    corpo.replaceChildren(...partes);
    dialog.classList.add('janela-pedido');
    if (!dialog.open) dialog.showModal();
    const alvo = corpo.querySelector('[data-foco]') || titulo;
    if (alvo === titulo) titulo.setAttribute('tabindex', '-1');
    alvo.focus({ preventScroll: true });
    corpo.scrollTop = 0;
  }
  dialog.addEventListener('close', () => dialog.classList.remove('janela-pedido'));

  function trilha(atual) {
    const ol = el('ol', { class: 'trilha', 'aria-label': 'Etapas do pedido' });
    ETAPAS.forEach((nome, i) => {
      const li = el('li', { class: i < atual ? 'feita' : i === atual ? 'atual' : '' }, el('span', { class: 'trilha-nome' }, nome));
      if (i === atual) li.setAttribute('aria-current', 'step');
      ol.append(li);
    });
    return ol;
  }

  function linhaConta(rotulo, valor, classe = '') {
    return el('li', { class: classe }, el('span', {}, rotulo), el('span', { class: 'conta-preco' }, reaisCompleto(valor)));
  }
  function resumoConta() {
    const ul = el('ul', { class: 'conta' });
    ul.append(linhaConta('Subtotal', subtotal()));
    if (estado.entrega.modo === 'entrega') ul.append(linhaConta('Entrega', taxa()));
    ul.append(linhaConta('Total', total(), 'conta-total'));
    return ul;
  }

  function botao(texto, classe, acao, extra = {}) {
    return el('button', { class: 'botao ' + classe, type: 'button', onclick: acao, ...extra }, texto);
  }

  // Etapa 1: sacola
  function mostrarSacola() {
    if (!quantidadeTotal()) {
      const painel = el('div', { class: 'painel' },
        el('p', {}, 'Sua sacola está vazia. Escolha um lanche no cardápio.'),
        botao('Ver o cardápio', 'botao-carvao', () => { dialog.close(); document.querySelector('#cardapio').scrollIntoView(); }, { 'data-foco': '' }));
      if (ultimoPedido) painel.append(botao('Ver meu último pedido', 'botao-linha', () => mostrarConfirmacao(ultimoPedido)));
      return abrirJanela('Sua sacola', painel);
    }
    const lista = el('ul', { class: 'linhas' });
    for (const [id, q] of Object.entries(estado.itens)) {
      const p = produtos[id];
      const qtd = el('output', { class: 'qtd-valor', 'aria-live': 'polite' }, String(q));
      lista.append(el('li', { class: 'linha' },
        el('img', { src: 'assets/' + p.foto + '.webp', alt: '', width: '64', height: '64' }),
        el('div', { class: 'linha-info' }, el('strong', {}, p.nome), el('span', {}, reaisCompleto(p.preco) + ' cada')),
        el('div', { class: 'qtd', role: 'group', 'aria-label': 'Quantidade de ' + p.nome },
          el('button', { type: 'button', class: 'qtd-botao', 'aria-label': 'Tirar um ' + p.nome, onclick: () => { definir(id, q - 1); mostrarSacola(); } }, '−'),
          qtd,
          el('button', { type: 'button', class: 'qtd-botao', 'aria-label': 'Pôr mais um ' + p.nome, disabled: q >= 20 ? '' : null, onclick: () => { definir(id, q + 1); mostrarSacola(); } }, '+')),
        el('span', { class: 'linha-preco' }, reaisCompleto(p.preco * q))));
    }
    const painel = el('div', { class: 'painel' }, lista,
      el('label', { class: 'campo-rotulo', for: 'observacao' }, 'Observação para a chapa (opcional)'),
      el('textarea', { id: 'observacao', rows: '2', maxlength: '140', placeholder: 'Ex.: sem tomate no Duplo', oninput: e => { estado.observacao = e.target.value; salvar(); } }),
      resumoConta(),
      el('div', { class: 'acoes' },
        botao('Continuar para a entrega', 'botao-tomate', mostrarEntrega, { 'data-foco': '' }),
        botao('Esvaziar sacola', 'botao-linha', () => { estado.itens = {}; salvar(); atualizarBotao(); mostrarSacola(); })));
    painel.querySelector('textarea').value = estado.observacao;
    abrirJanela('Sua sacola', painel, 0);
  }

  // Campos com rótulo, ajuda e erro ligados por aria-describedby
  function campoTexto(nome, rotulo, valor, attrs = {}) {
    const id = 'f-' + nome;
    const input = el('input', { id, name: nome, value: valor, ...attrs });
    input.value = valor;
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') !== 'true') return;
      input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby');
      const erro = input.parentElement.querySelector('.campo-erro'); erro.hidden = true; erro.textContent = '';
    });
    return el('div', { class: 'campo-bloco', 'data-campo': nome },
      el('label', { class: 'campo-rotulo', for: id }, rotulo), input,
      el('p', { class: 'campo-erro', id: id + '-erro', hidden: '' }));
  }
  function mostrarErros(form, erros) {
    let primeiro = null;
    for (const bloco of form.querySelectorAll('[data-campo]')) {
      const nome = bloco.dataset.campo, msg = erros[nome], input = bloco.querySelector('input, textarea, fieldset'), p = bloco.querySelector('.campo-erro');
      if (!p) continue;
      p.hidden = !msg; p.textContent = msg || '';
      if (input) {
        if (msg) { input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', p.id); primeiro = primeiro || input; }
        else { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
      }
    }
    if (primeiro) primeiro.focus();
    return !primeiro;
  }

  // Etapa 2: entrega ou retirada
  function mostrarEntrega() {
    const e = estado.entrega;
    const form = el('form', { class: 'painel formulario', novalidate: '' });
    const modo = el('fieldset', { class: 'opcoes' }, el('legend', { class: 'campo-rotulo' }, 'Como você quer receber?'));
    for (const [valor, texto, detalhe] of [['retirada', 'Retirar no balcão', 'Sem taxa'], ['entrega', 'Entrega em casa', 'Taxa de ' + reaisCompleto(CONFIG.taxaEntrega)]]) {
      const r = el('input', { type: 'radio', name: 'modo', value: valor, id: 'modo-' + valor });
      r.checked = e.modo === valor;
      r.addEventListener('change', () => { coletar(); estado.entrega.modo = valor; salvar(); mostrarEntrega(); });
      modo.append(el('label', { class: 'opcao', for: 'modo-' + valor }, r, el('span', {}, el('strong', {}, texto), el('small', {}, detalhe))));
    }
    form.append(modo,
      campoTexto('nome', 'Nome', e.nome, { autocomplete: 'name', required: '', 'data-foco': '' }),
      campoTexto('telefone', 'Telefone com DDD', e.telefone, { type: 'tel', inputmode: 'numeric', autocomplete: 'tel-national', placeholder: '(11) 91234-5678', required: '' }));
    if (e.modo === 'entrega') {
      form.append(el('div', { class: 'campos-endereco' },
        campoTexto('cep', 'CEP', e.cep, { inputmode: 'numeric', autocomplete: 'postal-code', placeholder: '01310-100' }),
        campoTexto('rua', 'Rua', e.rua, { autocomplete: 'address-line1' }),
        campoTexto('numero', 'Número', e.numero, { inputmode: 'numeric' }),
        campoTexto('complemento', 'Complemento (opcional)', e.complemento, { autocomplete: 'address-line2' }),
        campoTexto('bairro', 'Bairro', e.bairro, { autocomplete: 'address-level3' })));
    }
    form.append(resumoConta(), el('div', { class: 'acoes' },
      el('button', { class: 'botao botao-tomate', type: 'submit' }, 'Continuar para o pagamento'),
      botao('Voltar à sacola', 'botao-linha', () => { coletar(); mostrarSacola(); })));
    const tel = form.querySelector('#f-telefone');
    tel.addEventListener('input', () => { tel.value = mascaraTelefone(tel.value); });
    const cep = form.querySelector('#f-cep');
    if (cep) cep.addEventListener('input', () => { cep.value = mascaraCep(cep.value); });
    function coletar() {
      for (const k of ['nome', 'telefone', 'cep', 'rua', 'numero', 'complemento', 'bairro']) {
        const i = form.querySelector('#f-' + k); if (i) estado.entrega[k] = i.value;
      }
      salvar();
    }
    form.addEventListener('submit', ev => {
      ev.preventDefault(); coletar();
      if (mostrarErros(form, validarEntrega(estado.entrega))) mostrarPagamento();
    });
    abrirJanela('Entrega', form, 1);
  }

  // Etapa 3: pagamento
  function mostrarPagamento() {
    const p = estado.pagamento;
    const form = el('form', { class: 'painel formulario', novalidate: '' });
    const quando = estado.entrega.modo === 'entrega' ? 'na entrega' : 'no balcão';
    const metodos = el('fieldset', { class: 'opcoes', 'data-campo': 'metodo' }, el('legend', { class: 'campo-rotulo' }, 'Forma de pagamento'));
    for (const [valor, texto, detalhe] of [
      ['pix', 'Pix', 'Você recebe o código para copiar e colar no app do banco'],
      ['cartao', 'Cartão na maquininha', 'Crédito ou débito, pago ' + quando],
      ['dinheiro', 'Dinheiro', 'Pago ' + quando + '. Avise se precisar de troco']]) {
      const r = el('input', { type: 'radio', name: 'metodo', value: valor, id: 'metodo-' + valor });
      r.checked = p.metodo === valor;
      if (r.checked) r.setAttribute('data-foco', '');
      r.addEventListener('change', () => { coletar(); estado.pagamento.metodo = valor; salvar(); mostrarPagamento(); });
      metodos.append(el('label', { class: 'opcao', for: 'metodo-' + valor }, r, el('span', {}, el('strong', {}, texto), el('small', {}, detalhe))));
    }
    metodos.append(el('p', { class: 'campo-erro', id: 'f-metodo-erro', hidden: '' }));
    form.append(metodos);
    if (p.metodo === 'cartao') {
      const tipo = el('fieldset', { class: 'opcoes opcoes-linha' }, el('legend', { class: 'campo-rotulo' }, 'Tipo de cartão'));
      for (const [valor, texto] of [['credito', 'Crédito'], ['debito', 'Débito']]) {
        const r = el('input', { type: 'radio', name: 'cartao', value: valor, id: 'cartao-' + valor });
        r.checked = p.cartao === valor;
        r.addEventListener('change', () => { estado.pagamento.cartao = valor; salvar(); });
        tipo.append(el('label', { class: 'opcao opcao-curta', for: 'cartao-' + valor }, r, el('span', {}, el('strong', {}, texto))));
      }
      form.append(tipo, el('p', { class: 'nota' }, 'Os dados do cartão ficam só na maquininha. O site não pede número de cartão.'));
    }
    if (p.metodo === 'dinheiro') form.append(campoTexto('trocoPara', 'Troco para quanto? (opcional)', p.trocoPara, { inputmode: 'decimal', placeholder: 'Ex.: 50' }));
    form.append(resumoConta(), el('div', { class: 'acoes' },
      el('button', { class: 'botao botao-tomate', type: 'submit' }, 'Revisar o pedido'),
      botao('Voltar à entrega', 'botao-linha', () => { coletar(); mostrarEntrega(); })));
    function coletar() { const t = form.querySelector('#f-trocoPara'); if (t) estado.pagamento.trocoPara = t.value; salvar(); }
    form.addEventListener('submit', ev => {
      ev.preventDefault(); coletar();
      if (mostrarErros(form, validarPagamento(estado.pagamento))) mostrarRevisao();
    });
    abrirJanela('Pagamento', form, 2);
  }

  function descreverPagamento(pg, valorTotal) {
    if (pg.metodo === 'cartao') return 'Cartão de ' + (pg.cartao === 'debito' ? 'débito' : 'crédito') + ' na maquininha';
    if (pg.metodo === 'dinheiro') {
      const v = lerValor(pg.trocoPara);
      return Number.isFinite(v) && v > valorTotal ? `Dinheiro, troco para ${reaisCompleto(v)} (${reaisCompleto((centavos(v) - centavos(valorTotal)) / 100)} de troco)` : 'Dinheiro, sem troco';
    }
    return 'Pix';
  }
  function descreverEntrega(e) {
    return e.modo === 'entrega'
      ? `Entrega em ${e.rua.trim()}, ${e.numero.trim()}${e.complemento.trim() ? ' (' + e.complemento.trim() + ')' : ''}, ${e.bairro.trim()}, CEP ${e.cep}`
      : 'Retirada no balcão';
  }

  // Etapa 4: revisão e envio
  function mostrarRevisao() {
    const erros = { ...validarEntrega(estado.entrega), ...validarPagamento(estado.pagamento) };
    if (!quantidadeTotal()) return mostrarSacola();
    if (Object.keys(erros).length) return mostrarEntrega();
    const itens = el('ul', { class: 'conta' });
    for (const [id, q] of Object.entries(estado.itens)) itens.append(linhaConta(q + '× ' + produtos[id].nome, produtos[id].preco * q));
    if (estado.entrega.modo === 'entrega') itens.append(linhaConta('Entrega', taxa()));
    itens.append(linhaConta('Total', total(), 'conta-total'));
    const e = estado.entrega;
    const dados = el('dl', { class: 'dados' },
      el('dt', {}, 'Para'), el('dd', {}, e.nome.trim() + ', ', el('span', { class: 'sem-quebra' }, e.telefone)),
      el('dt', {}, 'Como'), el('dd', {}, descreverEntrega(e)),
      el('dt', {}, 'Pagamento'), el('dd', {}, descreverPagamento(estado.pagamento, total())));
    if (estado.observacao.trim()) dados.append(el('dt', {}, 'Observação'), el('dd', {}, estado.observacao.trim()));
    const aviso = el('p', { class: 'campo-erro', role: 'alert', hidden: '' });
    const enviar = botao('Fazer pedido de ' + reaisCompleto(total()), 'botao-tomate', () => fazerPedido(enviar, aviso), { 'data-foco': '' });
    const painel = el('div', { class: 'painel' }, itens, dados, aviso,
      el('div', { class: 'acoes' }, enviar, botao('Alterar pagamento', 'botao-linha', mostrarPagamento)));
    abrirJanela('Revisão', painel, 3);
  }

  let enviando = false;
  async function fazerPedido(botaoEnviar, aviso) {
    if (enviando) return;
    enviando = true;
    const textoOriginal = botaoEnviar.textContent;
    botaoEnviar.disabled = true; botaoEnviar.setAttribute('aria-busy', 'true'); botaoEnviar.textContent = 'Enviando para o balcão…';
    aviso.hidden = true;
    const pedido = {
      itens: Object.entries(estado.itens).map(([id, q]) => ({ produto: produtos[id].nome, quantidade: q, preco: produtos[id].preco })),
      entrega: { ...estado.entrega }, pagamento: { ...estado.pagamento }, observacao: estado.observacao.trim(),
      subtotal: subtotal(), taxaEntrega: taxa(), total: total(), criadoEm: new Date().toISOString()
    };
    try {
      const resposta = await provedor().criarPedido(pedido);
      const registro = { ...pedido, numero: resposta.numero, status: resposta.status };
      if (registro.pagamento.metodo === 'pix') registro.pix = codigoPix(registro.total, 'BRASA' + registro.numero);
      ultimoPedido = registro;
      estado = { ...vazio(), entrega: { ...estado.entrega }, pagamento: { ...estado.pagamento } };
      salvar(); atualizarBotao();
      mostrarConfirmacao(registro);
    } catch (erro) {
      aviso.textContent = (erro && erro.message ? erro.message : 'Algo deu errado.') + ' Seu pedido não foi enviado e nada foi cobrado. Tente de novo.';
      aviso.hidden = false;
      botaoEnviar.disabled = false; botaoEnviar.removeAttribute('aria-busy'); botaoEnviar.textContent = textoOriginal;
      botaoEnviar.focus();
    } finally { enviando = false; }
  }

  // Confirmação e acompanhamento do Pix
  function mostrarConfirmacao(pedido) {
    const painel = el('div', { class: 'painel' });
    const status = el('p', { class: 'status', role: 'status' });
    painel.append(el('p', { class: 'numero-pedido' }, el('small', {}, 'Pedido'), ' nº ' + pedido.numero), status);
    if (pedido.status === 'aguardando_pagamento') {
      status.textContent = `Falta pagar o Pix de ${reaisCompleto(pedido.total)}. O balcão começa a montar assim que o pagamento cair.`;
      const codigo = el('textarea', { class: 'pix-codigo', readonly: '', rows: '3', 'aria-label': 'Código Pix copia e cola' });
      codigo.value = pedido.pix;
      const copiado = el('span', { class: 'copiado', role: 'status' });
      painel.append(
        el('label', { class: 'campo-rotulo' }, 'Pix copia e cola'), codigo,
        el('div', { class: 'acoes' },
          botao('Copiar código Pix', 'botao-carvao', async () => {
            try { await navigator.clipboard.writeText(pedido.pix); } catch { codigo.select(); try { document.execCommand('copy'); } catch {} }
            copiado.textContent = 'Código copiado.';
          }, { 'data-foco': '' }), copiado));
      if (!CONFIG.chavePix) painel.append(el('p', { class: 'nota' }, 'Código de demonstração: a chave Pix da casa ainda não foi configurada, então nenhum banco aceita este código.'));
      const conferir = botao(CONFIG.modoDemonstracao ? 'Simular pagamento recebido' : 'Já paguei, conferir', 'botao-tomate', async () => {
        conferir.disabled = true; conferir.textContent = 'Conferindo o pagamento…';
        try {
          const situacao = await provedor().consultarPagamento(pedido.numero);
          if (situacao === 'pago') { pedido.status = 'confirmado'; ultimoPedido = pedido; salvar(); mostrarConfirmacao(pedido); return; }
          status.textContent = 'O pagamento ainda não apareceu. Pode levar alguns segundos depois de pagar.';
        } catch (erro) { status.textContent = erro.message; }
        conferir.disabled = false; conferir.textContent = CONFIG.modoDemonstracao ? 'Simular pagamento recebido' : 'Já paguei, conferir';
      });
      painel.append(conferir);
    } else {
      status.textContent = pedido.entrega.modo === 'entrega'
        ? 'Pedido recebido. Ele vai para a chapa agora e segue para o endereço informado.'
        : 'Pedido recebido. Ele vai para a chapa agora. Na retirada, diga o número do pedido no balcão.';
    }
    const resumo = el('ul', { class: 'conta' });
    for (const i of pedido.itens) resumo.append(linhaConta(i.quantidade + '× ' + i.produto, i.preco * i.quantidade));
    if (pedido.taxaEntrega) resumo.append(linhaConta('Entrega', pedido.taxaEntrega));
    resumo.append(linhaConta('Total', pedido.total, 'conta-total'));
    painel.append(resumo,
      el('dl', { class: 'dados' },
        el('dt', {}, 'Como'), el('dd', {}, descreverEntrega(pedido.entrega)),
        el('dt', {}, 'Pagamento'), el('dd', {}, descreverPagamento(pedido.pagamento, pedido.total) + (pedido.status === 'confirmado' && pedido.pagamento.metodo === 'pix' ? ' (pago)' : ''))),
      botao('Fechar', 'botao-linha', () => dialog.close()));
    abrirJanela(pedido.status === 'confirmado' ? 'Pedido confirmado' : 'Pague com Pix', painel);
  }

  // ---------- API pública ----------
  carregar();
  atualizarBotao();
  botaoSacola.addEventListener('click', mostrarSacola);
  window.Pedido = {
    adicionar(id) { adicionar(id); mostrarSacola(); },
    abrirSacola: mostrarSacola,
    // Exposto para testes e para a casa ajustar sem mexer no fluxo.
    config: CONFIG, codigoPix, crc16, _estado: () => estado
  };
})();
