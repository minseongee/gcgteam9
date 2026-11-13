# 화면 목업 (docs/ui)

디자인 캔버스 「교내 카페 추천 사이트 · 화면별 UI (모바일)」의 화면 11개를 **그대로 열어 볼 수 있는 HTML**로 옮긴 것입니다.
파일을 더블클릭하면 휴대폰 크기(390 × 844) 화면이 열리고, 버튼·탭을 눌러 화면 사이를 이동해 볼 수 있습니다.

## 목업 ↔ 실제 파일

| 목업 | 화면 | 실제로 만들 파일 | 프롬프트 (`docs/prompts.md`) |
| --- | --- | --- | --- |
| `01-home.html` | 홈 (카페 목록 / 메뉴 목록 전환) | `index.html`, `js/ui/home.js` | 3-2 |
| `02-search.html` | 검색 결과 | `search.html`, `js/ui/search.js` | 3-3 |
| `03-cafe.html` | 카페 상세 | `cafe.html`, `js/ui/cafe.js` | 3-4 |
| `04-menu.html` | 메뉴 상세 | `menu.html`, `js/ui/menu.js` | 3-5 |
| `05-review.html` | 리뷰 쓰기 | `review.html`, `js/ui/review.js` | 3-6 |
| `06-compare.html` | 비교 | `compare.html`, `js/ui/compare.js` | 3-11 |
| `07-recommend.html` | 추천 | `recommend.html`, `js/ui/recommend.js` | 3-12 |
| `08-map.html` | 지도 | `map.html`, `js/ui/map.js` | 3-10 |
| `09-login.html` | 로그인·회원가입 | `login.html`, `js/ui/login.js` | 3-7 |
| `10-mypage.html` | 마이페이지 (사장 계정 상태) | `mypage.html`, `js/ui/mypage.js` | 3-8 |
| `11-owner.html` | 사장 관리 | `owner.html`, `js/ui/owner.js` | 3-9 |

## 목업과 실제 구현의 차이 (AI에게도 꼭 알려 줄 것)

목업은 **모양 견본**입니다. 그대로 복사하지 말고 아래처럼 바꿔서 만듭니다.

| 목업 | 실제 구현 |
| --- | --- |
| 모든 모양이 요소마다 `style="…"`(인라인 스타일)로 적혀 있음 | 반복되는 모양은 `css/style.css`의 클래스(`.card`, `.chip` 등)로 옮긴다 |
| 카페·메뉴·가격·리뷰가 HTML에 직접 적힌 **예시 값** | 기능 모듈 함수(`docs/interface.md`)를 불러 받은 값으로 `js/ui/*.js`가 채운다 |
| 화면이 390 × 844 고정 크기 | 휴대폰 폭에 맞게 늘어나고, PC에서는 `max-width: 480px` 가운데 정렬 (`docs/rules.md` 7절) |
| 링크가 `03-cafe.html`처럼 목업 파일끼리 연결 | `cafe.html?id=1`처럼 실제 파일 + id |
| 홈의 탭 전환 스크립트, 리뷰 쓰기의 별·버튼 선택 상태는 흉내만 냄 | `js/ui/home.js`, `js/ui/review.js`에서 실제로 동작하게 만든다 |
| 지도는 회색 격자 + `[건물]` 상자로 된 자리 표시 | `img/campus-map.png` 이미지 + `Cafes.getMapPins()` 결과로 핀 배치 |
| `[건물명]`, `[00:00–00:00]` 같은 대괄호 | 조사 결과로 채운다 |

## 고칠 때

- 화면 모양을 바꾸기로 했다면, **디자인 캔버스를 먼저 고치고** 이 폴더의 목업도 같이 바꿔 둡니다. 설계(목업)와 구현이 어긋나지 않게 하기 위함입니다.
- 목업 원본(디자인 캔버스): https://claude.ai/artifact/8bEX9h4qZmsvjBA5F8mNc1
