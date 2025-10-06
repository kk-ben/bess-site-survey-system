# HTTPS移行 - 完全サマリー

## 📦 作成されたファイル

### 1. ドキュメント

| ファイル名 | 説明 | 用途 |
|-----------|------|------|
| `HTTPS_MIGRATION_PLAN.md` | 詳細な移行計画書 | 全体像の把握、チェックリスト |
| `HTTPS_MIGRATION_QUICKSTART.md` | クイックスタートガイド | 15分で完了する実行手順 |
| `HTTPS_MIGRATION_SUMMARY.md` | このファイル | 全体サマリー |

### 2. 自動化スクリプト

| ファイル名 | 実行環境 | 説明 |
|-----------|---------|------|
| `scripts/migrate-to-https.ps1` | Windows/PowerShell | ローカルファイル一括更新 |
| `scripts/vps-update-cors.sh` | Linux/VPS | VPS CORS設定更新 |
| `scripts/vercel-update-https.ps1` | Windows/PowerShell | Vercel環境変数更新 |

---

## 🎯 修正対象ファイル一覧

### 🔴 最重要（手動確認必須）

#### フロントエンド
- `frontend/.env.production` - API URL変更

#### バックエンド
- VPS: `/home/ubuntu/bess-site-survey-system/.env.production` - CORS設定

#### Vercel
- 環境変数: `VITE_API_BASE_URL`

### 🟡 中優先度（スクリプトで自動更新）

- `.env.example` - CORS設定例
- `scripts/vercel-set-env.ps1`
- `scripts/vercel-setup-complete.ps1`
- `scripts/vercel-setup-personal.ps1`

### 🟢 低優先度（既に完了）

21個のドキュメントファイル（前回更新済み）

---

## ⚡ 実行手順（3ステップ）

### ステップ1: ローカル更新（5分）
```powershell
cd bess-site-survey-system
.\scripts\migrate-to-https.ps1
```

### ステップ2: VPS更新（5分）
```bash
ssh ubuntu@153.121.61.164
cd /home/ubuntu/bess-site-survey-system
./vps-update-cors.sh
```

### ステップ3: Vercel更新（5分）
```powershell
cd bess-site-survey-system
.\scripts\vercel-update-https.ps1
```

---

## 📊 変更内容サマリー

### URL変更
```
旧: http://153.121.61.164:3000/api/v2
新: https://ps-system.jp/api/v2
```

### CORS設定
```env
# VPS .env.production
ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp
```

### Vercel環境変数
```env
VITE_API_BASE_URL=https://ps-system.jp/api/v2
```

---

## ✅ 動作確認コマンド

### API Health Check
```powershell
Invoke-RestMethod -Uri "https://ps-system.jp/api/v2/health"
```

### サイト一覧取得
```powershell
Invoke-RestMethod -Uri "https://ps-system.jp/api/v2/sites"
```

### フロントエンド確認
1. ブラウザでVercel URLを開く
2. F12 → Network タブ
3. API呼び出しURLを確認

---

## 🔧 各スクリプトの詳細

### migrate-to-https.ps1

**機能**:
- `frontend/.env.production`のAPI URL更新
- `.env.example`のCORS設定更新
- PowerShellスクリプト3件の更新
- 次のステップの案内表示

**実行例**:
```powershell
PS> .\scripts\migrate-to-https.ps1
========================================
  HTTPS移行スクリプト
========================================

変更内容:
  旧URL: http://153.121.61.164:3000
  新URL: https://ps-system.jp

この変更を実行しますか？ (y/N): y

✅ ローカルファイルの更新が完了しました！
```

### vps-update-cors.sh

**機能**:
- `.env.production`のバックアップ作成
- `ALLOWED_ORIGINS`の更新
- PM2でAPIを自動再起動
- ログの表示

**実行例**:
```bash
$ ./vps-update-cors.sh
========================================
  VPS CORS設定更新スクリプト
========================================

現在のALLOWED_ORIGINS:
  https://bess-site-survey-system.vercel.app

新しい設定:
  https://bess-site-survey-system.vercel.app,https://ps-system.jp

この設定で更新しますか？ (y/N): y

✅ バックアップ作成完了
✅ ALLOWED_ORIGINSを更新しました
✅ API再起動完了
```

### vercel-update-https.ps1

**機能**:
- Vercel CLIの確認
- 既存環境変数の削除
- 新しい環境変数の追加（Production, Preview, Development）
- オプションで即座に再デプロイ

**実行例**:
```powershell
PS> .\scripts\vercel-update-https.ps1
========================================
  Vercel環境変数更新（HTTPS対応）
========================================

✅ Vercel CLI: 33.0.1

プロジェクト: bess-site-survey-system
新しいAPI URL: https://ps-system.jp/api/v2

Vercel環境変数を更新しますか？ (y/N): y

✅ Production環境に追加完了
✅ Preview環境に追加完了
✅ Development環境に追加完了

今すぐ本番環境に再デプロイしますか？ (y/N): y

✅ デプロイ完了！
```

---

## 🚨 トラブルシューティング

### よくある問題と解決策

| 問題 | 原因 | 解決策 |
|------|------|--------|
| CORSエラー | VPSのALLOWED_ORIGINS未設定 | `vps-update-cors.sh`を実行 |
| SSL証明書エラー | 証明書の期限切れ | `sudo certbot renew` |
| 環境変数が反映されない | Vercelキャッシュ | 再デプロイ + ブラウザキャッシュクリア |
| APIが応答しない | PM2プロセス停止 | `pm2 restart bess-api` |

### ログ確認コマンド

```bash
# VPS
pm2 logs bess-api --lines 100
sudo tail -f /var/log/nginx/error.log

# ローカル
vercel logs
```

---

## 📋 完了チェックリスト

### 実行前
- [ ] VPSへのSSHアクセス確認
- [ ] Vercelアカウントログイン確認
- [ ] Vercel CLIインストール確認
- [ ] バックアップ取得

### 実行中
- [ ] ステップ1: ローカルファイル更新
- [ ] ステップ2: VPS設定更新
- [ ] ステップ3: Vercel設定更新

### 実行後
- [ ] API Health Check成功
- [ ] サイト一覧取得成功
- [ ] フロントエンドアクセス成功
- [ ] ブラウザコンソールエラーなし
- [ ] ログイン・データ操作テスト成功

---

## 🔄 ロールバック

各スクリプトはバックアップを自動作成します:

```bash
# VPS
/home/ubuntu/bess-site-survey-system/.env.production.backup.YYYYMMDD_HHMMSS

# ローカル
git checkout <file>
```

---

## 📚 ドキュメント構成

```
bess-site-survey-system/
├── HTTPS_MIGRATION_SUMMARY.md      ← このファイル（全体サマリー）
├── HTTPS_MIGRATION_QUICKSTART.md   ← クイックスタート（15分）
├── HTTPS_MIGRATION_PLAN.md         ← 詳細計画書（完全版）
├── HTTPS_SETUP_GUIDE.md            ← SSL/TLS設定ガイド
└── scripts/
    ├── migrate-to-https.ps1        ← ローカル更新
    ├── vps-update-cors.sh          ← VPS更新
    └── vercel-update-https.ps1     ← Vercel更新
```

---

## 🎓 推奨される実行順序

### 初めての場合
1. `HTTPS_MIGRATION_PLAN.md`を読んで全体像を把握
2. `HTTPS_MIGRATION_QUICKSTART.md`に従って実行
3. 問題が発生したら`HTTPS_MIGRATION_PLAN.md`のトラブルシューティングを参照

### 経験者の場合
1. `HTTPS_MIGRATION_QUICKSTART.md`の3ステップを実行
2. 動作確認コマンドで検証

### 慎重に進めたい場合
1. `HTTPS_MIGRATION_PLAN.md`の完了チェックリストを印刷
2. 各項目を確認しながら手動で実行
3. 各ステップでログを確認

---

## 💡 ベストプラクティス

### 実行タイミング
- ユーザーが少ない時間帯（深夜・早朝）
- メンテナンス時間を事前告知
- 金曜日は避ける（週末対応が必要になる可能性）

### 安全な移行
1. まずPreview環境でテスト
2. 問題なければProduction環境に適用
3. 段階的にユーザーを移行

### 監視
- デプロイ後30分はログを監視
- エラー率の急増に注意
- レスポンスタイムの変化を確認

---

## 📞 サポート情報

### 確認すべきログ

1. **VPS API**:
   ```bash
   pm2 logs bess-api --lines 100
   ```

2. **Nginx**:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Vercel**:
   ```powershell
   vercel logs
   ```

4. **ブラウザ**:
   - F12 → Console タブ
   - F12 → Network タブ

### 緊急時の連絡先

- VPS管理者: [連絡先]
- Vercelサポート: https://vercel.com/support
- Supabaseサポート: https://supabase.com/support

---

## 🎉 完了後の確認事項

### 機能テスト
- [ ] ログイン
- [ ] サイト一覧表示
- [ ] サイト詳細表示
- [ ] サイト作成
- [ ] サイト更新
- [ ] サイト削除
- [ ] CSVインポート
- [ ] データエクスポート
- [ ] 地図表示
- [ ] スクリーニング機能

### パフォーマンステスト
- [ ] ページ読み込み時間
- [ ] API応答時間
- [ ] 大量データ処理

### セキュリティ確認
- [ ] HTTPS接続確認
- [ ] SSL証明書有効性
- [ ] CORS設定確認
- [ ] 認証・認可動作確認

---

**最終更新**: 2025-01-06
**バージョン**: 1.0.0
**作成者**: Kiro AI Assistant
