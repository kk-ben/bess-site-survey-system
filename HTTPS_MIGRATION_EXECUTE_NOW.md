# 🚀 HTTPS移行 - 今すぐ実行

## ⚡ 3ステップで完了（15分）

このガイドに従って、今すぐHTTPS移行を完了させましょう。

---

## 📋 事前確認（2分）

以下を確認してください：

```powershell
# 1. 現在のディレクトリを確認
cd bess-site-survey-system
pwd

# 2. Gitの状態を確認
git status

# 3. Vercel CLIの確認
vercel --version

# 4. VPSへの接続確認
ssh ubuntu@153.121.61.164 "echo 'Connection OK'"
```

すべてOKなら次へ進みます。

---

## 🎯 ステップ1: ローカルファイルの更新（3分）

### 実行コマンド

```powershell
# プロジェクトディレクトリで実行
cd bess-site-survey-system

# 一括更新スクリプトを実行
.\scripts\migrate-to-https.ps1
```

### 実行内容

- ✅ `frontend/.env.production` → API URLを更新
- ✅ `.env.example` → CORS設定を更新
- ✅ PowerShellスクリプト3件を更新

### 確認

```powershell
# 変更されたファイルを確認
git status

# 変更内容を確認
git diff frontend/.env.production
```

**期待される結果**:
```diff
- VITE_API_BASE_URL=http://153.121.61.164:3000/api/v2
+ VITE_API_BASE_URL=https://ps-system.jp/api/v2
```

---

## 🎯 ステップ2: VPS設定の更新（5分）

### 実行コマンド

```bash
# VPSにSSH接続
ssh ubuntu@153.121.61.164

# プロジェクトディレクトリに移動
cd /home/ubuntu/bess-site-survey-system

# スクリプトをアップロード（ローカルから）
# 別のターミナルで実行:
# scp scripts/vps-update-cors.sh ubuntu@153.121.61.164:/home/ubuntu/bess-site-survey-system/

# 実行権限を付与
chmod +x vps-update-cors.sh

# スクリプトを実行
./vps-update-cors.sh
```

### 手動で設定する場合

```bash
# .env.productionを編集
nano .env.production

# 以下の行を追加/更新
ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp

# 保存: Ctrl+O → Enter → Ctrl+X

# APIを再起動
pm2 restart bess-api

# ログを確認
pm2 logs bess-api --lines 50
```

### 確認

```bash
# CORS設定を確認
grep ALLOWED_ORIGINS .env.production

# APIの状態を確認
pm2 status

# Health Checkを実行
curl https://ps-system.jp/api/v2/health
```

**期待される結果**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T...",
  "services": {
    "database": "connected",
    "cache": "connected"
  }
}
```

---

## 🎯 ステップ3: Vercel設定の更新（5分）

### オプションA: 自動スクリプト（推奨）

```powershell
# ローカルのプロジェクトディレクトリで実行
cd bess-site-survey-system

# Vercel環境変数を自動更新
.\scripts\vercel-update-https.ps1

# プロンプトに従って操作
# - 環境変数更新: y
# - 再デプロイ: y
```

### オプションB: 手動設定

1. **Vercel Dashboardにアクセス**
   - https://vercel.com/dashboard

2. **プロジェクトを選択**
   - `bess-site-survey-system`

3. **環境変数を更新**
   - Settings → Environment Variables
   - `VITE_API_BASE_URL`を編集
   - 値: `https://ps-system.jp/api/v2`
   - 環境: Production, Preview, Development すべてチェック
   - Save

4. **再デプロイ**
   - Deployments タブ
   - 最新のデプロイで "Redeploy" をクリック

### 確認

```powershell
# デプロイ状況を確認
vercel ls

# ログを確認
vercel logs
```

---

## 🎯 ステップ4: GitHubにプッシュ（2分）

### 実行コマンド

```powershell
# プロジェクトディレクトリで実行
cd bess-site-survey-system

# Git コミット & プッシュスクリプトを実行
.\scripts\git-commit-https-migration.ps1

# プロンプトに従って操作
# - 変更内容確認: y (オプション)
# - コミットメッセージ: Enter (デフォルト使用)
# - 実行確認: y
```

### 手動でコミットする場合

```powershell
# 変更をステージング
git add .

# コミット
git commit -m "Migrate to HTTPS: Update API URL to https://ps-system.jp"

# プッシュ
git push origin main
```

### 確認

```powershell
# 最新のコミットを確認
git log -1 --oneline

# リモートと同期されているか確認
git status
```

---

## ✅ 動作確認（3分）

### 1. API Health Check

```powershell
# PowerShellで実行
Invoke-RestMethod -Uri "https://ps-system.jp/api/v2/health"
```

**期待される結果**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T...",
  "services": {
    "database": "connected",
    "cache": "connected"
  }
}
```

### 2. サイト一覧取得

```powershell
Invoke-RestMethod -Uri "https://ps-system.jp/api/v2/sites"
```

### 3. フロントエンド確認

1. **ブラウザでVercel URLを開く**
   - https://bess-site-survey-system.vercel.app

2. **開発者ツールを開く**
   - F12キーを押す

3. **Networkタブを確認**
   - ページをリロード
   - API呼び出しが `https://ps-system.jp/api/v2/...` になっているか確認

4. **Consoleタブを確認**
   - エラーがないか確認
   - CORSエラーがないか確認

### 4. 実際の操作テスト

- ✅ ログイン
- ✅ サイト一覧表示
- ✅ サイト詳細表示
- ✅ データ作成・更新

---

## 🚨 トラブルシューティング

### CORSエラーが発生する

**症状**:
```
Access to fetch at 'https://ps-system.jp/api/v2/...' has been blocked by CORS policy
```

**解決策**:
```bash
# VPSで確認
ssh ubuntu@153.121.61.164
cd /home/ubuntu/bess-site-survey-system
grep ALLOWED_ORIGINS .env.production

# 正しい値が設定されているか確認
# ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp

# 再起動
pm2 restart bess-api
pm2 logs bess-api
```

### Vercel環境変数が反映されない

**解決策**:
1. Vercel Dashboard → Deployments
2. 最新のデプロイで "Redeploy" をクリック
3. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）

### APIが応答しない

**確認事項**:
```bash
# VPSでAPIの状態を確認
ssh ubuntu@153.121.61.164
pm2 status
pm2 logs bess-api --lines 100

# Nginxの状態を確認
sudo systemctl status nginx
sudo nginx -t
```

---

## 📊 完了チェックリスト

実行後に確認:

- [ ] ローカルファイルの更新完了
- [ ] VPS `.env.production`の更新完了
- [ ] VPS APIの再起動完了
- [ ] Vercel環境変数の更新完了
- [ ] Vercelで再デプロイ完了
- [ ] GitHubにプッシュ完了
- [ ] API Health Check成功
- [ ] サイト一覧取得成功
- [ ] フロントエンドアクセス成功
- [ ] ブラウザコンソールにエラーなし
- [ ] ログイン・データ取得テスト成功

---

## 🎉 完了！

すべてのチェックリストが完了したら、HTTPS移行は成功です！

### 次のステップ

1. **監視**
   - 30分程度、エラーログを監視
   - ユーザーからの報告に注意

2. **ドキュメント更新**
   - 社内ドキュメントのURL更新
   - API仕様書のURL更新

3. **旧URLの無効化**（オプション）
   - HTTPからHTTPSへのリダイレクト設定
   - 旧URLへのアクセスログ監視

---

## 📚 関連ドキュメント

- **詳細計画書**: `HTTPS_MIGRATION_PLAN.md`
- **クイックスタート**: `HTTPS_MIGRATION_QUICKSTART.md`
- **全体サマリー**: `HTTPS_MIGRATION_SUMMARY.md`

---

## 🔗 リンク

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/your-repo/bess-site-survey-system
- **新ドメイン**: https://ps-system.jp
- **VPS IP**: 153.121.61.164

---

## 💡 ワンライナー実行（上級者向け）

すべてのステップを一気に実行する場合:

```powershell
# ステップ1: ローカル更新
.\scripts\migrate-to-https.ps1

# ステップ2: VPS更新（別ターミナル）
ssh ubuntu@153.121.61.164 "cd /home/ubuntu/bess-site-survey-system && ./vps-update-cors.sh"

# ステップ3: Vercel更新
.\scripts\vercel-update-https.ps1

# ステップ4: Git プッシュ
.\scripts\git-commit-https-migration.ps1

# 動作確認
Invoke-RestMethod -Uri "https://ps-system.jp/api/v2/health"
```

---

**最終更新**: 2025-01-06  
**所要時間**: 約15分  
**難易度**: ⭐⭐☆☆☆（中級）
