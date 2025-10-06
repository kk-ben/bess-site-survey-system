# 🚀 Vercel即時デプロイガイド

## ✅ 準備完了

- ✅ フロントエンドビルド成功
- ✅ 環境変数設定完了
- ✅ GitHubにプッシュ済み
- ✅ バックエンドAPI稼働中

---

## 🎯 Vercelデプロイ手順（10分）

### ステップ1: Vercelにアクセス

https://vercel.com にアクセスしてログイン

---

### ステップ2: 新しいプロジェクトを作成

1. 「Add New...」→「Project」をクリック
2. GitHubリポジトリを接続（初回のみ）
3. 「bess-site-survey-system」リポジトリを選択
4. 「Import」をクリック

---

### ステップ3: プロジェクト設定

#### Framework Preset
```
Framework: Vite
```

#### Root Directory
```
Root Directory: frontend
```

**重要**: 「Edit」をクリックして `frontend` を指定

#### Build Settings（自動検出されます）
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

---

### ステップ4: 環境変数を設定

「Environment Variables」セクションで以下を追加：

#### Variable 1
```
Name: VITE_API_BASE_URL
Value: http://153.121.61.164:3000/api/v2
```

#### Variable 2
```
Name: VITE_SUPABASE_URL
Value: https://kcohexmvbccxixyfvjyw.supabase.co
```

#### Variable 3
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
```

---

### ステップ5: デプロイ実行

「Deploy」ボタンをクリック

デプロイには3-5分かかります。

---

## ✅ デプロイ完了後の確認

### 1. デプロイURLを確認

Vercelが自動生成したURL（例: `https://bess-site-survey-system.vercel.app`）にアクセス

### 2. 動作確認

- ✅ ログインページが表示される
- ✅ ダッシュボードにアクセスできる
- ✅ サイト一覧ページが表示される

---

## 🔧 トラブルシューティング

### ビルドエラーが発生した場合

**エラー**: "Root Directory not found"
**解決**: Root Directoryを `frontend` に設定

**エラー**: "Build failed"
**解決**: ローカルでビルドテスト
```powershell
cd frontend
npm install
npm run build
```

### CORS エラーが発生した場合

VPS側でCORS設定を更新：

```bash
ssh ubuntu@153.121.61.164
cd ~/bess-site-survey-system
nano .env
```

以下を追加：
```
CORS_ORIGIN=https://your-vercel-url.vercel.app
```

再起動：
```bash
pm2 restart bess-api
```

---

## 🎊 完了！

Vercelデプロイが完了しました！

**次のステップ**:
1. テストデータを投入（Supabase Dashboard）
2. フロントエンドからサイト一覧を確認
3. システム全体の動作確認

---

## 📝 デプロイURL

デプロイ完了後、以下のURLでアクセスできます：

```
https://bess-site-survey-system.vercel.app
```

または

```
https://bess-site-survey-system-[your-username].vercel.app
```

このURLをメモしておいてください！

