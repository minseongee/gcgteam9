// 화면 개발용 가짜. 진짜 모듈이 완성되면 script 태그를 바꿔 끼운다
// Auth 가짜: interface.md 6절과 이름·입력·반환 모양이 같습니다. 저장소를 쓰지 않습니다.
// 로그인 상태를 바꿔 보려면 콘솔에서:
//   Auth.currentUser = null;  (로그인 안 함)
//   Auth.currentUser = { id: 1, loginId: 'ownera', nickname: '카페A사장', role: 'owner' };  (사장)

const Auth = {
    // 지금 로그인한 것으로 칠 회원 (고정값, 새로고침하면 처음 값으로 돌아감)
    currentUser: { id: 4, loginId: 'sample1', nickname: '예시회원1', role: 'member' },

    // 역할: 지금 로그인한 회원을 돌려준다
    // 입력: 없음
    // 출력: { id, loginId, nickname, role } 또는 null
    // 오류: 없음
    getCurrentUser: function () {
        if (Auth.currentUser === null) {
            return null;
        }
        return JSON.parse(JSON.stringify(Auth.currentUser));
    },

    // 역할: 로그인했는지 확인한다
    // 입력: 없음
    // 출력: 현재 회원
    // 오류: 로그인 안 했으면 '로그인이 필요합니다'
    requireLogin: function () {
        const user = Auth.getCurrentUser();
        if (user === null) {
            throw new Error('로그인이 필요합니다');
        }
        return user;
    },

    // 역할: 현재 회원이 사장인지 확인한다 (가짜라서 어느 카페든 사장이면 통과)
    // 입력: cafeId - 카페 id (숫자)
    // 출력: 현재 회원
    // 오류: 로그인 안 했으면 '로그인이 필요합니다', 사장이 아니면 '이 카페를 관리할 권한이 없습니다'
    requireOwnerOf: function (cafeId) {
        const user = Auth.requireLogin();
        if (user.role !== 'owner') {
            throw new Error('이 카페를 관리할 권한이 없습니다');
        }
        return user;
    }
};
