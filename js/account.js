// D. 계정·즐겨찾기·운영: Account (회원가입·로그인, 즐겨찾기, 사장 메뉴 관리)
// 회원 데이터는 DataStore로만 읽고 씁니다. 반환값에는 password를 넣지 않습니다.
// 비밀번호는 암호화 없이 저장합니다(과제용).

const Account = {
    // 역할: 새 회원을 만들고 바로 로그인한다
    // 입력: loginId - 영문·숫자 4~12자, password - 4자 이상, nickname - 1~10자
    // 출력: 새 회원 { id, loginId, nickname, role: 'member' }
    // 오류: '아이디는 영문·숫자 4~12자로 정해 주세요'
    //       '비밀번호는 4자 이상이어야 합니다'
    //       '닉네임은 1~10자로 정해 주세요'
    //       '이미 사용 중인 아이디입니다'
    signup: function (loginId, password, nickname) {
        if (typeof loginId !== 'string' || !/^[A-Za-z0-9]{4,12}$/.test(loginId)) {
            throw new Error('아이디는 영문·숫자 4~12자로 정해 주세요');
        }
        if (typeof password !== 'string' || password.length < 4) {
            throw new Error('비밀번호는 4자 이상이어야 합니다');
        }
        if (typeof nickname !== 'string' || nickname.length < 1 || nickname.length > 10) {
            throw new Error('닉네임은 1~10자로 정해 주세요');
        }
        const users = DataStore.load('users');
        for (let i = 0; i < users.length; i++) {
            if (users[i].loginId === loginId) {
                throw new Error('이미 사용 중인 아이디입니다');
            }
        }
        const id = DataStore.nextId('users');
        users.push({ id: id, loginId: loginId, password: password, nickname: nickname, role: 'member' });
        DataStore.save('users', users);
        DataStore.saveSession(id);
        return Auth.getCurrentUser();
    },

    // 역할: 아이디·비밀번호를 확인하고 로그인한다
    // 입력: loginId, password - 문자열
    // 출력: 로그인한 회원 { id, loginId, nickname, role }
    // 오류: 없는 아이디이거나 비밀번호가 다르면 '아이디 또는 비밀번호가 맞지 않습니다'
    login: function (loginId, password) {
        const users = DataStore.load('users');
        for (let i = 0; i < users.length; i++) {
            if (users[i].loginId === loginId && users[i].password === password) {
                DataStore.saveSession(users[i].id);
                return Auth.getCurrentUser();
            }
        }
        throw new Error('아이디 또는 비밀번호가 맞지 않습니다');
    },

    // 역할: 로그아웃한다
    // 입력: 없음
    // 출력: 없음
    // 오류: 없음 (로그인 안 한 상태에서 불러도 됨)
    logout: function () {
        DataStore.clearSession();
    }

    // toggleFavorite, isFavorite, getFavorites, getMyCafe, updateCafe, addMenu, updatePrice: 2-5에서 추가
};
