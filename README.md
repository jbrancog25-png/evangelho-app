# Evangelho

Aplicativo web (mobile-first) do **Evangelho**, direcionado aos fiéis da Igreja
Mundial Vida em Cristo. É um guarda-chuva que reúne as áreas das igrejas
seguidas pelo fiel (palavra, cultos, pedidos de oração, dízimo) e, abaixo, o
conteúdo transversal (eventos, esportes, cultura, saúde, cestas básicas,
missões, carteira, ranking, perfil etc.).

Base de código derivada do **CONEX** — os dois produtos vivem em contas e
ambientes separados a partir de 2026-10-04.

## Stack

- React 19 + TypeScript
- Vite
- CSS puro com variáveis de tema (sem framework de UI)

## Rodando localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # checagem de tipos + build de produção em dist/
npm run preview  # serve o build de produção
npm run lint     # oxlint
```

## Estrutura

```
src/
  App.tsx                     container da tela (largura máxima de 480px)
  index.css                   reset + variáveis de cor/tipografia
  screens/
    HomeScreen.tsx            painel inicial
    HomeScreen.css            estilos do painel inicial
  components/
    Icons.tsx                 logo e ícones SVG (marca, interface e atalhos)
    IgrejasSeguidas.tsx       bloco das igrejas que o fiel segue
  data/
    home.ts                   usuário, campanhas e atalhos "Explorar"
    igrejas.ts                igrejas seguidas (palavra, cultos, oração, CTA dízimo)
```

## Conteúdo

- `src/data/igrejas.ts` — igrejas seguidas pelo fiel; cada uma com `palavra`
  (texto curto do pastor), `proximoCulto` (data + local), `pedidosOracao`
  (quantidade com link) e `dizimoCta` (chamada para doação).
- `src/data/home.ts` — `usuario`, `campanhas` e os 17 atalhos "Explorar"
  (Eventos, Esportes, Shows, Cultura, Educação, Cursos, Saúde, Sangue, Cestas
  básicas, Missões, Benefícios, Entidades parceiras, Vagas de emprego, Inglês,
  Carteira, Ranking, Perfil).

Hoje tudo é visual/mock — não há roteamento interno nem backend. Pontuação,
dízimo e carteira ainda são placeholders.
