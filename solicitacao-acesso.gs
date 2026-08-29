/**
 * ANDRADE VISA CONSULTANCY — Portal do Colaborador
 * Fluxo de solicitação e aprovação de acesso
 *
 * COMO FUNCIONA
 * 1. O colaborador preenche o Google Formulário "Solicitação de Acesso ao Portal"
 *    com nome, e-mail da empresa (@andradevisaconsultancy.com) e equipe designada.
 * 2. onFormSubmit() dispara automaticamente, grava a solicitação na planilha
 *    vinculada ao formulário e envia um e-mail ao diretor com dois links:
 *    "Aprovar" e "Recusar".
 * 3. Ao clicar em um dos links, o diretor é direcionado ao Web App (doGet),
 *    que registra a decisão e, se aprovada, adiciona o e-mail do colaborador
 *    ao Google Group da equipe correspondente — o que libera automaticamente
 *    o acesso à página restrita daquela equipe no Google Sites.
 * 4. O colaborador recebe um e-mail de confirmação (aprovado ou recusado).
 *
 * CONFIGURAÇÃO NECESSÁRIA (antes de usar)
 * - Substituir DIRETOR_EMAIL pelo e-mail real da diretoria.
 * - Substituir DOMINIO_EMPRESA pelo domínio real do Google Workspace.
 * - Conferir o mapeamento EQUIPES_PARA_GRUPOS com os e-mails reais dos
 *   Google Groups (criados no Admin Console > Grupos).
 * - Ativar o serviço avançado "Admin SDK Directory API" em
 *   Serviços avançados do Google (ícone de +, no editor do Apps Script)
 *   E também no Google Cloud Console do projeto vinculado.
 * - Implantar este script como Aplicativo da Web (Implantar > Nova implantação
 *   > Aplicativo da Web), executando "como eu" e acessível a "qualquer pessoa
 *   dentro de [seu domínio]". Copiar a URL gerada — ela substitui WEBAPP_URL.
 * - Vincular este script ao formulário: Extensões > Apps Script, a partir do
 *   próprio Google Formulário "Solicitação de Acesso ao Portal".
 */

const DIRETOR_EMAIL = 'fabiana@andradevisa.com'; // TODO: e-mail real do diretor
const DOMINIO_EMPRESA = 'andradevisa.com';          // TODO: domínio real do Workspace
const WEBAPP_URL = 'https://script.google.com/macros/s/SEU_ID_DE_IMPLANTACAO/exec'; // TODO: após implantar

// Mapeia o nome da equipe (como aparece no formulário) para o e-mail do Google Group
// que controla o acesso à respectiva página restrita no Google Sites.
const EQUIPES_PARA_GRUPOS = {
  'Legal Assistant': 'andradevisaconsultancy@' + andradevisa.com,
  'Comercial':        'info@' + andradevisa.com,
  'Operações':        'andrade.visa.consultant@' + andradevisa.com,
};

const ABA_STATUS = 'Status'; // nome da coluna de status na planilha de respostas

/**
 * Disparado automaticamente a cada nova resposta do formulário.
 * Configurar o gatilho em: Editor do Apps Script > Gatilhos (relógio) >
 * Adicionar gatilho > onFormSubmit > Do formulário > Ao enviar formulário.
 */
function onFormSubmit(e) {
  const respostas = e.namedValues;
  const nome = (respostas['Nome completo'] || [''])[0];
  const email = (respostas['E-mail da empresa'] || [''])[0].trim().toLowerCase();
  const equipe = (respostas['Equipe designada'] || [''])[0].trim();
  const linhaIndex = e.range.getRow();

  // Validação: e-mail precisa ser do domínio da empresa
  if (!email.endsWith('@' + DOMINIO_EMPRESA)) {
    MailApp.sendEmail({
      to: DIRETOR_EMAIL,
      subject: '⚠️ Solicitação de acesso com e-mail fora do domínio',
      body: `${nome} solicitou acesso com o e-mail ${email}, que não pertence ao domínio ${DOMINIO_EMPRESA}. Solicitação não encaminhada automaticamente.`,
    });
    return;
  }

  const token = Utilities.getUuid();
  registrarToken_(linhaIndex, token, nome, email, equipe);

  const linkAprovar = `${WEBAPP_URL}?token=${token}&acao=aprovar`;
  const linkRecusar = `${WEBAPP_URL}?token=${token}&acao=recusar`;

  const corpoHtml = `
    <p>Nova solicitação de acesso ao <strong>Portal do Colaborador</strong>:</p>
    <ul>
      <li><strong>Nome:</strong> ${nome}</li>
      <li><strong>E-mail:</strong> ${email}</li>
      <li><strong>Equipe designada:</strong> ${equipe}</li>
    </ul>
    <p>
      <a href="${linkAprovar}" style="background:#DEC8A7;color:#14100f;padding:10px 18px;text-decoration:none;border-radius:4px;font-family:sans-serif;">Aprovar acesso</a>
      &nbsp;&nbsp;
      <a href="${linkRecusar}" style="color:#82251E;font-family:sans-serif;">Recusar</a>
    </p>
  `;

  MailApp.sendEmail({
    to: DIRETOR_EMAIL,
    subject: `Solicitação de acesso — ${nome} (${equipe})`,
    htmlBody: corpoHtml,
  });
}

/** Grava o token pendente numa aba auxiliar "Status" da mesma planilha. */
function registrarToken_(linhaFormulario, token, nome, email, equipe) {
  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  let aba = planilha.getSheetByName(ABA_STATUS);
  if (!aba) {
    aba = planilha.insertSheet(ABA_STATUS);
    aba.appendRow(['Token', 'Linha formulário', 'Nome', 'E-mail', 'Equipe', 'Status', 'Data decisão']);
  }
  aba.appendRow([token, linhaFormulario, nome, email, equipe, 'PENDENTE', '']);
}

/**
 * Executado quando o diretor clica em "Aprovar" ou "Recusar" no e-mail.
 * Implantado como Aplicativo da Web (ver instruções no topo do arquivo).
 */
function doGet(e) {
  const token = e.parameter.token;
  const acao = e.parameter.acao;

  const planilha = SpreadsheetApp.getActiveSpreadsheet();
  const aba = planilha.getSheetByName(ABA_STATUS);
  const dados = aba.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === token) {
      const linha = i + 1;
      const status = dados[i][5];
      const nome = dados[i][2];
      const email = dados[i][3];
      const equipe = dados[i][4];

      if (status !== 'PENDENTE') {
        return HtmlService.createHtmlOutput(
          `<p style="font-family:sans-serif;">Esta solicitação já foi processada (status atual: ${status}).</p>`
        );
      }

      if (acao === 'aprovar') {
        const grupo = EQUIPES_PARA_GRUPOS[equipe];
        if (grupo) {
          adicionarAoGrupo_(grupo, email);
        }
        aba.getRange(linha, 6, 1, 2).setValues([['APROVADO', new Date()]]);
        enviarConfirmacaoColaborador_(nome, email, equipe, true);
        return HtmlService.createHtmlOutput(
          `<p style="font-family:sans-serif;">Acesso de ${nome} (${email}) à equipe ${equipe} <strong>aprovado</strong> e liberado.</p>`
        );
      }

      if (acao === 'recusar') {
        aba.getRange(linha, 6, 1, 2).setValues([['RECUSADO', new Date()]]);
        enviarConfirmacaoColaborador_(nome, email, equipe, false);
        return HtmlService.createHtmlOutput(
          `<p style="font-family:sans-serif;">Solicitação de ${nome} (${email}) <strong>recusada</strong>.</p>`
        );
      }
    }
  }

  return HtmlService.createHtmlOutput('<p style="font-family:sans-serif;">Token inválido ou não encontrado.</p>');
}

/**
 * Adiciona o colaborador ao Google Group da equipe, usando o serviço
 * avançado Admin SDK Directory API (precisa estar ativado — ver topo do arquivo).
 */
function adicionarAoGrupo_(emailGrupo, emailColaborador) {
  try {
    AdminDirectory.Members.insert({ email: emailColaborador, role: 'MEMBER' }, emailGrupo);
  } catch (erro) {
    // Se já for membro, a API retorna erro "Member already exists" — pode ser ignorado.
    console.log('Aviso ao adicionar ao grupo: ' + erro);
  }
}

/** E-mail de confirmação para o colaborador. */
function enviarConfirmacaoColaborador_(nome, email, equipe, aprovado) {
  const assunto = aprovado
    ? 'Acesso ao Portal do Colaborador aprovado'
    : 'Solicitação de acesso ao Portal do Colaborador';

  const corpo = aprovado
    ? `Olá ${nome},\n\nSeu acesso à área "${equipe}" do Portal do Colaborador foi aprovado. Acesse o portal com seu e-mail da empresa.\n\nAndrade Visa Consultancy`
    : `Olá ${nome},\n\nSua solicitação de acesso à área "${equipe}" do Portal do Colaborador não foi aprovada neste momento. Fale com a diretoria em caso de dúvidas.\n\nAndrade Visa Consultancy`;

  MailApp.sendEmail({ to: email, subject: assunto, body: corpo });
}
