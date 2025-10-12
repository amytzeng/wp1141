import { Airport } from '../types/Order'

export interface AirportRegion {
  id: string
  name: string
  airports: Airport[]
}

export const airports: Record<string, Airport> = {
  'TPE': {
    code: 'TPE',
    city: '臺北',
    country: '臺灣',
    continent: '亞洲',
    coordinates: { lat: 25.0777, lng: 121.2328 }
  },
  'TSA': {
    code: 'TSA',
    city: '臺北',
    country: '臺灣',
    continent: '亞洲',
    coordinates: { lat: 25.0697, lng: 121.5519 }
  },
  'NRT': {
    code: 'NRT',
    city: '東京',
    country: '日本',
    continent: '亞洲',
    coordinates: { lat: 35.7653, lng: 140.3863 }
  },
  'HND': {
    code: 'HND',
    city: '東京',
    country: '日本',
    continent: '亞洲',
    coordinates: { lat: 35.5494, lng: 139.7798 }
  },
  'KIX': {
    code: 'KIX',
    city: '大阪',
    country: '日本',
    continent: '亞洲',
    coordinates: { lat: 34.4347, lng: 135.2440 }
  },
  'FUK': {
    code: 'FUK',
    city: '福岡',
    country: '日本',
    continent: '亞洲',
    coordinates: { lat: 33.5859, lng: 130.4511 }
  },
  'NGO': {
    code: 'NGO',
    city: '名古屋',
    country: '日本',
    continent: '亞洲',
    coordinates: { lat: 34.8584, lng: 136.8054 }
  },
  'ICN': {
    code: 'ICN',
    city: '首爾',
    country: '韓國',
    continent: '亞洲',
    coordinates: { lat: 37.4602, lng: 126.4407 }
  },
  'BKK': {
    code: 'BKK',
    city: '曼谷',
    country: '泰國',
    continent: '亞洲',
    coordinates: { lat: 13.6900, lng: 100.7501 }
  },
  'SIN': {
    code: 'SIN',
    city: '新加坡',
    country: '新加坡',
    continent: '亞洲',
    coordinates: { lat: 1.3644, lng: 103.9915 }
  },
  'KUL': {
    code: 'KUL',
    city: '吉隆坡',
    country: '馬來西亞',
    continent: '亞洲',
    coordinates: { lat: 2.7456, lng: 101.7072 }
  },
  'MFM': {
    code: 'MFM',
    city: '澳門',
    country: '澳門',
    continent: '亞洲',
    coordinates: { lat: 22.1496, lng: 113.5919 }
  },
  'HKG': {
    code: 'HKG',
    city: '香港',
    country: '香港',
    continent: '亞洲',
    coordinates: { lat: 22.3080, lng: 113.9185 }
  },
  'DPS': {
    code: 'DPS',
    city: '峇里島',
    country: '印尼',
    continent: '亞洲',
    coordinates: { lat: -8.7467, lng: 115.1667 }
  },
  'CGK': {
    code: 'CGK',
    city: '雅加達',
    country: '印尼',
    continent: '亞洲',
    coordinates: { lat: -6.1256, lng: 106.6558 }
  },
  'SGN': {
    code: 'SGN',
    city: '胡志明市',
    country: '越南',
    continent: '亞洲',
    coordinates: { lat: 10.8188, lng: 106.6519 }
  },
  'HAN': {
    code: 'HAN',
    city: '河內',
    country: '越南',
    continent: '亞洲',
    coordinates: { lat: 21.2212, lng: 105.8072 }
  },
  'MNL': {
    code: 'MNL',
    city: '馬尼拉',
    country: '菲律賓',
    continent: '亞洲',
    coordinates: { lat: 14.5086, lng: 121.0198 }
  },
  'CEB': {
    code: 'CEB',
    city: '宿霧',
    country: '菲律賓',
    continent: '亞洲',
    coordinates: { lat: 10.3073, lng: 123.9794 }
  },
  'PNH': {
    code: 'PNH',
    city: '金邊',
    country: '柬埔寨',
    continent: '亞洲',
    coordinates: { lat: 11.5466, lng: 104.8441 }
  },
  'RGN': {
    code: 'RGN',
    city: '仰光',
    country: '緬甸',
    continent: '亞洲',
    coordinates: { lat: 16.9073, lng: 96.1332 }
  },
  'DEL': {
    code: 'DEL',
    city: '德里',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 28.5562, lng: 77.1000 }
  },
  'BOM': {
    code: 'BOM',
    city: '孟買',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 19.0887, lng: 72.8681 }
  },
  'BLR': {
    code: 'BLR',
    city: '班加羅爾',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 13.1979, lng: 77.7063 }
  },
  'MAA': {
    code: 'MAA',
    city: '清奈',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 12.9941, lng: 80.1709 }
  },
  'CCU': {
    code: 'CCU',
    city: '加爾各答',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 22.6546, lng: 88.4467 }
  },
  'HYD': {
    code: 'HYD',
    city: '海德拉巴',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 17.2403, lng: 78.4294 }
  },
  'COK': {
    code: 'COK',
    city: '科欽',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 9.9312, lng: 76.2673 }
  },
  'JAI': {
    code: 'JAI',
    city: '齋浦爾',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 26.8242, lng: 75.8012 }
  },
  'LKO': {
    code: 'LKO',
    city: '勒克瑙',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 26.7606, lng: 80.8893 }
  },
  'AMD': {
    code: 'AMD',
    city: '艾哈邁達巴德',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 23.0772, lng: 72.6347 }
  },
  'PNQ': {
    code: 'PNQ',
    city: '浦那',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 18.5821, lng: 73.9197 }
  },
  'GOI': {
    code: 'GOI',
    city: '果阿',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 15.3808, lng: 73.8314 }
  },
  'CCJ': {
    code: 'CCJ',
    city: '科澤科德',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 11.1368, lng: 75.9553 }
  },
  'TRV': {
    code: 'TRV',
    city: '特里凡得琅',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 8.4821, lng: 76.9201 }
  },
  'IXM': {
    code: 'IXM',
    city: '馬杜賴',
    country: '印度',
    continent: '亞洲',
    coordinates: { lat: 9.8345, lng: 78.0934 }
  },
  'PVG': {
    code: 'PVG',
    city: '上海',
    country: '中國',
    continent: '亞洲',
    coordinates: { lat: 31.1434, lng: 121.8052 }
  },
  'PEK': {
    code: 'PEK',
    city: '北京',
    country: '中國',
    continent: '亞洲',
    coordinates: { lat: 40.0799, lng: 116.6031 }
  },
  'CAN': {
    code: 'CAN',
    city: '廣州',
    country: '中國',
    continent: '亞洲',
    coordinates: { lat: 23.3924, lng: 113.2988 }
  },
  'SZX': {
    code: 'SZX',
    city: '深圳',
    country: '中國',
    continent: '亞洲',
    coordinates: { lat: 22.6392, lng: 113.8106 }
  },
  'LAX': {
    code: 'LAX',
    city: '洛杉磯',
    country: '美國',
    continent: '北美洲',
    coordinates: { lat: 33.9416, lng: -118.4085 }
  },
  'SFO': {
    code: 'SFO',
    city: '舊金山',
    country: '美國',
    continent: '北美洲',
    coordinates: { lat: 37.6213, lng: -122.3790 }
  },
  'SEA': {
    code: 'SEA',
    city: '西雅圖',
    country: '美國',
    continent: '北美洲',
    coordinates: { lat: 47.4502, lng: -122.3088 }
  },
  'YVR': {
    code: 'YVR',
    city: '溫哥華',
    country: '加拿大',
    continent: '北美洲',
    coordinates: { lat: 49.1967, lng: -123.1815 }
  },
  'JFK': {
    code: 'JFK',
    city: '紐約',
    country: '美國',
    continent: '北美洲',
    coordinates: { lat: 40.6413, lng: -73.7781 }
  },
  'LHR': {
    code: 'LHR',
    city: '倫敦',
    country: '英國',
    continent: '歐洲',
    coordinates: { lat: 51.4700, lng: -0.4543 }
  },
  'CDG': {
    code: 'CDG',
    city: '巴黎',
    country: '法國',
    continent: '歐洲',
    coordinates: { lat: 49.0097, lng: 2.5479 }
  },
  'FRA': {
    code: 'FRA',
    city: '法蘭克福',
    country: '德國',
    continent: '歐洲',
    coordinates: { lat: 50.0379, lng: 8.5622 }
  },
  'AMS': {
    code: 'AMS',
    city: '阿姆斯特丹',
    country: '荷蘭',
    continent: '歐洲',
    coordinates: { lat: 52.3105, lng: 4.7683 }
  },
  'SYD': {
    code: 'SYD',
    city: '雪梨',
    country: '澳洲',
    continent: '大洋洲',
    coordinates: { lat: -33.9399, lng: 151.1753 }
  },
  'MEL': {
    code: 'MEL',
    city: '墨爾本',
    country: '澳洲',
    continent: '大洋洲',
    coordinates: { lat: -37.6733, lng: 144.8433 }
  },
  'BNE': {
    code: 'BNE',
    city: '布里斯本',
    country: '澳洲',
    continent: '大洋洲',
    coordinates: { lat: -27.3842, lng: 153.1171 }
  },
  'AKL': {
    code: 'AKL',
    city: '奧克蘭',
    country: '紐西蘭',
    continent: '大洋洲',
    coordinates: { lat: -37.0082, lng: 174.7850 }
  }
}

// 按地區分類的機場資料
export const airportRegions: AirportRegion[] = [
  {
    id: 'taiwan',
    name: '臺灣',
    airports: [
      airports['TPE'],
      airports['TSA']
    ]
  },
  {
    id: 'hongkong-macau',
    name: '港澳',
    airports: [
      airports['HKG'],
      airports['MFM']
    ]
  },
  {
    id: 'northeast-asia',
    name: '東北亞',
    airports: [
      airports['NRT'],
      airports['HND'],
      airports['KIX'],
      airports['FUK'],
      airports['NGO'],
      airports['ICN']
    ]
  },
  {
    id: 'southeast-asia',
    name: '東南亞',
    airports: [
      airports['BKK'],
      airports['SIN'],
      airports['KUL'],
      airports['DPS'],
      airports['CGK'],
      airports['SGN'],
      airports['HAN'],
      airports['MNL'],
      airports['CEB'],
      airports['PNH'],
      airports['RGN']
    ]
  },
  {
    id: 'south-asia',
    name: '南亞',
    airports: [
      airports['DEL'],
      airports['BOM'],
      airports['BLR'],
      airports['MAA'],
      airports['CCU'],
      airports['HYD'],
      airports['COK'],
      airports['JAI'],
      airports['LKO'],
      airports['AMD'],
      airports['PNQ'],
      airports['GOI'],
      airports['CCJ'],
      airports['TRV'],
      airports['IXM']
    ]
  },
  {
    id: 'china',
    name: '中國',
    airports: [
      airports['PVG'],
      airports['PEK'],
      airports['CAN'],
      airports['SZX']
    ]
  },
  {
    id: 'north-america',
    name: '北美洲',
    airports: [
      airports['LAX'],
      airports['SFO'],
      airports['SEA'],
      airports['YVR'],
      airports['JFK']
    ]
  },
  {
    id: 'europe',
    name: '歐洲',
    airports: [
      airports['LHR'],
      airports['CDG'],
      airports['FRA'],
      airports['AMS']
    ]
  },
  {
    id: 'oceania',
    name: '大洋洲',
    airports: [
      airports['SYD'],
      airports['MEL'],
      airports['BNE'],
      airports['AKL']
    ]
  }
]

export const getAirportCode = (cityString: string): string => {
  // 从 "城市 CODE" 格式提取机场代码
  const parts = cityString.split(' ')
  return parts[parts.length - 1]
}

export const getAirportInfo = (cityString: string): Airport | undefined => {
  const code = getAirportCode(cityString)
  return airports[code]
}

export const formatAirportDisplay = (airport: Airport): string => {
  return `${airport.city} ${airport.code}`
}

// 從格式化的機場字符串中提取機場代碼
export const extractAirportCode = (airportString: string): string => {
  const parts = airportString.split(' ')
  return parts[parts.length - 1] || airportString
}