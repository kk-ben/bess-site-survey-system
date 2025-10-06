# 🚀 BESS Site Survey System - Vercelフロントエンドデプロイガイド

## 📋 前提条件

- ✅ GitHubアカウント
- ✅ Vercelアカウント（無料）
- ✅ バックエンドAPIがVPSにデプロイ済み（https://api.ps-system.jp）
- ✅ Supabaseプロジェクト作成済み

---

## 🎯 デプロイ手順

### ステップ1: GitHubリポジトリの確認

プロジェクトがGitHubにプッシュされていることを確認：

```bash
cd bess-site-survey-system
git status
git push origin main
```

---

### ステップ2: Vercelアカウント作成

1. [Vercel](https://vercel.com)にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択
4. GitHubアカウントで認証

---

### ステップ3: プロジェクトをインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」から `bess-site-survey-system` を選択
3. 「Import」をクリック

---

### ステップ4: プロジェクト設定

#### 4.1 Framework Preset

- **Framework Preset**: Vite
- **Root Directory**: `frontend`（重要！）

「Edit」をクリックして `frontend` を指定してください。

#### 4.2 Build Settings

以下の設定が自動的に適用されます：

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

---

### ステップ5: 環境変数の設定

「Environment Variables」セクションで以下を追加：

#### 必須の環境変数

```env
# バックエンドAPI URL
VITE_API_BASE_URL=https://api.ps-system.jp/api/v1

# Supabase設定
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Maps API Key（必要に応じて）
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**重要**: 
- `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` は、Supabaseプロジェクトの「Settings」→「API」から取得
- すべての環境変数は `VITE_` プレフィックスが必要（Viteの仕様）

---

### ステップ6: デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドプロセスが開始されます（約2-3分）
3. デプロイ完了後、URLが表示されます

例: `https://bess-site-survey-system.vercel.app`

---

### ステップ7: カスタムドメインの設定（オプション）

#### 7.1 Vercelでドメインを追加

1. プロジェクトの「Settings」→「Domains」
2. 「Add」をクリック
3. `bess.ps-system.jp` を入力
4. 表示されるDNSレコードをメモ

#### 7.2 さくらVPSでDNSレコードを追加

さくらVPSのコントロールパネルで以下を追加：

```
タイプ: CNAME
ホスト名: bess
値: cname.vercel-dns.com
TTL: 3600
```

または、Aレコードの場合：

```
タイプ: A
ホスト名: bess
値: 76.76.21.21
TTL: 3600
```

#### 7.3 SSL証明書の自動発行

Vercelが自動的にSSL証明書を発行します（数分かかる場合があります）。

---

### ステップ8: バックエンドのCORS設定を更新

VPSにSSH接続して、バックエンドの環境変数を更新：

```bash
ssh ubuntu@153.121.61.164

# 環境変数ファイルを編集
nano /home/ubuntu/bess-site-survey-system/.env.production
```

`CORS_ORIGIN` を更新：

```env
# Vercelのドメインに変更
CORS_ORIGIN=https://bess-site-survey-system.vercel.app

# カスタムドメインを使用する場合
# CORS_ORIGIN=https://bess.ps-system.jp
```

保存後、アプリケーションを再起動：

```bash
pm2 restart bess-api
pm2 logs bess-api --lines 50
```

---

## ✅ 動作確認

### 1. フロントエンドにアクセス

ブラウザで以下にアクセス：
- https://bess-site-survey-system.vercel.app
- または https://bess.ps-system.jp（カスタムドメイン設定時）

### 2. APIとの接続確認

1. ログインページが表示されることを確認
2. ブラウザの開発者ツール（F12）を開く
3. 「Console」タブでエラーがないことを確認
4. 「Network」タブでAPIリクエストが成功していることを確認

### 3. テストログイン

初期管理者アカウントでログイン：
- Email: `admin@example.com`
- Password: `admin123`

---

## 🔄 自動デプロイの設定

Vercelは自動的にGitHubと連携しています：

- **mainブランチにプッシュ** → 本番環境に自動デプロイ
- **他のブランチにプッシュ** → プレビュー環境に自動デプロイ

### デプロイの確認

```bash
# ローカルで変更をコミット
git add .
git commit -m "Update frontend"
git push origin main

# Vercelが自動的にデプロイを開始
# ダッシュボードで進捗を確認できます
```

---

## 🔧 トラブルシューティング

### ビルドエラー

#### エラー: "Root Directory not found"

**解決策**: 
1. Vercelプロジェクトの「Settings」→「General」
2. 「Root Directory」を `frontend` に設定
3. 「Save」をクリック
4. 「Deployments」から再デプロイ

#### エラー: "Environment variable not found"

**解決策**:
1. 「Settings」→「Environment Variables」
2. すべての環境変数が `VITE_` プレフィックス付きで設定されているか確認
3. 変更後、再デプロイ

### CORSエラー

ブラウザコンソールに以下のエラーが表示される場合：

```
Access to fetch at 'https://api.ps-system.jp/api/v1/...' from origin 'https://bess-site-survey-system.vercel.app' has been blocked by CORS policy
```

**解決策**:
1. VPSにSSH接続
2. `/home/ubuntu/bess-site-survey-system/.env.production` の `CORS_ORIGIN` を確認
3. Vercelのドメインと一致しているか確認
4. `pm2 restart bess-api` で再起動

### APIに接続できない

**解決策**:
1. バックエンドAPIが起動しているか確認：
   ```bash
   curl https://api.ps-system.jp/api/v1/health
   ```
2. Vercelの環境変数 `VITE_API_BASE_URL` が正しいか確認
3. ブラウザの開発者ツールで実際のリクエストURLを確認

---

## 📊 パフォーマンス最適化

### 1. 画像最適化

Vercelは自動的に画像を最適化しますが、以下も検討：

```typescript
// next/imageの代わりにViteの画像最適化を使用
import imageUrl from './image.png?url'
```

### 2. コード分割

Viteは自動的にコード分割を行いますが、大きなライブラリは遅延読み込み：

```typescript
// 遅延読み込み
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

### 3. キャッシュ設定

`vercel.json` でキャッシュを設定：

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## 📈 監視とアナリティクス

### Vercel Analytics（オプション）

1. プロジェクトの「Analytics」タブ
2. 「Enable Analytics」をクリック
3. パフォーマンスメトリクスを確認

### カスタムドメインのSSL証明書

Vercelが自動的に管理します：
- 自動更新
- 無料
- Let's Encrypt使用

---

## 🎉 デプロイ完了！

フロントエンドが以下のURLで稼働中：
- **本番URL**: https://bess-site-survey-system.vercel.app
- **カスタムドメイン**: https://bess.ps-system.jp（設定時）

### 完全なシステム構成

```
┌─────────────────────────────┐
│   Frontend (Vercel)         │
│   bess.vercel.app           │
└──────────┬──────────────────┘
           │
           │ HTTPS
           ▼
┌─────────────────────────────┐
│   Backend API (VPS)         │
│   api.ps-system.jp          │
│   153.121.61.164            │
└──────────┬──────────────────┘
           │
           │ PostgreSQL
           ▼
┌─────────────────────────────┐
│   Database (Supabase)       │
│   PostgreSQL + Auth         │
└─────────────────────────────┘
```

次は、実際にアプリケーションを使ってテストしましょう！
