# Supabase Service Key取得方法

## 手順（1分）

1. **Supabase Dashboardにアクセス**
   👉 https://supabase.com/dashboard

2. **プロジェクトを選択**
   - プロジェクト: `kcohexmvbccxixyfvjyw`

3. **Settings → API に移動**
   - 左メニュー → 「Settings」
   - 「API」をクリック

4. **Service Role Keyをコピー**
   - 「Project API keys」セクション
   - 「service_role」の「secret」をコピー
   - ⚠️ これは秘密鍵です！安全に保管してください

5. **環境変数に設定**

### Windows (PowerShell)
```powershell
$env:SUPABASE_SERVICE_KEY="eyJhbGc...your-key-here"
```

### Linux/Mac
```bash
export SUPABASE_SERVICE_KEY="eyJhbGc...your-key-here"
```

---

## スクリプト実行

環境変数を設定したら、スクリプトを実行：

```powershell
node bess-site-survey-system/scripts/deploy-via-api.js
```

---

## 期待される出力

```
🚀 BESS Site Survey System - API経由デプロイ開始

================================================

📡 VPS APIヘルスチェック中...
✅ VPS API正常稼働中
   レスポンス: {"message":"BESS Site Survey System API v2.0"...}

👤 テストユーザー作成中...
✅ テストユーザー作成完了
   作成数: 2件

🏢 テストサイト作成中...
✅ テストサイト作成完了
   作成数: 3件

================================================
🎉 デプロイ完了！

結果:
  VPS API: ✅ 正常
  ユーザー: ✅ 作成完了
  サイト: ✅ 作成完了

次のステップ:
  1. Vercelにアクセス
     https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login
  2. ログイン
     Email: admin@bess.com
     Password: password123
================================================
```

---

## トラブルシューティング

### VPS API接続エラー

**症状**: `❌ VPS API接続タイムアウト`

**解決策**:
1. VPSが起動しているか確認
   ```bash
   ssh ubuntu@153.121.61.164
   pm2 status
   ```
2. APIが正常に動作しているか確認
   ```bash
   curl http://localhost:3000/api/v2
   ```

### Supabase接続エラー

**症状**: `❌ Supabase接続エラー`

**解決策**:
1. Service Keyが正しいか確認
2. Supabaseプロジェクトが稼働しているか確認
3. RLS (Row Level Security) ポリシーを確認

---

## 手動でデータ投入する場合

スクリプトが動作しない場合は、Supabase SQL Editorで直接実行：

```sql
-- テストユーザー
INSERT INTO users (email, password_hash, name, role, created_at)
VALUES 
  ('admin@bess.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', NOW()),
  ('user@bess.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'user', NOW())
ON CONFLICT (email) DO NOTHING;

-- テストサイト
INSERT INTO sites (name, address, latitude, longitude, capacity_mw, status, created_at)
VALUES 
  ('東京テストサイト', '東京都千代田区', 35.6762, 139.6503, 10.5, 'active', NOW()),
  ('大阪テストサイト', '大阪府大阪市', 34.6937, 135.5023, 15.0, 'pending', NOW()),
  ('福岡テストサイト', '福岡県福岡市', 33.5904, 130.4017, 8.5, 'active', NOW())
ON CONFLICT DO NOTHING;
```
