# BESS用地調査システム - クイックスタートガイド

## 🚀 5分で始める

### 前提条件

以下がインストールされていることを確認してください：

- [Docker Desktop](https://www.docker.com/products/docker-desktop) - 起動しておいてください
- [Node.js 18以上](https://nodejs.org/)
- [Git](https://git-scm.com/)

### ステップ1: 環境変数の設定

```powershell
# プロジェクトディレクトリに移動
cd bess-site-survey-system

# 環境変数ファイルをコピー
copy .env.example .env
copy frontend\.env.example frontend\.env
```

`.env`ファイルを編集（最低限の設定）:
```env
# データベース
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bess_survey
DB_USER=bess_user
DB_PASSWORD=bess_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# サーバー
PORT=4000
NODE_ENV=development
```

`frontend/.env`ファイルを編集:
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### ステップ2: Dockerコンテナの起動

```powershell
# Docker Desktopが起動していることを確認

# PostgreSQL + Redis を起動
docker-compose up -d
```

### ステップ3: 依存関係のインストール

```powershell
# バックエンド
npm install

# フロントエンド
cd frontend
npm install
cd ..
```

### ステップ4: データベースのセットアップ

```powershell
# マイグレーション実行
npm run migrate

# 初期データ投入（オプション）
npm run seed
```

### ステップ5: アプリケーションの起動

**ターミナル1（バックエンド）:**
```powershell
npm run dev
```

**ターミナル2（フロントエンド）:**
```powershell
cd frontend
npm run dev
```

### ステップ6: ブラウザでアクセス

http://localhost:5173 を開く

**初期ログイン情報:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 📝 よくある問題

### Docker Desktopが起動しない

1. Docker Desktopを再起動
2. WSL2が有効になっているか確認（Windows）
3. システムを再起動

### ポートが既に使用されている

```powershell
# 使用中のポートを確認
netstat -ano | findstr :4000
netstat -ano | findstr :5173
netstat -ano | findstr :5432

# プロセスを終了（管理者権限）
taskkill /PID <プロセスID> /F
```

### データベース接続エラー

```powershell
# コンテナの状態を確認
docker-compose ps

# ログを確認
docker-compose logs postgres

# コンテナを再起動
docker-compose restart postgres
```

### npm install エラー

```powershell
# キャッシュをクリア
npm cache clean --force

# node_modulesを削除して再インストール
rmdir /s /q node_modules
npm install
```

---

## 🛠️ 便利なコマンド

### Docker操作

```powershell
# コンテナの起動
docker-compose up -d

# コンテナの停止
docker-compose down

# ログの確認
docker-compose logs -f

# 特定のサービスのログ
docker-compose logs -f postgres
docker-compose logs -f redis

# コンテナの再起動
docker-compose restart

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

# マイグレーションのロールバック
npm run migrate:rollback

# 初期データの投入
npm run seed
```

### 開発

```powershell
# バックエンド開発サーバー（ホットリロード）
npm run dev

# フロントエンド開発サーバー
cd frontend
npm run dev

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

## 📊 アクセスURL

| サービス | URL | 説明 |
|---------|-----|------|
| フロントエンド | http://localhost:5173 | Reactアプリケーション |
| バックエンドAPI | http://localhost:4000 | Express APIサーバー |
| API ドキュメント | http://localhost:4000/api-docs | Swagger UI（予定） |
| PostgreSQL | localhost:5432 | データベース |
| Redis | localhost:6379 | キャッシュ |

---

## 🎯 次のステップ

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

- [デプロイメントガイド](./DEPLOYMENT_GUIDE.md)
- [Google Mapsセットアップ](./frontend/MAP_SETUP.md)
- [モバイル対応ガイド](./frontend/MOBILE_GUIDE.md)
- [MVP完成サマリー](./MVP_COMPLETION_SUMMARY.md)

---

## 🆘 サポート

問題が発生した場合：

1. [GitHub Issues](https://github.com/your-repo/issues)で検索
2. ログを確認: `docker-compose logs -f`
3. 環境変数を確認: `.env`ファイル
4. Dockerを再起動: `docker-compose restart`

---

**Happy Surveying! 🗺️⚡**
