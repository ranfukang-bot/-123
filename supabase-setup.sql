-- ============================================
-- AI 视频提示词生成器 - Supabase 数据库设置
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================

-- 1. 用户资料表
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'pro', 'unlimited')),
  credits_remaining INTEGER DEFAULT 3,
  credits_total INTEGER DEFAULT 3,
  subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'expired', 'cancelled', 'paused')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 生成记录表
CREATE TABLE IF NOT EXISTS generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_name TEXT NOT NULL,
  video_type TEXT NOT NULL,
  extra_requirements TEXT,
  platform TEXT,
  output_prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 创建索引
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

-- 4. RLS (Row Level Security) 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- 用户只能查看和更新自己的资料
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 用户只能查看自己的生成记录
CREATE POLICY "Users can view own generations" ON generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations" ON generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. 自动创建用户资料的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新用户注册时自动创建资料
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. 自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. Webhook 幂等记录表
CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- 8. 原子扣减/退回生成额度
CREATE OR REPLACE FUNCTION consume_generation_credit(target_user_id UUID)
RETURNS TABLE (
  credits_remaining INTEGER,
  plan_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  UPDATE profiles AS p
  SET
    credits_remaining = CASE
      WHEN p.plan_type = 'unlimited' THEN p.credits_remaining
      ELSE p.credits_remaining - 1
    END,
    updated_at = NOW()
  WHERE p.id = target_user_id
    AND (p.plan_type = 'unlimited' OR p.credits_remaining > 0)
  RETURNING p.credits_remaining, p.plan_type;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NO_CREDITS' USING ERRCODE = 'P0001';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION refund_generation_credit(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET
    credits_remaining = LEAST(credits_remaining + 1, credits_total),
    updated_at = NOW()
  WHERE id = target_user_id
    AND plan_type <> 'unlimited';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION consume_generation_credit(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION refund_generation_credit(UUID) TO authenticated, service_role;
