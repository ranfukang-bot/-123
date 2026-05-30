-- ============================================
-- 额度扣减与 Webhook 幂等函数
-- 已有 Supabase 项目请在 SQL Editor 中单独执行此脚本
-- ============================================

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_generation_credit(target_user_id UUID)
RETURNS TABLE (
  credits_remaining INTEGER,
  plan_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  UPDATE public.profiles AS p
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

CREATE OR REPLACE FUNCTION public.refund_generation_credit(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET
    credits_remaining = LEAST(credits_remaining + 1, credits_total),
    updated_at = NOW()
  WHERE id = target_user_id
    AND plan_type <> 'unlimited';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.consume_generation_credit(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_generation_credit(UUID) TO authenticated, service_role;
