// 마이 화면: 내 정보, 사장이면 '내 카페 관리', 즐겨찾기 / 내 리뷰 탭, 로그아웃
// 부르는 기능 함수: Auth.getCurrentUser, Account.getFavorites, Account.getMyCafe, Account.logout,
//                   Reviews.getMyReviews, Reviews.deleteReview

(function () {
    const app = document.getElementById('app');

    // 역할: 즐겨찾기 줄 하나를 만든다 (오른쪽에 꽉 찬 하트)
    // 입력: href - 이동할 주소, name - 이름, sub - 아래 작은 글자
    // 출력: <a class="list-row"> 요소
    function makeFavoriteRow(href, name, sub) {
        const row = el('a', 'list-row');
        row.href = href;
        const main = el('span', 'list-main');
        main.appendChild(el('span', 'list-name', name));
        main.appendChild(el('span', 'list-sub', sub));
        row.appendChild(main);
        const heart = icon('heart-filled', 20);
        heart.classList.add('my-heart');
        row.appendChild(heart);
        return row;
    }

    // 역할: 즐겨찾기 탭 내용(카페 / 메뉴 나눠서)을 그린다
    // 입력: box - 그릴 자리, favorites - Account.getFavorites 결과
    // 출력: 없음
    function renderFavorites(box, favorites) {
        box.textContent = '';
        if (favorites.cafes.length === 0 && favorites.menus.length === 0) {
            box.appendChild(el('p', 'empty', '아직 즐겨찾기가 없어요. 카페 상세에서 하트를 눌러 보세요.'));
            return;
        }
        const parts = [
            { title: '카페', items: favorites.cafes },
            { title: '메뉴', items: favorites.menus }
        ];
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].items.length === 0) {
                continue;
            }
            const section = el('section', 'section my-fav-section');
            section.appendChild(el('h2', 'my-sub-title', parts[i].title));
            const group = el('div', 'list-group');
            for (let j = 0; j < parts[i].items.length; j++) {
                const item = parts[i].items[j];
                if (parts[i].title === '카페') {
                    const area = item.area === 'campus' ? '교내' : '근처';
                    group.appendChild(makeFavoriteRow('cafe.html?id=' + item.id, item.name, area + ' · ' + formatRating(item.avgRating)));
                } else {
                    const sub = item.cafeName + ' · ' + formatPrice(item.price) + ' · ' + formatRating(item.avgRating);
                    group.appendChild(makeFavoriteRow('menu.html?id=' + item.id, item.name, sub));
                }
            }
            section.appendChild(group);
            box.appendChild(section);
        }
    }

    // 역할: 내 리뷰 탭 내용을 그린다 (메뉴 링크, 별, 날짜, 버튼, 한줄평, 고치기·삭제)
    // 입력: box - 그릴 자리, items - Reviews.getMyReviews 결과 [{ review, menu }]
    //       onChange - 삭제 뒤 화면을 다시 그릴 함수
    // 출력: 없음
    function renderMyReviews(box, items, onChange) {
        box.textContent = '';
        if (items.length === 0) {
            box.appendChild(el('p', 'empty', '아직 쓴 리뷰가 없어요. 메뉴 상세에서 리뷰를 남겨 보세요.'));
            return;
        }
        for (let i = 0; i < items.length; i++) {
            const review = items[i].review;
            const menu = items[i].menu;
            const card = el('article', 'card my-review');

            const top = el('div', 'row-between');
            const link = el('a', 'my-review-menu', menu.name);
            link.href = 'menu.html?id=' + menu.id;
            top.appendChild(link);
            top.appendChild(el('span', 'muted small', review.createdAt.slice(5, 10).replace('-', '.')));
            card.appendChild(top);
            card.appendChild(el('span', 'muted small', menu.cafeName + ' · ' + menu.typeName));
            card.appendChild(el('span', 'rating my-review-stars', formatStars(review.rating)));
            if (review.tags.length > 0) {
                const tags = el('div', 'tag-row');
                for (let j = 0; j < review.tags.length; j++) {
                    tags.appendChild(el('span', 'tag', review.tags[j].label));
                }
                card.appendChild(tags);
            }
            if (review.comment !== '') {
                card.appendChild(el('p', 'my-review-text', review.comment));
            }

            const actions = el('div', 'my-review-actions');
            const edit = el('a', 'btn btn-outline', '고치기');
            edit.href = 'review.html?menuId=' + menu.id;
            const remove = el('button', 'btn btn-outline', '삭제');
            remove.type = 'button';
            remove.addEventListener('click', function () {
                if (!confirm("'" + menu.name + "' 리뷰를 삭제할까요?")) {
                    return;
                }
                try {
                    Reviews.deleteReview(review.id);
                    showNotice('리뷰를 삭제했어요');
                    onChange();
                } catch (e) {
                    showError(e.message);
                }
            });
            actions.appendChild(edit);
            actions.appendChild(remove);
            card.appendChild(actions);
            box.appendChild(card);
        }
    }

    // 역할: 내 정보 상자(첫 글자 동그라미, 닉네임, 역할)를 만든다
    // 입력: user - Auth.getCurrentUser 결과
    // 출력: <section> 요소
    function makeProfile(user) {
        const profile = el('section', 'card my-profile');
        profile.appendChild(el('span', 'my-avatar', user.nickname.charAt(0)));
        const text = el('span', 'list-main');
        text.appendChild(el('span', 'my-nickname', user.nickname));
        let role = '일반 회원';
        if (user.role === 'owner') {
            role = '카페 사장';
            try {
                role = role + ' · ' + Account.getMyCafe().name;
            } catch (e) {
                role = '카페 사장 (관리할 카페 없음)';
            }
        }
        text.appendChild(el('span', 'muted my-role', role));
        profile.appendChild(text);
        return profile;
    }

    // 역할: 화면 전체를 그린다. 로그인 안 했으면 로그인 화면으로 보낸다
    // 입력: 없음
    // 출력: 없음
    function render() {
        const user = Auth.getCurrentUser();
        if (user === null) {
            location.replace('login.html?next=mypage.html');
            return;
        }
        const header = renderHeader('마이', false);
        renderTabBar('my');
        const actions = el('div', 'header-actions');
        const logout = el('button', 'my-logout', '로그아웃');
        logout.type = 'button';
        logout.addEventListener('click', function () {
            Account.logout();
            location.href = 'index.html';
        });
        actions.appendChild(logout);
        header.appendChild(actions);

        app.appendChild(makeProfile(user));
        if (user.role === 'owner') {
            const banner = el('a', 'banner');
            banner.href = 'owner.html';
            const text = el('span', 'banner-text');
            text.appendChild(el('span', 'banner-title', '내 카페 관리'));
            text.appendChild(el('span', 'banner-sub', '카페 정보와 메뉴·가격을 고칠 수 있어요'));
            banner.appendChild(text);
            banner.appendChild(icon('arrow', 20));
            app.appendChild(banner);
        }

        const tabs = el('div', 'underline-tabs');
        const favTab = el('button', 'is-selected');
        const reviewTab = el('button', '');
        favTab.type = 'button';
        reviewTab.type = 'button';
        tabs.appendChild(favTab);
        tabs.appendChild(reviewTab);
        app.appendChild(tabs);

        const favBox = el('div', 'section');
        const reviewBox = el('div', 'section');
        reviewBox.hidden = true;
        app.appendChild(favBox);
        app.appendChild(reviewBox);

        // 역할: 두 탭의 숫자와 내용을 새로 그린다 (리뷰를 삭제한 뒤에도 부름)
        // 입력: 없음
        // 출력: 없음
        function refresh() {
            const favorites = Account.getFavorites();
            const myReviews = Reviews.getMyReviews();
            favTab.textContent = '즐겨찾기 ' + (favorites.cafes.length + favorites.menus.length);
            reviewTab.textContent = '내 리뷰 ' + myReviews.length;
            renderFavorites(favBox, favorites);
            renderMyReviews(reviewBox, myReviews, refresh);
        }

        const pairs = [
            { tab: favTab, box: favBox },
            { tab: reviewTab, box: reviewBox }
        ];
        for (let i = 0; i < pairs.length; i++) {
            pairs[i].tab.setAttribute('aria-pressed', String(i === 0));
            pairs[i].tab.addEventListener('click', function () {
                for (let k = 0; k < pairs.length; k++) {
                    pairs[k].tab.classList.toggle('is-selected', k === i);
                    pairs[k].tab.setAttribute('aria-pressed', String(k === i));
                    pairs[k].box.hidden = k !== i;
                }
            });
        }
        refresh();
    }

    try {
        render();
    } catch (e) {
        showError(e.message);
    }
})();
