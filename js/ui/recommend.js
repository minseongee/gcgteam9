// 추천 화면: 메뉴 타입·예산·원하는 맛·위치를 골라 추천 메뉴 3개 보기
// 부르는 기능 함수: Cafes.getMenuTypes, Compare.recommend

(function () {
    const app = document.getElementById('app');
    const QUICK_BUDGETS = [2000, 3000, 4000, 5000];
    const AREAS = [
        { key: 'all', label: '전체' },
        { key: 'campus', label: '교내만' },
        { key: 'nearby', label: '근처만' }
    ];
    const state = {
        typeId: null,
        tagIds: [],
        area: 'all'
    };
    let types = [];
    let tasteBox = null;
    let budgetInput = null;
    let budgetChips = null;
    let resultBox = null;

    // 역할: 칩 하나를 만든다 (선택됨 표시 포함)
    // 입력: text - 글자, isOn - 선택됐는지, onClick - 눌렀을 때 할 일
    // 출력: <button class="chip"> 요소
    function makeChip(text, isOn, onClick) {
        const chip = el('button', 'chip', text);
        chip.type = 'button';
        chip.classList.toggle('is-selected', isOn);
        chip.setAttribute('aria-pressed', String(isOn));
        chip.addEventListener('click', onClick);
        return chip;
    }

    // 역할: 질문 묶음(번호 붙은 제목 + 내용)을 만든다
    // 입력: titleText - 제목, noteText - 제목 옆 작은 글자('' 가능)
    // 출력: { box, body } (body에 칩 등을 넣음)
    function makeQuestion(titleText, noteText) {
        const box = el('fieldset', 'rec-question');
        const legend = el('legend', 'rec-q', titleText);
        if (noteText !== '') {
            legend.appendChild(el('span', 'muted rec-q-note', ' ' + noteText));
        }
        box.appendChild(legend);
        const body = el('div', 'chip-row');
        box.appendChild(body);
        return { box: box, body: body };
    }

    // 역할: '원하는 맛' 칩을 고른 타입의 평가 버튼(공통 포함)으로 다시 그린다
    // 입력: 없음
    // 출력: 없음
    function renderTastes() {
        tasteBox.textContent = '';
        const type = types.find(function (item) {
            return item.id === state.typeId;
        });
        if (type === undefined) {
            tasteBox.appendChild(el('span', 'muted small', '먼저 메뉴 타입을 골라 주세요.'));
            return;
        }
        for (let i = 0; i < type.tags.length; i++) {
            const tag = type.tags[i];
            tasteBox.appendChild(makeChip(tag.label, state.tagIds.includes(tag.id), function () {
                const index = state.tagIds.indexOf(tag.id);
                if (index === -1) {
                    state.tagIds.push(tag.id);
                } else {
                    state.tagIds.splice(index, 1);
                }
                renderTastes();
            }));
        }
    }

    // 역할: 예산 빠른 칩을 입력칸 값에 맞춰 다시 그린다
    // 입력: 없음
    // 출력: 없음
    function renderBudgetChips() {
        budgetChips.textContent = '';
        for (let i = 0; i < QUICK_BUDGETS.length; i++) {
            const amount = QUICK_BUDGETS[i];
            budgetChips.appendChild(makeChip(amount.toLocaleString('ko-KR'), Number(budgetInput.value) === amount, function () {
                budgetInput.value = amount;
                renderBudgetChips();
            }));
        }
    }

    // 역할: 추천 결과 카드들을 그린다
    // 입력: results - Compare.recommend 결과 [{ rank, menu, score, reason }]
    // 출력: 없음
    function renderResults(results) {
        resultBox.textContent = '';
        resultBox.hidden = false;
        resultBox.appendChild(el('h2', 'section-title', '추천 결과 ' + results.length + '개'));
        if (results.length === 0) {
            resultBox.appendChild(el('p', 'empty', '조건에 맞는 메뉴가 없어요. 예산을 늘려 보세요'));
            return;
        }
        for (let i = 0; i < results.length; i++) {
            const item = results[i];
            const card = el('a', 'card rec-card');
            card.href = 'menu.html?id=' + item.menu.id;
            if (item.rank === 1) {
                card.classList.add('is-first');
            }
            card.appendChild(el('span', 'rec-rank', item.rank));
            const body = el('span', 'rec-body');
            const name = el('span', 'rec-name', item.menu.name);
            name.appendChild(el('span', 'muted rec-cafe', ' · ' + item.menu.cafeName));
            body.appendChild(name);
            const line = el('span', 'rec-line');
            if (item.menu.avgRating === null) {
                line.appendChild(el('span', 'rating is-none', '리뷰 없음'));
            } else {
                line.appendChild(el('span', 'rating', formatRating(item.menu.avgRating)));
            }
            line.appendChild(document.createTextNode(' · ' + formatPrice(item.menu.price)));
            body.appendChild(line);
            body.appendChild(el('span', 'rec-reason', item.reason));
            card.appendChild(body);
            resultBox.appendChild(card);
        }
    }

    // 역할: 화면 전체(조건 폼 4개 + 추천받기 버튼 + 결과 자리)를 그린다
    // 입력: 없음
    // 출력: 없음
    function render() {
        renderHeader('추천', false);
        renderTabBar('recommend');
        types = Cafes.getMenuTypes();

        const form = el('form', 'card rec-form');
        // 입력 검사는 Compare.recommend가 하고 오류 문구를 돌려주므로, 브라우저 자체 검사(step 등)는 끈다
        form.noValidate = true;

        const typeQ = makeQuestion('1. 메뉴 타입', '(필수)');
        // 역할: 타입 칩을 다시 그린다 (타입을 바꾸면 고른 맛은 비움)
        // 입력: 없음
        // 출력: 없음
        function renderTypes() {
            typeQ.body.textContent = '';
            for (let i = 0; i < types.length; i++) {
                const type = types[i];
                typeQ.body.appendChild(makeChip(type.name, type.id === state.typeId, function () {
                    if (state.typeId !== type.id) {
                        state.typeId = type.id;
                        state.tagIds = [];
                    }
                    renderTypes();
                    renderTastes();
                }));
            }
        }
        form.appendChild(typeQ.box);

        const budgetBox = el('div', 'rec-question');
        const budgetLabel = el('label', 'rec-q', '2. 예산');
        budgetLabel.htmlFor = 'budget';
        budgetBox.appendChild(budgetLabel);
        const budgetRow = el('div', 'rec-budget');
        budgetInput = el('input', 'input rec-budget-input');
        budgetInput.id = 'budget';
        budgetInput.type = 'number';
        budgetInput.min = '0';
        budgetInput.step = '500';
        budgetInput.placeholder = '없음';
        budgetInput.addEventListener('input', renderBudgetChips);
        budgetRow.appendChild(budgetInput);
        budgetRow.appendChild(el('span', '', '원 이하'));
        budgetBox.appendChild(budgetRow);
        budgetChips = el('div', 'chip-row rec-quick');
        budgetBox.appendChild(budgetChips);
        budgetBox.appendChild(el('span', 'muted small', '비워 두면 가격은 따지지 않아요.'));
        form.appendChild(budgetBox);

        const tasteQ = makeQuestion('3. 원하는 맛', '(최대 3개)');
        tasteBox = tasteQ.body;
        form.appendChild(tasteQ.box);

        const areaQ = makeQuestion('4. 위치', '');
        const areaGroup = el('div', 'segmented rec-area');
        for (let i = 0; i < AREAS.length; i++) {
            const button = el('button', '', AREAS[i].label);
            button.type = 'button';
            button.classList.toggle('is-selected', AREAS[i].key === state.area);
            button.setAttribute('aria-pressed', String(AREAS[i].key === state.area));
            button.addEventListener('click', function () {
                state.area = AREAS[i].key;
                const all = areaGroup.querySelectorAll('button');
                for (let k = 0; k < all.length; k++) {
                    all[k].classList.toggle('is-selected', k === i);
                    all[k].setAttribute('aria-pressed', String(k === i));
                }
            });
            areaGroup.appendChild(button);
        }
        areaQ.body.replaceWith(areaGroup);
        form.appendChild(areaQ.box);

        const submit = el('button', 'btn btn-primary btn-large btn-block', '추천받기');
        submit.type = 'submit';
        form.appendChild(submit);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            try {
                const budgetText = budgetInput.value.trim();
                const results = Compare.recommend({
                    typeId: state.typeId,
                    budget: budgetText === '' ? null : Number(budgetText),
                    tagIds: state.tagIds.slice(),
                    area: state.area
                });
                renderResults(results);
                resultBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                showError(e.message);
            }
        });
        app.appendChild(form);

        resultBox = el('section', 'section');
        resultBox.hidden = true;
        app.appendChild(resultBox);

        renderTypes();
        renderBudgetChips();
        renderTastes();
    }

    try {
        render();
    } catch (e) {
        showError(e.message);
    }
})();
