# ✅ デプロイチェックリスト

## 📦 事前準備

### Supabase情報の取得
- [ ] Supabase Dashboard にログイン
- [ ] Settings → General で Project ID を確認: `kcohexmvbccxixyfvjyw`
- [ ] Settings → API Keys で以下を取得:
  - [ ] Project URL: `https://kcohexmvbccxixyfvjyw.supabase.co`
  - [ ] anon public key をコピー
  - [ ] service_role key をコピー（バックエンド用）
- [ ] Settings → Database で Connection string をコピー

### メモ帳に保存
```
=== Supabase情報 ===
Project URL: https://kcohexmvbccxixyfvjyw.supabase.co
Anon Key: eyJhbGc...
Service Role Key: eyJhbGc...
Database URL: postgresql://postgres:[PASSWORD]@db.kcohexmvbccxixyfvjyw.supabase.co:5432/postgres
```

---

## 🚀 フロントエンド（Vercel）

### GitHubの準備
- [ ] GitHubアカウントにログイン
- [ ] リポジトリが存在するか確認
- [ ] 最新のコードをプッシュ

### Vercelデプロイ
- [ ] https://vercel.com にアクセス
- [ ] GitHubでログイン
- [ ] 「Add New...」→「Project」をクリック
- [ ] `bess-site-survey-system` リポジトリを選択
- [ ] 「Import」をクリック

### プロジェクト設定
- [ ] Framework Preset: **Vite** を選択
- [ ] Root Directory: `frontend` を指定
- [ ] Build Command: `npm run build` （自動設定）
- [ ] Output Directory: `dist` （自動設定）

### 環境変数の設定
- [ ] `VITE_SUPABASE_URL` = `https://kcohexmvbccxixyfvjyw.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = [取得したanon publicキー]

### デプロイ実行
- [ ] 「Deploy」ボタンをクリック
- [ ] ビルド完了を待機（2-3分）
- [ ] デプロイURLを確認: `https://your-project.vercel.app`

---

## 🔧 Supabase設定の更新

### 認証設定
- [ ] Supabase Dashboard → Settings → Authentication
- [ ] URL Configuration セクション
- [ ] Site URL に Vercel URL を追加
- [ ] Redirect URLs に以下を追加:
  ```
  https://your-project.vercel.app
  https://your-project.vercel.app/**
  ```

### データベース設定
- [ ] SQL Editor でマイグレーションを実行
- [ ] テーブルが正しく作成されているか確認

---

## 🧪 動作確認

### フロントエンド
- [ ] Vercel URLにアクセス
- [ ] ログインページが表示される
- [ ] ブラウザのコンソールにエラーがない

### 認証機能
- [ ] ユーザー登録ができる
- [ ] ログインができる
- [ ] ログアウトができる

### データ取得
- [ ] ダッシュボードが表示される
- [ ] データが正しく表示される

---

## 📱 オプション設定

### カスタムドメイン（任意）
- [ ] Vercel Dashboard → Settings → Domains
- [ ] ドメインを追加
- [ ] DNS設定を更新

### パフォーマンス最適化
- [ ] Vercel Analytics を有効化
- [ ] Speed Insights を確認

---

## 🔄 継続的デプロイの確認

### 自動デプロイテスト
- [ ] コードを変更
- [ ] GitHubにプッシュ
- [ ] Vercelが自動的にデプロイ
- [ ] 変更が反映されているか確認

---

## 🐛 トラブルシューティング

### ビルドエラー
- [ ] Vercel Dashboard → Deployments → ビルドログを確認
- [ ] package.json の依存関係を確認
- [ ] ローカルで `npm run build` を実行して確認

### 接続エラー
- [ ] 環境変数が正しく設定されているか確認
- [ ] Supabaseの URL が許可されているか確認
- [ ] ブラウザのコンソールでエラーを確認

### 認証エラー
- [ ] Supabase の Redirect URLs が正しいか確認
- [ ] anon key が正しいか確認

---

## ✨ 完了

すべてのチェックが完了したら、デプロイ成功です！

デプロイURL: `https://your-project.vercel.app`

---

## 📝 次のステップ

1. チームメンバーにURLを共有
2. ユーザーフィードバックを収集
3. 機能追加・改善を実施
4. GitHubにプッシュして自動デプロイ
