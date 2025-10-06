# 🔄 既存Vercelプロジェクト更新ガイド

**作成日時**: 2025年10月6日  
**所要時間**: 3-5分

---

## ✅ 事前確認

- ✅ 既存Vercelプロジェクトあり
- ✅ フロントエンドビルド成功
- ✅ バックエンドAPI稼働中: http://153.121.61.164:3000/api/v2
- ✅ GitHubにプッシュ済み

---

## 🎯 既存プロジェクト更新手順

### 1. Vercelダッシュボードにアクセス

https://vercel.com/dashboard にアクセス

### 2. プロジェクトを選択

既存の「bess-site-survey-system」プロジェクトをクリック

### 3. Settings → General

以下を確認・更新：

#### Root Directory（重要！）
```
frontend
```
**「Edit」をクリックして `frontend` に変更**

#### Framework Preset
```
Vite
```

#### Build & Development Settings
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. Settings → Environment Variables

既存の環境変数を確認し、以下の3つを追加/更新：

```
VITE_API_BASE_URL=http://153.121.61.164:3000/api/v2
VITE_SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
```

**注意**: 環境変数を変更した場合は「Save」をクリック

### 5. Deployments → Redeploy

1. 「Deployments」タブをクリック
2. 最新のデプロイメントを選択
3. 右上の「...」メニューから「Redeploy」を選択
4. 「Redeploy」を確認

または

1. GitHubに新しいコミットをプッシュ（自動デプロイ）

---

## 🚀 自動デプロイ（推奨）

GitHubにプッシュすると自動的にデプロイされます：

```powershell
git add .
git commit -m "Update frontend for v2.0 API"
git push origin main
```

Vercelが自動的に検知してデプロイを開始します（3-5分）

---

## ✅ デプロイ完了後の確認

### 1. デプロイURLにアクセス

既存のVercel URL（例: `https://bess-site-survey-system.vercel.app`）にアクセス

### 2. 動作確認

- ✅ ログインページが表示される
- ✅ ダッシュボードにアクセスできる
- ✅ サイト一覧が表示される（データがある場合）

---

## 🔧 トラブルシューティング

### ビルドエラー: "Root Directory not found"

**原因**: Root Directoryが設定されていない

**解決**: 
1. Settings → General
2. Root Directory を `frontend` に設定
3. Save → Redeploy

### ビルドエラー: "Module not found"

**原因**: 依存関係の問題

**解決**:
1. ローカルでビルドテスト: `npm run build`
2. `package-lock.json` をコミット
3. 再デプロイ

### API接続エラー

**原因**: 環境変数が正しく設定されていない

**解決**:
1. Settings → Environment Variables
2. `VITE_API_BASE_URL` が正しいか確認
3. Save → Redeploy

### CORS エラー

**原因**: VPS側でVercel URLが許可されていない

**解決**:
```bash
ssh ubuntu@153.121.61.164
cd ~/bess-site-survey-system
nano .env
# CORS_ORIGIN=https://your-vercel-url.vercel.app を追加
pm2 restart bess-api
```

---

## 📝 デプロイ確認チェックリスト

- [ ] Root Directory が `frontend` に設定されている
- [ ] Framework Preset が `Vite` に設定されている
- [ ] 環境変数3つが正しく設定されている
- [ ] 最新のコードがGitHubにプッシュされている
- [ ] デプロイが成功している（緑のチェックマーク）
- [ ] デプロイURLにアクセスできる
- [ ] ログインページが表示される

---

## 🎯 次のステップ

デプロイが完了したら：

1. **テストデータ投入**: `SUPABASE_TEST_DATA_SETUP.md` を参照
2. **システム動作確認**: サイト一覧、詳細表示、地図表示
3. **本番運用開始**: ユーザーにURLを共有

---

## 📞 現在のVercel URL

プロジェクトURL: ___________________________

デプロイ完了時刻: ___________________________
