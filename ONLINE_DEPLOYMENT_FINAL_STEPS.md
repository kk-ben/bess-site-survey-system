# 🚀 オンラインデプロイ最終ステップ

## 現在の状況

✅ **Vercel**: `https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app`
✅ **VPS API**: `http://153.121.61.164:3000/api/v2`
✅ **Supabase**: `https://kcohexmvbccxixyfvjyw.supabase.co`

---

## 🎯 今すぐ実行する3つのステップ

### ステップ1: VPSでCORS設定を更新（5分）

VPSにSSH接続してCORS設定を更新します：

```bash
ssh ubuntu@153.121.61.164
```

接続後、以下を実行：

```bash
# .envファイルを編集
cd ~/bess-site-survey-system
nano .env
```

以下の行を追加または更新：

```env
CORS_ORIGIN=https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app
```

保存: `Ctrl + X` → `Y` → `Enter`

アプリケーションを再起動：

```bash
pm2 restart bess-api
pm2 logs bess-api --lines 20
```

---

### ステップ2: Supabaseにテストデータを投入（5分）

1. https://supabase.com/dashboard にアクセス
2. プロジェクト `kcohexmvbccxixyfvjyw` を選択
3. 左メニュー「SQL Editor」をクリック
4. 「New query」をクリック
5. 以下のSQLを貼り付けて実行：

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
```

「Run」をクリックして実行。

---

### ステップ3: 動作確認（3分）

#### 3-1. APIヘルスチェック

ブラウザまたはPowerShellで確認：

```powershell
Invoke-RestMethod -Uri "http://153.121.61.164:3000/api/v2"
```

期待される結果：
```json
{
  "message": "BESS Site Survey System API v2.0",
  "version": "2.0.0",
  "status": "running"
}
```

#### 3-2. フロントエンドアクセス

ブラウザで以下にアクセス：

```
https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login
```

#### 3-3. ログインテスト

- **Email**: `admin@bess.com`
- **Password**: `password123`

（パスワードハッシュは `password123` に対応）

---

## ✅ 成功の確認

以下が確認できればデプロイ完了：

1. ✅ ログインページが表示される
2. ✅ ログインできる
3. ✅ ダッシュボードが表示される
4. ✅ サイト一覧が表示される（3件のテストサイト）
5. ✅ CORSエラーが出ない

---

## 🔧 トラブルシューティング

### CORSエラーが出る場合

ブラウザのコンソールに以下のようなエラーが表示される：
```
Access to fetch at 'http://153.121.61.164:3000/api/v2/...' from origin 'https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app' has been blocked by CORS policy
```

**解決策**:
1. VPSの `.env` ファイルで `CORS_ORIGIN` が正しく設定されているか確認
2. `pm2 restart bess-api` で再起動
3. ブラウザのキャッシュをクリア（Ctrl + Shift + Delete）

### ログインできない場合

**症状**: 「Invalid credentials」エラー

**解決策**:
1. Supabaseでユーザーが作成されているか確認
2. パスワードハッシュが正しいか確認
3. APIが正常に動作しているか確認（`pm2 logs bess-api`）

### サイト一覧が表示されない場合

**症状**: 空のリストが表示される

**解決策**:
1. Supabaseでサイトデータが投入されているか確認
2. SQL Editorで確認：
   ```sql
   SELECT * FROM sites;
   ```

---

## 🎉 デプロイ完了！

すべてのステップが完了すれば、BESS Site Survey Systemがオンラインで稼働します！

**アクセスURL**: https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app

---

**次のステップ**:
- 本番用のユーザーを追加
- 実際のサイトデータをインポート
- カスタムドメインの設定（オプション）
