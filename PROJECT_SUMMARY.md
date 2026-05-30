# PromptReel - AI 视频提示词生成器 SaaS 项目总结

## 项目概述

这是一个 SaaS 产品，核心功能是：用户上传商品图片 + 填写基本信息 → AI 生成专业的视频提示词（用于 Runway、Pika、Sora 等 AI 视频工具）。

产品本质是一段精心设计的系统提示词（存在 `lib/prompts/system.ts`），通过服务器端注入 Gemini API 调用，用户永远接触不到原始提示词。

**目标用户**：国内带货博主、MCN 机构
**收费模式**：套餐制（免费3次 / 基础版¥29/月50次 / 专业版¥69/月200次 / 无限版¥129/月不限次）
**当前执行标准**：所有后续修改按正式收费上线标准处理，不以“本地测试能跑”为完成标准。

---

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 16 (App Router) | TypeScript, Turbopack |
| 样式 | Tailwind CSS v4 | 清新活力风格，渐变色系 |
| 数据库 | Supabase (PostgreSQL) | 免费额度足够起步 |
| 认证 | Supabase Auth | 邮箱+密码登录，邮箱OTP验证注册 |
| AI | Gemini 2.0 Flash | 通过 OpenAI 兼容代理调用 |
| 支付 | LemonSqueezy | 待接入 |
| 图标 | lucide-react | |

---

## 项目路径

```
C:\Users\Administrator\Desktop\ai-video-prompt
```

---

## 目录结构

```
ai-video-prompt/
├── app/
│   ├── page.tsx                    # 首页（Landing Page）
│   ├── globals.css                 # 全局样式 + 自定义动画
│   ├── layout.tsx                  # 根布局
│   ├── login/page.tsx              # 登录页（邮箱+密码，含忘记密码）
│   ├── register/page.tsx           # 注册页（邮箱+密码+OTP验证码验证）
│   ├── pricing/page.tsx            # 独立定价页（含LemonSqueezy支付跳转）
│   ├── dashboard/
│   │   ├── layout.tsx              # 工作台布局（侧边栏导航）
│   │   ├── page.tsx                # 核心工作台（图片上传+AI生成+结果展示）
│   │   ├── history/page.tsx        # 生成历史记录
│   │   └── account/page.tsx        # 账户管理（套餐信息+使用情况）
│   └── api/
│       ├── generate/route.ts       # AI生成接口（核心，注入系统提示词）
│       ├── checkout/route.ts       # LemonSqueezy支付接口
│       ├── webhook/route.ts        # LemonSqueezy Webhook回调
│       └── user/route.ts           # 用户信息接口
├── components/
│   └── Landing/
│       ├── Navbar.tsx              # 顶部导航栏
│       ├── Hero.tsx                # 首页Hero区域
│       ├── Features.tsx            # 功能特点展示
│       ├── HowItWorks.tsx          # 使用流程展示
│       ├── Pricing.tsx             # 首页定价卡片
│       └── Footer.tsx              # 页脚
├── lib/
│   ├── supabase.ts                 # Supabase客户端（延迟初始化，兼容新旧Key格式）
│   ├── gemini.ts                   # Gemini API封装（通过OpenAI兼容代理）
│   ├── payment.ts                  # LemonSqueezy支付封装
│   └── prompts/
│       └── system.ts               # 核心系统提示词 + 辅助函数 + 常量定义
├── supabase-setup.sql              # 数据库建表SQL
├── fix-trigger.sql                 # 触发器修复SQL（解决注册报错）
├── .env.local                      # 环境变量（已配置Supabase和Gemini代理）
└── package.json
```

---

## 环境变量配置

真实密钥只允许保存在本地 `.env.local` 或部署平台环境变量中，不要写入文档或提交到仓库。可提交的模板见 `.env.example`。

```bash
# App
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Gemini API 代理
GEMINI_API_KEY=
GEMINI_BASE_URL=https://yunwu.ai/v1
GEMINI_MODEL=gemini-2.5-flash

# LemonSqueezy
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_BASIC_VARIANT_ID=
LEMONSQUEEZY_PRO_VARIANT_ID=
LEMONSQUEEZY_UNLIMITED_VARIANT_ID=
```

---

## 数据库设计

### profiles 表（用户资料）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK, FK→auth.users) | 用户ID |
| email | text | 邮箱 |
| plan_type | text | 套餐类型：free/basic/pro/unlimited |
| credits_remaining | int | 剩余生成次数 |
| credits_total | int | 套餐总次数 |
| subscription_id | text | LemonSqueezy订阅ID |
| subscription_status | text | 订阅状态：inactive/active/expired/cancelled/paused |
| current_period_end | timestamptz | 当前订阅周期结束时间 |
| created_at | timestamptz | 创建时间 |
| updated_at | timestamptz | 更新时间 |

### generations 表（生成记录）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid (PK) | 记录ID |
| user_id | uuid (FK→profiles) | 用户ID |
| product_name | text | 商品名称 |
| video_type | text | 视频类型 |
| extra_requirements | text | 额外需求 |
| platform | text | 发布平台 |
| output_prompt | text | 生成的完整提示词 |
| created_at | timestamptz | 创建时间 |

### 触发器
- `on_auth_user_created`：用户注册时自动创建 profiles 记录（默认 free 套餐，3次额度）
- `update_profiles_updated_at`：更新时自动刷新 updated_at

### RLS 策略
- 用户只能读取/更新自己的 profiles 记录
- 用户只能查看/插入自己的 generations 记录

---

## 核心业务流程

### 注册流程
1. 用户输入邮箱+密码
2. 调用 `supabase.auth.signUp()` 创建账号
3. 调用 `supabase.auth.signInWithOtp()` 发送6位验证码到邮箱
4. 用户输入验证码
5. 调用 `supabase.auth.verifyOtp()` 验证
6. 验证成功 → 跳转工作台

### 登录流程
1. 用户输入邮箱+密码
2. 调用 `supabase.auth.signInWithPassword()`
3. 成功 → 跳转工作台

### 忘记密码流程
1. 用户输入邮箱
2. 调用 `supabase.auth.resetPasswordForEmail()`
3. Supabase 发送重置密码邮件（链接方式）

### AI 生成流程（核心）
1. 前端收集：商品图片(转base64) + 商品名称 + 视频类型 + 平台 + 额外需求
2. POST `/api/generate`，Header 带 Bearer token
3. API 验证用户身份 → 检查剩余次数
4. 服务器端组装：系统提示词(`lib/prompts/system.ts`) + 用户输入 + 图片
5. 调用 Gemini API（通过 OpenAI 兼容代理 `https://yunwu.ai/v1`）
6. 返回结构化提示词 → 前端展示 → 扣减次数 → 保存记录

### 支付流程（LemonSqueezy，待完成）
1. 用户选择套餐 → POST `/api/checkout`
2. 创建 LemonSqueezy Checkout Session → 跳转支付页面
3. 支付成功 → LemonSqueezy 发送 Webhook 到 `/api/webhook`
4. Webhook 更新用户的 plan_type、credits、subscription 信息

---

## 提示词保护机制

这是产品的核心资产，保护措施：
1. 系统提示词仅存储在 `lib/prompts/system.ts`（服务器端文件）
2. API Route (`/api/generate`) 在服务器端拼接提示词并调用 Gemini
3. 前端只调用自己的 API，永远接触不到系统提示词
4. 用户输入和输出都不包含原始系统提示词

---

## UI 风格

- 主题：清新活力风
- 主色：渐变色系（indigo → purple → cyan）
- 背景：白色 + 浅灰色，带模糊光晕装饰
- 组件：圆角卡片、玻璃效果、悬浮动画
- 自定义 CSS 类：`.gradient-text`、`.gradient-btn`、`.glass`、`.card-hover`、`.animated-gradient`、`.prompt-module`

---

## 当前状态

### 已完成
- [x] 项目初始化（Next.js + Tailwind + 依赖安装）
- [x] Supabase 数据库建表 + 触发器 + RLS
- [x] Landing Page（首页完整）
- [x] 认证系统（注册OTP验证 + 登录密码 + 忘记密码）
- [x] 核心工作台（图片上传 + AI生成 + 10模块展示 + 一键复制）
- [x] 历史记录页面
- [x] 账户管理页面
- [x] 定价页面
- [x] API Routes（generate + checkout + webhook + user）
- [x] Supabase 环境变量配置
- [x] Gemini API 代理配置
- [x] 本地构建通过（`npm run build` 成功）

### 待完成
- [ ] LemonSqueezy 支付接入（需要注册账号、创建产品、获取Key）
- [ ] 域名购买和绑定
- [ ] 部署到 Vercel
- [ ] Supabase Email 模板自定义（可选）
- [ ] IP 限流防白嫖（可选）
- [ ] 生产环境优化

---

## 已知问题

1. **注册触发器**：已用 `fix-trigger.sql` 修复，需在 Supabase SQL Editor 执行
2. **邮箱验证**：Supabase 需开启 "Enable email OTP" 选项，否则验证码发不出
3. **Gemini 代理**：使用的是第三方代理 `yunwu.zeabur.app`，非 Google 官方 API，稳定性取决于代理服务
4. **LemonSqueezy**：代码已写好但未配置，需要用户注册并获取相关 ID

---

## 启动方式

```bash
cd C:\Users\Administrator\ai-video-prompt
npm run dev
```

访问 http://localhost:3000

---

## 关键文件说明

| 文件 | 重要程度 | 说明 |
|------|---------|------|
| `lib/prompts/system.ts` | ★★★★★ | 核心资产，系统提示词，不可泄露 |
| `lib/gemini.ts` | ★★★★★ | AI调用封装，注入提示词的关键 |
| `app/api/generate/route.ts` | ★★★★★ | 生成接口，鉴权+调用AI+扣减次数 |
| `app/dashboard/page.tsx` | ★★★★☆ | 核心工作台UI |
| `lib/supabase.ts` | ★★★★☆ | Supabase客户端，延迟初始化 |
| `lib/payment.ts` | ★★★☆☆ | 支付封装，待接入 |
| `supabase-setup.sql` | ★★★☆☆ | 数据库建表脚本 |
| `.env.local` | ★★★☆☆ | 环境变量，含所有密钥 |
