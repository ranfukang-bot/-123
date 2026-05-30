-- 修复注册触发器
-- 在 Supabase SQL Editor 中执行

-- 1. 删除旧触发器和函数（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. 重新创建函数，添加异常处理
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan_type, credits_remaining, credits_total, subscription_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    'free',
    3,
    3,
    'inactive'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. 确保 profiles 表的 INSERT 权限
GRANT INSERT ON public.profiles TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
