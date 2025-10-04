# 🚨 CORS エラー - 即座の解決方法

## 現在の問題

```
Access to XMLHttpRequest at 'http://localhost:4000/api/v1/auth/login' 
from origin 'https://bess-site-survey-system.vercel.app' 
has been blocked by CORS policy
```

## 原因

Vercelにデプロイされたフロントエンドが、ローカルのバックエンド（localhost:4000）にアクセスしようとしています。

## 🎯 解決方法（3つの選択肢）

### 選択肢1：バックエンドをVercelにデプロイ（推奨）⭐

**所要時間**: 10-15分

1. `VERCEL_BACKEND_SETUP.md`の手順に従ってバックエンドをデプロイ
2. デプロイ完了後、フロントエンドの環境変数を更新
3. 完全な本番環境が完成

**メリット**:
- 完全な本番環境
- 高速で安定
- 無料枠で十分

**デメリット**:
- 初回セットアップに時間がかかる

---

### 選択肢2：ローカルでテスト（開発用）🔧

**所要時間**: 2分

ローカル環境でフロントエンドとバックエンドを同時に起動してテスト：

```powershell
# ターミナル1: バックエンド起動
cd bess-site-survey-system
npm install
npm run dev

# ターミナル2: フロントエンド起動（別ウィンドウ）
cd bess-site-survey-system/frontend
pnpm install
pnpm dev
```

ブラウザで `http://localhost:5173` にアクセス

**メリット**:
- すぐに動作確認できる
- 開発に最適

**デメリット**:
- 本番環境ではない
- 他の人はアクセスできない

---

### 選択肢3：一時的にSupabase Authを使用 🔐

**所要時間**: 5分

バックエンドAPIをスキップして、Supabase Authを直接使用：

#### 手順：

1. **Supabase Authを有効化**

Supabaseダッシュボード → Authentication → Providers → Email を有効化

2. **フロントエンドのauth.service.tsを更新**

```typescript
// bess-site-survey-system/frontend/src/services/auth.service.ts
import { supabase } from '@/lib/supabase';

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

3. **Supabaseでユーザーを作成**

Supabaseダッシュボード → Authentication → Users → Add user

4. **Vercelで再デプロイ**

```bash
git add .
git commit -m "Use Supabase Auth directly"
git push origin main
```

**メリット**:
- バックエンド不要
- すぐに動作
- Supabaseの機能を活用

**デメリット**:
- カスタムロジックが制限される
- 既存のバックエンドコードが使えない

---

## 📊 比較表

| 方法 | 所要時間 | 難易度 | 本番対応 | 推奨度 |
|------|---------|--------|---------|--------|
| 選択肢1: Vercelデプロイ | 10-15分 | 中 | ✅ | ⭐⭐⭐⭐⭐ |
| 選択肢2: ローカルテスト | 2分 | 易 | ❌ | ⭐⭐⭐ |
| 選択肢3: Supabase Auth | 5分 | 易 | ✅ | ⭐⭐⭐⭐ |

---

## 🎯 推奨アクション

### 今すぐテストしたい場合
→ **選択肢2**（ローカルテスト）

### 本番環境を構築したい場合
→ **選択肢1**（Vercelデプロイ）

### シンプルに済ませたい場合
→ **選択肢3**（Supabase Auth）

---

## 💡 次のステップ

どの方法を選びますか？

1. **Vercelにバックエンドをデプロイ** → `VERCEL_BACKEND_SETUP.md`を参照
2. **ローカルでテスト** → 上記のコマンドを実行
3. **Supabase Authを使用** → 上記の手順を実行

---

## 🆘 サポートが必要な場合

どの方法を選んだか教えてください。詳細な手順をサポートします！
