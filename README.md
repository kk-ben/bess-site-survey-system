# BESS用地調査システム

系統用蓄電池（BESS）の設置候補地を効率的に評価・選定するWebベースの地理情報システム

## 機能概要

- 候補地の一括登録（CSVアップロード）
- 4条件による自動評価
  - 電力系統への接続性
  - 近隣施設からの離隔距離
  - 道路アクセス性
  - 高圧電柱との近接性
- 地図上での可視化（Google Maps）
- スクリーニング・エクスポート機能
- モバイル対応（現地調査支援）

## 技術スタック

### バックエンド
- Node.js 20+
- TypeScript
- Express.js
- PostgreSQL + PostGIS
- Redis

### フロントエンド
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Google Maps API

## セットアップ

### 前提条件
- Node.js 20以上
- Docker & Docker Compose
- Google Maps APIキー

### インストール

1. リポジトリをクローン
```bash
git clone <repository-url>
cd bess-site-survey-system
```

2. 環境変数を設定
```bash
cp .env.example .env
# .envファイルを編集してAPIキーなどを設定
```

3. Dockerコンテナを起動
```bash
npm run docker:up
```

4. 依存関係をインストール
```bash
npm install
```

5. データベースマイグレーション
```bash
npm run migrate
```

6. 開発サーバーを起動
```bash
npm run dev
```

アプリケーションは以下のURLでアクセス可能：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:4000

## 開発

### ディレクトリ構造
```
bess-site-survey-system/
├── src/                    # バックエンドソースコード
│   ├── controllers/        # APIコントローラー
│   ├── services/          # ビジネスロジック
│   ├── repositories/      # データアクセス層
│   ├── models/            # データモデル
│   ├── middleware/        # Expressミドルウェア
│   ├── utils/             # ユーティリティ関数
│   └── index.ts           # エントリーポイント
├── frontend/              # フロントエンドソースコード
├── database/              # データベースマイグレーション
├── docker-compose.yml     # Docker設定
└── package.json
```

### スクリプト
- `npm run dev` - 開発サーバー起動（フロント+バック）
- `npm run build` - プロダクションビルド
- `npm test` - テスト実行
- `npm run lint` - コード品質チェック
- `npm run migrate` - データベースマイグレーション

## ライセンス

MIT
