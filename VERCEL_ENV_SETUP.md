# Vercel環境変数設定ガイド

## 問題

現在、Vercelデプロイで以下のエラーが発生しています：

```
Access to XMLHttpRequest at 'https://bess-site-survey-system-grwzs22qu-kk-bens-projects.vercel.app/api/v1/sites'
has been blocked by CORS policy
```

**原因**: Vercelで環境変数が設定されていないため、デフォルトの`/api/v1`を使用している

## 解決方法

### 1. Vercelダッシュボードで環境変数を設定

1. **Vercelにログイン**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択**
   - `bess-site-survey-system` をクリック

3. **Settings → Environment Variables**
   - 左サイドバーの「Settings」をクリック
   - 「Environment Variables」タブを選択

4. **以下の環境変数を追加**

   | Name | Value | Environment |
   |------|-------|-------------|
   | `VITE_API_BASE_URL` | `http://153.121.61.164:3000/api/v2` | Production, Preview, Development |
   | `VITE_SUPABASE_URL` | `https://kcohexmvbccxixyfvjyw.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k` | Production, Preview, Development |

5. **Save**をクリック

### 2. 再デプロイ

環境変数を追加後、自動的に再デプロイされます。または手動で：

1. **Deployments**タブに移動
2. 最新のデプロイの右側にある「...」メニューをクリック
3. 「Redeploy」を選択
4. 「Redeploy」ボタンをクリック

### 3. 確認

再デプロイ完了後（約2-3分）：

```
URL: https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login
ログイン: admin@example.com / admin123
```

ブラウザの開発者ツール（F12）→ Networkタブで、正しいURLを呼んでいるか確認：
```
✓ http://153.121.61.164:3000/api/v2/sites
✗ https://bess-site-survey-system-grwzs22qu-kk-bens-projects.vercel.app/api/v1/sites
```

## 代替方法: Vercel CLIを使用

```bash
# Vercel CLIをインストール（初回のみ）
npm install -g vercel

# ログイン
vercel login

# プロジェクトディレクトリに移動
cd bess-site-survey-system/frontend

# 環境変数を設定
vercel env add VITE_API_BASE_URL production
# 値を入力: http://153.121.61.164:3000/api/v2

vercel env add VITE_SUPABASE_URL production
# 値を入力: https://kcohexmvbccxixyfvjyw.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# 値を入力: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 再デプロイ
vercel --prod
```

## トラブルシューティング

### 環境変数が反映されない

**原因**: ビルド時に環境変数が読み込まれていない

**解決策**:
1. Vercelダッシュボードで環境変数を確認
2. 「Redeploy」を実行
3. ビルドログで環境変数が設定されているか確認

### CORSエラーが続く

**原因**: VPS APIサーバーのCORS設定

**解決策**:
```bash
# VPSにSSH接続
ssh ubuntu@153.121.61.164

# CORS設定を確認
cd /home/ubuntu/bess-site-survey-system
grep -r "cors" src/

# サーバーを再起動
pm2 restart bess-api
```

### データベースにデータがない

**原因**: Supabaseにテストデータが挿入されていない

**解決策**:
1. Supabaseダッシュボードにログイン
2. SQL Editorで`database/v2-test-data-fixed.sql`を実行

## 現在の設定状況

### ✅ 完了
- [x] `.env.production`ファイル作成
- [x] GitHubにプッシュ
- [x] VPS APIサーバー起動中

### ⚠️ 要対応
- [ ] Vercelで環境変数を設定
- [ ] 再デプロイ
- [ ] 動作確認

## 参考リンク

- **Vercelダッシュボード**: https://vercel.com/dashboard
- **Vercel環境変数ドキュメント**: https://vercel.com/docs/projects/environment-variables
- **GitHub リポジトリ**: https://github.com/kk-ben/bess-site-survey-system

---

**最終更新**: 2025年10月6日 20:45
