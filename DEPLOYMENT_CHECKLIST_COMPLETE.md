# ✅ BESS Site Survey System - 完全デプロイチェックリスト

## 📋 デプロイ構成

```
Frontend (Vercel) → Backend API (VPS) → Database (Supabase)
     ↓                    ↓                    ↓
bess.vercel.app    api.ps-system.jp    PostgreSQL
                   153.121.61.164
```

---

## 🎯 デプロイ手順（推奨順序）

### フェーズ1: Supabaseセットアップ（15分）

- [ ] 1.1 [Supabase](https://supabase.com)でアカウント作成
- [ ] 1.2 新しいプロジェクトを作成
  - プロジェクト名: `bess-site-survey-system`
  - リージョン: `Northeast Asia (Tokyo)`
  - データベースパスワードを設定（安全な場所に保存）
- [ ] 1.3 プロジェクトURLとAPIキーを取得
  - Settings → API
  - `Project URL` をコピー
  - `anon public` キーをコピー
  - `service_role` キーをコピー（秘密情報）
- [ ] 1.4 データベーススキーマを作成
  - SQL Editor を開く
  - `bess-site-survey-system/database/migrations/001_initial_schema.sql` の内容を実行
- [ ] 1.5 Row Level Security (RLS) を設定
  - Authentication → Policies
  - 必要なポリシーを追加

**取得した情報をメモ**:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

---

### フェーズ2: VPSバックエンドAPIデプロイ（30分）

#### 2.1 DNSレコードの設定

- [ ] さくらVPSコントロールパネルにログイン
- [ ] DNSレコードを追加:
  ```
  タイプ: A
  ホスト名: api
  値: 153.121.61.164
  TTL: 3600
  ```
- [ ] DNS反映を確認（5-10分待つ）:
  ```bash
  nslookup api.ps-system.jp
  ```

#### 2.2 VPSにSSH接続

```bash
ssh root@153.121.61.164
```

#### 2.3 自動デプロイスクリプトを実行

**オプションA: 自動デプロイ（推奨）**

```bash
# スクリプトをダウンロード
curl -fsSL https://raw.githubusercontent.com/kk-ben/bess-site-survey-system/main/scripts/deploy-vps-api.sh -o deploy.sh

# 実行権限を付与
chmod +x deploy.sh

# 実行
./deploy.sh
```

**オプションB: 手動デプロイ**

詳細は `VPS_API_DEPLOY_GUIDE.md` を参照

#### 2.4 環境変数を更新

```bash
nano /var/www/bess-site-survey-system/.env.production
```

以下を更新：
```env
# Supabase情報（フェーズ1で取得）
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# CORS（後でVercelのURLに更新）
CORS_ORIGIN=*

# Google Maps API（必要に応じて）
GOOGLE_MAPS_API_KEY=your-key
```

保存: `Ctrl + X` → `Y` → `Enter`

#### 2.5 アプリケーションを再起動

```bash
pm2 restart bess-api
pm2 logs bess-api --lines 50
```

#### 2.6 動作確認

```bash
# ローカルテスト
curl http://localhost:3000/api/v1/health

# 外部テスト
curl https://api.ps-system.jp/api/v1/health

# 期待される結果
# {"status":"ok","timestamp":"...","uptime":...}
```

- [ ] ヘルスチェックが成功
- [ ] PM2でアプリケーションが起動中
- [ ] Nginxが正常に動作
- [ ] SSL証明書が取得済み

---

### フェーズ3: Vercelフロントエンドデプロイ（20分）

#### 3.1 GitHubにプッシュ

```bash
cd bess-site-survey-system
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 3.2 Vercelでプロジェクトをインポート

- [ ] [Vercel](https://vercel.com)にログイン
- [ ] 「Add New...」→「Project」
- [ ] `bess-site-survey-system` を選択
- [ ] 「Import」をクリック

#### 3.3 プロジェクト設定

- [ ] **Framework Preset**: Vite
- [ ] **Root Directory**: `frontend` ← 重要！
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `dist`

#### 3.4 環境変数を設定

「Environment Variables」で以下を追加：

```env
VITE_API_BASE_URL=https://api.ps-system.jp/api/v1
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_GOOGLE_MAPS_API_KEY=your-key
```

- [ ] すべての環境変数が `VITE_` プレフィックス付き
- [ ] Supabase情報が正しい
- [ ] API URLが正しい

#### 3.5 デプロイ実行

- [ ] 「Deploy」をクリック
- [ ] ビルド完了を待つ（2-3分）
- [ ] デプロイURLを確認: `https://bess-site-survey-system.vercel.app`

#### 3.6 カスタムドメイン設定（オプション）

- [ ] Vercel: Settings → Domains → `bess.ps-system.jp` を追加
- [ ] さくらVPS: DNSレコードを追加
  ```
  タイプ: CNAME
  ホスト名: bess
  値: cname.vercel-dns.com
  ```
- [ ] SSL証明書の自動発行を待つ（数分）

---

### フェーズ4: CORS設定の更新（5分）

#### 4.1 VPSでCORS設定を更新

```bash
ssh root@153.121.61.164
nano /var/www/bess-site-survey-system/.env.production
```

`CORS_ORIGIN` を更新：
```env
CORS_ORIGIN=https://bess-site-survey-system.vercel.app
```

カスタムドメインを使用する場合：
```env
CORS_ORIGIN=https://bess.ps-system.jp
```

#### 4.2 アプリケーションを再起動

```bash
pm2 restart bess-api
pm2 logs bess-api --lines 50
```

---

### フェーズ5: 動作確認（10分）

#### 5.1 フロントエンドにアクセス

- [ ] https://bess-site-survey-system.vercel.app にアクセス
- [ ] ログインページが表示される
- [ ] ブラウザの開発者ツール（F12）でエラーがない

#### 5.2 APIとの接続確認

- [ ] Network タブでAPIリクエストが成功（200 OK）
- [ ] CORSエラーがない
- [ ] Console タブでエラーがない

#### 5.3 テストログイン

初期管理者アカウント：
- Email: `admin@example.com`
- Password: `admin123`

- [ ] ログインが成功
- [ ] ダッシュボードが表示される
- [ ] サイドバーのナビゲーションが動作

#### 5.4 基本機能のテスト

- [ ] サイト一覧ページが表示される
- [ ] CSVアップロード機能が動作
- [ ] 地図表示が動作（Google Maps API設定時）
- [ ] スクリーニング機能が動作
- [ ] エクスポート機能が動作

---

## 🔧 トラブルシューティング

### バックエンドAPIが起動しない

```bash
# ログを確認
pm2 logs bess-api --lines 100

# 環境変数を確認
cat /var/www/bess-site-survey-system/.env.production

# アプリケーションを再起動
pm2 restart bess-api
```

### CORSエラー

```bash
# VPSでCORS設定を確認
grep CORS_ORIGIN /var/www/bess-site-survey-system/.env.production

# Vercelのドメインと一致しているか確認
# 一致していない場合は更新して再起動
pm2 restart bess-api
```

### Vercelビルドエラー

1. Vercel: Settings → General → Root Directory が `frontend` になっているか確認
2. 環境変数がすべて `VITE_` プレフィックス付きか確認
3. Deployments → 最新のデプロイ → View Build Logs でエラーを確認

### Supabase接続エラー

1. Supabase: Settings → API で情報を再確認
2. Vercelの環境変数が正しいか確認
3. VPSの環境変数が正しいか確認
4. 両方を更新して再デプロイ

---

## 📊 デプロイ後の設定

### セキュリティ強化

- [ ] Supabaseで初期管理者パスワードを変更
- [ ] VPSでSSH鍵認証を設定
- [ ] VPSでFail2Banをインストール
- [ ] 環境変数の秘密情報を確認

### 監視設定

- [ ] [UptimeRobot](https://uptimerobot.com)でAPIの死活監視
- [ ] Vercel Analyticsを有効化
- [ ] PM2モニタリング: `pm2 web`

### バックアップ設定

```bash
# VPSでバックアップスクリプトを設定
crontab -e

# 毎日午前2時にコードをバックアップ
0 2 * * * cd /var/www/bess-site-survey-system && git pull origin main
```

---

## 🎉 デプロイ完了！

### システム構成

```
Frontend: https://bess-site-survey-system.vercel.app
Backend:  https://api.ps-system.jp/api/v1
Database: Supabase PostgreSQL
```

### 管理URL

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repository**: https://github.com/kk-ben/bess-site-survey-system

### 重要なコマンド

```bash
# VPS: アプリケーション再起動
pm2 restart bess-api

# VPS: ログ確認
pm2 logs bess-api

# VPS: コード更新
cd /var/www/bess-site-survey-system && git pull && npm install && npm run build && pm2 restart bess-api

# ローカル: Vercelに再デプロイ
git push origin main
```

---

## 📞 サポート

問題が発生した場合：
1. 各フェーズのトラブルシューティングセクションを確認
2. ログを確認（PM2、Nginx、Vercel Build Logs）
3. GitHubでIssueを作成

**おめでとうございます！システムが本番環境で稼働中です！** 🎊
