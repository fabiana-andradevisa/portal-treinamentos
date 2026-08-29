/**
 * Andrade Visa Consultancy — Portal do Colaborador
 * Proteção contra cópia casual do conteúdo.
 *
 * IMPORTANTE: isto NÃO impede capturas de tela (Print Screen é um recurso do
 * sistema operacional, fora do alcance de qualquer site) nem impede alguém
 * com conhecimento técnico de desabilitar o JavaScript do navegador. O que
 * este script faz é desestimular a cópia casual de texto e imagens.
 */
(function () {
  // Bloqueia o menu de clique direito (Copiar, Salvar imagem, Inspecionar, etc.)
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });

  // Bloqueia seleção de texto com o mouse
  document.addEventListener('selectstart', function (e) {
    e.preventDefault();
  });

  // Bloqueia arrastar imagens/links para fora da página
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });

  // Bloqueia copiar/recortar
  document.addEventListener('copy', function (e) {
    e.preventDefault();
  });
  document.addEventListener('cut', function (e) {
    e.preventDefault();
  });

  // Bloqueia atalhos de teclado comuns de cópia/inspeção/impressão
  document.addEventListener('keydown', function (e) {
    const tecla = e.key ? e.key.toLowerCase() : '';
    const comCtrlOuCmd = e.ctrlKey || e.metaKey;

    if (comCtrlOuCmd && ['c', 'u', 's', 'p', 'x'].includes(tecla)) {
      e.preventDefault();
    }
    if (tecla === 'f12') {
      e.preventDefault();
    }
    // Ctrl+Shift+I / Ctrl+Shift+J — atalhos de Ferramentas do Desenvolvedor em alguns navegadores
    if (comCtrlOuCmd && e.shiftKey && ['i', 'j', 'c'].includes(tecla)) {
      e.preventDefault();
    }
  });
  // Reforço: aplica a classe de bloqueio no exato momento em que a impressão
  // é disparada (cobre casos em que o navegador demora a aplicar @media print,
  // ou quando a impressão é iniciada por menu do navegador, não por atalho).
  window.addEventListener('beforeprint', function () {
    document.documentElement.classList.add('modo-impressao');
  });
  window.addEventListener('afterprint', function () {
    document.documentElement.classList.remove('modo-impressao');
  });

  // Alguns navegadores (principalmente ao gerar PDF) não disparam beforeprint/
  // afterprint de forma confiável — o matchMedia cobre esse caso.
  if (window.matchMedia) {
    var consultaImpressao = window.matchMedia('print');
    var aoMudar = function (mq) {
      document.documentElement.classList.toggle('modo-impressao', mq.matches);
    };
    if (consultaImpressao.addEventListener) {
      consultaImpressao.addEventListener('change', aoMudar);
    } else if (consultaImpressao.addListener) {
      consultaImpressao.addListener(aoMudar); // navegadores mais antigos
    }
  }
})();
