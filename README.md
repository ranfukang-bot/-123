# PromptReel

AI 视频提示词生成器 SaaS。用户上传商品图片和基础需求，服务端调用 Gemini/OpenAI-compatible API 生成适合 Runway、Pika、Sora 等工具的视频提示词。

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment

Copy `.env.example` to `.env.local` and fill in the values. Never commit real secrets.

Before a paid production launch, verify:

```bash
npm run lint
npm run build
npm run check:prod
```

## Required Production Setup

- Execute `supabase-setup.sql` for a fresh Supabase project, or `supabase-credit-functions.sql` for an existing project that already has the base tables.
- Configure Supabase Auth URLs for the production domain.
- Configure LemonSqueezy products/variants and webhook URL.
- Set all variables from `.env.example` in Vercel or the chosen host.
- Rotate any keys that were shared in chat or documents before launch.

## Important Routes

- `/api/generate`: authenticated AI generation and credit consumption.
- `/api/checkout`: authenticated LemonSqueezy checkout creation.
- `/api/webhook`: LemonSqueezy webhook processing.

## Deploy

For China-facing production, do not use Vercel as the final host. Deploy the Dockerfile build to a China-accessible container host such as Tencent CloudBase Run, then bind `https://www.daihuo.icu`.

Detailed launch steps are in [`CHINA_LAUNCH_GUIDE.md`](./CHINA_LAUNCH_GUIDE.md).
