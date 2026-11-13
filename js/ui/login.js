// 로그인·회원가입 화면: 두 모드 전환, 성공하면 ?next= 주소(없으면 마이)로 이동 (login.html?next=mypage.html)
// 부르는 기능 함수: Account.login, Account.signup

(function () {
    const app = document.getElementById('app');
    let mode = 'login';   // 'login' | 'signup'

    // 역할: 로그인 뒤 갈 주소를 고른다. 다른 사이트로 빠져나가지 않게 'xxx.html?…' 모양만 허용
    // 입력: 없음
    // 출력: 이동할 주소 문자열
    function nextUrl() {
        const next = new URLSearchParams(location.search).get('next');
        if (next !== null && /^[a-z]+\.html(\?[A-Za-z0-9=&%._-]*)?$/.test(next)) {
            return next;
        }
        return 'mypage.html';
    }

    // 역할: 이름표 + 입력칸 하나를 만든다
    // 입력: labelText - 이름표, type - input type, autocomplete - 자동 완성 종류, placeholder - 안내 글자
    // 출력: { field, input }
    function makeField(labelText, type, autocomplete, placeholder) {
        const field = el('label', 'field', labelText);
        const input = el('input', 'input login-input');
        input.type = type;
        input.autocomplete = autocomplete;
        input.placeholder = placeholder;
        field.appendChild(input);
        return { field: field, input: input };
    }

    // 역할: 화면 전체를 그린다 (제목, 모드 전환, 입력 폼, 안내 상자)
    // 입력: 없음
    // 출력: 없음
    function render() {
        renderHeader('', true);
        renderTabBar('my');

        const intro = el('div', 'login-intro');
        const title = el('h1', 'login-title', '로그인');
        intro.appendChild(title);
        intro.appendChild(el('p', 'muted login-desc', '리뷰를 쓰고 즐겨찾기를 하려면 로그인하세요.'));
        app.appendChild(intro);

        const switcher = el('div', 'segmented');
        const loginTab = el('button', 'is-selected', '로그인');
        const signupTab = el('button', '', '회원가입');
        loginTab.type = 'button';
        signupTab.type = 'button';
        switcher.appendChild(loginTab);
        switcher.appendChild(signupTab);
        app.appendChild(switcher);

        const form = el('form', 'login-form');
        // 빈칸·형식 검사는 Account가 하고 interface.md의 오류 문구를 돌려주므로, 브라우저 자체 검사는 끈다
        form.noValidate = true;
        const loginId = makeField('아이디', 'text', 'username', '영문, 숫자 4~12자');
        const password = makeField('비밀번호', 'password', 'current-password', '비밀번호');
        const nickname = makeField('닉네임', 'text', 'nickname', '1~10자');
        nickname.field.hidden = true;
        form.appendChild(loginId.field);
        form.appendChild(password.field);
        form.appendChild(nickname.field);

        const warning = el('div', 'warning');
        warning.appendChild(icon('info', 18));
        warning.appendChild(el('span', '', '학교 과제용이라 비밀번호가 암호화되지 않아요. 실제 비밀번호를 쓰지 마세요.'));
        form.appendChild(warning);

        const submit = el('button', 'btn btn-primary btn-large btn-block', '로그인');
        submit.type = 'submit';
        form.appendChild(submit);
        app.appendChild(form);
        app.appendChild(el('p', 'muted login-foot', '카페 사장님 계정은 팀에서 미리 만들어 드려요.'));

        // 역할: 로그인 / 회원가입 모드를 바꾸고 제목·버튼·닉네임 칸을 맞춘다
        // 입력: next - 'login' | 'signup'
        // 출력: 없음
        function setMode(next) {
            mode = next;
            const isLogin = mode === 'login';
            loginTab.classList.toggle('is-selected', isLogin);
            signupTab.classList.toggle('is-selected', !isLogin);
            loginTab.setAttribute('aria-pressed', String(isLogin));
            signupTab.setAttribute('aria-pressed', String(!isLogin));
            title.textContent = isLogin ? '로그인' : '회원가입';
            submit.textContent = isLogin ? '로그인' : '가입하기';
            nickname.field.hidden = isLogin;
            password.input.autocomplete = isLogin ? 'current-password' : 'new-password';
            password.input.placeholder = isLogin ? '비밀번호' : '4자 이상';
        }

        loginTab.addEventListener('click', function () {
            setMode('login');
        });
        signupTab.addEventListener('click', function () {
            setMode('signup');
        });
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            try {
                if (mode === 'login') {
                    Account.login(loginId.input.value.trim(), password.input.value);
                } else {
                    Account.signup(loginId.input.value.trim(), password.input.value, nickname.input.value.trim());
                }
                // replace: 로그인 뒤 '뒤로'를 눌러도 로그인 화면이 다시 열리지 않게
                location.replace(nextUrl());
            } catch (e) {
                showError(e.message);
            }
        });
        setMode('login');
    }

    try {
        render();
    } catch (e) {
        showError(e.message);
    }
})();
