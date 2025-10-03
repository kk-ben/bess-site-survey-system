# 🚀 BESS用地調査システム - デプロイ戦略

## 📋 デプロイ環境の構成

```
開発環境（ローカルPC）
    ↓ テスト
テスト環境（さくらVPS）
    ↓ 検証完了
本番環境（Supabase + Vercel）
```

---

## 🧪 テスト環境：さくらVPS

### 概要
- **目的**: 本番前の統合テスト・ユーザー受け入れテスト
- **構成**: Docker Compose + PostgreSQL + Redis
- **アクセス**: チーム内からHTTPS経由
- **コスト**: 既存契約のVPS（追加費用なし）

### メリット
✅ 本番に近い環境でテスト可能  
✅ チーム全体で動作確認  
✅ パフォーマンステスト実施可能  
✅ データベースの動作検証  

### デプロイ手順

#### 1. さくらVPSへSSH接続
```bash
ssh user@your-sakura-vps-ip
```

#### 2. 自動セットアップスクリプトを実行
```bash
# リポジトリをクローン
git clone https://github.com/your-repo/bess-site-survey-system.git
cd bess-site-survey-system

# セットアップスクリプトを実行
chmod +x scripts/deploy-sakura-vps.sh
./scripts/deploy-sakura-vps.sh
```

#### 3. 環境変数を設定
```bash
nano .env.staging
```

```env
# テスト環境設定
NODE_ENV=staging
PORT=4000

# データベース（VPS内のPostgreSQL）
DATABASE_URL=postgresql://bess_user:secure_password@localhost:5432/bess_survey_staging

# Redis
REDIS_URL=redis://:redis_password@localhost:6379

# JWT
JWT_SECRET=your_staging_jwt_secret_32_chars_minimum

# ドメイン（Let's Encrypt SSL）
DOMAIN=test-bess.your-domain.com
```

#### 4. SSL証明書の取得
```bash
sudo certbot --nginx -d test-bess.your-domain.com
```

#### 5. アクセス確認
- URL: `https://test-bess.your-domain.com`
- 初期ログイン: `admin@example.com` / `admin123`

---

## 🌐 本番環境：Supabase + Vercel

### 概要
- **目的**: 本番運用・エンドユーザー向け
- **構成**: Vercel（フロントエンド） + Supabase（データベース） + Vercel Serverless（バックエンド）
- **アクセス**: 全世界からHTTPS経由
- **コスト**: 従量課金（小規模なら無料枠内）

### メリット
✅ 自動スケーリング  
✅ 高可用性・冗長化  
✅ グローバルCDN  
✅ 自動バックアップ  
✅ 管理が簡単  

### デプロイ手順

#### ステップ1: Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com)にログイン
2. 「New Project」をクリック
3. プロジェクト名: `bess-survey-production`
4. データベースパスワードを設定（安全なものを）
5. リージョン: `Northeast Asia (Tokyo)`を選択

#### ステップ2: データベースのセットアップ

1. Supabase Dashboard → SQL Editor
2. 以下のSQLを実行:

```sql
-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- マイグレーションを実行
-- database/migrations/001_initial_schema.sql の内容をコピー＆ペースト
```

3. Settings → Database → Connection stringをコピー

#### ステップ3: Vercel（フロントエンド）のデプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# フロントエンドをデプロイ
cd frontend
vercel

# 環境変数を設定
vercel env add VITE_API_BASE_URL production
# 値: https://your-project.vercel.app/api/v1

vercel env add VITE_GOOGLE_MAPS_API_KEY production
# 値: your_google_maps_api_key

# 本番デプロイ
vercel --prod
```

#### ステップ4: Vercel（バックエンド）のデプロイ

```bash
# ルートディレクトリで
cd ..
vercel

# 環境変数を設定
vercel env add DATABASE_URL production
# 値: Supabaseの接続文字列

vercel env add JWT_SECRET production
# 値: 安全なランダム文字列（32文字以上）

vercel env add REDIS_URL production
# 値: Upstash Redisの接続文字列（後述）

vercel env add NODE_ENV production
# 値: production

# 本番デプロイ
vercel --prod
```

#### ステップ5: Upstash Redis（オプション）

1. [Upstash](https://upstash.com)にログイン
2. 「Create Database」
3. リージョン: `ap-northeast-1 (Tokyo)`
4. REST APIのURLをコピー
5. Vercelの環境変数に追加

#### ステップ6: カスタムドメインの設定

1. Vercel Dashboard → Settings → Domains
2. カスタムドメインを追加: `bess.your-domain.com`
3. DNSレコードを設定（Vercelの指示に従う）

---

## 📊 環境比較表

| 項目 | ローカル | さくらVPS（テスト） | Supabase+Vercel（本番） |
|------|---------|-------------------|----------------------|
| 目的 | 開発 | テスト・検証 | 本番運用 |
| データベース | Docker PostgreSQL | VPS PostgreSQL | Supabase PostgreSQL |
| Redis | Docker Redis | VPS Redis | Upstash Redis |
| SSL | なし | Let's Encrypt | 自動（Vercel） |
| スケーリング | なし | 手動 | 自動 |
| バックアップ | 手動 | 手動 | 自動 |
| コスト | 無料 | VPS料金のみ | 従量課金 |
| アクセス | localhost | test-bess.your-domain.com | bess.your-domain.com |

---

## 🔄 デプロイフロー

### 開発 → テスト
```bash
# ローカルで開発
git add .
git commit -m "新機能追加"
git push origin develop

# さくらVPSで更新
ssh user@sakura-vps
cd bess-site-survey-system
git pull origin develop
docker-compose restart
```

### テスト → 本番
```bash
# テスト環境で検証完了後
git checkout main
git merge develop
git push origin main

# Vercelが自動デプロイ（GitHub連携の場合）
# または手動デプロイ
vercel --prod
```

---

## 🛠️ 管理コマンド

### さくらVPS（テスト環境）
```bash
# ログ確認
docker-compose logs -f

# 再起動
docker-compose restart

# データベースバックアップ
docker exec bess-postgres pg_dump -U bess_user bess_survey_staging > backup.sql

# システム更新
git pull
docker-compose down
docker-compose up -d --build
```

### Supabase+Vercel（本番環境）
```bash
# デプロイ
vercel --prod

# ログ確認
vercel logs

# 環境変数確認
vercel env ls

# ロールバック
vercel rollback
```

---

## 📈 監視・メンテナンス

### テスト環境（さくらVPS）
- **Uptime監視**: UptimeRobot（無料）
- **ログ**: サーバー内のログファイル
- **バックアップ**: 毎日自動バックアップ（cron）

### 本番環境（Supabase+Vercel）
- **Uptime監視**: Vercel Analytics（組み込み）
- **エラー追跡**: Sentry（推奨）
- **ログ**: Vercel Logs
- **バックアップ**: Supabase自動バックアップ

---

## 🔒 セキュリティチェックリスト

### テスト環境
- [ ] ファイアウォール設定（80, 443のみ開放）
- [ ] SSH鍵認証の設定
- [ ] Let's Encrypt SSL証明書
- [ ] 強力なデータベースパスワード
- [ ] 定期的なセキュリティアップデート

### 本番環境
- [ ] Supabase Row Level Security（RLS）有効化
- [ ] Vercel環境変数の暗号化
- [ ] JWT_SECRETの強力な設定
- [ ] CORS設定の確認
- [ ] レート制限の設定
- [ ] 定期的なセキュリティ監査

---

## 💰 コスト見積もり

### テスト環境（さくらVPS）
- VPS料金: 既存契約（追加費用なし）
- ドメイン: 年間1,000円程度
- SSL証明書: 無料（Let's Encrypt）

**合計: 約1,000円/年**

### 本番環境（Supabase + Vercel）
- Supabase: 無料枠 → 月25ドル（Pro）
- Vercel: 無料枠 → 月20ドル（Pro）
- Upstash Redis: 無料枠 → 月10ドル
- ドメイン: 年間1,000円程度

**小規模運用: 無料枠内で可能**  
**中規模運用: 約5,000円/月**

---

## 🎯 次のステップ

1. **ローカル環境でテスト** → `DEPLOY_NOW.md`参照
2. **さくらVPSにデプロイ** → `SAKURA_VPS_SETUP.md`参照
3. **Supabase+Vercelにデプロイ** → `SUPABASE_PRODUCTION_SETUP.md`参照

---

**準備完了！デプロイを開始しましょう！🚀**
