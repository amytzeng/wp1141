import csv
from datetime import datetime, timedelta

# 讀取現有的 CSV 檔案
existing_flights = []
with open('public/flights.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    existing_flights = list(reader)

print(f"現有航班數量: {len(existing_flights)}")

# 提取所有目的地（不含臺北）
destinations = set()
for flight in existing_flights:
    dep = flight['departure']
    dest = flight['destination']
    if 'TPE' not in dep:
        destinations.add(dep)
    if 'TPE' not in dest:
        destinations.add(dest)

print(f"\n所有目的地機場: {len(destinations)} 個")
print(sorted(destinations))

# 檢查哪些機場有臺北來回的航班
airports_with_tpe_flights = set()
for flight in existing_flights:
    dep = flight['departure']
    dest = flight['destination']
    if 'TPE' in dep and 'TPE' not in dest:
        airports_with_tpe_flights.add(dest)
    elif 'TPE' in dest and 'TPE' not in dep:
        airports_with_tpe_flights.add(dep)

print(f"\n有臺北來回航班的機場: {len(airports_with_tpe_flights)} 個")
print(sorted(airports_with_tpe_flights))

# 找出缺少臺北來回航班的機場
missing_airports = destinations - airports_with_tpe_flights
print(f"\n❌ 缺少臺北來回航班的機場: {len(missing_airports)} 個")
for airport in sorted(missing_airports):
    print(f"   - {airport}")

# 選單上所有的機場（根據 airports.ts）
menu_airports = [
    # 臺灣
    '臺北 TPE', '臺北松山 TSA',
    # 港澳
    '香港 HKG', '澳門 MFM',
    # 東北亞
    '東京 NRT', '東京 HND', '大阪 KIX', '福岡 FUK', '名古屋 NGO', '首爾 ICN',
    # 東南亞
    '曼谷 BKK', '新加坡 SIN', '吉隆坡 KUL', '峇里島 DPS', '雅加達 CGK',
    '胡志明市 SGN', '河內 HAN', '馬尼拉 MNL', '宿霧 CEB', '金邊 PNH', '仰光 RGN',
    # 南亞
    '新德里 DEL', '孟買 BOM', '班加羅爾 BLR', '清奈 MAA', '加爾各答 CCU',
    '海德拉巴 HYD', '科欽 COK', '齋浦爾 JAI', '勒克瑙 LKO', '艾哈邁達巴德 AMD',
    '浦那 PNQ', '果阿 GOI', '卡利卡特 CCJ', '特里凡得琅 TRV', '馬杜賴 IXM',
    # 中國
    '上海 PVG', '北京 PEK', '廣州 CAN', '深圳 SZX',
    # 北美洲
    '洛杉磯 LAX', '舊金山 SFO', '西雅圖 SEA', '溫哥華 YVR', '紐約 JFK',
    # 歐洲
    '倫敦 LHR', '巴黎 CDG', '法蘭克福 FRA', '阿姆斯特丹 AMS',
    # 大洋洲
    '雪梨 SYD', '墨爾本 MEL', '布里斯本 BNE', '奧克蘭 AKL'
]

print(f"\n選單上的機場總數: {len(menu_airports)}")

# 檢查選單上哪些機場沒有在 CSV 中出現
menu_airports_in_csv = set()
for flight in existing_flights:
    if flight['departure'] in menu_airports:
        menu_airports_in_csv.add(flight['departure'])
    if flight['destination'] in menu_airports:
        menu_airports_in_csv.add(flight['destination'])

missing_from_csv = set(menu_airports) - menu_airports_in_csv
if missing_from_csv:
    print(f"\n❌ 選單上有但 CSV 中沒有的機場: {len(missing_from_csv)} 個")
    for airport in sorted(missing_from_csv):
        print(f"   - {airport}")

