export interface Flight {
  flightNumber: string;
  departure: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price_economy: number;
  price_business: number;
  price_first: number;
  aircraft: string;
  availableSeats: number;
}

export type CabinClass = 'economy' | 'business' | 'first';

export type TripType = 'roundtrip' | 'oneway' | 'multicity';

export interface MultiCityLeg {
  departure: string;
  destination: string;
  date: string;
  cabin: CabinClass;
}

export interface SearchParams {
  tripType: TripType;
  departure: string;
  destination: string;
  date: string;
  cabin: CabinClass;
  returnDate?: string;
  multiCityLegs?: MultiCityLeg[];
}

