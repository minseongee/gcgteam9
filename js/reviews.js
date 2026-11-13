// B. 리뷰·평가 집계: Reviews (리뷰 작성·삭제, 평점·평가 버튼 집계)
// 리뷰·회원·평가 버튼은 DataStore로만 읽고 씁니다. 메뉴 정보는 Cafes.getMenu / Cafes.getMenuTypes로 얻습니다.
// 로그인 확인은 Auth를 씁니다.

const Reviews = {
    // ───────── 내부 함수 (Reviews 안에서만 사용) ─────────

    // 역할: 평가 버튼 비율(%)을 계산한다
    // 입력: count - 그 버튼을 누른 리뷰 수, total - 전체 리뷰 수
    // 출력: 0~100 정수 (전체 리뷰가 0이면 0)
    // 오류: 없음
    calcTagPercent: function (count, total) {
        if (total === 0) {
            return 0;
        }
        return Math.round(count / total * 100);
    },

    // 역할: 지금 시각을 data.md 형식의 문자열로 만든다
    // 입력: 없음
    // 출력: 'YYYY-MM-DDTHH:MM:SS' (한국 시간 등 이 컴퓨터의 시간 기준)
    // 오류: 없음
    nowText: function () {
        const now = new Date();
        const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 19);
    },

    // 역할: 최신순 정렬 비교 함수 (createdAt이 같으면 id가 큰 것이 앞)
    // 입력: a, b - createdAt과 id가 있는 리뷰
    // 출력: sort에 쓰는 음수/0/양수
    // 오류: 없음
    compareByNewest: function (a, b) {
        if (a.createdAt !== b.createdAt) {
            return a.createdAt < b.createdAt ? 1 : -1;
        }
        return b.id - a.id;
    },

    // 역할: 메뉴 타입에서 고를 수 있는 평가 버튼(그 타입 버튼 + 공통 버튼)을 찾는다
    // 입력: typeId - 메뉴 타입 id
    // 출력: [{ id, label }]
    // 오류: 없음
    getTagsOfType: function (typeId) {
        const types = Cafes.getMenuTypes();
        for (let i = 0; i < types.length; i++) {
            if (types[i].id === typeId) {
                return types[i].tags;
            }
        }
        return [];
    },

    // 역할: 저장된 리뷰를 화면에 줄 모양으로 만든다
    // 입력: review - reviews 항목, users - 회원 배열, evalTags - 평가 버튼 배열
    // 출력: { id, userId, nickname, rating, comment, tags: [{ id, label }], createdAt }
    // 오류: 없음
    makeReviewItem: function (review, users, evalTags) {
        let nickname = '';
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === review.userId) {
                nickname = users[i].nickname;
            }
        }
        const tags = [];
        for (let i = 0; i < evalTags.length; i++) {
            if (review.tagIds.indexOf(evalTags[i].id) !== -1) {
                tags.push({ id: evalTags[i].id, label: evalTags[i].label });
            }
        }
        return {
            id: review.id,
            userId: review.userId,
            nickname: nickname,
            rating: review.rating,
            comment: review.comment,
            tags: tags,
            createdAt: review.createdAt
        };
    },

    // ───────── 밖에 내놓는 함수 (interface.md 3절) ─────────

    // 역할: 메뉴 하나의 평점·평가 버튼 집계와 리뷰 목록을 돌려준다
    // 입력: menuId - 메뉴 id (숫자)
    // 출력: { menuId, avgRating, reviewCount, tagStats: TagStat[], reviews: [...] }
    //       tagStats는 그 타입 버튼 + 공통 버튼 전부(0% 포함), percent 높은 순
    //       reviews는 최신순
    // 오류: 없는 id면 '메뉴를 찾을 수 없습니다'
    getReviewSummary: function (menuId) {
        const menu = Cafes.getMenu(menuId);
        const users = DataStore.load('users');
        const evalTags = DataStore.load('evalTags');
        const allReviews = DataStore.load('reviews');
        const menuReviews = [];
        for (let i = 0; i < allReviews.length; i++) {
            if (allReviews[i].menuId === menuId) {
                menuReviews.push(allReviews[i]);
            }
        }
        menuReviews.sort(Reviews.compareByNewest);

        const tagStats = [];
        const typeTags = Reviews.getTagsOfType(menu.typeId);
        for (let i = 0; i < typeTags.length; i++) {
            let count = 0;
            for (let j = 0; j < menuReviews.length; j++) {
                if (menuReviews[j].tagIds.indexOf(typeTags[i].id) !== -1) {
                    count++;
                }
            }
            tagStats.push({
                tagId: typeTags[i].id,
                label: typeTags[i].label,
                count: count,
                percent: Reviews.calcTagPercent(count, menuReviews.length)
            });
        }
        tagStats.sort(function (a, b) {
            return b.percent - a.percent;
        });

        const reviews = [];
        for (let i = 0; i < menuReviews.length; i++) {
            reviews.push(Reviews.makeReviewItem(menuReviews[i], users, evalTags));
        }
        return {
            menuId: menuId,
            avgRating: menu.avgRating,
            reviewCount: menu.reviewCount,
            tagStats: tagStats,
            reviews: reviews
        };
    },

    // 역할: 로그인한 회원이 그 메뉴에 쓴 리뷰를 돌려준다 (리뷰 쓰기 화면에서 기존 값 채우기용)
    // 입력: menuId - 메뉴 id (숫자)
    // 출력: getReviewSummary의 reviews[] 한 개 모양, 없거나 로그인 안 했으면 null
    // 오류: 없음
    getMyReview: function (menuId) {
        const user = Auth.getCurrentUser();
        if (user === null) {
            return null;
        }
        const allReviews = DataStore.load('reviews');
        for (let i = 0; i < allReviews.length; i++) {
            if (allReviews[i].menuId === menuId && allReviews[i].userId === user.id) {
                return Reviews.makeReviewItem(allReviews[i], DataStore.load('users'), DataStore.load('evalTags'));
            }
        }
        return null;
    },

    // 역할: 리뷰를 저장한다 (이미 쓴 리뷰가 있으면 그 리뷰를 고침)
    // 입력: menuId - 메뉴 id, rating - 1~5 정수, comment - 0~50자 문자열,
    //       tagIds - 그 메뉴 타입 버튼 + 공통 버튼의 id 배열 (0개 이상, 같은 id가 겹치면 하나만 저장)
    // 출력: 저장된 리뷰 (getMyReview와 같은 모양)
    // 오류: '로그인이 필요합니다' / '메뉴를 찾을 수 없습니다'
    //       '별점은 1~5 사이로 골라 주세요' / '한줄평은 50자 이내로 써 주세요'
    //       '이 메뉴에서 고를 수 없는 평가 버튼입니다'
    saveReview: function (menuId, rating, comment, tagIds) {
        const user = Auth.requireLogin();
        const menu = Cafes.getMenu(menuId);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new Error('별점은 1~5 사이로 골라 주세요');
        }
        if (typeof comment !== 'string' || comment.length > 50) {
            throw new Error('한줄평은 50자 이내로 써 주세요');
        }
        if (!Array.isArray(tagIds)) {
            throw new Error('이 메뉴에서 고를 수 없는 평가 버튼입니다');
        }
        const allowedIds = [];
        const typeTags = Reviews.getTagsOfType(menu.typeId);
        for (let i = 0; i < typeTags.length; i++) {
            allowedIds.push(typeTags[i].id);
        }
        const cleanTagIds = [];
        for (let i = 0; i < tagIds.length; i++) {
            if (allowedIds.indexOf(tagIds[i]) === -1) {
                throw new Error('이 메뉴에서 고를 수 없는 평가 버튼입니다');
            }
            if (cleanTagIds.indexOf(tagIds[i]) === -1) {
                cleanTagIds.push(tagIds[i]);
            }
        }

        const allReviews = DataStore.load('reviews');
        let found = null;
        for (let i = 0; i < allReviews.length; i++) {
            if (allReviews[i].menuId === menuId && allReviews[i].userId === user.id) {
                found = allReviews[i];
            }
        }
        if (found === null) {
            allReviews.push({
                id: DataStore.nextId('reviews'),
                userId: user.id,
                menuId: menuId,
                rating: rating,
                comment: comment,
                tagIds: cleanTagIds,
                createdAt: Reviews.nowText(),
                isSample: false
            });
        } else {
            found.rating = rating;
            found.comment = comment;
            found.tagIds = cleanTagIds;
            found.createdAt = Reviews.nowText();
            found.isSample = false;
        }
        DataStore.save('reviews', allReviews);
        return Reviews.getMyReview(menuId);
    },

    // 역할: 내가 쓴 리뷰를 지운다
    // 입력: reviewId - 리뷰 id (숫자)
    // 출력: 없음
    // 오류: '로그인이 필요합니다' / '리뷰를 찾을 수 없습니다' / '내가 쓴 리뷰만 삭제할 수 있습니다'
    deleteReview: function (reviewId) {
        const user = Auth.requireLogin();
        const allReviews = DataStore.load('reviews');
        let index = -1;
        for (let i = 0; i < allReviews.length; i++) {
            if (allReviews[i].id === reviewId) {
                index = i;
            }
        }
        if (index === -1) {
            throw new Error('리뷰를 찾을 수 없습니다');
        }
        if (allReviews[index].userId !== user.id) {
            throw new Error('내가 쓴 리뷰만 삭제할 수 있습니다');
        }
        allReviews.splice(index, 1);
        DataStore.save('reviews', allReviews);
    },

    // 역할: 내가 쓴 리뷰를 메뉴 정보와 함께 돌려준다 (마이페이지용)
    // 입력: 없음
    // 출력: [{ review, menu: MenuItem }] 최신순
    // 오류: '로그인이 필요합니다'
    getMyReviews: function () {
        const user = Auth.requireLogin();
        const users = DataStore.load('users');
        const evalTags = DataStore.load('evalTags');
        const allReviews = DataStore.load('reviews');
        const mine = [];
        for (let i = 0; i < allReviews.length; i++) {
            if (allReviews[i].userId === user.id) {
                mine.push(allReviews[i]);
            }
        }
        mine.sort(Reviews.compareByNewest);
        const result = [];
        for (let i = 0; i < mine.length; i++) {
            result.push({
                review: Reviews.makeReviewItem(mine[i], users, evalTags),
                menu: Cafes.getMenu(mine[i].menuId)
            });
        }
        return result;
    }
};
