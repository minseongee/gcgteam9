// 메뉴 상세 화면: 메뉴 정보, 즐겨찾기, 평점·평가 버튼 비율, 리뷰 목록, 비교함 담기·리뷰 쓰기 (menu.html?id=3)
// 부르는 기능 함수: Cafes.getMenu, Reviews.getReviewSummary, Compare.addToBox,
//                   Account.isFavorite, Account.toggleFavorite, Auth.getCurrentUser

(function () {
    const app = document.getElementById('app');
    const menuId = getQueryNumber('id');

    // 역할: 헤더 오른쪽 즐겨찾기(하트) 버튼을 만든다. 로그인 안 했으면 누를 때 로그인 화면으로 보낸다
    // 입력: header - renderHeader가 돌려준 요소
    // 출력: 없음
    function addFavoriteButton(header) {
        const actions = el('div', 'header-actions');
        const button = el('button', 'icon-btn menu-fav-btn');
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

        paint(Account.isFavorite('menu', menuId));
        button.addEventListener('click', function () {
            if (Auth.getCurrentUser() === null) {
                location.href = loginUrl();
                return;
            }
            try {
                const isOn = Account.toggleFavorite('menu', menuId);
                paint(isOn);
                showNotice(isOn ? '즐겨찾기에 추가했어요' : '즐겨찾기에서 뺐어요');
            } catch (e) {
                showError(e.message);
            }
        });
        actions.appendChild(button);
        header.appendChild(actions);
    }

    // 역할: 메뉴 정보 부분(카페 링크·타입, 이름, 가격, 옵션)을 그린다
    // 입력: menu - MenuItem
    // 출력: 없음
    function renderInfo(menu) {
        const info = el('section', 'menu-info');
        const meta = el('span', 'muted menu-meta');
        const cafeLink = el('a', '', menu.cafeName);
        cafeLink.href = 'cafe.html?id=' + menu.cafeId;
        meta.appendChild(cafeLink);
        meta.appendChild(document.createTextNode(' · ' + menu.typeName));
        info.appendChild(meta);
        info.appendChild(el('h1', 'menu-name', menu.name));
        info.appendChild(el('span', 'menu-price', formatPrice(menu.price)));
        if (menu.options !== '') {
            info.appendChild(el('span', 'muted menu-meta', '옵션: ' + menu.options));
        }
        app.appendChild(info);
    }

    // 역할: 평점 요약 상자(큰 평점·별·리뷰 수 + 평가 버튼 비율 막대 상위 5개)를 그린다
    // 입력: summary - Reviews.getReviewSummary 결과
    // 출력: 없음
    function renderSummary(summary) {
        const box = el('section', 'card menu-summary');
        const score = el('div', 'menu-score');
        if (summary.avgRating === null) {
            score.appendChild(el('span', 'menu-score-number is-none', '-'));
            score.appendChild(el('span', 'muted small', '아직 리뷰 없음'));
        } else {
            score.appendChild(el('span', 'menu-score-number', summary.avgRating.toFixed(1)));
            const stars = el('span', 'rating menu-score-stars', formatStars(summary.avgRating));
            stars.setAttribute('aria-label', '5점 만점에 ' + summary.avgRating.toFixed(1) + '점');
            score.appendChild(stars);
            score.appendChild(el('span', 'muted small', '리뷰 ' + summary.reviewCount + '개'));
        }
        box.appendChild(score);

        const bars = el('div', 'menu-bars');
        const top = summary.tagStats.slice(0, 5);
        for (let i = 0; i < top.length; i++) {
            const bar = el('div', 'menu-bar');
            bar.appendChild(el('span', '', top[i].label));
            const track = el('div', 'menu-bar-track');
            const fill = el('div', 'menu-bar-fill');
            fill.style.width = top[i].percent + '%';
            track.appendChild(fill);
            bar.appendChild(track);
            bar.appendChild(el('span', 'muted', top[i].percent + '% (' + top[i].count + ')'));
            bars.appendChild(bar);
        }
        box.appendChild(bars);
        app.appendChild(box);
    }

    // 역할: 리뷰 카드 하나를 만든다 (닉네임·예시 표시, 날짜, 별, 버튼 칩, 한줄평)
    // 입력: review - getReviewSummary의 reviews[] 한 개
    // 출력: <article> 요소
    function makeReview(review) {
        const card = el('article', 'card menu-review');
        const top = el('div', 'row-between menu-review-top');
        const who = el('span', 'menu-review-who');
        who.appendChild(el('strong', '', review.nickname));
        if (review.isSample) {
            who.appendChild(el('span', 'menu-sample', '예시'));
        }
        top.appendChild(who);
        top.appendChild(el('span', 'muted', review.createdAt.slice(5, 10).replace('-', '.')));
        card.appendChild(top);

        const stars = el('span', 'rating menu-review-stars', formatStars(review.rating));
        stars.setAttribute('aria-label', '별점 ' + review.rating + '점');
        card.appendChild(stars);

        if (review.tags.length > 0) {
            const tags = el('div', 'tag-row');
            for (let i = 0; i < review.tags.length; i++) {
                tags.appendChild(el('span', 'tag', review.tags[i].label));
            }
            card.appendChild(tags);
        }
        if (review.comment !== '') {
            card.appendChild(el('p', 'menu-review-text', review.comment));
        }
        return card;
    }

    // 역할: 리뷰 목록 부분을 그린다 (최신순)
    // 입력: summary - Reviews.getReviewSummary 결과
    // 출력: 없음
    function renderReviews(summary) {
        const section = el('section', 'section');
        const head = el('div', 'row-between');
        head.appendChild(el('h2', 'section-title', '리뷰 ' + summary.reviewCount));
        head.appendChild(el('span', 'muted small', '최신순'));
        section.appendChild(head);
        if (summary.reviews.length === 0) {
            section.appendChild(el('p', 'empty', '아직 리뷰가 없어요. 첫 리뷰를 남겨 주세요.'));
        }
        for (let i = 0; i < summary.reviews.length; i++) {
            section.appendChild(makeReview(summary.reviews[i]));
        }
        if (summary.reviews.some(function (review) {
            return review.isSample;
        })) {
            section.appendChild(el('p', 'muted small', "※ '예시' 표시가 있는 리뷰는 시연용으로 넣어 둔 예시예요."));
        }
        app.appendChild(section);
    }

    // 역할: 아래 고정 버튼('비교함 담기', '리뷰 쓰기')을 만든다
    // 입력: 없음
    // 출력: 없음
    function renderActions() {
        const bar = el('div', 'bottom-bar menu-actions');
        const add = el('button', 'btn btn-outline btn-large', '비교함 담기');
        add.type = 'button';
        add.addEventListener('click', function () {
            try {
                const box = Compare.addToBox(menuId);
                showNotice('비교함에 담았어요 (' + box.length + ' / 4)');
            } catch (e) {
                showError(e.message);
            }
        });
        const write = el('a', 'btn btn-primary btn-large', '리뷰 쓰기');
        const reviewPage = 'review.html?menuId=' + menuId;
        if (Auth.getCurrentUser() === null) {
            write.href = 'login.html?next=' + encodeURIComponent(reviewPage);
        } else {
            write.href = reviewPage;
        }
        bar.appendChild(add);
        bar.appendChild(write);
        document.body.appendChild(bar);
        app.classList.add('with-bottom-bar');
    }

    // 역할: 화면 전체를 그린다
    // 입력: 없음
    // 출력: 없음
    function render() {
        const header = renderHeader('메뉴 상세', true);
        renderTabBar('home');
        try {
            const menu = Cafes.getMenu(menuId);
            const summary = Reviews.getReviewSummary(menuId);
            document.title = menu.name + ' · 메뉴 상세';
            addFavoriteButton(header);
            renderInfo(menu);
            renderSummary(summary);
            renderReviews(summary);
            renderActions();
        } catch (e) {
            showError(e.message);
            app.appendChild(el('p', 'empty', e.message));
        }
    }

    render();
})();
