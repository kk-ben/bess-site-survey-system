# 🚀 Vercel即時デプロイガイド（簡潔版）

**作成日時**: 2025年10月6日  
**所要時間**: 5-10分

---

## ✅ 事前確認

- ✅ フロントエンドビルド成功
- ✅ バックエンドAPI稼働中: http://153.121.61.164:3000/api/v2
- ✅ Supabaseデータベース準備完了
- ✅ GitHubにプッシュ済み

---

## 🎯 デプロイ手順

### 1. Vercelにアクセス

https://vercel.com にアクセスしてログイン

### 2. プロジェクトをインポート

1. 「Add New...」→「Project」をクリック
2. GitHubリポジトリ「bess-site-survey-system」を選択
3. 「Import」をクリック

### 3. プロジェクト設定

#### Framework Preset
```
Vite
```

#### Root Directory（重要！）
```
frontend
```
**「Edit」をクリックして `frontend` を指定してください**

#### Build Settings（自動検出）
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 4. 環境変数を設定

以下の3つを追加：

```
VITE_API_BASE_URL=http://153.121.61.164:3000/api/v2
VITE_SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
```

### 5. デプロイ実行

「Deploy」ボタンをクリック（3-5分かかります）

---

## ✅ デプロイ完了後

### 確認事項

1. デプロイURLにアクセス（例: `https://bess-site-survey-system.vercel.app`）
2. ログインページが表示されることを確認
3. ダッシュボードにアクセスできることを確認

### 次のステップ

デプロイが完了したら：
1. テストデータをSupabaseに投入
2. システム全体の動作確認

---

## 🔧 トラブルシューティング

### ビルドエラー
- Root Directoryが `frontend` に設定されているか確認
- 環境変数が正しく設定されているか確認

### CORS エラー
VPS側で設定を更新：
```bash
ssh ubuntu@153.121.61.164
cd ~/bess-site-survey-system
nano .env
# CORS_ORIGIN=https://your-vercel-url.vercel.app を追加
pm2 restart bess-api
```

---

## 📝 メモ

デプロイURL: ___________________________

デプロイ完了時刻: ___________________________
