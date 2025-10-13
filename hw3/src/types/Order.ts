import { Flight, CabinClass } from './Flight'

export interface OrderItem {
  flight: Flight
  cabin: CabinClass
  actualPrice?: number // 設為可選，以兼容舊數據
}

export interface Order {
  id: string
  items: OrderItem[]
  totalAmount: number
  orderDate: string
  paymentMethod: string
  status: 'completed' | 'cancelled'
}

export interface Airport {
  code: string
  city: string
  country: string
  continent: string
  coordinates: {
    lat: number
    lng: number
  }
}

