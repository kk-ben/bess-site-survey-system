# 🚀 GitHubへプッシュ - 今すぐ実行

## ステップ1: PowerShellを開く

Windowsキー + X → PowerShell を選択

## ステップ2: 以下のコマンドを実行

```powershell
cd bess-site-survey-system
git push -u origin main --force
```

## ステップ3: 認証が求められた場合

### Personal Access Tokenを作成

1. **ブラウザで https://github.com/settings/tokens にアクセス**
2. **「Generate new token」→「Generate new token (classic)」**
3. **設定：**
   - Note: `BESS Deploy`
   - Expiration: `90 days`
   - **Select scopes**: `repo` にチェック ✅
4. **「Generate token」をクリック**
5. **トークンをコピー**（一度しか表示されません！）

### プッシュ時の入力

```
Username: kk-ben
Password: [コピーしたトークンを貼り付け]
```

## ✅ 成功確認

プッシュが成功すると、以下のようなメッセージが表示されます：

```
Enumerating objects: XXX, done.
Counting objects: 100% (XXX/XXX), done.
...
To https://github.com/kk-ben/bess-site-survey-system.git
 + XXXXXXX...XXXXXXX main -> main (forced update)
```

その後、https://github.com/kk-ben/bess-site-survey-system にアクセスして確認！

---

## 🔄 別の方法：SSH認証を使用

もしSSH鍵を設定している場合：

```powershell
cd bess-site-survey-system
git remote set-url origin git@github.com:kk-ben/bess-site-survey-system.git
git push -u origin main --force
```

---

## ❌ トラブルシューティング

### エラー: "Authentication failed"
→ Personal Access Token が必要です（上記参照）

### エラー: "remote: Permission denied"
→ トークンの権限が不足しています。`repo` スコープを確認

### エラー: "fatal: refusing to merge unrelated histories"
→ `--force` オプションで解決します
