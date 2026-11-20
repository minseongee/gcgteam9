// 저장소: DataStore (localStorage 읽기·쓰기를 맡는 유일한 창구)
// localStorage는 이 파일 밖에서 쓰지 않습니다. 다른 파일은 모두 DataStore를 거쳐 데이터를 읽고 씁니다.
// localStorage 키는 모두 'cafe9.'으로 시작하고, 값은 JSON.stringify한 배열입니다. (data.md 1절)

const DataStore = {
    // localStorage 키 앞에 붙이는 글자
    prefix: 'cafe9.',

    // load / save에 넘길 수 있는 키 이름 (data.md 1절 표)
    keys: ['users', 'cafes', 'menuTypes', 'evalTags', 'menus', 'reviews', 'favorites', 'compareBox'],

    // data.js에서만 정하고 아무 기능도 고치지 않는 고정 데이터. 열 때마다 data.js 값으로 다시 맞춘다 (data.md 1절)
    fixedKeys: ['menuTypes', 'evalTags'],

    // 역할: 키 이름이 목록에 있는지 확인한다 (DataStore 안에서만 사용)
    // 입력: key - 키 이름
    // 출력: 없음
    // 오류: 목록에 없는 키면 '알 수 없는 데이터 키입니다: <키>'
    checkKey: function (key) {
        if (DataStore.keys.indexOf(key) === -1) {
            throw new Error('알 수 없는 데이터 키입니다: ' + key);
        }
    },

    // 역할: 처음 실행이면 SEED_DATA를 localStorage에 복사한다
    //       고정 데이터(fixedKeys)는 처음이 아니어도 매번 SEED_DATA로 덮어써서, data.js를 고치면 바로 반영되게 한다
    // 입력: 없음
    // 출력: 없음
    // 오류: 없음 ('cafe9.initialized'가 이미 있으면 고정 데이터만 다시 맞춤)
    init: function () {
        if (localStorage.getItem(DataStore.prefix + 'initialized') !== null) {
            for (let i = 0; i < DataStore.fixedKeys.length; i++) {
                const key = DataStore.fixedKeys[i];
                localStorage.setItem(DataStore.prefix + key, JSON.stringify(SEED_DATA[key]));
            }
            DataStore.syncCafeLocations();
            return;
        }
        for (let i = 0; i < DataStore.keys.length; i++) {
            const key = DataStore.keys[i];
            localStorage.setItem(DataStore.prefix + key, JSON.stringify(SEED_DATA[key]));
        }
        localStorage.setItem(DataStore.prefix + 'initialized', 'true');
    },

    // 2026-11-20에 data.js에서 고친 카페의 예전 위치 설명 (카페 id -> 예전 값)
    // 저장된 값이 이것과 같으면 사장이 고치지 않은 것이므로 data.js의 새 값으로 바꾼다
    oldLocationTexts: { 2: '생활관', 5: '경북대 인근' },

    // 역할: 저장된 카페의 위도·경도(lat, lng)와 교내/근처(area)를 data.js 값으로 다시 맞춘다
    //       이 셋은 data.js에서만 정하고 어떤 기능도 고치지 않으므로, data.js를 고치면 바로 지도·목록에 반영되게 한다
    //       위치 설명은 oldLocationTexts의 예전 기본값 그대로일 때만 새 값으로 바꾼다
    //       (사장이 고친 이름·위치 설명·영업시간은 그대로 둔다)
    // 입력: 없음
    // 출력: 없음
    // 오류: 없음 (data.js에 없는 카페는 건드리지 않음)
    syncCafeLocations: function () {
        const cafes = DataStore.load('cafes');
        for (let i = 0; i < cafes.length; i++) {
            for (let k = 0; k < SEED_DATA.cafes.length; k++) {
                if (SEED_DATA.cafes[k].id === cafes[i].id) {
                    cafes[i].lat = SEED_DATA.cafes[k].lat;
                    cafes[i].lng = SEED_DATA.cafes[k].lng;
                    cafes[i].area = SEED_DATA.cafes[k].area;
                    // 위치 설명은 사장이 고칠 수 있으므로, 예전 기본값 그대로일 때만 새 값으로 바꾼다
                    if (cafes[i].locationText === DataStore.oldLocationTexts[cafes[i].id]) {
                        cafes[i].locationText = SEED_DATA.cafes[k].locationText;
                    }
                }
            }
        }
        DataStore.save('cafes', cafes);
    },

    // 역할: 키에 저장된 목록을 읽는다
    // 입력: key - 키 이름 (예: 'menus')
    // 출력: 배열 (JSON.parse로 새로 만든 복사본이라 고쳐도 저장된 값은 바뀌지 않음)
    // 오류: 모르는 키면 '알 수 없는 데이터 키입니다: <키>'
    load: function (key) {
        DataStore.checkKey(key);
        const text = localStorage.getItem(DataStore.prefix + key);
        if (text === null) {
            return [];
        }
        return JSON.parse(text);
    },

    // 역할: 키에 목록을 통째로 저장한다
    // 입력: key - 키 이름, list - 저장할 배열
    // 출력: 없음
    // 오류: 모르는 키면 '알 수 없는 데이터 키입니다: <키>'
    save: function (key, list) {
        DataStore.checkKey(key);
        localStorage.setItem(DataStore.prefix + key, JSON.stringify(list));
    },

    // 역할: 새 항목에 붙일 id를 정한다
    // 입력: key - 키 이름
    // 출력: 그 목록의 가장 큰 id + 1 (목록이 비었으면 1)
    // 오류: 모르는 키면 '알 수 없는 데이터 키입니다: <키>'
    nextId: function (key) {
        const list = DataStore.load(key);
        let maxId = 0;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id > maxId) {
                maxId = list[i].id;
            }
        }
        return maxId + 1;
    },

    // 역할: 로그인 상태를 읽는다
    // 입력: 없음
    // 출력: { userId: 숫자 } 또는 로그인 안 했으면 null
    // 오류: 없음
    loadSession: function () {
        const text = localStorage.getItem(DataStore.prefix + 'session');
        if (text === null) {
            return null;
        }
        return JSON.parse(text);
    },

    // 역할: 로그인 상태를 저장한다
    // 입력: userId - 로그인한 회원 id
    // 출력: 없음
    // 오류: 없음
    saveSession: function (userId) {
        localStorage.setItem(DataStore.prefix + 'session', JSON.stringify({ userId: userId }));
    },

    // 역할: 로그인 상태를 지운다 (로그아웃)
    // 입력: 없음
    // 출력: 없음
    // 오류: 없음
    clearSession: function () {
        localStorage.removeItem(DataStore.prefix + 'session');
    },

    // 역할: 'cafe9.'으로 시작하는 키를 모두 지우고 SEED_DATA로 다시 채운다 (시연 전 초기화)
    // 입력: 없음
    // 출력: 없음
    // 오류: 없음
    reset: function () {
        // 지우는 동안 순서가 바뀌므로 지울 키를 먼저 모은다
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const name = localStorage.key(i);
            if (name.indexOf(DataStore.prefix) === 0) {
                toRemove.push(name);
            }
        }
        for (let i = 0; i < toRemove.length; i++) {
            localStorage.removeItem(toRemove[i]);
        }
        DataStore.init();
    }
};

DataStore.init();
