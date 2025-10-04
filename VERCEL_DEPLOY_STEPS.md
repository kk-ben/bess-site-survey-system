# 🚀 Vercel バックエンドデプロイ - 実行手順

## 📋 前提条件

- ✅ GitHubリポジトリにコードがプッシュされている
- ✅ Vercelアカウントがある
- ✅ Supabaseプロジェクトが設定済み

---

## 🎯 ステップ1: Vercelプロジェクトの設定変更

### 1. Vercelダッシュボードにアクセス

https://vercel.com/dashboard にアクセスし、`bess-site-survey-system`プロジェクトを開く

### 2. Settings → General

以下の設定を変更：

| 設定項目 | 現在の値 | 変更後の値 |
|---------|---------|-----------|
| Root Directory | `frontend` | **空欄** |
| Framework Preset | Vite | **Other** |
| Build Command | 自動 | `npm run build` |
| Output Directory | 自動 | `frontend/dist` |
| Install Command | 自動 | `npm install && cd frontend && npm install` |

---

## 🎯 ステップ2: 環境変数の追加

### Settings → Environment Variables

以下の環境変数を追加（すべて Production, Preview, Development にチェック）：

#### 必須の環境変数

```bash
# データベース（Supabaseから取得）
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres

# JWT Secret（新規生成）
JWT_SECRET=<32文字以上のランダム文字列>

# 環境
NODE_ENV=production

# CORS設定
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://bess-site-survey-system.vercel.app

# Redis（オプション - 一時的にダミー値）
REDIS_URL=redis://default:dummy@localhost:6379
```

#### フロントエンド用環境変数（既存）

```bash
VITE_SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_MAPS_API_KEY=AIzaSyB4FJFVV_fdxoPOYWuFeTrZoB25KTDiQiw
```

#### バックエンドAPI URL（新規追加）

デプロイ後に追加：
```bash
VITE_API_BASE_URL=https://bess-site-survey-system.vercel.app/api/v1
```

---

## 🎯 ステップ3: JWT_SECRETの生成

PowerShellで実行：

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

出力された文字列をコピーして、`JWT_SECRET`の値として使用

---

## 🎯 ステップ4: DATABASE_URLの取得

1. https://supabase.com にアクセス
2. プロジェクトを選択
3. Settings → Database
4. Connection string → URI をコピー
5. `[YOUR-PASSWORD]` を実際のパスワードに置き換え

---

## 🎯 ステップ5: Supabaseデータベースのセットアップ

### SQL Editorで実行

Supabase → SQL Editor → New query

```sql
-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 候補地テーブル
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  location GEOGRAPHY(POINT, 4326),
  area_sqm DECIMAL(10, 2),
  land_use VARCHAR(100),
  zoning VARCHAR(100),
  owner_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 評価結果テーブル
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  grid_distance DECIMAL(10, 2),
  grid_score INTEGER,
  road_access_score INTEGER,
  setback_compliance BOOLEAN,
  pole_proximity_score INTEGER,
  total_score INTEGER,
  evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  evaluated_by UUID REFERENCES users(id),
  notes TEXT
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_sites_location ON sites USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_site_id ON evaluations(site_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_total_score ON evaluations(total_score);

-- 初期管理ユーザーを作成（パスワード: admin123）
INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@example.com',
  '$2b$10$rQZ9vXqK5xJ8YH.nF7LqXeF5K3mN8pQ7wR2sT4uV6xW8yZ0aB1cD2',
  'Administrator',
  'admin'
) ON CONFLICT (email) DO NOTHING;
```

---

## 🎯 ステップ6: 再デプロイ

### Vercel Dashboardから

1. Deployments タブを開く
2. 最新のデプロイの「...」メニューをクリック
3. **Redeploy** を選択
4. ビルドログを確認（2-5分）

### または、GitHubから

```bash
git add .
git commit -m "Configure backend for Vercel deployment"
git push origin main
```

---

## 🎯 ステップ7: バックエンドAPI URLを更新

デプロイ完了後：

1. Vercel → Settings → Environment Variables
2. `VITE_API_BASE_URL` を追加または更新：
   ```
   VITE_API_BASE_URL=https://bess-site-survey-system.vercel.app/api/v1
   ```
3. 再度デプロイ

---

## 🎯 ステップ8: 動作確認

### 1. APIヘルスチェック

ブラウザで以下にアクセス：
```
https://bess-site-survey-system.vercel.app/health
```

期待される応答：
```json
{
  "status": "healthy",
  "timestamp": "2025-01-04T...",
  "services": {
    "database": "connected",
    "cache": "disconnected"
  },
  "uptime": 123.45
}
```

### 2. フロントエンドからログイン

```
https://bess-site-survey-system.vercel.app
```

ログイン情報：
- Email: `admin@example.com`
- Password: `admin123`

---

## ✅ 完了チェックリスト

- [ ] Vercelプロジェクト設定を変更
- [ ] 環境変数を追加（DATABASE_URL, JWT_SECRET, NODE_ENV, ALLOWED_ORIGINS）
- [ ] JWT_SECRETを生成
- [ ] DATABASE_URLを取得
- [ ] Supabaseデータベースをセットアップ
- [ ] 再デプロイ実行
- [ ] VITE_API_BASE_URLを追加
- [ ] 再度デプロイ
- [ ] ヘルスチェック確認
- [ ] ログインテスト成功

---

## 🐛 トラブルシューティング

### ビルドエラー

```
Error: Cannot find module '@/...'
```

**解決策**: `tsconfig.json`のpathsが正しく設定されているか確認

### データベース接続エラー

```
Error: Connection refused
```

**解決策**: 
1. DATABASE_URLが正しいか確認
2. Supabaseのパスワードが正しいか確認
3. Supabaseのネットワーク設定を確認

### CORSエラー

```
CORS policy: No 'Access-Control-Allow-Origin'
```

**解決策**:
1. ALLOWED_ORIGINSにVercel URLが含まれているか確認
2. 再デプロイ

---

## 📝 次のステップ

デプロイ完了後：

1. ✅ 本番環境でログインテスト
2. ✅ 候補地の追加・評価テスト
3. ✅ エクスポート機能テスト
4. ✅ モバイル表示確認

---

## 💡 ヒント

- 環境変数の変更後は必ず再デプロイが必要
- Redisは後から追加可能（Upstash Redisなど）
- ログはVercel Dashboard → Deployments → Logs で確認
- エラーが出たら、まずビルドログを確認

---

## 🆘 サポート

問題が発生した場合は、以下を確認：

1. Vercelのビルドログ
2. ブラウザのコンソールログ
3. Supabaseのログ
4. 環境変数が正しく設定されているか
