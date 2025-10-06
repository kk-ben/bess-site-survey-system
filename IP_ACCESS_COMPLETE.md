# 🎉 IPアドレスアクセス設定完了

## ✅ 完了した内容

### 1. VPS側の設定
- ✅ Nginxインストール完了
- ✅ リバースプロキシ設定完了
- ✅ ポート80でアクセス可能
- ✅ 外部からのアクセステスト成功

### 2. 動作確認済みエンドポイント
```
http://153.121.61.164/api/v2  ✅
http://153.121.61.164/health  ✅
```

### 3. フロントエンド設定
- ✅ 環境変数を更新（Nginx経由のURL）
- ✅ GitHubにプッシュ完了

## 🔧 次のステップ: Vercel環境変数の更新

### 方法1: Vercelダッシュボードから（推奨）

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/dashboard
   - プロジェクト `bess-site-survey-system-frontend` を選択

2. **Settings → Environment Variables**
   - `VITE_API_BASE_URL` を探す
   - 編集ボタンをクリック

3. **値を更新**
   ```
   旧: http://153.121.61.164:3000/api/v2
   新: http://153.121.61.164/api/v2
   ```
   - Environment: `Production` を選択
   - Save

4. **再デプロイ**
   - Deployments タブに移動
   - 最新のデプロイメントの右側の「...」メニューをクリック
   - 「Redeploy」を選択

### 方法2: Vercel CLIから

```powershell
# Vercel CLIをインストール（未インストールの場合）
npm install -g vercel

# ログイン
vercel login

# 環境変数を更新
cd bess-site-survey-system/frontend
vercel env rm VITE_API_BASE_URL production --yes
# 新しい値を入力: http://153.121.61.164/api/v2
vercel env add VITE_API_BASE_URL production

# デプロイ
vercel --prod
```

## 📊 現在のシステム構成

```
インターネット
    ↓
http://153.121.61.164 (VPS)
    ↓
Nginx (ポート80)
    ↓
Node.js API (ポート3000)
    ↓
Supabase Database
```

## 🎯 動作確認

Vercel再デプロイ後、以下を確認：

1. **フロントエンドアクセス**
   ```
   https://bess-site-survey-system-frontend.vercel.app
   ```

2. **APIアクセステスト**
   - ブラウザの開発者ツール（F12）を開く
   - Network タブで API リクエストを確認
   - `http://153.121.61.164/api/v2` にリクエストが送信されているか確認

## ⚠️ 注意事項

### 現在の制限
- HTTPのみ（HTTPSではない）
- IPアドレス直接指定（ドメイン名なし）
- ブラウザによってはMixed Content警告が出る可能性

### 次の改善ステップ（オプション）
1. **ドメイン設定**
   - お名前.comでDNS設定
   - `ps-system.jp` → `153.121.61.164`

2. **SSL/TLS証明書（Let's Encrypt）**
   - Certbotインストール
   - HTTPS化

3. **フロントエンドURL更新**
   - `https://ps-system.jp/api/v2`

## 🔍 トラブルシューティング

### APIにアクセスできない場合

1. **VPS側の確認**
   ```bash
   # VPSにSSH接続
   ssh ubuntu@153.121.61.164
   
   # Nginxステータス確認
   sudo systemctl status nginx
   
   # APIステータス確認
   pm2 status
   
   # ログ確認
   sudo tail -f /var/log/nginx/error.log
   ```

2. **ファイアウォール確認**
   ```bash
   # ポート80が開いているか確認
   sudo ufw status
   ```

3. **ローカルからテスト**
   ```powershell
   curl http://153.121.61.164/api/v2
   ```

## 📝 まとめ

現在、IPアドレスでの外部アクセスが可能になりました！

- ✅ VPS: Nginx + Node.js API 稼働中
- ✅ 外部アクセス: `http://153.121.61.164/api/v2`
- 🔄 Vercel: 環境変数更新 + 再デプロイ待ち

Vercelの再デプロイが完了すれば、フロントエンドからAPIへの接続が確立されます！
