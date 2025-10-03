# Google Maps統合セットアップガイド

## 概要

BESS用地調査システムでは、Google Maps APIを使用して候補地の位置情報を地図上に表示します。

## 必要な設定

### 1. Google Maps APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. 「APIとサービス」→「ライブラリ」に移動
4. 以下のAPIを有効化：
   - Maps JavaScript API
   - Places API
   - Geocoding API

5. 「APIとサービス」→「認証情報」に移動
6. 「認証情報を作成」→「APIキー」を選択
7. 作成されたAPIキーをコピー

### 2. APIキーの制限設定（推奨）

セキュリティのため、APIキーに制限を設定することを推奨します：

1. 作成したAPIキーの編集画面を開く
2. 「アプリケーションの制限」で「HTTPリファラー」を選択
3. 許可するドメインを追加：
   ```
   localhost:5173/*
   yourdomain.com/*
   ```
4. 「API の制限」で「キーを制限」を選択
5. 以下のAPIのみを許可：
   - Maps JavaScript API
   - Places API
   - Geocoding API

### 3. 環境変数の設定

プロジェクトルートに`.env`ファイルを作成し、APIキーを設定：

```bash
# .envファイル
VITE_API_BASE_URL=http://localhost:4000/api/v1
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

`.env.example`をコピーして使用することもできます：

```bash
cp .env.example .env
```

その後、`.env`ファイルを編集してAPIキーを設定してください。

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 実装されている機能

### MapContainer

候補地を地図上に表示するメインコンポーネント

- 候補地マーカー表示
- ステータスに応じた色分け
- クリックで詳細パネル表示

### LayerControl

地図上に表示するレイヤーを切り替えるコントロール

- 候補地
- 電力設備
- 空き容量エリア
- 近隣施設バッファ
- 電柱

### CapacityLegend

空き容量の凡例を表示

- 容量レベルごとの色分け
- 容量範囲の説明

### DetailPanel

選択した候補地の詳細情報を表示

- 基本情報
- 評価スコア
- ナビゲーション機能
- 詳細ページへのリンク

## 使用例

```tsx
import { MapContainer } from '@/components/map/MapContainer';

function MyPage() {
  const sites = [
    {
      siteId: '1',
      siteName: 'サイトA',
      latitude: 35.6812,
      longitude: 139.7671,
      status: 'evaluated',
      overallScore: 85,
    },
  ];

  return (
    <div className="h-screen">
      <MapContainer
        sites={sites}
        onSiteClick={(site) => console.log('Clicked:', site)}
      />
    </div>
  );
}
```

## トラブルシューティング

### 地図が表示されない

1. APIキーが正しく設定されているか確認
2. Google Cloud Consoleで必要なAPIが有効化されているか確認
3. ブラウザのコンソールでエラーメッセージを確認

### APIキーのエラー

```
Google Maps JavaScript API error: InvalidKeyMapError
```

- APIキーが無効または期限切れ
- APIキーの制限設定を確認
- 請求先アカウントが設定されているか確認

### CORS エラー

- APIキーの「HTTPリファラー」制限を確認
- 開発環境のURLが許可リストに含まれているか確認

## 料金について

Google Maps APIは従量課金制です：

- 月額$200の無料クレジットあり
- Maps JavaScript API: 1,000リクエストあたり$7
- 詳細: https://cloud.google.com/maps-platform/pricing

開発・テスト環境では無料枠内で十分使用できます。

## 参考リンク

- [Google Maps JavaScript API ドキュメント](https://developers.google.com/maps/documentation/javascript)
- [Google Cloud Console](https://console.cloud.google.com/)
- [@googlemaps/js-api-loader](https://www.npmjs.com/package/@googlemaps/js-api-loader)
