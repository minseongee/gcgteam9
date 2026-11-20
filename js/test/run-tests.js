// 기능 테스트 자동 실행: docs/test-cases.md의 케이스를 같은 번호로 차례로 돌려 통과/실패를 표로 찍는다
// 쓰는 법: 아무 화면(index.html 등)을 Chrome으로 열고, F12 콘솔에 이 파일 내용을 통째로 붙여 넣고 Enter
// 주의: 케이스마다 DataStore.reset()을 불러 시작하고, 끝나면 한 번 더 reset 한다.
//       그래서 직접 쓴 리뷰·회원가입·로그인 상태가 모두 처음(data.js)으로 돌아간다. 다 돌린 뒤 화면은 새로고침한다.
// 기대값은 이 파일 안의 테스트 전용 데이터(TEST_SEED_DATA, 처음 만든 예시 데이터)를 기준으로 계산했다.
// 테스트하는 동안만 SEED_DATA를 테스트 전용 데이터로 바꿔 끼우고, 끝나면 data.js의 실제 데이터로 되돌린다.
// 그래서 data.js를 실제 조사 값으로 바꿔도 기대값을 고칠 필요가 없다.
// 전역 이름을 만들지 않도록 파일 전체를 (function () { … })();로 감싼다.

(function () {
    if (typeof DataStore === 'undefined' || typeof Cafes === 'undefined') {
        console.error('index.html 같은 화면을 연 상태에서 콘솔에 붙여 넣어 주세요. (기능 모듈이 불러와져 있어야 합니다)');
        return;
    }

    const cases = [];

    // 역할: 케이스 하나를 목록에 넣는다
    // 입력: no - test-cases.md의 번호, fn - 테스트하는 함수 이름, run - 케이스 내용(실패하면 오류를 던지는 함수)
    // 출력: 없음
    // 오류: 없음
    function add(no, fn, run) {
        cases.push({ no: no, fn: fn, run: run });
    }

    // 역할: 두 값이 같은지(JSON 글자로 비교) 확인한다
    // 입력: actual - 실제 값, expected - 기대 값, what - 무엇을 비교하는지(실패 문구용)
    // 출력: 없음
    // 오류: 다르면 '무엇: 기대 … / 실제 …'
    function same(actual, expected, what) {
        const a = JSON.stringify(actual);
        const e = JSON.stringify(expected);
        if (a !== e) {
            throw new Error(what + ': 기대 ' + e + ' / 실제 ' + a);
        }
    }

    // 역할: 조건이 참인지 확인한다
    // 입력: condition - 참이어야 하는 값, what - 실패 문구
    // 출력: 없음
    // 오류: 거짓이면 what
    function check(condition, what) {
        if (!condition) {
            throw new Error(what);
        }
    }

    // 역할: 함수를 불렀을 때 정해진 오류 문구가 나오는지 확인한다
    // 입력: action - 부를 함수, message - 기대하는 오류 문구 (null이면 문구는 따지지 않고 오류만 나면 됨)
    // 출력: 없음
    // 오류: 오류가 안 나거나 문구가 다르면 그 내용을 담은 오류
    function throws(action, message) {
        let actual = null;
        try {
            action();
        } catch (e) {
            actual = e.message;
        }
        if (actual === null) {
            throw new Error('오류가 나지 않음 (기대: ' + (message === null ? '오류' : "'" + message + "'") + ')');
        }
        if (message !== null && actual !== message) {
            throw new Error("다른 오류: '" + actual + "' (기대: '" + message + "')");
        }
    }

    // 역할: 목록에서 id만 뽑는다
    // 입력: list - id가 있는 항목 배열
    // 출력: id 배열
    // 오류: 없음
    function ids(list) {
        return list.map(function (item) {
            return item.id;
        });
    }

    // 역할: 평가 집계(tagStats)에서 버튼 하나의 percent를 찾는다
    // 입력: tagStats - TagStat 배열, tagId - 버튼 id
    // 출력: percent, 없으면 undefined
    // 오류: 없음
    function percentOf(tagStats, tagId) {
        for (let i = 0; i < tagStats.length; i++) {
            if (tagStats[i].tagId === tagId) {
                return tagStats[i].percent;
            }
        }
        return undefined;
    }

    // 역할: data.js의 계정으로 로그인한다 (예시 계정 비밀번호는 모두 '1234')
    // 입력: loginId - 'ownera', 'sample1' 등
    // 출력: 없음
    // 오류: Account.login의 오류
    function loginAs(loginId) {
        Account.login(loginId, '1234');
    }

    // 역할: 지도 기준점과 카페 1 좌표를 잠시 바꿔 action을 실행하고, 기준점은 원래대로 돌려놓는다
    // 입력: cafe1 - 카페 1의 { lat, lng }, action - 실행할 함수
    // 출력: 없음
    // 오류: action의 오류
    function withMap(cafe1, action) {
        const saved = JSON.stringify(MAP_BOUNDS);
        MAP_BOUNDS.topLeft = { lat: 36, lng: 128 };
        MAP_BOUNDS.bottomRight = { lat: 35, lng: 129 };
        const cafes = DataStore.load('cafes');
        cafes[0].lat = cafe1.lat;
        cafes[0].lng = cafe1.lng;
        DataStore.save('cafes', cafes);
        try {
            action();
        } finally {
            const old = JSON.parse(saved);
            MAP_BOUNDS.topLeft = old.topLeft;
            MAP_BOUNDS.bottomRight = old.bottomRight;
        }
    }

    // ───────── A. Cafes ─────────

    add(1, 'Cafes.searchCafes', function () {
        same(ids(Cafes.searchCafes('', 'all')), [5, 1, 4, 2, 3], '카페 순서');
    });
    add(2, 'Cafes.searchCafes', function () {
        same(ids(Cafes.searchCafes('', 'campus')), [1, 2, 3], '교내 카페');
    });
    add(3, 'Cafes.searchCafes', function () {
        same(ids(Cafes.searchCafes('카페 A', 'all')), [1], '이름 검색');
    });
    add(4, 'Cafes.searchCafes', function () {
        same(Cafes.searchCafes('없는카페', 'all'), [], '결과');
    });
    add(5, 'Cafes.getCafe', function () {
        const detail = Cafes.getCafe(1);
        same(detail.cafe.name, '카페 A', '이름');
        same(detail.cafe.avgRating, 4.3, '평점');
        same(detail.cafe.reviewCount, 8, '리뷰 수');
        same(detail.cafe.menuCount, 5, '메뉴 수');
        same(detail.menusByType.map(function (group) {
            return group.typeId;
        }), [1, 2, 4, 5], '타입 순서');
    });
    add(6, 'Cafes.getCafe', function () {
        throws(function () {
            Cafes.getCafe(999);
        }, '카페를 찾을 수 없습니다');
    });
    add(7, 'Cafes.searchMenus', function () {
        const list = Cafes.searchMenus('', 1, 'rating');
        same(list.length, 9, '커피 메뉴 수');
        check(list.every(function (menu) {
            return menu.typeId === 1 && menu.typeName === '커피';
        }), '커피가 아닌 메뉴가 섞임');
    });
    add(8, 'Cafes.searchMenus', function () {
        same(ids(Cafes.searchMenus('', 3, 'rating')), [9, 14, 19, 24], '차 메뉴');
    });
    add(9, 'Cafes.searchMenus', function () {
        same(ids(Cafes.searchMenus('아메리카노', null, 'rating')), [16, 1, 12, 6], '아메리카노 검색');
    });
    add(10, 'Cafes.searchMenus', function () {
        // 메뉴 12(평점 4.0, 리뷰 1개)에 별점 4 리뷰를 3개 더 달아 리뷰 4개로 만든다. 메뉴 1은 평점 4.0, 리뷰 3개
        const writers = ['sample1', 'sample3', 'ownera'];
        for (let i = 0; i < writers.length; i++) {
            loginAs(writers[i]);
            Reviews.saveReview(12, 4, '', []);
            Account.logout();
        }
        const list = Cafes.searchMenus('', 1, 'rating');
        const order = ids(list);
        same(order[0], 22, '1위');
        check(order.indexOf(12) < order.indexOf(1), '평점 4.0끼리는 리뷰 4개인 12번이 리뷰 3개인 1번보다 앞이어야 함');
        check(list.slice(0, 6).every(function (menu) {
            return menu.avgRating !== null;
        }) && list.slice(6).every(function (menu) {
            return menu.avgRating === null;
        }), '리뷰 없는 메뉴 3개가 맨 뒤에 있어야 함');
    });
    add(11, 'Cafes.searchMenus', function () {
        const list = Cafes.searchMenus('', 1, 'price');
        same(list[0].price, 2000, '첫 가격');
        same(list[list.length - 1].id, 22, '가장 비싼 메뉴');
        for (let i = 1; i < list.length; i++) {
            check(list[i - 1].price <= list[i].price, (i + 1) + '번째에서 가격 순서가 어긋남');
        }
    });
    add(12, 'Cafes.searchMenus', function () {
        const list = Cafes.searchMenus('', null, 'reviews');
        same(list.length, 25, '전체 메뉴 수');
        same(list[0].id, 1, '리뷰 가장 많은 메뉴');
        for (let i = 1; i < list.length; i++) {
            check(list[i - 1].reviewCount >= list[i].reviewCount, (i + 1) + '번째에서 리뷰 수 순서가 어긋남');
        }
    });
    add(13, 'Cafes.searchMenus', function () {
        same(Cafes.searchMenus('없는메뉴', null, 'rating'), [], '결과');
    });
    add(14, 'Cafes.getMenusByType', function () {
        const groups = Cafes.getMenusByType();
        same(groups.map(function (group) {
            return group.typeId;
        }), [1, 2, 3, 4, 5], '타입 순서');
        same(groups[0].menus[0].id, 22, '커피 1위');
    });
    add(15, 'Cafes.getMenusByType', function () {
        const coffee = Cafes.getMenusByType()[0].menus;
        same(coffee[coffee.length - 1].avgRating, null, '커피 묶음 마지막 메뉴 평점');
    });
    add(16, 'Cafes.getMenu', function () {
        const menu = Cafes.getMenu(2);
        same([menu.name, menu.cafeName, menu.area, menu.typeName, menu.price, menu.avgRating, menu.reviewCount],
            ['카페라떼', '카페 A', 'campus', '커피', 2500, 4.5, 2], '메뉴 정보');
        same(menu.topTag, { tagId: 2, label: '고소해요', percent: 100 }, 'topTag');
    });
    add(17, 'Cafes.getMenu', function () {
        throws(function () {
            Cafes.getMenu(999);
        }, '메뉴를 찾을 수 없습니다');
    });
    add(18, 'Cafes.getMenu', function () {
        const menu = Cafes.getMenu(1);
        menu.price = 99999;
        same(Cafes.getMenu(1).price, 2000, '다시 읽은 가격');
    });
    add(19, 'Cafes.getMenu', function () {
        const menu = Cafes.getMenu(7);
        same([menu.avgRating, menu.reviewCount, menu.topTag], [null, 0, null], '리뷰 없는 메뉴');
    });
    add(20, 'Cafes.getMenuTypes', function () {
        const types = Cafes.getMenuTypes();
        same(types.length, 5, '타입 수');
        same(ids(types[0].tags), [1, 2, 3, 4, 5, 17, 18], '커피 버튼');
        same(types[0].tags[2], { id: 3, label: '진해요', oppositeId: 4 }, '진해요 버튼');
    });
    add(21, 'Cafes.getMenuTypes', function () {
        const dessert = Cafes.getMenuTypes()[4];
        same(ids(dessert.tags), [15, 16, 17, 18], '디저트 버튼');
        same([dessert.tags[2].oppositeId, dessert.tags[3].oppositeId], [null, null], '공통 버튼 oppositeId');
    });
    add(22, 'Cafes.getMapPins', function () {
        withMap({ lat: 35.5, lng: 128.5 }, function () {
            same(Cafes.getMapPins(), [{ cafeId: 1, name: '카페 A', area: 'campus', x: 50, y: 50 }], '핀');
        });
    });
    add(23, 'Cafes.getMapPins', function () {
        withMap({ lat: 37, lng: 128.5 }, function () {
            same(Cafes.getMapPins(), [], '지도 밖 핀');
        });
    });
    add(24, 'Cafes.getMapLinks', function () {
        same(Cafes.getMapLinks(1), {
            view: 'https://map.kakao.com/link/map/%EC%B9%B4%ED%8E%98%20A,0,0',
            route: 'https://map.kakao.com/link/to/%EC%B9%B4%ED%8E%98%20A,0,0'
        }, '링크');
    });
    add(25, 'Cafes.getMapLinks', function () {
        throws(function () {
            Cafes.getMapLinks(999);
        }, '카페를 찾을 수 없습니다');
    });

    // ───────── B. Reviews ─────────

    add(26, 'Reviews.getReviewSummary', function () {
        const summary = Reviews.getReviewSummary(1);
        same([summary.menuId, summary.avgRating, summary.reviewCount], [1, 4, 3], '평점·리뷰 수');
        same(summary.tagStats.length, 7, '버튼 수');
        for (let i = 1; i < summary.tagStats.length; i++) {
            check(summary.tagStats[i - 1].percent >= summary.tagStats[i].percent, 'tagStats가 percent 높은 순이 아님');
        }
        same([percentOf(summary.tagStats, 2), percentOf(summary.tagStats, 18), percentOf(summary.tagStats, 4),
            percentOf(summary.tagStats, 1)], [67, 67, 33, 0], '고소해요·가성비·연해요·산미 %');
        same(ids(summary.reviews), [3, 2, 1], '리뷰 최신순');
        same([summary.reviews[0].nickname, summary.reviews[0].isSample], ['예시회원3', true], '첫 리뷰');
    });
    add(27, 'Reviews.getReviewSummary', function () {
        const summary = Reviews.getReviewSummary(7);
        same([summary.avgRating, summary.reviewCount, summary.reviews], [null, 0, []], '리뷰 없는 메뉴');
        same(summary.tagStats.length, 7, '버튼 수');
        check(summary.tagStats.every(function (stat) {
            return stat.count === 0 && stat.percent === 0;
        }), '0%가 아닌 버튼이 있음');
    });
    add(28, 'Reviews.getReviewSummary', function () {
        throws(function () {
            Reviews.getReviewSummary(999);
        }, '메뉴를 찾을 수 없습니다');
    });
    add(29, 'Reviews.getMyReview', function () {
        loginAs('sample1');
        const mine = Reviews.getMyReview(1);
        same([mine.rating, mine.comment, ids(mine.tags), mine.isSample], [4, '고소하고 가격이 착해요', [2, 18], true], '내 리뷰');
    });
    add(30, 'Reviews.getMyReview', function () {
        same(Reviews.getMyReview(1), null, '로그아웃 상태');
    });
    add(31, 'Reviews.saveReview', function () {
        loginAs('sample1');
        const saved = Reviews.saveReview(7, 5, '달달해요', [4, 17]);
        same([saved.rating, saved.comment, ids(saved.tags), saved.isSample], [5, '달달해요', [4, 17], false], '저장된 리뷰');
        same(Reviews.getReviewSummary(7).reviewCount, 1, '메뉴 7 리뷰 수');
    });
    add(32, 'Reviews.saveReview', function () {
        loginAs('sample1');
        Reviews.saveReview(7, 4, '', [3]);
        Account.logout();
        loginAs('sample2');
        Reviews.saveReview(7, 2, '', [3, 17]);
        const summary = Reviews.getReviewSummary(7);
        same([summary.avgRating, summary.reviewCount], [3, 2], '평점·리뷰 수');
        same([summary.tagStats[0].tagId, summary.tagStats[0].percent], [3, 100], '1위 버튼');
        same(percentOf(summary.tagStats, 17), 50, '양이 많아요 %');
    });
    add(33, 'Reviews.saveReview', function () {
        loginAs('sample1');
        Reviews.saveReview(1, 2, '별로', [4]);
        const summary = Reviews.getReviewSummary(1);
        same([summary.reviewCount, summary.avgRating], [3, 3.3], '리뷰 수·평점');
        same([Reviews.getMyReview(1).rating, Reviews.getMyReview(1).isSample], [2, false], '고친 리뷰');
    });
    add(34, 'Reviews.saveReview', function () {
        throws(function () {
            Reviews.saveReview(1, 5, '', []);
        }, '로그인이 필요합니다');
    });
    add(35, 'Reviews.saveReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.saveReview(7, 0, '', []);
        }, '별점은 1~5 사이로 골라 주세요');
    });
    add(36, 'Reviews.saveReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.saveReview(7, 6, '', []);
        }, '별점은 1~5 사이로 골라 주세요');
    });
    add(37, 'Reviews.saveReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.saveReview(7, 5, '가'.repeat(51), []);
        }, '한줄평은 50자 이내로 써 주세요');
    });
    add(38, 'Reviews.saveReview', function () {
        loginAs('sample1');
        same(Reviews.saveReview(7, 5, '가'.repeat(50), []).comment.length, 50, '저장된 한줄평 길이');
    });
    add(39, 'Reviews.saveReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.saveReview(7, 5, '', [6]);
        }, '이 메뉴에서 고를 수 없는 평가 버튼입니다');
    });
    add(40, 'Reviews.saveReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.saveReview(7, 5, '', [3, 4]);
        }, '서로 반대되는 평가 버튼은 함께 고를 수 없어요');
    });
    add(41, 'Reviews.saveReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.saveReview(999, 5, '', []);
        }, '메뉴를 찾을 수 없습니다');
    });
    add(42, 'Reviews.deleteReview', function () {
        loginAs('sample1');
        same(Reviews.deleteReview(1), undefined, '반환값');
        same(Reviews.getReviewSummary(1).reviewCount, 2, '메뉴 1 리뷰 수');
        same(Reviews.getMyReview(1), null, '내 리뷰');
    });
    add(43, 'Reviews.deleteReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.deleteReview(2);
        }, '내가 쓴 리뷰만 삭제할 수 있습니다');
    });
    add(44, 'Reviews.deleteReview', function () {
        loginAs('sample1');
        throws(function () {
            Reviews.deleteReview(999);
        }, '리뷰를 찾을 수 없습니다');
    });
    add(45, 'Reviews.deleteReview', function () {
        throws(function () {
            Reviews.deleteReview(1);
        }, '로그인이 필요합니다');
    });
    add(46, 'Reviews.getMyReviews', function () {
        loginAs('sample1');
        const items = Reviews.getMyReviews();
        same(items.length, 7, '내 리뷰 수');
        same([items[0].review.id, items[0].menu.id, items[0].menu.name], [19, 5, '치즈케이크'], '가장 최근 리뷰');
    });
    add(47, 'Reviews.getMyReviews', function () {
        throws(function () {
            Reviews.getMyReviews();
        }, '로그인이 필요합니다');
    });

    // ───────── C. Compare ─────────

    add(48, 'Compare.compareMenus', function () {
        const result = Compare.compareMenus([1, 2, 6]);
        same([result.typeId, result.typeName], [1, '커피'], '타입');
        same(ids(result.tags), [1, 2, 3, 4, 5, 17, 18], '비교 항목 버튼');
        same(result.rows.map(function (row) {
            return row.menu.id;
        }), [1, 2, 6], '열 순서');
        same(result.rows[0].tagPercents[2], 67, '1번 고소해요 %');
        same([result.best.price, result.best.rating, result.best.reviewCount, result.best[2]], [1, 2, 1, 2], 'best');
    });
    add(49, 'Compare.compareMenus', function () {
        check(!(5 in Compare.compareMenus([1, 2, 6]).best), "모두 0%인 '쓴맛이 강해요'(5)가 best에 들어 있음");
    });
    add(50, 'Compare.compareMenus', function () {
        const best = Compare.compareMenus([7, 13]).best;
        check(!('rating' in best), '평점이 모두 null인데 best.rating이 있음');
        check(!('reviewCount' in best), '리뷰 수가 모두 0인데 best.reviewCount가 있음');
        same(best.price, 13, 'best.price');
    });
    add(51, 'Compare.compareMenus', function () {
        throws(function () {
            Compare.compareMenus([1]);
        }, '2~4개 메뉴를 골라 주세요');
    });
    add(52, 'Compare.compareMenus', function () {
        throws(function () {
            Compare.compareMenus([1, 2, 6, 12, 16]);
        }, '2~4개 메뉴를 골라 주세요');
    });
    add(53, 'Compare.compareMenus', function () {
        throws(function () {
            Compare.compareMenus([1, 3]);
        }, '같은 종류의 메뉴끼리만 비교할 수 있어요');
    });
    add(54, 'Compare.compareMenus', function () {
        throws(function () {
            Compare.compareMenus([1, 999]);
        }, '메뉴를 찾을 수 없습니다');
    });
    add(55, 'Compare.recommend', function () {
        const results = Compare.recommend({ typeId: 1, budget: null, tagIds: [], area: 'all' });
        same(results.map(function (item) {
            return item.rank;
        }), [1, 2, 3], '순위');
        same([results[0].menu.id, results[0].score], [22, 0.86], '1위');
        same(results[0].reason, '평점 5.0 (리뷰 1개)', '1위 이유');
        for (let i = 1; i < results.length; i++) {
            check(results[i - 1].score >= results[i].score, '점수 높은 순이 아님');
        }
    });
    add(56, 'Compare.recommend', function () {
        const results = Compare.recommend({ typeId: 1, budget: 2500, tagIds: [2], area: 'campus' });
        same(results.map(function (item) {
            return item.menu.id;
        }), [2, 1, 12], '추천 메뉴');
        same(results[0].score, 0.91, '1위 점수');
        same(results[0].reason, "예산 2,500원 이하 · 평점 4.5 (리뷰 2개) · '고소해요' 100%", '1위 이유');
    });
    add(57, 'Compare.recommend', function () {
        const results = Compare.recommend({ typeId: 1, budget: null, tagIds: [], area: 'nearby' });
        same(results.length, 3, '추천 수');
        check(results.every(function (item) {
            return item.menu.area === 'nearby';
        }), '근처가 아닌 카페 메뉴가 섞임');
    });
    add(58, 'Compare.recommend', function () {
        const results = Compare.recommend({ typeId: 5, budget: 2500, tagIds: [], area: 'all' });
        same(results.length, 1, '추천 수');
        same([results[0].menu.id, results[0].reason], [11, '예산 2,500원 이하 · 아직 리뷰 없음'], '추천 메뉴·이유');
    });
    add(59, 'Compare.recommend', function () {
        same(Compare.recommend({ typeId: 1, budget: 1000, tagIds: [], area: 'all' }), [], '결과');
    });
    add(60, 'Compare.recommend', function () {
        throws(function () {
            Compare.recommend({ typeId: null, budget: null, tagIds: [], area: 'all' });
        }, '메뉴 타입을 골라 주세요');
    });
    add(61, 'Compare.recommend', function () {
        throws(function () {
            Compare.recommend({ typeId: 1, budget: null, tagIds: [1, 2, 3, 5], area: 'all' });
        }, '원하는 맛은 3개까지 고를 수 있어요');
    });
    add(62, 'Compare.recommend', function () {
        throws(function () {
            Compare.recommend({ typeId: 1, budget: null, tagIds: [3, 4], area: 'all' });
        }, '서로 반대되는 평가 버튼은 함께 고를 수 없어요');
    });
    add(63, 'Compare.getBox', function () {
        Compare.addToBox(1);
        Compare.addToBox(2);
        same(Compare.getBox(), [1, 2], '비교함');
    });
    add(64, 'Compare.getBox', function () {
        same(Compare.getBox(), [], '처음 비교함');
    });
    add(65, 'Compare.addToBox', function () {
        same(Compare.addToBox(1), [1], '반환값');
    });
    add(66, 'Compare.addToBox', function () {
        Compare.addToBox(1);
        throws(function () {
            Compare.addToBox(3);
        }, '같은 종류의 메뉴끼리만 비교할 수 있어요');
    });
    add(67, 'Compare.addToBox', function () {
        Compare.addToBox(1);
        Compare.addToBox(2);
        Compare.addToBox(6);
        Compare.addToBox(12);
        throws(function () {
            Compare.addToBox(16);
        }, '2~4개 메뉴를 골라 주세요');
    });
    add(68, 'Compare.addToBox', function () {
        throws(function () {
            Compare.addToBox(999);
        }, '메뉴를 찾을 수 없습니다');
    });
    add(69, 'Compare.removeFromBox', function () {
        Compare.addToBox(1);
        Compare.addToBox(2);
        same(Compare.removeFromBox(1), [2], '반환값');
        same(Compare.getBox(), [2], '비교함');
    });
    add(70, 'Compare.removeFromBox', function () {
        Compare.addToBox(1);
        Compare.addToBox(2);
        same(Compare.removeFromBox(999), [1, 2], '반환값');
    });

    // ───────── D. Account ─────────

    add(71, 'Account.signup', function () {
        const user = Account.signup('newbie1', 'abcd', '새내기');
        same(user, { id: 7, loginId: 'newbie1', nickname: '새내기', role: 'member' }, '새 회원(비밀번호 없음)');
        same(Auth.getCurrentUser().id, 7, '자동 로그인');
    });
    add(72, 'Account.signup', function () {
        throws(function () {
            Account.signup('ab', 'abcd', '새내기');
        }, '아이디는 영문·숫자 4~12자로 정해 주세요');
    });
    add(73, 'Account.signup', function () {
        throws(function () {
            Account.signup('new_bie', 'abcd', '새내기');
        }, '아이디는 영문·숫자 4~12자로 정해 주세요');
    });
    add(74, 'Account.signup', function () {
        throws(function () {
            Account.signup('newbie1', '123', '새내기');
        }, '비밀번호는 4자 이상이어야 합니다');
    });
    add(75, 'Account.signup', function () {
        throws(function () {
            Account.signup('newbie1', 'abcd', '');
        }, '닉네임은 1~10자로 정해 주세요');
    });
    add(76, 'Account.signup', function () {
        throws(function () {
            Account.signup('newbie1', 'abcd', '가나다라마바사아자차카');
        }, '닉네임은 1~10자로 정해 주세요');
    });
    add(77, 'Account.signup', function () {
        throws(function () {
            Account.signup('sample1', 'abcd', '새내기');
        }, '이미 사용 중인 아이디입니다');
    });
    add(78, 'Account.login', function () {
        same(Account.login('sample1', '1234'), { id: 4, loginId: 'sample1', nickname: '예시회원1', role: 'member' }, '로그인 회원');
        same(Auth.getCurrentUser().id, 4, '현재 회원');
    });
    add(79, 'Account.login', function () {
        throws(function () {
            Account.login('sample1', '0000');
        }, '아이디 또는 비밀번호가 맞지 않습니다');
    });
    add(80, 'Account.login', function () {
        throws(function () {
            Account.login('nobody', '1234');
        }, '아이디 또는 비밀번호가 맞지 않습니다');
    });
    add(81, 'Account.logout', function () {
        loginAs('sample1');
        Account.logout();
        same(Auth.getCurrentUser(), null, '현재 회원');
    });
    add(82, 'Account.logout', function () {
        Account.logout();
        same(Auth.getCurrentUser(), null, '현재 회원');
    });
    add(83, 'Account.toggleFavorite', function () {
        loginAs('sample1');
        same(Account.toggleFavorite('cafe', 1), true, '처음 누름');
        same(Account.toggleFavorite('cafe', 1), false, '다시 누름');
    });
    add(84, 'Account.toggleFavorite', function () {
        throws(function () {
            Account.toggleFavorite('cafe', 1);
        }, '로그인이 필요합니다');
    });
    add(85, 'Account.toggleFavorite', function () {
        loginAs('sample1');
        throws(function () {
            Account.toggleFavorite('menu', 999);
        }, '메뉴를 찾을 수 없습니다');
    });
    add(86, 'Account.isFavorite', function () {
        loginAs('sample1');
        Account.toggleFavorite('cafe', 1);
        same([Account.isFavorite('cafe', 1), Account.isFavorite('cafe', 2)], [true, false], '카페 1·2');
    });
    add(87, 'Account.isFavorite', function () {
        same(Account.isFavorite('cafe', 1), false, '로그아웃 상태');
    });
    add(88, 'Account.getFavorites', function () {
        loginAs('sample1');
        Account.toggleFavorite('cafe', 1);
        Account.toggleFavorite('menu', 3);
        const favorites = Account.getFavorites();
        same([ids(favorites.cafes), ids(favorites.menus)], [[1], [3]], '즐겨찾기');
        same([favorites.cafes[0].avgRating, favorites.menus[0].cafeName], [4.3, '카페 A'], 'CafeItem·MenuItem 모양');
    });
    add(89, 'Account.getFavorites', function () {
        throws(function () {
            Account.getFavorites();
        }, '로그인이 필요합니다');
    });
    add(90, 'Account.getMyCafe', function () {
        loginAs('ownera');
        const cafe = Account.getMyCafe();
        same([cafe.id, cafe.name], [1, '카페 A'], '내 카페');
    });
    add(91, 'Account.getMyCafe', function () {
        loginAs('sample1');
        throws(function () {
            Account.getMyCafe();
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(92, 'Account.getMyCafe', function () {
        throws(function () {
            Account.getMyCafe();
        }, '로그인이 필요합니다');
    });
    add(93, 'Account.updateCafe', function () {
        loginAs('ownera');
        const cafe = Account.updateCafe(1, { name: '  카페 에이 ', locationText: '', openHours: '' });
        same([cafe.name, cafe.locationText, cafe.openHours], ['카페 에이', '', ''], '고친 카페');
        same(Cafes.getCafe(1).cafe.name, '카페 에이', '다시 읽은 이름');
    });
    add(94, 'Account.updateCafe', function () {
        loginAs('ownera');
        throws(function () {
            Account.updateCafe(1, { name: '   ', locationText: '', openHours: '' });
        }, '카페 이름을 입력해 주세요');
    });
    add(95, 'Account.updateCafe', function () {
        loginAs('ownerb');
        throws(function () {
            Account.updateCafe(1, { name: '카페 에이', locationText: '', openHours: '' });
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(96, 'Account.addMenu', function () {
        loginAs('ownera');
        const menu = Account.addMenu(1, { name: '바닐라라떼', typeId: 1, price: 3000, options: '' });
        same([menu.id, menu.cafeName, menu.typeName, menu.price, menu.avgRating], [26, '카페 A', '커피', 3000, null], '새 메뉴');
        same(Cafes.searchMenus('바닐라라떼', null, 'rating').length, 2, '검색 결과 수');
    });
    add(97, 'Account.addMenu', function () {
        loginAs('ownera');
        throws(function () {
            Account.addMenu(1, { name: '', typeId: 1, price: 3000, options: '' });
        }, '메뉴 이름을 입력해 주세요');
    });
    add(98, 'Account.addMenu', function () {
        loginAs('ownera');
        throws(function () {
            Account.addMenu(1, { name: '바닐라라떼', typeId: 1, price: 0, options: '' });
        }, '가격은 0보다 큰 숫자로 써 주세요');
    });
    add(99, 'Account.addMenu', function () {
        loginAs('sample1');
        throws(function () {
            Account.addMenu(1, { name: '바닐라라떼', typeId: 1, price: 3000, options: '' });
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(100, 'Account.updatePrice', function () {
        loginAs('ownera');
        same(Account.updatePrice(1, 2200).price, 2200, '반환된 가격');
        same(Cafes.getMenu(1).price, 2200, '다시 읽은 가격');
    });
    add(101, 'Account.updatePrice', function () {
        loginAs('ownera');
        throws(function () {
            Account.updatePrice(1, 0);
        }, '가격은 0보다 큰 숫자로 써 주세요');
    });
    add(102, 'Account.updatePrice', function () {
        loginAs('ownera');
        throws(function () {
            Account.updatePrice(1, -500);
        }, '가격은 0보다 큰 숫자로 써 주세요');
    });
    add(103, 'Account.updatePrice', function () {
        loginAs('ownera');
        throws(function () {
            Account.updatePrice(1, 2500.5);
        }, '가격은 0보다 큰 숫자로 써 주세요');
    });
    add(104, 'Account.updatePrice', function () {
        loginAs('ownerb');
        throws(function () {
            Account.updatePrice(1, 2200);
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(105, 'Account.updatePrice', function () {
        loginAs('sample1');
        throws(function () {
            Account.updatePrice(1, 2200);
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(106, 'Account.updatePrice', function () {
        throws(function () {
            Account.updatePrice(1, 2200);
        }, '로그인이 필요합니다');
    });
    add(107, 'Account.updatePrice', function () {
        loginAs('ownera');
        throws(function () {
            Account.updatePrice(999, 1000);
        }, '메뉴를 찾을 수 없습니다');
    });

    // ───────── E. Auth ─────────

    add(108, 'Auth.getCurrentUser', function () {
        loginAs('sample1');
        same(Auth.getCurrentUser(), { id: 4, loginId: 'sample1', nickname: '예시회원1', role: 'member' }, '현재 회원(비밀번호 없음)');
    });
    add(109, 'Auth.getCurrentUser', function () {
        same(Auth.getCurrentUser(), null, '로그아웃 상태');
    });
    add(110, 'Auth.requireLogin', function () {
        loginAs('sample1');
        same(Auth.requireLogin().id, 4, '현재 회원 id');
    });
    add(111, 'Auth.requireLogin', function () {
        throws(function () {
            Auth.requireLogin();
        }, '로그인이 필요합니다');
    });
    add(112, 'Auth.requireOwnerOf', function () {
        loginAs('ownera');
        same(Auth.requireOwnerOf(1).id, 1, '사장 id');
    });
    add(113, 'Auth.requireOwnerOf', function () {
        loginAs('ownera');
        throws(function () {
            Auth.requireOwnerOf(2);
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(114, 'Auth.requireOwnerOf', function () {
        loginAs('ownera');
        throws(function () {
            Auth.requireOwnerOf(999);
        }, '카페를 찾을 수 없습니다');
    });

    // ───────── F. DataStore ─────────

    add(115, 'DataStore.init', function () {
        DataStore.save('menuTypes', []);
        DataStore.init();
        same(DataStore.load('menuTypes').length, 5, '다시 맞춘 메뉴 타입 수');
    });
    add(116, 'DataStore.init', function () {
        DataStore.save('reviews', []);
        DataStore.init();
        same(DataStore.load('reviews'), [], '처음이 아니면 리뷰는 다시 복사하지 않음');
    });
    add(117, 'DataStore.load', function () {
        const menus = DataStore.load('menus');
        same(menus.length, 25, '메뉴 수');
        menus.pop();
        same(DataStore.load('menus').length, 25, '받은 배열을 고친 뒤 다시 읽은 메뉴 수');
    });
    add(118, 'DataStore.load', function () {
        throws(function () {
            DataStore.load('nokey');
        }, null);
    });
    add(119, 'DataStore.save', function () {
        DataStore.save('compareBox', [1, 2]);
        same(DataStore.load('compareBox'), [1, 2], '저장 후 읽은 값');
    });
    add(120, 'DataStore.save', function () {
        throws(function () {
            DataStore.save('nokey', []);
        }, null);
    });
    add(121, 'DataStore.nextId', function () {
        same([DataStore.nextId('menus'), DataStore.nextId('reviews')], [26, 21], '다음 id');
    });
    add(122, 'DataStore.nextId', function () {
        throws(function () {
            DataStore.nextId('nokey');
        }, null);
    });
    add(123, 'DataStore.saveSession / loadSession', function () {
        DataStore.saveSession(4);
        same(DataStore.loadSession(), { userId: 4 }, '세션');
        same(Auth.getCurrentUser().id, 4, '현재 회원 id');
    });
    add(124, 'DataStore.clearSession / loadSession', function () {
        DataStore.saveSession(4);
        DataStore.clearSession();
        same(DataStore.loadSession(), null, '세션');
    });
    add(125, 'DataStore.reset', function () {
        loginAs('sample1');
        Reviews.saveReview(7, 5, '', []);
        DataStore.reset();
        same([DataStore.load('reviews').length, DataStore.loadSession()], [20, null], '리뷰 수·세션');
    });

    // ───────── D. Account (사장 메뉴 이름·타입 변경, 삭제) ─────────

    // 역할: 저장된 리뷰 중 그 메뉴 리뷰의 tagIds를 리뷰 id 순서대로 모은다
    // 입력: menuId - 메뉴 id
    // 출력: tagIds 배열의 배열
    function tagIdsOfMenu(menuId) {
        return DataStore.load('reviews').filter(function (review) {
            return review.menuId === menuId;
        }).map(function (review) {
            return review.tagIds;
        });
    }

    add(126, 'Account.updateMenu', function () {
        loginAs('ownera');
        Compare.addToBox(1);
        Compare.addToBox(2);
        const menu = Account.updateMenu(2, { name: '  카페 라떼 ', typeId: 1 });
        same([menu.name, menu.typeName], ['카페 라떼', '커피'], '고친 메뉴');
        same(Cafes.getMenu(2).name, '카페 라떼', '다시 읽은 이름');
        same(tagIdsOfMenu(2), [[2], [2, 17]], '타입이 같으면 리뷰 버튼 그대로');
        same(Compare.getBox(), [1, 2], '타입이 같으면 비교함 그대로');
    });
    add(127, 'Account.updateMenu', function () {
        loginAs('ownera');
        Compare.addToBox(1);
        Compare.addToBox(2);
        const menu = Account.updateMenu(1, { name: '아메리카노', typeId: 2 });
        same([menu.typeId, menu.typeName], [2, '논커피 라떼'], '바뀐 타입');
        same(tagIdsOfMenu(1), [[18], [18], []], '예전 타입 버튼은 지우고 공통 버튼만 남김');
        same(Compare.getBox(), [2], '비교함에서 빠짐');
        same(Reviews.getReviewSummary(1).reviewCount, 3, '리뷰는 그대로 3개');
    });
    add(128, 'Account.updateMenu', function () {
        loginAs('ownera');
        throws(function () {
            Account.updateMenu(1, { name: '   ', typeId: 1 });
        }, '메뉴 이름을 입력해 주세요');
    });
    add(129, 'Account.updateMenu', function () {
        loginAs('ownera');
        throws(function () {
            Account.updateMenu(1, { name: '아메리카노', typeId: 99 });
        }, '메뉴 타입을 골라 주세요');
    });
    add(130, 'Account.updateMenu', function () {
        loginAs('ownerb');
        throws(function () {
            Account.updateMenu(1, { name: '아메리카노', typeId: 1 });
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(131, 'Account.updateMenu', function () {
        throws(function () {
            Account.updateMenu(1, { name: '아메리카노', typeId: 1 });
        }, '로그인이 필요합니다');
    });
    add(132, 'Account.updateMenu', function () {
        loginAs('ownera');
        throws(function () {
            Account.updateMenu(999, { name: '아메리카노', typeId: 1 });
        }, '메뉴를 찾을 수 없습니다');
    });
    add(133, 'Account.deleteMenu', function () {
        loginAs('sample1');
        Account.toggleFavorite('menu', 1);
        Account.toggleFavorite('menu', 3);
        Compare.addToBox(1);
        Compare.addToBox(2);
        loginAs('ownera');
        same(Account.deleteMenu(1).name, '아메리카노', '지운 메뉴');
        throws(function () {
            Cafes.getMenu(1);
        }, '메뉴를 찾을 수 없습니다');
        same([DataStore.load('reviews').length, tagIdsOfMenu(1).length], [17, 0], '리뷰 수, 지운 메뉴의 리뷰 수');
        same(Compare.getBox(), [2], '비교함');
        same(Cafes.getCafe(1).cafe.menuCount, 4, '카페 A 메뉴 수');
        loginAs('sample1');
        const favMenuIds = Account.getFavorites().menus.map(function (menu) {
            return menu.id;
        });
        same(favMenuIds, [3], '즐겨찾기에서 빠짐');
        same(Reviews.getMyReviews().length, 6, '내 리뷰 목록이 오류 없이 나옴');
    });
    add(134, 'Account.deleteMenu', function () {
        loginAs('ownerb');
        throws(function () {
            Account.deleteMenu(1);
        }, '이 카페를 관리할 권한이 없습니다');
        same(DataStore.load('menus').length, 25, '메뉴 그대로');
    });
    add(135, 'Account.deleteMenu', function () {
        loginAs('sample1');
        throws(function () {
            Account.deleteMenu(1);
        }, '이 카페를 관리할 권한이 없습니다');
    });
    add(136, 'Account.deleteMenu', function () {
        throws(function () {
            Account.deleteMenu(1);
        }, '로그인이 필요합니다');
    });
    add(137, 'Account.deleteMenu', function () {
        loginAs('ownera');
        throws(function () {
            Account.deleteMenu(999);
        }, '메뉴를 찾을 수 없습니다');
    });

    // ───────── 테스트 전용 데이터 ─────────

    // 처음 만든 예시 데이터. 아래 기대값은 모두 이 데이터 기준이다.
    const TEST_SEED_DATA = {
        users: [
            { id: 1, loginId: 'ownera', password: '1234', nickname: '카페A사장', role: 'owner' },
            { id: 2, loginId: 'ownerb', password: '1234', nickname: '카페B사장', role: 'owner' },
            { id: 3, loginId: 'ownerc', password: '1234', nickname: '카페C사장', role: 'owner' },
            { id: 4, loginId: 'sample1', password: '1234', nickname: '예시회원1', role: 'member' },
            { id: 5, loginId: 'sample2', password: '1234', nickname: '예시회원2', role: 'member' },
            { id: 6, loginId: 'sample3', password: '1234', nickname: '예시회원3', role: 'member' }
        ],
        cafes: [
            { id: 1, ownerId: 1, name: '카페 A', area: 'campus', locationText: '[건물 1] 1층',
              lat: 0, lng: 0, openHours: '평일 08:30-19:00' },    // TODO: 실제 위도·경도
            { id: 2, ownerId: 2, name: '카페 B', area: 'campus', locationText: '[건물 2] 지하 1층',
              lat: 0, lng: 0, openHours: '평일 09:00-18:00' },    // TODO: 실제 위도·경도
            { id: 3, ownerId: 3, name: '카페 C', area: 'campus', locationText: '[건물 3] 2층',
              lat: 0, lng: 0, openHours: '평일 08:00-17:00' },    // TODO: 실제 위도·경도
            { id: 4, ownerId: null, name: '카페 D', area: 'nearby', locationText: '정문 앞',
              lat: 0, lng: 0, openHours: '매일 10:00-22:00' },    // TODO: 실제 위도·경도
            { id: 5, ownerId: null, name: '카페 E', area: 'nearby', locationText: '북문 근처',
              lat: 0, lng: 0, openHours: '매일 11:00-23:00' }     // TODO: 실제 위도·경도
        ],
        menuTypes: [
            { id: 1, name: '커피' },
            { id: 2, name: '논커피 라떼' },
            { id: 3, name: '차' },
            { id: 4, name: '에이드·스무디' },
            { id: 5, name: '디저트' }
        ],
        evalTags: [
            { id: 1, typeId: 1, label: '산미가 강해요', oppositeId: null },
            { id: 2, typeId: 1, label: '고소해요', oppositeId: null },
            { id: 3, typeId: 1, label: '진해요', oppositeId: 4 },
            { id: 4, typeId: 1, label: '연해요', oppositeId: 3 },
            { id: 5, typeId: 1, label: '쓴맛이 강해요', oppositeId: null },
            { id: 6, typeId: 2, label: '달아요', oppositeId: 7 },
            { id: 7, typeId: 2, label: '덜 달아요', oppositeId: 6 },
            { id: 8, typeId: 2, label: '우유 맛이 진해요', oppositeId: null },
            { id: 9, typeId: 3, label: '향이 좋아요', oppositeId: null },
            { id: 10, typeId: 3, label: '진해요', oppositeId: 11 },
            { id: 11, typeId: 3, label: '연해요', oppositeId: 10 },
            { id: 12, typeId: 4, label: '달아요', oppositeId: null },
            { id: 13, typeId: 4, label: '새콤해요', oppositeId: null },
            { id: 14, typeId: 4, label: '탄산이 강해요', oppositeId: null },
            { id: 15, typeId: 5, label: '달아요', oppositeId: null },
            { id: 16, typeId: 5, label: '촉촉해요', oppositeId: null },
            { id: 17, typeId: null, label: '양이 많아요', oppositeId: null },
            { id: 18, typeId: null, label: '가성비 좋아요', oppositeId: null }
        ],
        menus: [
            // 카페 A (교내)
            { id: 1, cafeId: 1, typeId: 1, name: '아메리카노', price: 2000, options: '샷 추가 +500' },
            { id: 2, cafeId: 1, typeId: 1, name: '카페라떼', price: 2500, options: '샷 추가 +500' },
            { id: 3, cafeId: 1, typeId: 2, name: '초코라떼', price: 3000, options: '' },
            { id: 4, cafeId: 1, typeId: 4, name: '레몬에이드', price: 3500, options: '' },
            { id: 5, cafeId: 1, typeId: 5, name: '치즈케이크', price: 4500, options: '' },
            // 카페 B (교내)
            { id: 6, cafeId: 2, typeId: 1, name: '아메리카노', price: 2300, options: '샷 추가 +500' },
            { id: 7, cafeId: 2, typeId: 1, name: '바닐라라떼', price: 3200, options: '샷 추가 +500' },
            { id: 8, cafeId: 2, typeId: 2, name: '녹차라떼', price: 3300, options: '' },
            { id: 9, cafeId: 2, typeId: 3, name: '캐모마일', price: 2800, options: '' },
            { id: 10, cafeId: 2, typeId: 4, name: '딸기스무디', price: 4000, options: '' },
            { id: 11, cafeId: 2, typeId: 5, name: '마카롱', price: 2200, options: '' },
            // 카페 C (교내)
            { id: 12, cafeId: 3, typeId: 1, name: '아메리카노', price: 2000, options: '샷 추가 +300' },
            { id: 13, cafeId: 3, typeId: 1, name: '카푸치노', price: 2800, options: '샷 추가 +300' },
            { id: 14, cafeId: 3, typeId: 3, name: '얼그레이', price: 2500, options: '' },
            { id: 15, cafeId: 3, typeId: 4, name: '자몽에이드', price: 3500, options: '' },
            // 카페 D (근처)
            { id: 16, cafeId: 4, typeId: 1, name: '아메리카노', price: 3000, options: '샷 추가 +500' },
            { id: 17, cafeId: 4, typeId: 1, name: '카페모카', price: 3800, options: '휘핑 추가 +500' },
            { id: 18, cafeId: 4, typeId: 2, name: '고구마라떼', price: 3800, options: '' },
            { id: 19, cafeId: 4, typeId: 3, name: '유자차', price: 3500, options: '' },
            { id: 20, cafeId: 4, typeId: 4, name: '블루베리스무디', price: 4500, options: '' },
            { id: 21, cafeId: 4, typeId: 5, name: '티라미수', price: 5000, options: '' },
            // 카페 E (근처)
            { id: 22, cafeId: 5, typeId: 1, name: '콜드브루', price: 4000, options: '' },
            { id: 23, cafeId: 5, typeId: 2, name: '초코라떼', price: 4200, options: '' },
            { id: 24, cafeId: 5, typeId: 3, name: '페퍼민트', price: 3800, options: '' },
            { id: 25, cafeId: 5, typeId: 5, name: '크로플', price: 4800, options: '아이스크림 추가 +1000' }
        ],
        reviews: [
            { id: 1, userId: 4, menuId: 1, rating: 4, comment: '고소하고 가격이 착해요', tagIds: [2, 18],
              createdAt: '2026-11-02T09:10:00', isSample: true },
            { id: 2, userId: 5, menuId: 1, rating: 5, comment: '매일 마셔요', tagIds: [2, 18],
              createdAt: '2026-11-03T10:20:00', isSample: true },
            { id: 3, userId: 6, menuId: 1, rating: 3, comment: '조금 연해요', tagIds: [4],
              createdAt: '2026-11-04T12:30:00', isSample: true },
            { id: 4, userId: 4, menuId: 2, rating: 5, comment: '우유랑 잘 어울려요', tagIds: [2],
              createdAt: '2026-11-04T13:05:00', isSample: true },
            { id: 5, userId: 5, menuId: 2, rating: 4, comment: '', tagIds: [2, 17],
              createdAt: '2026-11-05T08:50:00', isSample: true },
            { id: 6, userId: 4, menuId: 6, rating: 3, comment: '산미가 있어요', tagIds: [1],
              createdAt: '2026-11-05T15:40:00', isSample: true },
            { id: 7, userId: 6, menuId: 6, rating: 4, comment: '깔끔해요', tagIds: [1, 3],
              createdAt: '2026-11-06T11:15:00', isSample: true },
            { id: 8, userId: 5, menuId: 12, rating: 4, comment: '진하고 싸요', tagIds: [3, 18],
              createdAt: '2026-11-06T16:00:00', isSample: true },
            { id: 9, userId: 4, menuId: 16, rating: 5, comment: '향이 진해요', tagIds: [3, 5],
              createdAt: '2026-11-07T19:30:00', isSample: true },
            { id: 10, userId: 6, menuId: 16, rating: 4, comment: '양이 넉넉해요', tagIds: [3, 17],
              createdAt: '2026-11-07T20:10:00', isSample: true },
            { id: 11, userId: 5, menuId: 22, rating: 5, comment: '부드럽고 진해요', tagIds: [2, 3],
              createdAt: '2026-11-08T14:00:00', isSample: true },
            { id: 12, userId: 4, menuId: 3, rating: 4, comment: '꽤 달아요', tagIds: [6],
              createdAt: '2026-11-08T15:25:00', isSample: true },
            { id: 13, userId: 6, menuId: 8, rating: 5, comment: '녹차 맛이 진해요', tagIds: [7, 8],
              createdAt: '2026-11-09T10:45:00', isSample: true },
            { id: 14, userId: 5, menuId: 18, rating: 4, comment: '', tagIds: [6, 8],
              createdAt: '2026-11-09T17:35:00', isSample: true },
            { id: 15, userId: 4, menuId: 9, rating: 4, comment: '향이 좋아요', tagIds: [9],
              createdAt: '2026-11-10T09:30:00', isSample: true },
            { id: 16, userId: 6, menuId: 14, rating: 3, comment: '조금 연해요', tagIds: [11],
              createdAt: '2026-11-10T13:50:00', isSample: true },
            { id: 17, userId: 5, menuId: 4, rating: 4, comment: '상큼해요', tagIds: [13, 14],
              createdAt: '2026-11-11T12:15:00', isSample: true },
            { id: 18, userId: 6, menuId: 10, rating: 5, comment: '딸기가 많아요', tagIds: [12, 17],
              createdAt: '2026-11-11T16:40:00', isSample: true },
            { id: 19, userId: 4, menuId: 5, rating: 5, comment: '꾸덕하고 맛있어요', tagIds: [15, 16],
              createdAt: '2026-11-12T14:20:00', isSample: true },
            { id: 20, userId: 5, menuId: 21, rating: 4, comment: '비싸지만 맛있어요', tagIds: [15],
              createdAt: '2026-11-12T18:05:00', isSample: true }
        ],
        favorites: [],
        compareBox: []
    };

    // ───────── 실행 ─────────

    // 테스트하는 동안만 SEED_DATA의 내용을 테스트 전용 데이터로 바꿔 끼운다 (DataStore.reset이 이 값을 복사한다)
    const realSeed = {};
    const seedKeys = Object.keys(SEED_DATA);
    for (let i = 0; i < seedKeys.length; i++) {
        const key = seedKeys[i];
        realSeed[key] = SEED_DATA[key];
        SEED_DATA[key] = JSON.parse(JSON.stringify(TEST_SEED_DATA[key]));
    }

    const rows = [];
    let passCount = 0;
    for (let i = 0; i < cases.length; i++) {
        DataStore.reset();
        let passed = true;
        let note = '기대대로';
        try {
            cases[i].run();
        } catch (e) {
            passed = false;
            note = e.message;
        }
        if (passed) {
            passCount++;
        }
        rows.push({ 번호: cases[i].no, 함수: cases[i].fn, 통과: passed ? 'O' : 'X', '실제 결과': note });
    }

    // SEED_DATA를 data.js의 실제 데이터로 되돌리고, 저장소도 그 데이터로 다시 채운다
    for (let i = 0; i < seedKeys.length; i++) {
        SEED_DATA[seedKeys[i]] = realSeed[seedKeys[i]];
    }
    DataStore.reset();

    console.table(rows);
    console.log('통과 ' + passCount + ' / 전체 ' + cases.length + ' (데이터는 처음 상태로 되돌렸습니다. 화면을 새로고침하세요)');
    const failed = rows.filter(function (row) {
        return row.통과 === 'X';
    });
    if (failed.length > 0) {
        console.table(failed);
    }
})();
