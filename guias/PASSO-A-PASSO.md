# Passo a passo de implementação — Portal do Colaborador

Guia completo, na ordem em que cada etapa deve ser feita. Cada fase depende da anterior — siga na sequência.

---

## Fase 1 — Publicar o visual no GitHub Pages

1. Crie um repositório novo no GitHub (ex.: `andrade-visa-portal`). Pode ser público — não há dados de clientes aqui, só o visual institucional.
2. Faça upload da pasta `docs/` (e o restante do projeto, para manter tudo versionado) para a branch `main`. A pasta precisa se chamar exatamente `docs` — é uma das duas únicas opções que o GitHub Pages aceita como origem (a outra é a raiz do repositório).
3. Vá em **Settings → Pages**.
4. Em "Source", selecione a branch `main` e, no menu suspenso de pasta, escolha **`/docs`** (é uma opção da lista, não um campo de texto — se você digitar `/site` ou qualquer outro nome, a publicação falha ou aponta para o lugar errado).
5. Salve. O GitHub gera uma URL do tipo `https://SEU-USUARIO.github.io/andrade-visa-portal/`.
6. Abra a URL e confira se `index.html` e as 3 páginas de equipe (`legal-assistant.html`, `comercial.html`, `operacoes.html`) carregam corretamente com o fundo vermelho e os botões bege.
7. Guarde essa URL — ela será usada nos embeds do Google Sites (Fase 6).

> A partir daqui, qualquer atualização de conteúdo é: editar o `.html` → commit → push. O Google Sites sempre vai puxar a versão mais recente automaticamente.

---

## Fase 2 — Criar os Grupos no Google Workspace

1. Acesse o **Admin Console** (admin.google.com) com uma conta de administrador do Workspace.
2. Vá em **Diretório → Grupos → Criar grupo**.
3. Crie os 3 grupos, um de cada vez:
   - `equipe-legal-assistant@andradevisaconsultancy.com`
   - `equipe-comercial@andradevisaconsultancy.com`
   - `equipe-operacoes@andradevisaconsultancy.com`
4. Em cada grupo, defina o acesso de "Quem pode participar" como **Somente convidados** (ninguém se autoadiciona — a entrada só acontece via aprovação do diretor, pelo script).
5. Adicione você mesma (ou o diretor) como proprietário de todos os 3 grupos, para poder gerenciar manualmente se precisar.
6. Por enquanto, deixe os grupos vazios — os membros entram automaticamente pela Fase 4.

---

## Fase 3 — Criar o Formulário de Solicitação de Acesso

1. Acesse forms.google.com → **Formulário em branco**.
2. Nomeie: **Solicitação de Acesso ao Portal**.
3. Adicione exatamente estas perguntas (os nomes precisam bater com o script):
   - **Nome completo** — resposta curta, obrigatória
   - **E-mail da empresa** — resposta curta, obrigatória (ative "Validação de resposta → Expressão regular → Contém" e coloque `@andradevisaconsultancy.com` para barrar e-mails pessoais)
   - **Equipe designada** — múltipla escolha, obrigatória, com as opções exatamente assim:
     - `Legal Assistant`
     - `Comercial`
     - `Operações`
4. Em **Configurações (engrenagem) → Respostas**, ative "Coletar endereços de e-mail" (opcional, mas ajuda a auditar).
5. Clique em **Respostas → ícone do Planilhas Google → Criar nova planilha**. Isso cria a planilha onde o Apps Script vai gravar o status de cada solicitação.
6. Publique o formulário e guarde o link — é o que os colaboradores vão preencher para pedir acesso (divulgue esse link, por exemplo, na página inicial do portal ou por e-mail de boas-vindas).

---

## Fase 4 — Configurar o Apps Script de aprovação

1. Abra o formulário criado na Fase 3 → **⋮ (três pontos) → Editor de scripts** (isso abre o Apps Script já vinculado ao formulário).
2. Apague o conteúdo padrão e cole o conteúdo de `apps-script/solicitacao-acesso.gs`.
3. No topo do arquivo, edite as 3 constantes:
   - `DIRETOR_EMAIL` → e-mail real do diretor
   - `DOMINIO_EMPRESA` → `andradevisaconsultancy.com` (ou o domínio real)
   - `WEBAPP_URL` → deixe como está por enquanto, você volta aqui no passo 7
4. Ative o serviço avançado **Admin SDK Directory API**:
   - No editor do Apps Script, clique no ícone **+** ao lado de "Serviços" (barra lateral esquerda).
   - Selecione **Admin SDK API** → Adicionar.
   - Isso também exige ativar a mesma API no **Google Cloud Console** do projeto vinculado ao script (o próprio editor mostra um link direto para isso — clique e ative).
5. Salve o projeto (nomeie, ex.: "Aprovação de Acesso — Portal").
6. Implante como aplicativo da web: **Implantar → Nova implantação**.
   - Tipo: **Aplicativo da Web**
   - Executar como: **Eu (seu e-mail)**
   - Quem pode acessar: **Qualquer pessoa dentro de [seu domínio]**
   - Clique em Implantar e autorize as permissões solicitadas (envio de e-mail, acesso à planilha, Admin SDK).
7. Copie a URL gerada pela implantação e cole de volta na constante `WEBAPP_URL` do script (passo 3). Salve novamente.
8. Configure o gatilho automático: no editor, clique no ícone de **relógio (Gatilhos) → Adicionar gatilho**.
   - Função a executar: `onFormSubmit`
   - Fonte do evento: **Do formulário**
   - Tipo de evento: **Ao enviar formulário**
   - Salve e autorize se solicitado.
9. Faça um teste: preencha o próprio formulário da Fase 3 com um e-mail de teste do domínio. Confirme que:
   - Chegou e-mail para o `DIRETOR_EMAIL` com os botões Aprovar/Recusar.
   - Clicar em "Aprovar" adiciona o e-mail de teste ao grupo correto (confira em Admin Console → Grupos → membros).
   - O solicitante recebe o e-mail de confirmação.

---

## Fase 5 — Criar o Formulário de Conclusão de Treinamento

1. Crie um novo Google Formulário: **Conclusão de Treinamento — Portal do Colaborador**.
2. Perguntas:
   - **E-mail** — ative em Configurações → "Coletar endereços de e-mail automaticamente" (assim não precisa perguntar, já vem do login).
   - **Equipe** — múltipla escolha: Legal Assistant / Comercial / Operações
   - **Módulo concluído** — múltipla escolha, listando todos os módulos das 3 páginas (ex.: "Legal Assistant — Módulo 01 — Terminologia e vias de processo", etc.)
3. Restrinja o formulário a "Somente usuários em [seu domínio] podem responder" (Configurações → Geral).
4. Vincule a uma planilha de respostas (mesmo processo da Fase 3, passo 5) — essa planilha é o painel de acompanhamento do diretor.
5. Para cada módulo, gere o link pré-preenchido: no formulário publicado, clique **⋮ → Extrair link com dados preenchidos**, selecione as respostas "Equipe" e "Módulo" correspondentes, gere o link e copie.
6. Volte nos arquivos `docs/equipes/*.html` e substitua cada `href="#"` do botão "Marcar como concluído" pelo link pré-preenchido correspondente. Commit e push (isso atualiza o GitHub Pages automaticamente).

---

## Fase 6 — Montar o Google Site

1. Acesse sites.google.com → **Site em branco**.
2. Nomeie o site (ex.: "Portal do Colaborador — Andrade Visa").
3. Na página inicial, adicione um texto de boas-vindas e o link do Formulário de Solicitação de Acesso (Fase 3), para quem ainda não tem acesso liberado.
4. Crie 3 subpáginas, uma para cada equipe: **Páginas → + → Nova página**:
   - `Legal Assistant`
   - `Comercial`
   - `Operações`
5. Em cada subpágina, insira o embed do GitHub Pages: **Inserir → Incorporar → Por URL**, colando:
   - `https://SEU-USUARIO.github.io/andrade-visa-portal/equipes/legal-assistant.html`
   - `https://SEU-USUARIO.github.io/andrade-visa-portal/equipes/comercial.html`
   - `https://SEU-USUARIO.github.io/andrade-visa-portal/equipes/operacoes.html`
   - Ajuste a altura do embed para não cortar o conteúdo.
6. Restrinja cada subpágina ao grupo correspondente: clique na página no painel lateral → **⋮ → Gerenciar permissões da página** (ou "Restringir acesso à página", dependendo da versão do Sites) → adicione `equipe-legal-assistant@...`, `equipe-comercial@...` ou `equipe-operacoes@...` conforme a página.
7. Confirme que a página inicial permanece visível para todo o domínio (sem restrição de grupo), já que é ali que quem ainda não tem acesso faz a solicitação.
8. Publique o site: **Publicar → Compartilhar com outras pessoas → Restrito a pessoas em [seu domínio]**.
9. Copie o link público do site — é o link final do portal para divulgar aos colaboradores.

---

## Fase 7 — Teste ponta a ponta

1. Peça a um colaborador de teste (ou use uma conta secundária do domínio) para:
   - Preencher o Formulário de Solicitação de Acesso escolhendo "Comercial".
   - Confirmar que o diretor recebeu o e-mail e aprovar.
   - Tentar acessar o link do Google Site.
2. Verifique que essa conta consegue ver **apenas** a página "Comercial" e recebe erro de permissão (ou nem visualiza o link) nas páginas "Legal Assistant" e "Operações".
3. Clique em "Marcar como concluído" num módulo e confirme que a resposta aparece na planilha de conclusão (Fase 5) com o e-mail correto preenchido automaticamente.
4. Teste também o fluxo de recusa: envie outra solicitação e clique em "Recusar" — confirme que o e-mail de recusa chega e que a conta **não** é adicionada a nenhum grupo.

---

## Fase 8 — Lançar

1. Comunique aos colaboradores atuais o link do Google Site e o link do Formulário de Solicitação de Acesso.
2. Adicione manualmente (via Admin Console → Grupos, sem passar pelo formulário) os colaboradores que já têm acesso confirmado hoje, para não obrigá-los a repetir o processo.
3. Combine com o diretor a rotina de checar o e-mail de aprovação (ou considere criar um filtro/etiqueta no Gmail dele para essas mensagens, já que chegam com o mesmo padrão de assunto "Solicitação de acesso — ...").
4. Substitua os `href="#"` de "Abrir material" pelos materiais reais de treinamento (Docs, Slides ou vídeos) — é o único conteúdo que ainda está com placeholder.
