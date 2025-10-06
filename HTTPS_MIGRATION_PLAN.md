# HTTPS移行計画 - 完全チェックリスト

## 📋 概要

VPS APIを`http://153.121.61.164:3000`から`https://ps-system.jp`に移行するための完全な修正リスト。

## 🎯 変更対象URL

- **旧URL**: `http://153.121.61.164:3000`
- **新URL**: `https://ps-system.jp`
- **API Base URL**: `https://ps-system.jp/api/v2`

---

## ✅ 修正が必要なファイル

### 1. フロントエンド環境設定 🔴 **最重要**

#### `frontend/.env.production`
```env
# 変更前
VITE_API_BASE_URL=http://153.121.61.164:3000/api/v2

# 変更後
VITE_API_BASE_URL=https://ps-system.jp/api/v2
```

#### `frontend/.env.example`
```env
# 開発環境用（変更不要）
VITE_API_BASE_URL=http://localhost:4000/api/v1
```

---

### 2. バックエンド環境設定 🔴 **最重要**

#### `.env.example`
```env
# CORS設定を更新
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://bess-site-survey-system.vercel.app,https://ps-system.jp
```

#### VPS上の`.env.production`（SSH接続して編集）
```env
# CORS設定にHTTPSドメインを追加
ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp

# その他の設定は変更不要
```

---

### 3. Vercel環境変数 🔴 **最重要**

Vercel Dashboard → Settings → Environment Variables

| 変数名 | 変更前 | 変更後 |
|--------|--------|--------|
| `VITE_API_BASE_URL` | `http://153.121.61.164:3000/api/v2` | `https://ps-system.jp/api/v2` |
| `VITE_SUPABASE_URL` | 変更不要 | 変更不要 |
| `VITE_SUPABASE_ANON_KEY` | 変更不要 | 変更不要 |

**設定後、必ず再デプロイを実行！**

---

### 4. PowerShellスクリプト 🟡 **中優先度**

#### `scripts/vercel-set-env.ps1`
```powershell
# Line 32-33
@{
    key = "VITE_API_BASE_URL"
    value = "https://ps-system.jp/api/v2"  # 変更
    target = @("production", "preview")
}
```

#### `scripts/vercel-setup-complete.ps1`
```powershell
# Line 65-66
@{
    key = "VITE_API_BASE_URL"
    value = "https://ps-system.jp/api/v2"  # 変更
}
```

#### `scripts/vercel-setup-personal.ps1`
```powershell
# Line 47-48
@{
    key = "VITE_API_BASE_URL"
    value = "https://ps-system.jp/api/v2"  # 変更
}
```

---

### 5. ドキュメントファイル 🟢 **低優先度（既に完了）**

✅ 以下のファイルは既に更新済み（21ファイル）:
- `ALL_READY_TO_DEPLOY.md`
- `DEPLOYMENT_COMPLETE_FINAL.md`
- `DEPLOYMENT_COMPLETE_V2.md`
- `DEPLOYMENT_STATUS_FINAL.md`
- `EXECUTE_NOW.md`
- `FINAL_STATUS_REPORT.md`
- `HTTPS_SETUP_GUIDE.md`
- `ONLINE_DEPLOYMENT_FINAL_STEPS.md`
- `QUICK_DATA_INSERT.md`
- `STEP2_INSERT_TEST_DATA.md`
- `SUPABASE_TEST_DATA_SETUP.md`
- `VERCEL_DEPLOY_NOW.md`
- `VERCEL_DEPLOY_STEPS_V2.md`
- `VERCEL_DEPLOY_SUCCESS.md`
- `VERCEL_DEPLOY_QUICK_GUIDE.md`
- `VERCEL_ENV_COPY_PASTE.md`
- `VERCEL_ENV_MANUAL_SETUP.md`
- `VERCEL_ENV_SETUP.md`
- `VERCEL_MANUAL_SETUP.md`
- `VERCEL_UPDATE_EXISTING_PROJECT.md`
- `VPS_DEPLOY_SUCCESS.md`
- `VPS_STATUS_CHECK.md`

---

## 🔒 セキュリティ設定

### CORS設定（バックエンド）

`src/index.ts`の現在の設定:
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
  'http://localhost:3000',
  'http://localhost:5173',
];
```

**VPS上の`.env.production`に追加が必要**:
```env
ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp
```

### SSL/TLS証明書（VPS）

Nginx設定で以下を確認:
- SSL証明書のパス
- HTTPからHTTPSへのリダイレクト
- セキュリティヘッダー

---

## 📝 実行手順

### ステップ1: ローカルファイルの更新 ✅

```powershell
# 一括更新スクリプトを実行
cd bess-site-survey-system
.\scripts\migrate-to-https.ps1
```

### ステップ2: VPS設定の更新 🔴

```bash
# VPSにSSH接続
ssh ubuntu@153.121.61.164

# .env.productionを編集
cd /home/ubuntu/bess-site-survey-system
nano .env.production

# ALLOWED_ORIGINSを更新
ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp

# 保存して再起動
pm2 restart bess-api
pm2 logs bess-api --lines 50
```

### ステップ3: Vercel環境変数の更新 🔴

1. https://vercel.com/dashboard にアクセス
2. プロジェクト選択: `bess-site-survey-system`
3. Settings → Environment Variables
4. `VITE_API_BASE_URL`を編集:
   - 値を`https://ps-system.jp/api/v2`に変更
   - Production, Preview, Development すべてに適用
5. Save

### ステップ4: 再デプロイ 🔴

```powershell
# Vercelで再デプロイ
cd bess-site-survey-system/frontend
vercel --prod

# または、GitHubにプッシュして自動デプロイ
git add .
git commit -m "Update API URL to HTTPS"
git push origin main
```

### ステップ5: 動作確認 ✅

```powershell
# API Health Check
Invoke-RestMethod -Uri "https://ps-system.jp/api/v2/health"

# サイト一覧取得
Invoke-RestMethod -Uri "https://ps-system.jp/api/v2/sites"

# フロントエンドアクセス
# ブラウザで Vercel URL を開く
# F12 → Network タブで API呼び出しを確認
```

---

## 🚨 トラブルシューティング

### CORSエラーが発生する場合

**症状**:
```
Access to fetch at 'https://ps-system.jp/api/v2/...' from origin 'https://...' has been blocked by CORS policy
```

**解決策**:
1. VPSの`.env.production`で`ALLOWED_ORIGINS`を確認
2. `pm2 restart bess-api`で再起動
3. `pm2 logs bess-api`でログ確認

### SSL証明書エラーが発生する場合

**症状**:
```
NET::ERR_CERT_AUTHORITY_INVALID
```

**解決策**:
1. VPSでSSL証明書を確認: `sudo certbot certificates`
2. 証明書を更新: `sudo certbot renew`
3. Nginxを再起動: `sudo systemctl restart nginx`

### Vercelで環境変数が反映されない場合

**解決策**:
1. Vercel Dashboard → Deployments
2. 最新のデプロイを選択
3. "Redeploy" をクリック
4. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）

---

## ✅ 完了チェックリスト

- [ ] ローカルファイルの更新（スクリプト実行）
- [ ] VPS `.env.production`の`ALLOWED_ORIGINS`更新
- [ ] VPS APIの再起動（pm2 restart）
- [ ] Vercel環境変数の更新
- [ ] Vercelで再デプロイ
- [ ] API Health Check確認
- [ ] フロントエンドからのAPI呼び出し確認
- [ ] ブラウザコンソールでエラーがないか確認
- [ ] 本番環境でログイン・データ取得テスト

---

## 📊 影響範囲サマリー

| カテゴリ | ファイル数 | 優先度 | 状態 |
|---------|-----------|--------|------|
| フロントエンド環境設定 | 1 | 🔴 最重要 | 未完了 |
| バックエンド環境設定 | 2 | 🔴 最重要 | 未完了 |
| Vercel環境変数 | 1 | 🔴 最重要 | 未完了 |
| PowerShellスクリプト | 3 | 🟡 中 | 未完了 |
| ドキュメント | 21 | 🟢 低 | ✅ 完了 |

---

## 🔗 関連リンク

- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard
- VPS IP: 153.121.61.164
- 新ドメイン: https://ps-system.jp

---

## 📅 作業履歴

- 2025-01-06: ドキュメントファイル21件を一括更新
- 2025-01-06: HTTPS移行計画書作成
