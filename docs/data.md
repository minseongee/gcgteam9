# 데이터 구조

> 서버 DB 대신 브라우저 저장소(localStorage)에 **JS 객체 배열**로 저장합니다.
> 그래도 구조는 DB 테이블처럼 설계합니다. 항목마다 숫자 `id`를 두고, 다른 항목은 `id`로 참조합니다(보고서에서는 ER 다이어그램으로 설명).
> 데이터를 읽고 쓰는 곳은 `DataStore`(`js/storage.js`) 하나뿐입니다.

## 1. 저장 방식

- 처음 실행할 때 `DataStore.init()`이 `js/data.js`의 `SEED_DATA`를 localStorage로 복사합니다. 그 뒤로는 localStorage만 읽고 씁니다.
- localStorage 키는 모두 `cafe9.` 으로 시작합니다. 값은 `JSON.stringify`한 배열입니다.
- `cafe9.initialized`가 있으면 다시 복사하지 않습니다. `DataStore.reset()`은 `cafe9.`으로 시작하는 키를 모두 지우고 다시 복사합니다(시연 전 초기화).
- 단, **고정 데이터**인 `menuTypes`와 `evalTags`는 `data.js`에서만 정하고 어떤 기능도 고치지 않으므로, 페이지를 열 때마다 `DataStore.init()`이 `data.js` 값으로 다시 덮어씁니다. 이 둘은 `data.js`를 고치면 바로 반영됩니다.
- 그 밖의 데이터(카페·메뉴·리뷰 등)는 `data.js`를 고친 뒤 콘솔에서 `DataStore.reset()`을 실행해야 바뀐 내용이 보입니다.

| 키 (`DataStore.load` 에 넘기는 이름) | localStorage 키 | 처음 들어가는 곳 | 내용 |
| --- | --- | --- | --- |
| `users` | `cafe9.users` | data.js(사장 계정) + 회원가입 | 회원 |
| `cafes` | `cafe9.cafes` | data.js + 사장 수정 | 카페 |
| `menuTypes` | `cafe9.menuTypes` | data.js | 메뉴 타입 |
| `evalTags` | `cafe9.evalTags` | data.js | 평가 버튼 |
| `menus` | `cafe9.menus` | data.js + 사장 추가 | 메뉴 |
| `reviews` | `cafe9.reviews` | data.js(예시 리뷰) + 회원 작성 | 리뷰 |
| `favorites` | `cafe9.favorites` | 회원 등록 | 즐겨찾기 |
| `compareBox` | `cafe9.compareBox` | 화면에서 담기 | 비교함에 담긴 메뉴 id |
| (세션) | `cafe9.session` | 로그인 | `{ "userId": 3 }` 또는 없음 |

## 2. 항목별 구조

### users — 회원

| 필드 | 형식 | 설명 |
| --- | --- | --- |
| `id` | 숫자 | |
| `loginId` | 문자열 | 영문·숫자 4~12자, 중복 불가 |
| `password` | 문자열 | 4자 이상. **암호화 없음(과제용)** |
| `nickname` | 문자열 | 1~10자 |
| `role` | `'member'` \| `'owner'` | 일반 회원 / 카페 사장 |

### cafes — 카페

| 필드 | 형식 | 설명 |
| --- | --- | --- |
| `id` | 숫자 | |
| `ownerId` | 숫자 또는 `null` | 사장 회원 id (`users.id`) |
| `name` | 문자열 | |
| `area` | `'campus'` \| `'nearby'` | 교내 / 학교 근처 |
| `locationText` | 문자열 | 예: `'[건물 1] 1층'` |
| `lat`, `lng` | 숫자 | 실제 위도·경도. 지도 핀 위치와 카카오맵 링크를 둘 다 이 값으로 만듭니다 |
| `openHours` | 문자열 | 예: `'평일 08:30-19:00'` |

### menuTypes — 메뉴 타입

| 필드 | 형식 |
| --- | --- |
| `id` | 숫자 |
| `name` | 문자열 |

### evalTags — 평가 버튼

| 필드 | 형식 | 설명 |
| --- | --- | --- |
| `id` | 숫자 | |
| `typeId` | 숫자 또는 `null` | 어느 메뉴 타입의 버튼인지. `null`이면 **모든 타입 공통** 버튼 |
| `label` | 문자열 | 예: `'산미가 강해요'` |
| `oppositeId` | 숫자 또는 `null` | 뜻이 반대인 버튼의 `id` (예: 진해요 ↔ 연해요). 두 버튼이 **서로를** 가리킵니다. 반대 버튼이 없으면 `null` |

- 반대인 두 버튼은 리뷰 하나(`reviews.tagIds`)나 추천 조건 하나에 **함께 들어갈 수 없습니다.**

### menus — 메뉴

| 필드 | 형식 | 설명 |
| --- | --- | --- |
| `id` | 숫자 | |
| `cafeId` | 숫자 | `cafes.id` |
| `typeId` | 숫자 | `menuTypes.id` |
| `name` | 문자열 | |
| `price` | 숫자 | 원 단위 정수 |
| `options` | 문자열 | 예: `'샷 추가 +500'`, 없으면 `''` |

### reviews — 리뷰

| 필드 | 형식 | 설명 |
| --- | --- | --- |
| `id` | 숫자 | |
| `userId` | 숫자 | `users.id` |
| `menuId` | 숫자 | `menus.id` |
| `rating` | 숫자 | 1~5 정수 |
| `comment` | 문자열 | 0~50자 |
| `tagIds` | 숫자 배열 | 누른 평가 버튼 `evalTags.id` |
| `createdAt` | 문자열 | ISO 날짜 시간, 예: `'2026-11-20T13:05:00'` |
| `isSample` | 참/거짓 | 시연용 예시 리뷰면 `true` (화면에 '예시' 표시) |

- 회원 1명은 메뉴 1개에 리뷰 1개만 가집니다(`userId` + `menuId` 중복 불가).

### favorites — 즐겨찾기 (P1)

| 필드 | 형식 | 설명 |
| --- | --- | --- |
| `userId` | 숫자 | |
| `targetType` | `'cafe'` \| `'menu'` | |
| `targetId` | 숫자 | 카페 id 또는 메뉴 id |

### compareBox — 비교함

- 메뉴 id 배열, 최대 4개, 모두 같은 메뉴 타입. 예: `[3, 7, 12]`

## 3. 관계 (ER 요약)

```
users 1 ─── N reviews N ─── 1 menus N ─── 1 cafes
users 1 ─── N favorites                 menus N ─── 1 menuTypes 1 ─── N evalTags
users 1 ─── 0..1 cafes (사장 = ownerId)  reviews.tagIds ─── evalTags.id (여러 개)
                                         evalTags.oppositeId ─── evalTags.id (반대 버튼, 0..1)
```

## 4. 메뉴 타입과 평가 버튼 (초안 — 조사 후 확정)

Notion '기능별 상세'에 따라 아메리카노·카페라떼처럼 에스프레소가 들어간 메뉴는 모두 **커피** 타입입니다.

| 타입 id | 메뉴 타입 | 평가 버튼 (id: 이름) |
| --- | --- | --- |
| 1 | 커피 (아메리카노, 카페라떼 등) | 1: 산미가 강해요 · 2: 고소해요 · 3: 진해요 · 4: 연해요 · 5: 쓴맛이 강해요 |
| 2 | 논커피 라떼 (초코·녹차 라떼 등) | 6: 달아요 · 7: 덜 달아요 · 8: 우유 맛이 진해요 |
| 3 | 차 | 9: 향이 좋아요 · 10: 진해요 · 11: 연해요 |
| 4 | 에이드·스무디 | 12: 달아요 · 13: 새콤해요 · 14: 탄산이 강해요 |
| 5 | 디저트 | 15: 달아요 · 16: 촉촉해요 |
| 공통 (`typeId: null`) | 모든 타입 | 17: 양이 많아요 · 18: 가성비 좋아요 |

- 리뷰 쓰기 화면에는 **그 메뉴 타입의 버튼 + 공통 버튼**이 나옵니다.
- 반대 버튼 짝(`oppositeId`): **3 ↔ 4**(진해요·연해요), **6 ↔ 7**(달아요·덜 달아요), **10 ↔ 11**(진해요·연해요). 나머지 버튼은 `null`.

## 5. 지도 기준점 `MAP_BOUNDS`

캠퍼스 지도 이미지(`img/campus-map.png`)의 왼쪽 위·오른쪽 아래 모서리의 실제 위도·경도입니다. 이미지는 **실제 축척, 북쪽이 위**인 것을 씁니다(예: 카카오맵 캡처).

```js
const MAP_BOUNDS = {
    topLeft: { lat: 0, lng: 0 },       // TODO: 지도 이미지를 정한 뒤 채움
    bottomRight: { lat: 0, lng: 0 }    // TODO
};
```

- 위도·경도는 구글 지도에서 그 지점을 오른쪽 클릭하면 나오는 숫자를 복사합니다.

## 6. `js/data.js` 모양

```js
const SEED_DATA = {
    users: [
        { id: 1, loginId: 'ownera', password: '1234', nickname: '카페A사장', role: 'owner' },
        { id: 2, loginId: 'sample1', password: '1234', nickname: '예시회원1', role: 'member' }
    ],
    cafes: [
        { id: 1, ownerId: 1, name: '카페 A', area: 'campus', locationText: '[건물 1] 1층',
          lat: 0, lng: 0, openHours: '평일 08:30-19:00' }
    ],
    menuTypes: [
        { id: 1, name: '커피' }
        // … 4절 표대로
    ],
    evalTags: [
        { id: 1, typeId: 1, label: '산미가 강해요', oppositeId: null },
        { id: 3, typeId: 1, label: '진해요', oppositeId: 4 },
        { id: 4, typeId: 1, label: '연해요', oppositeId: 3 }
        // … 4절 표대로
    ],
    menus: [
        { id: 1, cafeId: 1, typeId: 1, name: '아이스 아메리카노', price: 2500, options: '샷 추가 +500' }
    ],
    reviews: [
        { id: 1, userId: 2, menuId: 1, rating: 5, comment: '고소하고 진해요', tagIds: [2, 3],
          createdAt: '2026-11-20T13:05:00', isSample: true }
    ],
    favorites: [],
    compareBox: []
};
```

- 위 값은 모양을 보여 주는 예시입니다. 실제 카페·메뉴·가격은 왕몽소 조사 결과로 채웁니다.

## 7. 조사 시트 양식 (왕몽소 → 박찬민)

엑셀이나 구글 시트에 아래 열 순서로 모으면 `data.js`로 옮기기 쉽습니다.

```csv
cafe_name,area,location_text,lat,lng,open_hours,menu_name,menu_type,price,options
(예시)중앙도서관 카페,교내,중앙도서관 1층,,,08:30-19:00,아이스 아메리카노,커피,2500,샷 추가 +500
```

- `area`는 `교내` 또는 `근처`, `menu_type`은 4절의 메뉴 타입 이름 그대로 씁니다.
