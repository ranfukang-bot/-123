# PromptReel 国内正式上线操作手册

目标域名：`https://www.daihuo.icu`

这份手册按正式收费上线来走，不按临时测试来走。核心原则是：国内用户不用 VPN 能打开，注册验证码稳定送达，支付成功后额度能自动到账。

## 0. 现在的结论

- Vercel 不适合作为国内正式生产环境。你已经实测不挂 VPN 访问不稳定，所以它最多只能当临时预览。
- 正式国内访问建议走腾讯云 CloudBase Run / 云托管这类国内可访问的容器服务。
- 如果部署在中国大陆节点，自定义域名通常需要先完成 ICP 备案；如果暂时没备案，可以先用中国香港节点作为过渡，但这不是最稳的大陆正式方案。
- 收费网站如果长期面向中国大陆用户，个人备案可能不适合商业收费场景，建议后续用企业主体备案并接入微信支付/支付宝。LemonSqueezy 可以先用，但国内转化率和支付习惯不如微信/支付宝。

## 1. 腾讯云 CloudBase Run 部署

为什么这么做：CloudBase Run 可以运行项目里的 `Dockerfile`，能承载 Next.js API Routes；静态托管不够，因为本项目有 `/api/generate`、`/api/checkout`、`/api/webhook` 这些服务端接口。

### 1.1 新建环境

1. 打开腾讯云控制台。
2. 搜索并进入「云开发 CloudBase」。
3. 新建环境。
4. 地域选择：
   - 已完成 ICP 备案：优先选中国大陆地域，例如广州/上海。
   - 未完成 ICP 备案：可以临时选中国香港，先保证大部分国内用户能访问，但不要把它当最终正式方案。
5. 记住环境 ID，后面排查会用到。

### 1.2 创建云托管服务

1. 进入刚创建的 CloudBase 环境。
2. 找到「云托管」或「CloudBase Run」。
3. 创建服务，服务名建议填：`promptreel-web`。
4. 部署方式选择「代码仓库」或「GitHub 仓库」。
5. 选择仓库：`ranfukang-bot/-123`。
6. 分支选择：`main`。
7. 构建方式选择 Dockerfile。
8. Dockerfile 路径填：`Dockerfile`。
9. 服务端口填：`3000`。

为什么端口是 3000：项目的 Dockerfile 里设置了 `PORT=3000`，Next.js standalone 服务会监听这个端口。

### 1.3 配置环境变量

在 CloudBase Run 服务的「环境变量」里逐个填：

```text
NEXT_PUBLIC_APP_URL=https://www.daihuo.icu
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=你的 Supabase service role key
GEMINI_API_KEY=你的 AI API key
GEMINI_BASE_URL=https://yunwu.ai/v1
GEMINI_MODEL=gemini-3-flash-preview
LEMONSQUEEZY_API_KEY=你的 LemonSqueezy API key
LEMONSQUEEZY_STORE_ID=你的 LemonSqueezy Store ID
LEMONSQUEEZY_WEBHOOK_SECRET=你自己生成的 webhook secret
LEMONSQUEEZY_BASIC_VARIANT_ID=基础版 Variant ID
LEMONSQUEEZY_PRO_VARIANT_ID=专业版 Variant ID
LEMONSQUEEZY_UNLIMITED_VARIANT_ID=无限版 Variant ID
```

注意：`SUPABASE_SERVICE_ROLE_KEY` 权限很高，只能放在服务端环境变量里，不能写进前端页面、聊天记录、公开文档或 GitHub。

### 1.4 绑定域名

1. 在 CloudBase Run 服务里找到「域名」或「自定义域名」。
2. 添加域名：`www.daihuo.icu`。
3. 开启 HTTPS 证书，优先选自动证书。
4. 平台会给你一个 CNAME 地址。
5. 回到腾讯云 DNSPod / 域名解析。
6. 添加或修改记录：

```text
主机记录：www
记录类型：CNAME
记录值：CloudBase 给你的 CNAME 地址
线路类型：默认
TTL：600
```

为什么只绑 `www`：`www.daihuo.icu` 更适合作为正式站点。根域名 `daihuo.icu` 后面可以再做 301 跳转到 `www.daihuo.icu`，避免两个入口造成登录、支付回调和 SEO 混乱。

## 2. Supabase 邮箱验证码

为什么这么做：Supabase 默认邮件服务不是生产用途，发信限制很低。正式上线必须接自定义 SMTP，否则用户注册会继续遇到“发送频繁”或收不到验证码。

### 2.1 Auth URL 设置

进入 Supabase 项目：

1. Authentication。
2. URL Configuration。
3. Site URL 填：

```text
https://www.daihuo.icu
```

4. Redirect URLs 加：

```text
https://www.daihuo.icu/login
https://www.daihuo.icu/register
https://www.daihuo.icu/dashboard
http://localhost:3000/login
http://localhost:3000/register
http://localhost:3000/dashboard
```

为什么保留 localhost：方便以后本地调试，不影响正式站。

### 2.2 邮件模板改成验证码

进入：

```text
Authentication -> Emails -> Templates -> Confirm sign up
```

Subject 填：

```text
PromptReel 注册验证码：{{ .Token }}
```

Body 填：

```html
<h2>PromptReel 注册验证码</h2>
<p>你好，</p>
<p>你的注册验证码是：</p>
<div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">
  {{ .Token }}
</div>
<p>验证码有效期有限，请尽快在注册页面中填写。</p>
<p>如果不是你本人操作，可以忽略这封邮件。</p>
```

为什么用 `{{ .Token }}`：用户看到的是 6 位验证码，不是英文确认链接；也能避开部分邮箱自动预加载确认链接导致验证码失效的问题。

### 2.3 配置自定义 SMTP

进入：

```text
Authentication -> Emails -> SMTP Settings
```

填这些：

```text
Sender name: PromptReel
Sender email: no-reply@daihuo.icu
Host: 你的 SMTP host
Port: 通常是 465 或 587
Username: SMTP 用户名
Password: SMTP 授权码/密码
```

你需要先准备一个 SMTP 服务。面向 QQ 邮箱用户，优先考虑腾讯企业邮箱、阿里企业邮箱、SendCloud、网易企业邮这类国内送达更稳定的服务。准备好后，把 Host、Port、Username、Password 给我，我可以帮你判断填法。

### 2.4 必测

用一个从没注册过的新邮箱测试：

1. 打开 `https://www.daihuo.icu/register`。
2. 输入邮箱和密码。
3. 收到中文验证码邮件。
4. 输入 6 位验证码。
5. 自动进入工作台。

## 3. LemonSqueezy 收费配置

为什么这么做：代码已经接好了 LemonSqueezy 的 checkout 和 webhook。你只需要在后台创建产品、拿到 3 个 Variant ID、API Key、Store ID 和 Webhook Secret。

### 3.1 创建产品和 Variant

1. 登录 LemonSqueezy。
2. Products。
3. New Product。
4. 产品名填：`PromptReel`。
5. 产品类型选择订阅 / Subscription。
6. 创建 3 个 Variant：

```text
基础版：¥29 / 月，50 次/月
专业版：¥69 / 月，200 次/月
无限版：¥129 / 月，不限次数
```

如果 LemonSqueezy 后台不能直接用人民币，就先用 USD 等价定价；这会影响国内用户支付体验，后续最好切微信支付/支付宝。

### 3.2 获取 3 个 Variant ID

每个 Variant 都有自己的 ID。常见位置：

1. 打开产品详情。
2. 点某个 Variant 编辑。
3. 看页面 URL 或 Variant 信息里的 ID。
4. 分别记下：

```text
LEMONSQUEEZY_BASIC_VARIANT_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=
LEMONSQUEEZY_UNLIMITED_VARIANT_ID=
```

这些 ID 必须是数字。代码里的生产检查会拦截非数字。

### 3.3 API Key 和 Store ID

1. Settings。
2. API。
3. 生成 API Key，填入：

```text
LEMONSQUEEZY_API_KEY=
```

4. Store ID 通常在 Store 设置或 API/Store 页面里，填入：

```text
LEMONSQUEEZY_STORE_ID=
```

### 3.4 Webhook

进入：

```text
Settings -> Webhooks -> Add webhook
```

Callback URL 填：

```text
https://www.daihuo.icu/api/webhook
```

Signing secret 自己生成一个 6-40 位随机字符串，填到 LemonSqueezy 后台，同时也填到 CloudBase 环境变量：

```text
LEMONSQUEEZY_WEBHOOK_SECRET=
```

事件至少勾选：

```text
subscription_created
subscription_updated
subscription_cancelled
subscription_payment_success
```

为什么需要 webhook：用户付款是在 LemonSqueezy 页面完成的，网站必须靠 webhook 得知“谁付款了、买了哪个套餐”，然后自动加额度。

## 4. 上线前本地检查

每次正式部署前，在本地跑：

```bash
npm run lint
npm run build
npm run check:prod
```

`check:prod` 会检查：

- 环境变量有没有漏。
- 正式域名是否是 HTTPS。
- 是否还在用 `localhost`、`your-domain.com` 或 `vercel.app`。
- Supabase URL 格式是否正确。
- LemonSqueezy Variant ID 是否是数字。
- Webhook Secret 长度是否符合 LemonSqueezy 要求。

## 5. 正式验收清单

1. 不开 VPN，手机 4G/5G 打开 `https://www.daihuo.icu`。
2. 首页、价格页、注册页能打开。
3. 新邮箱能收到中文 6 位验证码。
4. 输入验证码后进入工作台。
5. 上传商品图，生成一次提示词。
6. 免费额度从 3 变成 2。
7. 购买基础版。
8. LemonSqueezy 支付成功后回到账号页。
9. 账号页显示基础版，额度变成 50。
10. LemonSqueezy 后台重发同一个 webhook，不会重复加额度。

## 6. 我还需要你提供的东西

要继续往正式收费走，你下一步给我这些就行：

```text
1. 你准备部署的 CloudBase 地域：大陆已备案 / 香港临时
2. SMTP 服务信息：Host、Port、Username、Password、发件邮箱
3. LemonSqueezy Store ID
4. LemonSqueezy API Key
5. LemonSqueezy 三个 Variant ID
6. LemonSqueezy Webhook Secret
```

只要这些齐了，代码侧已经能接住正式支付、验证码和额度变更。
