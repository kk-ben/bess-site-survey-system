# 🚀 BESS用地調査システム - 今すぐデプロイ！

## ステップ1: Docker Desktopを起動

**重要**: デプロイを開始する前に、Docker Desktopを起動してください。

1. Windowsの検索バーで「Docker Desktop」を検索
2. Docker Desktopを起動
3. Docker Desktopが完全に起動するまで待つ（タスクバーのアイコンが緑色になる）

## ステップ2: デプロイスクリプトを実行

PowerShellで以下のコマンドを実行：

```powershell
cd bess-site-survey-system
.\scripts\deploy-local.ps1
```

## ステップ3: 環境変数を設定（オプション）

デプロイスクリプトが完了したら、必要に応じて環境変数を編集：

### バックエンド (.env)
```env
# データベース（デフォルトのままでOK）
DATABASE_URL=postgresql://bess_user:bess_password@localhost:5432/bess_survey

# JWT Secret（本番環境では必ず変更）
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Redis（デフォルトのままでOK）
REDIS_URL=redis://:redis_password@localhost:6379
```

### フロントエンド (frontend/.env)
```env
# API URL（デフォルトのままでOK）
VITE_API_BASE_URL=http://localhost:4000/api/v1

# Google Maps APIキー（地図機能を使う場合は設定）
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## ステップ4: アプリケーションを起動

### ターミナル1（バックエンド）
```powershell
cd bess-site-survey-system
npm run dev
```

### ターミナル2（フロントエンド）
```powershell
cd bess-site-survey-system/frontend
npm run dev
```

## ステップ5: ブラウザでアクセス

http://localhost:5173 を開く

### 初期ログイン情報
- Email: `admin@example.com`
- Password: `admin123`

---

## 📊 アクセスURL一覧

| サービス | URL | 説明 |
|---------|-----|------|
| フロントエンド | http://localhost:5173 | Reactアプリケーション |
| バックエンドAPI | http://localhost:4000 | Express APIサーバー |
| PostgreSQL | localhost:5432 | データベース |
| Redis | localhost:6379 | キャッシュ |

---

## 🛠️ よくある問題と解決方法

### 問題1: Docker Desktopが起動しない

**解決方法:**
1. Docker Desktopを再起動
2. WSL2が有効になっているか確認（Windows）
3. システムを再起動

### 問題2: ポートが既に使用されている

**確認方法:**
```powershell
netstat -ano | findstr :4000
netstat -ano | findstr :5173
netstat -ano | findstr :5432
```

**解決方法:**
```powershell
# プロセスを終了（管理者権限で実行）
taskkill /PID <プロセスID> /F
```

### 問題3: データベース接続エラー

**確認方法:**
```powershell
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs postgres
```

**解決方法:**
```powershell
# コンテナを再起動
docker-compose restart postgres
```

### 問題4: npm install エラー

**解決方法:**
```powershell
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🔄 システムの停止と再起動

### 停止
```powershell
# Dockerコンテナを停止
docker-compose down

# アプリケーションを停止（Ctrl+C）
```

### 再起動
```powershell
# Dockerコンテナを起動
docker-compose up -d

# バックエンドを起動
npm run dev

# フロントエンドを起動（別のターミナル）
cd frontend
npm run dev
```

---

## 📝 便利なコマンド

### Docker操作
```powershell
# コンテナの状態確認
docker-compose ps

# ログの確認
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f postgres
docker-compose logs -f redis

# すべてのデータを削除して再起動
docker-compose down -v
docker-compose up -d
```

### データベース操作
```powershell
# PostgreSQLに接続
docker exec -it bess-postgres psql -U bess_user -d bess_survey

# マイグレーションの実行
npm run migrate

# 初期データの投入
npm run seed
```

### 開発
```powershell
# テストの実行
npm test

# リントチェック
npm run lint

# ビルド
npm run build
cd frontend
npm run build
```

---

## 🎯 次のステップ

デプロイが完了したら：

1. **候補地の登録**
   - サイドバーから「候補地管理」を選択
   - 「新規登録」または「CSVインポート」

2. **評価の実行**
   - 候補地詳細ページで「評価実行」ボタンをクリック
   - 自動的に4つの基準で評価

3. **スクリーニング**
   - サイドバーから「スクリーニング」を選択
   - 条件を設定して絞り込み

4. **エクスポート**
   - スクリーニング結果をCSV/GeoJSON/PDFで出力

---

## 📚 詳細ドキュメント

- [クイックスタートガイド](./QUICK_START.md)
- [デプロイメントガイド](./DEPLOYMENT_GUIDE.md)
- [Google Mapsセットアップ](./frontend/MAP_SETUP.md)
- [モバイル対応ガイド](./frontend/MOBILE_GUIDE.md)

---

## 🆘 サポート

問題が発生した場合：

1. このドキュメントの「よくある問題と解決方法」を確認
2. ログを確認: `docker-compose logs -f`
3. 環境変数を確認: `.env`ファイル
4. Dockerを再起動: `docker-compose restart`

---

**Happy Surveying! 🗺️⚡**
