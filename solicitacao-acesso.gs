/**
 * ANDRADE VISA CONSULTANCY — Portal do Colaborador
 * Fluxo de solicitação e aprovação de acesso (versão simplificada)
 *
 * COMO FUNCIONA
 * 1. Colaborador preenche o formulário (Nome completo / E-mail da empresa / Equipe designada).
 * 2. onFormSubmit() dispara, grava um token + status "PENDENTE" nas colunas E e F
 *    da MESMA linha da resposta (na planilha de respostas), e manda e-mail ao diretor
 *    com botões Aprovar/Recusar.
 * 3. Ao clicar, doGet() confere o token na planilha, aprova ou recusa, e — se aprovado —
 *    adiciona o e-mail ao Google Group da equipe.
 *
 * CONFIGURAÇÃO (preencher antes de usar)
 * - DIRETOR_EMAIL, DOMINIO_EMPRESA: já preenchidos.
 * - SPREADSHEET_ID: cole o ID da planilha de respostas (está na URL dela,
 *   entre /d/ e /edit — ex.: docs.google.com/spreadsheets/d/ESTE_PEDAÇO_AQUI/edit).
 * - WEBAPP_URL: preencher depois de implantar como Aplicativo da Web (Implantar >
 *   Nova implantação > Aplicativo da Web > Executar como: Eu > Quem acessa: Qualquer pessoa).
 *   Depois de qualquer alteração de código, é preciso ATUALIZAR A VERSÃO da implantação
 *   (Implantar > Gerenciar implantações > lápis > Versão: Nova versão > Implantar) —
 *   a URL continua a mesma, só o código servido é que precisa ser atualizado.
 * - Ativar o serviço avançado "Admin SDK API" (ícone + ao lado de Serviços).
 * - Criar o gatilho: ícone de relógio > Adicionar gatilho > onFormSubmit >
 *   Do formulário > Ao enviar formulário > Implantação: Head/Teste (não uma versão travada).
 *
 * COLUNAS ESPERADAS NA PLANILHA DE RESPOSTAS
 * A: Carimbo de data/hora (criado automaticamente pelo Forms)
 * B: Nome completo
 * C: E-mail da empresa
 * D: Equipe designada
 * E: Token          (criado por este script)
 * F: Status         (criado por este script — PENDENTE / APROVADO / RECUSADO)
 * G: Data da decisão (criado por este script)
 */

var DIRETOR_EMAIL = 'fabiana@andradevisa.com';
var DOMINIO_EMPRESA = 'andradevisa.com';
var SPREADSHEET_ID = '1_gvz9LXpUqVZav45io-Pa8b4WX_OChGqLrtSmv3lUFU';
var WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyS6VdkAy3HxwzvEXI0FMgVUhEciC5RxF97k5EiB6R6LgL4SyFDu5oR8tFR1fB_9pxj/exec';

var EQUIPES_PARA_GRUPOS = {
  'Legal Assistant': 'equipe-legal-assistant@' + DOMINIO_EMPRESA,
  'Comercial': 'equipe-comercial@' + DOMINIO_EMPRESA,
  'Operações': 'equipe-operacoes@' + DOMINIO_EMPRESA
};

/**
 * Disparado automaticamente a cada resposta do formulário.
 */
function onFormSubmit(e) {
  try {
    // Vinculado ao Formulário: a resposta vem em e.response, não em e.namedValues/e.range.
    var itemRespostas = e.response.getItemResponses();
    var nome = '', email = '', equipe = '';
    for (var i = 0; i < itemRespostas.length; i++) {
      var pergunta = itemRespostas[i].getItem().getTitle().trim().toLowerCase();
      var resposta = itemRespostas[i].getResponse();
      if (pergunta.indexOf('nome') !== -1) nome = resposta;
      else if (pergunta.indexOf('e-mail') !== -1 || pergunta.indexOf('email') !== -1) email = String(resposta || '').trim().toLowerCase();
      else if (pergunta.indexOf('equipe') !== -1) equipe = resposta;
    }
    processarSolicitacao_(nome, email, equipe);
  } catch (erro) {
    MailApp.sendEmail(DIRETOR_EMAIL, '🔴 Erro no script (onFormSubmit)', String(erro) + '\n\n' + (erro.stack || ''));
    throw erro;
  }
}

/**
 * Lógica de negócio, separada do evento do formulário — assim TESTE_MANUAL
 * pode chamar exatamente o mesmo caminho que o envio real usa, sem precisar
 * simular o formato do evento do Google.
 */
function processarSolicitacao_(nome, email, equipe) {
  // A resposta que acabou de chegar é sempre a última linha da planilha.
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var aba = ss.getSheets()[0];
  var linha = aba.getLastRow();

  if (!email || email.indexOf('@' + DOMINIO_EMPRESA) === -1) {
    MailApp.sendEmail(DIRETOR_EMAIL, '⚠️ Solicitação com e-mail fora do domínio',
      nome + ' enviou o e-mail "' + email + '", que não pertence a @' + DOMINIO_EMPRESA + '. Não encaminhado automaticamente.');
    return;
  }

  var token = Utilities.getUuid();
  aba.getRange(linha, 5).setValue(token);
  aba.getRange(linha, 6).setValue('PENDENTE');

  var linkAprovar = WEBAPP_URL + '?token=' + encodeURIComponent(token) + '&acao=aprovar';
  var linkRecusar = WEBAPP_URL + '?token=' + encodeURIComponent(token) + '&acao=recusar';

  var corpo = ''
    + '<p>Nova solicitação de acesso ao <b>Portal do Colaborador</b>:</p>'
    + '<ul>'
    + '<li><b>Nome:</b> ' + nome + '</li>'
    + '<li><b>E-mail:</b> ' + email + '</li>'
    + '<li><b>Equipe designada:</b> ' + equipe + '</li>'
    + '</ul>'
    + '<p>'
    + '<a href="' + linkAprovar + '" style="background:#DEC8A7;color:#14100f;padding:10px 18px;text-decoration:none;border-radius:4px;font-family:sans-serif;">Aprovar acesso</a>'
    + '&nbsp;&nbsp;'
    + '<a href="' + linkRecusar + '" style="color:#82251E;font-family:sans-serif;">Recusar</a>'
    + '</p>';

  MailApp.sendEmail({
    to: DIRETOR_EMAIL,
    subject: 'Solicitação de acesso — ' + nome + ' (' + equipe + ')',
    htmlBody: corpo
  });
}

/**
 * Executado quando o diretor clica em Aprovar/Recusar no e-mail.
 */
function doGet(e) {
  try {
    var token = e.parameter.token;
    var acao = e.parameter.acao;

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheets = ss.getSheets();

    for (var s = 0; s < sheets.length; s++) {
      var aba = sheets[s];
      var dados = aba.getDataRange().getValues();

      for (var i = 1; i < dados.length; i++) {
        if (dados[i][4] === token) {
          var linha = i + 1;
          var nome = dados[i][1];
          var email = dados[i][2];
          var equipe = dados[i][3];
          var status = dados[i][5];

          if (status && status !== 'PENDENTE') {
            return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;">Esta solicitação já foi processada (status: ' + status + ').</p>');
          }

          if (acao === 'aprovar') {
            var grupo = EQUIPES_PARA_GRUPOS[equipe];
            if (grupo) {
              try {
                AdminDirectory.Members.insert({ email: email, role: 'MEMBER' }, grupo);
              } catch (erroGrupo) {
                // Provavelmente já é membro — seguimos em frente.
              }
            }
            aba.getRange(linha, 6).setValue('APROVADO');
            aba.getRange(linha, 7).setValue(new Date());
            MailApp.sendEmail(email, 'Acesso ao Portal do Colaborador aprovado',
              'Olá ' + nome + ',\n\nSeu acesso à área "' + equipe + '" do Portal do Colaborador foi aprovado.\n\nAndrade Visa Consultancy');
            return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;">Acesso de ' + nome + ' (' + email + ') à equipe ' + equipe + ' <b>aprovado</b> e liberado.</p>');
          }

          if (acao === 'recusar') {
            aba.getRange(linha, 6).setValue('RECUSADO');
            aba.getRange(linha, 7).setValue(new Date());
            MailApp.sendEmail(email, 'Solicitação de acesso ao Portal do Colaborador',
              'Olá ' + nome + ',\n\nSua solicitação de acesso à área "' + equipe + '" não foi aprovada neste momento.\n\nAndrade Visa Consultancy');
            return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;">Solicitação de ' + nome + ' <b>recusada</b>.</p>');
          }
        }
      }
    }

    return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;">Token não encontrado. Verifique se o SPREADSHEET_ID está certo no script.</p>');
  } catch (erro) {
    return HtmlService.createHtmlOutput('<pre style="white-space:pre-wrap;font-family:monospace;font-size:12px;">' + String(erro) + '\n\n' + (erro.stack || '') + '</pre>');
  }
}

/**
 * TESTE MANUAL — rode pelo botão Executar (escolha esta função no menu suspenso).
 * Cria uma linha de teste na planilha e simula uma resposta de formulário.
 */
function TESTE_MANUAL() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var aba = ss.getSheets()[0];
  var linha = aba.getLastRow() + 1;

  aba.getRange(linha, 1).setValue(new Date());
  aba.getRange(linha, 2).setValue('Teste Manual');
  aba.getRange(linha, 3).setValue('fabiana@andradevisa.com');
  aba.getRange(linha, 4).setValue('Comercial');

  processarSolicitacao_('Teste Manual', 'fabiana@andradevisa.com', 'Comercial');
}

/**
 * TESTE DE AUTORIZAÇÃO DO ADMIN SDK — rode pelo botão Executar.
 * Só serve para forçar a tela de autorização do Google Groups a aparecer,
 * caso ela ainda não tenha sido concedida por completo.
 */
function TESTE_GRUPO() {
  var grupo = EQUIPES_PARA_GRUPOS['Comercial'];
  var membros = AdminDirectory.Members.list(grupo);
  Logger.log(membros);
}
