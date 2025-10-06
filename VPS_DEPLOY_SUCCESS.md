# 🎉 VPSデプロイ成功！

## ✅ デプロイ完了

v2.0 APIがVPS上で正常に稼働しています！

### 📊 デプロイ結果

```json
{
  "message": "BESS Site Survey System API v2.0",
  "version": "2.0.0",
  "status": "running",
  "features": [
    "Enhanced data model with automation tracking",
    "Audit log support",
    "Score history tracking",
    "Initial job automation"
  ]
}
```

---

## 🌐 API情報

### エンドポイント
- **ローカル**: http://localhost:3000/api/v2
- **VPS**: http://153.121.61.164:3000/api/v2
- **ドメイン**: https://api.ps-system.jp/api/v2 (Nginx設定後)

### バージョン
- v1.0 API: `/api/v1/*` (既存)
- v2.0 API: `/api/v2/*` (新規)

---

## 📋 動作確認コマンド

### VPS上で確認
```bash
ssh ubuntu@153.121.61.164

# v2.0 APIヘルスチェック
curl http://localhost:3000/api/v2

# v2.0サイト一覧
curl http://localhost:3000/api/v2/sites

# PM2ステータス
pm2 status

# ログ確認
pm2 logs bess-api --lines 50
```

### ローカルから確認
```powershell
# VPS直接アクセス
Invoke-RestMethod -Uri "http://153.121.61.164:3000/api/v2"

# サイト一覧
Invoke-RestMethod -Uri "http://153.121.61.164:3000/api/v2/sites"
```

---

## 🔧 環境設定

### 環境変数 (.env)
```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=bess-v2-production-secret-key-2025
```

### PM2設定
- プロセス名: `bess-api`
- 起動ファイル: `dist/index.js`
- 自動起動: 有効

---

## 🎯 次のステップ

### 1. Nginx設定（オプション）
ドメイン経由でアクセスできるようにする：

```bash
ssh ubuntu@153.121.61.164
sudo nano /etc/nginx/sites-available/bess-api

# 設定追加後
sudo nginx -t
sudo systemctl reload nginx
```

### 2. フロントエンドデプロイ
Vercelにフロントエンドをデプロイ：

```powershell
cd bess-site-survey-system/frontend
vercel --prod
```

### 3. エンドツーエンドテスト
フロントエンドとバックエンドの統合テスト

---

## 📊 v2.0 新機能

### 正規化されたデータモデル
- `sites`: サイト基本情報
- `grid_info`: 系統情報（1対1）
- `geo_risk`: 地理的リスク（1対1）
- `automation_tracking`: 自動化追跡
- `audit_log`: 監査ログ
- `score_history`: スコア履歴

### 新しいAPIエンドポイント
```
GET    /api/v2/sites              # サイト一覧
GET    /api/v2/sites/:id          # サイト詳細
POST   /api/v2/sites              # サイト作成
PUT    /api/v2/sites/:id          # サイト更新
DELETE /api/v2/sites/:id          # サイト削除
GET    /api/v2/sites/:id/audit-log   # 監査ログ
GET    /api/v2/sites/:id/scores      # スコア履歴
PUT    /api/v2/sites/:id/grid-info   # Grid Info更新
PUT    /api/v2/sites/:id/geo-risk    # Geo Risk更新
POST   /api/v2/import/csv            # CSVインポート
```

---

## 🔄 管理コマンド

### PM2操作
```bash
# 再起動
pm2 restart bess-api

# 停止
pm2 stop bess-api

# ログ確認
pm2 logs bess-api

# モニタリング
pm2 monit
```

### デプロイ更新
```bash
cd ~/bess-site-survey-system
git pull origin main
npm install
npm run build:backend
pm2 restart bess-api
```

---

## 🎊 完了！

v2.0 APIが本番環境で稼働しています。
フロントエンドのデプロイに進みましょう！

