# 🚀 VPSでv2.0 APIをデプロイする手順

## 📋 これから行うこと

VPSにSSH接続して、自動デプロイスクリプトを実行します。
所要時間：約3分

---

## ステップ1️⃣：VPSにSSH接続

PowerShellまたはコマンドプロンプトで以下を実行：

```powershell
ssh root@153.121.61.164
```

パスワードを入力してログイン

---

## ステップ2️⃣：自動デプロイスクリプトを実行

VPSにログインしたら、以下のコマンドを**1行ずつ**実行：

```bash
# プロジェクトディレクトリに移動
cd /var/www/bess-site-survey-system

# 最新コードを取得（v2.0スクリプトを含む）
git pull origin main

# デプロイスクリプトに実行権限を付与
chmod +x scripts/vps-deploy-v2.sh

# デプロイスクリプトを実行
./scripts/vps-deploy-v2.sh
```

---

## ✅ 成功の確認

スクリプトが正常に完了すると、以下のメッセージが表示されます：

```
=========================================
BESS v2.0 API デプロイ完了！
=========================================

📊 API情報:
  - v1.0 API: https://api.ps-system.jp/api/v1
  - v2.0 API: https://api.ps-system.jp/api/v2

🔍 動作確認コマンド:
  curl https://api.ps-system.jp/api/v2/health
  curl https://api.ps-system.jp/api/v2/sites
```

---

## ステップ3️⃣：動作確認

VPS上で以下のコマンドを実行して、v2.0 APIが動作しているか確認：

```bash
# v2.0 ヘルスチェック
curl http://localhost:3000/api/v2/health

# v2.0 サイト一覧
curl http://localhost:3000/api/v2/sites
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

## ステップ4️⃣：外部からの動作確認

ローカルPC（Windows）で以下を実行：

```powershell
# v2.0 ヘルスチェック
curl https://api.ps-system.jp/api/v2/health

# v2.0 サイト一覧
curl https://api.ps-system.jp/api/v2/sites
```

3件のサイトデータが返ってくればOK！

---

## 🔧 トラブルシューティング

### エラーが発生した場合

```bash
# PM2ログを確認
pm2 logs bess-api --lines 50

# PM2ステータス確認
pm2 status

# 手動で再起動
pm2 restart bess-api
```

### ビルドエラーが発生した場合

```bash
# node_modulesを削除して再インストール
cd /var/www/bess-site-survey-system
rm -rf node_modules
npm install
npm run build
pm2 restart bess-api
```

### データベース接続エラー

```bash
# 環境変数を確認
cat .env.production | grep SUPABASE

# Supabase接続テスト
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://kcohexmvbccxixyfvjyw.supabase.co/rest/v1/sites
```

---

## 📝 よく使うコマンド

```bash
# PM2ステータス確認
pm2 status

# ログをリアルタイム表示
pm2 logs bess-api

# アプリケーション再起動
pm2 restart bess-api

# アプリケーション停止
pm2 stop bess-api

# Nginxログ確認
tail -f /var/log/nginx/bess-api.error.log
```

---

## 🎉 完了！

v2.0 APIがVPSで動作しています！

次のステップ：
1. ✅ VPSにv2.0 APIをデプロイ ← 完了！
2. 🔄 フロントエンドをv2.0 APIに接続
3. 🚀 Vercelにフロントエンドをデプロイ

---

## 📞 サポート

問題が発生した場合は、以下の情報を確認してください：
- PM2ログ: `pm2 logs bess-api`
- Nginxログ: `tail -f /var/log/nginx/bess-api.error.log`
- ビルドログ: `npm run build`の出力
