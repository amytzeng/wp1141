import csv
from datetime import datetime, timedelta

# 所有選單上的機場配置
# 格式: (城市名稱 CODE, 基礎經濟艙價格, 基礎商務艙價格, 基礎頭等艙價格, 飛行時間, 地區類型)
all_airports = [
    # 東北亞
    ("東京 NRT", 10500, 27000, 47000, "3h15m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("東京 HND", 11000, 28000, 48000, "3h20m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("大阪 KIX", 10000, 26000, 45000, "2h50m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("福岡 FUK", 9500, 24000, 42000, "2h30m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("名古屋 NGO", 10200, 26500, 46000, "3h00m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("首爾 ICN", 9500, 24000, 42000, "2h30m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    
    # 港澳
    ("香港 HKG", 8500, 22000, 38000, "1h50m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("澳門 MFM", 8000, 21000, 36000, "1h45m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    
    # 中國
    ("上海 PVG", 8800, 23000, 40000, "1h55m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("北京 PEK", 11500, 29000, 50000, "3h30m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("廣州 CAN", 8500, 22000, 38000, "1h50m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("深圳 SZX", 8500, 22000, 38000, "1h45m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    
    # 東南亞
    ("新加坡 SIN", 13000, 33000, 58000, "4h30m", "08:30", "14:00", "16:00", "21:30", "Asia"),
    ("曼谷 BKK", 12000, 30000, 52000, "3h45m", "08:30", "13:00", "15:00", "19:00", "Asia"),
    ("馬尼拉 MNL", 9000, 23000, 40000, "2h15m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("胡志明市 SGN", 11000, 28000, 48000, "3h20m", "08:30", "13:00", "15:00", "19:30", "Asia"),
    ("河內 HAN", 10800, 27500, 47500, "3h10m", "08:30", "13:00", "15:00", "19:20", "Asia"),
    ("吉隆坡 KUL", 12500, 31000, 55000, "4h15m", "08:30", "14:00", "16:00", "21:00", "Asia"),
    ("峇里島 DPS", 13500, 34000, 60000, "5h00m", "08:30", "15:00", "17:00", "22:30", "Asia"),
    ("雅加達 CGK", 13000, 32500, 57000, "4h45m", "08:30", "14:30", "16:30", "22:00", "Asia"),
    ("宿霧 CEB", 9500, 24500, 42500, "2h30m", "08:30", "12:00", "14:00", "17:30", "Asia"),
    ("金邊 PNH", 11500, 29000, 50000, "3h30m", "08:30", "13:00", "15:00", "19:30", "Asia"),
    ("仰光 RGN", 14000, 35000, 61000, "4h00m", "08:30", "13:30", "15:30", "20:30", "Asia"),
    
    # 南亞
    ("新德里 DEL", 16000, 42000, 75000, "5h30m", "23:30", "06:00+1", "23:30", "06:00+1", "Asia"),
    ("孟買 BOM", 16500, 43000, 76000, "5h45m", "23:30", "06:15+1", "23:30", "06:15+1", "Asia"),
    ("班加羅爾 BLR", 16000, 42000, 75000, "5h30m", "23:30", "06:00+1", "23:30", "06:00+1", "Asia"),
    ("清奈 MAA", 15500, 41000, 73000, "5h15m", "23:30", "05:45+1", "23:30", "05:45+1", "Asia"),
    ("加爾各答 CCU", 15000, 40000, 71000, "4h50m", "08:30", "14:20", "16:00", "21:50", "Asia"),
    ("海德拉巴 HYD", 16000, 42000, 75000, "5h30m", "23:30", "06:00+1", "23:30", "06:00+1", "Asia"),
    ("科欽 COK", 15500, 41000, 73000, "5h15m", "23:30", "05:45+1", "23:30", "05:45+1", "Asia"),
    ("齋浦爾 JAI", 16500, 43000, 76000, "5h45m", "23:30", "06:15+1", "23:30", "06:15+1", "Asia"),
    ("勒克瑙 LKO", 15500, 41000, 73000, "5h15m", "23:30", "05:45+1", "23:30", "05:45+1", "Asia"),
    ("艾哈邁達巴德 AMD", 16000, 42000, 75000, "5h30m", "23:30", "06:00+1", "23:30", "06:00+1", "Asia"),
    ("浦那 PNQ", 16000, 42000, 75000, "5h30m", "23:30", "06:00+1", "23:30", "06:00+1", "Asia"),
    ("果阿 GOI", 15500, 41000, 73000, "5h15m", "23:30", "05:45+1", "23:30", "05:45+1", "Asia"),
    ("卡利卡特 CCJ", 15500, 41000, 73000, "5h15m", "23:30", "05:45+1", "23:30", "05:45+1", "Asia"),
    ("特里凡得琅 TRV", 15500, 41000, 73000, "5h15m", "23:30", "05:45+1", "23:30", "05:45+1", "Asia"),
    ("馬杜賴 IXM", 15500, 41000, 73000, "5h15m", "23:30", "05:45+1", "23:30", "05:45+1", "Asia"),
    
    # 美洲
    ("洛杉磯 LAX", 35000, 95000, 180000, "12h00m", "23:30", "20:30", "23:30", "06:30+1", "America"),
    ("舊金山 SFO", 34000, 92000, 175000, "11h00m", "23:30", "19:30", "23:30", "05:30+1", "America"),
    ("西雅圖 SEA", 33000, 90000, 170000, "10h30m", "23:30", "18:30", "23:30", "04:30+1", "America"),
    ("溫哥華 YVR", 34000, 92000, 175000, "11h00m", "23:30", "19:30", "23:30", "05:30+1", "America"),
    ("紐約 JFK", 38000, 105000, 200000, "14h30m", "23:30", "08:00+1", "23:30", "08:00+1", "America"),
    
    # 歐洲
    ("倫敦 LHR", 40000, 110000, 210000, "14h00m", "23:30", "08:30+1", "23:30", "08:30+1", "Europe"),
    ("巴黎 CDG", 40000, 110000, 210000, "14h00m", "23:30", "08:30+1", "23:30", "08:30+1", "Europe"),
    ("法蘭克福 FRA", 40000, 110000, 210000, "14h00m", "23:30", "08:30+1", "23:30", "08:30+1", "Europe"),
    ("阿姆斯特丹 AMS", 40000, 110000, 210000, "14h00m", "23:30", "08:30+1", "23:30", "08:30+1", "Europe"),
    
    # 大洋洲
    ("雪梨 SYD", 28000, 75000, 145000, "9h00m", "08:30", "19:30", "08:30", "17:30", "Oceania"),
    ("墨爾本 MEL", 28000, 75000, 145000, "9h00m", "08:30", "19:30", "08:30", "17:30", "Oceania"),
    ("布里斯本 BNE", 28000, 75000, 145000, "9h00m", "08:30", "19:30", "08:30", "17:30", "Oceania"),
    ("奧克蘭 AKL", 30000, 80000, 155000, "10h30m", "08:30", "21:00", "08:30", "19:00", "Oceania"),
    
    # 臺北松山
    ("臺北松山 TSA", 500, 1500, 3000, "0h10m", "08:30", "08:40", "09:00", "09:10", "Taiwan"),
]

# 亞洲國家/地區列表
asian_destinations = [
    "東京", "大阪", "福岡", "名古屋", "首爾", "香港", "澳門", 
    "上海", "北京", "廣州", "深圳", "新加坡", "曼谷", "馬尼拉", 
    "胡志明市", "河內", "吉隆坡", "峇里島", "雅加達", "宿霧", 
    "金邊", "仰光", "新德里", "孟買", "班加羅爾", "清奈", 
    "加爾各答", "海德拉巴", "科欽", "齋浦爾", "勒克瑙", 
    "艾哈邁達巴德", "浦那", "果阿", "卡利卡特", "特里凡得琅", "馬杜賴", "臺北松山"
]

def is_asian_route(destination):
    """判斷是否為亞洲航線"""
    for asian_dest in asian_destinations:
        if asian_dest in destination:
            return True
    return False

def get_aircraft_and_seats(destination):
    """根據目的地返回飛機型號和座位數"""
    if is_asian_route(destination):
        return "A321neo", 180
    else:
        return "A350-900", 300

def is_weekend(date):
    """判斷是否為週末"""
    return date.weekday() >= 5

def is_special_date(date):
    """判斷是否為特殊加價日期"""
    # 12/24 前後三天 (12/21-12/27) - 2025年聖誕節
    if date.year == 2025 and date.month == 12 and 21 <= date.day <= 27:
        return True
    # 1/1 前後兩天 (12/30-1/3) - 2026年新年
    if date.year == 2025 and date.month == 12 and date.day >= 30:
        return True
    if date.year == 2026 and date.month == 1 and date.day <= 3:
        return True
    return False

def calculate_price(base_price, date):
    """計算價格（含週末和特殊日期加價）"""
    price = base_price
    if is_special_date(date):
        price += 3000
    elif is_weekend(date):
        price += 2000
    return price

def generate_flights():
    """生成所有航班數據"""
    flights = []
    flight_counter = 2  # 從2開始
    
    # 為每個航線分配班機號碼
    route_numbers = {}
    
    for airport_data in all_airports:
        destination = airport_data[0]
        route_key = f"臺北 TPE_{destination}_08:30"
        
        if route_key not in route_numbers:
            outbound = flight_counter
            inbound = flight_counter - 1
            route_numbers[route_key] = {'outbound': outbound, 'inbound': inbound}
            flight_counter += 2
    
    # 生成從 2025-10-13 到 2026-01-31 的航班
    start_date = datetime(2025, 10, 13)
    end_date = datetime(2026, 1, 31)
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        
        for airport_data in all_airports:
            destination, base_eco, base_bus, base_first, duration, dep_time, arr_time, return_dep, return_arr, region = airport_data
            
            # 獲取班機號碼
            route_key = f"臺北 TPE_{destination}_08:30"
            outbound_number = route_numbers[route_key]['outbound']
            inbound_number = route_numbers[route_key]['inbound']
            
            # 獲取飛機型號和座位
            aircraft, seats = get_aircraft_and_seats(destination)
            
            # 計算價格
            eco_price = calculate_price(base_eco, current_date)
            bus_price = calculate_price(base_bus, current_date)
            first_price = calculate_price(base_first, current_date)
            
            # 去程
            flights.append({
                'flightNumber': f"AM{outbound_number:03d}",
                'departure': '臺北 TPE',
                'destination': destination,
                'departureDate': date_str,
                'departureTime': dep_time,
                'arrivalTime': arr_time,
                'duration': duration,
                'price_economy': eco_price,
                'price_business': bus_price,
                'price_first': first_price,
                'aircraft': aircraft,
                'availableSeats': seats
            })
            
            # 回程
            flights.append({
                'flightNumber': f"AM{inbound_number:03d}",
                'departure': destination,
                'destination': '臺北 TPE',
                'departureDate': date_str,
                'departureTime': return_dep,
                'arrivalTime': return_arr,
                'duration': duration,
                'price_economy': eco_price,
                'price_business': bus_price,
                'price_first': first_price,
                'aircraft': aircraft,
                'availableSeats': seats
            })
        
        current_date += timedelta(days=1)
    
    # 添加特殊的 1/1 臺北飛松山航班（三班）
    newyear_date = "2026-01-01"
    special_flights = [
        # 早班
        {
            'flightNumber': 'AM888',
            'departure': '臺北 TPE',
            'destination': '臺北松山 TSA',
            'departureDate': newyear_date,
            'departureTime': '06:00',
            'arrivalTime': '06:10',
            'duration': '0h10m',
            'price_economy': 0,
            'price_business': 100,
            'price_first': 500,
            'aircraft': 'A350-900',
            'availableSeats': 300
        },
        {
            'flightNumber': 'AM887',
            'departure': '臺北松山 TSA',
            'destination': '臺北 TPE',
            'departureDate': newyear_date,
            'departureTime': '06:30',
            'arrivalTime': '06:40',
            'duration': '0h10m',
            'price_economy': 0,
            'price_business': 100,
            'price_first': 500,
            'aircraft': 'A350-900',
            'availableSeats': 300
        },
        # 午班
        {
            'flightNumber': 'AM890',
            'departure': '臺北 TPE',
            'destination': '臺北松山 TSA',
            'departureDate': newyear_date,
            'departureTime': '12:00',
            'arrivalTime': '12:10',
            'duration': '0h10m',
            'price_economy': 0,
            'price_business': 100,
            'price_first': 500,
            'aircraft': 'A350-900',
            'availableSeats': 300
        },
        {
            'flightNumber': 'AM889',
            'departure': '臺北松山 TSA',
            'destination': '臺北 TPE',
            'departureDate': newyear_date,
            'departureTime': '12:30',
            'arrivalTime': '12:40',
            'duration': '0h10m',
            'price_economy': 0,
            'price_business': 100,
            'price_first': 500,
            'aircraft': 'A350-900',
            'availableSeats': 300
        },
        # 晚班
        {
            'flightNumber': 'AM892',
            'departure': '臺北 TPE',
            'destination': '臺北松山 TSA',
            'departureDate': newyear_date,
            'departureTime': '18:00',
            'arrivalTime': '18:10',
            'duration': '0h10m',
            'price_economy': 0,
            'price_business': 100,
            'price_first': 500,
            'aircraft': 'A350-900',
            'availableSeats': 300
        },
        {
            'flightNumber': 'AM891',
            'departure': '臺北松山 TSA',
            'destination': '臺北 TPE',
            'departureDate': newyear_date,
            'departureTime': '18:30',
            'arrivalTime': '18:40',
            'duration': '0h10m',
            'price_economy': 0,
            'price_business': 100,
            'price_first': 500,
            'aircraft': 'A350-900',
            'availableSeats': 300
        }
    ]
    
    flights.extend(special_flights)
    
    return flights

def write_csv(flights, filename):
    """將航班數據寫入 CSV 文件"""
    fieldnames = ['flightNumber', 'departure', 'destination', 'departureDate', 
                  'departureTime', 'arrivalTime', 'duration', 'price_economy', 
                  'price_business', 'price_first', 'aircraft', 'availableSeats']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(flights)

if __name__ == "__main__":
    print("開始生成完整航班數據...")
    flights = generate_flights()
    print(f"共生成 {len(flights)} 個航班")
    
    write_csv(flights, 'flights.csv')
    print("航班數據已寫入 flights.csv")
    
    # 驗證
    print("\n驗證特殊航班（1/1 臺北→松山）：")
    special = [f for f in flights if f['departureDate'] == '2026-01-01' and '松山' in f['destination']]
    for f in special[:3]:
        print(f"  {f['flightNumber']}: {f['departure']} → {f['destination']} "
              f"({f['departureTime']}) - {f['aircraft']} ({f['availableSeats']}座) "
              f"- 經濟:{f['price_economy']}/商務:{f['price_business']}/頭等:{f['price_first']}")

