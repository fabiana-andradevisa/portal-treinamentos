# Arquitetura do Portal do Colaborador

## Como as três ferramentas se encaixam

Nenhuma das três ferramentas sozinha resolve tudo, então cada uma cuida de uma parte:

| Ferramenta | Papel no portal |
|---|---|
| **GitHub** | Guarda o código-fonte (HTML/CSS) das páginas de treinamento e o script de aprovação, com histórico de versões. Publica as páginas visuais via **GitHub Pages**. |
| **Google Sites** | É a "porta de entrada" real do portal — onde o login e a restrição por equipe acontecem, porque o Sites herda as permissões do Google Workspace. |
| **Google Workspace** (Grupos + Admin Console) | Controla **quem** pode ver **qual** página do Sites, e é a peça que aplica a aprovação do diretor. |

A regra de ouro: **o controle de acesso nunca fica no GitHub Pages** (que é público), e sim no Google Sites + Grupos do Workspace. O GitHub só fornece o "visual" que é embutido dentro da página já restrita do Sites.

## Fluxo de acesso, passo a passo

1. Colaborador entra com o e-mail da empresa e preenche o **Google Formulário "Solicitação de Acesso ao Portal"** (nome, e-mail, equipe desejada).
2. O **Apps Script** (`apps-script/solicitacao-acesso.gs`) dispara automaticamente e envia um e-mail ao diretor com botões "Aprovar" / "Recusar".
3. Se aprovado, o script adiciona o e-mail do colaborador ao **Google Group da equipe** (ex.: `equipe-operacoes@andradevisaconsultancy.com`).
4. Esse grupo é quem tem permissão de visualizar a página da equipe correspondente dentro do Google Sites — a inclusão no grupo já libera o acesso, sem nenhum passo manual extra.
5. O colaborador acessa o Site institucional, faz login com a conta Google da empresa (login já é obrigatório porque o Site está restrito ao domínio) e só enxerga a(s) página(s) do(s) grupo(s) do qual faz parte.

## Estrutura de páginas no Google Sites

No editor do Google Sites (sites.google.com), a restrição de acesso é feita **por página**, não só pelo site inteiro — é isso que permite que cada equipe veja só a sua área:

1. Crie uma página "Portal — Página inicial" (pública apenas dentro do domínio, sem grupo específico) com um card ou botão para cada equipe.
2. Crie uma **subpágina por equipe**: `/legal-assistant`, `/comercial`, `/operacoes`.
3. Em cada subpágina de equipe: menu **⋮ (mais opções da página) → Gerenciar permissões da página** (ou "Compartilhar esta página") → restringir a visualização a `equipe-legal-assistant@...`, `equipe-comercial@...`, `equipe-operacoes@...`.
4. Dentro de cada subpágina, insira um bloco **Inserir → Incorporar → Por URL** apontando para a página correspondente do GitHub Pages (ex.: `https://SEU-USUARIO.github.io/andrade-visa-portal/equipes/legal-assistant.html`). O visual vermelho/bege é renderizado ali dentro, mas quem controla se a pessoa chega até essa página é o Google Sites.
5. Publique o site restrito a "Pessoas em [seu domínio]" em **Compartilhar com outras pessoas**.

## Publicando o GitHub Pages

1. Suba a pasta `docs/` para um repositório GitHub (público — o conteúdo aqui é só visual/institucional, sem dados sensíveis de clientes). A pasta precisa se chamar `docs` porque é uma das duas opções que o GitHub Pages realmente aceita como origem de publicação (a outra é a raiz do repositório).
2. Em **Settings → Pages**, defina a branch (ex. `main`) e a pasta **`/docs`** como origem (essa é a opção exata do menu suspenso — não digite um nome, selecione `/docs` na lista).
3. A URL gerada (`https://SEU-USUARIO.github.io/andrade-visa-portal/`) é a que você usa nos embeds do passo anterior.
4. Qualquer atualização de treinamento passa a ser: editar o `.html` da equipe → commit/push → atualiza automaticamente dentro do Google Sites (o embed sempre busca a versão mais recente).

## Registro de conclusão dos treinamentos

Cada botão "Marcar como concluído" nas páginas de equipe deve apontar para um **Google Formulário de Conclusão de Treinamento**, restrito ao domínio (assim o Google Forms grava automaticamente o e-mail de quem respondeu, sem precisar de login extra). As respostas caem numa Planilha Google que a diretoria pode filtrar por equipe, colaborador e módulo.

Para pré-preencher o campo "Módulo" ao clicar no botão de cada treinamento: no formulário publicado, use **⋮ → Extrair link com dados preenchidos**, selecione o módulo, copie o link gerado e cole no `href` do botão correspondente no `.html`.

## Configuração necessária antes de ativar

- [ ] Criar os 3 Google Groups: `equipe-legal-assistant@`, `equipe-comercial@`, `equipe-operacoes@`
- [ ] Criar o Google Formulário "Solicitação de Acesso ao Portal" com os campos: Nome completo, E-mail da empresa, Equipe designada (lista suspensa)
- [ ] Vincular o script `.gs` ao formulário e configurar o gatilho `onFormSubmit`
- [ ] Ativar o serviço avançado Admin SDK Directory API (Apps Script + Google Cloud Console)
- [ ] Implantar o script como Aplicativo da Web e colar a URL em `WEBAPP_URL`
- [ ] Substituir `DIRETOR_EMAIL` e `DOMINIO_EMPRESA` no script pelos valores reais
- [ ] Criar o Google Formulário de Conclusão de Treinamento (um único formulário, com campo "Módulo")
- [ ] Publicar o repositório no GitHub e ativar o GitHub Pages
- [ ] Montar as páginas no Google Sites com os embeds e as permissões por página
