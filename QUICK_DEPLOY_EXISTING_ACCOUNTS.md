# 🚀 クイックデプロイガイド（既存アカウント使用）

既にSupabaseとVercelのアカウントをお持ちの場合の簡略版デプロイ手順です。

---

## 📋 前提条件

- ✅ Supabaseアカウント（既存）
- ✅ Vercelアカウント（既存）
- ✅ さくらVPS契約済み（ps-system.jp）
- ✅ GitHubリポジトリ（bess-site-survey-system）

---

## 🎯 デプロイ手順（60分）

### ステップ1: Supabaseで新しいプロジェクトを作成（10分）

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. 「New Project」をクリック
3. 以下を入力：
   - **Name**: `bess-site-survey-system`
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)`
   - **Pricing Plan**: Free（無料プラン）
4. 「Create new project」をクリック（約2分待つ）

#### APIキーを取得

プロジェクト作成後：

1. 左サイドバー「Settings」→「API」
2. 以下をコピーしてメモ：
   ```
   Project URL: https://xxxxx.supabase.co
   anon public: eyJhbGc...
   service_role: eyJhbGc...（秘密情報）
   ```

#### データベーススキーマを作成

1. 左サイドバー「SQL Editor」
2. 「New query」をクリック
3. 以下のファイルの内容をコピー＆ペースト：
   - `bess-site-survey-system/database/migrations/001_initial_schema.sql`
4. 「Run」をクリック

✅ Supabaseセットアップ完了！

---

### ステップ2: VPSにバックエンドAPIをデプロイ（30分）

#### 2.1 DNSレコードの設定

さくらVPSのコントロールパネルで：

1. ドメイン管理 → `ps-system.jp`
2. DNSレコードを追加：
   ```
   タイプ: A
   ホスト名: api
   値: 153.121.61.164
   TTL: 3600
   ```
3. 保存

#### 2.2 DNS反映を確認（5-10分待つ）

PowerShellで確認：
```powershell
nslookup api.ps-system.jp
# 153.121.61.164 が返ってくればOK
```

#### 2.3 VPSにSSH接続

```powershell
ssh ubuntu@153.121.61.164
```

パスワードを入力してログイン。

#### 2.4 自動デプロイスクリプトを実行

VPS上で以下を実行：

```bash
# スクリプトをダウンロード
curl -fsSL https://raw.githubusercontent.com/kk-ben/bess-site-survey-system/main/scripts/deploy-vps-api.sh -o deploy.sh

# 実行権限を付与
chmod +x deploy.sh

# 実行
./deploy.sh
```

スクリプトが以下を自動実行します：
- システム更新
- Node.js、PM2、Nginxのインストール
- プロジェクトのクローン
- ビルド
- PM2での起動
- Nginx設定
- SSL証明書取得

**SSL証明書取得の確認が表示されたら `y` を入力**

#### 2.5 環境変数を更新

```bash
nano /home/ubuntu/bess-site-survey-system/.env.production
```

以下を更新（ステップ1で取得したSupabase情報を使用）：

```env
# Supabase設定
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# CORS（後でVercelのURLに更新）
CORS_ORIGIN=*
```

保存: `Ctrl + X` → `Y` → `Enter`

#### 2.6 アプリケーションを再起動

```bash
pm2 restart bess-api
pm2 logs bess-api --lines 50
```

#### 2.7 動作確認

```bash
curl https://api.ps-system.jp/api/v1/health
```

以下のような結果が返ってくればOK：
```json
{"status":"ok","timestamp":"...","uptime":...}
```

✅ VPSバックエンドAPIデプロイ完了！

---

### ステップ3: Vercelでフロントエンドをデプロイ（20分）

#### 3.1 GitHubにプッシュ（まだの場合）

ローカルPCで：

```powershell
cd bess-site-survey-system
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 3.2 Vercelでプロジェクトをインポート

1. [Vercel Dashboard](https://vercel.com/dashboard)にログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリ一覧から `bess-site-survey-system` を探す
4. 「Import」をクリック

#### 3.3 プロジェクト設定

**重要な設定**：

1. **Framework Preset**: `Vite` を選択
2. **Root Directory**: 「Edit」をクリックして `frontend` と入力 ← 重要！
3. **Build Command**: `npm run build`（自動設定）
4. **Output Directory**: `dist`（自動設定）

#### 3.4 環境変数を設定

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `VITE_API_BASE_URL` | `https://api.ps-system.jp/api/v1` |
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` |

**注意**: すべて `VITE_` プレフィックスが必要です！

#### 3.5 デプロイ実行

1. 「Deploy」ボタンをクリック
2. ビルドが完了するまで待つ（2-3分）
3. デプロイ完了後、URLが表示されます

例: `https://bess-site-survey-system.vercel.app`

✅ Vercelフロントエンドデプロイ完了！

---

### ステップ4: CORS設定を更新（5分）

#### 4.1 VPSでCORS設定を更新

VPSにSSH接続（別のターミナルまたは再接続）：

```bash
ssh ubuntu@153.121.61.164
nano /home/ubuntu/bess-site-survey-system/.env.production
```

`CORS_ORIGIN` をVercelのURLに更新：

```env
CORS_ORIGIN=https://bess-site-survey-system.vercel.app
```

保存: `Ctrl + X` → `Y` → `Enter`

#### 4.2 アプリケーションを再起動

```bash
pm2 restart bess-api
pm2 logs bess-api --lines 50
```

✅ CORS設定完了！

---

## ✅ 動作確認

### 1. フロントエンドにアクセス

ブラウザで以下にアクセス：
```
https://bess-site-survey-system.vercel.app
```

### 2. 開発者ツールで確認

1. ブラウザで `F12` を押す
2. 「Console」タブでエラーがないことを確認
3. 「Network」タブでAPIリクエストが成功（200 OK）していることを確認

### 3. テストログイン

初期管理者アカウント：
- **Email**: `admin@example.com`
- **Password**: `admin123`

ログインが成功すれば、デプロイ完了です！

---

## 🎉 デプロイ完了！

### システム構成

```
Frontend: https://bess-site-survey-system.vercel.app
Backend:  https://api.ps-system.jp/api/v1
Database: Supabase (既存アカウント内の新プロジェクト)
```

### 管理URL

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com
- **GitHub Repository**: https://github.com/kk-ben/bess-site-survey-system

---

## 🔧 よくある問題と解決策

### CORSエラーが出る

**症状**: ブラウザコンソールに「CORS policy」エラー

**解決策**:
```bash
# VPSで確認
ssh ubuntu@153.121.61.164
grep CORS_ORIGIN /home/ubuntu/bess-site-survey-system/.env.production

# Vercelのドメインと一致しているか確認
# 一致していない場合は更新
nano /home/ubuntu/bess-site-survey-system/.env.production
pm2 restart bess-api
```

### Vercelビルドエラー

**症状**: Vercelでビルドが失敗

**解決策**:
1. Vercel: Settings → General
2. Root Directory が `frontend` になっているか確認
3. 環境変数がすべて `VITE_` プレフィックス付きか確認
4. Deployments → Redeploy

### APIに接続できない

**症状**: フロントエンドからAPIにアクセスできない

**解決策**:
```bash
# APIが起動しているか確認
curl https://api.ps-system.jp/api/v1/health

# 起動していない場合
ssh ubuntu@153.121.61.164
pm2 restart bess-api
pm2 logs bess-api
```

---

## 📞 次のステップ

デプロイが完了したら：

1. ✅ 初期管理者パスワードを変更
2. ✅ 実際のデータをインポート
3. ✅ ユーザーを追加
4. ✅ 監視設定（UptimeRobot等）

**おめでとうございます！システムが本番環境で稼働中です！** 🎊
