# 모듈 인터페이스

> 기능 모듈이 밖에 내놓는 함수 목록입니다. **이름·입력·출력·오류는 이 문서와 똑같이** 만듭니다.
> 화면 담당은 이 문서만 보고 화면을 먼저 만들 수 있고(가짜 모듈 사용), 기능 담당은 함수 안쪽을 따로 만듭니다.
> 바꿔야 하면 문서를 먼저 고치고 팀에 알립니다. 데이터 모양은 `data.md`를 따릅니다.

## 0. 공통 약속

- 모든 함수는 **동기 함수**입니다. (`async`, `Promise` 없음)
- id는 모두 **숫자**입니다. 화면에서 URL의 `?id=3`을 읽으면 `Number()`로 바꿔서 넘깁니다.
- 가격은 원 단위 정수, 평점은 소수 첫째 자리까지 반올림한 숫자(`4.4`)입니다. 리뷰가 없으면 평점은 `null`입니다.
- 실패하면 `throw new Error('…')` (메시지는 7절). 화면에서 `try … catch`로 받습니다.
- 반환하는 객체·배열은 **새로 만든 복사본**입니다. 화면에서 고쳐도 저장된 데이터는 바뀌지 않습니다.

## 1. 자주 쓰는 반환 모양

**CafeItem** — 카페 목록 한 줄

```js
{ id: 1, name: '카페 A', area: 'campus', areaLabel: '교내',
  locationText: '[건물 1] 1층', openHours: '평일 08:30-19:00',
  photo: 'img/cafes/cafe-1.jpg', menuCount: 8, avgRating: 4.3, reviewCount: 31 }
```

- `avgRating`, `reviewCount`는 그 카페 모든 메뉴 리뷰를 합쳐 계산합니다.
- `photo`는 카페 사진 경로입니다. 사진이 없으면 `''`이고, 화면은 이때 자리 표시를 보여 줍니다(홈 카페 목록 카드, 카페 상세 위쪽).

**MenuItem** — 메뉴 목록 한 줄

```js
{ id: 3, cafeId: 1, cafeName: '카페 A', area: 'campus',
  typeId: 1, typeName: '커피', name: '카페라떼', price: 3000,
  options: '샷 추가 +500', avgRating: 4.4, reviewCount: 9,
  topTag: { tagId: 2, label: '고소해요', percent: 67 } }
```

- `topTag`는 가장 많이 눌린 평가 버튼입니다. 리뷰가 없으면 `null`.

**TagStat** — 평가 버튼 하나의 집계

```js
{ tagId: 2, label: '고소해요', count: 6, percent: 67 }
```

- `percent` = 그 버튼을 누른 리뷰 수 ÷ 전체 리뷰 수 × 100, 정수로 반올림.

## 2. Cafes — A. 카페·메뉴 조회 (`js/cafes.js`)

| 함수 | 입력 | 출력 | 권한 |
| --- | --- | --- | --- |
| `Cafes.searchCafes(keyword, area)` | `keyword`: 문자열(빈 문자열이면 전체), `area`: `'all'` \| `'campus'` \| `'nearby'` | `CafeItem[]`, 평점 높은 순(리뷰 없는 카페는 맨 뒤) | 없음 |
| `Cafes.getCafe(cafeId)` | 카페 id | `{ cafe: CafeItem, menusByType: [{ typeId, typeName, menus: MenuItem[] }] }` 메뉴 타입 순서대로 | 없음 |
| `Cafes.searchMenus(keyword, typeId, sort)` | `keyword`: 메뉴 이름에 포함된 글자(빈 문자열이면 전체), `typeId`: 숫자 또는 `null`(전체), `sort`: `'rating'` \| `'price'` \| `'reviews'` | `MenuItem[]` | 없음 |
| `Cafes.getMenusByType()` | 없음 | `[{ typeId, typeName, menus: MenuItem[] }]` 각 타입 안은 평점 높은 순 (홈 '메뉴 목록'용) | 없음 |
| `Cafes.getMenu(menuId)` | 메뉴 id | `MenuItem` | 없음 |
| `Cafes.getMenuTypes()` | 없음 | `[{ id, name, tags: [{ id, label, oppositeId }] }]` 각 타입의 평가 버튼(공통 버튼 포함). `oppositeId`는 뜻이 반대인 버튼 id 또는 `null` | 없음 |
| `Cafes.getMapPins()` (P1) | 없음 | `[{ cafeId, name, area, x, y }]` `x`, `y`는 지도 이미지 위 위치(%, 0~100). 지도 밖이면 목록에서 뺌 | 없음 |
| `Cafes.getMapLinks(cafeId)` (P1) | 카페 id | `{ view: 'https://map.kakao.com/link/map/카페이름,위도,경도', route: 'https://map.kakao.com/link/to/카페이름,위도,경도' }` | 없음 |

- 정렬 `'rating'`: 평점 높은 순, 같으면 리뷰 많은 순, 리뷰 없는 메뉴는 맨 뒤.
- 정렬 `'price'`: 가격 낮은 순. `'reviews'`: 리뷰 많은 순.
- `getMapPins` 변환식 (`MAP_BOUNDS`는 `data.md` 참고):
  - `x = (lng - topLeft.lng) / (bottomRight.lng - topLeft.lng) * 100`
  - `y = (topLeft.lat - lat) / (topLeft.lat - bottomRight.lat) * 100`
- 카카오맵 링크의 카페 이름은 `encodeURIComponent`로 감쌉니다. 좌표는 **위도, 경도** 순서입니다.

## 3. Reviews — B. 리뷰·평가 집계 (`js/reviews.js`)

| 함수 | 입력 | 출력 | 권한 |
| --- | --- | --- | --- |
| `Reviews.getReviewSummary(menuId)` | 메뉴 id | `{ menuId, avgRating, reviewCount, tagStats: TagStat[], reviews: [{ id, userId, nickname, rating, comment, tags: [{ id, label }], createdAt, isSample }] }` | 없음 |
| `Reviews.getMyReview(menuId)` | 메뉴 id | 로그인한 회원이 그 메뉴에 쓴 리뷰(위 `reviews[]` 한 개 모양) 또는 `null` | 로그인 안 했으면 `null` 반환 |
| `Reviews.saveReview(menuId, rating, comment, tagIds)` | `rating`: 1~5 정수, `comment`: 0~50자 문자열, `tagIds`: 그 메뉴 타입의 평가 버튼 id 배열(0개 이상, 서로 반대인 버튼은 함께 넣을 수 없음) | 저장된 리뷰 | 회원 |
| `Reviews.deleteReview(reviewId)` (P1) | 리뷰 id | 없음(`undefined`) | 회원, 본인 리뷰만 |
| `Reviews.getMyReviews()` (P1) | 없음 | `[{ review, menu: MenuItem }]` 최신순 (마이페이지용) | 회원 |

- `tagStats`는 그 메뉴 타입의 모든 평가 버튼을 `percent` 높은 순으로 담습니다(0%인 버튼도 포함).
- `reviews`는 최신순입니다. `isSample`은 시연용 예시 리뷰면 `true`이며, 화면은 이 값으로 '예시' 표시를 붙입니다. (`getMyReview`가 돌려주는 리뷰도 같은 모양)
- 같은 회원이 같은 메뉴에 다시 `saveReview`하면 **새로 만들지 않고 기존 리뷰를 고칩니다.** (회원 1명당 메뉴 1개에 리뷰 1개)
- 뜻이 반대인 버튼(`data.md`의 `oppositeId`, 예: 진해요 ↔ 연해요)을 함께 넣으면 오류입니다. 화면에서도 한쪽을 고르면 반대쪽을 꺼서 함께 고를 수 없게 합니다.

## 4. Compare — C. 비교·추천 (`js/compare.js`)

| 함수 | 입력 | 출력 | 권한 |
| --- | --- | --- | --- |
| `Compare.compareMenus(menuIds)` | 같은 타입 메뉴 id 2~4개 | `{ typeId, typeName, tags: [{ id, label }], rows: [{ menu: MenuItem, tagPercents: { [tagId]: percent } }], best: { price: menuId, rating: menuId, reviewCount: menuId, [tagId]: menuId } }` | 없음 |
| `Compare.recommend(condition)` | `{ typeId: 숫자(필수), budget: 숫자 또는 null, tagIds: 숫자 배열(0~3개, 서로 반대인 버튼은 함께 넣을 수 없음), area: 'all' \| 'campus' \| 'nearby' }` | `[{ rank: 1, menu: MenuItem, score: 0.83, reason: '예산 4,000원 이하 · 평점 4.6 (리뷰 12개) · \'고소해요\' 75%' }]` 최대 3개, 점수 높은 순 | 없음 |

- `best`는 항목별 1위 메뉴 id입니다(가격은 낮을수록, 나머지는 높을수록 1위). 1위가 여럿이면 앞의 메뉴.
- 평점이 모두 `null`이거나, **모든 메뉴의 값이 같으면(모두 0 포함)** 그 항목은 `best`에 넣지 않습니다. 강조할 1위가 없기 때문입니다.
- 비교함(메뉴를 최대 4개 담아 두는 곳)은 6절의 `Compare.getBox` / `addToBox` / `removeFromBox`로 관리합니다.

### 추천 점수 계산

1. 메뉴 타입이 `typeId`와 같고, `budget`이 있으면 가격이 `budget` 이하이고, `area`가 `'all'`이 아니면 카페 위치가 같은 메뉴만 남깁니다.
2. 남은 메뉴마다 점수를 계산합니다.
   - 보정 평점 = (5 × m + 평점 합) ÷ (5 + n)
     - n: 그 메뉴의 리뷰 수, m: 같은 타입 모든 리뷰의 평균 평점(리뷰가 하나도 없으면 3)
   - 선호 일치율 = 고른 평가 버튼들의 `percent` 평균 ÷ 100 (버튼을 안 골랐으면 0)
   - **점수 = 0.6 × (보정 평점 ÷ 5) + 0.4 × 선호 일치율** (버튼을 안 골랐으면 점수 = 보정 평점 ÷ 5)
3. 점수 높은 순으로 3개를 고르고, 소수 둘째 자리까지 반올림합니다.
4. `reason`은 계산에 쓴 값을 그대로 이어 붙입니다: 예산 조건(있을 때) · 평점과 리뷰 수 · 고른 버튼 중 비율이 가장 높은 것.
   - 고른 버튼 중 가장 높은 비율이 0%이면 버튼 부분은 넣지 않습니다.
   - 리뷰가 없는 메뉴는 평점 부분을 `아직 리뷰 없음`으로 씁니다. 예: `예산 4,000원 이하 · 아직 리뷰 없음`
- 가중치 0.6 / 0.4와 보정 상수 5는 초깃값이며, 테스트 후 바꾸면 이 문서를 먼저 고칩니다.

## 5. Account — D. 계정·즐겨찾기·운영 (`js/account.js`)

| 함수 | 입력 | 출력 | 권한 |
| --- | --- | --- | --- |
| `Account.signup(loginId, password, nickname)` | `loginId`: 영문·숫자 4~12자, `password`: 4자 이상, `nickname`: 1~10자 | 새 회원 `{ id, loginId, nickname, role: 'member' }` (가입 후 자동 로그인) | 없음 |
| `Account.login(loginId, password)` | | `{ id, loginId, nickname, role }` | 없음 |
| `Account.logout()` | 없음 | 없음 | 없음 |
| `Account.toggleFavorite(targetType, targetId)` (P1) | `targetType`: `'cafe'` \| `'menu'` | `true`(추가됨) 또는 `false`(해제됨) | 회원 |
| `Account.isFavorite(targetType, targetId)` (P1) | | `true` / `false` (로그인 안 했으면 `false`) | 없음 |
| `Account.getFavorites()` (P1) | 없음 | `{ cafes: CafeItem[], menus: MenuItem[] }` | 회원 |
| `Account.getMyCafe()` | 없음 | 로그인한 사장의 카페 `CafeItem` | 사장 |
| `Account.updateCafe(cafeId, info)` (P1) | `info`: `{ name, locationText, openHours }`. `name`은 앞뒤 공백을 지운 뒤 1자 이상(비면 오류), `locationText`·`openHours`는 비어도 됨 | 수정된 `CafeItem` | 사장, 본인 카페만 |
| `Account.addMenu(cafeId, menu)` | `menu`: `{ name, typeId, price, options }` | 새 `MenuItem` | 사장, 본인 카페만 |
| `Account.updatePrice(menuId, price)` | `price`: 0보다 큰 정수 | 수정된 `MenuItem` | 사장, 본인 카페 메뉴만 |

- 비밀번호는 암호화 없이 저장합니다(과제용). 화면에 "실제 비밀번호를 쓰지 마세요" 안내를 둡니다.
- 사장 계정은 회원가입으로 만들지 않고 `data.js`에 미리 넣어 둡니다.

## 6. Auth, DataStore — 공통 (`js/auth.js`, `js/storage.js`)

| 함수 | 입력 | 출력 | 누가 부르나 |
| --- | --- | --- | --- |
| `Auth.getCurrentUser()` | 없음 | `{ id, loginId, nickname, role }` 또는 `null` | 화면, 기능 모듈 |
| `Auth.requireLogin()` | 없음 | 현재 회원 (없으면 오류) | 기능 모듈 |
| `Auth.requireOwnerOf(cafeId)` | 카페 id | 현재 회원 (사장이 아니거나 남의 카페면 오류) | 기능 모듈 |
| `DataStore.init()` | 없음 | 없음. 처음 실행이면 `SEED_DATA`를 localStorage에 복사. 고정 데이터(`menuTypes`, `evalTags`)는 매번 `SEED_DATA`로 다시 맞춤 | `storage.js`가 불러올 때 스스로 실행 |
| `DataStore.load(key)` | `data.md`의 키 이름 | 배열(복사본) | 기능 모듈, Auth |
| `DataStore.save(key, list)` | 키, 배열 | 없음 | 기능 모듈, Auth |
| `DataStore.nextId(key)` | 키 | 그 목록의 가장 큰 id + 1 | 기능 모듈 |
| `DataStore.loadSession()` / `saveSession(userId)` / `clearSession()` | | 로그인 상태 읽기·쓰기 | Auth, Account |
| `DataStore.reset()` | 없음 | 없음. 모든 데이터를 처음 상태로 되돌림(시연 전 초기화용) | 개발자(콘솔) |

**비교함**: 비교함은 로그인과 상관없이 쓰므로 `Compare`에 화면용 도우미를 둡니다.

| 함수 | 입력 | 출력 |
| --- | --- | --- |
| `Compare.getBox()` | 없음 | 담긴 메뉴 id 배열 |
| `Compare.addToBox(menuId)` | 메뉴 id | 담긴 id 배열 (4개 넘거나 타입이 다르면 오류) |
| `Compare.removeFromBox(menuId)` | 메뉴 id | 담긴 id 배열 |

- 비교함은 `DataStore`의 `compareBox` 키에 저장합니다(`data.md` 참고).

## 7. 오류 메시지

| 상황 | 메시지 |
| --- | --- |
| 로그인 안 함 | `로그인이 필요합니다` |
| 사장이 아님 / 남의 카페 | `이 카페를 관리할 권한이 없습니다` |
| 남의 리뷰 삭제 | `내가 쓴 리뷰만 삭제할 수 있습니다` |
| 없는 id | `카페를 찾을 수 없습니다` / `메뉴를 찾을 수 없습니다` / `리뷰를 찾을 수 없습니다` |
| 별점 범위 밖 | `별점은 1~5 사이로 골라 주세요` |
| 한줄평 50자 초과 | `한줄평은 50자 이내로 써 주세요` |
| 메뉴 타입에 없는 평가 버튼 | `이 메뉴에서 고를 수 없는 평가 버튼입니다` |
| 비교 개수 | `2~4개 메뉴를 골라 주세요` |
| 비교 타입 다름 | `같은 종류의 메뉴끼리만 비교할 수 있어요` |
| 추천 타입 없음 | `메뉴 타입을 골라 주세요` |
| 추천 버튼 4개 이상 | `원하는 맛은 3개까지 고를 수 있어요` |
| 반대 평가 버튼을 함께 고름 (리뷰·추천) | `서로 반대되는 평가 버튼은 함께 고를 수 없어요` |
| 아이디 형식 | `아이디는 영문·숫자 4~12자로 정해 주세요` |
| 비밀번호 짧음 | `비밀번호는 4자 이상이어야 합니다` |
| 닉네임 길이 | `닉네임은 1~10자로 정해 주세요` |
| 아이디 중복 | `이미 사용 중인 아이디입니다` |
| 로그인 실패 | `아이디 또는 비밀번호가 맞지 않습니다` |
| 가격 형식 | `가격은 0보다 큰 숫자로 써 주세요` |
| 메뉴 이름 없음 | `메뉴 이름을 입력해 주세요` |
| 카페 이름 없음 | `카페 이름을 입력해 주세요` |

## 8. 화면 ↔ 함수 연결표

화면 스크립트(`js/ui/*.js`)가 부르는 기능 함수 전체입니다. (`js/ui/common.js`의 화면 도우미 함수는 뺐습니다. `rules.md` 3절 참고)
`Auth.getCurrentUser`는 로그인했는지 확인할 때 쓰고, 로그인 안 했으면 `login.html?next=…`로 보냅니다.

| 화면 | 부르는 함수 |
| --- | --- |
| 홈 `index.html` | `Cafes.searchCafes`, `Cafes.getMenusByType` |
| 검색 결과 `search.html` | `Cafes.searchMenus`, `Cafes.searchCafes`, `Cafes.getMenuTypes`, `Compare.getBox`, `Compare.addToBox`, `Compare.removeFromBox` |
| 카페 상세 `cafe.html` | `Cafes.getCafe`, `Cafes.getMapLinks`, `Account.isFavorite`, `Account.toggleFavorite`, `Auth.getCurrentUser` |
| 메뉴 상세 `menu.html` | `Cafes.getMenu`, `Reviews.getReviewSummary`, `Compare.addToBox`, `Account.isFavorite`, `Account.toggleFavorite`, `Auth.getCurrentUser` |
| 리뷰 쓰기 `review.html` | `Cafes.getMenu`, `Cafes.getMenuTypes`, `Reviews.getMyReview`, `Reviews.saveReview`, `Auth.getCurrentUser` |
| 비교 `compare.html` | `Compare.getBox`, `Compare.compareMenus`, `Compare.removeFromBox`, `Cafes.getMenu` |
| 추천 `recommend.html` | `Cafes.getMenuTypes`, `Compare.recommend` |
| 지도 `map.html` | `Cafes.getMapPins` |
| 로그인 `login.html` | `Account.login`, `Account.signup` |
| 마이 `mypage.html` | `Auth.getCurrentUser`, `Account.getFavorites`, `Account.getMyCafe`, `Reviews.getMyReviews`, `Reviews.deleteReview`, `Account.logout` |
| 사장 관리 `owner.html` | `Auth.getCurrentUser`, `Account.getMyCafe`, `Cafes.getCafe`, `Cafes.getMenuTypes`, `Account.updateCafe`, `Account.addMenu`, `Account.updatePrice` |
