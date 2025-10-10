import { Flight, CabinClass } from '../types/Flight'
import FlightCard from './FlightCard'
import '../styles/FlightList.css'

interface FlightListProps {
  flights: Flight[]
  cabin: CabinClass
  getPrice: (flight: Flight, cabin: CabinClass) => number
  onSelectFlight?: (flight: Flight) => void
}

const FlightList = ({ flights, cabin, getPrice, onSelectFlight }: FlightListProps) => {
  if (flights.length === 0) {
    return (
      <div className="no-flights">
        <p>沒有找到符合條件的航班</p>
        <p className="no-flights-hint">請嘗試調整搜尋條件</p>
      </div>
    )
  }

  return (
    <div className="flight-list">
      <h2 className="flight-list-title">
        可預訂航班 ({flights.length} 個航班)
      </h2>
      <div className="flights-container">
        {flights.map(flight => (
          <FlightCard
            key={flight.flightNumber}
            flight={flight}
            cabin={cabin}
            price={getPrice(flight, cabin)}
            onSelect={onSelectFlight}
          />
        ))}
      </div>
    </div>
  )
}

export default FlightList

