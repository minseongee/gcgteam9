// 카페 상세 화면: 카페 정보, 즐겨찾기, 카카오맵 링크, 타입별 메뉴 목록 (cafe.html?id=1)
// 부르는 기능 함수: Cafes.getCafe, Cafes.getMapLinks, Account.isFavorite, Account.toggleFavorite, Auth.getCurrentUser

(function () {
    const app = document.getElementById('app');
    const cafeId = getQueryNumber('id');

    // 역할: 헤더 오른쪽 즐겨찾기(하트) 버튼을 만든다. 로그인 안 했으면 누를 때 로그인 화면으로 보낸다
    // 입력: header - renderHeader가 돌려준 요소
    // 출력: 없음
    function addFavoriteButton(header) {
        const actions = el('div', 'header-actions');
        const button = el('button', 'icon-btn cafe-fav-btn');
        button.type = 'button';

        // 역할: 하트 모양과 읽어 줄 글자를 지금 상태로 맞춘다
        // 입력: isOn - 즐겨찾기 됐는지
        // 출력: 없음
        function paint(isOn) {
            button.textContent = '';
            button.appendChild(icon(isOn ? 'heart-filled' : 'heart'));
            button.setAttribute('aria-pressed', String(isOn));
            button.setAttribute('aria-label', isOn ? '즐겨찾기에서 빼기' : '즐겨찾기에 추가');
        }

        paint(Account.isFavorite('cafe', cafeId));
        button.addEventListener('click', function () {
            if (Auth.getCurrentUser() === null) {
                location.href = loginUrl();
                return;
            }
            try {
                const isOn = Account.toggleFavorite('cafe', cafeId);
                paint(isOn);
                showNotice(isOn ? '즐겨찾기에 추가했어요' : '즐겨찾기에서 뺐어요');
            } catch (e) {
                showError(e.message);
            }
        });
        actions.appendChild(button);
        header.appendChild(actions);
    }

    // 역할: 카페 정보 부분(이름·배지·위치·영업시간·평점, 카카오맵 버튼)을 그린다
    // 입력: cafe - CafeItem
    // 출력: 없음
    function renderInfo(cafe) {
        const info = el('section', 'section');
        info.appendChild(cafePhoto(cafe, 'cafe-hero'));
        const title = el('div', 'cafe-title');
        title.appendChild(el('h1', 'cafe-name', cafe.name));
        title.appendChild(areaBadge(cafe.area));
        info.appendChild(title);

        const list = el('dl', 'cafe-info');
        list.appendChild(el('dt', 'muted', '위치'));
        list.appendChild(el('dd', '', cafe.locationText));
        list.appendChild(el('dt', 'muted', '영업시간'));
        list.appendChild(el('dd', '', cafe.openHours));
        list.appendChild(el('dt', 'muted', '평균 평점'));
        const score = el('dd', '');
        if (cafe.avgRating === null) {
            score.appendChild(el('span', 'muted', '아직 리뷰 없음 · 메뉴 ' + cafe.menuCount + '개'));
        } else {
            score.appendChild(el('span', 'rating', formatRating(cafe.avgRating)));
            score.appendChild(el('span', 'muted', ' · 메뉴 ' + cafe.menuCount + '개, 리뷰 ' + cafe.reviewCount + '개'));
        }
        list.appendChild(score);
        info.appendChild(list);

        const links = Cafes.getMapLinks(cafe.id);
        const buttons = el('div', 'cafe-map-buttons');
        const view = el('a', 'btn btn-outline');
        view.href = links.view;
        view.target = '_blank';
        view.rel = 'noopener';
        view.appendChild(icon('pin', 18));
        view.appendChild(el('span', '', '카카오맵에서 보기'));
        const route = el('a', 'btn btn-primary');
        route.href = links.route;
        route.target = '_blank';
        route.rel = 'noopener';
        route.appendChild(icon('arrow', 18));
        route.appendChild(el('span', '', '길찾기'));
        buttons.appendChild(view);
        buttons.appendChild(route);
        info.appendChild(buttons);
        info.appendChild(el('p', 'muted small', '두 버튼 모두 카카오맵(앱 또는 모바일 웹)으로 이동해요.'));
        app.appendChild(info);
    }

    // 역할: 메뉴를 타입별로 묶은 목록을 그린다. 줄을 누르면 메뉴 상세로
    // 입력: menusByType - [{ typeId, typeName, menus }]
    // 출력: 없음
    function renderMenus(menusByType) {
        const section = el('section', 'section');
        section.appendChild(el('h2', 'section-title', '메뉴'));
        if (menusByType.length === 0) {
            section.appendChild(el('p', 'empty', '아직 등록된 메뉴가 없어요.'));
            app.appendChild(section);
            return;
        }
        const group = el('div', 'list-group');
        for (let i = 0; i < menusByType.length; i++) {
            group.appendChild(el('div', 'list-head', menusByType[i].typeName));
            const menus = menusByType[i].menus;
            for (let j = 0; j < menus.length; j++) {
                const row = el('a', 'list-row');
                row.href = 'menu.html?id=' + menus[j].id;
                row.appendChild(el('span', 'list-name', menus[j].name));
                const right = el('span', 'cafe-menu-right');
                if (menus[j].avgRating === null) {
                    right.appendChild(el('span', 'rating is-none', '리뷰 없음'));
                } else {
                    right.appendChild(el('span', 'rating', formatRating(menus[j].avgRating)));
                }
                right.appendChild(el('span', 'cafe-menu-price', formatPrice(menus[j].price)));
                row.appendChild(right);
                group.appendChild(row);
            }
        }
        section.appendChild(group);
        app.appendChild(section);
    }

    // 역할: 화면 전체를 그린다
    // 입력: 없음
    // 출력: 없음
    function render() {
        const header = renderHeader('카페 상세', true);
        renderTabBar('home');
        try {
            const detail = Cafes.getCafe(cafeId);
            addFavoriteButton(header);
            renderInfo(detail.cafe);
            renderMenus(detail.menusByType);
        } catch (e) {
            showError(e.message);
            app.appendChild(el('p', 'empty', e.message));
        }
    }

    render();
})();
