# BESS Site Survey System v2.0 - クイックローカルデプロイ

## 🚀 最速デプロイ手順

### Step 1: 依存関係インストール

```powershell
# バックエンド
npm install

# フロントエンド
cd frontend
npm install
cd ..
```

### Step 2: 環境変数確認

`.env.production` ファイルが作成されています。
Supabaseを使用する場合は、以下を編集してください：

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: アプリケーション起動

#### オプション1: 開発モード（推奨）

**ターミナル1 - バックエンド:**
```powershell
npm run dev
```

**ターミナル2 - フロントエンド:**
```powershell
cd frontend
npm run dev
```

#### オプション2: ビルドして起動

```powershell
# ビルド
npm run build
cd frontend
npm run build
cd ..

# 起動
npm start
```

### Step 4: アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:4000
- **ヘルスチェック**: http://localhost:4000/api/monitoring/health

## ✅ 動作確認

### 1. ヘルスチェック

```powershell
curl http://localhost:4000/api/monitoring/health
```

### 2. メトリクス確認

```powershell
curl http://localhost:4000/api/monitoring/metrics
```

### 3. フロントエンドアクセス

ブラウザで http://localhost:3000 を開く

## 🛠️ トラブルシューティング

### ポートが使用中

```powershell
# ポート4000を使用しているプロセスを確認
netstat -ano | findstr :4000

# プロセスを終了
taskkill /PID <PID> /F
```

### node_modules エラー

```powershell
# クリーンインストール
rm -r node_modules
rm package-lock.json
npm install

cd frontend
rm -r node_modules
rm package-lock.json
npm install
cd ..
```

## 📝 次のステップ

1. Supabaseプロジェクトを作成
2. データベーススキーマを適用
3. テストデータを投入
4. 本番デプロイ

詳細は `DEPLOYMENT_GUIDE_V2.md` を参照してください。
