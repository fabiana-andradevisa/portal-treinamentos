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
})();
