# 기능 테스트 케이스

> `interface.md` 2~6절의 함수와 7절의 오류 메시지를 바탕으로 만든 기능 테스트입니다.
> 번호는 `js/test/run-tests.js`의 케이스 번호와 같습니다.
> 기대값은 `run-tests.js` 안의 **테스트 전용 데이터**(처음 만든 예시 데이터: 카페 A~E 등) 기준입니다. `js/data.js`의 실제 조사 데이터와는 따로 돌아갑니다.

## 실행 방법

1. 아무 화면(`index.html` 등)을 Chrome으로 엽니다.
2. F12 콘솔에 `js/test/run-tests.js` 내용을 통째로 붙여 넣고 Enter를 누릅니다.
3. 콘솔에 `번호 · 함수 · 통과(O/X) · 실제 결과` 표와 `통과 n / 전체 137`가 찍힙니다. 실패한 케이스는 아래에 한 번 더 모아 보여 줍니다.
4. 아래 표의 '실제 결과', '통과' 칸에 옮겨 적습니다.

- **모든 케이스는 `DataStore.reset()` 직후 상태(`data.js` 예시 데이터, 로그아웃)에서 시작**합니다. 러너가 케이스마다 reset을 부르고, 끝나면 한 번 더 reset 합니다. 그래서 직접 쓴 리뷰·가입한 회원이 지워지니, 시연 데이터를 만든 뒤에는 돌리지 않습니다.
- 예시 계정은 모두 비밀번호가 `1234`입니다. 사장: `ownera`(카페 1), `ownerb`(카페 2). 회원: `sample1`(id 4), `sample2`(id 5), `sample3`(id 6).
- 기대 결과는 `data.js` 예시 데이터로 계산했습니다. 실제 조사 데이터로 바꾸면 기대값도 다시 계산해 이 문서와 러너를 함께 고칩니다.
- 오류가 없는 함수는 '예외' 대신 **경계** 상황(결과 없음, 로그아웃 상태 등)을 넣었습니다.

## P0 요구사항 ↔ 케이스

| P0 요구사항 | 케이스 번호 |
| --- | --- |
| 메뉴 타입별 검색 | 7, 8, 9, 13 |
| 정렬 (평점·가격·리뷰 수) | 10, 11, 12 |
| 리뷰 작성 (별점·한줄평·평가 버튼) | 20, 21, 29~41 |
| 평가 집계 | 26, 27, 28, 32 |
| 같은 타입 비교 | 48~54, 63~70 |
| 조건 추천 | 55~62 |
| 회원가입·로그인 | 71~82, 108~111 |
| 사장 가격 변경 | 100~107 (메뉴 추가 96~99, 메뉴 이름·타입 변경 126~132, 메뉴 삭제 133~137, 권한 90~92·112~114) |
| 카페·메뉴 검색·상세 | 1~6, 14~19 |

## 테스트 케이스

| 번호 | 요구사항 | 함수 | 입력/상황 | 기대 결과 | 실제 결과 | 통과 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 카페 검색 | `Cafes.searchCafes` | `('', 'all')` | 카페 5개, 평점 높은 순 id `[5, 1, 4, 2, 3]` (A·D 둘 다 4.3이면 리뷰 많은 A가 앞) | | |
| 2 | 카페 검색 | `Cafes.searchCafes` | `('', 'campus')` | 교내 카페 id `[1, 2, 3]` | | |
| 3 | 카페 검색 | `Cafes.searchCafes` | `('카페 A', 'all')` | id `[1]` | | |
| 4 | 카페 검색 | `Cafes.searchCafes` | (경계) `('없는카페', 'all')` | 빈 배열 `[]` | | |
| 5 | 카페 상세 | `Cafes.getCafe` | `(1)` | 이름 '카페 A', 평점 4.3, 리뷰 8개, 메뉴 5개, `menusByType`의 typeId `[1, 2, 4, 5]` | | |
| 6 | 카페 상세 | `Cafes.getCafe` | (예외) 없는 id `(999)` | 오류 '카페를 찾을 수 없습니다' | | |
| 7 | 메뉴 타입별 검색 | `Cafes.searchMenus` | `('', 1, 'rating')` 커피만 | 9개, 모두 typeId 1 · typeName '커피' | | |
| 8 | 메뉴 타입별 검색 | `Cafes.searchMenus` | `('', 3, 'rating')` 차만 | id `[9, 14, 19, 24]` (리뷰 없는 19·24가 뒤) | | |
| 9 | 메뉴 타입별 검색 | `Cafes.searchMenus` | `('아메리카노', null, 'rating')` 이름 검색 + 전체 타입 | id `[16, 1, 12, 6]` | | |
| 10 | 정렬 | `Cafes.searchMenus` | 메뉴 12에 별점 4 리뷰 3개를 더 단 뒤(평점 4.0·리뷰 4개) `('', 1, 'rating')` | 1위 id 22(평점 5.0). 평점 4.0끼리는 리뷰 4개인 12가 리뷰 3개인 1보다 앞. 리뷰 없는 메뉴 3개가 맨 뒤 | | |
| 11 | 정렬 | `Cafes.searchMenus` | `('', 1, 'price')` | 가격 낮은 순. 첫 메뉴 2,000원, 마지막 id 22(4,000원) | | |
| 12 | 정렬 | `Cafes.searchMenus` | `('', null, 'reviews')` | 25개, 첫 메뉴 id 1(리뷰 3개), 리뷰 수가 줄어드는 순 | | |
| 13 | 메뉴 타입별 검색 | `Cafes.searchMenus` | (경계) `('없는메뉴', null, 'rating')` | 빈 배열 `[]` | | |
| 14 | 메뉴 목록(홈) | `Cafes.getMenusByType` | `()` | 5묶음, typeId `[1, 2, 3, 4, 5]`, 커피 묶음 첫 메뉴 id 22 | | |
| 15 | 메뉴 목록(홈) | `Cafes.getMenusByType` | (경계) 리뷰 없는 메뉴 위치 | 커피 묶음 마지막 메뉴 평점 `null` | | |
| 16 | 메뉴 상세 | `Cafes.getMenu` | `(2)` | 카페라떼 · 카페 A · campus · 커피 · 2,500원 · 평점 4.5 · 리뷰 2개, topTag `{ tagId: 2, label: '고소해요', percent: 100 }` | | |
| 17 | 메뉴 상세 | `Cafes.getMenu` | (예외) 없는 id `(999)` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 18 | 공통(복사본) | `Cafes.getMenu` | `getMenu(1)`로 받은 객체의 price를 99999로 바꾼 뒤 다시 `getMenu(1)` | price 2000 그대로 | | |
| 19 | 메뉴 상세 | `Cafes.getMenu` | (경계) 리뷰 없는 메뉴 `(7)` | 평점 `null`, 리뷰 0개, topTag `null` | | |
| 20 | 리뷰 작성(평가 버튼) | `Cafes.getMenuTypes` | `()` | 타입 5개. 커피 버튼 id `[1, 2, 3, 4, 5, 17, 18]`, 진해요(3)의 oppositeId 4 | | |
| 21 | 리뷰 작성(평가 버튼) | `Cafes.getMenuTypes` | (경계) 반대 버튼 없는 타입·공통 버튼 | 디저트 버튼 id `[15, 16, 17, 18]`, 공통 버튼(17·18) oppositeId `null` | | |
| 22 | 지도(P1) | `Cafes.getMapPins` | MAP_BOUNDS를 (36, 128)~(35, 129)로, 카페 1 좌표를 (35.5, 128.5)로 | 핀 1개 `{ cafeId: 1, name: '카페 A', area: 'campus', x: 50, y: 50 }` (좌표 0인 카페 2~5는 지도 밖이라 빠짐) | | |
| 23 | 지도(P1) | `Cafes.getMapPins` | (경계) 위와 같고 카페 1을 지도 위쪽 밖 (37, 128.5)로 | 빈 배열 `[]` | | |
| 24 | 카카오맵 링크(P1) | `Cafes.getMapLinks` | `(1)` | view `https://map.kakao.com/link/map/%EC%B9%B4%ED%8E%98%20A,0,0`, route는 `/link/to/`로 같은 값 | | |
| 25 | 카카오맵 링크(P1) | `Cafes.getMapLinks` | (예외) `(999)` | 오류 '카페를 찾을 수 없습니다' | | |
| 26 | 평가 집계 | `Reviews.getReviewSummary` | `(1)` 리뷰 3개(별점 4·5·3) | 평점 4.0, 리뷰 3개. tagStats 7개(0% 포함)가 percent 높은 순. 고소해요 67%, 가성비 좋아요 67%, 연해요 33%, 산미 0%. reviews 최신순 id `[3, 2, 1]`, 첫 리뷰 '예시회원3' · isSample true | | |
| 27 | 평가 집계 | `Reviews.getReviewSummary` | (경계) 리뷰 없는 메뉴 `(7)` | 평점 `null`, 리뷰 0개, reviews `[]`, tagStats 7개 모두 0개·0% | | |
| 28 | 평가 집계 | `Reviews.getReviewSummary` | (예외) `(999)` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 29 | 리뷰 작성 | `Reviews.getMyReview` | sample1 로그인, `(1)` | 별점 4, '고소하고 가격이 착해요', 버튼 `[2, 18]`, isSample true | | |
| 30 | 리뷰 작성 | `Reviews.getMyReview` | (경계) 로그아웃 상태, `(1)` | `null` | | |
| 31 | 리뷰 작성 | `Reviews.saveReview` | sample1 로그인, `(7, 5, '달달해요', [4, 17])` | 별점 5 · '달달해요' · 버튼 `[4, 17]` · isSample false인 리뷰를 돌려줌. 메뉴 7 리뷰 1개 | | |
| 32 | 평가 집계 | `Reviews.saveReview` | sample1이 `(7, 4, '', [3])`, sample2가 `(7, 2, '', [3, 17])` 저장 후 `getReviewSummary(7)` | 평점 3.0, 리뷰 2개, tagStats 1위 진해요(3) 100%, 양이 많아요(17) 50% | | |
| 33 | 리뷰 작성(다시 쓰기) | `Reviews.saveReview` | sample1이 이미 쓴 메뉴 1에 다시 `(1, 2, '별로', [4])` | 새로 만들지 않음: 메뉴 1 리뷰 3개 그대로, 평점 3.3 (2·5·3), 내 리뷰 별점 2 · isSample false | | |
| 34 | 리뷰 작성 | `Reviews.saveReview` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 35 | 리뷰 작성 | `Reviews.saveReview` | (예외) 별점 0 | 오류 '별점은 1~5 사이로 골라 주세요' | | |
| 36 | 리뷰 작성 | `Reviews.saveReview` | (예외) 별점 6 | 오류 '별점은 1~5 사이로 골라 주세요' | | |
| 37 | 리뷰 작성 | `Reviews.saveReview` | (예외) 한줄평 51자 | 오류 '한줄평은 50자 이내로 써 주세요' | | |
| 38 | 리뷰 작성 | `Reviews.saveReview` | (경계) 한줄평 정확히 50자 | 저장됨, 한줄평 길이 50 | | |
| 39 | 리뷰 작성 | `Reviews.saveReview` | (예외) 커피 메뉴 7에 논커피 버튼 `[6]` | 오류 '이 메뉴에서 고를 수 없는 평가 버튼입니다' | | |
| 40 | 리뷰 작성 | `Reviews.saveReview` | (예외) 반대 버튼 진해요·연해요 `[3, 4]` | 오류 '서로 반대되는 평가 버튼은 함께 고를 수 없어요' | | |
| 41 | 리뷰 작성 | `Reviews.saveReview` | (예외) 없는 메뉴 `(999, …)` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 42 | 내 리뷰 삭제(P1) | `Reviews.deleteReview` | sample1 로그인, 내 리뷰 `(1)` | 반환값 없음(`undefined`), 메뉴 1 리뷰 2개, `getMyReview(1)`은 `null` | | |
| 43 | 내 리뷰 삭제(P1) | `Reviews.deleteReview` | (예외) sample1이 sample2의 리뷰 `(2)` | 오류 '내가 쓴 리뷰만 삭제할 수 있습니다' | | |
| 44 | 내 리뷰 삭제(P1) | `Reviews.deleteReview` | (예외) 없는 리뷰 `(999)` | 오류 '리뷰를 찾을 수 없습니다' | | |
| 45 | 내 리뷰 삭제(P1) | `Reviews.deleteReview` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 46 | 내 리뷰 목록(P1) | `Reviews.getMyReviews` | sample1 로그인 | 7개, 최신순. 첫 항목 리뷰 id 19 · 메뉴 id 5 '치즈케이크' | | |
| 47 | 내 리뷰 목록(P1) | `Reviews.getMyReviews` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 48 | 같은 타입 비교 | `Compare.compareMenus` | `([1, 2, 6])` 커피 3개 | typeId 1 · '커피', tags id `[1, 2, 3, 4, 5, 17, 18]`, 열 순서 `[1, 2, 6]`, 메뉴 1 고소해요 67%. best: 가격 1, 평점 2, 리뷰 수 1, 고소해요(2) 2 | | |
| 49 | 같은 타입 비교 | `Compare.compareMenus` | (경계) `([1, 2, 6])`에서 세 메뉴 모두 0%인 '쓴맛이 강해요'(5) | best에 5가 없음 | | |
| 50 | 같은 타입 비교 | `Compare.compareMenus` | (경계) 리뷰 없는 두 메뉴 `([7, 13])` | best에 rating·reviewCount가 없음, best.price는 13 | | |
| 51 | 같은 타입 비교 | `Compare.compareMenus` | (예외) 1개 `([1])` | 오류 '2~4개 메뉴를 골라 주세요' | | |
| 52 | 같은 타입 비교 | `Compare.compareMenus` | (예외) 5개 `([1, 2, 6, 12, 16])` | 오류 '2~4개 메뉴를 골라 주세요' | | |
| 53 | 같은 타입 비교 | `Compare.compareMenus` | (예외) 커피 + 논커피 `([1, 3])` | 오류 '같은 종류의 메뉴끼리만 비교할 수 있어요' | | |
| 54 | 같은 타입 비교 | `Compare.compareMenus` | (예외) 없는 메뉴 `([1, 999])` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 55 | 조건 추천 | `Compare.recommend` | `{ typeId: 1, budget: null, tagIds: [], area: 'all' }` | 3개, rank `[1, 2, 3]`, 점수 높은 순. 1위 id 22 · 점수 0.86 · 이유 '평점 5.0 (리뷰 1개)' | | |
| 56 | 조건 추천 | `Compare.recommend` | `{ typeId: 1, budget: 2500, tagIds: [2], area: 'campus' }` | 메뉴 id `[2, 1, 12]`. 1위 점수 0.91, 이유 `예산 2,500원 이하 · 평점 4.5 (리뷰 2개) · '고소해요' 100%` | | |
| 57 | 조건 추천 | `Compare.recommend` | `{ typeId: 1, budget: null, tagIds: [], area: 'nearby' }` | 3개, 모두 area 'nearby' | | |
| 58 | 조건 추천 | `Compare.recommend` | (경계) 리뷰 없는 메뉴만 남음 `{ typeId: 5, budget: 2500, tagIds: [], area: 'all' }` | 1개, id 11 마카롱, 이유 '예산 2,500원 이하 · 아직 리뷰 없음' | | |
| 59 | 조건 추천 | `Compare.recommend` | (경계) 맞는 메뉴 없음 `budget: 1000` | 빈 배열 `[]` | | |
| 60 | 조건 추천 | `Compare.recommend` | (예외) `typeId: null` | 오류 '메뉴 타입을 골라 주세요' | | |
| 61 | 조건 추천 | `Compare.recommend` | (예외) 버튼 4개 `tagIds: [1, 2, 3, 5]` | 오류 '원하는 맛은 3개까지 고를 수 있어요' | | |
| 62 | 조건 추천 | `Compare.recommend` | (예외) 반대 버튼 `tagIds: [3, 4]` | 오류 '서로 반대되는 평가 버튼은 함께 고를 수 없어요' | | |
| 63 | 같은 타입 비교(비교함) | `Compare.getBox` | 1, 2를 담은 뒤 | `[1, 2]` (담은 순서) | | |
| 64 | 같은 타입 비교(비교함) | `Compare.getBox` | (경계) 처음 상태 | `[]` | | |
| 65 | 같은 타입 비교(비교함) | `Compare.addToBox` | `(1)` | `[1]` | | |
| 66 | 같은 타입 비교(비교함) | `Compare.addToBox` | (예외) 커피 1을 담은 뒤 논커피 `(3)` | 오류 '같은 종류의 메뉴끼리만 비교할 수 있어요' | | |
| 67 | 같은 타입 비교(비교함) | `Compare.addToBox` | (예외) 1·2·6·12를 담은 뒤 5번째 `(16)` | 오류 '2~4개 메뉴를 골라 주세요' | | |
| 68 | 같은 타입 비교(비교함) | `Compare.addToBox` | (예외) `(999)` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 69 | 같은 타입 비교(비교함) | `Compare.removeFromBox` | 1·2를 담은 뒤 `(1)` | `[2]`를 돌려주고 `getBox()`도 `[2]` | | |
| 70 | 같은 타입 비교(비교함) | `Compare.removeFromBox` | (경계) 1·2를 담은 뒤 없는 id `(999)` | 오류 없이 `[1, 2]` 그대로 | | |
| 71 | 회원가입·로그인 | `Account.signup` | `('newbie1', 'abcd', '새내기')` | `{ id: 7, loginId: 'newbie1', nickname: '새내기', role: 'member' }` (password 없음), 자동 로그인되어 현재 회원 id 7 | | |
| 72 | 회원가입·로그인 | `Account.signup` | (예외) 아이디 2자 `'ab'` | 오류 '아이디는 영문·숫자 4~12자로 정해 주세요' | | |
| 73 | 회원가입·로그인 | `Account.signup` | (예외) 특수문자 아이디 `'new_bie'` | 오류 '아이디는 영문·숫자 4~12자로 정해 주세요' | | |
| 74 | 회원가입·로그인 | `Account.signup` | (예외) 비밀번호 3자 `'123'` | 오류 '비밀번호는 4자 이상이어야 합니다' | | |
| 75 | 회원가입·로그인 | `Account.signup` | (예외) 빈 닉네임 | 오류 '닉네임은 1~10자로 정해 주세요' | | |
| 76 | 회원가입·로그인 | `Account.signup` | (예외) 닉네임 11자 | 오류 '닉네임은 1~10자로 정해 주세요' | | |
| 77 | 회원가입·로그인 | `Account.signup` | (예외) 이미 있는 아이디 `'sample1'` | 오류 '이미 사용 중인 아이디입니다' | | |
| 78 | 회원가입·로그인 | `Account.login` | `('sample1', '1234')` | `{ id: 4, loginId: 'sample1', nickname: '예시회원1', role: 'member' }`, 현재 회원 id 4 | | |
| 79 | 회원가입·로그인 | `Account.login` | (예외) 비밀번호 틀림 `('sample1', '0000')` | 오류 '아이디 또는 비밀번호가 맞지 않습니다' | | |
| 80 | 회원가입·로그인 | `Account.login` | (예외) 없는 아이디 `('nobody', '1234')` | 오류 '아이디 또는 비밀번호가 맞지 않습니다' | | |
| 81 | 회원가입·로그인 | `Account.logout` | sample1 로그인 후 | 현재 회원 `null` | | |
| 82 | 회원가입·로그인 | `Account.logout` | (경계) 로그아웃 상태에서 또 부름 | 오류 없음, 현재 회원 `null` | | |
| 83 | 즐겨찾기(P1) | `Account.toggleFavorite` | sample1 로그인, `('cafe', 1)`을 두 번 | 처음 `true`, 두 번째 `false` | | |
| 84 | 즐겨찾기(P1) | `Account.toggleFavorite` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 85 | 즐겨찾기(P1) | `Account.toggleFavorite` | (예외) 없는 메뉴 `('menu', 999)` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 86 | 즐겨찾기(P1) | `Account.isFavorite` | sample1이 카페 1을 즐겨찾기한 뒤 | `('cafe', 1)` → `true`, `('cafe', 2)` → `false` | | |
| 87 | 즐겨찾기(P1) | `Account.isFavorite` | (경계) 로그아웃 상태 | `false` | | |
| 88 | 즐겨찾기(P1) | `Account.getFavorites` | sample1이 카페 1, 메뉴 3을 즐겨찾기한 뒤 | cafes id `[1]`, menus id `[3]`. cafes[0] 평점 4.3, menus[0] cafeName '카페 A' | | |
| 89 | 즐겨찾기(P1) | `Account.getFavorites` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 90 | 사장 메뉴 관리 | `Account.getMyCafe` | ownera 로그인 | 카페 id 1 '카페 A' | | |
| 91 | 사장 메뉴 관리 | `Account.getMyCafe` | (예외) 일반 회원 sample1 | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 92 | 사장 메뉴 관리 | `Account.getMyCafe` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 93 | 사장 카페 정보 수정(P1) | `Account.updateCafe` | ownera, `(1, { name: '  카페 에이 ', locationText: '', openHours: '' })` | 이름 앞뒤 공백을 지운 '카페 에이', 위치·영업시간 `''`. `getCafe(1)`에서도 '카페 에이' | | |
| 94 | 사장 카페 정보 수정(P1) | `Account.updateCafe` | (예외) 이름이 공백뿐 `'   '` | 오류 '카페 이름을 입력해 주세요' | | |
| 95 | 사장 카페 정보 수정(P1) | `Account.updateCafe` | (예외) ownerb가 카페 1 수정 | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 96 | 사장 메뉴 추가 | `Account.addMenu` | ownera, `(1, { name: '바닐라라떼', typeId: 1, price: 3000, options: '' })` | 새 MenuItem id 26 · '카페 A' · '커피' · 3,000원 · 평점 `null`. '바닐라라떼' 검색 결과 2개 | | |
| 97 | 사장 메뉴 추가 | `Account.addMenu` | (예외) 이름 `''` | 오류 '메뉴 이름을 입력해 주세요' | | |
| 98 | 사장 메뉴 추가 | `Account.addMenu` | (예외) 가격 0 | 오류 '가격은 0보다 큰 숫자로 써 주세요' | | |
| 99 | 사장 메뉴 추가 | `Account.addMenu` | (예외) 일반 회원 sample1 | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 100 | 사장 가격 변경 | `Account.updatePrice` | ownera, `(1, 2200)` | 돌려준 MenuItem 가격 2200, `getMenu(1)`도 2200 | | |
| 101 | 사장 가격 변경 | `Account.updatePrice` | (예외) 가격 0 | 오류 '가격은 0보다 큰 숫자로 써 주세요' | | |
| 102 | 사장 가격 변경 | `Account.updatePrice` | (예외) 가격 -500 | 오류 '가격은 0보다 큰 숫자로 써 주세요' | | |
| 103 | 사장 가격 변경 | `Account.updatePrice` | (예외) 정수가 아닌 가격 2500.5 | 오류 '가격은 0보다 큰 숫자로 써 주세요' | | |
| 104 | 사장 가격 변경 | `Account.updatePrice` | (예외) ownerb가 카페 1 메뉴 변경 | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 105 | 사장 가격 변경 | `Account.updatePrice` | (예외) 일반 회원 sample1 | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 106 | 사장 가격 변경 | `Account.updatePrice` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 107 | 사장 가격 변경 | `Account.updatePrice` | (예외) ownera, 없는 메뉴 `(999, 1000)` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 108 | 회원가입·로그인 | `Auth.getCurrentUser` | sample1 로그인 | `{ id: 4, loginId: 'sample1', nickname: '예시회원1', role: 'member' }` (password 없음) | | |
| 109 | 회원가입·로그인 | `Auth.getCurrentUser` | (경계) 로그아웃 상태 | `null` | | |
| 110 | 회원가입·로그인 | `Auth.requireLogin` | sample1 로그인 | 현재 회원 id 4 | | |
| 111 | 회원가입·로그인 | `Auth.requireLogin` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 112 | 사장 권한 | `Auth.requireOwnerOf` | ownera, `(1)` | 현재 회원 id 1 | | |
| 113 | 사장 권한 | `Auth.requireOwnerOf` | (예외) ownera, 남의 카페 `(2)` | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 114 | 사장 권한 | `Auth.requireOwnerOf` | (예외) ownera, 없는 카페 `(999)` | 오류 '카페를 찾을 수 없습니다' | | |
| 115 | 데이터 저장 | `DataStore.init` | menuTypes를 `[]`로 저장한 뒤 `init()` | 고정 데이터라 data.js 값으로 다시 맞춰져 5개 | | |
| 116 | 데이터 저장 | `DataStore.init` | (경계) reviews를 `[]`로 저장한 뒤 `init()` | 처음 실행이 아니므로 reviews는 `[]` 그대로 | | |
| 117 | 데이터 저장(복사본) | `DataStore.load` | `('menus')`로 받은 배열에서 하나를 뺀 뒤 다시 load | 처음 25개, 다시 읽어도 25개 | | |
| 118 | 데이터 저장 | `DataStore.load` | (예외) 없는 키 `('nokey')` | 오류가 남 (문구는 7절에 없음) | | |
| 119 | 데이터 저장 | `DataStore.save` | `('compareBox', [1, 2])` 후 load | `[1, 2]` | | |
| 120 | 데이터 저장 | `DataStore.save` | (예외) 없는 키 `('nokey', [])` | 오류가 남 | | |
| 121 | 데이터 저장 | `DataStore.nextId` | `('menus')`, `('reviews')` | 26, 21 | | |
| 122 | 데이터 저장 | `DataStore.nextId` | (예외) 없는 키 `('nokey')` | 오류가 남 | | |
| 123 | 데이터 저장 | `DataStore.saveSession` / `loadSession` | `saveSession(4)` | `loadSession()`은 `{ userId: 4 }`, 현재 회원 id 4 | | |
| 124 | 데이터 저장 | `DataStore.clearSession` / `loadSession` | (경계) 세션 저장 후 `clearSession()` | `loadSession()`은 `null` | | |
| 125 | 데이터 저장 | `DataStore.reset` | sample1 로그인 + 리뷰 1개 추가 후 `reset()` | 리뷰 20개(처음 상태), 세션 `null` | | |
| 126 | 사장 메뉴 수정 | `Account.updateMenu` | ownera, 비교함 `[1, 2]`, `(2, { name: '  카페 라떼 ', typeId: 1 })` 타입 그대로 | 이름 '카페 라떼' · '커피'. 메뉴 2 리뷰 버튼 `[[2], [2, 17]]` 그대로, 비교함 `[1, 2]` 그대로 | | |
| 127 | 사장 메뉴 수정 | `Account.updateMenu` | ownera, 비교함 `[1, 2]`, `(1, { name: '아메리카노', typeId: 2 })` 타입 변경 | typeName '논커피 라떼'. 메뉴 1 리뷰 버튼 `[[18], [18], []]` (예전 타입 버튼만 지움), 비교함 `[2]`, 리뷰 수 3 그대로 | | |
| 128 | 사장 메뉴 수정 | `Account.updateMenu` | (예외) 이름 `'   '` | 오류 '메뉴 이름을 입력해 주세요' | | |
| 129 | 사장 메뉴 수정 | `Account.updateMenu` | (예외) 없는 타입 `typeId: 99` | 오류 '메뉴 타입을 골라 주세요' | | |
| 130 | 사장 메뉴 수정 | `Account.updateMenu` | (예외) ownerb가 카페 1 메뉴 수정 | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 131 | 사장 메뉴 수정 | `Account.updateMenu` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 132 | 사장 메뉴 수정 | `Account.updateMenu` | (예외) ownera, 없는 메뉴 `(999, …)` | 오류 '메뉴를 찾을 수 없습니다' | | |
| 133 | 사장 메뉴 삭제 | `Account.deleteMenu` | sample1이 메뉴 1·3 즐겨찾기, 비교함 `[1, 2]`, ownera `(1)` | 돌려준 메뉴 '아메리카노', `getMenu(1)` 오류, 리뷰 17개(메뉴 1 리뷰 3개 삭제), 비교함 `[2]`, 카페 A 메뉴 4개. sample1 즐겨찾기 메뉴 `[3]`, 내 리뷰 6개(오류 없음) | | |
| 134 | 사장 메뉴 삭제 | `Account.deleteMenu` | (예외) ownerb가 카페 1 메뉴 삭제 | 오류 '이 카페를 관리할 권한이 없습니다', 메뉴 25개 그대로 | | |
| 135 | 사장 메뉴 삭제 | `Account.deleteMenu` | (예외) 일반 회원 sample1 | 오류 '이 카페를 관리할 권한이 없습니다' | | |
| 136 | 사장 메뉴 삭제 | `Account.deleteMenu` | (예외) 로그아웃 상태 | 오류 '로그인이 필요합니다' | | |
| 137 | 사장 메뉴 삭제 | `Account.deleteMenu` | (예외) ownera, 없는 메뉴 `(999)` | 오류 '메뉴를 찾을 수 없습니다' | | |
