# PromptReel 正式收费上线清单

## 1. 必填生产环境变量

在 CloudBase Run 或正式部署平台配置：

```bash
NEXT_PUBLIC_APP_URL=https://www.daihuo.icu
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_BASE_URL=
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_BASIC_VARIANT_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=
LEMONSQUEEZY_UNLIMITED_VARIANT_ID=
```

本地检查：

```bash
npm run check:prod
npm run lint
npm run build
```

## 2. Supabase

- 执行 `supabase-setup.sql`；已有库只缺额度函数时执行 `supabase-credit-functions.sql`。
- Auth Site URL 设置为正式域名 `https://www.daihuo.icu`。
- Redirect URLs 至少加入：
  - `https://www.daihuo.icu/login`
  - `https://www.daihuo.icu/register`
  - `https://www.daihuo.icu/dashboard`
- 开启邮件 OTP/确认邮件能力，并测试 QQ/常用邮箱收信。
- 正式上线必须配置自定义 SMTP，不使用 Supabase 默认内置发信服务；默认服务限额很低，只适合开发验证。
- 邮件模板统一中文化，确认注册邮件必须使用 `{{ .Token }}` 发送 6 位验证码。
- 上线前轮换曾经出现在文档或聊天里的 service role key。

### Supabase 自定义 SMTP 必填项

在 Supabase Dashboard 的 `Authentication > Emails > SMTP Settings` 中填写：

```text
Sender name: PromptReel
Sender email: no-reply@daihuo.icu
Host:
Port:
Username:
Password / SMTP 授权码:
```

上线验收必须用未注册的新邮箱完整测试：注册 -> 收到中文验证码邮件 -> 输入验证码 -> 进入工作台。

## 3. LemonSqueezy

- 创建 3 个订阅 Variant：
  - 基础版：¥29/月，50 次
  - 专业版：¥69/月，200 次
  - 无限版：¥129/月，不限次
- 把 3 个 Variant ID 填入生产环境变量。
- Webhook Callback URL 设置为：
  - `https://www.daihuo.icu/api/webhook`
- Webhook Signing Secret 必须与 `LEMONSQUEEZY_WEBHOOK_SECRET` 完全一致。
- Webhook 事件至少勾选：
  - `subscription_created`
  - `subscription_updated`
  - `subscription_cancelled`
  - `subscription_payment_success`

## 4. 验收流程

- 新邮箱注册，验证邮件/验证码可用。
- 免费用户生成 3 次后被拦截。
- 购买基础版后，账户页显示基础版和 50 次额度。
- 生成 1 次后额度变为 49。
- LemonSqueezy 后台重发 webhook 不会重复错误加额度。
- 取消订阅后账户页显示取消状态。

## 5. 暂不阻断但要关注

- 国内正式部署的详细后台操作见 `CHINA_LAUNCH_GUIDE.md`。
- 当前 Gemini 使用第三方 OpenAI-compatible 代理 `https://yunwu.ai/v1`，建议准备备用模型供应商。
- `npm audit` 中 Next.js 依赖链存在 PostCSS moderate 报告，等待 Next 官方可升级版本，不要使用会降级到 Next 9 的 `npm audit fix --force`。
