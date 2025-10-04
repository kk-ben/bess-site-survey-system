# 🔧 Vercel + Supabase 統合修正ガイド

## 現在の問題

- フロントエンド: Vercelにデプロイ済み ✅
- バックエンド: ローカル（localhost:4000）❌
- エラー: フロントエンドがローカルバックエンドに接続できない

## 解決策

カスタムバックエンドを削除し、Supabase Authを直接使用します。

---

## ステップ1: Supabase Auth設定の確認

### 1.1 Supabaseダッシュボードにアクセス
```
https://supabase.com/dashboard
```

### 1.2 Authentication設定
1. プロジェクト選択: `kcohexmvbccxixyfvjyw`
2. **Authentication** → **Providers** → **Email** を有効化
3. **Authentication** → **URL Configuration**:
   - Site URL: `https://bess-site-survey-system.vercel.app`
   - Redirect URLs に追加:
     ```
     https://bess-site-survey-system.vercel.app/**
     https://bess-site-survey-system.vercel.app/auth/callback
     ```

---

## ステップ2: Vercel環境変数の設定

Vercel Dashboard → Settings → Environment Variables

### 必要な環境変数

| Name | Value | 説明 |
|------|-------|------|
| `VITE_SUPABASE_URL` | `https://kcohexmvbccxixyfvjyw.supabase.co` | Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | `[Supabaseから取得]` | 匿名キー |

### Supabase Anon Keyの取得方法

1. Supabase Dashboard → **Settings** → **API**
2. **Project API keys** セクション
3. **anon public** キーをコピー

---

## ステップ3: フロントエンドコードの修正

### 3.1 Supabaseクライアントの作成

`frontend/src/lib/supabase.ts` を作成:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3.2 認証サービスの修正

`frontend/src/services/auth.service.ts` を修正:

```typescript
import { supabase } from '../lib/supabase';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
```

---

## ステップ4: 依存関係の追加

`frontend/package.json` に追加:

```bash
cd bess-site-survey-system/frontend
npm install @supabase/supabase-js
```

---

## ステップ5: GitHubにプッシュ

```bash
cd bess-site-survey-system
git add .
git commit -m "Fix: Supabase Auth直接統合"
git push origin main
```

Vercelが自動的に再デプロイします。

---

## ステップ6: 動作確認

1. `https://bess-site-survey-system.vercel.app` にアクセス
2. ログイン画面が表示される
3. F12 → Console でエラーがないことを確認

---

## トラブルシューティング

### エラー: "Invalid API key"
- Vercelの環境変数を確認
- `VITE_SUPABASE_ANON_KEY` が正しいか確認

### エラー: "CORS error"
- Supabaseの Redirect URLs 設定を確認
- Vercel URLが登録されているか確認

### ログインできない
- Supabaseで Email Provider が有効か確認
- ユーザーが作成されているか確認（Supabase Dashboard → Authentication → Users）

---

## 次のステップ

この修正により：
- ✅ カスタムバックエンド不要
- ✅ Supabase Authで認証
- ✅ Supabase PostgreSQLでデータ管理
- ✅ Vercelでフロントエンドホスティング

完全にサーバーレスで動作します！
