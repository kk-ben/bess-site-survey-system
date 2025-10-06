# HTTPS移行 - クイックスタートガイド 🚀

## 📋 概要

VPS APIを`http://153.121.61.164:3000`から`https://ps-system.jp`に移行する手順を3ステップで実行します。

**所要時間**: 約15分

---

## ⚡ クイックスタート

### ステップ1: ローカルファイルの更新（5分）

```powershell
# プロジェクトディレクトリに移動
cd bess-site-survey-system

# 一括更新スクリプトを実行
.\scripts\migrate-to-https.ps1
```

**実行内容**:
- ✅ `frontend/.env.production`のAPI URLを更新
- ✅ `.env.example`のCORS設定を更新
- ✅ PowerShellスクリプト3件を更新

---

### ステップ2: VPS設定の更新（5分）

#### オプションA: 自動スクリプト（推奨）

```bash
# VPSにSSH接続
ssh ubuntu@153.121.61.164

# スクリプトをダウンロード（または手動でアップロード）
cd /home/ubuntu/bess-site-survey-system
wget https://raw.githubusercontent.com/your-repo/bess-site-survey-system/main/scripts/vps-update-cors.sh
chmod +x vps-update-cors.sh

# スクリプトを実行
./vps-update-cors.sh
```

#### オプションB: 手動設定

```bash
# VPSにSSH接続
ssh ubuntu@153.121.61.164

# .env.productionを編集
cd /home/ubuntu/bess-site-survey-system
nano .env.production
```

以下の行を追加/更新:
```env
ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp
```

保存後、APIを再起動:
```bash
pm2 restart bess-api
pm2 logs bess-api --lines 50
```

---

### ステップ3: Vercel設定の更新と再デプロイ（5分）

#### オプションA: Vercel CLI（推奨）

```powershell
# プロジェクトディレクトリで実行
cd bess-site-survey-system

# 自動更新スクリプトを実行
.\scripts\vercel-update-https.ps1
```

このスクリプトは以下を自動実行します:
- 既存の`VITE_API_BASE_URL`を削除
- 新しい値`https://ps-system.jp/api/v2`を設定
- 本番環境への再デプロイ（オプション）

#### オプションB: Vercel Dashboard（手動）

1. https://vercel.com/dashboard にアクセス
2. プロジェクト選択: `bess-site-survey-system`
3. **Settings** → **Environment Variables**
4. `VITE_API_BASE_URL`を編集:
   - **値**: `https://ps-system.jp/api/v2`
   - **環境**: Production, Preview, Development すべてチェック
5. **Save**をクリック
6. **Deployments**タブ → 最新のデプロイで**Redeploy**

---

## ✅ 動作確認

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

1. ブラウザでVercel URLを開く
2. **F12**キーを押して開発者ツールを開く
3. **Network**タブを選択
4. ページをリロード
5. API呼び出しが`https://ps-system.jp/api/v2/...`になっているか確認

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

### SSL証明書エラー

**症状**:
```
NET::ERR_CERT_AUTHORITY_INVALID
```

**解決策**:
```bash
# VPSで証明書を確認
sudo certbot certificates

# 証明書を更新
sudo certbot renew

# Nginxを再起動
sudo systemctl restart nginx
```

### Vercel環境変数が反映されない

**解決策**:
1. Vercel Dashboard → **Deployments**
2. 最新のデプロイを選択
3. **Redeploy**をクリック
4. ブラウザのキャッシュをクリア（Ctrl+Shift+Delete）

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

# ファイアウォールを確認
sudo ufw status
```

---

## 📊 完了チェックリスト

実行前に確認:
- [ ] VPSへのSSHアクセス権限がある
- [ ] Vercelアカウントにログイン済み
- [ ] Vercel CLIがインストール済み（`npm install -g vercel`）
- [ ] GitHubリポジトリへのプッシュ権限がある

実行後に確認:
- [ ] ローカルファイルの更新完了
- [ ] VPS `.env.production`の更新完了
- [ ] VPS APIの再起動完了
- [ ] Vercel環境変数の更新完了
- [ ] Vercelで再デプロイ完了
- [ ] API Health Check成功
- [ ] フロントエンドからのAPI呼び出し成功
- [ ] ブラウザコンソールにエラーなし
- [ ] ログイン・データ取得テスト成功

---

## 🔄 ロールバック手順

問題が発生した場合、以下の手順で元に戻せます:

### 1. ローカルファイル

```powershell
# Gitで元に戻す
git checkout frontend/.env.production
git checkout .env.example
git checkout scripts/vercel-*.ps1
```

### 2. VPS設定

```bash
# バックアップから復元
ssh ubuntu@153.121.61.164
cd /home/ubuntu/bess-site-survey-system
cp .env.production.backup.YYYYMMDD_HHMMSS .env.production
pm2 restart bess-api
```

### 3. Vercel環境変数

```powershell
# 旧URLに戻す
cd bess-site-survey-system/frontend
vercel env rm VITE_API_BASE_URL production --yes
echo "http://153.121.61.164:3000/api/v2" | vercel env add VITE_API_BASE_URL production
vercel --prod
```

---

## 📚 関連ドキュメント

- **詳細手順書**: `HTTPS_MIGRATION_PLAN.md`
- **HTTPS設定ガイド**: `HTTPS_SETUP_GUIDE.md`
- **デプロイガイド**: `DEPLOYMENT_GUIDE_V2.md`

---

## 🔗 リンク

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **新ドメイン**: https://ps-system.jp
- **VPS IP**: 153.121.61.164

---

## 💡 ヒント

### 効率的な実行方法

1. **並行作業**: ステップ1と2は並行して実行可能
2. **事前確認**: 各サービスの状態を事前に確認
3. **ログ監視**: 各ステップでログを確認しながら進める

### 本番環境での注意点

- **メンテナンス時間**: ユーザーが少ない時間帯に実行
- **バックアップ**: 必ず事前にバックアップを取得
- **段階的移行**: まずPreview環境でテスト、その後Production

---

## 📞 サポート

問題が解決しない場合:
1. `pm2 logs bess-api`でエラーログを確認
2. ブラウザの開発者ツールでネットワークエラーを確認
3. `HTTPS_MIGRATION_PLAN.md`の詳細なトラブルシューティングを参照

---

**最終更新**: 2025-01-06
