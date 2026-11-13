// 화면 개발용 가짜. 진짜 모듈이 완성되면 script 태그를 바꿔 끼운다
// Compare 가짜: interface.md 4절·6절과 이름·입력·반환 모양이 같습니다. 저장하지 않습니다.
// 메뉴는 Cafes(가짜 또는 진짜)에서 가져옵니다.

const Compare = {
    // 고정 데이터: 비교함에 담겨 있는 것으로 칠 메뉴 id (같은 타입: 커피)
    box: [1, 2, 16],

    // 역할: 비교표 한 줄에서 항목 값을 꺼낸다 (가격은 낮을수록 1위라서 음수로 바꿈)
    valueOf: function (row, key) {
        if (key === 'price') {
            return -row.menu.price;
        }
        if (key === 'rating') {
            return row.menu.avgRating;
        }
        if (key === 'reviewCount') {
            return row.menu.reviewCount;
        }
        return row.tagPercents[key];
    },

    // 역할: 비교함 / 입력: 없음 / 출력: 메뉴 id 배열 / 오류: 없음
    getBox: function () {
        return Compare.box.slice();
    },

    // 역할: 비교함에 담기 (가짜: 저장하지 않고 담긴 뒤 모양만 돌려줌)
    // 입력: menuId / 출력: 메뉴 id 배열
    // 오류: '2~4개 메뉴를 골라 주세요'(4개 넘음), '같은 종류의 메뉴끼리만 비교할 수 있어요'
    addToBox: function (menuId) {
        const box = Compare.getBox();
        if (box.includes(menuId)) {
            return box;
        }
        if (box.length >= 4) {
            throw new Error('2~4개 메뉴를 골라 주세요');
        }
        if (box.length > 0 && Cafes.getMenu(box[0]).typeId !== Cafes.getMenu(menuId).typeId) {
            throw new Error('같은 종류의 메뉴끼리만 비교할 수 있어요');
        }
        box.push(menuId);
        return box;
    },

    // 역할: 비교함에서 빼기 (가짜: 저장하지 않음) / 입력: menuId / 출력: 메뉴 id 배열 / 오류: 없음
    removeFromBox: function (menuId) {
        return Compare.getBox().filter(function (id) {
            return id !== menuId;
        });
    },

    // 역할: 비교표 / 입력: 같은 타입 메뉴 id 2~4개
    // 출력: { typeId, typeName, tags, rows, best }
    // 오류: '2~4개 메뉴를 골라 주세요', '같은 종류의 메뉴끼리만 비교할 수 있어요'
    compareMenus: function (menuIds) {
        if (menuIds.length < 2 || menuIds.length > 4) {
            throw new Error('2~4개 메뉴를 골라 주세요');
        }
        const menus = menuIds.map(function (id) {
            return Cafes.getMenu(id);
        });
        const typeId = menus[0].typeId;
        for (let i = 0; i < menus.length; i++) {
            if (menus[i].typeId !== typeId) {
                throw new Error('같은 종류의 메뉴끼리만 비교할 수 있어요');
            }
        }
        const type = Cafes.getMenuTypes().find(function (item) {
            return item.id === typeId;
        });
        // 가짜 비율: 각 메뉴의 topTag만 그 비율, 나머지 버튼은 0
        const rows = menus.map(function (menu) {
            const tagPercents = {};
            for (let i = 0; i < type.tags.length; i++) {
                const isTop = menu.topTag !== null && menu.topTag.tagId === type.tags[i].id;
                tagPercents[type.tags[i].id] = isTop ? menu.topTag.percent : 0;
            }
            return { menu: menu, tagPercents: tagPercents };
        });
        // best: 항목별 1위 (가격은 낮을수록). 값이 모두 같거나 모두 null이면 뺌
        const best = {};
        const keys = ['price', 'rating', 'reviewCount'].concat(type.tags.map(function (tag) {
            return tag.id;
        }));
        for (let k = 0; k < keys.length; k++) {
            const values = rows.map(function (row) {
                return Compare.valueOf(row, keys[k]);
            });
            let bestIndex = -1;
            let allSame = true;
            for (let i = 0; i < values.length; i++) {
                if (values[i] !== values[0]) {
                    allSame = false;
                }
                if (values[i] !== null && (bestIndex === -1 || values[i] > values[bestIndex])) {
                    bestIndex = i;
                }
            }
            if (!allSame && bestIndex !== -1) {
                best[keys[k]] = rows[bestIndex].menu.id;
            }
        }
        return { typeId: type.id, typeName: type.name, tags: type.tags, rows: rows, best: best };
    },

    // 역할: 조건 추천 / 입력: { typeId, budget, tagIds, area }
    // 출력: [{ rank, menu, score, reason }] 최대 3개 (점수·이유는 고정값)
    // 오류: '메뉴 타입을 골라 주세요', '원하는 맛은 3개까지 고를 수 있어요'
    recommend: function (condition) {
        if (typeof condition.typeId !== 'number') {
            throw new Error('메뉴 타입을 골라 주세요');
        }
        if (condition.tagIds.length > 3) {
            throw new Error('원하는 맛은 3개까지 고를 수 있어요');
        }
        const scores = [0.83, 0.71, 0.62];
        const menus = Cafes.searchMenus('', condition.typeId, 'rating').filter(function (menu) {
            const inBudget = condition.budget === null || menu.price <= condition.budget;
            const inArea = condition.area === 'all' || menu.area === condition.area;
            return inBudget && inArea;
        }).slice(0, 3);
        return menus.map(function (menu, i) {
            let reason = menu.avgRating === null
                ? '아직 리뷰 없음'
                : '평점 ' + menu.avgRating.toFixed(1) + ' (리뷰 ' + menu.reviewCount + '개)';
            if (condition.budget !== null) {
                reason = '예산 ' + condition.budget.toLocaleString() + '원 이하 · ' + reason;
            }
            return { rank: i + 1, menu: menu, score: scores[i], reason: reason };
        });
    }
};
