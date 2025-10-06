# Vercel 環境変数 手動設定ガイド

## 🔍 現在の状況

Vercel APIトークンは取得できましたが、プロジェクトIDの取得にはチームIDが必要な可能性があります。

**取得済み:**
- ✅ APIトークン: `vck_2iKWpNXhHnxmPwuppODTnEgFHBi5qvwl9kjRPZAw2DmsltBzov3VxdHv`

**必要な情報:**
- ⚠️ プロジェクトID
- ⚠️ チームID（オプション）

## 📋 手動設定（最速・推奨）

### 方法1: Vercelダッシュボードで直接設定（1分）

1. **Vercelダッシュボードにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択**
   - `bess-site-survey-system` をクリック

3. **Settings → Environment Variables**

4. **以下の3つの環境変数を追加**

#### 変数1: VITE_API_BASE_URL
```
Name: VITE_API_BASE_URL
Value: http://153.121.61.164:3000/api/v2
Environment: Production, Preview, Development (すべてチェック)
```

#### 変数2: VITE_SUPABASE_URL
```
Name: VITE_SUPABASE_URL
Value: https://kcohexmvbccxixyfvjyw.supabase.co
Environment: Production, Preview, Development (すべてチェック)
```

#### 変数3: VITE_SUPABASE_ANON_KEY
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
Environment: Production, Preview, Development (すべてチェック)
```

5. **Save**をクリック

6. **自動再デプロイ開始**（約2-3分）

---

## 🔧 方法2: プロジェクトIDを取得してAPI経由で設定

### ステップ1: プロジェクトIDを取得

1. **Vercelダッシュボード**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択** → **Settings** → **General**

3. **Project ID**をコピー
   - 例: `prj_abc123xyz`

### ステップ2: PROJECT_CREDENTIALS.mdに追加

```markdown
### Vercel
- **Project ID**: prj_abc123xyz  ← ここに追加
```

### ステップ3: 自動設定スクリプトを実行

```powershell
cd bess-site-survey-system
.\scripts\vercel-set-env-auto.ps1
```

---

## 📊 設定確認方法

### 環境変数が正しく設定されているか確認

1. **Vercelダッシュボード**
   - Settings → Environment Variables
   - 3つの変数が表示されているか確認

2. **デプロイ後の動作確認**
   ```
   https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login
   ```
   - ログイン: `admin@example.com` / `admin123`
   - サイト一覧が表示されればOK

3. **ブラウザ開発者ツールで確認**
   - F12 → Network タブ
   - API呼び出しが `http://153.121.61.164:3000/api/v2/sites` になっているか確認

---

## ⚡ クイックコピペ用

### 環境変数の値（コピペ用）

```
VITE_API_BASE_URL
http://153.121.61.164:3000/api/v2
```

```
VITE_SUPABASE_URL
https://kcohexmvbccxixyfvjyw.supabase.co
```

```
VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
```

---

## 🎯 推奨アクション

**今すぐ実行:**
1. Vercelダッシュボードで手動設定（方法1）← **最速**
2. 約2-3分待つ（自動再デプロイ）
3. ログインして動作確認

**所要時間:** 約5分

---

**最終更新**: 2025年10月6日 21:20
