# 🔧 暫定対応 - IPアドレスでアクセス設定

## 現在の状況
- ✅ VPS上でアプリケーション稼働中
- ✅ 内部アクセス成功（`localhost:3000`）
- ❌ 外部アクセス不可（DNS未設定）

## 暫定対応の内容

IPアドレス（`153.121.61.164`）で直接アクセスできるようにします。

## 🚀 実行手順

### ステップ1: Nginx設定（VPS上で実行）

```bash
# VPSにSSH接続
ssh ubuntu@153.121.61.164

# 最新コードを取得
cd /home/ubuntu/bess-site-survey-system
git pull origin main

# Nginx設定スクリプトを実行
sudo bash scripts/vps-setup-nginx-simple.sh
```

### ステップ2: 動作確認（VPS上）

```bash
# IPアドレスでアクセステスト
curl http://153.121.61.164/api/v2
curl http://153.121.61.164/health
```

### ステップ3: 外部アクセステスト（ローカルPC）

```powershell
# PowerShellで実行
curl http://153.121.61.164/api/v2
curl http://153.121.61.164/health
```

## 📊 期待される結果

### /api/v2 エンドポイント
```json
{
  "message": "BESS Site Survey System API v2.0",
  "version": "2.0.0",
  "status": "running",
  "features": [...]
}
```

### /health エンドポイント
```json
{
  "status": "healthy",
  "timestamp": "2025-10-06T...",
  "services": {
    "database": "connected",
    "cache": "disconnected"
  },
  "uptime": 123.45
}
```

## 🔧 トラブルシューティング

### エラー: Permission denied

```bash
# sudoパスワードを入力してください
sudo bash scripts/vps-setup-nginx-simple.sh
```

### エラー: Nginx test failed

```bash
# Nginx設定を確認
sudo nginx -t

# エラーメッセージを確認して修正
sudo nano /etc/nginx/sites-available/bess-api
```

### エラー: Port 80 already in use

```bash
# 既存のNginx設定を確認
sudo netstat -tulpn | grep :80

# 必要に応じて既存の設定を無効化
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl reload nginx
```

## 📝 フロントエンド環境変数

ローカルで既に更新済み：

```env
VITE_API_BASE_URL=http://153.121.61.164:3000/api/v2
```

Nginx設定後は以下に変更：

```env
VITE_API_BASE_URL=http://153.121.61.164/api/v2
```

## 🎯 次のステップ

1. ✅ フロントエンド環境変数更新（完了）
2. 🔄 Nginx設定実行（VPS上で実行）
3. 🧪 外部アクセステスト
4. 🚀 Vercelにフロントエンドデプロイ

## 💡 注意事項

### セキュリティ
- この設定はHTTPのみです（HTTPSではありません）
- 本番運用前にSSL証明書の設定が必要です

### DNS設定後
DNS設定が完了したら、以下に変更：
- フロントエンド: `https://api.ps-system.jp/api/v2`
- Nginx: `server_name api.ps-system.jp;`

---

**所要時間**: 約5分

上記のステップ1を実行してください。
