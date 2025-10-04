# ナビゲーション問題の修正完了

## 問題の概要

ダッシュボードのクイックアクションボタンや地図の詳細パネルから他のページに遷移すると、ログイン画面にリダイレクトされる問題が発生していました。

## 原因

以下のコンポーネントで `window.location.href` を使用していたため、ページ全体がリロードされ、React Routerの状態管理とSupabaseの認証セッションが失われていました：

1. **DashboardPage.tsx** - クイックアクションボタン
2. **DetailPanel.tsx** - 地図の詳細表示パネル

## 修正内容

### 1. DashboardPage.tsx

```typescript
// 修正前
<button onClick={() => (window.location.href = '/sites')}>

// 修正後
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
<button onClick={() => navigate('/sites')}>
```

### 2. DetailPanel.tsx

```typescript
// 修正前
const handleViewDetails = () => {
  window.location.href = `/sites/${site.siteId}`;
};

// 修正後
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
const handleViewDetails = () => {
  navigate(`/sites/${site.siteId}`);
};
```

### 3. authStore.ts - initialize処理の改善

```typescript
initialize: async () => {
  try {
    const user = await authService.getCurrentUser();
    if (user) {
      const mappedUser: User = {
        userId: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email,
        role: user.user_metadata?.role || 'viewer',
      };
      const token = localStorage.getItem('auth_token') || null;
      set({ user: mappedUser, token, isAuthenticated: true });
    } else {
      // セッションがない場合はクリア
      localStorage.removeItem('auth_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  } catch (error) {
    console.error('Initialize auth error:', error);
    localStorage.removeItem('auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}
```

## 修正されたナビゲーション

✅ ダッシュボード → 候補地管理
✅ ダッシュボード → スクリーニング
✅ ダッシュボード → ユーザー管理
✅ 地図の詳細パネル → 詳細ページ
✅ サイドバー → 地図表示（新規ページ作成）
✅ サイドバー → 設定（新規ページ作成）
✅ サイドバーのすべてのリンク

## ベストプラクティス

React Routerを使用したSPAでは、以下のルールに従ってください：

### ✅ 推奨される方法

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/path');  // プログラマティックナビゲーション
```

```typescript
import { Link, NavLink } from 'react-router-dom';

<Link to="/path">リンク</Link>  // 宣言的ナビゲーション
<NavLink to="/path">ナビリンク</NavLink>  // アクティブ状態付き
```

### ❌ 避けるべき方法

```typescript
window.location.href = '/path';  // ページ全体がリロードされる
window.location.replace('/path');  // 同上
<a href="/path">リンク</a>  // 同上
```

### 例外: 外部リンク

外部サイトへのリンクは `window.open()` を使用：

```typescript
window.open('https://external-site.com', '_blank');
```

## デプロイ

修正はGitHubにプッシュ済みです。Vercelが自動的に再デプロイします。

```bash
git commit -m "Fix navigation redirects to login - use React Router navigate"
git push origin main
```

## 動作確認

1. https://bess-site-survey-system.vercel.app にアクセス
2. ログイン
3. ダッシュボードのクイックアクションボタンをクリック
4. 正しいページに遷移し、ログイン状態が維持されることを確認

## 追加で作成したページ

### MapPage.tsx
地図表示機能のプレースホルダーページ。将来的に候補地を地図上で表示・管理する機能を実装予定。

### SettingsPage.tsx
設定機能のプレースホルダーページ。システム設定やユーザー設定を管理する機能を実装予定。

## 関連ファイル

- `frontend/src/pages/DashboardPage.tsx` - クイックアクション修正
- `frontend/src/components/map/DetailPanel.tsx` - 詳細表示ボタン修正
- `frontend/src/stores/authStore.ts` - 認証初期化改善
- `frontend/src/App.tsx` - ルート追加
- `frontend/src/pages/MapPage.tsx` - 新規作成
- `frontend/src/pages/SettingsPage.tsx` - 新規作成
- `frontend/src/components/layout/Sidebar.tsx` (参考: 正しい実装例)
