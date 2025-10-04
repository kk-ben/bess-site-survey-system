# ✅ GitHubプッシュ完了！次のステップ

## 🎉 完了したこと

✅ コードの変更をコミット  
✅ GitHubにプッシュ（commit: dd812d6）  
✅ Vercelの自動デプロイが開始

---

## 🚀 次に実行すること

### ステップ1: Vercelダッシュボードを確認（1分）

1. https://vercel.com/dashboard を開く
2. `bess-site-survey-system` プロジェクトをクリック
3. **Deployments** タブで、新しいデプロイが進行中であることを確認

**注意**: このデプロイは**環境変数が設定されていないため失敗する可能性があります**。これは正常です。

---

### ステップ2: Vercel設定を変更（2分）

**Settings** → **General** で以下を変更：

| 設定項目 | 変更後の値 |
|---------|-----------|
| Root Directory | **空欄** |
| Framework Preset | **Other** |
| Build Command | `npm run build` |
| Output Directory | `frontend/dist` |
| Install Command | `npm install && cd frontend && npm install` |

各項目の **Edit** をクリック → 変更 → **Save**

---

### ステップ3: 環境変数を追加（3分）

**Settings** → **Environment Variables** → **Add New**

#### 必須の環境変数

```bash
# 1. DATABASE_URL
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres
```

**取得方法**:
1. https://supabase.com → プロジェクト選択
2. Settings → Database → Connection string → URI
3. `[YOUR-PASSWORD]` を実際のパスワードに置き換え

```bash
# 2. JWT_SECRET（新規生成）
JWT_SECRET=<32文字以上のランダム文字列>
```

**生成方法**:
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

```bash
# 3. その他の環境変数
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://bess-site-survey-system.vercel.app
REDIS_URL=redis://default:dummy@localhost:6379
```

すべて **Production, Preview, Development** にチェック

---

### ステップ4: Supabaseデータベースをセットアップ（1分）

https://supabase.com → プロジェクト → **SQL Editor** → **New query**

以下のSQLを実行：

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

### ステップ5: 再デプロイ（3分）

Vercel → **Deployments** → 最新のデプロイの **...** → **Redeploy**

ビルドログを確認して **Ready** になるまで待機

---

### ステップ6: API URLを追加 & 再デプロイ（1分）

**Settings** → **Environment Variables** → **Add New**

```bash
VITE_API_BASE_URL=https://bess-site-survey-system.vercel.app/api/v1
```

再度 **Redeploy**

---

### ステップ7: 動作確認（1分）

#### ヘルスチェック
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

#### ログインテスト
```
https://bess-site-survey-system.vercel.app
```

- Email: `admin@example.com`
- Password: `admin123`

---

## 📚 詳細ガイド

より詳しい手順は以下のドキュメントを参照：

- **DEPLOY_TO_VERCEL_NOW.md** - 5分クイックガイド
- **VERCEL_DEPLOY_STEPS.md** - 詳細な手順書
- **CORS_FIX_GUIDE.md** - 技術的な解説

---

## 🐛 トラブルシューティング

### ビルドエラー

Vercel → Deployments → ビルドログを確認

### データベース接続エラー

- DATABASE_URLが正しいか確認
- Supabaseのパスワードが正しいか確認

### CORSエラーが続く

- ALLOWED_ORIGINSにVercel URLが含まれているか確認
- 再デプロイを実行

---

## ✅ チェックリスト

- [ ] Vercelダッシュボードを確認
- [ ] Vercel設定を変更
- [ ] 環境変数を追加
- [ ] Supabaseデータベースをセットアップ
- [ ] 再デプロイ
- [ ] API URLを追加
- [ ] 再度デプロイ
- [ ] ヘルスチェック
- [ ] ログインテスト

---

## 🎉 完了後

すべてのステップが完了したら、CORSエラーが解消され、本番環境で完全に動作するようになります！

次は **DEPLOY_TO_VERCEL_NOW.md** を開いて、環境変数の設定を開始してください。
