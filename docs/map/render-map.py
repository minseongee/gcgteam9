# OpenStreetMap 데이터(osm.txt)로 캠퍼스 지도 이미지를 그린다
# 좌표계: 가로 1200 x 세로 1257 (위도·경도를 그대로 비례 변환한 값)
import sys
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
W0, H0 = 1200, 1257
OUT_W = 1920
SS = 2                      # 안티에일리어싱용 확대 배율
K = OUT_W / W0 * SS         # 원래 좌표 -> 그림 좌표
W, H = int(W0 * K), int(H0 * K)

C = {
    'bg': (238, 233, 225), 'campus': (247, 243, 235), 'campus_line': (214, 200, 184),
    'bld': (221, 210, 196), 'bld_line': (196, 180, 162),
    'water': (184, 214, 228), 'green': (214, 228, 196), 'sport': (205, 225, 190), 'sport_line': (178, 204, 160),
    'road_case': (214, 205, 193), 'road': (255, 255, 255), 'foot': (226, 214, 199),
    'label': (122, 106, 92), 'gate': (107, 59, 31), 'halo': (255, 255, 255),
}

feats = []
for line in open(SRC, encoding='utf-8'):
    line = line.strip()
    if not line:
        continue
    code, *pairs = line.split(' ')
    x = y = 0
    pts = []
    for p in pairs:
        dx, dy = p.split(',')
        x += int(dx)
        y += int(dy)
        pts.append((x * K, y * K))
    feats.append((code, pts))

img = Image.new('RGB', (W, H), C['bg'])
d = ImageDraw.Draw(img)

def polys(code):
    return [p for c, p in feats if c == code and len(p) >= 3]

def lines(code):
    return [p for c, p in feats if c == code and len(p) >= 2]

for p in polys('C'):
    d.polygon(p, fill=C['campus'])
for p in polys('G'):
    d.polygon(p, fill=C['green'])
for p in polys('S'):
    d.polygon(p, fill=C['sport'], outline=C['sport_line'])
for p in polys('W'):
    d.polygon(p, fill=C['water'])
for p in polys('C'):
    d.line(p + [p[0]], fill=C['campus_line'], width=int(3 * K), joint='curve')

# 길: 테두리 먼저, 안쪽 흰색 나중에
road_w = {'R1': 11, 'R2': 8, 'R3': 5}
for code in ['R3', 'R2', 'R1']:
    for p in lines(code):
        d.line(p, fill=C['road_case'], width=int((road_w[code] + 2) * K), joint='curve')
for p in lines('F'):
    d.line(p, fill=C['foot'], width=int(2 * K), joint='curve')
for code in ['R3', 'R2', 'R1']:
    for p in lines(code):
        d.line(p, fill=C['road'], width=int(road_w[code] * K), joint='curve')

for p in polys('B'):
    d.polygon(p, fill=C['bld'], outline=C['bld_line'], width=max(1, int(1 * K)))

FONT = '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'
FONT_B = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
def font(path, px):
    # ttc 안의 KR 글꼴 번호를 찾아 쓴다
    for i in range(10):
        try:
            f = ImageFont.truetype(path, int(px), index=i)
        except Exception:
            break
        if 'KR' in ' '.join(f.getname()):
            return f
    return ImageFont.truetype(path, int(px))

f_lab = font(FONT, 16 * K)
f_gate = font(FONT_B if __import__('os').path.exists(FONT_B) else FONT, 19 * K)

def text(x, y, s, f, color):
    d.text((x * K, y * K), s, font=f, fill=color, anchor='mm',
           stroke_width=int(3 * K), stroke_fill=C['halo'])

LABELS = [
    ('중앙도서관', 745, 508), ('본관', 729, 621), ('대강당', 632, 415),
    ('첨성관', 939, 545), ('누리관', 853, 364), ('사회과학대학', 990, 815),
    ('IT 2호관', 697, 895), ('공과대학', 500, 860), ('체육관', 210, 712),
    ('인문대학', 632, 561), ('자연과학대학', 345, 625), ('농업생명과학대학', 520, 600),
    ('예술대학', 676, 360), ('약학대학', 752, 440), ('수의과대학', 830, 960),
]
for s, x, y in LABELS:
    text(x, y, s, f_lab, C['label'])

GATES = [('북문', 527, 440), ('정문', 907, 1095), ('서문', 116, 795)]
for s, x, y in GATES:
    text(x, y, s, f_gate, C['gate'])

f_small = font(FONT, 13 * K)
d.text((W - 10 * K, H - 8 * K), '© OpenStreetMap contributors', font=f_small,
       fill=(140, 128, 116), anchor='rd', stroke_width=int(2 * K), stroke_fill=C['halo'])

img = img.resize((W // SS, H // SS), Image.LANCZOS)
img = img.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
img.save(OUT, optimize=True)
print(OUT, img.size)
