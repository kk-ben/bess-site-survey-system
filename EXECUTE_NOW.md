# 🚀 今すぐ実行：オンラインデプロイ完了

## 実行する2つのコマンド

### 1️⃣ VPSでスクリプトを実行（3分）

**PowerShellで実行：**

```powershell
# VPSに接続
ssh ubuntu@153.121.61.164

# スクリプトをダウンロード
curl -o deploy.sh https://raw.githubusercontent.com/kk-ben/bess-site-survey-system/main/scripts/online-deploy-complete.sh

# 実行権限を付与
chmod +x deploy.sh

# 実行
./deploy.sh
```

**または、手動で実行：**

```bash
ssh ubuntu@153.121.61.164

cd ~/bess-site-survey-system

# CORS設定を追加
echo "CORS_ORIGIN=https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app" >> .env

# 再起動
pm2 restart bess-api

# 確認
pm2 logs bess-api --lines 20
```

---

### 2️⃣ Supabaseでテストデータを投入（2分）

1. **Supabase Dashboardにアクセス**
   👉 https://supabase.com/dashboard

2. **プロジェクトを選択**
   - プロジェクト: `kcohexmvbccxixyfvjyw`

3. **SQL Editorを開く**
   - 左メニュー → 「SQL Editor」
   - 「New query」をクリック

4. **以下のSQLをコピー＆ペースト**

```sql
-- テストユーザー作成
INSERT INTO users (email, password_hash, name, role, created_at)
VALUES 
  ('admin@bess.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', NOW()),
  ('user@bess.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'user', NOW())
ON CONFLICT (email) DO NOTHING;

-- テストサイト作成
INSERT INTO sites (name, address, latitude, longitude, capacity_mw, status, created_at)
VALUES 
  ('東京テストサイト', '東京都千代田区', 35.6762, 139.6503, 10.5, 'active', NOW()),
  ('大阪テストサイト', '大阪府大阪市', 34.6937, 135.5023, 15.0, 'pending', NOW()),
  ('福岡テストサイト', '福岡県福岡市', 33.5904, 130.4017, 8.5, 'active', NOW())
ON CONFLICT DO NOTHING;

-- 確認
SELECT * FROM sites;
```

5. **「Run」をクリック**

---

## ✅ 動作確認（1分）

### ブラウザでアクセス

👉 https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login

### ログイン情報

- **Email**: `admin@bess.com`
- **Password**: `password123`

### 確認項目

- ✅ ログインページが表示される
- ✅ ログインできる
- ✅ ダッシュボードが表示される
- ✅ サイト一覧に3件のテストサイトが表示される
- ✅ CORSエラーが出ない

---

## 🎉 完了！

すべて成功すれば、BESS Site Survey Systemがオンラインで稼働します！

**システムURL**: https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app

---

## 🔧 トラブルシューティング

### CORSエラーが出る

ブラウザのコンソール（F12）に以下のエラーが表示される：
```
Access to fetch at 'http://153.121.61.164:3000/api/v2/...' has been blocked by CORS policy
```

**解決策**:
```bash
ssh ubuntu@153.121.61.164
cd ~/bess-site-survey-system
cat .env | grep CORS_ORIGIN
# 正しいURLが表示されるか確認
pm2 restart bess-api
```

### ログインできない

**解決策**:
1. Supabaseでユーザーが作成されているか確認
   ```sql
   SELECT * FROM users WHERE email = 'admin@bess.com';
   ```
2. パスワードは `password123` を使用

### サイト一覧が空

**解決策**:
1. Supabaseでサイトデータを確認
   ```sql
   SELECT * FROM sites;
   ```
2. データがない場合は、再度INSERT文を実行

---

## 📞 サポート

問題が発生した場合：

1. VPSログを確認: `ssh ubuntu@153.121.61.164 && pm2 logs bess-api`
2. ブラウザコンソールを確認: F12 → Console
3. Supabaseログを確認: Dashboard → Logs

---

**所要時間**: 合計6分
**難易度**: 簡単（コピー＆ペーストのみ）
