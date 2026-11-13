# 단계별 AI 프롬프트

> 바이브 코딩용 프롬프트 모음입니다. **위에서부터 순서대로** 하나씩 씁니다.
> 프롬프트 하나 = 파일(또는 함수 묶음) 하나입니다. 끝날 때마다 **브라우저·콘솔에서 확인 → 커밋**한 뒤 다음으로 넘어갑니다.
>
> - Claude Code·Cursor처럼 레포를 직접 읽는 도구: 프롬프트를 그대로 붙여 넣습니다.
> - ChatGPT·Claude 웹 채팅: `docs/rules.md`, `docs/interface.md`, `docs/data.md`와 프롬프트에 적힌 파일을 **첨부**한 뒤 붙여 넣습니다.
> - `[ ]` 안은 상황에 맞게 바꿉니다.

---

## 공통: 새 대화를 시작할 때 맨 먼저

```text
이 프로젝트는 대학교 1학년 설계 과목의 조별과제 '교내 카페 추천 사이트'야.
작업 전에 docs/rules.md, docs/interface.md, docs/data.md를 먼저 읽고 그대로 따라 줘.
특히 지켜야 할 것:
- HTML, CSS, JavaScript만 쓴다. 프레임워크·라이브러리·서버·npm 금지.
- <script type="module">, import/export, 로컬 파일 fetch 금지. 일반 <script src>로만 불러온다.
- 파일 하나는 rules.md에 적힌 전역 객체 하나만 만든다.
- 계층 규칙: 화면은 기능 모듈만 부르고, 데이터는 DataStore만 만진다.
- 함수 이름·입력·출력은 interface.md와 똑같이. 바꾸고 싶으면 코드 대신 제안만 해.
- if/for 본문은 한 줄이어도 중괄호와 줄바꿈. ++/--는 다른 식과 섞지 않는다.
- 내가 말한 파일만 고치고, 다른 파일은 건드리지 마.
읽었으면 지켜야 할 규칙을 다섯 줄로 요약해 줘. 코드는 아직 쓰지 마.
```

---

## 1단계. 뼈대

### 1-1. 폴더 구조와 빈 화면 파일

```text
rules.md 4절의 폴더 구조대로 파일을 만들어 줘.
- html 11개: 각 파일은 <head>에 meta charset, viewport, 화면 제목, css/style.css 링크만 넣고,
  <body>에는 <header id="app-header"></header>, <main id="app"></main>, <nav id="tab-bar"></nav>만 둬.
  </body> 바로 위에 rules.md 3절의 순서대로 script 태그를 넣고, 마지막 줄은 그 화면의 js/ui/<화면>.js로 해.
  (index.html → js/ui/home.js, search.html → js/ui/search.js … 처럼 html 이름과 맞춰.)
- js/ 아래 파일들과 js/ui/*.js는 맨 위에 "이 파일의 역할" 한국어 주석 한 줄만 있는 빈 파일로.
- css/style.css는 빈 파일로.
- img/ 폴더는 비워 두고 .gitkeep만 넣어.
기능 코드는 하나도 쓰지 마. 만든 파일 목록을 마지막에 보여 줘.
```

확인: 폴더 구조가 `rules.md`와 같은지, `index.html`을 열었을 때 콘솔(F12)에 빨간 오류가 없는지
커밋: `chore : 폴더 구조와 빈 화면 파일 생성`

### 1-2. 초기 데이터 `js/data.js`

```text
data.md를 따라 js/data.js에 SEED_DATA와 MAP_BOUNDS를 만들어 줘.
- menuTypes와 evalTags는 data.md 4절 표와 id까지 똑같이.
- 사장 계정 [3]개(카페마다 1명, role 'owner', 비밀번호 '1234')와 예시 회원 [3]명(role 'member').
- 카페 [5]개: 교내 [3], 근처 [2]. 이름은 '카페 A'~'카페 E', lat·lng는 0으로 두고 // TODO 주석.
- 메뉴: 카페마다 4~6개, 다섯 가지 메뉴 타입이 골고루 나오게. 가격은 2,000~5,000원 사이의 그럴듯한 값.
- 예시 리뷰 [20]개: isSample true, 예시 회원이 쓴 것, tagIds는 그 메뉴 타입의 버튼과 공통 버튼 중에서만.
  같은 회원이 같은 메뉴에 두 번 쓰지 않게.
- favorites와 compareBox는 빈 배열.
- 파일 맨 위에 "실제 카페·메뉴·가격은 조사 결과로 바꿀 예정인 예시 데이터"라고 주석.
다른 파일은 고치지 마.
마지막에 콘솔에서 확인할 코드를 줘: 카페·메뉴·리뷰 개수, 리뷰의 tagIds가 모두 그 메뉴 타입에 맞는지 검사.
```

확인: 콘솔에서 받은 검사 코드 실행 → 오류 없음
커밋: `feat : 예시 초기 데이터 추가`

### 1-3. 저장소 `js/storage.js`

```text
interface.md 6절과 data.md 1절을 따라 js/storage.js에 DataStore를 만들어 줘.
- init, load, save, nextId, loadSession, saveSession, clearSession, reset
- localStorage 키는 'cafe9.' 접두사. load는 항상 복사본을 돌려줘(JSON.parse로).
- 파일 끝에서 DataStore.init()을 스스로 한 번 실행.
- 모르는 key를 load/save하면 오류를 던져.
- localStorage는 이 파일 밖에서 쓰지 않는다는 걸 맨 위 주석에 적어 줘.
다른 파일은 고치지 마. 마지막에 콘솔 테스트 코드 5줄을 줘
(load 개수 확인, save 후 다시 load, nextId, reset 후 원래대로 돌아오는지).
```

커밋: `feat : DataStore 저장소 구현`

---

## 2단계. 기능 모듈 (의존 순서대로)

> 각 프롬프트 뒤에 받은 테스트 코드를 콘솔에서 실행해 보고, 통과하면 커밋합니다.
> 테스트 중 데이터가 꼬이면 콘솔에서 `DataStore.reset()`.

### 2-1. 카페·메뉴 조회 `js/cafes.js`

```text
interface.md 1~2절을 따라 js/cafes.js에 Cafes를 만들어 줘.
이번에는 searchCafes, getCafe, searchMenus, getMenusByType, getMenu, getMenuTypes만.
(getMapPins, getMapLinks는 나중에 하니까 만들지 마.)
- CafeItem, MenuItem, topTag 모양은 1절과 똑같이. 평점은 소수 첫째 자리 반올림, 리뷰 없으면 null.
- 정렬 규칙과 '리뷰 없는 건 맨 뒤' 규칙을 지켜.
- 평점·버튼 비율 계산은 이 파일 안의 작은 내부 함수로 나눠 두고, 함수마다 역할/입력/출력 주석.
- 데이터는 DataStore.load로만 읽어. 없는 id는 interface.md 7절 메시지로 오류.
다른 파일은 고치지 마. 마지막에 콘솔 테스트 코드를 줘:
타입 필터, 세 가지 정렬, 없는 id 오류, getMenusByType의 타입 순서.
```

커밋: `feat : 카페·메뉴 조회 모듈 구현`

### 2-2. 로그인 확인 `js/auth.js`

```text
interface.md 6절을 따라 js/auth.js에 Auth를 만들어 줘: getCurrentUser, requireLogin, requireOwnerOf.
- 로그인 상태는 DataStore.loadSession()으로 읽어.
- getCurrentUser는 password를 뺀 { id, loginId, nickname, role }만 돌려줘.
- requireOwnerOf는 role이 owner이고 그 카페의 ownerId가 본인일 때만 통과.
- 오류 메시지는 7절 그대로.
다른 파일은 고치지 마. 콘솔 테스트 코드도 줘(DataStore.saveSession으로 로그인 상태를 바꿔 가며).
```

커밋: `feat : 로그인·권한 확인 구현`

### 2-3. 회원가입·로그인 `js/account.js` (1차)

```text
interface.md 5절을 따라 js/account.js에 Account를 만들되, 이번에는 signup, login, logout만.
- 입력 검사(아이디 형식, 비밀번호 길이, 닉네임 길이, 아이디 중복)와 오류 메시지는 7절 그대로.
- 가입하면 role은 'member', 자동 로그인.
- 반환값에 password를 넣지 마.
- 나머지 함수 자리는 만들지 말고 주석으로 "2-5에서 추가"만 남겨.
다른 파일은 고치지 마. 콘솔 테스트 코드를 줘(정상 가입, 중복 가입 오류, 틀린 비밀번호, 로그아웃 후 getCurrentUser null).
```

커밋: `feat : 회원가입·로그인 구현`

### 2-4. 리뷰·평가 집계 `js/reviews.js`

```text
interface.md 3절을 따라 js/reviews.js에 Reviews를 만들어 줘:
getReviewSummary, getMyReview, saveReview, deleteReview, getMyReviews.
- saveReview: Auth.requireLogin()으로 확인. 별점 1~5 정수, 한줄평 50자 이내,
  tagIds는 그 메뉴 타입의 버튼 + 공통 버튼만 허용. 같은 회원이 같은 메뉴에 다시 쓰면 기존 리뷰를 수정.
- tagStats는 그 타입의 모든 버튼(공통 포함)을 percent 높은 순으로, 0%도 포함.
- 메뉴 정보가 필요하면 Cafes.getMenu를 써(직접 menus를 다시 계산하지 마).
다른 파일은 고치지 마. 콘솔 테스트 코드를 줘:
로그인 없이 저장 → 오류, 다른 타입 버튼 → 오류, 같은 메뉴에 두 번 저장 → 리뷰 수 그대로,
리뷰 4개 중 3개가 고른 버튼이 75%로 나오는지.
```

커밋: `feat : 리뷰 작성·평가 집계 구현`

### 2-5. 사장 기능·즐겨찾기 `js/account.js` (2차)

```text
js/account.js에 interface.md 5절의 나머지 함수를 추가해 줘:
getMyCafe, updateCafe, addMenu, updatePrice, toggleFavorite, isFavorite, getFavorites.
- 사장 기능은 모두 Auth.requireOwnerOf(cafeId)로 확인. updatePrice는 메뉴의 cafeId로 확인.
- addMenu는 이름 비었는지, typeId가 있는 타입인지, 가격이 0보다 큰 정수인지 검사.
- 즐겨찾기는 Auth.requireLogin(). isFavorite은 로그인 안 했으면 false.
- 이미 있는 signup/login/logout은 고치지 마. 다른 파일도 고치지 마.
콘솔 테스트 코드를 줘: 사장 A가 카페 B 메뉴 가격 변경 → 오류, 정상 가격 변경 후 Cafes.getMenu로 확인,
즐겨찾기 두 번 토글하면 원래대로.
```

커밋: `feat : 사장 메뉴 관리·즐겨찾기 구현`

### 2-6. 비교함·비교표 `js/compare.js` (1차)

```text
interface.md 4절과 6절을 따라 js/compare.js에 Compare를 만들되, 이번에는
getBox, addToBox, removeFromBox, compareMenus만.
- 비교함은 DataStore의 compareBox 키. 최대 4개, 이미 담긴 메뉴와 타입이 다르면 오류.
- compareMenus: 2~4개, 같은 타입만. rows의 tagPercents는 Reviews.getReviewSummary의 tagStats로 채워.
- best: 가격은 낮을수록, 평점·리뷰 수·버튼 비율은 높을수록 1위. 평점이 전부 null이면 그 항목은 빼.
- recommend 자리는 만들지 말고 주석으로 "2-7에서 추가".
다른 파일은 고치지 마. 콘솔 테스트 코드도 줘.
```

커밋: `feat : 비교함·비교표 구현`

### 2-7. 추천 `js/compare.js` (2차)

```text
js/compare.js에 Compare.recommend(condition)를 추가해 줘. interface.md 4절 '추천 점수 계산'을 그대로 따라.
- 걸러 내기(타입, 예산, 위치) → 보정 평점 → 선호 일치율 → 점수 → 상위 3개.
- 계산 단계마다 작은 내부 함수로 나누고, 함수 위에 수식을 주석으로 적어 줘(보고서에 쓸 거야).
- reason 문구 예시: "예산 4,000원 이하 · 평점 4.6 (리뷰 12개) · '고소해요' 75%"
- 가중치(0.6, 0.4)와 보정 상수(5)는 파일 맨 위 상수로 빼 둬.
- 기존 함수와 다른 파일은 고치지 마.
콘솔 테스트 코드를 줘: 예산을 넘는 메뉴가 빠지는지, 버튼을 안 골랐을 때, 버튼 4개 → 오류,
그리고 결과 3개의 점수 계산 과정을 콘솔에 표로 찍어 보는 코드.
```

커밋: `feat : 조건 추천 구현`

### 2-8. 지도 핀·카카오맵 링크 `js/cafes.js` (P1)

```text
js/cafes.js에 interface.md 2절의 getMapPins와 getMapLinks를 추가해 줘.
- 핀 위치는 2절의 변환식과 data.js의 MAP_BOUNDS를 써. 0~100 밖이면 목록에서 빼.
- MAP_BOUNDS가 아직 0이면(TODO 상태) 빈 배열을 돌려줘.
- 카카오맵 링크: view는 /link/map/, route는 /link/to/, 카페 이름은 encodeURIComponent, 좌표는 위도,경도 순서.
- 기존 함수와 다른 파일은 고치지 마. 콘솔 테스트 코드도 줘.
```

커밋: `feat : 지도 핀·카카오맵 링크 구현`

---

## 3단계. 화면 (2단계와 동시에 진행)

### 3-0. 가짜 모듈 (화면 담당이 기능 모듈을 기다리지 않도록)

```text
interface.md에 적힌 Cafes, Reviews, Compare, Account, Auth를 흉내 내는 가짜 모듈을
js/mock/ 폴더에 파일별로 만들어 줘 (cafes.mock.js, reviews.mock.js, compare.mock.js, account.mock.js, auth.mock.js).
- 전역 이름·함수 이름·입력·반환 모양은 interface.md와 완전히 똑같이. 값은 그럴듯한 고정 데이터.
- 저장은 하지 않고, 저장 함수는 받은 값을 그대로 돌려주기만.
- 각 파일 맨 위에 "화면 개발용 가짜. 진짜 모듈이 완성되면 script 태그를 바꿔 끼운다" 주석.
- 진짜 파일(js/cafes.js 등)과 html은 고치지 마.
마지막에 html에서 진짜 ↔ 가짜를 바꾸는 방법(script 태그 몇 줄)을 알려 줘.
```

커밋: `chore : 화면 개발용 가짜 모듈 추가`

### 3-1. 공통 스타일과 하단 탭 `css/style.css`, `js/ui/common.js`

```text
[디자인 캔버스의 홈 화면 목업 캡처 첨부]
rules.md 7절을 따라 공통 화면을 만들어 줘.
1) css/style.css: 색·글꼴 변수(:root), body는 max-width 480px 가운데 정렬, 상단 바, 하단 탭(고정, 5칸),
   카드, 칩(선택됨/안 됨), 버튼(채움/테두리), 입력칸, 배지(교내/근처), 별점 색, 표 가로 스크롤 상자.
   누르는 것은 모두 높이 44px 이상. 클래스 이름은 짧고 뜻이 보이게(.card, .chip, .chip.is-selected …).
2) js/ui/common.js: 모든 화면이 쓰는 도우미 함수
   - renderHeader(title, showBack): #app-header 채우기
   - renderTabBar(current): #tab-bar에 홈·지도·비교·추천·마이 5개, 현재 탭 강조, 아이콘은 인라인 SVG
   - getQueryNumber(name): URL의 ?id=3 같은 값을 숫자로
   - showError(message): 화면 위쪽에 안내 띄우기
   - el(tag, className, text): 요소 만들기 도우미. 사용자가 쓴 글자는 반드시 textContent로 넣는다(innerHTML 금지).
   - formatPrice(3000) → '3,000원', formatRating(null) → '리뷰 없음'
다른 파일은 고치지 마. 각 함수 위에 역할 주석.
```

커밋: `style : 공통 스타일과 하단 탭`

### 3-2 ~ 3-12. 화면 하나씩 (공통 틀)

아래 틀에 화면별 내용(다음 표)을 채워 씁니다. **화면 목업 캡처를 꼭 첨부**합니다.

```text
[해당 화면 목업 캡처 첨부]
[화면 이름] 화면을 만들어 줘. 고칠 파일은 [html 파일]과 [js/ui/파일.js] 두 개뿐이야.
- 첨부한 목업과 같은 배치·문구로. 공통 모양은 css/style.css의 클래스와 js/ui/common.js의 도우미를 써.
  이 화면에만 필요한 스타일은 style.css 맨 아래에 '/* [화면 이름] */' 주석 아래 추가해도 돼.
- 데이터는 interface.md 8절에 적힌 함수로만 가져와. DataStore나 localStorage를 직접 쓰지 마.
- 기능 함수가 오류를 던지면 try/catch로 받아 showError로 보여 줘.
- 사용자가 입력한 글자(닉네임, 한줄평 등)는 textContent로 넣어.
- 화면 요구사항:
  [아래 표의 '화면 요구사항'을 붙여 넣기]
다 만들면 이 화면을 확인하는 순서(어디를 눌러 보면 되는지)를 5줄로 알려 줘.
```

| 번호 | 화면 | 파일 | 화면 요구사항 (틀에 붙여 넣을 내용) |
| --- | --- | --- | --- |
| 3-2 | 홈 | `index.html`, `js/ui/home.js` | 검색창(누르면 search.html), '오늘 뭐 마시지?' 카드(recommend.html). '카페 목록/메뉴 목록' 전환 버튼. 카페 목록: Cafes.searchCafes('', area)로 평점순, 전체·교내·근처 칩, 카드 누르면 cafe.html?id=. 메뉴 목록: Cafes.getMenusByType()로 타입별 묶음, 위쪽 타입 칩을 누르면 그 묶음으로 스크롤, 줄 누르면 menu.html?id=. |
| 3-3 | 검색 결과 | `search.html`, `js/ui/search.js` | 위쪽 검색어 입력(?q= 로도 받기). 메뉴/카페 탭. 메뉴 탭: 타입 칩(전체+5개), 정렬 선택(평점·가격·리뷰). 카드: 메뉴명, 카페·교내/근처·가격, 별점(리뷰 수), topTag. 카드 오른쪽 담기 버튼 → Compare.addToBox, 담긴 건 체크 표시. 아래에 '비교함 n/4 · 비교하기' 막대(compare.html). |
| 3-4 | 카페 상세 | `cafe.html`, `js/ui/cafe.js` | ?id= 로 Cafes.getCafe. 이름·배지·위치·영업시간·평균 평점. 즐겨찾기 하트(Account.toggleFavorite, 로그인 안 했으면 login.html로). 카카오맵 '지도에서 보기'·'길찾기' 버튼(Cafes.getMapLinks, 새 탭). 메뉴를 타입별로 묶어 목록, 줄 누르면 menu.html?id=. |
| 3-5 | 메뉴 상세 | `menu.html`, `js/ui/menu.js` | ?id= 로 Cafes.getMenu, Reviews.getReviewSummary. 카페 이름(cafe.html 링크)·타입·가격·옵션. 큰 평점 숫자, 별, 리뷰 수. 평가 버튼별 비율 막대(상위 5개). 리뷰 목록(닉네임, 별, 날짜, 버튼 칩, 한줄평, 예시 리뷰는 '예시' 표시). 아래 고정: '비교함 담기', '리뷰 쓰기'(review.html?menuId=, 로그인 안 했으면 login.html). |
| 3-6 | 리뷰 쓰기 | `review.html`, `js/ui/review.js` | ?menuId= 로 메뉴 정보. 별 5개 버튼(누르면 선택), 그 메뉴 타입 + 공통 평가 버튼을 칩으로(여러 개 토글), 한줄평 textarea(50자, 글자 수 표시). 이미 쓴 리뷰가 있으면(Reviews.getMyReview) 채워서 열기. 저장 → Reviews.saveReview 후 menu.html?id= 로. 로그인 안 했으면 login.html로. |
| 3-7 | 로그인 | `login.html`, `js/ui/login.js` | 로그인/회원가입 전환. 로그인: 아이디·비밀번호. 회원가입: 아이디·비밀번호·닉네임. "학교 과제용이라 비밀번호가 암호화되지 않아요. 실제 비밀번호를 쓰지 마세요" 안내 상자. 성공하면 ?next= 주소로, 없으면 mypage.html로. |
| 3-8 | 마이 | `mypage.html`, `js/ui/mypage.js` | 로그인 안 했으면 login.html?next=mypage.html. 닉네임·역할(일반 회원/카페 사장). 사장이면 '내 카페 관리' 카드(owner.html). 즐겨찾기/내 리뷰 탭: Account.getFavorites(카페·메뉴 나눠서), Reviews.getMyReviews. 로그아웃 버튼. |
| 3-9 | 사장 관리 | `owner.html`, `js/ui/owner.js` | 사장이 아니면 안내 후 홈으로. Account.getMyCafe. 카페 정보 입력칸(이름·위치 설명·영업시간)+저장(Account.updateCafe). 메뉴 목록마다 가격 입력칸+'변경'(Account.updatePrice). 새 메뉴 추가 폼(이름, 타입 select, 가격, 옵션 → Account.addMenu). 성공하면 짧은 안내 문구. |
| 3-10 | 지도 | `map.html`, `js/ui/map.js` | 지도 이미지(img/campus-map.png)를 화면보다 크게, 스크롤 상자(overflow:auto) 안에. Cafes.getMapPins로 핀을 position:absolute, left/top %로. 교내 핀은 꽉 찬 색, 근처 핀은 테두리만. 핀(44px 이상) 누르면 cafe.html?id=. 위쪽 전체·교내·근처 칩. 이미지가 아직 없으면 회색 상자 + "지도 이미지 준비 중". |
| 3-11 | 비교 | `compare.html`, `js/ui/compare.js` | Compare.getBox로 담긴 메뉴를 칩으로(x로 빼기 → removeFromBox), '+ 추가'는 search.html. 2개 미만이면 "메뉴를 2개 이상 담아 주세요" 안내. 2개 이상이면 Compare.compareMenus 결과를 표로: 열=메뉴, 행=가격·평점·리뷰 수·평가 버튼들. best에 해당하는 칸을 강조. 표는 가로 스크롤 상자. |
| 3-12 | 추천 | `recommend.html`, `js/ui/recommend.js` | 1.메뉴 타입 칩(필수) 2.예산 입력+빠른 칩(2,000·3,000·4,000·5,000) 3.원하는 맛 칩(고른 타입의 버튼+공통, 최대 3개) 4.위치(전체·교내만·근처만). '추천받기' → Compare.recommend. 결과 카드 3개: 순위, 메뉴·카페, 별점·가격, reason 문구, 누르면 menu.html?id=. 결과 없으면 "조건에 맞는 메뉴가 없어요. 예산을 늘려 보세요". |

화면 하나 끝날 때마다 커밋: `feat : [화면 이름] 화면`

---

## 4단계. 합치기·테스트

### 4-1. 가짜 → 진짜 교체

```text
js/mock/의 가짜 모듈 대신 진짜 모듈(js/cafes.js 등)을 쓰도록 html 11개의 script 태그를 rules.md 3절 순서로 바꿔 줘.
script 태그만 고치고 다른 코드는 건드리지 마.
그다음, 화면 스크립트(js/ui/*.js)를 읽고 interface.md와 다르게 부르는 곳(함수 이름, 인자 순서, 반환값 필드 이름)이
있으면 목록으로만 알려 줘. 고치지는 마.
```

목록이 나오면 하나씩 고칩니다. 고칠 때는 **interface.md가 기준**이고, 틀린 쪽(화면 또는 모듈)을 고칩니다.
커밋: `chore : 진짜 모듈로 교체`

### 4-2. 기능 테스트 케이스 (한영현)

```text
docs/interface.md 7절의 오류 메시지와 2~6절의 함수를 바탕으로 기능 테스트 케이스 표를 만들어 줘.
열: 번호 | 요구사항 | 함수 | 입력/상황 | 기대 결과 | 실제 결과(빈칸) | 통과(빈칸)
- 함수마다 정상 1개 이상, 예외 1개 이상.
- P0 요구사항을 빠짐없이: 메뉴 타입별 검색, 정렬, 리뷰 작성, 평가 집계, 같은 타입 비교, 조건 추천,
  회원가입·로그인, 사장 가격 변경.
결과를 docs/test-cases.md로 저장해 줘. 그리고 브라우저 콘솔에 붙여 넣으면 이 케이스들을 자동으로 돌려
통과/실패를 표로 찍는 코드(js/test/run-tests.js)도 만들어 줘. 테스트 전에 DataStore.reset()을 부르게.
다른 파일은 고치지 마.
```

커밋: `docs : 기능 테스트 케이스와 자동 점검 코드`

### 4-3. 버그 고치기 (필요할 때마다)

```text
[화면 이름]에서 [어떻게 했더니] [무슨 일이 생겼어]. 원래는 [어떻게 돼야 해].
콘솔 오류: [오류 문구 붙여 넣기, 없으면 '없음']
관련 파일: [파일 이름]
먼저 원인이 무엇인지 설명하고, 고칠 파일과 고칠 부분을 보여 준 뒤 고쳐 줘.
interface.md의 함수 이름·입출력은 바꾸지 마. 바꿔야만 고쳐진다면 고치지 말고 이유만 말해 줘.
```

커밋: `fix : [무엇을 고쳤는지]`

### 4-4. 설계 문서 ↔ 코드 일치 점검 (5주차)

```text
docs/rules.md, docs/interface.md, docs/data.md와 실제 코드(js/, html, css)를 비교해서
설계와 다른 곳을 전부 찾아 표로 정리해 줘.
열: 문서 위치 | 코드 위치 | 무엇이 다른가 | 문서를 고칠지 코드를 고칠지 추천
확인할 것: 함수 이름·입출력, 계층 규칙 위반(화면에서 DataStore·localStorage 직접 사용 등), 오류 메시지 문구,
데이터 필드 이름, 금지된 기술(module, import, fetch, 외부 라이브러리), 코드 스타일 규칙(한 줄 if/for, ++ 섞어 쓰기).
아무것도 고치지 말고 표만 줘.
```

### 4-5. 보고서·발표용 코드 설명

```text
[js/compare.js]를 읽고, 대학교 1학년 설계 과목 보고서에 넣을 설명을 써 줘.
- 이 모듈이 블록 다이어그램에서 맡은 역할
- 함수마다: 하는 일, 입력, 출력, 처리 순서(번호 목록)
- recommend는 점수 계산식과 예시 하나를 직접 계산해 보여 줘(data.js의 실제 값으로)
- 설계에서 이렇게 정한 이유(계층 규칙, 보정 평점을 쓴 이유 등)
코드는 고치지 마.
```
