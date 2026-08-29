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

1. Substituir os links `href="#"` de cada módulo pelos materiais reais (Google Docs, Slides ou vídeos de treinamento).
2. Preencher os placeholders do `.gs` (`DIRETOR_EMAIL`, `DOMINIO_EMPRESA`, `WEBAPP_URL`).
3. Seguir o checklist final de `guias/ARQUITETURA.md` para deixar o fluxo de aprovação e o Google Sites operacionais.
