# 制作アプリのタイトル
ランダム抽選でアイスブレイク

## 制作アプリの説明（40文字程度）
前提条件：
- 毎朝ランダムに担当者とテーマを決めてアイスブレイクをやっている

課題：
- 最近担当した人が当たったら抽選しなおしている
- 「最近」の定義は特にないので人の目で確認してだいたいで決めている
- 当たった人と話した内容を手入力している

## 工夫した点・こだわった点

### 【使用したJavaScript技術】

- データ型・構造：配列、オブジェクト
- 変数・定数：`const`
- 関数：`function saveRecords()`
- 条件分岐：`if`
- 繰り返し：`forEach()`、jQueryの`.each()`
- 日付：`new Date()`
- ランダム抽選：`Math.random()`、`Math.floor()`
- JSON変換：`JSON.stringify()`、`JSON.parse()`
- ブラウザ保存：`localStorage`、`.setItem()`、`.getItem()`
- jQuery：`.on()`、`.text()`、`.val()`、`.find()`、`.append()`
- テンプレートリテラル：JavaScriptで表の行を作成

.....................................................................................................

### 【オブジェクト】

関連する複数の値を名前付きで1つの箱にまとめるデータ構造。<br>
日付・当たった人・話した内容を1件の記録としてまとめ、`records` 配列に保存しています。

```js
    {
        date: "2026-11-22",
        person: "堀尾",
        content: "ランチの話"
    }
```

.....................................................................................................

### 【関数の巻き上げ】
```js
    function saveRecords() {
        // ここに保存する処理を書く
    }
```

43行目で「保存機能」を作成。
```js
    saveRecords();
```
で呼び出したタイミングでfunction saveRecords() の中身である { } が実行される<br>
なお、関数宣言では、呼び出し行が先でも実行できる<br>
JavaScriptが実行前に関数の存在を認識する仕組みを、巻き上げ（hoisting）と言う。<br><br>

▼関数の使いまわし例▼
```js
    // calendar内の入力欄が変わったら自動保存する
    $("#calendar").on("input change", "input, textarea", function () {
        saveRecords();
    });
```
.....................................................................................................

### 【自動保存】(エクセルぽく)

保存ボタンを押さなくても、日付・あたった人・話した内容を編集したタイミングで`saveRecords()` を実行。<br>
表の最新データを`localStorage`へ保存するようにした。

また、「この人に決まり」で新しい行を追加した直後にも`saveRecords()` を実行している。<br>
そのため、記録の追加・編集・リロード後の復元を自動で行える。

.....................................................................................................

### 【配列への記録追加 push()】
```js
    records.push({
        date: date,
        person: person,
        content: content
    });
```
records という配列に、`{ }` でまとめた日付・人・内容の1セットを追加する

.....................................................................................................

### 【localStorage】

このアプリでの localStorage の2つの役割
1. 保存する
   表の内容を文字列にしてブラウザへ保存
```js
    // recordsはそのままではlocalStorageに保存できないのでJSON文字列に変換する
    const jsonData = JSON.stringify(records);

    // recordsというkeyでJSON文字列をlocalStorageに保存する
    localStorage.setItem("records", jsonData);
```
<br>

2. リロード時に読み込む
   保存していた文字列を取り出し配列へ戻す
```js
    // localStorageから文字列を取り出してjsonDataという箱に入れる
    const jsonData = localStorage.getItem("records");

    // 文字列を配列に戻す
    const records = JSON.parse(jsonData);
```

| メソッド | 役割 | 使うタイミング |
|---|---|---|
| `JSON.stringify()` | 配列・オブジェクトをJSON文字列に変換する | `localStorage` へ保存するとき |
| `JSON.parse()` | JSON文字列を配列・オブジェクトに戻す | `localStorage` から読み込むとき |

.....................................................................................................

### 【直近10名以外でランダム選択】
**＜① 先に直近10行を選んでから、その中の人の名前を取り出す＞**
```js
    // 表の下から10行を取り出して、その人の名前を配列にする
    const recentPeople = $("#calendar tr").slice(-10).map(function () {
        return $(this).find('input[type="text"]').val();
    }).get();
```
左から順番に処理される。
1. $("#calendar tr")<br>
   カレンダー内のすべての tr を取得する
2. .slice(-10)<br>
   その行の集まりから、下（最後）10行に絞る
3. .map(function () { ... })<br>
   10行を1行ずつ処理する
4. $(this).find('input[type="text"]').val()<br>
   今見ている1行の「あたった人」入力欄の値を取り出して返す
5. .get()<br>
   取り出した10人分の値を普通の配列にする
6. recentPeople に代入する<br>


**＜② 最近10人に入っていない人だけを抽選用メンバーにする＞**
```js
  // 最近10人に入っていない人だけを抽選用メンバーにする
    const availableMembers = member.filter(function (person) {
    return !recentPeople.includes(person);
    });
```
左から順番に処理される。

1. `member.filter(...)`  
   `member` 配列のメンバーを、1人ずつ確認していく。

2. `function (person) { ... }`  
   今確認している1人の名前を、`person` という一時的な箱に入れる。  
   例：最初は `"中村"`、次は `"黒木"`。

3. `recentPeople.includes(person)`  
   最近10人の配列 `recentPeople` の中に、今の `person` が含まれているか確認する。

4. `!recentPeople.includes(person)`  
   `!` は「〜ではない」。  
   最近10人に含まれていない場合だけ `true` になる。

5. `filter`  
   `true` だった人だけを残し、`false` だった人は外す。

6. `availableMembers` に代入する  
   最近10人を除いた、抽選できるメンバーの配列になる。


**＜③ 抽選対象に残っている人の人数に合わせてランダムな番号を作り、その番号の人を1人選ぶ＞**
```js
    //最近10名に入っていないメンバー（availableMembers）からランダムに選んだ番号を箱に入れる
    const randomNumber = Math.floor(Math.random() * availableMembers.length);
    //ランダムに選んだ番号から該当するmemberを指定して選ばれた人の箱（selectedPerson）に入れる
    const selectedPerson = availableMembers[randomNumber];
```
1. `availableMembers.length`  
   最近10人を除いた、抽選できるメンバーの人数を数える。  
   例：5人なら `5`。

2. `Math.random()`  
   `0` 以上 `1` 未満のランダムな小数を作る。  
   例：`0.68`

3. `Math.random() * availableMembers.length`  
   ランダムな小数に、抽選できる人数を掛ける。  
   5人なら、`0` 以上 `5` 未満の数になる。  
   例：`0.68 × 5` → `3.4`

4. `Math.floor(...)`  
   小数点以下を切り捨てて、配列の番号にする。  
   `3.4` → `3`  
   つまり、`0` から「人数 − 1」までのランダムな番号になる。

5. `randomNumber` に代入する  
   作ったランダムな番号を入れる。  
   例：`randomNumber` に `3` が入る。

6. `availableMembers[randomNumber]`  
   `availableMembers` の中から、ランダム番号の位置にいる名前を取り出す。  
   例：`availableMembers[3]` の人を取り出す。

7. `selectedPerson` に代入する  
   ランダムに選ばれた人の名前を `selectedPerson` に入れる。

## 次回トライしたこと（または機能）
テーマ（話す内容）はAIを使って出力したかったがAIにやめとけと言われた。ぐぬぬ。

## 備考（感想、シェアしたいこと等なんでも）
