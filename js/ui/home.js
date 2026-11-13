// 홈 화면: 검색창, 추천 바로가기, 카페 목록 / 메뉴 목록 전환
// 부르는 기능 함수: Cafes.searchCafes, Cafes.getMenusByType

(function () {
    const app = document.getElementById('app');
    let currentArea = 'all';

    // 역할: 카페 카드 하나를 만든다 (배달 앱처럼 위에 큰 사진, 아래에 이름·평점·위치·배지)
    // 입력: cafe - CafeItem
    // 출력: <a class="cafe-card"> 요소 (누르면 cafe.html?id=)
    function makeCafeCard(cafe) {
        const card = el('a', 'cafe-card');
        card.href = 'cafe.html?id=' + cafe.id;
        card.appendChild(cafePhoto(cafe, 'cafe-card-photo'));
        const body = el('span', 'cafe-card-body');
        card.appendChild(body);

        const title = el('span', 'cafe-card-title');
        title.appendChild(el('span', 'cafe-card-name', cafe.name));
        if (cafe.avgRating === null) {
            title.appendChild(el('span', 'cafe-card-noreview', '리뷰 없음'));
        } else {
            const star = el('span', 'cafe-card-star', '★');
            star.setAttribute('aria-hidden', 'true');
            title.appendChild(star);
            const rating = el('span', 'cafe-card-rating', cafe.avgRating.toFixed(1));
            rating.setAttribute('aria-label', '평점 ' + cafe.avgRating.toFixed(1));
            title.appendChild(rating);
            const count = el('span', 'cafe-card-count', '(' + cafe.reviewCount + ')');
            count.setAttribute('aria-label', '리뷰 ' + cafe.reviewCount + '개');
            title.appendChild(count);
        }
        body.appendChild(title);

        const meta = el('span', 'cafe-card-meta');
        meta.appendChild(icon('pin', 16));
        meta.appendChild(el('span', '', cafe.locationText));
        const dot = el('span', 'cafe-card-dot', '·');
        dot.setAttribute('aria-hidden', 'true');
        meta.appendChild(dot);
        meta.appendChild(el('span', '', '메뉴 ' + cafe.menuCount + '개'));
        body.appendChild(meta);

        const tags = el('span', 'cafe-card-tags');
        tags.appendChild(areaBadge(cafe.area));
        body.appendChild(tags);
        return card;
    }

    // 역할: 카페 목록(위치 칩 + 카드)을 그린다
    // 입력: box - 그릴 자리
    // 출력: 없음
    function renderCafeView(box) {
        box.textContent = '';
        const areas = [
            { key: 'all', label: '전체' },
            { key: 'campus', label: '교내' },
            { key: 'nearby', label: '근처' }
        ];
        const top = el('div', 'row-between');
        const chips = el('div', 'chip-row');
        for (let i = 0; i < areas.length; i++) {
            const count = Cafes.searchCafes('', areas[i].key).length;
            const chip = el('button', 'chip', areas[i].label + ' ' + count);
            chip.type = 'button';
            chip.setAttribute('aria-pressed', String(areas[i].key === currentArea));
            if (areas[i].key === currentArea) {
                chip.classList.add('is-selected');
            }
            chip.addEventListener('click', function () {
                currentArea = areas[i].key;
                renderCafeView(box);
            });
            chips.appendChild(chip);
        }
        top.appendChild(chips);
        top.appendChild(el('span', 'muted small', '평점순'));
        box.appendChild(top);

        const cafes = Cafes.searchCafes('', currentArea);
        if (cafes.length === 0) {
            box.appendChild(el('p', 'empty', '카페가 없어요.'));
        }
        for (let i = 0; i < cafes.length; i++) {
            box.appendChild(makeCafeCard(cafes[i]));
        }
    }

    // 역할: 메뉴 목록(타입 바로가기 칩 + 타입별 묶음)을 그린다
    // 입력: box - 그릴 자리
    // 출력: 없음
    function renderMenuView(box) {
        box.textContent = '';
        const groups = Cafes.getMenusByType();

        const jump = el('nav', 'chip-row is-scroll');
        jump.setAttribute('aria-label', '메뉴 타입 바로가기');
        for (let i = 0; i < groups.length; i++) {
            const chip = el('a', 'chip', groups[i].typeName + ' ' + groups[i].menus.length);
            chip.href = '#type-' + groups[i].typeId;
            jump.appendChild(chip);
        }
        box.appendChild(jump);
        box.appendChild(el('p', 'muted small', '타입마다 평점 높은 순으로 보여요.'));

        for (let i = 0; i < groups.length; i++) {
            const group = el('div', 'list-group');
            group.id = 'type-' + groups[i].typeId;
            const head = el('div', 'list-head home-group-head');
            head.appendChild(el('h2', '', groups[i].typeName));
            head.appendChild(el('span', 'small', groups[i].menus.length + '개'));
            group.appendChild(head);

            for (let j = 0; j < groups[i].menus.length; j++) {
                const menu = groups[i].menus[j];
                const row = el('a', 'list-row');
                row.href = 'menu.html?id=' + menu.id;
                const main = el('span', 'list-main');
                main.appendChild(el('span', 'list-name', menu.name));
                main.appendChild(el('span', 'list-sub', menu.cafeName + ' · ' + formatPrice(menu.price)));
                row.appendChild(main);
                if (menu.avgRating === null) {
                    row.appendChild(el('span', 'rating is-none small', '리뷰 없음'));
                } else {
                    row.appendChild(el('span', 'rating', formatRating(menu.avgRating)));
                }
                group.appendChild(row);
            }
            box.appendChild(group);
        }
    }

    // 역할: 화면 전체를 그린다 (검색창, 추천 바로가기, 목록 전환 버튼, 두 목록)
    // 입력: 없음
    // 출력: 없음
    function render() {
        const header = renderHeader('교내 카페', false);
        header.querySelector('.page-title').classList.add('home-brand');
        renderTabBar('home');

        const search = el('a', 'search-link');
        search.href = 'search.html';
        search.appendChild(icon('search', 20));
        search.appendChild(el('span', '', '메뉴나 카페 이름으로 검색'));
        app.appendChild(search);

        const banner = el('a', 'banner');
        banner.href = 'recommend.html';
        const bannerText = el('span', 'banner-text');
        bannerText.appendChild(el('span', 'banner-title', '오늘 뭐 마시지?'));
        bannerText.appendChild(el('span', 'banner-sub', '예산과 원하는 맛으로 추천받기'));
        banner.appendChild(bannerText);
        banner.appendChild(icon('arrow', 20));
        app.appendChild(banner);

        const switcher = el('div', 'segmented');
        switcher.setAttribute('role', 'tablist');
        switcher.setAttribute('aria-label', '목록 보기');
        const cafeTab = el('button', 'is-selected', '카페 목록');
        const menuTab = el('button', '', '메뉴 목록');
        switcher.appendChild(cafeTab);
        switcher.appendChild(menuTab);
        app.appendChild(switcher);

        const cafeView = el('section', 'section');
        cafeView.setAttribute('aria-label', '카페 목록');
        const menuView = el('section', 'section');
        menuView.setAttribute('aria-label', '메뉴 목록');
        menuView.hidden = true;
        app.appendChild(cafeView);
        app.appendChild(menuView);

        const views = [
            { tab: cafeTab, view: cafeView },
            { tab: menuTab, view: menuView }
        ];
        for (let i = 0; i < views.length; i++) {
            views[i].tab.type = 'button';
            views[i].tab.setAttribute('role', 'tab');
            views[i].tab.setAttribute('aria-selected', String(i === 0));
            views[i].tab.addEventListener('click', function () {
                for (let k = 0; k < views.length; k++) {
                    views[k].tab.classList.toggle('is-selected', k === i);
                    views[k].tab.setAttribute('aria-selected', String(k === i));
                    views[k].view.hidden = k !== i;
                }
            });
        }

        renderCafeView(cafeView);
        renderMenuView(menuView);
    }

    try {
        render();
    } catch (e) {
        showError(e.message);
    }
})();
