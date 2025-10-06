# 🚀 今すぐデプロイ（最も簡単な方法）

## 1️⃣ Supabase Service Keyを取得（30秒）

1. https://supabase.com/dashboard にアクセス
2. プロジェクト `kcohexmvbccxixyfvjyw` を選択
3. Settings → API
4. 「service_role」の横にある「Reveal」をクリック
5. キーをコピー

## 2️⃣ スクリプトを実行（30秒）

PowerShellで以下を実行：

```powershell
# キーを設定（コピーしたキーを貼り付け）
$env:SUPABASE_SERVICE_KEY="ここにコピーしたキーを貼り付け"

# スクリプト実行
node bess-site-survey-system/scripts/deploy-via-api.js
```

## ✅ 成功したら

ブラウザで以下にアクセス：

https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login

ログイン：
- Email: `admin@bess.com`
- Password: `password123`

---

## 🎉 完了！

サイト一覧に3件のテストサイトが表示されれば成功です！
