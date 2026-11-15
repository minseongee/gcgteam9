// 지도 화면: 캠퍼스 지도 이미지 위에 카페 핀, 전체·교내·근처 칩, 핀을 누르면 카페 상세
// 부르는 기능 함수: Cafes.getMapPins

(function () {
    const app = document.getElementById('app');
    const MAP_IMAGE = 'img/campus-map.png';
    let currentArea = 'all';

    // 역할: 핀 모양 SVG를 만든다 (교내는 꽉 찬 색, 근처는 테두리만). 고정 문자열이라 사용자 글자가 섞이지 않음
    // 입력: area - 'campus' | 'nearby'
    // 출력: <span> 요소
    function makePinShape(area) {
        const shape = el('span', 'map-pin-shape');
        shape.setAttribute('aria-hidden', 'true');
        const path = 'M15 35s-13-11-13-21a13 13 0 0 1 26 0c0 10-13 21-13 21z';
        if (area === 'campus') {
            shape.innerHTML = '<svg width="30" height="36" viewBox="0 0 30 36"><path d="' + path + '" fill="#6B3B1F"/>'
                + '<circle cx="15" cy="14" r="5" fill="#FFFFFF"/></svg>';
        } else {
            shape.innerHTML = '<svg width="30" height="36" viewBox="0 0 30 36"><path d="' + path + '" fill="#FFFFFF"'
                + ' stroke="#6B3B1F" stroke-width="2"/><circle cx="15" cy="14" r="5" fill="#6B3B1F"/></svg>';
        }
        return shape;
    }

    // 역할: 지도 위 핀들을 지금 고른 위치(전체·교내·근처)에 맞게 다시 그린다
    // 입력: layer - 핀을 올릴 자리, pins - Cafes.getMapPins 결과
    // 출력: 없음
    function renderPins(layer, pins) {
        layer.textContent = '';
        for (let i = 0; i < pins.length; i++) {
            const pin = pins[i];
            if (currentArea !== 'all' && pin.area !== currentArea) {
                continue;
            }
            const link = el('a', 'map-pin');
            link.href = 'cafe.html?id=' + pin.cafeId;
            link.style.left = pin.x + '%';
            link.style.top = pin.y + '%';
            link.setAttribute('aria-label', pin.name + ', ' + (pin.area === 'campus' ? '교내' : '근처'));
            link.appendChild(makePinShape(pin.area));
            link.appendChild(el('span', 'map-pin-label', pin.name));
            layer.appendChild(link);
        }
    }

    // 역할: 화면 전체를 그린다 (칩, 지도 상자, 범례)
    // 입력: 없음
    // 출력: 없음
    function render() {
        renderHeader('지도', false);
        renderTabBar('map');
        const pins = Cafes.getMapPins();

        const chips = el('div', 'chip-row');
        const areas = [
            { key: 'all', label: '전체' },
            { key: 'campus', label: '교내' },
            { key: 'nearby', label: '근처' }
        ];
        const layer = el('div', 'map-layer');
        for (let i = 0; i < areas.length; i++) {
            const count = pins.filter(function (pin) {
                return areas[i].key === 'all' || pin.area === areas[i].key;
            }).length;
            const chip = el('button', 'chip', areas[i].label + ' ' + count);
            chip.type = 'button';
            chip.addEventListener('click', function () {
                currentArea = areas[i].key;
                const all = chips.querySelectorAll('.chip');
                for (let k = 0; k < all.length; k++) {
                    all[k].classList.toggle('is-selected', k === i);
                    all[k].setAttribute('aria-pressed', String(k === i));
                }
                renderPins(layer, pins);
            });
            chip.classList.toggle('is-selected', i === 0);
            chip.setAttribute('aria-pressed', String(i === 0));
            chips.appendChild(chip);
        }
        app.appendChild(chips);

        const scroller = el('div', 'map-scroll');
        const canvas = el('div', 'map-canvas');
        const image = el('img', 'map-image');
        image.alt = '캠퍼스 지도';
        image.addEventListener('error', function () {
            const placeholder = el('div', 'map-placeholder', '지도 이미지 준비 중');
            canvas.replaceChild(placeholder, image);
        });
        // 지도가 열리면 캠퍼스(지도 가운데)가 먼저 보이도록 스크롤을 가운데로 옮긴다
        image.addEventListener('load', function () {
            scroller.scrollLeft = (canvas.offsetWidth - scroller.clientWidth) / 2;
            scroller.scrollTop = (canvas.offsetHeight - scroller.clientHeight) / 2;
        });
        image.src = MAP_IMAGE;
        canvas.appendChild(image);
        canvas.appendChild(layer);
        scroller.appendChild(canvas);
        app.appendChild(scroller);

        const legend = el('div', 'row-between muted small map-legend');
        const keys = el('span', 'map-keys');
        const campusKey = el('span', 'map-key');
        campusKey.appendChild(el('span', 'map-dot'));
        campusKey.appendChild(document.createTextNode('교내'));
        const nearbyKey = el('span', 'map-key');
        nearbyKey.appendChild(el('span', 'map-dot is-outline'));
        nearbyKey.appendChild(document.createTextNode('근처'));
        keys.appendChild(campusKey);
        keys.appendChild(nearbyKey);
        legend.appendChild(keys);
        legend.appendChild(el('span', '', pins.length === 0 ? '표시할 카페 위치가 아직 없어요' : '핀을 누르면 카페 상세로 이동해요'));
        app.appendChild(legend);

        renderPins(layer, pins);
    }

    try {
        render();
    } catch (e) {
        showError(e.message);
    }
})();
