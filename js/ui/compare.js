// 비교 화면: 비교함에 담긴 메뉴(같은 타입 2~4개)를 표로 비교, 항목별 1위 강조
// 부르는 기능 함수: Compare.getBox, Compare.compareMenus, Compare.removeFromBox, Cafes.getMenu

(function () {
    const app = document.getElementById('app');

    // 역할: 비교함 부분(담긴 메뉴 칩 + 빼기 버튼, '+ 추가')을 그린다
    // 입력: menus - 담긴 메뉴 MenuItem 배열
    // 출력: 없음
    function renderBox(menus) {
        const section = el('section', 'section');
        let title = '비교함 ' + menus.length + ' / 4';
        if (menus.length > 0) {
            title = title + ' · ' + menus[0].typeName;
        }
        section.appendChild(el('h2', 'compare-title', title));
        section.appendChild(el('p', 'muted small', '같은 메뉴 타입끼리만 비교할 수 있어요. 최대 4개.'));

        const chips = el('div', 'chip-row');
        for (let i = 0; i < menus.length; i++) {
            const menu = menus[i];
            const chip = el('span', 'compare-chip', menu.name + ' · ' + menu.cafeName);
            const remove = el('button', 'compare-remove');
            remove.type = 'button';
            remove.setAttribute('aria-label', menu.cafeName + ' ' + menu.name + ' 비교함에서 빼기');
            remove.appendChild(icon('x', 16));
            remove.addEventListener('click', function () {
                try {
                    Compare.removeFromBox(menu.id);
                    render();
                } catch (e) {
                    showError(e.message);
                }
            });
            chip.appendChild(remove);
            chips.appendChild(chip);
        }
        if (menus.length < 4) {
            const add = el('a', 'compare-add', '+ 추가');
            add.href = 'search.html';
            chips.appendChild(add);
        }
        section.appendChild(chips);
        app.appendChild(section);
    }

    // 역할: 표의 한 줄(항목 이름 + 메뉴별 값)을 만든다. best에 든 메뉴 칸은 강조
    // 입력: label - 항목 이름, rows - compareMenus의 rows, bestId - 그 항목 1위 메뉴 id(없으면 undefined),
    //       format - 한 줄(row)을 받아 칸 글자를 돌려주는 함수
    // 출력: <tr> 요소
    function makeTableRow(label, rows, bestId, format) {
        const tr = el('tr', '');
        const th = el('th', '', label);
        th.scope = 'row';
        tr.appendChild(th);
        for (let i = 0; i < rows.length; i++) {
            const td = el('td', '', format(rows[i]));
            if (bestId === rows[i].menu.id) {
                td.classList.add('is-best');
            }
            tr.appendChild(td);
        }
        return tr;
    }

    // 역할: 비교표를 그린다 (열 = 메뉴, 행 = 가격·평점·리뷰 수·평가 버튼들)
    // 입력: result - Compare.compareMenus 결과
    // 출력: 없음
    function renderTable(result) {
        const section = el('section', 'section');
        const scroll = el('div', 'table-scroll');
        const table = el('table', 'compare-table');
        table.style.minWidth = (96 + result.rows.length * 96) + 'px';

        const head = el('tr', '');
        const corner = el('th', '');
        corner.scope = 'col';
        head.appendChild(corner);
        for (let i = 0; i < result.rows.length; i++) {
            const menu = result.rows[i].menu;
            const th = el('th', 'compare-menu-head');
            th.scope = 'col';
            const link = el('a', '', menu.cafeName);
            link.href = 'menu.html?id=' + menu.id;
            th.appendChild(link);
            th.appendChild(el('span', 'muted compare-menu-name', menu.name));
            head.appendChild(th);
        }
        const thead = el('thead', '');
        thead.appendChild(head);
        table.appendChild(thead);

        const body = el('tbody', '');
        body.appendChild(makeTableRow('가격', result.rows, result.best.price, function (row) {
            return formatPrice(row.menu.price);
        }));
        body.appendChild(makeTableRow('평점', result.rows, result.best.rating, function (row) {
            return formatRating(row.menu.avgRating);
        }));
        body.appendChild(makeTableRow('리뷰 수', result.rows, result.best.reviewCount, function (row) {
            return row.menu.reviewCount;
        }));
        for (let i = 0; i < result.tags.length; i++) {
            const tag = result.tags[i];
            body.appendChild(makeTableRow(tag.label, result.rows, result.best[tag.id], function (row) {
                return row.tagPercents[tag.id] + '%';
            }));
        }
        table.appendChild(body);
        scroll.appendChild(table);
        section.appendChild(scroll);
        section.appendChild(el('p', 'muted small compare-note', '진하게 표시된 칸이 항목별 1위예요. 퍼센트는 리뷰에서 그 평가 버튼을 누른 비율이에요.'));
        app.appendChild(section);
    }

    // 역할: 화면 전체를 그린다 (빼기 버튼을 누른 뒤에도 다시 부름)
    // 입력: 없음
    // 출력: 없음
    function render() {
        app.textContent = '';
        try {
            const menus = Compare.getBox().map(function (id) {
                return Cafes.getMenu(id);
            });
            renderBox(menus);
            if (menus.length < 2) {
                const empty = el('div', 'empty');
                empty.appendChild(el('p', '', '메뉴를 2개 이상 담아 주세요'));
                const go = el('a', 'btn btn-primary compare-go', '메뉴 찾으러 가기');
                go.href = 'search.html';
                empty.appendChild(go);
                app.appendChild(empty);
                return;
            }
            renderTable(Compare.compareMenus(Compare.getBox()));
        } catch (e) {
            showError(e.message);
        }
    }

    renderHeader('비교', false);
    renderTabBar('compare');
    render();
})();
