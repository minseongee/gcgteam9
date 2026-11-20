# 개발 규칙

> AI(바이브 코딩)에게 코드를 시킬 때 **항상 `interface.md`, `data.md`와 함께 첨부**하는 문서입니다.
> 규칙을 바꿀 때는 팀 회의(금요일)에서 정하고, 이 문서를 먼저 고친 뒤 코드를 고칩니다.

## 1. 프로젝트 한 줄 요약

교내·학교 근처 카페의 메뉴를 찾고, 리뷰(별점·한줄평·평가 버튼)를 남기고, 같은 종류 메뉴끼리 비교·추천받는 **모바일 우선 웹사이트**입니다. 대학교 1학년 설계 과목 과제이므로 **완성도보다 설계와 코드의 일치**가 중요합니다.

## 2. 실행 환경

- 배포하지 않습니다. 노트북 Chrome에서 `index.html`을 더블클릭해 실행합니다.
- 휴대폰 화면은 Chrome 개발자 도구(F12)의 기기 툴바로 확인합니다.
- 데이터는 브라우저 저장소(localStorage)에 저장합니다. 브라우저마다 따로 저장되므로 시연은 노트북 한 대로 합니다.

## 3. 기술 제한 (반드시 지킬 것)

- **HTML, CSS, JavaScript(브라우저 기본 기능)만 씁니다.**
  - 프레임워크(React, Vue 등), 라이브러리(jQuery 등), 빌드 도구(npm, Vite 등), 서버(Express 등), DB는 쓰지 않습니다.
  - 꼭 필요해 보이면 코드를 쓰지 말고 먼저 팀에 물어봅니다.
- **스크립트는 일반 `<script src="...">`로 불러옵니다.**
  - `type="module"`, `import`, `export`는 쓰지 않습니다. 파일을 더블클릭해 열면(file://) 브라우저가 막습니다.
  - `fetch`로 로컬 JSON 파일을 읽지 않습니다. 같은 이유로 막힙니다. 초기 데이터는 `js/data.js` 안의 JS 객체로 둡니다.
- **파일 하나는 전역 객체 하나만 만듭니다.** 다른 전역 변수를 만들지 않습니다.
  - 예외: `js/ui/common.js`는 모든 화면이 함께 쓰는 **화면 도우미 함수**를 전역 함수로 둡니다(아래 표). 이 함수들은 화면만 다루고, 기능 모듈·`DataStore`는 부르지 않습니다.

  | 파일 | 전역 이름 |
  | --- | --- |
  | `js/data.js` | `SEED_DATA`, `MAP_BOUNDS` |
  | `js/storage.js` | `DataStore` (브라우저 기본 `Storage`와 이름이 겹치지 않게) |
  | `js/auth.js` | `Auth` |
  | `js/cafes.js` | `Cafes` |
  | `js/reviews.js` | `Reviews` |
  | `js/compare.js` | `Compare` |
  | `js/account.js` | `Account` |
  | `js/ui/common.js` | 화면 도우미 함수: `el`, `icon`, `renderHeader`, `renderTabBar`, `getQueryNumber`, `showMessage`, `showError`, `showNotice`, `formatPrice`, `formatRating`, `formatStars`, `areaBadge`, `loginUrl` |
  | `js/ui/<화면이름>.js` | 전역 이름 없음. 파일 전체를 `(function () { … })();`로 감싸 안의 변수·함수가 밖으로 나가지 않게 함 |
  | `js/mock/*.mock.js` | 진짜 모듈과 같은 이름(`Auth`, `Cafes`, `Reviews`, `Compare`, `Account`). 화면 개발용 가짜라 진짜 모듈 **대신** 불러옴(함께 불러오면 이름이 겹쳐 오류) |
  | `js/test/run-tests.js` | 전역 이름 없음. 파일 전체를 `(function () { … })();`로 감쌈. html에서 불러오지 않고 F12 콘솔에 붙여 넣어 실행 |

- **스크립트 불러오는 순서** (모든 html 파일 공통, `</body>` 바로 위):

  ```html
  <script src="js/data.js"></script>
  <script src="js/storage.js"></script>
  <script src="js/auth.js"></script>
  <script src="js/cafes.js"></script>
  <script src="js/reviews.js"></script>
  <script src="js/compare.js"></script>
  <script src="js/account.js"></script>
  <script src="js/ui/common.js"></script>
  <script src="js/ui/<화면이름>.js"></script>
  ```

## 4. 폴더 구조

```
project/
  index.html            홈
  search.html           검색 결과
  cafe.html             카페 상세        (cafe.html?id=1)
  menu.html             메뉴 상세        (menu.html?id=3)
  review.html           리뷰 쓰기        (review.html?menuId=3)
  compare.html          비교
  recommend.html        추천
  map.html              지도
  login.html            로그인·회원가입
  mypage.html           마이페이지
  owner.html            사장 관리
  css/style.css         공통 스타일
  img/campus-map.png    캠퍼스 지도 이미지
  img/cafes/            카페 사진 (cafe-<id>.jpg, data.md 8절)
  js/
    data.js             초기 데이터
    storage.js          저장소
    auth.js             로그인·권한 확인
    cafes.js            A. 카페·메뉴 조회
    reviews.js          B. 리뷰·평가 집계
    compare.js          C. 비교·추천
    account.js          D. 계정·즐겨찾기·운영
    ui/                 화면별 스크립트 (common.js, home.js, search.js …)
    mock/               화면 개발용 가짜 모듈 (cafes.mock.js 등, 진짜 모듈 대신 script 태그를 바꿔 끼움)
    test/               기능 테스트 (run-tests.js: 콘솔에 붙여 넣어 실행, html에서 불러오지 않음, 케이스는 docs/test-cases.md)
  docs/                 설계 문서 (이 폴더)
```

## 5. 계층 규칙 (설계의 핵심)

```
화면 (html + css + js/ui/*.js)
   │  함수 호출 → 반환값 / 오류
   ▼
기능 모듈 (Cafes · Reviews · Compare · Account)
   │                     │
   ▼                     ▼
Auth (로그인·권한)    DataStore (읽기·쓰기 창구)
                         │
                         ▼
               SEED_DATA(data.js) + localStorage
```

1. **화면 스크립트(`js/ui/*.js`)는 기능 모듈과 `Auth.getCurrentUser()`만 부릅니다.** `DataStore`나 `localStorage`를 직접 만지지 않습니다.
2. **기능 모듈은 화면(HTML, `document`)을 모릅니다.** 값을 받아 값을 돌려주기만 합니다. `alert`, `document.querySelector` 등을 쓰지 않습니다.
3. **데이터를 읽고 쓰는 곳은 `DataStore` 하나뿐입니다.** `localStorage`는 `storage.js` 안에서만 씁니다.
4. 함수 이름·입력·출력은 `interface.md`에 적힌 그대로 만듭니다. 바꿔야 하면 **문서를 먼저 고치고** 팀에 알립니다.

## 6. 오류 처리 규칙

- 기능 모듈은 실패하면 `throw new Error('사용자에게 보여 줄 한국어 문장')`을 던집니다. (문장 목록은 `interface.md` 7절)
- 화면 스크립트는 `try { … } catch (e) { … }`로 받아 화면에 안내 문구를 띄웁니다.
- 실패를 `null`이나 `false`로 조용히 넘기지 않습니다. (단, `interface.md`에 "없으면 null"이라고 적힌 경우는 예외)

## 7. 화면 규칙 (모바일 우선)

- 휴대폰 폭(360~430px) 기준으로 **한 줄 세로 배치 하나만** 만듭니다. PC에서는 본문을 `max-width: 480px; margin: 0 auto;`로 가운데에 보여 줍니다.
- 모든 화면 아래에 **하단 탭 5개**: 홈 · 지도 · 비교 · 추천 · 마이
- 버튼·칩·링크처럼 누르는 것은 **높이 44px 이상**
- 넓은 표(비교표)는 가로 스크롤 상자(`overflow-x: auto`)에 넣습니다.
- 색과 글꼴 (디자인 캔버스 목업과 같게):

  | 용도 | 값 |
  | --- | --- |
  | 배경 | `#FAF7F2` |
  | 카드 배경 | `#FFFFFF` |
  | 강조(버튼·선택됨) | `#6B3B1F` |
  | 강조 옅은 바탕 | `#F3E8DF` |
  | 본문 글자 | `#1E1A16` |
  | 보조 글자 | `#6B625A` |
  | 테두리 | `#E6DED4` |
  | 별점 | `#A85F00` |
  | 글꼴 | `'Noto Sans KR', 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif` |

- 아이콘은 이모지 대신 간단한 인라인 SVG를 씁니다.
- 화면 목업: `docs/ui/`에 화면별 HTML(더블클릭으로 열림)로 들어 있습니다. 원본은 Claude 디자인 캔버스 「교내 카페 추천 사이트 · 화면별 UI (모바일)」입니다.
  화면을 만들 때 해당 목업 파일을 AI에게 함께 주고, `docs/ui/README.md`의 '목업과 실제 구현의 차이'를 따릅니다.

## 8. 코드 스타일

- `var` 대신 `const`, `let`을 씁니다.
- 이름은 영어 camelCase (`searchMenus`, `avgRating`), 화면에 보이는 글자는 한국어.
- **if / for / while 본문을 한 줄로 쓰지 않습니다.** 본문이 한 줄이어도 중괄호와 줄바꿈을 씁니다.

  ```js
  // X
  if (!user) throw new Error('로그인이 필요합니다');
  // O
  if (!user) {
      throw new Error('로그인이 필요합니다');
  }
  ```

- **증감 연산자(`++`, `--`)를 다른 식 안에 섞지 않습니다.**

  ```js
  // X
  result[count++] = item;
  // O
  result[count] = item;
  count++;
  ```

- 함수마다 위에 한국어 주석으로 **역할 / 입력 / 출력 / 오류**를 적습니다. (보고서·발표에서 설명하기 위함)
- 들여쓰기는 공백 4칸.

## 9. 범위 (우선순위)

AI가 범위 밖 기능을 먼저 만들지 않도록 합니다.

| 우선순위 | 기능 |
| --- | --- |
| P0 (필수) | 카페·메뉴 검색(타입 필터, 정렬), 카페·메뉴 상세, 회원가입·로그인, 리뷰 작성(별점·한줄평·평가 버튼), 평가 집계, 같은 타입 비교표, 조건 추천, 사장 메뉴 추가·가격 변경·이름·타입 수정·삭제, 모바일 우선 화면 |
| P1 (4주차까지) | 지도(이미지 위 카페 핀 → 카페 상세), 카카오맵 지도 보기 링크, 즐겨찾기, 사장 카페 정보 수정, 내 리뷰 수정·삭제 |
| P2 (여유 있을 때만) | 메뉴·가격 수정 요청과 검수, 공지사항, 현위치 표시 |

## 10. AI에게 일을 시킬 때

1. 이 문서와 `interface.md`, `data.md`를 **매번** 함께 줍니다.
2. **한 번에 파일 하나(또는 함수 하나)**만 시키고, "다른 파일은 고치지 마"라고 적습니다.
3. 결과를 받으면 브라우저에서 열어 보고, 콘솔(F12)에서 테스트한 뒤 **잘 되면 바로 커밋**합니다. 망가지면 커밋으로 되돌립니다.
4. AI가 함수 이름·입출력을 바꾸자고 하면 받아들이지 말고, 팀에서 정해 문서부터 고칩니다.
5. 완성된 함수마다 "어떻게 동작하는지 설명해 줘"를 받아 두면 보고서 작성에 씁니다.

프롬프트 예시:

```
첨부한 docs/rules.md, docs/interface.md, docs/data.md를 따라
js/reviews.js의 Reviews.saveReview(menuId, rating, comment, tagIds)만 구현해 줘.
- 로그인 확인은 Auth.requireLogin()을 써.
- 데이터 읽기·쓰기는 DataStore만 써.
- 다른 파일은 고치지 마.
마지막에 브라우저 콘솔에서 확인할 테스트 코드 3줄도 같이 줘.
```

## 11. Git 규칙

- `main`에 직접 올리지 않습니다. 기능별 브랜치(`feat/reviews` 등) → PR → 다른 팀원 1명 확인 후 합칩니다.
- 커밋 메시지: `feat : …`(기능), `fix : …`(버그), `docs : …`(문서), `style : …`(화면 모양), `chore : …`(기타)
