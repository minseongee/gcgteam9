// D. 계정·즐겨찾기·운영: Account (회원가입·로그인, 즐겨찾기, 사장 메뉴 관리)
// 회원 데이터는 DataStore로만 읽고 씁니다. 반환값에는 password를 넣지 않습니다.
// 비밀번호는 암호화 없이 저장합니다(과제용).

const Account = {
    // 역할: 새 회원을 만들고 바로 로그인한다
    // 입력: loginId - 영문·숫자 4~12자, password - 4자 이상, nickname - 1~10자
    // 출력: 새 회원 { id, loginId, nickname, role: 'member' }
    // 오류: '아이디는 영문·숫자 4~12자로 정해 주세요'
    //       '비밀번호는 4자 이상이어야 합니다'
    //       '닉네임은 1~10자로 정해 주세요'
    //       '이미 사용 중인 아이디입니다'
    signup: function (loginId, password, nickname) {
        if (typeof loginId !== 'string' || !/^[A-Za-z0-9]{4,12}$/.test(loginId)) {
            throw new Error('아이디는 영문·숫자 4~12자로 정해 주세요');
        }
        if (typeof password !== 'string' || password.length < 4) {
            throw new Error('비밀번호는 4자 이상이어야 합니다');
        }
        if (typeof nickname !== 'string' || nickname.length < 1 || nickname.length > 10) {
            throw new Error('닉네임은 1~10자로 정해 주세요');
        }
        const users = DataStore.load('users');
        for (let i = 0; i < users.length; i++) {
            if (users[i].loginId === loginId) {
                throw new Error('이미 사용 중인 아이디입니다');
            }
        }
        const id = DataStore.nextId('users');
        users.push({ id: id, loginId: loginId, password: password, nickname: nickname, role: 'member' });
        DataStore.save('users', users);
        DataStore.saveSession(id);
        return Auth.getCurrentUser();
    },

    // 역할: 아이디·비밀번호를 확인하고 로그인한다
    // 입력: loginId, password - 문자열
    // 출력: 로그인한 회원 { id, loginId, nickname, role }
    // 오류: 없는 아이디이거나 비밀번호가 다르면 '아이디 또는 비밀번호가 맞지 않습니다'
    login: function (loginId, password) {
        const users = DataStore.load('users');
        for (let i = 0; i < users.length; i++) {
            if (users[i].loginId === loginId && users[i].password === password) {
                DataStore.saveSession(users[i].id);
                return Auth.getCurrentUser();
            }
        }
        throw new Error('아이디 또는 비밀번호가 맞지 않습니다');
    },

    // 역할: 로그아웃한다
    // 입력: 없음
    // 출력: 없음
    // 오류: 없음 (로그인 안 한 상태에서 불러도 됨)
    logout: function () {
        DataStore.clearSession();
    },

    // ───────── 즐겨찾기 (P1) ─────────

    // 역할: 즐겨찾기를 켜거나 끈다 (있으면 지우고, 없으면 추가)
    // 입력: targetType - 'cafe' | 'menu', targetId - 카페 id 또는 메뉴 id
    // 출력: true(추가됨) / false(해제됨)
    // 오류: '로그인이 필요합니다' / '카페를 찾을 수 없습니다' / '메뉴를 찾을 수 없습니다'
    //       targetType이 'cafe', 'menu'가 아니면 '알 수 없는 즐겨찾기 종류입니다' (개발 중 실수 확인용)
    toggleFavorite: function (targetType, targetId) {
        const user = Auth.requireLogin();
        if (targetType === 'cafe') {
            Cafes.getCafe(targetId);
        } else if (targetType === 'menu') {
            Cafes.getMenu(targetId);
        } else {
            throw new Error('알 수 없는 즐겨찾기 종류입니다: ' + targetType);
        }
        const favorites = DataStore.load('favorites');
        for (let i = 0; i < favorites.length; i++) {
            const fav = favorites[i];
            if (fav.userId === user.id && fav.targetType === targetType && fav.targetId === targetId) {
                favorites.splice(i, 1);
                DataStore.save('favorites', favorites);
                return false;
            }
        }
        favorites.push({ userId: user.id, targetType: targetType, targetId: targetId });
        DataStore.save('favorites', favorites);
        return true;
    },

    // 역할: 즐겨찾기에 들어 있는지 확인한다
    // 입력: targetType - 'cafe' | 'menu', targetId - 카페 id 또는 메뉴 id
    // 출력: true / false (로그인 안 했으면 false)
    // 오류: 없음
    isFavorite: function (targetType, targetId) {
        const user = Auth.getCurrentUser();
        if (user === null) {
            return false;
        }
        const favorites = DataStore.load('favorites');
        for (let i = 0; i < favorites.length; i++) {
            const fav = favorites[i];
            if (fav.userId === user.id && fav.targetType === targetType && fav.targetId === targetId) {
                return true;
            }
        }
        return false;
    },

    // 역할: 내 즐겨찾기 목록을 돌려준다 (마이페이지용)
    // 입력: 없음
    // 출력: { cafes: CafeItem[], menus: MenuItem[] } 각각 추가한 순서대로
    // 오류: '로그인이 필요합니다'
    getFavorites: function () {
        const user = Auth.requireLogin();
        const favorites = DataStore.load('favorites');
        const result = { cafes: [], menus: [] };
        for (let i = 0; i < favorites.length; i++) {
            const fav = favorites[i];
            if (fav.userId !== user.id) {
                continue;
            }
            if (fav.targetType === 'cafe') {
                result.cafes.push(Cafes.getCafe(fav.targetId).cafe);
            } else {
                result.menus.push(Cafes.getMenu(fav.targetId));
            }
        }
        return result;
    },

    // ───────── 사장 기능 ─────────

    // 역할: 로그인한 사장의 카페를 돌려준다
    // 입력: 없음
    // 출력: CafeItem
    // 오류: '로그인이 필요합니다' / 사장이 아니거나 맡은 카페가 없으면 '이 카페를 관리할 권한이 없습니다'
    getMyCafe: function () {
        const user = Auth.requireLogin();
        const cafes = DataStore.load('cafes');
        for (let i = 0; i < cafes.length; i++) {
            if (cafes[i].ownerId === user.id) {
                Auth.requireOwnerOf(cafes[i].id);
                return Cafes.getCafe(cafes[i].id).cafe;
            }
        }
        throw new Error('이 카페를 관리할 권한이 없습니다');
    },

    // 역할: 카페 정보(이름, 위치 설명, 영업시간)를 고친다 (P1)
    // 입력: cafeId - 카페 id, info - { name, locationText, openHours }
    //       name은 앞뒤 공백을 지워 저장(비면 오류), locationText·openHours는 비어도 됨(문자열이 아니면 고치지 않음)
    // 출력: 수정된 CafeItem
    // 오류: '로그인이 필요합니다' / '카페를 찾을 수 없습니다' / '이 카페를 관리할 권한이 없습니다'
    //       '카페 이름을 입력해 주세요'
    updateCafe: function (cafeId, info) {
        Auth.requireOwnerOf(cafeId);
        const name = typeof info.name === 'string' ? info.name.trim() : '';
        if (name === '') {
            throw new Error('카페 이름을 입력해 주세요');
        }
        const cafes = DataStore.load('cafes');
        for (let i = 0; i < cafes.length; i++) {
            if (cafes[i].id === cafeId) {
                cafes[i].name = name;
                if (typeof info.locationText === 'string') {
                    cafes[i].locationText = info.locationText;
                }
                if (typeof info.openHours === 'string') {
                    cafes[i].openHours = info.openHours;
                }
            }
        }
        DataStore.save('cafes', cafes);
        return Cafes.getCafe(cafeId).cafe;
    },

    // 역할: 내 카페에 메뉴를 추가한다
    // 입력: cafeId - 카페 id, menu - { name, typeId, price, options }
    //       name은 앞뒤 공백을 잘라 저장, options가 문자열이 아니면 ''
    // 출력: 새 MenuItem
    // 오류: '로그인이 필요합니다' / '카페를 찾을 수 없습니다' / '이 카페를 관리할 권한이 없습니다'
    //       '메뉴 이름을 입력해 주세요' / '메뉴 타입을 골라 주세요' / '가격은 0보다 큰 숫자로 써 주세요'
    addMenu: function (cafeId, menu) {
        Auth.requireOwnerOf(cafeId);
        if (typeof menu.name !== 'string' || menu.name.trim() === '') {
            throw new Error('메뉴 이름을 입력해 주세요');
        }
        const menuTypes = DataStore.load('menuTypes');
        let typeFound = false;
        for (let i = 0; i < menuTypes.length; i++) {
            if (menuTypes[i].id === menu.typeId) {
                typeFound = true;
            }
        }
        if (!typeFound) {
            throw new Error('메뉴 타입을 골라 주세요');
        }
        if (!Number.isInteger(menu.price) || menu.price <= 0) {
            throw new Error('가격은 0보다 큰 숫자로 써 주세요');
        }
        const menus = DataStore.load('menus');
        const id = DataStore.nextId('menus');
        menus.push({
            id: id,
            cafeId: cafeId,
            typeId: menu.typeId,
            name: menu.name.trim(),
            price: menu.price,
            options: typeof menu.options === 'string' ? menu.options : ''
        });
        DataStore.save('menus', menus);
        return Cafes.getMenu(id);
    },

    // 역할: 내 카페 메뉴의 가격을 바꾼다
    // 입력: menuId - 메뉴 id, price - 0보다 큰 정수
    // 출력: 수정된 MenuItem
    // 오류: '메뉴를 찾을 수 없습니다' / '로그인이 필요합니다' / '이 카페를 관리할 권한이 없습니다'
    //       '가격은 0보다 큰 숫자로 써 주세요'
    updatePrice: function (menuId, price) {
        const menus = DataStore.load('menus');
        const target = Account.findMyMenu(menus, menuId);
        if (!Number.isInteger(price) || price <= 0) {
            throw new Error('가격은 0보다 큰 숫자로 써 주세요');
        }
        target.price = price;
        DataStore.save('menus', menus);
        return Cafes.getMenu(menuId);
    },

    // 역할: 내 카페 메뉴의 이름과 타입을 바꾼다
    //       타입이 바뀌면 그 메뉴 리뷰의 예전 타입 평가 버튼을 지우고(공통 버튼은 남김) 비교함에서 뺀다
    // 입력: menuId - 메뉴 id, info - { name, typeId }
    //       name은 앞뒤 공백을 잘라 저장, typeId는 있는 메뉴 타입 id
    // 출력: 수정된 MenuItem
    // 오류: '메뉴를 찾을 수 없습니다' / '로그인이 필요합니다' / '이 카페를 관리할 권한이 없습니다'
    //       '메뉴 이름을 입력해 주세요' / '메뉴 타입을 골라 주세요'
    updateMenu: function (menuId, info) {
        const menus = DataStore.load('menus');
        const target = Account.findMyMenu(menus, menuId);
        if (typeof info.name !== 'string' || info.name.trim() === '') {
            throw new Error('메뉴 이름을 입력해 주세요');
        }
        const menuTypes = DataStore.load('menuTypes');
        let typeFound = false;
        for (let i = 0; i < menuTypes.length; i++) {
            if (menuTypes[i].id === info.typeId) {
                typeFound = true;
            }
        }
        if (!typeFound) {
            throw new Error('메뉴 타입을 골라 주세요');
        }

        const typeChanged = target.typeId !== info.typeId;
        target.name = info.name.trim();
        target.typeId = info.typeId;
        DataStore.save('menus', menus);

        if (typeChanged) {
            // 새 타입 버튼이나 공통 버튼(typeId null)만 남긴다
            const evalTags = DataStore.load('evalTags');
            const allowedIds = [];
            for (let i = 0; i < evalTags.length; i++) {
                if (evalTags[i].typeId === null || evalTags[i].typeId === info.typeId) {
                    allowedIds.push(evalTags[i].id);
                }
            }
            const reviews = DataStore.load('reviews');
            for (let i = 0; i < reviews.length; i++) {
                if (reviews[i].menuId === menuId) {
                    reviews[i].tagIds = reviews[i].tagIds.filter(function (tagId) {
                        return allowedIds.indexOf(tagId) !== -1;
                    });
                }
            }
            DataStore.save('reviews', reviews);
            Compare.removeFromBox(menuId);
        }
        return Cafes.getMenu(menuId);
    },

    // 역할: 내 카페 메뉴를 지운다. 그 메뉴의 리뷰, 모든 회원의 메뉴 즐겨찾기, 비교함 항목도 함께 지운다
    // 입력: menuId - 메뉴 id
    // 출력: 지우기 전의 MenuItem
    // 오류: '메뉴를 찾을 수 없습니다' / '로그인이 필요합니다' / '이 카페를 관리할 권한이 없습니다'
    deleteMenu: function (menuId) {
        const menus = DataStore.load('menus');
        Account.findMyMenu(menus, menuId);
        const deleted = Cafes.getMenu(menuId);

        DataStore.save('menus', menus.filter(function (menu) {
            return menu.id !== menuId;
        }));
        DataStore.save('reviews', DataStore.load('reviews').filter(function (review) {
            return review.menuId !== menuId;
        }));
        DataStore.save('favorites', DataStore.load('favorites').filter(function (fav) {
            return !(fav.targetType === 'menu' && fav.targetId === menuId);
        }));
        Compare.removeFromBox(menuId);
        return deleted;
    },

    // 역할: 메뉴 목록에서 id로 메뉴를 찾고, 로그인한 사장의 카페 메뉴인지 확인한다 (Account 안에서만 사용)
    // 입력: menus - DataStore.load('menus')로 읽은 배열, menuId - 메뉴 id
    // 출력: menus 안의 그 메뉴 객체 (고치면 menus가 바뀌므로 저장할 때 menus를 save)
    // 오류: '메뉴를 찾을 수 없습니다' / '로그인이 필요합니다' / '이 카페를 관리할 권한이 없습니다'
    findMyMenu: function (menus, menuId) {
        let target = null;
        for (let i = 0; i < menus.length; i++) {
            if (menus[i].id === menuId) {
                target = menus[i];
            }
        }
        if (target === null) {
            throw new Error('메뉴를 찾을 수 없습니다');
        }
        Auth.requireOwnerOf(target.cafeId);
        return target;
    }
};
