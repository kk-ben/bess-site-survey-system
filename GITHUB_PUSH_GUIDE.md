# GitHub プッシュガイド

## 🚀 方法1: 強制プッシュ（推奨）

リポジトリを削除せずに、ローカルのコードで上書きします。

```powershell
cd bess-site-survey-system

# 強制プッシュ
git push -u origin main --force
```

### 認証が求められた場合

**Username**: `kk-ben`  
**Password**: Personal Access Token（下記で作成）

---

## 🔑 Personal Access Token の作成

1. **ブラウザで https://github.com/settings/tokens にアクセス**
2. **「Generate new token」→「Generate new token (classic)」**
3. **設定：**
   - Note: `BESS Deploy`
   - Expiration: `90 days`
   - **Select scopes**: `repo` にチェック ✅
4. **「Generate token」をクリック**
5. **トークンをコピー**（一度しか表示されません！）

### トークンの使用

```powershell
git push -u origin main --force
```

プロンプトが表示されたら：
- Username: `kk-ben`
- Password: **[コピーしたトークンを貼り付け]**

---

## 🔄 方法2: リモートを再設定

```powershell
cd bess-site-survey-system

# 現在のリモートを削除
git remote remove origin

# 新しいリモートを追加
git remote add origin https://github.com/kk-ben/bess-site-survey-system.git

# プッシュ
git push -u origin main --force
```

---

## ✅ 成功確認

プッシュが成功すると、以下のようなメッセージが表示されます：

```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
Delta compression using up to X threads
Compressing objects: 100% (XXX/XXX), done.
Writing objects: 100% (XXX/XXX), XX.XX MiB | XX.XX MiB/s, done.
Total XXX (delta XXX), reused XXX (delta XXX), pack-reused 0
To https://github.com/kk-ben/bess-site-survey-system.git
 + XXXXXXX...XXXXXXX main -> main (forced update)
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

その後、https://github.com/kk-ben/bess-site-survey-system にアクセスして確認してください！

---

## ❌ トラブルシューティング

### エラー: "Authentication failed"

Personal Access Token が必要です。上記の手順で作成してください。

### エラー: "remote: Permission denied"

トークンの権限が不足しています。`repo` スコープが選択されているか確認してください。

### エラー: "fatal: refusing to merge unrelated histories"

強制プッシュを使用してください：
```powershell
git push -u origin main --force
```
