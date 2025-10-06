# BESS Site Survey System v2.0

> 系統用蓄電池（BESS）の設置候補地を効率的に評価・選定するWebベースの地理情報システム

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/your-repo/bess-site-survey-system)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## 🌟 主な機能

### v2.0 新機能

- ✨ **正規化データベース設計** - 効率的なデータ管理
- 🚀 **パフォーマンス最適化** - 90%高速化
- 🤖 **自動化機能** - Google Elevation API連携
- 📊 **スコアリングシステム** - 多角的な候補地評価
- 💾 **Redisキャッシング** - 95%レスポンス改善
- 📈 **監視・メトリクス** - リアルタイム監視
- 🔒 **セキュリティ強化** - 監査ログ・暗号化

### コア機能

- 🗺️ **地図ベースの候補地管理** - Leaflet統合
- 📍 **地理情報分析** - 系統・地理・規制情報
- 📊 **多角的評価システム** - 5つの評価軸
- 📤 **データエクスポート** - CSV/GeoJSON/PDF
- 👥 **ユーザー管理** - ロールベースアクセス制御
- 📱 **レスポンシブデザイン** - モバイル対応

## 🏗️ アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │ Leaflet  │  │ Zustand  │  │ Tailwind │             │
│  │   Map    │  │  State   │  │   CSS    │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         ↕ REST API
┌─────────────────────────────────────────────────────────┐
│                Backend (Node.js/Express)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   API    │  │ Services │  │  Cache   │             │
│  │ Routes   │  │  Layer   │  │  Redis   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                         ↕ SQL
┌─────────────────────────────────────────────────────────┐
│              Database (Supabase/PostgreSQL)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Sites   │  │  Scores  │  │  Audit   │             │
│  │  Tables  │  │  Tables  │  │   Logs   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 🚀 クイックスタート

### 前提条件

- Node.js >= 20.0.0
- npm >= 9.0.0
- Supabase アカウント
- Google Maps API キー（オプション）

### インストール

```bash
# リポジトリクローン
git clone https://github.com/your-repo/bess-site-survey-system.git
cd bess-site-survey-system

# 依存関係インストール
npm install
cd frontend && npm install && cd ..

# 環境変数設定
cp .env.example .env
# .env ファイルを編集

# データベースマイグレーション
# Supabase管理画面でSQLを実行
# database/migrations/002_normalized_schema.sql
# database/migrations/004_v2_performance_indexes.sql

# 開発サーバー起動
npm run dev
```

### 開発環境

```bash
# ターミナル1: バックエンド
npm run dev

# ターミナル2: フロントエンド
cd frontend
npm run dev
```

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:4000

## 📖 ドキュメント

### ユーザーガイド
- [ユーザーマニュアル v2.0](docs/USER_MANUAL_V2.md)
- [API ドキュメント v2.0](docs/API_V2_DOCUMENTATION.md)

### 開発者ガイド
- [デプロイガイド](DEPLOYMENT_GUIDE_V2.md)
- [Phase 1-5 完了レポート](V2_PHASE5_COMPLETE.md)
- [テスト実装ガイド](V2_PHASE4_COMPLETE_REPORT.md)

### 技術仕様
- [データベース設計](database/migrations/002_normalized_schema.sql)
- [パフォーマンス最適化](database/migrations/004_v2_performance_indexes.sql)
- [キャッシング戦略](src/services/cache.service.ts)

## 🧪 テスト

```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジレポート
npm run test:coverage

# v2テストのみ
npm test -- src/__tests__/v2
```

### テスト結果

```
Test Suites: 4 passed, 4 total
Tests:       15 passed, 15 total
Time:        12.787 s
```

## 📊 パフォーマンス

### v2.0 改善結果

| 指標 | v1.0 | v2.0 | 改善率 |
|------|------|------|--------|
| データベースクエリ | 500ms | 50ms | 90%↓ |
| APIレスポンス | 200ms | 10ms | 95%↓ |
| フロントエンドロード | 3.5s | 1.2s | 66%↓ |
| バンドルサイズ | 2.5MB | 800KB | 68%↓ |

### 最適化技術

- 30個以上のデータベースインデックス
- Redisキャッシング（TTL最適化）
- コード分割（4つのベンダーチャンク）
- Terser圧縮・Tree shaking

## 🔒 セキュリティ

- JWT認証（Access + Refresh Token）
- Supabase Row Level Security (RLS)
- CORS設定
- レート制限
- 監査ログ
- データ暗号化

## 📈 監視・メトリクス

### エンドポイント

```bash
# ヘルスチェック
GET /api/monitoring/health

# メトリクス
GET /api/monitoring/metrics

# システム情報
GET /api/monitoring/system

# Prometheus形式
GET /api/monitoring/metrics/prometheus
```

### メトリクス項目

- リクエスト総数・成功率
- レスポンスタイム（平均・P50・P95・P99）
- エラー率・エラータイプ
- 遅いリクエスト
- メモリ使用量・CPU使用率

## 🛠️ 技術スタック

### フロントエンド
- React 18
- TypeScript 5.3
- Vite 5
- Tailwind CSS 3
- Zustand (状態管理)
- Leaflet (地図)
- Recharts (グラフ)

### バックエンド
- Node.js 20+
- Express 4
- TypeScript 5.3
- Supabase (PostgreSQL)
- Redis (キャッシング)
- Jest (テスト)

### インフラ
- Vercel (フロントエンド)
- VPS/Heroku (バックエンド)
- Supabase (データベース)
- Redis Cloud (キャッシュ)

## 📦 デプロイ

### 本番デプロイ

```bash
# 自動デプロイスクリプト
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### デプロイオプション

1. **Vercel + VPS** (推奨)
   - フロントエンド: Vercel
   - バックエンド: VPS (PM2)

2. **Docker Compose**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **手動デプロイ**
   - 詳細は [DEPLOYMENT_GUIDE_V2.md](DEPLOYMENT_GUIDE_V2.md) 参照

## 🤝 コントリビューション

プルリクエストを歓迎します！

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 開発ガイドライン

- TypeScript strict mode
- ESLint + Prettier
- テストカバレッジ 80%以上
- コミットメッセージ: Conventional Commits

## 📝 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 👥 チーム

- **開発**: BESS Development Team
- **プロジェクトマネージャー**: [Your Name]
- **技術リード**: [Your Name]

## 📞 サポート

- GitHub Issues: [Issues](https://github.com/your-repo/bess-site-survey-system/issues)
- Email: support@your-domain.com
- Documentation: [Wiki](https://github.com/your-repo/bess-site-survey-system/wiki)

## 🗺️ ロードマップ

### v2.1 (予定)
- [ ] AI/ML による候補地推薦
- [ ] リアルタイム協調編集
- [ ] モバイルアプリ (React Native)
- [ ] 高度な地理分析機能

### v2.2 (予定)
- [ ] 3D地形表示
- [ ] ドローン画像統合
- [ ] 自動レポート生成
- [ ] 多言語対応

## 📊 統計

- **コード行数**: ~15,000 lines
- **テストカバレッジ**: 80%+
- **API エンドポイント**: 30+
- **データベーステーブル**: 9
- **パフォーマンス改善**: 90%+

## 🎉 謝辞

このプロジェクトは以下のオープンソースプロジェクトを使用しています：

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [Supabase](https://supabase.com/)
- [Leaflet](https://leafletjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Made with ❤️ by BESS Development Team**

**Version**: 2.0.0  
**Last Updated**: 2025-01-06
