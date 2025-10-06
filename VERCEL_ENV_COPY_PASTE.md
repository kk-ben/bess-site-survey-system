# Vercel環境変数 - コピペ用

## 📋 すぐにコピペできる環境変数

Vercelダッシュボード → Settings → Environment Variables で以下を追加：

### 1. VITE_API_BASE_URL
```
http://153.121.61.164:3000/api/v2
```

### 2. VITE_SUPABASE_URL
```
https://kcohexmvbccxixyfvjyw.supabase.co
```

### 3. VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
```

## 🎯 設定手順（1分で完了）

1. **Vercelにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクトを選択**
   - `bess-site-survey-system` をクリック

3. **Settings → Environment Variables**

4. **各環境変数を追加**
   - Name: `VITE_API_BASE_URL`
   - Value: 上記の値をコピペ
   - Environment: **Production, Preview, Development すべてチェック**
   - 「Save」をクリック
   
   ↓ 同様に残り2つも追加

5. **自動再デプロイ開始**
   - 保存後、自動的に再デプロイが始まります
   - 約2-3分で完了

6. **完了確認**
   ```
   https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login
   ```

---

**最終更新**: 2025年10月6日 21:00
