// 화면 개발용 가짜. 진짜 모듈이 완성되면 script 태그를 바꿔 끼운다
// Account 가짜: interface.md 5절과 이름·입력·반환 모양이 같습니다. 저장하지 않습니다.
// 저장 함수는 받은 값을 그대로 담아 돌려줍니다. 카페·메뉴는 Cafes(가짜 또는 진짜)에서 가져옵니다.

const Account = {
    // 역할: 회원가입 / 입력: loginId, password, nickname / 출력: { id, loginId, nickname, role } / 오류: 없음(가짜)
    signup: function (loginId, password, nickname) {
        return { id: 99, loginId: loginId, nickname: nickname, role: 'member' };
    },

    // 역할: 로그인 / 입력: loginId, password / 출력: { id, loginId, nickname, role }
    //       loginId가 'owner'로 시작하면 사장으로 돌려줌 / 오류: 없음(가짜)
    login: function (loginId, password) {
        if (loginId.startsWith('owner')) {
            return { id: 1, loginId: loginId, nickname: '카페A사장', role: 'owner' };
        }
        return { id: 4, loginId: loginId, nickname: '예시회원1', role: 'member' };
    },

    // 역할: 로그아웃 / 입력: 없음 / 출력: 없음 / 오류: 없음
    logout: function () {
    },

    // 역할: 즐겨찾기 켜기·끄기 / 입력: targetType, targetId / 출력: true(추가됨, 가짜는 항상 true)
    toggleFavorite: function (targetType, targetId) {
        return true;
    },

    // 역할: 즐겨찾기 여부 / 입력: targetType, targetId / 출력: 카페 1, 메뉴 1만 true
    isFavorite: function (targetType, targetId) {
        return targetId === 1;
    },

    // 역할: 즐겨찾기 목록 / 입력: 없음 / 출력: { cafes: CafeItem[], menus: MenuItem[] }
    getFavorites: function () {
        return {
            cafes: [Cafes.getCafe(1).cafe],
            menus: [Cafes.getMenu(1), Cafes.getMenu(8)]
        };
    },

    // 역할: 사장의 카페 / 입력: 없음 / 출력: CafeItem (카페 A)
    getMyCafe: function () {
        return Cafes.getCafe(1).cafe;
    },

    // 역할: 카페 정보 수정 (가짜: 저장 안 함) / 입력: cafeId, info / 출력: info를 덮어쓴 CafeItem
    // 오류: '카페를 찾을 수 없습니다'
    updateCafe: function (cafeId, info) {
        const cafe = Cafes.getCafe(cafeId).cafe;
        cafe.name = info.name;
        cafe.locationText = info.locationText;
        cafe.openHours = info.openHours;
        return cafe;
    },

    // 역할: 메뉴 추가 (가짜: 저장 안 함) / 입력: cafeId, menu { name, typeId, price, options }
    // 출력: 받은 값으로 만든 새 MenuItem (리뷰 없음) / 오류: '카페를 찾을 수 없습니다'
    addMenu: function (cafeId, menu) {
        const cafe = Cafes.getCafe(cafeId).cafe;
        const type = Cafes.getMenuTypes().find(function (item) {
            return item.id === menu.typeId;
        });
        return {
            id: 999, cafeId: cafe.id, cafeName: cafe.name, area: cafe.area,
            typeId: menu.typeId, typeName: type === undefined ? '' : type.name,
            name: menu.name, price: menu.price, options: menu.options,
            avgRating: null, reviewCount: 0, topTag: null
        };
    },

    // 역할: 가격 변경 (가짜: 저장 안 함) / 입력: menuId, price / 출력: price를 바꾼 MenuItem
    // 오류: '메뉴를 찾을 수 없습니다'
    updatePrice: function (menuId, price) {
        const menu = Cafes.getMenu(menuId);
        menu.price = price;
        return menu;
    }
};
