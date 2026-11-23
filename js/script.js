const member = ["中村", "黒木", "岩井", "鶴若", "岩野", "杉原", "小坂", "堀尾", "田村", "武井", "富永", "飯田", "田邊", "松岡", "八木田"];
const Theme = ["最近気になるニュース", "最近気になるカルチャー", "最近美味しかったもの(食べたいもの)", "最近買ってよかったもの(買いたいもの)", "最近の推し(人・キャラクター・動物)", "おすすめの映像作品(映画・ドラマ・アニメ・YouTube動画)", "ココに行ってきました(行きたい)", "おすすめのYouTubeチャンネル(SNSアカウントでも可)", "おすすめの本(漫画・実用書・自己啓発・雑誌)", "おすすめのアプリ(Webアプリ/サイトでも可)", "フリーテーマ(発言者が自由に喋ってください)", "好きな音楽、アーティストは？", "これを◯◯さんに聞きたい", "週末（昨日）のハイライト", "今日のランチ、何食べます（食べました）？", "もしも1週間、自由に休みが取れたら何する？", "おすすめの「息抜き」方法（ストレス解消法）"];
// ----------------------------------------------結果を表示
$("#start").on("click", function () {
    // 表の下から10行を取り出して、その人の名前を配列にする
    const recentPeople = $("#calendar tr").slice(-10).map(function () {
        return $(this).find('input[type="text"]').val();
    }).get();

    console.log(recentPeople);

    // 最近10人に入っていない人だけを抽選用メンバーにする
    const availableMembers = member.filter(function (person) {
        return !recentPeople.includes(person);
    });

    console.log(availableMembers);

    //最近10名に入っていないメンバー（availableMembers）からランダムに選んだ番号を箱に入れる
    const randomNumber = Math.floor(Math.random() * availableMembers.length);
    //ランダムに選んだ番号から該当するmemberを指定して選ばれた人の箱（selectedPerson）に入れる
    const selectedPerson = availableMembers[randomNumber];


    //指定した名前を表示する
    $("#selectedMember").text(selectedPerson);

    //全17からランダムに選んだ番号を箱に入れる
    const randomTheme = Math.floor(Math.random() * 17);
    //ランダムに選んだ番号から該当するテーマを指定する
    const selectedTheme = Theme[randomTheme];
    //指定したテーマを表示する
    $("#selectedTheme").text(selectedTheme);
});
// ----------------------------------------------表に追加
// 日付から曜日を作る
function getWeekday(date) {
    if (!date) {
        return "";
    }

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    return weekdays[new Date(`${date}T00:00:00`).getDay()];
}

//「決定ボタン」をクリックしたら今表示されている人を行に追加する
$("#end").on("click", function () {
    // 表示済みの人をdecidedPersonの箱に入れる
    const decidedPerson = $("#selectedMember").text();
    //今日の日付をtodayの箱に入れる
    const today = new Date().toISOString().slice(0, 10);

    // 表に追加する1行を作る
    const row = `
        <tr>
            <td><input type="date" value="${today}"></td>
            <td class="weekday">${getWeekday(today)}</td>
            <td><input type="text" value="${decidedPerson}"></td>
            <td><textarea placeholder="話した内容を入力してください"></textarea></td>
            <td><button type="button" class="delete" aria-label="記録を削除"><span class="material-symbols-rounded">delete</span></button></td>
        </tr>
    `;
    // calendarの末尾に1行追加
    $("#calendar").append(row);
    //いったん保存
    saveRecords();
});

// ----------------------------------------------データを保存
//saveRecords という名前の処理を作る（カレンダーのデータを保存する処理）
function saveRecords() {
    // 記録を入れる配列
    const records = [];

    // カレンダー内の中の3種類のデータをワンセットにして最後までrecordsに入れ続ける
    $("#calendar tr").each(function () {
        const date = $(this).find('input[type="date"]').val();
        const person = $(this).find('input[type="text"]').val();
        const content = $(this).find("textarea").val();

        records.push({
            date: date,
            person: person,
            content: content
        });
    });

    // recordsはそのままではlocalStorageに保存できないのでJSON文字列に変換する
    const jsonData = JSON.stringify(records);
    // recordsというkeyでJSON文字列をlocalStorageに保存する
    localStorage.setItem("records", jsonData);

    console.log(records);
}

// 話した内容の改行に合わせて入力欄の高さを調整する
function resizeTextarea(textarea) {
    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
}

// calendar内の入力欄が変わったら自動保存する
$("#calendar").on("input change", "input, textarea", function () {
    if ($(this).is('input[type="date"]')) {
        const date = $(this).val();
        $(this).closest("tr").find(".weekday").text(getWeekday(date));
    }

    if ($(this).is("textarea")) {
        resizeTextarea(this);
    }
    saveRecords();
});

// 削除
$("#calendar").on("click", ".delete", function () {
    $(this).closest("tr").remove();
    saveRecords();
});

// ----------------------------------------------リロード時に保存済みの記録を表へ戻す
//もしlocalStorageに「records」という名前の保存データがあったら実行
if (localStorage.getItem("records")) {
    // localStorageから文字列を取り出してjsonDataという箱に入れる
    const jsonData = localStorage.getItem("records");

    // 文字列を配列に戻す
    const records = JSON.parse(jsonData);

    // 保存していた記録を1件ずつ取り出して、表へ1行ずつ戻す処理
    records.forEach(function (record) {
        const row = `
            <tr>
                <td><input type="date" value="${record.date}"></td>
                <td class="weekday">${getWeekday(record.date)}</td>
                <td><input type="text" value="${record.person}"></td>
                <td><textarea placeholder="話した内容を入力してください">${record.content}</textarea></td>
                <td><button type="button" class="delete" aria-label="記録を削除"><span class="material-symbols-rounded">delete</span></button></td>
            </tr>
        `;
        //作った1行を <tbody id="calendar"> の最後に追加
        $("#calendar").append(row);
        resizeTextarea($("#calendar tr:last textarea")[0]);
    });
}

