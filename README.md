# Portal do Colaborador — Andrade Visa Consultancy

Portal interno onde cada colaborador visualiza e realiza os treinamentos de processos da sua equipe. Construído com **GitHub Pages** (visual), **Google Sites** (login e restrição de acesso) e **Google Workspace / Apps Script** (aprovação do diretor).

## Conteúdo deste repositório

```
andrade-visa-portal/
├── docs/                      ← publicar via GitHub Pages (nome exigido pelo GitHub)
│   ├── index.html            ← página inicial, seleção de equipe
│   ├── assets/style.css      ← sistema visual (vermelho #82251E, bege #DEC8A7)
│   └── equipes/
│       ├── legal-assistant.html
│       ├── comercial.html
│       └── operacoes.html
├── apps-script/
│   └── solicitacao-acesso.gs ← fluxo de solicitação/aprovação de acesso
└── guias/
    ├── ARQUITETURA.md         ← como as 3 ferramentas se encaixam
    └── PASSO-A-PASSO.md       ← passo a passo completo de implementação
```

## Comece por aqui

Leia **`guias/PASSO-A-PASSO.md`** — segue a ordem exata de implementação, do zero ao portal no ar.

## Identidade visual

- **Vermelho `#82251E`** — fundo de todas as páginas
- **Bege `#DEC8A7`** — botões principais e destaques de texto
- **Preto e branco** — textos e elementos de suporte
- Elemento de assinatura: um "selo" circular estilo carimbo de visto, marcando qual equipe/página está sendo exibida

As 3 áreas (Legal Assistant, Comercial, Operações) refletem a estrutura de papéis da consultoria — ajuste conteúdo dos módulos conforme a real necessidade de cada equipe.

## Próximos passos sugeridos

1. Revisar o conteúdo de cada módulo (já escrito em `docs/equipes/<equipe>/modulo-0X.html`) e ajustar com a diretoria/equipe técnica onde achar necessário.
2. Preencher os placeholders do `.gs` (`DIRETOR_EMAIL`, `DOMINIO_EMPRESA`, `WEBAPP_URL`).
3. Seguir o checklist final de `guias/ARQUITETURA.md` para deixar o fluxo de aprovação e o Google Sites operacionais.

## Sobre a confidencialidade do conteúdo entre equipes

O conteúdo de cada treinamento agora fica em página própria dentro do portal (não é mais link externo para PDF/Doc). Isso resolve a experiência de leitura, mas é importante entender um limite técnico: **o GitHub Pages é público por padrão** — qualquer pessoa com o link exato de uma página consegue abri-la, mesmo sem fazer parte do grupo daquela equipe. O que impede o cruzamento hoje é o Google Sites nunca exibir o link para quem não tem permissão na página da equipe.

Na prática, isso significa: nunca compartilhe a URL do GitHub Pages diretamente com colaboradores (só o link do Google Site, que é o que aplica a restrição real) e evite colocar, nos textos dos módulos, informações que não possam correr o risco mínimo de vazamento por link direto. Se a confidencialidade entre equipes precisar ser garantida de forma mais rígida (ex.: dados de clientes, valores internos), o caminho correto é mover esse conteúdo específico para dentro do próprio Google Sites (que aplica a permissão de verdade) em vez do GitHub Pages.

## Proteção contra cópia (docs/assets/protecao.js)

Todas as páginas carregam `assets/protecao.js`, que desabilita clique direito, seleção de texto, copiar/recortar, atalhos de teclado (Ctrl+C, Ctrl+U, Ctrl+P, F12, entre outros) e deixa a página em branco ao tentar imprimir ou exportar como PDF.

**Limite importante:** isso desestimula a cópia casual, mas não é uma trava à prova de tudo. **Captura de tela (Print Screen) é um recurso do sistema operacional** — nenhum site, de nenhuma empresa, consegue bloquear isso via código, em nenhuma circunstância. Um usuário com conhecimento técnico também pode desabilitar o JavaScript do navegador para contornar as demais proteções. Trate esta camada como um desestímulo, não como confidencialidade garantida.
