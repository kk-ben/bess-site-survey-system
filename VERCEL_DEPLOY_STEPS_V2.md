# 🚀 Vercel フロントエンドデプロイ手順（v2.0対応）

## 📋 前提条件

- ✅ v2.0 APIがVPSで稼働中
- ✅ GitHubに最新コードがプッシュ済み
- ✅ Vercelアカウント作成済み

---

## 🎯 デプロイ手順

### ステップ1: Vercelにログイン

https://vercel.com にアクセスしてログイン

---

### ステップ2: 新しいプロジェクトをインポート

1. 「Add New...」→「Project」をクリック
2. GitHubリポジトリ「bess-site-survey-system」を選択
3. 「Import」をクリック

---

### ステップ3: プロジェクト設定

#### Framework Preset
- **Framework**: Vite

#### Root Directory
- **Root Directory**: `frontend`

#### Build Settings
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

### ステップ4: 環境変数を設定

「Environment Variables」セクションで以下を追加：

```
VITE_API_BASE_URL=http://153.121.61.164:3000/api/v2
VITE_SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
```

---

### ステップ5: デプロイ実行

「Deploy」ボタンをクリック

デプロイには3-5分かかります。

---

## ✅ デプロイ完了後の確認

### 1. デプロイURL確認

Vercelが自動生成したURL（例: `https://bess-site-survey-system.vercel.app`）にアクセス

### 2. 動作確認

- ログインページが表示されるか
- ダッシュボードにアクセスできるか
- サイト一覧が表示されるか（テストデータ投入後）

---

## 🔧 CORS設定（必要な場合）

フロントエンドからAPIにアクセスできない場合、VPS側でCORS設定を更新：

```bash
ssh ubuntu@153.121.61.164
cd ~/bess-site-survey-system
nano .env
```

以下を追加/更新：

```bash
CORS_ORIGIN=https://bess-site-survey-system.vercel.app
```

PM2再起動：

```bash
pm2 restart bess-api
```

---

## 📊 カスタムドメイン設定（オプション）

### Vercel側

1. プロジェクト設定 → 「Domains」
2. カスタムドメインを追加
3. DNS設定の指示に従う

### DNS設定

ドメインプロバイダーで以下を設定：

```
Type: CNAME
Name: www (または @)
Value: cname.vercel-dns.com
```

---

## 🎯 次のステップ

1. ✅ フロントエンドをVercelにデプロイ ← 今実行中
2. 📊 Supabaseにテストデータ投入
3. 🧪 エンドツーエンドテスト
4. 🎊 本番運用開始！

---

## 📝 トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドテスト
cd frontend
npm install
npm run build
```

### API接続エラー

1. ブラウザのコンソールでエラー確認
2. VPS側のCORS設定確認
3. 環境変数が正しく設定されているか確認

### デプロイ失敗

1. Vercelのビルドログを確認
2. package.jsonの依存関係を確認
3. Node.jsバージョンを確認（.nvmrcで指定可能）

---

## 🎊 完了！

フロントエンドがVercelにデプロイされました！

次はテストデータを投入して、システム全体の動作確認を行いましょう。

