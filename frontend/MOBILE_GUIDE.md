# モバイル対応ガイド

## 概要

BESS用地調査システムは、モバイルデバイス（スマートフォン・タブレット）での使用に最適化されています。

## 主な機能

### 1. レスポンシブデザイン

すべてのページがモバイルデバイスに対応しています：

- **ブレークポイント**:
  - `sm`: 640px以上
  - `md`: 768px以上
  - `lg`: 1024px以上
  - `xl`: 1280px以上

### 2. モバイルナビゲーション

#### ハンバーガーメニュー
- 画面右上のメニューアイコンをタップ
- サイドメニューが表示される
- 各ページへのナビゲーション
- ログアウト機能

#### ボトムナビゲーション
- 画面下部に固定表示
- 主要な4つのページへクイックアクセス：
  - ダッシュボード
  - 候補地管理
  - スクリーニング
  - ユーザー管理（管理者のみ）

### 3. Googleマップナビゲーション

候補地の詳細ページから、Googleマップでナビゲーションを開始できます：

```typescript
import { openGoogleMapsNavigation } from '@/utils/navigation';

// ナビゲーションを開始
openGoogleMapsNavigation({
  latitude: 35.6812,
  longitude: 139.7671,
  name: 'サイト名',
});
```

#### 機能：
- **ナビゲーション**: 現在地から目的地までのルート案内
- **地図表示**: 目的地を地図上に表示
- **距離計算**: 現在地からの距離を自動計算
- **共有**: URLを共有（Web Share API対応）

### 4. 位置情報機能

#### 現在地の取得

```typescript
import { getCurrentPosition } from '@/utils/navigation';

try {
  const position = await getCurrentPosition();
  console.log(position.coords.latitude, position.coords.longitude);
} catch (error) {
  console.error('位置情報の取得に失敗しました');
}
```

#### 距離の計算

```typescript
import { calculateDistance, formatDistance } from '@/utils/navigation';

const distance = calculateDistance(
  { latitude: 35.6812, longitude: 139.7671 },
  { latitude: 35.6895, longitude: 139.6917 }
);

console.log(formatDistance(distance)); // "5.2km"
```

#### 権限の確認

```typescript
import { checkGeolocationPermission } from '@/utils/navigation';

const permission = await checkGeolocationPermission();
// 'granted', 'denied', 'prompt'
```

### 5. モバイル専用コンポーネント

#### MobileSiteDetail

候補地の詳細情報をモバイル向けに最適化して表示：

```tsx
<MobileSiteDetail site={site} evaluation={evaluation} />
```

特徴：
- コンパクトなレイアウト
- タッチ操作に最適化
- アコーディオン形式の詳細表示
- クイックアクションボタン（ナビ、地図、共有）

#### MobileNavigation

モバイル専用のナビゲーションコンポーネント：

```tsx
<MobileNavigation />
```

特徴：
- ハンバーガーメニュー
- ボトムナビゲーション
- スライドインアニメーション

## タッチ操作の最適化

### ボタンサイズ
- 最小タップ領域: 44x44px
- 適切な余白を確保

### スワイプジェスチャー
- メニューの開閉
- リストのスクロール

### ピンチズーム
- 地図表示で利用可能

## パフォーマンス最適化

### 画像の最適化
- レスポンシブ画像の使用
- 遅延読み込み（Lazy Loading）

### データの最適化
- ページネーション
- 無限スクロール
- キャッシング

## ブラウザ対応

### 推奨ブラウザ
- **iOS**: Safari 14以降
- **Android**: Chrome 90以降

### 必要な機能
- Geolocation API
- Web Share API（オプション）
- Service Worker（PWA対応時）

## トラブルシューティング

### 位置情報が取得できない

1. ブラウザの位置情報権限を確認
2. HTTPSで接続されているか確認
3. デバイスの位置情報サービスが有効か確認

### Googleマップが開かない

1. Googleマップアプリがインストールされているか確認
2. ブラウザのポップアップブロックを確認
3. URLスキームが正しいか確認

### レイアウトが崩れる

1. ブラウザのキャッシュをクリア
2. ビューポート設定を確認
3. CSSのブレークポイントを確認

## 開発時の注意点

### デバイスエミュレーション

Chrome DevToolsでモバイルデバイスをエミュレート：

1. F12でDevToolsを開く
2. デバイスツールバーを表示（Ctrl+Shift+M）
3. デバイスを選択（iPhone、Android等）

### レスポンシブテスト

複数の画面サイズでテスト：
- 320px（小型スマートフォン）
- 375px（iPhone SE）
- 414px（iPhone Plus）
- 768px（タブレット）
- 1024px（デスクトップ）

### タッチイベントのテスト

実機でのテストを推奨：
- タップ
- スワイプ
- ピンチズーム
- 長押し

## PWA対応（将来の拡張）

Progressive Web Appとして拡張可能：

- オフライン対応
- ホーム画面への追加
- プッシュ通知
- バックグラウンド同期

## 参考リンク

- [Tailwind CSS レスポンシブデザイン](https://tailwindcss.com/docs/responsive-design)
- [Geolocation API](https://developer.mozilla.org/ja/docs/Web/API/Geolocation_API)
- [Web Share API](https://developer.mozilla.org/ja/docs/Web/API/Web_Share_API)
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)
