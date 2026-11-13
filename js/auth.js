// 로그인·권한 확인: Auth (현재 사용자, 로그인·사장 권한 검사)
// 로그인 상태는 DataStore.loadSession()으로, 회원·카페는 DataStore.load로만 읽습니다.

const Auth = {
    // 역할: 지금 로그인한 회원을 돌려준다
    // 입력: 없음
    // 출력: { id, loginId, nickname, role } (password는 뺌)
    //       로그인 안 했거나 세션의 회원이 없으면 null
    // 오류: 없음
    getCurrentUser: function () {
        const session = DataStore.loadSession();
        if (session === null) {
            return null;
        }
        const users = DataStore.load('users');
        for (let i = 0; i < users.length; i++) {
            if (users[i].id === session.userId) {
                return {
                    id: users[i].id,
                    loginId: users[i].loginId,
                    nickname: users[i].nickname,
                    role: users[i].role
                };
            }
        }
        return null;
    },

    // 역할: 로그인했는지 확인한다 (회원 전용 기능의 맨 앞에서 부름)
    // 입력: 없음
    // 출력: 현재 회원 { id, loginId, nickname, role }
    // 오류: 로그인 안 했으면 '로그인이 필요합니다'
    requireLogin: function () {
        const user = Auth.getCurrentUser();
        if (user === null) {
            throw new Error('로그인이 필요합니다');
        }
        return user;
    },

    // 역할: 현재 회원이 그 카페의 사장인지 확인한다 (사장 전용 기능의 맨 앞에서 부름)
    // 입력: cafeId - 카페 id (숫자)
    // 출력: 현재 회원 { id, loginId, nickname, role }
    // 오류: 로그인 안 했으면 '로그인이 필요합니다'
    //       없는 카페면 '카페를 찾을 수 없습니다'
    //       사장이 아니거나 남의 카페면 '이 카페를 관리할 권한이 없습니다'
    requireOwnerOf: function (cafeId) {
        const user = Auth.requireLogin();
        const cafes = DataStore.load('cafes');
        let cafe = null;
        for (let i = 0; i < cafes.length; i++) {
            if (cafes[i].id === cafeId) {
                cafe = cafes[i];
            }
        }
        if (cafe === null) {
            throw new Error('카페를 찾을 수 없습니다');
        }
        if (user.role !== 'owner' || cafe.ownerId !== user.id) {
            throw new Error('이 카페를 관리할 권한이 없습니다');
        }
        return user;
    }
};
