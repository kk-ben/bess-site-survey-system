# 🚀 BESS Site Survey System - オンライン実装クイックスタート

**所要時間**: 約30分  
**コスト**: 無料（Supabase + Vercel無料枠）

---

## 📋 前提条件

✅ Supabaseアカウント（お持ち）  
⚠️ Vercelアカウント（必要 - GitHubで無料登録）  
⚠️ Google Maps APIキー（オプション - 地図機能用）

---

## 🎯 ステップ1: Supabaseプロジェクトの作成（10分）

### 1.1 プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New Project」をクリック
3. 設定:
   - **Name**: `bess-site-survey`
   - **Database Password**: 強力なパスワードを生成（必ず保存！）
   - **Region**: `Northeast Asia (Tokyo)`
   - **Plan**: Free
4. 「Create new project」をクリック（2-3分待機）

### 1.2 PostGIS拡張を有効化

1. 左メニュー → **SQL Editor**
2. 「New query」をクリック
3. 以下のSQLを実行:

```sql
-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 確認
SELECT PostGIS_version();
```

### 1.3 データベーススキーマを作成

SQL Editorで以下を実行:

```sql
-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サイトテーブル
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    capacity_mw DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 送電網資産テーブル
CREATE TABLE grid_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    capacity_mw DECIMAL(10,2),
    voltage_kv DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 設備テーブル
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 電柱テーブル
CREATE TABLE poles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    type VARCHAR(50),
    height_m DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 評価結果テーブル
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    grid_distance_m DECIMAL(10,2),
    grid_score INTEGER,
    pole_distance_m DECIMAL(10,2),
    pole_score INTEGER,
    road_distance_m DECIMAL(10,2),
    road_score INTEGER,
    setback_distance_m DECIMAL(10,2),
    setback_score INTEGER,
    total_score INTEGER,
    evaluation_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_sites_location ON sites USING GIST(location);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_created_at ON sites(created_at);
CREATE INDEX idx_grid_assets_location ON grid_assets USING GIST(location);
CREATE INDEX idx_amenities_location ON amenities USING GIST(location);
CREATE INDEX idx_poles_location ON poles USING GIST(location);
CREATE INDEX idx_evaluations_site_id ON evaluations(site_id);
```

### 1.4 Row Level Security（RLS）を設定

```sql
-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE poles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（認証済みユーザーは全てアクセス可能）
CREATE POLICY "Authenticated users can view users" ON users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view sites" ON sites
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view grid_assets" ON grid_assets
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view amenities" ON amenities
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view poles" ON poles
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view evaluations" ON evaluations
    FOR ALL TO authenticated USING (true);
```

### 1.5 初期管理者ユーザーを作成

```sql
-- パスワード: admin123
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator',
    'admin'
);
```

### 1.6 接続情報を取得

1. 左メニュー → **Settings** → **API**
2. 以下をコピーして保存:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...`（秘密情報！）

3. **Settings** → **Database** → **Connection string**
4. 「URI」をコピー:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

---

## 🌐 ステップ2: Vercelでデプロイ（15分）

### 2.1 Vercelアカウント作成

1. [Vercel](https://vercel.com) にアクセス
2. 「Sign Up」→ GitHubアカウントで登録

### 2.2 GitHubリポジトリの準備

まず、プロジェクトをGitHubにプッシュします：

```bash
# プロジェクトディレクトリに移動
cd bess-site-survey-system

# Gitリポジトリを初期化（まだの場合）
git init
git add .
git commit -m "Initial commit for online deployment"

# GitHubリポジトリを作成して接続
# GitHub.comで新しいリポジトリを作成: bess-site-survey-system
git remote add origin https://github.com/YOUR-USERNAME/bess-site-survey-system.git
git branch -M main
git push -u origin main
```

### 2.3 バックエンドをVercelにデプロイ

1. Vercel Dashboard → 「Add New...」→ 「Project」
2. GitHubリポジトリ `bess-site-survey-system` を選択
3. 設定:
   - **Framework Preset**: Other
   - **Root Directory**: `./`（ルート）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. 「Environment Variables」を追加:

```
NODE_ENV=production
PORT=4000

# Supabaseから取得した情報
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres

# JWT秘密鍵（32文字以上のランダム文字列）
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# CORS設定（後でフロントエンドURLに更新）
CORS_ORIGIN=*

# Google Maps API（オプション）
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Redis（オプション - 後で追加可能）
# REDIS_URL=redis://...
```

5. 「Deploy」をクリック

デプロイ完了後、URLをコピー（例: `https://bess-site-survey-system.vercel.app`）

### 2.4 フロントエンドをVercelにデプロイ

1. Vercel Dashboard → 「Add New...」→ 「Project」
2. 同じGitHubリポジトリを選択
3. 設定:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. 「Environment Variables」を追加:

```
# バックエンドAPI URL（ステップ2.3で取得したURL）
VITE_API_BASE_URL=https://bess-site-survey-system.vercel.app/api/v1

# Supabase情報
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Google Maps API（オプション）
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

5. 「Deploy」をクリック

デプロイ完了後、フロントエンドURLをコピー（例: `https://bess-survey-frontend.vercel.app`）

### 2.5 CORS設定を更新

1. バックエンドプロジェクトの「Settings」→ 「Environment Variables」
2. `CORS_ORIGIN` を編集:
   ```
   CORS_ORIGIN=https://bess-survey-frontend.vercel.app
   ```
3. 「Redeploy」をクリック

---

## ✅ ステップ3: 動作確認（5分）

### 3.1 バックエンドAPIのテスト

ブラウザまたはcurlで確認:

```bash
curl https://bess-site-survey-system.vercel.app/api/v1/health
```

期待されるレスポンス:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-04T...",
  "services": {
    "database": "connected"
  }
}
```

### 3.2 フロントエンドにアクセス

1. ブラウザで `https://bess-survey-frontend.vercel.app` を開く
2. ログイン画面が表示されることを確認
3. 初期ログイン:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`

### 3.3 基本機能のテスト

1. ダッシュボードが表示される
2. サイト一覧ページにアクセス
3. 新しいサイトを作成してみる

---

## 🎉 完了！

オンライン環境が稼働しています！

### アクセスURL

- **フロントエンド**: `https://bess-survey-frontend.vercel.app`
- **バックエンドAPI**: `https://bess-site-survey-system.vercel.app/api/v1`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/xxxxx`

### 初期ログイン情報

- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **セキュリティ**: 本番環境では必ずパスワードを変更してください！

---

## 🔧 次のステップ（オプション）

### カスタムドメインの設定

1. Vercel Dashboard → プロジェクト → Settings → Domains
2. 独自ドメインを追加
3. DNS設定を更新

### Google Maps APIの設定

1. [Google Cloud Console](https://console.cloud.google.com/)
2. Maps JavaScript API を有効化
3. APIキーを取得
4. Vercelの環境変数に追加

### Redisキャッシュの追加（パフォーマンス向上）

1. [Upstash](https://upstash.com) でRedisを作成
2. 接続情報を取得
3. Vercelの環境変数に `REDIS_URL` を追加

### 監視とログ

- **Vercel Analytics**: 自動的に有効
- **Supabase Logs**: Dashboard → Database → Logs
- **Sentry**: エラー追跡（オプション）

---

## 💰 コスト

### 無料枠

- **Supabase Free**: 500MB DB, 1GB Storage, 2GB帯域幅/月
- **Vercel Free**: 100GB帯域幅/月, 6000分ビルド時間/月

### 有料プラン（必要に応じて）

- **Supabase Pro**: $25/月
- **Vercel Pro**: $20/月
- **合計**: 約$45/月（約6,000円）

---

## 🚨 トラブルシューティング

### デプロイエラー

```bash
# Vercelログを確認
vercel logs [deployment-url]
```

### データベース接続エラー

1. Supabase Dashboard → Settings → Database
2. 接続文字列を確認
3. パスワードが正しいか確認

### CORS エラー

1. バックエンドの `CORS_ORIGIN` 環境変数を確認
2. フロントエンドのURLと一致しているか確認
3. 再デプロイ

---

## 📞 サポート

問題が発生した場合:

1. Vercelログを確認
2. Supabaseログを確認
3. ブラウザのコンソールを確認
4. 環境変数を再確認

---

**Happy Deploying! 🚀**
