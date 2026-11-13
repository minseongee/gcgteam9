// 공통 화면: 모든 화면이 함께 쓰는 헤더·하단 탭 등 화면 도우미
// 이 파일의 함수들은 모든 화면 스크립트(js/ui/*.js)에서 부를 수 있도록 전역 함수로 둡니다.
// 기능 모듈과 DataStore는 부르지 않습니다. (로그인 확인만 Auth.getCurrentUser를 화면에서 부름)

// 역할: 요소를 만든다. 글자는 반드시 textContent로 넣는다(innerHTML 금지)
// 입력: tag - 태그 이름('div' 등), className - 클래스(없으면 '' 또는 생략), text - 넣을 글자(생략 가능)
// 출력: 만든 요소
function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
        node.className = className;
    }
    if (text !== undefined && text !== null) {
        node.textContent = String(text);
    }
    return node;
}

// 역할: 정해 둔 아이콘(인라인 SVG)을 만든다. SVG 문자열은 이 함수 안의 고정 값뿐이라 사용자 글자가 섞이지 않는다
// 입력: name - 'home' | 'map' | 'compare' | 'recommend' | 'my' | 'back' | 'close' | 'search' | 'check' | 'plus'
//              | 'heart' | 'heart-filled' | 'pin' | 'arrow' | 'info' | 'x'
//       size - 가로·세로 px (생략하면 24)
// 출력: <span class="icon"> 요소 (화면 읽기 프로그램은 읽지 않음)
function icon(name, size) {
    const paths = {
        home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
        map: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
        compare: '<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/>',
        recommend: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
        my: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
        back: '<path d="M15 5l-7 7 7 7"/>',
        close: '<path d="M6 6l12 12M18 6L6 18"/>',
        search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
        check: '<path d="M5 12l5 5 9-10"/>',
        plus: '<path d="M12 5v14M5 12h14"/>',
        heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
        'heart-filled': '<path fill="currentColor" d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
        pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
        arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        info: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/>',
        x: '<path d="M6 6l12 12M18 6L6 18"/>'
    };
    const px = size || 24;
    const wrap = el('span', 'icon');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = '<svg width="' + px + '" height="' + px + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
        + ' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + paths[name] + '</svg>';
    return wrap;
}

// 역할: 화면 위쪽 바(#app-header)를 채운다
// 입력: title - 제목 글자, showBack - true면 왼쪽에 '뒤로' 버튼
// 출력: 채운 header 요소 (화면에서 오른쪽에 버튼을 더 붙일 수 있게 돌려줌)
function renderHeader(title, showBack) {
    const header = document.getElementById('app-header');
    header.textContent = '';
    header.className = 'app-header';
    if (showBack) {
        const back = el('button', 'icon-btn');
        back.type = 'button';
        back.setAttribute('aria-label', '뒤로');
        back.appendChild(icon('back'));
        // file://로 열면 document.referrer가 비어 있으므로 방문 기록 수로만 판단한다
        back.addEventListener('click', function () {
            if (history.length > 1) {
                history.back();
            } else {
                location.href = 'index.html';
            }
        });
        header.appendChild(back);
        header.appendChild(el('span', 'header-title', title));
    } else {
        header.appendChild(el('h1', 'page-title', title));
    }
    return header;
}

// 역할: 하단 탭(#tab-bar)에 홈·지도·비교·추천·마이 5개를 그리고 현재 탭을 강조한다
// 입력: current - 'home' | 'map' | 'compare' | 'recommend' | 'my' (강조할 탭이 없으면 '')
// 출력: 없음
function renderTabBar(current) {
    const tabs = [
        { key: 'home', label: '홈', href: 'index.html' },
        { key: 'map', label: '지도', href: 'map.html' },
        { key: 'compare', label: '비교', href: 'compare.html' },
        { key: 'recommend', label: '추천', href: 'recommend.html' },
        { key: 'my', label: '마이', href: 'mypage.html' }
    ];
    const nav = document.getElementById('tab-bar');
    nav.textContent = '';
    nav.className = 'tab-bar';
    nav.setAttribute('aria-label', '하단 메뉴');
    for (let i = 0; i < tabs.length; i++) {
        const link = el('a', 'tab');
        link.href = tabs[i].href;
        link.appendChild(icon(tabs[i].key));
        link.appendChild(el('span', '', tabs[i].label));
        if (tabs[i].key === current) {
            link.classList.add('is-current');
            link.setAttribute('aria-current', 'page');
        }
        nav.appendChild(link);
    }
}

// 역할: 주소의 ?id=3 같은 값을 숫자로 읽는다
// 입력: name - 읽을 이름('id', 'menuId' 등)
// 출력: 정수, 없거나 정수가 아니면 null
function getQueryNumber(name) {
    const value = new URLSearchParams(location.search).get(name);
    if (value === null || value === '') {
        return null;
    }
    const number = Number(value);
    if (!Number.isInteger(number)) {
        return null;
    }
    return number;
}

// 역할: 화면 위쪽에 안내 상자를 띄운다 (showError, showNotice가 함께 씀)
// 입력: message - 보여 줄 글자, isError - true면 오류 모양
// 출력: 없음. 4초 뒤 저절로 사라짐
function showMessage(message, isError) {
    let box = document.getElementById('app-message');
    if (box === null) {
        box = el('div', 'app-message');
        box.id = 'app-message';
        box.setAttribute('role', 'alert');
        document.body.appendChild(box);
    }
    box.textContent = message;
    box.classList.toggle('is-error', isError);
    box.hidden = false;
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(function () {
        box.hidden = true;
    }, 4000);
}

// 역할: 오류 안내를 화면 위쪽에 띄운다 (기능 함수가 던진 오류를 catch에서 보여 줄 때)
// 입력: message - 보여 줄 글자
// 출력: 없음
function showError(message) {
    showMessage(message, true);
}

// 역할: 성공 안내를 화면 위쪽에 띄운다 (저장했어요 등)
// 입력: message - 보여 줄 글자
// 출력: 없음
function showNotice(message) {
    showMessage(message, false);
}

// 역할: 가격을 '3,000원' 모양으로
// 입력: price - 숫자
// 출력: 문자열
function formatPrice(price) {
    return price.toLocaleString('ko-KR') + '원';
}

// 역할: 평점을 '★ 4.3' 모양으로, 리뷰가 없으면(null) '리뷰 없음'
// 입력: rating - 숫자 또는 null
// 출력: 문자열
function formatRating(rating) {
    if (rating === null) {
        return '리뷰 없음';
    }
    return '★ ' + rating.toFixed(1);
}

// 역할: 평점을 별 5개 글자로 ('★★★★☆')
// 입력: rating - 숫자 (반올림한 개수만큼 채운 별)
// 출력: 문자열
function formatStars(rating) {
    const filled = Math.round(rating);
    let text = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= filled) {
            text = text + '★';
        } else {
            text = text + '☆';
        }
    }
    return text;
}

// 역할: 교내/근처 배지를 만든다
// 입력: area - 'campus' | 'nearby'
// 출력: <span class="badge"> 요소
function areaBadge(area) {
    if (area === 'campus') {
        return el('span', 'badge badge-campus', '교내');
    }
    return el('span', 'badge badge-nearby', '근처');
}

// 역할: 로그인 화면 주소를 만든다. 로그인 후 지금 화면으로 돌아오게 ?next=에 현재 주소를 담는다
// 입력: 없음
// 출력: 'login.html?next=…' 문자열
function loginUrl() {
    const page = location.pathname.split('/').pop() + location.search;
    return 'login.html?next=' + encodeURIComponent(page);
}
