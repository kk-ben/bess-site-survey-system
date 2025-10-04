# CORS エラー修正ガイド

## 問題

Vercelにデプロイされたフロントエンドから、バックエンドAPIへのアクセスがCORSエラーで失敗する。

```
Access to XMLHttpRequest at 'http://localhost:4000/api/v1/auth/login' 
from origin 'https://bess-site-survey-system.vercel.app' 
has been blocked by CORS policy
```

## 原因

1. バックエンドのCORS設定がVercelのドメインを許可していない
2. フロントエンドがローカルのバックエンドURL（localhost:4000）を使用している

## 解決策

### 1. バックエンドのCORS設定を更新（完了✅）

`src/index.ts`のCORS設定を改善し、環境変数で許可するオリジンを管理できるようにしました。

### 2. バックエンドの環境変数を設定

バックエンドサーバー（本番環境）の`.env`ファイルに以下を追加：

```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://bess-site-survey-system.vercel.app
```

複数のVercelデプロイメント（プレビュー環境など）を許可する場合：

```bash
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://bess-site-survey-system.vercel.app,https://*.vercel.app
```

### 3. Vercelのフロントエンド環境変数を設定

Vercelダッシュボードで以下の環境変数を設定：

1. Vercelプロジェクトにアクセス
2. **Settings** → **Environment Variables**
3. 以下の変数を追加：

```
VITE_API_BASE_URL=https://your-backend-api-url.com/api/v1
```

**重要**: バックエンドAPIの実際のURLに置き換えてください。

#### バックエンドのデプロイ先の選択肢：

- **Vercel**: バックエンドもVercelにデプロイ
- **Heroku**: `https://your-app.herokuapp.com/api/v1`
- **Railway**: `https://your-app.railway.app/api/v1`
- **さくらVPS**: `https://your-domain.com/api/v1`
- **AWS/GCP**: 独自ドメイン

### 4. Vercelで環境変数を設定する手順

```bash
# Vercel CLIを使用する場合
vercel env add VITE_API_BASE_URL

# または、Vercelダッシュボードから：
# 1. https://vercel.com/dashboard
# 2. プロジェクトを選択
# 3. Settings → Environment Variables
# 4. 変数を追加
```

### 5. 再デプロイ

環境変数を設定後、Vercelで再デプロイ：

```bash
# 自動デプロイの場合
git push origin main

# または手動デプロイ
vercel --prod
```

## 開発環境での確認

ローカルで動作確認する場合：

```bash
# フロントエンド
cd bess-site-survey-system/frontend
pnpm dev

# バックエンド（別ターミナル）
cd bess-site-survey-system
npm run dev
```

## トラブルシューティング

### CORSエラーが続く場合

1. **バックエンドのログを確認**
   ```
   CORS blocked request from origin: https://...
   ```

2. **ブラウザのネットワークタブを確認**
   - Preflightリクエスト（OPTIONS）が成功しているか
   - レスポンスヘッダーに`Access-Control-Allow-Origin`があるか

3. **環境変数が正しく設定されているか確認**
   ```bash
   # Vercelで確認
   vercel env ls
   ```

### バックエンドがまだデプロイされていない場合

現在、バックエンドはローカル（localhost:4000）でのみ動作しています。
本番環境で使用するには、バックエンドもデプロイする必要があります。

**推奨デプロイ先**:
- Vercel（Node.jsサポート）
- Railway（PostgreSQL + Redis込み）
- さくらVPS（既存のセットアップスクリプトあり）

## 次のステップ

1. ✅ バックエンドのCORS設定を更新（完了）
2. ⏳ バックエンドを本番環境にデプロイ
3. ⏳ Vercelの環境変数を設定
4. ⏳ フロントエンドを再デプロイ

## 参考資料

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [CORS MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://expressjs.com/en/resources/middleware/cors.html)
