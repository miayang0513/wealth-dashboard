-- Supabase 資料表結構
-- 在 Supabase Dashboard 的 SQL Editor 中執行此腳本

-- 建立 transactions 資料表
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  date TIMESTAMP NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  original_amount NUMERIC(15, 2) NOT NULL,
  final_amount NUMERIC(15, 2),
  currency TEXT NOT NULL DEFAULT 'USD',
  share NUMERIC(1, 0) DEFAULT 0,
  exclude NUMERIC(1, 0) DEFAULT 0,
  gf NUMERIC(1, 0) DEFAULT 0,
  girl_friend_percentage NUMERIC(5, 2) DEFAULT 0,
  trip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  -- 已移除唯一約束，允許重複數據
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);

-- 建立 updated_at 自動更新 trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 啟用 Row-Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 建立 Policy：允許所有人讀取（個人使用，可根據需求調整）
CREATE POLICY "Allow public read access"
  ON transactions
  FOR SELECT
  USING (true);

-- 建立 Policy：允許所有人插入（個人使用，可根據需求調整）
CREATE POLICY "Allow public insert access"
  ON transactions
  FOR INSERT
  WITH CHECK (true);

-- 建立 Policy：允許所有人更新（個人使用，可根據需求調整）
CREATE POLICY "Allow public update access"
  ON transactions
  FOR UPDATE
  USING (true);

-- 建立 Policy：允許所有人刪除（個人使用，可根據需求調整）
CREATE POLICY "Allow public delete access"
  ON transactions
  FOR DELETE
  USING (true);

