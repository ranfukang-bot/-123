-- PromptReel 自定义邮箱验证码表
-- 在 Supabase SQL Editor 中执行一次。

CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email_created_at
  ON public.email_verification_codes (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires_at
  ON public.email_verification_codes (expires_at);

ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- 不给 anon/authenticated 开策略：验证码表只能由 service_role 在服务端访问。
