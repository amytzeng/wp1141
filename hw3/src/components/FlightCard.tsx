import { Flight, CabinClass } from '../types/Flight'
import '../styles/FlightCard.css'

// 格式化日期為易讀格式，避免時區問題
const formatFlightDate = (dateString: string): string => {
  // 直接解析 YYYY-MM-DD 格式
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
  return `${month}月${day}日 (週${weekday})`
}

interface FlightCardProps {
  flight: Flight
  cabin: CabinClass
  price: number
  onSelect?: (flight: Flight) => void
}

const FlightCard = ({ flight, cabin, price, onSelect }: FlightCardProps) => {
  const getCabinName = (cabin: CabinClass): string => {
    switch (cabin) {
      case 'economy':
        return '經濟艙'
      case 'business':
        return '商務艙'
      case 'first':
        return '頭等艙'
    }
  }

  return (
    <div className="flight-card">
      <div className="flight-header">
        <div className="flight-number">
          <span className="label">航班編號</span>
          <span className="value">{flight.flightNumber}</span>
        </div>
        <div className="aircraft">
          <span className="label">機型</span>
          <span className="value">{flight.aircraft}</span>
        </div>
      </div>
      
      <div className="flight-date">
        <span className="date-label">航班日期</span>
        <span className="date-value">{formatFlightDate(flight.departureDate)}</span>
      </div>

      <div className="flight-route">
        <div className="route-info departure">
          <div className="city">{flight.departure}</div>
          <div className="time">{flight.departureTime}</div>
        </div>

        <div className="route-middle">
          <div className="duration">{flight.duration}</div>
          <div className="route-line">
            <div className="line"></div>
            <div className="plane-icon">✈</div>
          </div>
        </div>

        <div className="route-info arrival">
          <div className="city">{flight.destination}</div>
          <div className="time">{flight.arrivalTime}</div>
        </div>
      </div>

      <div className="flight-footer">
        <div className="cabin-info">
          <span className="cabin-class">{getCabinName(cabin)}</span>
          <span className="seats-available">剩餘 {flight.availableSeats} 個座位</span>
        </div>
        <div className="booking-section">
          <div className="price">
            <span className="currency">NT$</span>
            <span className="amount">{price.toLocaleString()}</span>
          </div>
          <button 
            className="book-button"
            onClick={() => onSelect && onSelect(flight)}
          >
            選擇
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlightCard

