# VPS APIサーバー状態確認

## 現在の状況

**日時**: 2025年10月6日（月）

### デプロイ状況
- ✅ フロントエンド: Vercelにデプロイ中（自動デプロイ）
- ❓ バックエンドAPI: VPS (153.121.61.164:3000) - 接続確認が必要

### 実施した作業
1. フロントエンドの`.env.production`を修正
   - API URL: `http://153.121.61.164:3000/api/v2`
   - Supabase設定を正しく設定
2. GitHubにプッシュ（コミット: `69fe8de`）
3. Vercelが自動デプロイを開始

### 次のステップ

#### 1. Vercelデプロイ確認（3-5分後）
```
URL: https://vercel.com/dashboard
プロジェクト: bess-site-survey-system
確認: Deployments タブで最新デプロイが完了しているか
```

#### 2. VPS APIサーバー起動確認
VPSサーバーにSSH接続して、APIサーバーが起動しているか確認する必要があります。

**SSH接続コマンド（例）:**
```bash
ssh user@153.121.61.164
```

**サーバー起動確認:**
```bash
# プロセス確認
ps aux | grep node

# ポート確認
netstat -tlnp | grep 3000

# ログ確認
pm2 logs
# または
journalctl -u bess-api -f
```

**サーバー起動（必要な場合）:**
```bash
cd /path/to/bess-site-survey-system
npm run build
npm start
# または
pm2 start ecosystem.config.js
pm2 save
```

#### 3. API接続テスト
サーバー起動後、以下のコマンドでAPIをテスト：

```powershell
# PowerShellから
Invoke-WebRequest -Uri "http://153.121.61.164:3000/api/v2/sites" -Method GET
```

#### 4. フロントエンド動作確認
Vercelデプロイ完了後：
```
URL: https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login
ログイン: admin@example.com / admin123
確認: サイト一覧が表示されるか
```

## トラブルシューティング

### VPS APIに接続できない場合

**原因1: サーバーが起動していない**
- 解決: VPSにSSH接続してサーバーを起動

**原因2: ファイアウォールでポート3000がブロックされている**
```bash
# ファイアウォール確認
sudo ufw status

# ポート3000を開放
sudo ufw allow 3000/tcp
sudo ufw reload
```

**原因3: 環境変数が設定されていない**
```bash
# .envファイルを確認
cat .env

# 必要な環境変数
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
PORT=3000
```

### Vercelデプロイでエラーが出る場合

**ビルドエラー:**
- Vercelのログを確認
- 環境変数が正しく設定されているか確認

**ランタイムエラー:**
- ブラウザのコンソールを確認
- API URLが正しいか確認

## 連絡先・リソース

- **GitHub**: https://github.com/kk-ben/bess-site-survey-system
- **Vercel**: https://vercel.com/dashboard
- **VPS IP**: 153.121.61.164
- **API Endpoint**: http://153.121.61.164:3000/api/v2

## 次回セッションで確認すること

1. VPSサーバーの起動状態
2. Vercelデプロイの成功/失敗
3. フロントエンドからAPIへの接続
4. ログイン機能の動作
5. サイト一覧の表示
