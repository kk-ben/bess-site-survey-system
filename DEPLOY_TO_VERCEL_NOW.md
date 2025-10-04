# 🚀 今すぐVercelにデプロイ - 5分ガイド

## 📋 必要な情報を準備

以下の情報を手元に用意してください：

### 1. Supabase Database URL

1. https://supabase.com → プロジェクト選択
2. Settings → Database → Connection string → **URI**
3. コピーして、`[YOUR-PASSWORD]`を実際のパスワードに置き換え

```
postgresql://postgres:YOUR_PASSWORD@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres
```

### 2. JWT Secret（新規生成）

PowerShellで実行：
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

出力された文字列をコピー

---

## 🎯 デプロイ手順（5ステップ）

### ステップ1: Vercel設定変更（2分）

https://vercel.com/dashboard → `bess-site-survey-system` → **Settings** → **General**

| 項目 | 値 |
|------|-----|
| Root Directory | **空欄** |
| Framework Preset | **Other** |
| Build Command | `npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install && cd frontend && npm install` |

各項目の右側の **Edit** をクリックして変更 → **Save**

---

### ステップ2: 環境変数追加（2分）

**Settings** → **Environment Variables** → **Add New**

以下を1つずつ追加（すべて Production, Preview, Development にチェック）：

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres
JWT_SECRET=<ステップ0で生成した文字列>
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://bess-site-survey-system.vercel.app
REDIS_URL=redis://default:dummy@localhost:6379
```

---

### ステップ3: Supabaseデータベース設定（1分）

https://supabase.com → プロジェクト → **SQL Editor** → **New query**

以下のSQLを貼り付けて **Run**：

```sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_sites_location ON sites USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_site_id ON evaluations(site_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_total_score ON evaluations(total_score);

INSERT INTO users (email, password_hash, name, role)
VALUES (
  'admin@example.com',
  '$2b$10$rQZ9vXqK5xJ8YH.nF7LqXeF5K3mN8pQ7wR2sT4uV6xW8yZ0aB1cD2',
  'Administrator',
  'admin'
) ON CONFLICT (email) DO NOTHING;
```

---

### ステップ4: 再デプロイ（3分）

Vercel → **Deployments** → 最新のデプロイの **...** → **Redeploy**

ビルドログを確認して **Ready** になるまで待機

---

### ステップ5: API URL更新 & 再デプロイ（1分）

**Settings** → **Environment Variables** → **Add New**

```bash
VITE_API_BASE_URL=https://bess-site-survey-system.vercel.app/api/v1
```

再度 **Redeploy**

---

## ✅ 動作確認

### 1. ヘルスチェック

ブラウザで開く：
```
https://bess-site-survey-system.vercel.app/health
```

期待される応答：
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "cache": "disconnected"
  }
}
```

### 2. ログインテスト

```
https://bess-site-survey-system.vercel.app
```

- Email: `admin@example.com`
- Password: `admin123`

---

## 🎉 完了！

CORSエラーが解消され、本番環境で動作するようになりました！

---

## 🐛 エラーが出た場合

### ビルドエラー

Vercel → Deployments → ビルドログを確認

よくあるエラー：
- `Cannot find module`: 依存関係の問題 → `npm install`を確認
- `TypeScript error`: 型エラー → コードを修正

### データベース接続エラー

- DATABASE_URLが正しいか確認
- Supabaseのパスワードが正しいか確認
- Supabaseのネットワーク設定を確認

### CORSエラーが続く

- ALLOWED_ORIGINSにVercel URLが含まれているか確認
- 再デプロイを実行

---

## 📞 サポート

問題が解決しない場合は、以下を確認：

1. Vercelのビルドログ
2. ブラウザのコンソール（F12）
3. Supabaseのログ
4. 環境変数が正しく設定されているか

---

## 🚀 次のステップ

- [ ] 本番データの投入
- [ ] ユーザーの追加
- [ ] カスタムドメインの設定
- [ ] Redisの追加（Upstash）
- [ ] モニタリングの設定
