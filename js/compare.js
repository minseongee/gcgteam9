// C. 비교·추천: Compare (같은 타입 비교표, 조건 추천, 비교함)
// 비교함은 DataStore의 compareBox 키에 메뉴 id 배열로 저장합니다(최대 4개, 모두 같은 타입).
// 메뉴 정보는 Cafes.getMenu, 평가 버튼 비율은 Reviews.getReviewSummary로 얻습니다.

const Compare = {
    // ───────── 내부 함수 (Compare 안에서만 사용) ─────────

    // 역할: 비교표 행들 중 한 항목의 1위 메뉴를 고른다
    // 입력: rows - compareMenus의 rows 배열
    //       getValue - 행 하나를 받아 비교할 숫자(또는 null)를 돌려주는 함수
    //       lowerIsBetter - true면 낮을수록 1위(가격), false면 높을수록 1위
    // 출력: 1위 메뉴 id (같으면 앞의 메뉴), 값이 모두 null이면 null
    // 오류: 없음
    pickBest: function (rows, getValue, lowerIsBetter) {
        let bestId = null;
        let bestValue = null;
        for (let i = 0; i < rows.length; i++) {
            const value = getValue(rows[i]);
            if (value === null) {
                continue;
            }
            const better = lowerIsBetter ? value < bestValue : value > bestValue;
            if (bestValue === null || better) {
                bestId = rows[i].menu.id;
                bestValue = value;
            }
        }
        return bestId;
    },

    // ───────── 비교함 (interface.md 6절) ─────────

    // 역할: 비교함에 담긴 메뉴 id를 돌려준다
    // 입력: 없음
    // 출력: 메뉴 id 배열 (담은 순서대로)
    // 오류: 없음
    getBox: function () {
        return DataStore.load('compareBox');
    },

    // 역할: 비교함에 메뉴를 담는다 (이미 담겨 있으면 그대로 둠)
    // 입력: menuId - 메뉴 id (숫자)
    // 출력: 담긴 메뉴 id 배열
    // 오류: '메뉴를 찾을 수 없습니다'
    //       이미 4개면 '2~4개 메뉴를 골라 주세요'
    //       담긴 메뉴와 타입이 다르면 '같은 종류의 메뉴끼리만 비교할 수 있어요'
    addToBox: function (menuId) {
        const menu = Cafes.getMenu(menuId);
        const box = DataStore.load('compareBox');
        if (box.indexOf(menuId) !== -1) {
            return box;
        }
        if (box.length >= 4) {
            throw new Error('2~4개 메뉴를 골라 주세요');
        }
        if (box.length > 0 && Cafes.getMenu(box[0]).typeId !== menu.typeId) {
            throw new Error('같은 종류의 메뉴끼리만 비교할 수 있어요');
        }
        box.push(menuId);
        DataStore.save('compareBox', box);
        return box;
    },

    // 역할: 비교함에서 메뉴를 뺀다 (없으면 그대로 둠)
    // 입력: menuId - 메뉴 id (숫자)
    // 출력: 담긴 메뉴 id 배열
    // 오류: 없음
    removeFromBox: function (menuId) {
        const box = DataStore.load('compareBox');
        const result = [];
        for (let i = 0; i < box.length; i++) {
            if (box[i] !== menuId) {
                result.push(box[i]);
            }
        }
        DataStore.save('compareBox', result);
        return result;
    },

    // ───────── 비교표 (interface.md 4절) ─────────

    // 역할: 같은 타입 메뉴 2~4개를 비교표로 만든다
    // 입력: menuIds - 메뉴 id 배열 (같은 id가 겹치면 하나로 셈)
    // 출력: { typeId, typeName, tags: [{ id, label }],
    //         rows: [{ menu: MenuItem, tagPercents: { [tagId]: percent } }] (입력 순서대로),
    //         best: { price, rating, reviewCount, [tagId]: 1위 menuId } }
    //       best.price는 낮을수록, 나머지는 높을수록 1위. 같으면 앞의 메뉴.
    //       평점이 모두 null이면 best.rating은 넣지 않음
    // 오류: '2~4개 메뉴를 골라 주세요' / '메뉴를 찾을 수 없습니다'
    //       '같은 종류의 메뉴끼리만 비교할 수 있어요'
    compareMenus: function (menuIds) {
        if (!Array.isArray(menuIds)) {
            throw new Error('2~4개 메뉴를 골라 주세요');
        }
        const ids = [];
        for (let i = 0; i < menuIds.length; i++) {
            if (ids.indexOf(menuIds[i]) === -1) {
                ids.push(menuIds[i]);
            }
        }
        if (ids.length < 2 || ids.length > 4) {
            throw new Error('2~4개 메뉴를 골라 주세요');
        }

        const rows = [];
        for (let i = 0; i < ids.length; i++) {
            const menu = Cafes.getMenu(ids[i]);
            if (i > 0 && menu.typeId !== rows[0].menu.typeId) {
                throw new Error('같은 종류의 메뉴끼리만 비교할 수 있어요');
            }
            const tagStats = Reviews.getReviewSummary(menu.id).tagStats;
            const tagPercents = {};
            for (let j = 0; j < tagStats.length; j++) {
                tagPercents[tagStats[j].tagId] = tagStats[j].percent;
            }
            rows.push({ menu: menu, tagPercents: tagPercents });
        }

        const typeId = rows[0].menu.typeId;
        let tags = [];
        const types = Cafes.getMenuTypes();
        for (let i = 0; i < types.length; i++) {
            if (types[i].id === typeId) {
                tags = types[i].tags;
            }
        }

        const best = {};
        best.price = Compare.pickBest(rows, function (row) {
            return row.menu.price;
        }, true);
        const bestRating = Compare.pickBest(rows, function (row) {
            return row.menu.avgRating;
        }, false);
        if (bestRating !== null) {
            best.rating = bestRating;
        }
        best.reviewCount = Compare.pickBest(rows, function (row) {
            return row.menu.reviewCount;
        }, false);
        for (let i = 0; i < tags.length; i++) {
            const tagId = tags[i].id;
            best[tagId] = Compare.pickBest(rows, function (row) {
                return row.tagPercents[tagId];
            }, false);
        }

        return {
            typeId: typeId,
            typeName: rows[0].menu.typeName,
            tags: tags,
            rows: rows,
            best: best
        };
    }

    // recommend: 2-7에서 추가
};
