import { Flight, CabinClass } from './Flight'

export interface OrderItem {
  flight: Flight
  cabin: CabinClass
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

