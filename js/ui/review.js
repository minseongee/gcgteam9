// 리뷰 쓰기 화면: 별점, 평가 버튼(여러 개), 한줄평 입력 후 저장 (review.html?menuId=3)
// 이미 쓴 리뷰가 있으면 그 내용을 채워서 열고, 저장하면 기존 리뷰를 고친다
// 부르는 기능 함수: Cafes.getMenu, Cafes.getMenuTypes, Reviews.getMyReview, Reviews.saveReview, Auth.getCurrentUser

(function () {
    const app = document.getElementById('app');
    const menuId = getQueryNumber('menuId');
    const COMMENT_MAX = 50;
    const state = {
        rating: 0,
        tagIds: []
    };

    // 역할: 별점 부분(별 5개 버튼 + 'n점')을 만든다
    // 입력: 없음
    // 출력: <section> 요소
    function makeStars() {
        const section = el('section', 'section');
        const title = el('h2', 'review-q', '별점 ');
        title.appendChild(el('span', 'muted review-q-note', '(필수)'));
        section.appendChild(title);

        const row = el('div', 'review-stars');
        const buttons = [];
        const label = el('span', 'review-star-label');

        // 역할: 별 색과 'n점' 글자를 지금 별점에 맞춘다
        // 입력: 없음
        // 출력: 없음
        function paint() {
            for (let i = 0; i < buttons.length; i++) {
                const isOn = i < state.rating;
                buttons[i].classList.toggle('is-on', isOn);
                buttons[i].setAttribute('aria-pressed', String(isOn));
            }
            label.textContent = state.rating === 0 ? '별을 눌러 주세요' : state.rating + '점';
        }

        for (let i = 1; i <= 5; i++) {
            const star = el('button', 'review-star', '★');
            star.type = 'button';
            star.setAttribute('aria-label', i + '점');
            star.addEventListener('click', function () {
                state.rating = i;
                paint();
            });
            buttons.push(star);
            row.appendChild(star);
        }
        row.appendChild(label);
        section.appendChild(row);
        paint();
        return section;
    }

    // 역할: 평가 버튼 부분(그 메뉴 타입 버튼 + 공통 버튼, 여러 개 토글)을 만든다
    // 입력: type - Cafes.getMenuTypes()의 한 타입 { id, name, tags }
    // 출력: <section> 요소
    function makeTags(type) {
        const section = el('section', 'section');
        const title = el('h2', 'review-q', '어땠나요? ');
        title.appendChild(el('span', 'muted review-q-note', '(여러 개 선택)'));
        section.appendChild(title);
        section.appendChild(el('p', 'muted small', "'" + type.name + "' 타입의 평가 버튼이에요. 메뉴 타입마다 버튼이 달라져요."));

        const chips = el('div', 'chip-row');
        const chipButtons = [];

        // 역할: 모든 칩의 선택 모양을 state.tagIds에 맞춘다
        // 입력: 없음
        // 출력: 없음
        function paint() {
            for (let i = 0; i < chipButtons.length; i++) {
                const isOn = state.tagIds.includes(type.tags[i].id);
                chipButtons[i].classList.toggle('is-selected', isOn);
                chipButtons[i].setAttribute('aria-pressed', String(isOn));
            }
        }

        for (let i = 0; i < type.tags.length; i++) {
            const tag = type.tags[i];
            const chip = el('button', 'chip', tag.label);
            chip.type = 'button';
            chip.addEventListener('click', function () {
                const index = state.tagIds.indexOf(tag.id);
                if (index !== -1) {
                    state.tagIds.splice(index, 1);
                } else {
                    // 반대 버튼이 켜져 있으면 끄고 이 버튼을 켠다 (예: '연해요'를 누르면 '진해요'가 꺼짐)
                    const oppositeId = tag.oppositeId;
                    state.tagIds = state.tagIds.filter(function (id) {
                        return id !== oppositeId;
                    });
                    state.tagIds.push(tag.id);
                }
                paint();
            });
            chipButtons.push(chip);
            chips.appendChild(chip);
        }
        paint();
        section.appendChild(chips);
        return section;
    }

    // 역할: 한줄평 입력칸과 글자 수 표시를 만든다
    // 입력: comment - 처음 채울 글자 ('' 가능)
    // 출력: { section, textarea }
    function makeComment(comment) {
        const section = el('section', 'section');
        const label = el('label', 'review-q', '한줄평 ');
        label.htmlFor = 'comment';
        label.appendChild(el('span', 'muted review-q-note', '(선택)'));
        section.appendChild(label);

        const textarea = el('textarea', 'input');
        textarea.id = 'comment';
        textarea.rows = 3;
        textarea.maxLength = COMMENT_MAX;
        textarea.placeholder = '이 메뉴를 한 줄로 알려 주세요';
        textarea.value = comment;
        section.appendChild(textarea);

        const counter = el('span', 'muted small review-counter');
        // 역할: 글자 수 표시를 새로 쓴다
        // 입력: 없음
        // 출력: 없음
        function count() {
            counter.textContent = textarea.value.length + ' / ' + COMMENT_MAX;
        }
        textarea.addEventListener('input', count);
        count();
        section.appendChild(counter);
        return { section: section, textarea: textarea };
    }

    // 역할: 화면 전체를 그린다. 로그인 안 했으면 로그인 화면으로 보낸다
    // 입력: 없음
    // 출력: 없음
    function render() {
        renderHeader('리뷰 쓰기', true);
        renderTabBar('home');
        if (Auth.getCurrentUser() === null) {
            location.replace(loginUrl());
            return;
        }
        try {
            const menu = Cafes.getMenu(menuId);
            const type = Cafes.getMenuTypes().find(function (item) {
                return item.id === menu.typeId;
            });
            const mine = Reviews.getMyReview(menuId);
            let comment = '';
            if (mine !== null) {
                state.rating = mine.rating;
                state.tagIds = mine.tags.map(function (tag) {
                    return tag.id;
                });
                comment = mine.comment;
            }

            const head = el('div', 'review-menu');
            head.appendChild(el('span', 'muted small', menu.cafeName + ' · ' + menu.typeName));
            head.appendChild(el('span', 'review-menu-name', menu.name));
            if (mine !== null) {
                head.appendChild(el('span', 'muted small', '이미 쓴 리뷰가 있어서 그 내용을 불러왔어요. 저장하면 고쳐져요.'));
            }
            app.appendChild(head);
            app.appendChild(makeStars());
            app.appendChild(makeTags(type));
            const commentPart = makeComment(comment);
            app.appendChild(commentPart.section);

            const bar = el('div', 'bottom-bar');
            const save = el('button', 'btn btn-primary btn-large', mine === null ? '저장하기' : '고쳐서 저장하기');
            save.type = 'button';
            save.addEventListener('click', function () {
                try {
                    Reviews.saveReview(menuId, state.rating, commentPart.textarea.value.trim(), state.tagIds);
                    // replace: 저장 뒤 '뒤로'를 눌러도 리뷰 쓰기 화면이 다시 열리지 않게
                    location.replace('menu.html?id=' + menuId);
                } catch (e) {
                    showError(e.message);
                }
            });
            bar.appendChild(save);
            document.body.appendChild(bar);
            app.classList.add('with-bottom-bar', 'review-form');
        } catch (e) {
            showError(e.message);
            app.appendChild(el('p', 'empty', e.message));
        }
    }

    render();
})();
