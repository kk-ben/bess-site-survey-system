# 📝 変更をコミットしてデプロイ

## 🎯 実行するコマンド

以下のコマンドをプロジェクトのルートディレクトリで実行してください：

```powershell
# bess-site-survey-systemディレクトリに移動
cd bess-site-survey-system

# 変更をステージング
git add .

# コミット
git commit -m "Fix CORS and configure for Vercel backend deployment

- Update CORS configuration to allow Vercel domain
- Make Redis optional for production deployment
- Add ALLOWED_ORIGINS environment variable
- Improve error handling for cache service
- Add deployment documentation"

# GitHubにプッシュ
git push origin main
```

## 📋 変更内容の確認

以下のファイルが変更されています：

### 修正されたファイル
- ✅ `src/index.ts` - CORS設定の改善
- ✅ `src/config/redis.ts` - Redisをオプショナルに
- ✅ `.env.example` - ALLOWED_ORIGINS追加

### 新規作成されたファイル
- ✅ `CORS_FIX_GUIDE.md` - CORS問題の詳細解説
- ✅ `QUICK_CORS_FIX.md` - 3つの解決策
- ✅ `VERCEL_DEPLOY_STEPS.md` - 詳細なデプロイ手順
- ✅ `DEPLOY_TO_VERCEL_NOW.md` - 5分クイックガイド
- ✅ `COMMIT_AND_DEPLOY.md` - このファイル

---

## 🚀 プッシュ後の手順

GitHubにプッシュすると、Vercelが自動的にデプロイを開始します。

### 1. Vercelダッシュボードで確認

https://vercel.com/dashboard → `bess-site-survey-system` → **Deployments**

ビルドの進行状況を確認

### 2. ただし、環境変数の設定が必要

**重要**: 初回デプロイ前に、`DEPLOY_TO_VERCEL_NOW.md`の手順に従って環境変数を設定してください。

---

## ⚠️ 注意事項

### 環境変数を設定していない場合

ビルドは成功しますが、アプリは正常に動作しません。

必ず以下の環境変数を設定してください：

```bash
DATABASE_URL=<Supabaseから取得>
JWT_SECRET=<新規生成>
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://bess-site-survey-system.vercel.app
REDIS_URL=redis://default:dummy@localhost:6379
VITE_API_BASE_URL=https://bess-site-survey-system.vercel.app/api/v1
```

---

## 📖 次に読むべきドキュメント

1. **DEPLOY_TO_VERCEL_NOW.md** - 5分で完了するデプロイガイド
2. **VERCEL_DEPLOY_STEPS.md** - 詳細な手順
3. **CORS_FIX_GUIDE.md** - CORS問題の技術的な解説

---

## ✅ デプロイ完了後の確認

### 1. ヘルスチェック
```
https://bess-site-survey-system.vercel.app/health
```

### 2. ログイン
```
https://bess-site-survey-system.vercel.app
```
- Email: `admin@example.com`
- Password: `admin123`

---

## 🎉 完了！

これでCORSエラーが解消され、本番環境で動作するようになります！
