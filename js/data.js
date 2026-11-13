// 초기 데이터: SEED_DATA, MAP_BOUNDS (localStorage에 처음 복사할 카페·메뉴·리뷰 등)
// 실제 카페·메뉴·가격은 조사 결과로 바꿀 예정인 예시 데이터입니다.
// data.js를 고친 뒤에는 콘솔에서 DataStore.reset()을 실행해야 바뀐 내용이 보입니다.

const SEED_DATA = {
    users: [
        { id: 1, loginId: 'ownera', password: '1234', nickname: '카페A사장', role: 'owner' },
        { id: 2, loginId: 'ownerb', password: '1234', nickname: '카페B사장', role: 'owner' },
        { id: 3, loginId: 'ownerc', password: '1234', nickname: '카페C사장', role: 'owner' },
        { id: 4, loginId: 'sample1', password: '1234', nickname: '예시회원1', role: 'member' },
        { id: 5, loginId: 'sample2', password: '1234', nickname: '예시회원2', role: 'member' },
        { id: 6, loginId: 'sample3', password: '1234', nickname: '예시회원3', role: 'member' }
    ],
    cafes: [
        { id: 1, ownerId: 1, name: '카페 A', area: 'campus', locationText: '[건물 1] 1층',
          lat: 0, lng: 0, openHours: '평일 08:30-19:00' },    // TODO: 실제 위도·경도
        { id: 2, ownerId: 2, name: '카페 B', area: 'campus', locationText: '[건물 2] 지하 1층',
          lat: 0, lng: 0, openHours: '평일 09:00-18:00' },    // TODO: 실제 위도·경도
        { id: 3, ownerId: 3, name: '카페 C', area: 'campus', locationText: '[건물 3] 2층',
          lat: 0, lng: 0, openHours: '평일 08:00-17:00' },    // TODO: 실제 위도·경도
        { id: 4, ownerId: null, name: '카페 D', area: 'nearby', locationText: '정문 앞',
          lat: 0, lng: 0, openHours: '매일 10:00-22:00' },    // TODO: 실제 위도·경도
        { id: 5, ownerId: null, name: '카페 E', area: 'nearby', locationText: '북문 근처',
          lat: 0, lng: 0, openHours: '매일 11:00-23:00' }     // TODO: 실제 위도·경도
    ],
    menuTypes: [
        { id: 1, name: '커피' },
        { id: 2, name: '논커피 라떼' },
        { id: 3, name: '차' },
        { id: 4, name: '에이드·스무디' },
        { id: 5, name: '디저트' }
    ],
    evalTags: [
        { id: 1, typeId: 1, label: '산미가 강해요' },
        { id: 2, typeId: 1, label: '고소해요' },
        { id: 3, typeId: 1, label: '진해요' },
        { id: 4, typeId: 1, label: '연해요' },
        { id: 5, typeId: 1, label: '쓴맛이 강해요' },
        { id: 6, typeId: 2, label: '달아요' },
        { id: 7, typeId: 2, label: '덜 달아요' },
        { id: 8, typeId: 2, label: '우유 맛이 진해요' },
        { id: 9, typeId: 3, label: '향이 좋아요' },
        { id: 10, typeId: 3, label: '진해요' },
        { id: 11, typeId: 3, label: '연해요' },
        { id: 12, typeId: 4, label: '달아요' },
        { id: 13, typeId: 4, label: '새콤해요' },
        { id: 14, typeId: 4, label: '탄산이 강해요' },
        { id: 15, typeId: 5, label: '달아요' },
        { id: 16, typeId: 5, label: '촉촉해요' },
        { id: 17, typeId: null, label: '양이 많아요' },
        { id: 18, typeId: null, label: '가성비 좋아요' }
    ],
    menus: [
        // 카페 A (교내)
        { id: 1, cafeId: 1, typeId: 1, name: '아메리카노', price: 2000, options: '샷 추가 +500' },
        { id: 2, cafeId: 1, typeId: 1, name: '카페라떼', price: 2500, options: '샷 추가 +500' },
        { id: 3, cafeId: 1, typeId: 2, name: '초코라떼', price: 3000, options: '' },
        { id: 4, cafeId: 1, typeId: 4, name: '레몬에이드', price: 3500, options: '' },
        { id: 5, cafeId: 1, typeId: 5, name: '치즈케이크', price: 4500, options: '' },
        // 카페 B (교내)
        { id: 6, cafeId: 2, typeId: 1, name: '아메리카노', price: 2300, options: '샷 추가 +500' },
        { id: 7, cafeId: 2, typeId: 1, name: '바닐라라떼', price: 3200, options: '샷 추가 +500' },
        { id: 8, cafeId: 2, typeId: 2, name: '녹차라떼', price: 3300, options: '' },
        { id: 9, cafeId: 2, typeId: 3, name: '캐모마일', price: 2800, options: '' },
        { id: 10, cafeId: 2, typeId: 4, name: '딸기스무디', price: 4000, options: '' },
        { id: 11, cafeId: 2, typeId: 5, name: '마카롱', price: 2200, options: '' },
        // 카페 C (교내)
        { id: 12, cafeId: 3, typeId: 1, name: '아메리카노', price: 2000, options: '샷 추가 +300' },
        { id: 13, cafeId: 3, typeId: 1, name: '카푸치노', price: 2800, options: '샷 추가 +300' },
        { id: 14, cafeId: 3, typeId: 3, name: '얼그레이', price: 2500, options: '' },
        { id: 15, cafeId: 3, typeId: 4, name: '자몽에이드', price: 3500, options: '' },
        // 카페 D (근처)
        { id: 16, cafeId: 4, typeId: 1, name: '아메리카노', price: 3000, options: '샷 추가 +500' },
        { id: 17, cafeId: 4, typeId: 1, name: '카페모카', price: 3800, options: '휘핑 추가 +500' },
        { id: 18, cafeId: 4, typeId: 2, name: '고구마라떼', price: 3800, options: '' },
        { id: 19, cafeId: 4, typeId: 3, name: '유자차', price: 3500, options: '' },
        { id: 20, cafeId: 4, typeId: 4, name: '블루베리스무디', price: 4500, options: '' },
        { id: 21, cafeId: 4, typeId: 5, name: '티라미수', price: 5000, options: '' },
        // 카페 E (근처)
        { id: 22, cafeId: 5, typeId: 1, name: '콜드브루', price: 4000, options: '' },
        { id: 23, cafeId: 5, typeId: 2, name: '초코라떼', price: 4200, options: '' },
        { id: 24, cafeId: 5, typeId: 3, name: '페퍼민트', price: 3800, options: '' },
        { id: 25, cafeId: 5, typeId: 5, name: '크로플', price: 4800, options: '아이스크림 추가 +1000' }
    ],
    reviews: [
        { id: 1, userId: 4, menuId: 1, rating: 4, comment: '고소하고 가격이 착해요', tagIds: [2, 18],
          createdAt: '2026-11-02T09:10:00', isSample: true },
        { id: 2, userId: 5, menuId: 1, rating: 5, comment: '매일 마셔요', tagIds: [2, 18],
          createdAt: '2026-11-03T10:20:00', isSample: true },
        { id: 3, userId: 6, menuId: 1, rating: 3, comment: '조금 연해요', tagIds: [4],
          createdAt: '2026-11-04T12:30:00', isSample: true },
        { id: 4, userId: 4, menuId: 2, rating: 5, comment: '우유랑 잘 어울려요', tagIds: [2],
          createdAt: '2026-11-04T13:05:00', isSample: true },
        { id: 5, userId: 5, menuId: 2, rating: 4, comment: '', tagIds: [2, 17],
          createdAt: '2026-11-05T08:50:00', isSample: true },
        { id: 6, userId: 4, menuId: 6, rating: 3, comment: '산미가 있어요', tagIds: [1],
          createdAt: '2026-11-05T15:40:00', isSample: true },
        { id: 7, userId: 6, menuId: 6, rating: 4, comment: '깔끔해요', tagIds: [1, 3],
          createdAt: '2026-11-06T11:15:00', isSample: true },
        { id: 8, userId: 5, menuId: 12, rating: 4, comment: '진하고 싸요', tagIds: [3, 18],
          createdAt: '2026-11-06T16:00:00', isSample: true },
        { id: 9, userId: 4, menuId: 16, rating: 5, comment: '향이 진해요', tagIds: [3, 5],
          createdAt: '2026-11-07T19:30:00', isSample: true },
        { id: 10, userId: 6, menuId: 16, rating: 4, comment: '양이 넉넉해요', tagIds: [3, 17],
          createdAt: '2026-11-07T20:10:00', isSample: true },
        { id: 11, userId: 5, menuId: 22, rating: 5, comment: '부드럽고 진해요', tagIds: [2, 3],
          createdAt: '2026-11-08T14:00:00', isSample: true },
        { id: 12, userId: 4, menuId: 3, rating: 4, comment: '꽤 달아요', tagIds: [6],
          createdAt: '2026-11-08T15:25:00', isSample: true },
        { id: 13, userId: 6, menuId: 8, rating: 5, comment: '녹차 맛이 진해요', tagIds: [7, 8],
          createdAt: '2026-11-09T10:45:00', isSample: true },
        { id: 14, userId: 5, menuId: 18, rating: 4, comment: '', tagIds: [6, 8],
          createdAt: '2026-11-09T17:35:00', isSample: true },
        { id: 15, userId: 4, menuId: 9, rating: 4, comment: '향이 좋아요', tagIds: [9],
          createdAt: '2026-11-10T09:30:00', isSample: true },
        { id: 16, userId: 6, menuId: 14, rating: 3, comment: '조금 연해요', tagIds: [11],
          createdAt: '2026-11-10T13:50:00', isSample: true },
        { id: 17, userId: 5, menuId: 4, rating: 4, comment: '상큼해요', tagIds: [13, 14],
          createdAt: '2026-11-11T12:15:00', isSample: true },
        { id: 18, userId: 6, menuId: 10, rating: 5, comment: '딸기가 많아요', tagIds: [12, 17],
          createdAt: '2026-11-11T16:40:00', isSample: true },
        { id: 19, userId: 4, menuId: 5, rating: 5, comment: '꾸덕하고 맛있어요', tagIds: [15, 16],
          createdAt: '2026-11-12T14:20:00', isSample: true },
        { id: 20, userId: 5, menuId: 21, rating: 4, comment: '비싸지만 맛있어요', tagIds: [15],
          createdAt: '2026-11-12T18:05:00', isSample: true }
    ],
    favorites: [],
    compareBox: []
};

const MAP_BOUNDS = {
    topLeft: { lat: 0, lng: 0 },       // TODO: 지도 이미지를 정한 뒤 채움
    bottomRight: { lat: 0, lng: 0 }    // TODO
};
