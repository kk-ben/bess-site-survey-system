# 🚀 Vercel バックエンドデプロイ - 詳細ガイド

## 📋 現在の状況

- ✅ フロントエンド：Vercelにデプロイ済み
- ✅ Supabase：設定済み
- ❌ バックエンドAPI：未デプロイ（これから設定）

---

## 🎯 ステップ1：Vercelダッシュボードにアクセス

### 1-1. Vercelダッシュボードを開く
1. ブラウザで https://vercel.com にアクセス
2. ログイン済みの状態で、ダッシュボードが表示されます
3. 左側のメニューから「Projects」をクリック
4. 「bess-site-survey-system」プロジェクトをクリック

### 1-2. プロジェクト画面の確認
- 画面上部にプロジェクト名が表示されます
- タブが表示されます：Overview / Deployments / Analytics / Settings など

---

## 🎯 ステップ2：プロジェクト設定を変更

### 2-1. Settings タブを開く
1. 画面上部の「Settings」タブをクリック
2. 左側のメニューが表示されます

### 2-2. General 設定を開く
1. 左側メニューの「General」をクリック
2. 「Build & Development Settings」セクションまでスクロール

### 2-3. Root Directory を変更
**現在の設定：**
```
Root Directory: frontend
```

**変更後：**
```
Root Directory: (空欄のまま)
```

**操作方法：**
1. 「Root Directory」の右側にある「Edit」ボタンをクリック
2. 入力欄の内容（`frontend`）を削除
3. 空欄のまま「Save」ボタンをクリック

### 2-4. Framework Preset を確認
**設定：**
```
Framework Preset: Other
```
（Viteではなく、Otherに変更）

**操作方法：**
1. 「Framework Preset」の右側にある「Edit」ボタンをクリック
2. ドロップダウンから「Other」を選択
3. 「Save」ボタンをクリック

### 2-5. Build Command を設定
**設定：**
```
Build Command: npm run build
```

**操作方法：**
1. 「Build Command」の右側にある「Edit」ボタンをクリック
2. 入力欄に `npm run build` と入力
3. 「Save」ボタンをクリック

### 2-6. Output Directory を設定
**設定：**
```
Output Directory: frontend/dist
```

**操作方法：**
1. 「Output Directory」の右側にある「Edit」ボタンをクリック
2. 入力欄に `frontend/dist` と入力
3. 「Save」ボタンをクリック

### 2-7. Install Command を設定
**設定：**
```
Install Command: npm install && cd frontend && npm install
```

**操作方法：**
1. 「Install Command」の右側にある「Edit」ボタンをクリック
2. 入力欄に `npm install && cd frontend && npm install` と入力
3. 「Save」ボタンをクリック

---

## 🎯 ステップ3：環境変数を追加

### 3-1. Environment Variables を開く
1. 左側メニューの「Environment Variables」をクリック
2. 既存の環境変数が表示されます（VITE_SUPABASE_URL など）

### 3-2. DATABASE_URL を追加

**操作方法：**
1. 「Add New」ボタンをクリック
2. 以下を入力：
   - **Name**: `DATABASE_URL`
   - **Value**: Supabaseの接続文字列（後述）
   - **Environment**: `Production`, `Preview`, `Development` すべてにチェック
3. 「Save」ボタンをクリック

**DATABASE_URLの取得方法：**
1. 新しいタブで https://supabase.com を開く
2. プロジェクトを選択
3. 左側メニュー「Settings」→「Database」をクリック
4. 「Connection string」セクションの「URI」をコピー
5. 形式：`postgresql://postgres:[YOUR-PASSWORD]@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres`
6. `[YOUR-PASSWORD]` を実際のパスワードに置き換える

### 3-3. JWT_SECRET を追加

**操作方法：**
1. 「Add New」ボタンをクリック
2. 以下を入力：
   - **Name**: `JWT_SECRET`
   - **Value**: 強力なランダム文字列（32文字以上）
   - **Environment**: `Production`, `Preview`, `Development` すべてにチェック
3. 「Save」ボタンをクリック

**JWT_SECRETの生成方法：**
PowerShellで以下を実行：
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```
出力された文字列をコピーして使用

### 3-4. NODE_ENV を追加

**操作方法：**
1. 「Add New」ボタンをクリック
2. 以下を入力：
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: `Production` のみにチェック
3. 「Save」ボタンをクリック

### 3-5. REDIS_URL を追加（オプション）

**注意：** Redisは必須ではありません。後で追加可能です。

**操作方法：**
1. 「Add New」ボタンをクリック
2. 以下を入力：
   - **Name**: `REDIS_URL`
   - **Value**: `redis://default:dummy@localhost:6379` （一時的なダミー値）
   - **Environment**: `Production`, `Preview`, `Development` すべてにチェック
3. 「Save」ボタンをクリック

---

## 🎯 ステップ4：Supabaseデータベースのセットアップ

### 4-1. Supabase SQL Editorを開く
1. https://supabase.com にアクセス
2. プロジェクトを選択
3. 左側メニュー「SQL Editor」をクリック

### 4-2. マイグレーションSQLを実行
1. 「New query」ボタンをクリック
2. 以下のSQLをコピー＆ペースト：

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

3. 「Run」ボタンをクリック
4. 「Success」メッセージが表示されることを確認

---

## 🎯 ステップ5：再デプロイ

### 5-1. Deployments タブを開く
1. Vercelダッシュボードに戻る
2. 画面上部の「Deployments」タブをクリック

### 5-2. 最新のデプロイを確認
1. 一番上に表示されているデプロイ（最新）をクリック
2. デプロイの詳細画面が表示されます

### 5-3. 再デプロイを実行
1. 画面右上の「...」（3点メニュー）をクリック
2. 「Redeploy」を選択
3. 確認ダイアログで「Redeploy」ボタンをクリック

### 5-4. ビルドの進行を確認
1. ビルドログが表示されます
2. 以下のステップが実行されます：
   - Installing dependencies...
   - Building backend...
   - Building frontend...
   - Deploying...
3. 「Ready」と表示されるまで待機（2-5分）

---

## 🎯 ステップ6：動作確認

### 6-1. アプリにアクセス
1. ブラウザで https://bess-site-survey-system.vercel.app を開く
2. ログイン画面が表示されることを確認

### 6-2. ログインテスト
1. 以下の情報でログイン：
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
2. 「ログイン」ボタンをクリック
3. ダッシュボードが表示されれば成功！

### 6-3. エラーチェック
1. F12キーを押して開発者ツールを開く
2. Consoleタブを確認
3. エラーがないことを確認

---

## 🐛 トラブルシューティング

### ビルドエラーが発生した場合

**エラー例：**
```
Error: Cannot find module 'xxx'
```

**解決方法：**
1. Vercel Dashboard → Settings → General
2. 「Node.js Version」を確認
3. `20.x` に設定されているか確認
4. 再デプロイ

### データベース接続エラー

**エラー例：**
```
Error: Connection refused
```

**解決方法：**
1. Vercel Dashboard → Settings → Environment Variables
2. `DATABASE_URL` の値を確認
3. Supabaseのパスワードが正しいか確認
4. 再デプロイ

### CORS エラーが続く場合

**解決方法：**
1. バックエンドのCORS設定を確認
2. `src/index.ts` でVercel URLが許可されているか確認

---

## ✅ 完了チェックリスト

- [ ] ステップ1：Vercelダッシュボードにアクセス
- [ ] ステップ2：プロジェクト設定を変更
  - [ ] Root Directory を空欄に
  - [ ] Framework Preset を Other に
  - [ ] Build Command を設定
  - [ ] Output Directory を設定
  - [ ] Install Command を設定
- [ ] ステップ3：環境変数を追加
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
  - [ ] NODE_ENV
  - [ ] REDIS_URL（オプション）
- [ ] ステップ4：Supabaseデータベースのセットアップ
  - [ ] マイグレーションSQL実行
  - [ ] 初期ユーザー作成確認
- [ ] ステップ5：再デプロイ
  - [ ] Redeploy実行
  - [ ] ビルド成功確認
- [ ] ステップ6：動作確認
  - [ ] ログイン画面表示
  - [ ] ログイン成功
  - [ ] ダッシュボード表示

---

## 📸 スクリーンショット付きガイド

### ステップ2-3: Root Directory の変更

**画面イメージ：**
```
Build & Development Settings
┌─────────────────────────────────────┐
│ Root Directory                      │
│ ┌─────────────────────────────┐    │
│ │ frontend                    │ Edit│
│ └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Editをクリック後：**
```
┌─────────────────────────────────────┐
│ Root Directory                      │
│ ┌─────────────────────────────┐    │
│ │ [空欄にする]                │    │
│ └─────────────────────────────┘    │
│ [Cancel] [Save]                     │
└─────────────────────────────────────┘
```

### ステップ3-2: 環境変数の追加

**画面イメージ：**
```
Environment Variables
┌─────────────────────────────────────┐
│ [Add New] ボタン                    │
└─────────────────────────────────────┘

既存の変数：
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

**Add New をクリック後：**
```
┌─────────────────────────────────────┐
│ Name                                │
│ ┌─────────────────────────────┐    │
│ │ DATABASE_URL                │    │
│ └─────────────────────────────┘    │
│                                     │
│ Value                               │
│ ┌─────────────────────────────┐    │
│ │ postgresql://postgres:...   │    │
│ └─────────────────────────────┘    │
│                                     │
│ Environments                        │
│ ☑ Production                        │
│ ☑ Preview                           │
│ ☑ Development                       │
│                                     │
│ [Cancel] [Save]                     │
└─────────────────────────────────────┘
```

---

## 🔑 必要な情報まとめ

### Supabaseから取得する情報

1. **Project URL** (既に設定済み)
   - 場所：Settings → API → Project URL
   - 例：`https://kcohexmvbccxixyfvjyw.supabase.co`

2. **Anon Key** (既に設定済み)
   - 場所：Settings → API → Project API keys → anon public
   - 例：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. **Database URL** (新規追加)
   - 場所：Settings → Database → Connection string → URI
   - 例：`postgresql://postgres:[YOUR-PASSWORD]@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres`
   - ⚠️ `[YOUR-PASSWORD]` を実際のパスワードに置き換える

### 生成する情報

4. **JWT_SECRET** (新規生成)
   - PowerShellで生成：
   ```powershell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   ```
   - 例：`aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3`

---

## 📝 設定値の例

```env
# Vercel Environment Variables

# フロントエンド用（既存）
VITE_SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# バックエンド用（新規追加）
DATABASE_URL=postgresql://postgres:your_password@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres
JWT_SECRET=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1
NODE_ENV=production
REDIS_URL=redis://default:dummy@localhost:6379
```

---

## 🚀 次のステップ

すべての設定が完了したら：

1. ✅ 設定を保存
2. ✅ 再デプロイを実行
3. ✅ ビルドログを確認
4. ✅ アプリにアクセス
5. ✅ ログインテスト

**準備完了！設定を開始しましょう！**

---

## 💡 ヒント

- 各設定を変更するたびに「Save」を忘れずにクリック
- 環境変数は後から編集可能
- 再デプロイは何度でも実行可能
- ビルドエラーが出たら、ログを確認して修正

