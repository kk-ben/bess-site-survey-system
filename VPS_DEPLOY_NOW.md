# 🚀 VPSデプロイ - 今すぐ実行

## 📋 実行前チェックリスト

- ✅ SSH情報修正済み（ubuntu@153.121.61.164）
- ✅ ファイルエンコーディング確認済み
- ✅ デプロイスクリプト準備完了

## 🎯 デプロイ実行手順（3ステップ）

### ステップ1: ローカルでコミット＆プッシュ

```powershell
cd bess-site-survey-system
git add .
git commit -m "Deploy v2.0 API with fixed SSH info and encoding"
git push origin main
```

### ステップ2: VPSにSSH接続

```powershell
ssh ubuntu@153.121.61.164
```

パスワード入力後、VPSにログイン

### ステップ3: 自動デプロイスクリプト実行

VPS上で以下を実行：

```bash
cd /home/ubuntu/bess-site-survey-system
bash scripts/vps-deploy-v2.sh
```

## ⏱️ 所要時間

- ステップ1: 1分
- ステップ2: 30秒
- ステップ3: 3-5分（自動実行）

合計: 約5分

## 🔍 デプロイ後の確認

### VPS上で確認

```bash
# PM2ステータス
pm2 status

# ログ確認
pm2 logs bess-api --lines 50

# ヘルスチェック
curl http://localhost:3000/api/v2/health
```

### ローカルPCから確認

```powershell
# v2.0 APIヘルスチェック
curl https://api.ps-system.jp/api/v2/health

# サイト一覧取得
curl https://api.ps-system.jp/api/v2/sites
```

## 📊 期待される結果

### ヘルスチェック
```json
{
  "success": true,
  "version": "2.0",
  "timestamp": "2025-10-06T...",
  "message": "BESS Site Survey System v2.0 API is running"
}
```

### サイト一覧
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "site_name": "東京第1発電所",
      ...
    }
  ]
}
```

## 🔧 トラブルシューティング

### エラー: Permission denied (publickey)

SSH鍵の問題です。パスワード認証を使用してください：

```powershell
ssh -o PreferredAuthentications=password ubuntu@153.121.61.164
```

### エラー: git pull failed

VPS上で：

```bash
cd /home/ubuntu/bess-site-survey-system
git stash
git pull origin main
```

### エラー: npm install failed

VPS上で：

```bash
cd /home/ubuntu/bess-site-survey-system
rm -rf node_modules package-lock.json
npm install
```

### エラー: PM2 not found

VPS上で：

```bash
npm install -g pm2
```

## 📝 次のステップ

デプロイ成功後：

1. ✅ VPS APIデプロイ完了 ← 今ここ
2. 🔄 フロントエンドをv2.0 APIに接続
3. 🚀 Vercelにフロントエンドをデプロイ
4. 🧪 エンドツーエンドテスト

## 💡 ヒント

- デプロイスクリプトは自動で以下を実行します：
  - 最新コードの取得
  - 依存関係のインストール
  - TypeScriptビルド
  - 環境変数の設定
  - PM2での再起動
  - 動作確認

- 何か問題が発生した場合は、ログを確認してください：
  ```bash
  pm2 logs bess-api --lines 100
  ```

## 🎉 準備完了！

上記の3ステップを実行するだけで、VPSへのデプロイが完了します。
