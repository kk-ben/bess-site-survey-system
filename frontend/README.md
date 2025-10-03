# BESS用地調査システム - フロントエンド

React + TypeScript + Viteで構築されたBESS用地調査システムのフロントエンドアプリケーション

## 技術スタック

- **React 18** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - ユーティリティファーストCSS
- **React Router** - ルーティング
- **Zustand** - 状態管理
- **React Query** - サーバー状態管理
- **Axios** - HTTPクライアント
- **Lucide React** - アイコン
- **React Hot Toast** - 通知

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

`.env.example`をコピーして`.env`を作成：

```bash
copy .env.example .env
```

`.env`ファイルを編集：

```env
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## ビルド

```bash
npm run build
```

ビルドされたファイルは`dist/`ディレクトリに出力されます。

## テスト

```bash
npm test
```

## プロジェクト構造

```
src/
├── components/          # 再利用可能なコンポーネント
│   ├── common/         # 共通コンポーネント（Button, Modal等）
│   ├── layout/         # レイアウトコンポーネント
│   ├── auth/           # 認証関連コンポーネント
│   ├── sites/          # 候補地管理コンポーネント
│   └── screening/      # スクリーニングコンポーネント
├── pages/              # ページコンポーネント
├── stores/             # Zustand状態管理
├── services/           # APIサービス
├── types/              # TypeScript型定義
├── lib/                # ユーティリティ
└── App.tsx             # ルートコンポーネント
```

## 主な機能

### 認証
- ログイン/ログアウト
- 保護されたルート
- ロールベースアクセス制御

### 候補地管理
- 候補地の一覧表示
- 候補地の登録・編集・削除
- 検索・フィルタリング

### スクリーニング
- 複数条件でのフィルタリング
- 評価結果の表示
- CSV/GeoJSONエクスポート

### 地図表示（実装予定）
- Google Maps統合
- レイヤー表示切替
- 候補地マーカー表示

## デモアカウント

```
Email: admin@example.com
Password: admin123
```

## ライセンス

MIT
