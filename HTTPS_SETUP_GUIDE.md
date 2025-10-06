# HTTPS設定ガイド（VPS）

## 現在の問題

現在、VPS APIは`http://153.121.61.164:3000`でHTTP（暗号化なし）で動作しています。
これには以下のセキュリティリスクがあります：

- 通信内容が平文で送信される
- パスワードやトークンが盗聴される可能性
- 中間者攻撃（MITM）のリスク
- ブラウザが「Mixed Content」エラーを表示する可能性

## 解決策

### オプション1: ドメイン + Let's Encrypt（推奨）

**必要なもの:**
- ドメイン名（例: api.your-domain.com）
- ドメインのDNS設定権限

**手順:**

#### 1. ドメインを取得・設定
```
例: api.bess-system.com
DNSレコード: A レコード → 153.121.61.164
```

#### 2. VPSにNginxをインストール（既にある場合はスキップ）
```bash
ssh ubuntu@153.121.61.164
sudo apt update
sudo apt install nginx -y
```

#### 3. Certbotをインストール
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### 4. SSL証明書を取得
```bash
sudo certbot --nginx -d api.bess-system.com
```

#### 5. Nginx設定を更新
```bash
sudo nano /etc/nginx/sites-available/default
```

```nginx
server {
    listen 80;
    server_name api.bess-system.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.bess-system.com;

    ssl_certificate /etc/letsencrypt/live/api.bess-system.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.bess-system.com/privkey.pem;
    
    # セキュリティ設定
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

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
    }
}
```

#### 6. Nginxを再起動
```bash
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. ファイアウォール設定
```bash
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
sudo ufw status
```

#### 8. Vercelの環境変数を更新
```
VITE_API_BASE_URL=https://api.bess-system.com/api/v2
```

#### 9. 自動更新設定
```bash
sudo certbot renew --dry-run
```

### オプション2: Cloudflare Tunnel（無料・ドメイン不要）

Cloudflare Tunnelを使うと、ドメインなしでHTTPSを設定できます。

#### 1. Cloudflareアカウント作成
https://dash.cloudflare.com/sign-up

#### 2. cloudflaredをインストール
```bash
ssh ubuntu@153.121.61.164
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb
```

#### 3. Cloudflareにログイン
```bash
cloudflared tunnel login
```

#### 4. トンネルを作成
```bash
cloudflared tunnel create bess-api
```

#### 5. トンネル設定
```bash
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: <TUNNEL-ID>
credentials-file: /home/ubuntu/.cloudflared/<TUNNEL-ID>.json

ingress:
  - hostname: bess-api.your-subdomain.workers.dev
    service: http://localhost:3000
  - service: http_status:404
```

#### 6. トンネルを起動
```bash
cloudflared tunnel run bess-api
```

#### 7. サービスとして登録
```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### オプション3: 一時的な対応（開発環境のみ）

本番環境では推奨しませんが、開発中の一時的な対応として：

#### Vercelのプロキシを使う

Vercelに`/api`エンドポイントを作成し、VPS APIへプロキシする方法もあります。

```javascript
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "http://153.121.61.164:3000/api/:path*"
    }
  ]
}
```

ただし、この方法は：
- Vercelの実行時間制限（10秒）がある
- 追加のレイテンシが発生
- Vercelの帯域幅を消費

## 推奨アプローチ

**本番環境:**
1. ドメインを取得（年間1000円程度）
2. Let's Encryptで無料SSL証明書
3. Nginxでリバースプロキシ設定

**開発環境:**
- HTTPのまま使用（ローカルネットワークのみ）
- または、Cloudflare Tunnelで簡易HTTPS

## セキュリティベストプラクティス

HTTPSを設定した後も：

1. **CORS設定を厳格に**
   ```javascript
   cors({
     origin: ['https://bess-site-survey-system.vercel.app'],
     credentials: true
   })
   ```

2. **レート制限を設定**（既に実装済み）

3. **JWT有効期限を短く**
   ```javascript
   expiresIn: '1h'
   ```

4. **環境変数を適切に管理**
   - `.env`ファイルをGitにコミットしない
   - 本番環境では強力なシークレットを使用

5. **定期的なセキュリティアップデート**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

## 次のステップ

1. ドメインを取得するか決定
2. 上記のいずれかの方法でHTTPSを設定
3. Vercelの環境変数を更新
4. 再デプロイして動作確認

---

**質問や不明点があれば、お気軽にお聞きください！**
