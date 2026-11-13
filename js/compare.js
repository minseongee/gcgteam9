// C. 비교·추천: Compare (같은 타입 비교표, 조건 추천, 비교함)
// 비교함은 DataStore의 compareBox 키에 메뉴 id 배열로 저장합니다(최대 4개, 모두 같은 타입).
// 메뉴 정보는 Cafes.getMenu, 평가 버튼 비율은 Reviews.getReviewSummary로 얻습니다.

const Compare = {
    // ───────── 추천 점수 상수 (interface.md 4절, 테스트 후 바꾸면 문서를 먼저 고침) ─────────
    // '파일 하나는 전역 객체 하나만' 규칙 때문에 따로 const를 만들지 않고 Compare 안에 둡니다.

    // 점수에서 보정 평점이 차지하는 비중
    WEIGHT_RATING: 0.6,
    // 점수에서 선호 일치율이 차지하는 비중
    WEIGHT_PREFERENCE: 0.4,
    // 보정 평점 상수 C: 리뷰가 적은 메뉴의 평점을 타입 평균 쪽으로 끌어당기는 정도
    PRIOR_COUNT: 5,
    // 같은 타입에 리뷰가 하나도 없을 때 쓰는 타입 평균 평점
    DEFAULT_MEAN: 3,

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
    },

    // ───────── 추천 (interface.md 4절 '추천 점수 계산') ─────────

    // 역할: [1단계] 조건에 맞는 메뉴만 남긴다
    //       타입이 condition.typeId와 같고,
    //       budget이 있으면 가격 ≤ budget,
    //       area가 'all'이 아니면 카페 위치 = area
    // 입력: condition - recommend에 들어온 조건 (검사를 마친 값)
    // 출력: MenuItem[] (Cafes.searchMenus의 평점순)
    // 오류: 없음
    filterMenus: function (condition) {
        const menus = Cafes.searchMenus('', condition.typeId, 'rating');
        const result = [];
        for (let i = 0; i < menus.length; i++) {
            if (condition.budget !== null && menus[i].price > condition.budget) {
                continue;
            }
            if (condition.area !== 'all' && menus[i].area !== condition.area) {
                continue;
            }
            result.push(menus[i]);
        }
        return result;
    },

    // 역할: 메뉴 하나의 별점 합을 구한다
    // 입력: summary - Reviews.getReviewSummary의 결과
    // 출력: 별점 합 (리뷰가 없으면 0)
    // 오류: 없음
    sumRatings: function (summary) {
        let sum = 0;
        for (let i = 0; i < summary.reviews.length; i++) {
            sum += summary.reviews[i].rating;
        }
        return sum;
    },

    // 역할: [2단계 준비] 타입 평균 평점 m을 구한다
    //       m = (같은 타입 모든 리뷰의 별점 합) ÷ (같은 타입 모든 리뷰 수)
    //       리뷰가 하나도 없으면 m = DEFAULT_MEAN(3)
    //       (예산·위치로 걸러 내기 전, 그 타입 전체 메뉴의 리뷰로 계산)
    // 입력: typeId - 메뉴 타입 id
    // 출력: m (숫자)
    // 오류: 없음
    calcTypeMean: function (typeId) {
        const menus = Cafes.searchMenus('', typeId, 'rating');
        let sum = 0;
        let count = 0;
        for (let i = 0; i < menus.length; i++) {
            const summary = Reviews.getReviewSummary(menus[i].id);
            sum += Compare.sumRatings(summary);
            count += summary.reviews.length;
        }
        if (count === 0) {
            return Compare.DEFAULT_MEAN;
        }
        return sum / count;
    },

    // 역할: [2단계] 보정 평점을 구한다
    //       보정 평점 = (C × m + 평점 합) ÷ (C + n)
    //       C = PRIOR_COUNT(5), m = 타입 평균 평점, n = 그 메뉴의 리뷰 수
    //       리뷰가 적을수록 m에 가깝고, 많을수록 그 메뉴의 실제 평균에 가까워진다
    // 입력: ratingSum - 그 메뉴의 별점 합, n - 그 메뉴의 리뷰 수, m - 타입 평균 평점
    // 출력: 보정 평점 (1~5 사이 숫자)
    // 오류: 없음
    calcAdjustedRating: function (ratingSum, n, m) {
        return (Compare.PRIOR_COUNT * m + ratingSum) / (Compare.PRIOR_COUNT + n);
    },

    // 역할: [3단계] 선호 일치율을 구한다
    //       선호 일치율 = (고른 버튼들의 percent 합 ÷ 고른 버튼 수) ÷ 100
    //       버튼을 안 골랐으면 0
    // 입력: tagStats - Reviews.getReviewSummary의 tagStats, tagIds - 고른 버튼 id 배열
    // 출력: 0~1 사이 숫자
    // 오류: 없음
    calcPreference: function (tagStats, tagIds) {
        if (tagIds.length === 0) {
            return 0;
        }
        let sum = 0;
        for (let i = 0; i < tagStats.length; i++) {
            if (tagIds.indexOf(tagStats[i].tagId) !== -1) {
                sum += tagStats[i].percent;
            }
        }
        return sum / tagIds.length / 100;
    },

    // 역할: [4단계] 점수를 구한다
    //       버튼을 골랐으면  점수 = WEIGHT_RATING(0.6) × (보정 평점 ÷ 5) + WEIGHT_PREFERENCE(0.4) × 선호 일치율
    //       버튼을 안 골랐으면 점수 = 보정 평점 ÷ 5
    // 입력: adjusted - 보정 평점, preference - 선호 일치율, hasTags - 버튼을 골랐는지
    // 출력: 0~1 사이 숫자 (반올림 전)
    // 오류: 없음
    calcScore: function (adjusted, preference, hasTags) {
        if (!hasTags) {
            return adjusted / 5;
        }
        return Compare.WEIGHT_RATING * (adjusted / 5) + Compare.WEIGHT_PREFERENCE * preference;
    },

    // 역할: 추천 이유 문구를 만든다 (계산에 쓴 값을 ' · '로 이어 붙임)
    //       예: "예산 4,000원 이하 · 평점 4.6 (리뷰 12개) · '고소해요' 75%"
    //       예산 부분은 budget이 있을 때만, 버튼 부분은 고른 버튼 중 비율이 가장 높은 것 하나만
    //       (비율이 같으면 먼저 고른 버튼), 리뷰가 없으면 '리뷰 없음'
    // 입력: condition - 검사를 마친 조건, menu - MenuItem, tagStats - 그 메뉴의 tagStats
    // 출력: 문자열
    // 오류: 없음
    makeReason: function (condition, menu, tagStats) {
        const parts = [];
        if (condition.budget !== null) {
            parts.push('예산 ' + condition.budget.toLocaleString('ko-KR') + '원 이하');
        }
        if (menu.avgRating === null) {
            parts.push('리뷰 없음');
        } else {
            parts.push('평점 ' + menu.avgRating.toFixed(1) + ' (리뷰 ' + menu.reviewCount + '개)');
        }
        let bestTag = null;
        for (let i = 0; i < condition.tagIds.length; i++) {
            for (let j = 0; j < tagStats.length; j++) {
                if (tagStats[j].tagId === condition.tagIds[i]) {
                    if (bestTag === null || tagStats[j].percent > bestTag.percent) {
                        bestTag = tagStats[j];
                    }
                }
            }
        }
        if (bestTag !== null) {
            parts.push('\'' + bestTag.label + '\' ' + bestTag.percent + '%');
        }
        return parts.join(' · ');
    },

    // 역할: 조건에 맞는 메뉴를 점수 순으로 최대 3개 추천한다
    // 입력: condition - { typeId: 숫자(필수), budget: 숫자 또는 null,
    //                    tagIds: 숫자 배열(0~3개, 그 타입 버튼 + 공통 버튼), area: 'all' | 'campus' | 'nearby' }
    //       (budget이 없으면 null, tagIds가 없으면 [], area가 없으면 'all'로 봄. 같은 버튼 id가 겹치면 하나로 셈)
    // 출력: [{ rank, menu: MenuItem, score, reason }] 점수 높은 순 최대 3개 (점수는 소수 둘째 자리까지)
    //       점수가 같으면 평점순(Cafes.searchMenus 'rating') 앞의 메뉴가 먼저. 맞는 메뉴가 없으면 []
    // 오류: '메뉴 타입을 골라 주세요' / '원하는 맛은 3개까지 고를 수 있어요'
    //       '이 메뉴에서 고를 수 없는 평가 버튼입니다' / '가격은 0보다 큰 숫자로 써 주세요'(예산)
    recommend: function (condition) {
        let tags = null;
        const types = Cafes.getMenuTypes();
        for (let i = 0; i < types.length; i++) {
            if (types[i].id === condition.typeId) {
                tags = types[i].tags;
            }
        }
        if (tags === null) {
            throw new Error('메뉴 타입을 골라 주세요');
        }

        const tagIds = [];
        const inputTagIds = Array.isArray(condition.tagIds) ? condition.tagIds : [];
        for (let i = 0; i < inputTagIds.length; i++) {
            if (tagIds.indexOf(inputTagIds[i]) === -1) {
                tagIds.push(inputTagIds[i]);
            }
        }
        if (tagIds.length > 3) {
            throw new Error('원하는 맛은 3개까지 고를 수 있어요');
        }
        for (let i = 0; i < tagIds.length; i++) {
            let allowed = false;
            for (let j = 0; j < tags.length; j++) {
                if (tags[j].id === tagIds[i]) {
                    allowed = true;
                }
            }
            if (!allowed) {
                throw new Error('이 메뉴에서 고를 수 없는 평가 버튼입니다');
            }
        }

        let budget = null;
        if (condition.budget !== null && condition.budget !== undefined) {
            if (typeof condition.budget !== 'number' || !(condition.budget > 0)) {
                throw new Error('가격은 0보다 큰 숫자로 써 주세요');
            }
            budget = condition.budget;
        }
        const area = condition.area === undefined ? 'all' : condition.area;
        const clean = { typeId: condition.typeId, budget: budget, tagIds: tagIds, area: area };

        const m = Compare.calcTypeMean(clean.typeId);
        const menus = Compare.filterMenus(clean);
        const scored = [];
        for (let i = 0; i < menus.length; i++) {
            const summary = Reviews.getReviewSummary(menus[i].id);
            const adjusted = Compare.calcAdjustedRating(Compare.sumRatings(summary), summary.reviews.length, m);
            const preference = Compare.calcPreference(summary.tagStats, clean.tagIds);
            scored.push({
                menu: menus[i],
                rawScore: Compare.calcScore(adjusted, preference, clean.tagIds.length > 0),
                reason: Compare.makeReason(clean, menus[i], summary.tagStats)
            });
        }
        scored.sort(function (a, b) {
            return b.rawScore - a.rawScore;
        });

        const result = [];
        for (let i = 0; i < scored.length && i < 3; i++) {
            result.push({
                rank: i + 1,
                menu: scored[i].menu,
                score: Math.round(scored[i].rawScore * 100) / 100,
                reason: scored[i].reason
            });
        }
        return result;
    }
};
