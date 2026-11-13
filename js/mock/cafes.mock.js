// 화면 개발용 가짜. 진짜 모듈이 완성되면 script 태그를 바꿔 끼운다
// Cafes 가짜: interface.md 2절과 이름·입력·반환 모양이 같습니다. 값은 아래 고정 데이터입니다.

const Cafes = {
    // 고정 데이터: CafeItem (평점 높은 순, 리뷰 없는 카페는 맨 뒤)
    cafeList: [
        { id: 4, name: '카페 D', area: 'nearby', areaLabel: '근처', locationText: '정문 앞',
          openHours: '매일 10:00-22:00', menuCount: 2, avgRating: 4.3, reviewCount: 3 },
        { id: 1, name: '카페 A', area: 'campus', areaLabel: '교내', locationText: '[건물 1] 1층',
          openHours: '평일 08:30-19:00', menuCount: 3, avgRating: 4.2, reviewCount: 6 },
        { id: 2, name: '카페 B', area: 'campus', areaLabel: '교내', locationText: '[건물 2] 지하 1층',
          openHours: '평일 09:00-18:00', menuCount: 3, avgRating: 4.0, reviewCount: 3 },
        { id: 5, name: '카페 E', area: 'nearby', areaLabel: '근처', locationText: '북문 근처',
          openHours: '매일 11:00-23:00', menuCount: 1, avgRating: null, reviewCount: 0 }
    ],

    // 고정 데이터: MenuItem
    menuList: [
        { id: 1, cafeId: 1, cafeName: '카페 A', area: 'campus', typeId: 1, typeName: '커피',
          name: '아메리카노', price: 2000, options: '샷 추가 +500', avgRating: 4.0, reviewCount: 3,
          topTag: { tagId: 2, label: '고소해요', percent: 67 } },
        { id: 2, cafeId: 1, cafeName: '카페 A', area: 'campus', typeId: 1, typeName: '커피',
          name: '카페라떼', price: 2500, options: '샷 추가 +500', avgRating: 4.5, reviewCount: 2,
          topTag: { tagId: 2, label: '고소해요', percent: 100 } },
        { id: 3, cafeId: 1, cafeName: '카페 A', area: 'campus', typeId: 2, typeName: '논커피 라떼',
          name: '초코라떼', price: 3000, options: '', avgRating: 4.0, reviewCount: 1,
          topTag: { tagId: 6, label: '달아요', percent: 100 } },
        { id: 6, cafeId: 2, cafeName: '카페 B', area: 'campus', typeId: 1, typeName: '커피',
          name: '아메리카노', price: 2300, options: '샷 추가 +500', avgRating: 3.5, reviewCount: 2,
          topTag: { tagId: 1, label: '산미가 강해요', percent: 100 } },
        { id: 8, cafeId: 2, cafeName: '카페 B', area: 'campus', typeId: 2, typeName: '논커피 라떼',
          name: '녹차라떼', price: 3300, options: '', avgRating: 5.0, reviewCount: 1,
          topTag: { tagId: 7, label: '덜 달아요', percent: 100 } },
        { id: 10, cafeId: 2, cafeName: '카페 B', area: 'campus', typeId: 4, typeName: '에이드·스무디',
          name: '딸기스무디', price: 4000, options: '', avgRating: null, reviewCount: 0,
          topTag: null },
        { id: 16, cafeId: 4, cafeName: '카페 D', area: 'nearby', typeId: 1, typeName: '커피',
          name: '아메리카노', price: 3000, options: '샷 추가 +500', avgRating: 4.5, reviewCount: 2,
          topTag: { tagId: 3, label: '진해요', percent: 100 } },
        { id: 21, cafeId: 4, cafeName: '카페 D', area: 'nearby', typeId: 5, typeName: '디저트',
          name: '티라미수', price: 5000, options: '', avgRating: 4.0, reviewCount: 1,
          topTag: { tagId: 15, label: '달아요', percent: 100 } },
        { id: 22, cafeId: 5, cafeName: '카페 E', area: 'nearby', typeId: 1, typeName: '커피',
          name: '콜드브루', price: 4000, options: '', avgRating: null, reviewCount: 0,
          topTag: null }
    ],

    // 고정 데이터: 메뉴 타입과 평가 버튼 (공통 버튼 17, 18 포함)
    typeList: [
        { id: 1, name: '커피', tags: [
            { id: 1, label: '산미가 강해요', oppositeId: null }, { id: 2, label: '고소해요', oppositeId: null }, { id: 3, label: '진해요', oppositeId: 4 },
            { id: 4, label: '연해요', oppositeId: 3 }, { id: 5, label: '쓴맛이 강해요', oppositeId: null },
            { id: 17, label: '양이 많아요', oppositeId: null }, { id: 18, label: '가성비 좋아요', oppositeId: null }] },
        { id: 2, name: '논커피 라떼', tags: [
            { id: 6, label: '달아요', oppositeId: 7 }, { id: 7, label: '덜 달아요', oppositeId: 6 }, { id: 8, label: '우유 맛이 진해요', oppositeId: null },
            { id: 17, label: '양이 많아요', oppositeId: null }, { id: 18, label: '가성비 좋아요', oppositeId: null }] },
        { id: 3, name: '차', tags: [
            { id: 9, label: '향이 좋아요', oppositeId: null }, { id: 10, label: '진해요', oppositeId: 11 }, { id: 11, label: '연해요', oppositeId: 10 },
            { id: 17, label: '양이 많아요', oppositeId: null }, { id: 18, label: '가성비 좋아요', oppositeId: null }] },
        { id: 4, name: '에이드·스무디', tags: [
            { id: 12, label: '달아요', oppositeId: null }, { id: 13, label: '새콤해요', oppositeId: null }, { id: 14, label: '탄산이 강해요', oppositeId: null },
            { id: 17, label: '양이 많아요', oppositeId: null }, { id: 18, label: '가성비 좋아요', oppositeId: null }] },
        { id: 5, name: '디저트', tags: [
            { id: 15, label: '달아요', oppositeId: null }, { id: 16, label: '촉촉해요', oppositeId: null },
            { id: 17, label: '양이 많아요', oppositeId: null }, { id: 18, label: '가성비 좋아요', oppositeId: null }] }
    ],

    // 고정 데이터: 지도 핀 위치(%)
    pinList: [
        { cafeId: 1, name: '카페 A', area: 'campus', x: 42, y: 35 },
        { cafeId: 2, name: '카페 B', area: 'campus', x: 58, y: 48 },
        { cafeId: 4, name: '카페 D', area: 'nearby', x: 30, y: 82 },
        { cafeId: 5, name: '카페 E', area: 'nearby', x: 70, y: 12 }
    ],

    // 역할: 값을 깊은 복사한다 (화면에서 고쳐도 고정 데이터가 안 바뀌게)
    copy: function (value) {
        return JSON.parse(JSON.stringify(value));
    },

    // 역할: 메뉴 목록을 정렬 기준대로 정렬한다 ('rating' | 'price' | 'reviews')
    sortMenus: function (menus, sort) {
        menus.sort(function (a, b) {
            if (sort === 'price') {
                return a.price - b.price;
            }
            if (sort === 'reviews') {
                return b.reviewCount - a.reviewCount;
            }
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
        });
        return menus;
    },

    // 역할: 메뉴를 타입 순서대로 묶는다 (메뉴 없는 타입은 뺌)
    groupByType: function (menus) {
        const result = [];
        for (let i = 0; i < Cafes.typeList.length; i++) {
            const type = Cafes.typeList[i];
            const inType = menus.filter(function (menu) {
                return menu.typeId === type.id;
            });
            if (inType.length > 0) {
                result.push({ typeId: type.id, typeName: type.name, menus: inType });
            }
        }
        return result;
    },

    // 역할: 카페 검색 / 입력: keyword, area / 출력: CafeItem[] / 오류: 없음
    searchCafes: function (keyword, area) {
        const result = Cafes.cafeList.filter(function (cafe) {
            return cafe.name.includes(keyword) && (area === 'all' || cafe.area === area);
        });
        return Cafes.copy(result);
    },

    // 역할: 카페 상세 / 입력: cafeId / 출력: { cafe, menusByType } / 오류: '카페를 찾을 수 없습니다'
    getCafe: function (cafeId) {
        const cafe = Cafes.cafeList.find(function (item) {
            return item.id === cafeId;
        });
        if (cafe === undefined) {
            throw new Error('카페를 찾을 수 없습니다');
        }
        const menus = Cafes.menuList.filter(function (menu) {
            return menu.cafeId === cafeId;
        });
        return Cafes.copy({ cafe: cafe, menusByType: Cafes.groupByType(menus) });
    },

    // 역할: 메뉴 검색 / 입력: keyword, typeId(또는 null), sort / 출력: MenuItem[] / 오류: 없음
    searchMenus: function (keyword, typeId, sort) {
        const result = Cafes.menuList.filter(function (menu) {
            return menu.name.includes(keyword) && (typeId === null || menu.typeId === typeId);
        });
        return Cafes.sortMenus(Cafes.copy(result), sort);
    },

    // 역할: 홈 '메뉴 목록' / 입력: 없음 / 출력: [{ typeId, typeName, menus }] 각 타입 안은 평점 높은 순 / 오류: 없음
    getMenusByType: function () {
        const sorted = Cafes.sortMenus(Cafes.copy(Cafes.menuList), 'rating');
        return Cafes.groupByType(sorted);
    },

    // 역할: 메뉴 하나 / 입력: menuId / 출력: MenuItem / 오류: '메뉴를 찾을 수 없습니다'
    getMenu: function (menuId) {
        const menu = Cafes.menuList.find(function (item) {
            return item.id === menuId;
        });
        if (menu === undefined) {
            throw new Error('메뉴를 찾을 수 없습니다');
        }
        return Cafes.copy(menu);
    },

    // 역할: 메뉴 타입과 평가 버튼 / 입력: 없음 / 출력: [{ id, name, tags }] / 오류: 없음
    getMenuTypes: function () {
        return Cafes.copy(Cafes.typeList);
    },

    // 역할: 지도 핀 / 입력: 없음 / 출력: [{ cafeId, name, area, x, y }] / 오류: 없음
    getMapPins: function () {
        return Cafes.copy(Cafes.pinList);
    },

    // 역할: 카카오맵 링크 / 입력: cafeId / 출력: { view, route } / 오류: '카페를 찾을 수 없습니다'
    getMapLinks: function (cafeId) {
        const cafe = Cafes.getCafe(cafeId).cafe;
        const place = encodeURIComponent(cafe.name) + ',35.8886,128.6113';
        return {
            view: 'https://map.kakao.com/link/map/' + place,
            route: 'https://map.kakao.com/link/to/' + place
        };
    }
};
