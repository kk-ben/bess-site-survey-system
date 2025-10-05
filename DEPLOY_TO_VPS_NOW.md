# 🚀 VPSデプロイ実行手順

## ✅ 準備完了

- ✅ v2.0コードをGitHubにプッシュ済み
- ✅ Supabaseスキーマデプロイ済み
- ✅ ローカルでAPIテスト済み

---

## 📋 VPSデプロイ手順

### ステップ1: VPSにSSH接続

**新しいPowerShellウィンドウ**を開いて実行：

```powershell
ssh ubuntu@153.121.61.164
```

パスワード入力後、以下を実行：

---

### ステップ2: デプロイスクリプト実行

```bash
cd ~/bess-site-survey-system
bash scripts/vps-deploy-v2.sh
```

このスクリプトが自動的に以下を実行します：
1. 最新コードをGitHubから取得
2. 依存関係をインストール
3. TypeScriptビルド
4. 環境変数ファイル作成
5. PM2でアプリケーション再起動
6. 動作確認

---

### ステップ3: 動作確認

デプロイ完了後、以下のコマンドで確認：

```bash
# v2.0 APIヘルスチェック
curl http://localhost:3000/api/v2/health

# v2.0サイト一覧
curl http://localhost:3000/api/v2/sites

# PM2ステータス
pm2 status

# ログ確認
pm2 logs bess-api --lines 50
```

---

### ステップ4: 外部からの動作確認

**ローカルPC**から実行：

```powershell
# v2.0 APIヘルスチェック
Invoke-RestMethod -Uri "https://api.ps-system.jp/api/v2/health" | ConvertTo-Json

# v2.0サイト一覧
Invoke-RestMethod -Uri "https://api.ps-system.jp/api/v2/sites" | ConvertTo-Json
```

---

## 🔧 トラブルシューティング

### エラーが発生した場合

```bash
# ログ確認
pm2 logs bess-api --lines 100

# 手動再起動
pm2 restart bess-api

# 完全再起動
pm2 delete bess-api
pm2 start ecosystem.config.js --env production
pm2 save
```

### データベース接続エラー

```bash
# 環境変数確認
cat .env.production | grep SUPABASE

# Supabase接続テスト
curl -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  https://kcohexmvbccxixyfvjyw.supabase.co/rest/v1/sites
```

---

## 📊 デプロイ後の確認項目

- [ ] v1.0 API動作確認（既存機能）
- [ ] v2.0 API動作確認（新機能）
- [ ] サイト一覧取得
- [ ] サイト詳細取得
- [ ] 監査ログ機能
- [ ] スコア履歴機能
- [ ] CSVインポート機能

---

## 🎯 次のステップ

1. ✅ VPSにv2.0 APIをデプロイ ← 今実行中
2. 🔄 フロントエンドをv2.0 APIに接続
3. 🚀 Vercelにフロントエンドをデプロイ
4. 🧪 エンドツーエンドテスト

---

## 📝 重要な情報

### VPS情報
- IP: 153.121.61.164
- ユーザー: ubuntu
- ドメイン: api.ps-system.jp
- アプリケーションパス: /home/ubuntu/bess-site-survey-system

### API URL
- v1.0: https://api.ps-system.jp/api/v1
- v2.0: https://api.ps-system.jp/api/v2

### Supabase
- URL: https://kcohexmvbccxixyfvjyw.supabase.co
- プロジェクト: BESS Site Survey System

---

## 🚨 注意事項

- v1.0 APIは引き続き動作します（後方互換性）
- v2.0 APIは新しいスキーマを使用します
- 両方のバージョンが同時に動作します
- フロントエンドは段階的にv2.0に移行できます

