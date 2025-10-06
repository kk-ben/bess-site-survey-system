# 🚀 クイックデータ投入手順

## 最も簡単な方法：Supabase Dashboard

### ステップ1: Supabaseにログイン
https://supabase.com/dashboard

### ステップ2: Table Editorを開く
1. プロジェクト「BESS Site Survey System」を選択
2. 左メニューから「Table Editor」をクリック
3. 「sites」テーブルを選択

### ステップ3: 「Insert row」でデータ追加

#### サイト1
```
name: 茨城県つくば市 工業団地跡地
latitude: 36.0839
longitude: 140.0764
address: 茨城県つくば市東光台5-19
capacity_mw: 15.5
status: approved
created_by: admin@example.com
```

#### サイト2
```
name: 千葉県市原市 埋立地
latitude: 35.4980
longitude: 140.1156
address: 千葉県市原市五井南海岸1-1
capacity_mw: 12.0
status: approved
created_by: admin@example.com
```

#### サイト3
```
name: 大阪府堺市 臨海工業地帯
latitude: 34.5833
longitude: 135.4297
address: 大阪府堺市西区築港新町1-5-1
capacity_mw: 25.0
status: evaluated
created_by: admin@example.com
```

---

## 確認

データ投入後、APIで確認：

```bash
curl http://153.121.61.164:3000/api/v2/sites
```

3件のサイトが返ってくればOK！

