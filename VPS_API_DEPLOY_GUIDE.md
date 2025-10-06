# 🚀 BESS Site Survey System - VPS APIデプロイガイド

## 📋 構成情報

- **VPS IP**: 153.121.61.164
- **ドメイン**: ps-system.jp
- **API URL**: https://api.ps-system.jp
- **フロントエンド**: Vercel（別途デプロイ）
- **データベース**: Supabase

---

## 🎯 デプロイ手順

### ステップ1: DNSレコードの設定

さくらVPSのコントロールパネルで、以下のDNSレコードを追加：

```
タイプ: A
ホスト名: api
値: 153.121.61.164
TTL: 3600
```

設定後、DNSの反映を確認：

```bash
# Windowsの場合
nslookup api.ps-system.jp

# 期待される結果
# 名前:    api.ps-system.jp
# Address: 153.121.61.164
```

---

### ステップ2: VPSにSSH接続

```bash
# PowerShellまたはコマンドプロンプトから
ssh ubuntu@153.121.61.164
```

初回接続時は、フィンガープリントの確認が表示されます。`yes` を入力して続行してください。

---

### ステップ3: システムの更新とNode.jsインストール

```bash
# システムパッケージを更新
apt update && apt upgrade -y

# 必要なパッケージをインストール
apt install -y curl wget git nginx certbot python3-certbot-nginx

# Node.js 18 LTSをインストール
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# バージョン確認
node --version  # v18.x.x
npm --version   # 9.x.x

# PM2をグローバルインストール
npm install -g pm2

# PM2の自動起動設定
pm2 startup
```

---

### ステップ4: プロジェクトのクローンとセットアップ

```bash
# プロジェクトディレクトリを作成
mkdir -p /var/www
cd /var/www

# GitHubからクローン
git clone https://github.com/kk-ben/bess-site-survey-system.git
cd bess-site-survey-system

# 依存関係をインストール
npm install

# TypeScriptをビルド
npm run build
```

---

### ステップ5: 環境変数の設定

```bash
# 本番環境用の環境変数ファイルを作成
nano .env.production
```

以下の内容を貼り付け（Supabaseの情報は後で更新）：

```env
# サーバー設定
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# CORS設定（Vercelのフロントエンドドメインを後で更新）
CORS_ORIGIN=https://your-frontend.vercel.app

# Supabase設定（要更新）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT設定（強力なランダム文字列に変更）
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_32_CHARS_OR_MORE
JWT_EXPIRES_IN=7d

# Google Maps API（必要に応じて）
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Redis（オプション）
REDIS_URL=redis://localhost:6379

# ログ設定
LOG_LEVEL=info
LOG_DIR=./logs
```

保存: `Ctrl + X` → `Y` → `Enter`

---

### ステップ6: PM2でアプリケーションを起動

```bash
# PM2設定ファイルを作成
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bess-api',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/pm2/bess-api-error.log',
    out_file: '/var/log/pm2/bess-api-out.log',
    log_file: '/var/log/pm2/bess-api.log',
    time: true,
    max_memory_restart: '500M'
  }]
};
EOF

# ログディレクトリを作成
mkdir -p /var/log/pm2

# PM2でアプリケーションを起動
pm2 start ecosystem.config.js --env production

# PM2の設定を保存
pm2 save

# 起動状態を確認
pm2 status
pm2 logs bess-api --lines 50
```

---

### ステップ7: Nginxの設定

```bash
# Nginx設定ファイルを作成
cat > /etc/nginx/sites-available/bess-api << 'EOF'
server {
    listen 80;
    server_name api.ps-system.jp;

    # Let's Encrypt用
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # 一時的にHTTPでアクセス可能にする（SSL設定前）
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS設定
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        
        # Preflight requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    # ログ設定
    access_log /var/log/nginx/bess-api.access.log;
    error_log /var/log/nginx/bess-api.error.log;
}
EOF

# 設定ファイルを有効化
ln -s /etc/nginx/sites-available/bess-api /etc/nginx/sites-enabled/

# デフォルト設定を無効化
rm -f /etc/nginx/sites-enabled/default

# Nginx設定をテスト
nginx -t

# Nginxを再起動
systemctl restart nginx
```

---

### ステップ8: ファイアウォールの設定

```bash
# UFWをインストール（まだの場合）
apt install -y ufw

# SSH、HTTP、HTTPSを許可
ufw allow OpenSSH
ufw allow 'Nginx Full'

# ファイアウォールを有効化
ufw --force enable

# 状態確認
ufw status
```

---

### ステップ9: SSL証明書の取得

```bash
# Let's EncryptでSSL証明書を取得
certbot --nginx -d api.ps-system.jp --non-interactive --agree-tos --email admin@ps-system.jp

# 自動更新のテスト
certbot renew --dry-run

# 証明書の自動更新をcronに設定（通常は自動設定済み）
crontab -l | grep -q certbot || (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
```

SSL証明書取得後、Nginxは自動的にHTTPSにリダイレクトするように設定されます。

---

### ステップ10: 動作確認

```bash
# ローカルでAPIをテスト
curl http://localhost:3000/api/v1/health

# 外部からHTTPSでテスト
curl https://api.ps-system.jp/api/v1/health

# 期待される結果
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "uptime": 123.456
# }
```

ブラウザでも確認：
- https://api.ps-system.jp/api/v1/health

---

## 🔄 更新・メンテナンス

### コードの更新

```bash
cd /home/ubuntu/bess-site-survey-system

# 最新コードを取得
git pull origin main

# 依存関係を更新
npm install

# ビルド
npm run build

# PM2でアプリケーションを再起動
pm2 restart bess-api

# ログを確認
pm2 logs bess-api --lines 50
```

### ログの確認

```bash
# PM2ログ
pm2 logs bess-api

# Nginxアクセスログ
tail -f /var/log/nginx/bess-api.access.log

# Nginxエラーログ
tail -f /var/log/nginx/bess-api.error.log

# システムログ
journalctl -u nginx -f
```

### パフォーマンス監視

```bash
# PM2モニタリング
pm2 monit

# システムリソース
htop  # インストール: apt install htop

# ディスク使用量
df -h

# メモリ使用量
free -h
```

---

## 🔧 トラブルシューティング

### APIが起動しない

```bash
# PM2ログを確認
pm2 logs bess-api --lines 100

# アプリケーションを再起動
pm2 restart bess-api

# 環境変数を確認
pm2 env bess-api
```

### Nginxエラー

```bash
# Nginx設定をテスト
nginx -t

# Nginxエラーログを確認
tail -f /var/log/nginx/bess-api.error.log

# Nginxを再起動
systemctl restart nginx
```

### SSL証明書エラー

```bash
# 証明書の状態を確認
certbot certificates

# 証明書を手動更新
certbot renew

# Nginxを再起動
systemctl restart nginx
```

### ポートが使用中

```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# または
netstat -tlnp | grep :3000

# プロセスを停止
pm2 stop bess-api
pm2 start bess-api
```

---

## 📊 次のステップ

### 1. Supabaseのセットアップ

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. データベースURLとAPIキーを取得
3. `/home/ubuntu/bess-site-survey-system/.env.production` を更新
4. `pm2 restart bess-api` で再起動

### 2. フロントエンドのデプロイ

1. Vercelでフロントエンドをデプロイ
2. 環境変数 `VITE_API_BASE_URL` を `https://api.ps-system.jp/api/v1` に設定
3. VPSの `.env.production` の `CORS_ORIGIN` をVercelのURLに更新
4. `pm2 restart bess-api` で再起動

### 3. 監視の設定

- [UptimeRobot](https://uptimerobot.com)でAPIの死活監視
- PM2のモニタリングダッシュボード: `pm2 web`

---

## 🎉 デプロイ完了！

バックエンドAPIが以下のURLで稼働中：
- **API URL**: https://api.ps-system.jp/api/v1
- **ヘルスチェック**: https://api.ps-system.jp/api/v1/health

次は、Vercelでフロントエンドをデプロイしましょう！
