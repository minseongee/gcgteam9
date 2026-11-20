// 사장 관리 화면: 카페 정보 수정, 메뉴 가격 변경, 메뉴 이름·타입 수정과 삭제, 새 메뉴 추가 (사장 계정만)
// 부르는 기능 함수: Auth.getCurrentUser, Account.getMyCafe, Cafes.getCafe, Cafes.getMenuTypes,
//                   Account.updateCafe, Account.updatePrice, Account.updateMenu, Account.deleteMenu, Account.addMenu

(function () {
    const app = document.getElementById('app');
    let cafe = null;
    let header = null;
    let menuBox = null;

    // 역할: 이름표 + 입력칸 하나를 만든다
    // 입력: labelText - 이름표, type - input type, value - 처음 값, placeholder - 안내 글자
    // 출력: { field, input }
    function makeField(labelText, type, value, placeholder) {
        const field = el('label', 'field owner-field', labelText);
        const input = el('input', 'input');
        input.type = type;
        input.value = value;
        input.placeholder = placeholder;
        field.appendChild(input);
        return { field: field, input: input };
    }

    // 역할: 위쪽 제목을 '내 카페 관리 · 카페 이름'으로 쓴다
    // 입력: 없음
    // 출력: 없음
    function renderTitle() {
        header.querySelector('.header-title').textContent = '내 카페 관리 · ' + cafe.name;
    }

    // 역할: 카페 정보 입력칸(이름·위치 설명·영업시간)과 저장 버튼을 그린다
    // 입력: 없음
    // 출력: 없음
    function renderCafeInfo() {
        const section = el('section', 'section');
        section.appendChild(el('h2', 'owner-title', '카페 정보'));
        const name = makeField('카페 이름', 'text', cafe.name, '');
        const place = makeField('위치 설명', 'text', cafe.locationText, '예: [건물 1] 1층');
        const hours = makeField('영업시간', 'text', cafe.openHours, '예: 평일 08:30-19:00');
        section.appendChild(name.field);
        section.appendChild(place.field);
        section.appendChild(hours.field);

        const save = el('button', 'btn btn-outline', '카페 정보 저장');
        save.type = 'button';
        save.addEventListener('click', function () {
            try {
                cafe = Account.updateCafe(cafe.id, {
                    name: name.input.value,
                    locationText: place.input.value.trim(),
                    openHours: hours.input.value.trim()
                });
                name.input.value = cafe.name;
                renderTitle();
                showNotice('카페 정보를 저장했어요');
            } catch (e) {
                showError(e.message);
            }
        });
        section.appendChild(save);
        app.appendChild(section);
    }

    // 역할: 메뉴 타입 고르는 select를 만든다 (메뉴 추가 폼, 메뉴 수정 칸에서 같이 씀)
    // 입력: selectedId - 처음에 골라 둘 타입 id (없으면 null)
    // 출력: select 요소
    function makeTypeSelect(selectedId) {
        const select = el('select', 'input');
        const types = Cafes.getMenuTypes();
        for (let i = 0; i < types.length; i++) {
            const option = el('option', '', types[i].name);
            option.value = types[i].id;
            option.selected = types[i].id === selectedId;
            select.appendChild(option);
        }
        return select;
    }

    // 역할: 메뉴 한 줄 아래에 펼치는 수정 칸(이름, 타입, 삭제·취소·저장)을 만든다
    // 입력: menu - MenuItem, close - 수정 칸을 닫는 함수
    // 출력: 수정 칸 요소
    function makeEditPanel(menu, close) {
        const panel = el('div', 'owner-edit');
        const name = makeField('메뉴 이름', 'text', menu.name, '');
        const typeField = el('label', 'field owner-field', '메뉴 타입');
        const select = makeTypeSelect(menu.typeId);
        typeField.appendChild(select);
        panel.appendChild(name.field);
        panel.appendChild(typeField);

        const actions = el('div', 'owner-edit-actions');
        const remove = el('button', 'btn btn-outline', '삭제');
        remove.type = 'button';
        remove.addEventListener('click', function () {
            let question = "'" + menu.name + "' 메뉴를 삭제할까요?";
            if (menu.reviewCount > 0) {
                question += ' 리뷰 ' + menu.reviewCount + '개도 함께 삭제돼요.';
            }
            if (!confirm(question)) {
                return;
            }
            try {
                const deleted = Account.deleteMenu(menu.id);
                renderMenus();
                showNotice("'" + deleted.name + "' 메뉴를 삭제했어요");
            } catch (e) {
                showError(e.message);
            }
        });
        const cancel = el('button', 'btn btn-outline', '취소');
        cancel.type = 'button';
        cancel.addEventListener('click', close);
        const save = el('button', 'btn btn-primary', '저장');
        save.type = 'button';
        save.addEventListener('click', function () {
            const typeId = Number(select.value);
            if (typeId !== menu.typeId && menu.reviewCount > 0) {
                const question = '타입을 바꾸면 이 메뉴 리뷰에 남은 ' + menu.typeName +
                    ' 평가 버튼이 지워지고, 비교함에서도 빠져요. 바꿀까요?';
                if (!confirm(question)) {
                    return;
                }
            }
            try {
                const updated = Account.updateMenu(menu.id, { name: name.input.value, typeId: typeId });
                renderMenus();
                showNotice("'" + updated.name + "' 메뉴를 저장했어요");
            } catch (e) {
                showError(e.message);
            }
        });
        actions.appendChild(remove);
        actions.appendChild(cancel);
        actions.appendChild(save);
        panel.appendChild(actions);
        return panel;
    }

    // 역할: 메뉴 목록(줄마다 가격 입력칸 + '변경')을 그린다. 메뉴 이름을 누르면 이름·타입 수정, 삭제 칸이 펼쳐진다
    //       메뉴를 추가·수정·삭제한 뒤에도 다시 부름 (타입이 바뀌면 묶음 위치도 바뀌므로)
    // 입력: 없음
    // 출력: 없음
    function renderMenus() {
        menuBox.textContent = '';
        const groups = Cafes.getCafe(cafe.id).menusByType;
        if (groups.length === 0) {
            menuBox.appendChild(el('p', 'empty', '아직 메뉴가 없어요. 아래에서 추가해 주세요.'));
            return;
        }
        const list = el('div', 'list-group');
        for (let i = 0; i < groups.length; i++) {
            for (let j = 0; j < groups[i].menus.length; j++) {
                const menu = groups[i].menus[j];
                const row = el('div', 'list-row owner-row');
                const main = el('button', 'list-main owner-menu-button');
                main.type = 'button';
                main.setAttribute('aria-expanded', 'false');
                main.appendChild(el('span', 'owner-menu-name', menu.name));
                main.appendChild(el('span', 'list-sub', menu.typeName));
                row.appendChild(main);

                let panel = null;
                const closePanel = function () {
                    panel.remove();
                    panel = null;
                    main.setAttribute('aria-expanded', 'false');
                };
                main.addEventListener('click', function () {
                    if (panel !== null) {
                        closePanel();
                        return;
                    }
                    panel = makeEditPanel(menu, closePanel);
                    row.after(panel);
                    main.setAttribute('aria-expanded', 'true');
                    panel.querySelector('input').focus();
                });

                const label = el('label', 'owner-price');
                label.appendChild(el('span', 'sr-only', menu.name + ' 가격'));
                const input = el('input', 'input');
                input.type = 'number';
                input.min = '1';
                input.step = '100';
                input.value = menu.price;
                label.appendChild(input);
                row.appendChild(label);

                const change = el('button', 'btn btn-outline owner-change', '변경');
                change.type = 'button';
                change.addEventListener('click', function () {
                    try {
                        const updated = Account.updatePrice(menu.id, Number(input.value));
                        input.value = updated.price;
                        showNotice(updated.name + ' 가격을 ' + formatPrice(updated.price) + '으로 바꿨어요');
                    } catch (e) {
                        showError(e.message);
                    }
                });
                row.appendChild(change);
                list.appendChild(row);
            }
        }
        menuBox.appendChild(list);
    }

    // 역할: 새 메뉴 추가 폼(이름, 타입, 가격, 옵션)을 그린다
    // 입력: 없음
    // 출력: 없음
    function renderAddForm() {
        const section = el('section', 'section owner-add');
        section.appendChild(el('h2', 'owner-title', '새 메뉴 추가'));
        const name = makeField('메뉴 이름', 'text', '', '예: 바닐라 라떼');
        section.appendChild(name.field);

        const pair = el('div', 'owner-pair');
        const typeField = el('label', 'field owner-field', '메뉴 타입');
        const select = makeTypeSelect(null);
        typeField.appendChild(select);
        const price = makeField('가격(원)', 'number', '', '0');
        price.input.min = '1';
        price.input.step = '100';
        pair.appendChild(typeField);
        pair.appendChild(price.field);
        section.appendChild(pair);

        const options = makeField('옵션 (선택)', 'text', '', '예: 샷 추가 +500');
        section.appendChild(options.field);

        const add = el('button', 'btn btn-primary', '메뉴 추가');
        add.type = 'button';
        add.addEventListener('click', function () {
            try {
                const menu = Account.addMenu(cafe.id, {
                    name: name.input.value,
                    typeId: Number(select.value),
                    price: Number(price.input.value),
                    options: options.input.value.trim()
                });
                name.input.value = '';
                price.input.value = '';
                options.input.value = '';
                renderMenus();
                showNotice("'" + menu.name + "' 메뉴를 추가했어요");
            } catch (e) {
                showError(e.message);
            }
        });
        section.appendChild(add);
        app.appendChild(section);
    }

    // 역할: 화면 전체를 그린다. 로그인 안 했으면 로그인 화면, 사장이 아니면 안내 후 홈으로
    // 입력: 없음
    // 출력: 없음
    function render() {
        header = renderHeader('내 카페 관리', true);
        renderTabBar('my');
        const user = Auth.getCurrentUser();
        if (user === null) {
            location.replace(loginUrl());
            return;
        }
        if (user.role !== 'owner') {
            alert('카페 사장 계정만 쓸 수 있는 화면이에요. 홈으로 이동합니다.');
            location.replace('index.html');
            return;
        }
        try {
            cafe = Account.getMyCafe();
            renderTitle();
            renderCafeInfo();

            const section = el('section', 'section');
            const head = el('div', 'row-between');
            head.appendChild(el('h2', 'owner-title', '메뉴 · 가격'));
            head.appendChild(el('span', 'muted small', '메뉴 이름을 누르면 수정·삭제'));
            section.appendChild(head);
            menuBox = el('div', '');
            section.appendChild(menuBox);
            app.appendChild(section);
            renderMenus();

            renderAddForm();
        } catch (e) {
            showError(e.message);
            app.appendChild(el('p', 'empty', e.message));
        }
    }

    render();
})();
