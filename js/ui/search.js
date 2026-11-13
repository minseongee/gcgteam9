// 검색 결과 화면: 검색어(?q=)로 메뉴·카페 찾기, 타입 필터·정렬, 비교함 담기
// 부르는 기능 함수: Cafes.searchMenus, Cafes.searchCafes, Cafes.getMenuTypes,
//                   Compare.getBox, Compare.addToBox, Compare.removeFromBox

(function () {
    const app = document.getElementById('app');
    const state = {
        keyword: new URLSearchParams(location.search).get('q') || '',
        tab: 'menu',      // 'menu' | 'cafe'
        typeId: null,     // null이면 전체
        sort: 'rating'    // 'rating' | 'price' | 'reviews'
    };
    const sortOptions = [
        { value: 'rating', label: '평점 높은순' },
        { value: 'price', label: '가격 낮은순' },
        { value: 'reviews', label: '리뷰 많은순' }
    ];
    let types = [];
    let filterBox = null;
    let resultBox = null;
    let boxBar = null;

    // 역할: 아래 '비교함 n / 4 · 비교하기' 막대의 숫자를 새로 쓴다
    // 입력: 없음
    // 출력: 없음
    function renderBoxBar() {
        boxBar.textContent = '';
        const count = el('span', '');
        count.appendChild(document.createTextNode('비교함 '));
        count.appendChild(el('strong', '', Compare.getBox().length));
        count.appendChild(document.createTextNode(' / 4'));
        boxBar.appendChild(count);
        boxBar.appendChild(el('span', 'search-box-go', '비교하기 →'));
    }

    // 역할: 메뉴 카드 하나를 만든다 (왼쪽은 메뉴 상세 링크, 오른쪽은 비교함 담기 버튼)
    // 입력: menu - MenuItem, inBox - 비교함에 이미 담겼는지
    // 출력: 카드 요소
    function makeMenuCard(menu, inBox) {
        const card = el('div', 'card search-card');

        const link = el('a', 'search-card-link');
        link.href = 'menu.html?id=' + menu.id;
        link.appendChild(el('span', 'search-card-name', menu.name));
        const area = menu.area === 'campus' ? '교내' : '근처';
        link.appendChild(el('span', 'muted search-card-sub', menu.cafeName + ' · ' + area + ' · ' + formatPrice(menu.price)));
        const score = el('span', 'search-card-score');
        if (menu.avgRating === null) {
            score.appendChild(el('span', 'muted', '아직 리뷰가 없어요'));
        } else {
            score.appendChild(el('span', 'rating', formatRating(menu.avgRating)));
            score.appendChild(el('span', 'muted small', '(' + menu.reviewCount + ')'));
            if (menu.topTag !== null) {
                score.appendChild(el('span', 'tag', menu.topTag.label + ' ' + menu.topTag.percent + '%'));
            }
        }
        link.appendChild(score);
        card.appendChild(link);

        const add = el('button', 'search-add-btn');
        add.type = 'button';
        add.setAttribute('aria-pressed', String(inBox));
        if (inBox) {
            add.classList.add('is-selected');
            add.setAttribute('aria-label', menu.cafeName + ' ' + menu.name + ' 비교함에서 빼기');
            add.appendChild(icon('check', 20));
        } else {
            add.setAttribute('aria-label', menu.cafeName + ' ' + menu.name + ' 비교함에 담기');
            add.appendChild(icon('plus', 20));
        }
        add.addEventListener('click', function () {
            try {
                if (inBox) {
                    Compare.removeFromBox(menu.id);
                } else {
                    Compare.addToBox(menu.id);
                }
                renderResults();
            } catch (e) {
                showError(e.message);
            }
        });
        card.appendChild(add);
        return card;
    }

    // 역할: 카페 카드 하나를 만든다 (홈의 카페 카드와 같은 모양)
    // 입력: cafe - CafeItem
    // 출력: <a class="card"> 요소
    function makeCafeCard(cafe) {
        const card = el('a', 'card cafe-card');
        card.href = 'cafe.html?id=' + cafe.id;
        const left = el('span', 'cafe-card-main');
        const title = el('span', 'cafe-card-title');
        title.appendChild(el('span', 'cafe-card-name', cafe.name));
        title.appendChild(areaBadge(cafe.area));
        left.appendChild(title);
        left.appendChild(el('span', 'muted cafe-card-sub', cafe.locationText + ' · 메뉴 ' + cafe.menuCount + '개'));
        card.appendChild(left);
        const right = el('span', 'cafe-card-score');
        if (cafe.avgRating === null) {
            right.appendChild(el('span', 'rating is-none', '리뷰 없음'));
        } else {
            right.appendChild(el('span', 'rating', formatRating(cafe.avgRating)));
            right.appendChild(el('span', 'muted small', '리뷰 ' + cafe.reviewCount));
        }
        card.appendChild(right);
        return card;
    }

    // 역할: 메뉴 탭의 타입 칩과 정렬 선택을 그린다 (카페 탭이면 숨김)
    // 입력: 없음
    // 출력: 없음
    function renderFilters() {
        filterBox.textContent = '';
        filterBox.hidden = state.tab !== 'menu';
        const chips = el('div', 'chip-row is-scroll');
        const all = [{ id: null, name: '전체' }].concat(types);
        for (let i = 0; i < all.length; i++) {
            const chip = el('button', 'chip', all[i].name);
            chip.type = 'button';
            chip.setAttribute('aria-pressed', String(all[i].id === state.typeId));
            if (all[i].id === state.typeId) {
                chip.classList.add('is-selected');
            }
            chip.addEventListener('click', function () {
                state.typeId = all[i].id;
                renderFilters();
                renderResults();
            });
            chips.appendChild(chip);
        }
        filterBox.appendChild(chips);
    }

    // 역할: 결과 개수 줄과 결과 카드들을 그린다
    // 입력: 없음
    // 출력: 없음
    function renderResults() {
        resultBox.textContent = '';
        const summary = el('div', 'row-between');
        const keywordText = state.keyword === '' ? '' : "'" + state.keyword + "' ";

        if (state.tab === 'cafe') {
            const cafes = Cafes.searchCafes(state.keyword, 'all');
            summary.appendChild(el('span', 'muted search-count', keywordText + '카페 결과 ' + cafes.length + '개'));
            resultBox.appendChild(summary);
            if (cafes.length === 0) {
                resultBox.appendChild(el('p', 'empty', '찾는 카페가 없어요. 다른 이름으로 검색해 보세요.'));
            }
            for (let i = 0; i < cafes.length; i++) {
                resultBox.appendChild(makeCafeCard(cafes[i]));
            }
            return;
        }

        const menus = Cafes.searchMenus(state.keyword, state.typeId, state.sort);
        let typeText = '';
        for (let i = 0; i < types.length; i++) {
            if (types[i].id === state.typeId) {
                typeText = types[i].name + ' ';
            }
        }
        summary.appendChild(el('span', 'muted search-count', keywordText + typeText + '결과 ' + menus.length + '개'));

        const sortLabel = el('label', 'search-sort muted', '정렬');
        const select = el('select', 'input search-sort-select');
        for (let i = 0; i < sortOptions.length; i++) {
            const option = el('option', '', sortOptions[i].label);
            option.value = sortOptions[i].value;
            option.selected = sortOptions[i].value === state.sort;
            select.appendChild(option);
        }
        select.addEventListener('change', function () {
            state.sort = select.value;
            renderResults();
        });
        sortLabel.appendChild(select);
        summary.appendChild(sortLabel);
        resultBox.appendChild(summary);

        if (menus.length === 0) {
            resultBox.appendChild(el('p', 'empty', '찾는 메뉴가 없어요. 다른 이름이나 타입으로 찾아보세요.'));
        }
        const box = Compare.getBox();
        for (let i = 0; i < menus.length; i++) {
            resultBox.appendChild(makeMenuCard(menus[i], box.includes(menus[i].id)));
        }
        renderBoxBar();
    }

    // 역할: 화면 틀(검색어 입력, 메뉴/카페 탭, 필터·결과 자리, 비교함 막대)을 만든다
    // 입력: 없음
    // 출력: 없음
    function render() {
        const header = renderHeader('', true);
        header.classList.add('search-header');
        const label = el('label', 'sr-only', '검색어');
        label.htmlFor = 'q';
        const input = el('input', 'input search-input');
        input.id = 'q';
        input.type = 'search';
        input.placeholder = '메뉴나 카페 이름으로 검색';
        input.value = state.keyword;
        input.addEventListener('input', function () {
            state.keyword = input.value.trim();
            renderResults();
        });
        header.appendChild(label);
        header.appendChild(input);
        renderTabBar('home');

        types = Cafes.getMenuTypes();

        const tabs = el('div', 'underline-tabs');
        const tabList = [
            { key: 'menu', label: '메뉴' },
            { key: 'cafe', label: '카페' }
        ];
        for (let i = 0; i < tabList.length; i++) {
            const button = el('button', '', tabList[i].label);
            button.type = 'button';
            button.setAttribute('aria-pressed', String(tabList[i].key === state.tab));
            if (tabList[i].key === state.tab) {
                button.classList.add('is-selected');
            }
            button.addEventListener('click', function () {
                state.tab = tabList[i].key;
                const buttons = tabs.querySelectorAll('button');
                for (let k = 0; k < buttons.length; k++) {
                    buttons[k].classList.toggle('is-selected', k === i);
                    buttons[k].setAttribute('aria-pressed', String(k === i));
                }
                renderFilters();
                renderResults();
            });
            tabs.appendChild(button);
        }
        app.appendChild(tabs);

        filterBox = el('div', 'section');
        resultBox = el('section', 'section');
        resultBox.setAttribute('aria-label', '검색 결과');
        app.appendChild(filterBox);
        app.appendChild(resultBox);

        const bar = el('div', 'bottom-bar');
        boxBar = el('a', 'search-box-bar');
        boxBar.href = 'compare.html';
        bar.appendChild(boxBar);
        document.body.appendChild(bar);
        app.classList.add('with-bottom-bar');

        renderFilters();
        renderResults();
        if (state.keyword === '') {
            input.focus();
        }
    }

    try {
        render();
    } catch (e) {
        showError(e.message);
    }
})();
