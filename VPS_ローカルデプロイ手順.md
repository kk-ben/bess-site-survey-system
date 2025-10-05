# 🚀 ローカルからVPSへv2.0 APIをデプロイする手順

## 📋 概要

ローカルPC（Windows）から直接VPSにSSH接続してv2.0 APIをデプロイします。
所要時間：約5分

---

## 前提条件

✅ SSH接続情報
- **ホスト**: 153.121.61.164
- **ユーザー**: ubuntu
- **接続方法**: `ssh ubuntu@153.121.61.164`

✅ VPS上の既存環境
- Node.js、PM2、Nginx、n8n、文字起こしサービスなどが稼働中
- `/var/www/bess-site-survey-system` にプロジェクトが配置済み

---

## 方法1️⃣：自動デプロイスクリプト（推奨）

### Windows PowerShellの場合

```powershell
# プロジェクトディレクトリに移動
cd bess-site-survey-system

# デプロイスクリプトを実行
.\scripts\deploy-from-local.ps1
```

### Git Bash / WSLの場合

```bash
# プロジェクトディレクトリに移動
cd bess-site-survey-system

# スクリプトに実行権限を付与
chmod +x scripts/deploy-from-local.sh

# デプロイスクリプトを実行
./scripts/deploy-from-local.sh
```

### スクリプトが行うこと

1. ✅ VPS接続確認
2. ✅ ローカルの変更をGitHubにプッシュ（必要な場合）
3. ✅ VPS上で最新コードを取得
4. ✅ 依存関係のインストール
5. ✅ TypeScriptビルド
6. ✅ PM2でアプリケーション再起動
7. ✅ 動作確認

---

## 方法2️⃣：手動デプロイ

### ステップ1: ローカルの変更をプッシュ

```powershell
# 変更をコミット
git add .
git commit -m "v2.0 API update"
git push origin main
```

### ステップ2: VPSにSSH接続

```powershell
ssh ubuntu@153.121.61.164
```

### ステップ3: デプロイスクリプトを実行

VPSにログインしたら：

```bash
# プロジェクトディレクトリに移動
cd /var/www/bess-site-survey-system

# 最新コードを取得
git pull origin main

# デプロイスクリプトに実行権限を付与
chmod +x scripts/vps-deploy-v2.sh

# デプロイスクリプトを実行
./scripts/vps-deploy-v2.sh
```

---

## ✅ 成功の確認

デプロイが成功すると、以下のメッセージが表示されます：

```
=========================================
BESS v2.0 API デプロイ完了！
=========================================

📊 API情報:
  - v1.0 API: https://api.ps-system.jp/api/v1
  - v2.0 API: https://api.ps-system.jp/api/v2
```

### 動作確認コマンド

```powershell
# v2.0 ヘルスチェック
curl https://api.ps-system.jp/api/v2/health

# v2.0 サイト一覧
curl https://api.ps-system.jp/api/v2/sites
```

期待される結果：

```json
{
  "success": true,
  "version": "2.0",
  "timestamp": "2025-10-05T...",
  "message": "BESS Site Survey System v2.0 API is running"
}
```

---

## 🔧 トラブルシューティング

### SSH接続エラー

```powershell
# SSH接続テスト
ssh ubuntu@153.121.61.164 "echo 'Connection OK'"

# SSH設定確認（~/.ssh/config）
# 必要に応じてSSHキーを設定
```

### デプロイエラー

```bash
# VPSにログインしてログを確認
ssh ubuntu@153.121.61.164

# PM2ログを確認
pm2 logs bess-api --lines 100

# PM2ステータス確認
pm2 status

# 手動で再起動
pm2 restart bess-api
```

### ビルドエラー

```bash
# VPS上で手動ビルド
cd /var/www/bess-site-survey-system
rm -rf node_modules
npm install
npm run build
pm2 restart bess-api
```

---

## 📝 よく使うコマンド

### ローカルから実行

```powershell
# VPSのログを確認
ssh ubuntu@153.121.61.164 "pm2 logs bess-api --lines 50"

# VPSのステータス確認
ssh ubuntu@153.121.61.164 "pm2 status"

# VPSでアプリケーション再起動
ssh ubuntu@153.121.61.164 "pm2 restart bess-api"
```

### VPS上で実行

```bash
# PM2ステータス確認
pm2 status

# ログをリアルタイム表示
pm2 logs bess-api

# アプリケーション再起動
pm2 restart bess-api

# Nginxログ確認
tail -f /var/log/nginx/bess-api.error.log
```

---

## 🌐 VPS上の他のサービスとの共存

VPS上では以下のサービスが稼働しています：

- **BESS API** (Port 3000) - 本プロジェクト
- **n8n** - ワークフロー自動化
- **文字起こしサービス** - 音声処理
- **Nginx** - リバースプロキシ

これらは独立して動作しているため、BESS APIのデプロイは他のサービスに影響しません。

---

## 🎉 完了！

v2.0 APIがVPSで動作しています！

次のステップ：
1. ✅ ローカルからVPSへv2.0 APIをデプロイ ← 完了！
2. 🔄 フロントエンドをv2.0 APIに接続
3. 🚀 Vercelにフロントエンドをデプロイ

---

## 📞 サポート

問題が発生した場合は、以下の情報を確認してください：
- PM2ログ: `ssh ubuntu@153.121.61.164 "pm2 logs bess-api"`
- Nginxログ: `ssh ubuntu@153.121.61.164 "tail -f /var/log/nginx/bess-api.error.log"`
- ビルドログ: デプロイスクリプトの出力

