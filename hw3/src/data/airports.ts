import { Airport } from '../types/Order'

export const airports: Record<string, Airport> = {
  'TPE': {
    code: 'TPE',
    city: '台北',
    country: '台灣',
    continent: '亞洲',
    coordinates: { lat: 25.0777, lng: 121.2328 }
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
  }
}

export const getAirportCode = (cityString: string): string => {
  // 从 "城市 CODE" 格式提取机场代码
  const parts = cityString.split(' ')
  return parts[parts.length - 1]
}

export const getAirportInfo = (cityString: string): Airport | undefined => {
  const code = getAirportCode(cityString)
  return airports[code]
}

