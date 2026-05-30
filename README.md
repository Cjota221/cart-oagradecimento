# Imprimax (Fase 1)

Base do projeto em Next.js 15 com App Router, Tailwind CSS, Supabase e Mercado Pago.

## Stack

- Next.js 15
- React 19
- Tailwind CSS
- Supabase (`@supabase/supabase-js` + `@supabase/ssr`)
- Mercado Pago SDK

## Estrutura principal

```text
src/
  app/
    page.tsx
    login/page.tsx
    dashboard/page.tsx
    api/payment/route.ts
    api/webhook/route.ts
  components/
    ui/
    CardGenerator.tsx
    TemplateGallery.tsx
  lib/
    supabase.ts
    supabase-server.ts
    supabase-service.ts
    mercadopago.ts
public/
  templates/
supabase/
  schema.sql
```

## Configuração

1. Copie `.env.local.example` para `.env.local`.
2. Preencha as credenciais do Supabase e Mercado Pago.
3. Rode:

```bash
npm install
npm run dev
```

## Banco de dados

O SQL completo de criação de tabelas e políticas RLS está em `supabase/schema.sql`.

## Rotas

- `/` landing page com CTA e gerador básico.
- `/login` autenticação (login/cadastro).
- `/dashboard` ferramenta principal para usuários com acesso pago.
- `POST /api/payment` criação de preferência no Mercado Pago.
- `POST /api/webhook` confirmação de pagamento e liberação de acesso.
