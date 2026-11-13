// 화면 개발용 가짜. 진짜 모듈이 완성되면 script 태그를 바꿔 끼운다
// Reviews 가짜: interface.md 3절과 이름·입력·반환 모양이 같습니다. 저장하지 않습니다.
// 메뉴·평가 버튼은 Cafes(가짜 또는 진짜), 로그인은 Auth에서 가져옵니다.

const Reviews = {
    // 고정 데이터: 남이 쓴 예시 리뷰 (메뉴의 reviewCount만큼 앞에서부터 씀)
    samplePool: [
        { userId: 5, nickname: '예시회원2', rating: 5, comment: '매일 마셔요', createdAt: '2026-11-07T10:20:00' },
        { userId: 6, nickname: '예시회원3', rating: 4, comment: '', createdAt: '2026-11-05T08:50:00' },
        { userId: 4, nickname: '예시회원1', rating: 3, comment: '조금 연해요', createdAt: '2026-11-03T12:30:00' }
    ],

    // 고정 데이터: 로그인한 회원이 쓴 리뷰 (메뉴 id → 리뷰 내용), 최신순
    myList: [
        { menuId: 1, rating: 4, comment: '고소하고 가격이 착해요', tagIds: [2, 18], createdAt: '2026-11-12T09:10:00' },
        { menuId: 16, rating: 5, comment: '향이 진해요', tagIds: [3], createdAt: '2026-11-08T19:30:00' }
    ],

    // 역할: 평가 버튼 id 배열을 [{ id, label }]로 바꾼다 (그 메뉴 타입 버튼에 있는 것만)
    tagsOf: function (typeId, tagIds) {
        const type = Cafes.getMenuTypes().find(function (item) {
            return item.id === typeId;
        });
        return type.tags.filter(function (tag) {
            return tagIds.includes(tag.id);
        });
    },

    // 역할: myList의 한 줄을 reviews[] 한 개 모양으로 만든다
    toMyReview: function (user, menu, mine) {
        return {
            id: 900 + menu.id, userId: user.id, nickname: user.nickname, rating: mine.rating,
            comment: mine.comment, tags: Reviews.tagsOf(menu.typeId, mine.tagIds),
            createdAt: mine.createdAt, isSample: false
        };
    },

    // 역할: 메뉴 리뷰 요약 / 입력: menuId / 출력: { menuId, avgRating, reviewCount, tagStats, reviews }
    // 오류: '메뉴를 찾을 수 없습니다'
    getReviewSummary: function (menuId) {
        const menu = Cafes.getMenu(menuId);
        const topTagId = menu.topTag === null ? null : menu.topTag.tagId;
        const tagStats = [];
        const allTags = Cafes.getMenuTypes().find(function (item) {
            return item.id === menu.typeId;
        }).tags;
        for (let i = 0; i < allTags.length; i++) {
            const percent = allTags[i].id === topTagId ? menu.topTag.percent : 0;
            tagStats.push({
                tagId: allTags[i].id, label: allTags[i].label,
                count: Math.round(percent * menu.reviewCount / 100), percent: percent
            });
        }
        tagStats.sort(function (a, b) {
            return b.percent - a.percent;
        });
        const reviews = [];
        for (let i = 0; i < menu.reviewCount && i < Reviews.samplePool.length; i++) {
            const sample = Reviews.samplePool[i];
            reviews.push({
                id: menu.id * 10 + i, userId: sample.userId, nickname: sample.nickname,
                rating: sample.rating, comment: sample.comment,
                tags: topTagId === null ? [] : Reviews.tagsOf(menu.typeId, [topTagId]),
                createdAt: sample.createdAt, isSample: true
            });
        }
        return {
            menuId: menu.id, avgRating: menu.avgRating, reviewCount: menu.reviewCount,
            tagStats: tagStats, reviews: reviews
        };
    },

    // 역할: 내가 그 메뉴에 쓴 리뷰 / 입력: menuId / 출력: 리뷰 한 개 또는 null (메뉴 1, 16만 있음)
    // 오류: '메뉴를 찾을 수 없습니다'
    getMyReview: function (menuId) {
        const menu = Cafes.getMenu(menuId);
        const user = Auth.getCurrentUser();
        if (user === null) {
            return null;
        }
        const mine = Reviews.myList.find(function (item) {
            return item.menuId === menuId;
        });
        if (mine === undefined) {
            return null;
        }
        return Reviews.toMyReview(user, menu, mine);
    },

    // 역할: 리뷰 저장 (가짜: 저장하지 않고 받은 값으로 만든 리뷰를 돌려줌)
    // 입력: menuId, rating, comment, tagIds / 출력: 저장된 리뷰 모양
    // 오류: '로그인이 필요합니다', '메뉴를 찾을 수 없습니다'
    saveReview: function (menuId, rating, comment, tagIds) {
        const user = Auth.requireLogin();
        const menu = Cafes.getMenu(menuId);
        const mine = { rating: rating, comment: comment, tagIds: tagIds, createdAt: '2026-11-13T12:00:00' };
        return Reviews.toMyReview(user, menu, mine);
    },

    // 역할: 리뷰 삭제 (가짜: 아무것도 지우지 않음) / 입력: reviewId / 출력: undefined
    // 오류: '로그인이 필요합니다'
    deleteReview: function (reviewId) {
        Auth.requireLogin();
    },

    // 역할: 내 리뷰 목록 / 입력: 없음 / 출력: [{ review, menu }] 최신순
    // 오류: '로그인이 필요합니다'
    getMyReviews: function () {
        const user = Auth.requireLogin();
        return Reviews.myList.map(function (mine) {
            const menu = Cafes.getMenu(mine.menuId);
            return { review: Reviews.toMyReview(user, menu, mine), menu: menu };
        });
    }
};
