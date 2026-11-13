// A. 카페·메뉴 조회: Cafes (검색, 상세, 메뉴 타입, 지도 핀·링크)
// 데이터는 DataStore.load로만 읽습니다. 반환하는 객체·배열은 모두 새로 만든 값입니다.
// 지도 핀 위치는 data.js의 MAP_BOUNDS(지도 이미지 모서리의 위도·경도)로 계산합니다.

const Cafes = {
    // 카페 위치 값(area)을 화면에 보여 줄 글자로 바꾸는 표
    areaLabels: { campus: '교내', nearby: '근처' },

    // ───────── 내부 함수 (Cafes 안에서만 사용) ─────────

    // 역할: 평점 목록의 평균을 소수 첫째 자리까지 반올림한다
    // 입력: ratings - 별점 숫자 배열
    // 출력: 평균 평점 숫자 (예: 4.4), 배열이 비었으면 null
    // 오류: 없음
    calcAvgRating: function (ratings) {
        if (ratings.length === 0) {
            return null;
        }
        let sum = 0;
        for (let i = 0; i < ratings.length; i++) {
            sum += ratings[i];
        }
        return Math.round(sum / ratings.length * 10) / 10;
    },

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

    // 역할: 리뷰 목록에서 가장 많이 눌린 평가 버튼을 찾는다
    // 입력: reviews - 한 메뉴의 리뷰 배열, evalTags - 전체 평가 버튼 배열
    // 출력: { tagId, label, percent } 또는 리뷰가 없거나 눌린 버튼이 없으면 null
    //       (횟수가 같으면 evalTags에서 앞에 있는 버튼)
    // 오류: 없음
    calcTopTag: function (reviews, evalTags) {
        if (reviews.length === 0) {
            return null;
        }
        let best = null;
        let bestCount = 0;
        for (let i = 0; i < evalTags.length; i++) {
            let count = 0;
            for (let j = 0; j < reviews.length; j++) {
                if (reviews[j].tagIds.indexOf(evalTags[i].id) !== -1) {
                    count++;
                }
            }
            if (count > bestCount) {
                best = evalTags[i];
                bestCount = count;
            }
        }
        if (best === null) {
            return null;
        }
        return {
            tagId: best.id,
            label: best.label,
            percent: Cafes.calcTagPercent(bestCount, reviews.length)
        };
    },

    // 역할: 평점 높은 순 정렬 비교 함수 (같으면 리뷰 많은 순, 평점 null은 맨 뒤)
    // 입력: a, b - avgRating과 reviewCount가 있는 CafeItem 또는 MenuItem
    // 출력: sort에 쓰는 음수/0/양수
    // 오류: 없음
    compareByRating: function (a, b) {
        if (a.avgRating === null && b.avgRating === null) {
            return 0;
        }
        if (a.avgRating === null) {
            return 1;
        }
        if (b.avgRating === null) {
            return -1;
        }
        if (a.avgRating !== b.avgRating) {
            return b.avgRating - a.avgRating;
        }
        return b.reviewCount - a.reviewCount;
    },

    // 역할: 계산에 필요한 목록을 DataStore에서 한 번에 읽는다
    // 입력: 없음
    // 출력: { cafes, menus, menuTypes, evalTags, reviews } 각각 배열
    // 오류: 없음
    loadAll: function () {
        return {
            cafes: DataStore.load('cafes'),
            menus: DataStore.load('menus'),
            menuTypes: DataStore.load('menuTypes'),
            evalTags: DataStore.load('evalTags'),
            reviews: DataStore.load('reviews')
        };
    },

    // 역할: id로 목록에서 항목 하나를 찾는다
    // 입력: list - id가 있는 항목 배열, id - 찾을 id
    // 출력: 찾은 항목, 없으면 null
    // 오류: 없음
    findById: function (list, id) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                return list[i];
            }
        }
        return null;
    },

    // 역할: 저장된 메뉴 하나를 MenuItem 모양으로 만든다
    // 입력: menu - menus 항목, all - loadAll()의 결과
    // 출력: MenuItem (interface.md 1절)
    // 오류: 없음
    makeMenuItem: function (menu, all) {
        const cafe = Cafes.findById(all.cafes, menu.cafeId);
        const type = Cafes.findById(all.menuTypes, menu.typeId);
        const reviews = [];
        const ratings = [];
        for (let i = 0; i < all.reviews.length; i++) {
            if (all.reviews[i].menuId === menu.id) {
                reviews.push(all.reviews[i]);
                ratings.push(all.reviews[i].rating);
            }
        }
        return {
            id: menu.id,
            cafeId: menu.cafeId,
            cafeName: cafe.name,
            area: cafe.area,
            typeId: menu.typeId,
            typeName: type.name,
            name: menu.name,
            price: menu.price,
            options: menu.options,
            avgRating: Cafes.calcAvgRating(ratings),
            reviewCount: reviews.length,
            topTag: Cafes.calcTopTag(reviews, all.evalTags)
        };
    },

    // 역할: 저장된 카페 하나를 CafeItem 모양으로 만든다 (평점은 그 카페 모든 메뉴의 리뷰를 합쳐 계산)
    // 입력: cafe - cafes 항목, all - loadAll()의 결과
    // 출력: CafeItem (interface.md 1절)
    // 오류: 없음
    makeCafeItem: function (cafe, all) {
        const menuIds = [];
        for (let i = 0; i < all.menus.length; i++) {
            if (all.menus[i].cafeId === cafe.id) {
                menuIds.push(all.menus[i].id);
            }
        }
        const ratings = [];
        for (let i = 0; i < all.reviews.length; i++) {
            if (menuIds.indexOf(all.reviews[i].menuId) !== -1) {
                ratings.push(all.reviews[i].rating);
            }
        }
        return {
            id: cafe.id,
            name: cafe.name,
            area: cafe.area,
            areaLabel: Cafes.areaLabels[cafe.area],
            locationText: cafe.locationText,
            openHours: cafe.openHours,
            menuCount: menuIds.length,
            avgRating: Cafes.calcAvgRating(ratings),
            reviewCount: ratings.length
        };
    },

    // ───────── 밖에 내놓는 함수 (interface.md 2절) ─────────

    // 역할: 카페를 이름과 위치로 찾는다
    // 입력: keyword - 카페 이름에 포함된 글자 (빈 문자열이면 전체)
    //       area - 'all' | 'campus' | 'nearby'
    // 출력: CafeItem[] 평점 높은 순 (같으면 리뷰 많은 순, 리뷰 없는 카페는 맨 뒤)
    // 오류: 없음
    searchCafes: function (keyword, area) {
        const all = Cafes.loadAll();
        const result = [];
        for (let i = 0; i < all.cafes.length; i++) {
            const cafe = all.cafes[i];
            if (area !== 'all' && cafe.area !== area) {
                continue;
            }
            if (cafe.name.indexOf(keyword) === -1) {
                continue;
            }
            result.push(Cafes.makeCafeItem(cafe, all));
        }
        result.sort(Cafes.compareByRating);
        return result;
    },

    // 역할: 카페 하나의 정보와 메뉴를 타입별로 묶어 돌려준다
    // 입력: cafeId - 카페 id (숫자)
    // 출력: { cafe: CafeItem, menusByType: [{ typeId, typeName, menus: MenuItem[] }] }
    //       메뉴 타입 순서대로, 그 카페에 메뉴가 없는 타입은 뺌
    // 오류: 없는 id면 '카페를 찾을 수 없습니다'
    getCafe: function (cafeId) {
        const all = Cafes.loadAll();
        const cafe = Cafes.findById(all.cafes, cafeId);
        if (cafe === null) {
            throw new Error('카페를 찾을 수 없습니다');
        }
        const menusByType = [];
        for (let i = 0; i < all.menuTypes.length; i++) {
            const type = all.menuTypes[i];
            const menus = [];
            for (let j = 0; j < all.menus.length; j++) {
                if (all.menus[j].cafeId === cafeId && all.menus[j].typeId === type.id) {
                    menus.push(Cafes.makeMenuItem(all.menus[j], all));
                }
            }
            if (menus.length > 0) {
                menusByType.push({ typeId: type.id, typeName: type.name, menus: menus });
            }
        }
        return { cafe: Cafes.makeCafeItem(cafe, all), menusByType: menusByType };
    },

    // 역할: 메뉴를 이름·타입으로 찾고 정렬한다
    // 입력: keyword - 메뉴 이름에 포함된 글자 (빈 문자열이면 전체)
    //       typeId - 메뉴 타입 id 또는 null(전체)
    //       sort - 'rating'(평점 높은 순, 같으면 리뷰 많은 순, 리뷰 없으면 맨 뒤)
    //              | 'price'(가격 낮은 순) | 'reviews'(리뷰 많은 순)
    // 출력: MenuItem[]
    // 오류: 없음
    searchMenus: function (keyword, typeId, sort) {
        const all = Cafes.loadAll();
        const result = [];
        for (let i = 0; i < all.menus.length; i++) {
            const menu = all.menus[i];
            if (typeId !== null && menu.typeId !== typeId) {
                continue;
            }
            if (menu.name.indexOf(keyword) === -1) {
                continue;
            }
            result.push(Cafes.makeMenuItem(menu, all));
        }
        if (sort === 'price') {
            result.sort(function (a, b) {
                return a.price - b.price;
            });
        } else if (sort === 'reviews') {
            result.sort(function (a, b) {
                return b.reviewCount - a.reviewCount;
            });
        } else {
            result.sort(Cafes.compareByRating);
        }
        return result;
    },

    // 역할: 모든 메뉴를 타입별로 묶어 돌려준다 (홈 '메뉴 목록'용)
    // 입력: 없음
    // 출력: [{ typeId, typeName, menus: MenuItem[] }] 메뉴 타입 순서대로, 각 타입 안은 평점 높은 순
    // 오류: 없음
    getMenusByType: function () {
        const all = Cafes.loadAll();
        const result = [];
        for (let i = 0; i < all.menuTypes.length; i++) {
            const type = all.menuTypes[i];
            const menus = [];
            for (let j = 0; j < all.menus.length; j++) {
                if (all.menus[j].typeId === type.id) {
                    menus.push(Cafes.makeMenuItem(all.menus[j], all));
                }
            }
            menus.sort(Cafes.compareByRating);
            result.push({ typeId: type.id, typeName: type.name, menus: menus });
        }
        return result;
    },

    // 역할: 메뉴 하나를 돌려준다
    // 입력: menuId - 메뉴 id (숫자)
    // 출력: MenuItem
    // 오류: 없는 id면 '메뉴를 찾을 수 없습니다'
    getMenu: function (menuId) {
        const all = Cafes.loadAll();
        const menu = Cafes.findById(all.menus, menuId);
        if (menu === null) {
            throw new Error('메뉴를 찾을 수 없습니다');
        }
        return Cafes.makeMenuItem(menu, all);
    },

    // 역할: 메뉴 타입 목록과 각 타입에서 고를 수 있는 평가 버튼을 돌려준다
    // 입력: 없음
    // 출력: [{ id, name, tags: [{ id, label, oppositeId }] }] 각 tags는 그 타입 버튼 다음에 공통 버튼
    //       oppositeId는 뜻이 반대인 버튼 id 또는 null
    // 오류: 없음
    getMenuTypes: function () {
        const menuTypes = DataStore.load('menuTypes');
        const evalTags = DataStore.load('evalTags');
        const result = [];
        for (let i = 0; i < menuTypes.length; i++) {
            const typeTags = [];
            const commonTags = [];
            for (let j = 0; j < evalTags.length; j++) {
                const tag = { id: evalTags[j].id, label: evalTags[j].label, oppositeId: evalTags[j].oppositeId };
                if (evalTags[j].typeId === menuTypes[i].id) {
                    typeTags.push(tag);
                } else if (evalTags[j].typeId === null) {
                    commonTags.push(tag);
                }
            }
            result.push({ id: menuTypes[i].id, name: menuTypes[i].name, tags: typeTags.concat(commonTags) });
        }
        return result;
    },

    // ───────── 지도 (P1) ─────────

    // 역할: 지도 이미지 위에 찍을 카페 핀 위치를 계산한다
    //       x = (경도 - 왼쪽 위 경도) ÷ (오른쪽 아래 경도 - 왼쪽 위 경도) × 100
    //       y = (왼쪽 위 위도 - 위도) ÷ (왼쪽 위 위도 - 오른쪽 아래 위도) × 100
    //       (위도는 북쪽일수록 커지므로 y는 왼쪽 위 위도에서 뺌)
    // 입력: 없음 (카페 위도·경도와 MAP_BOUNDS 사용)
    // 출력: [{ cafeId, name, area, x, y }] x, y는 지도 이미지 위 위치(%, 0~100)
    //       x나 y가 0~100 밖인 카페는 뺌
    //       MAP_BOUNDS가 아직 채워지지 않았으면(두 모서리의 위도나 경도가 같으면) 빈 배열
    // 오류: 없음
    getMapPins: function () {
        const topLeft = MAP_BOUNDS.topLeft;
        const bottomRight = MAP_BOUNDS.bottomRight;
        if (topLeft.lng === bottomRight.lng || topLeft.lat === bottomRight.lat) {
            return [];
        }
        const cafes = DataStore.load('cafes');
        const result = [];
        for (let i = 0; i < cafes.length; i++) {
            const x = (cafes[i].lng - topLeft.lng) / (bottomRight.lng - topLeft.lng) * 100;
            const y = (topLeft.lat - cafes[i].lat) / (topLeft.lat - bottomRight.lat) * 100;
            if (x < 0 || x > 100 || y < 0 || y > 100) {
                continue;
            }
            result.push({ cafeId: cafes[i].id, name: cafes[i].name, area: cafes[i].area, x: x, y: y });
        }
        return result;
    },

    // 역할: 카카오맵 '지도에서 보기'·'길찾기' 링크를 만든다
    //       view:  https://map.kakao.com/link/map/카페이름,위도,경도
    //       route: https://map.kakao.com/link/to/카페이름,위도,경도
    //       카페 이름은 encodeURIComponent로 감쌈
    // 입력: cafeId - 카페 id (숫자)
    // 출력: { view, route }
    // 오류: 없는 id면 '카페를 찾을 수 없습니다'
    getMapLinks: function (cafeId) {
        const cafe = Cafes.findById(DataStore.load('cafes'), cafeId);
        if (cafe === null) {
            throw new Error('카페를 찾을 수 없습니다');
        }
        const place = encodeURIComponent(cafe.name) + ',' + cafe.lat + ',' + cafe.lng;
        return {
            view: 'https://map.kakao.com/link/map/' + place,
            route: 'https://map.kakao.com/link/to/' + place
        };
    }
};
