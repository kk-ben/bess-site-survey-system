# Vercel 環境変数 手動設定ガイド

## 手順

### 1. Vercelダッシュボードにアクセス
https://vercel.com/kk-bens-projects/bess-site-survey-system

### 2. Settings → Environment Variables に移動
- プロジェクトページ上部の「Settings」タブをクリック
- 左サイドバーの「Environment Variables」をクリック

### 3. 以下の3つの環境変数を追加

#### 変数 1: API Base URL
```
Name: VITE_API_BASE_URL
Value: http://153.121.61.164:3000/api/v2
Environment: Production と Preview の両方にチェック
```

#### 変数 2: Supabase URL
```
Name: VITE_SUPABASE_URL
Value: https://kcohexmvbccxixyfvjyw.supabase.co
Environment: Production と Preview の両方にチェック
```

#### 変数 3: Supabase Anon Key
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
Environment: Production と Preview の両方にチェック
```

### 4. 再デプロイ
環境変数を保存後、以下のいずれかの方法で再デプロイ：

**方法A: Vercelダッシュボードから**
1. 「Deployments」タブに移動
2. 最新のデプロイメントの右側「...」メニューをクリック
3. 「Redeploy」を選択

**方法B: Gitプッシュで自動デプロイ**
```bash
cd bess-site-survey-system
git add .
git commit -m "Update environment variables"
git push origin main
```

### 5. 確認
デプロイ完了後、以下のURLにアクセスして動作確認：
- https://bess-site-survey-system.vercel.app

## トラブルシューティング

### 環境変数が反映されない場合
1. ブラウザのキャッシュをクリア
2. Vercelダッシュボードで環境変数が正しく設定されているか確認
3. 再度デプロイを実行

### APIに接続できない場合
1. VPSのAPIサーバーが起動しているか確認
   ```bash
   ssh ubuntu@153.121.61.164
   pm2 status
   ```

2. ファイアウォールの設定を確認
   ```bash
   sudo ufw status
   ```

### Supabaseに接続できない場合
1. Supabase URLとAnon Keyが正しいか確認
2. Supabaseダッシュボードでプロジェクトが有効か確認

## 完了後の確認項目

- [ ] 3つの環境変数が設定されている
- [ ] Production と Preview の両方に適用されている
- [ ] 再デプロイが完了している
- [ ] フロントエンドがVPS APIに接続できる
- [ ] Supabase認証が動作する

---

**設定完了後、このファイルを確認してください！**
