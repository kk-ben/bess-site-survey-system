# セットアップチェックリスト

## 📋 デプロイ前の確認事項

### ✅ 1. Docker Desktop

- [ ] Docker Desktopがインストールされている
- [ ] Docker Desktopが起動している
- [ ] WSL2が有効になっている（Windows）

**確認方法:**
```powershell
docker --version
docker ps
```

### ✅ 2. Node.js

- [ ] Node.js 18以上がインストールされている
- [ ] npmが利用可能

**確認方法:**
```powershell
node --version
npm --version
```

### ✅ 3. 環境変数ファイル

- [ ] `.env`ファイルが存在する
- [ ] `frontend/.env`ファイルが存在する
- [ ] 必要な値が設定されている

**必須の環境変数:**

`.env`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bess_survey
DB_USER=bess_user
DB_PASSWORD=bess_password
JWT_SECRET=your-secret-key-here
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=4000
NODE_ENV=development
```

`frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### ✅ 4. ポートの空き状況

以下のポートが使用可能であることを確認：

- [ ] 4000 - バックエンドAPI
- [ ] 5173 - フロントエンド
- [ ] 5432 - PostgreSQL
- [ ] 6379 - Redis

**確認方法:**
```powershell
netstat -ano | findstr :4000
netstat -ano | findstr :5173
netstat -ano | findstr :5432
netstat -ano | findstr :6379
```

---

## 🚀 デプロイ手順

### 手順1: Docker Desktopを起動

1. Docker Desktopアプリケーションを起動
2. 完全に起動するまで待つ（タスクバーのアイコンが緑色になる）

### 手順2: 環境変数の設定

```powershell
# .envファイルをコピー
copy .env.example .env
copy frontend\.env.example frontend\.env

# エディタで編集
notepad .env
notepad frontend\.env
```

### 手順3: 依存関係のインストール

```powershell
# バックエンド
npm install

# フロントエンド
cd frontend
npm install
cd ..
```

### 手順4: Dockerコンテナの起動

```powershell
docker-compose up -d
```

**起動するコンテナ:**
- `bess-postgres` - PostgreSQL + PostGIS
- `bess-redis` - Redis

### 手順5: データベースのセットアップ

```powershell
# データベースの準備を待つ（30秒程度）
timeout /t 30

# マイグレーション実行
npm run migrate
```

### 手順6: アプリケーションの起動

**ターミナル1（バックエンド）:**
```powershell
npm run dev
```

**ターミナル2（フロントエンド）:**
```powershell
cd frontend
npm run dev
```

### 手順7: ブラウザでアクセス

http://localhost:5173

**初期ログイン:**
- Email: `admin@example.com`
- Password: `admin123`

---

## 🔍 動作確認

### 1. ログイン

- [ ] ログイン画面が表示される
- [ ] 初期ユーザーでログインできる
- [ ] ダッシュボードが表示される

### 2. 候補地管理

- [ ] 候補地一覧が表示される
- [ ] 新規候補地を登録できる
- [ ] CSVインポートができる

### 3. 評価機能

- [ ] 候補地の評価を実行できる
- [ ] 評価結果が表示される
- [ ] スコアが計算される

### 4. スクリーニング

- [ ] フィルタ条件を設定できる
- [ ] 検索結果が表示される
- [ ] エクスポートができる

### 5. 地図表示

- [ ] Google Mapsが表示される
- [ ] 候補地マーカーが表示される
- [ ] レイヤー切替ができる

### 6. モバイル対応

- [ ] モバイルビューで表示される
- [ ] ボトムナビゲーションが表示される
- [ ] タッチ操作ができる

---

## 🐛 トラブルシューティング

### Docker Desktopが起動しない

**Windows:**
1. タスクマネージャーでDockerプロセスを確認
2. WSL2が有効か確認: `wsl --status`
3. Docker Desktopを再インストール

### ポートが使用中

```powershell
# 使用中のプロセスを確認
netstat -ano | findstr :4000

# プロセスを終了（管理者権限）
taskkill /PID <プロセスID> /F
```

### データベース接続エラー

```powershell
# コンテナの状態を確認
docker-compose ps

# PostgreSQLコンテナに接続
docker exec -it bess-postgres psql -U bess_user -d bess_survey

# コンテナを再起動
docker-compose restart postgres
```

### npm install エラー

```powershell
# キャッシュをクリア
npm cache clean --force

# 再インストール
rmdir /s /q node_modules
npm install
```

### Google Maps が表示されない

1. APIキーが正しく設定されているか確認
2. Google Cloud ConsoleでMaps JavaScript APIが有効か確認
3. ブラウザのコンソールでエラーを確認

---

## 📦 本番環境へのデプロイ

本番環境へのデプロイについては、[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)を参照してください。

---

## 🆘 サポート

問題が解決しない場合：

1. ログを確認: `docker-compose logs -f`
2. GitHub Issuesで検索
3. チームに連絡

---

**作成日**: 2025-01-15  
**バージョン**: 1.0
