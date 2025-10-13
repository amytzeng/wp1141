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

  // 根據機型和艙等計算座位數
  const getAvailableSeats = (cabin: CabinClass): number => {
    const isSmallAircraft = flight.aircraft === 'A321neo' // 180 seats
    const totalSeats = isSmallAircraft ? 180 : 300 // A350-900 has 300 seats
    
    // 計算各艙等座位數
    const firstClassSeats = Math.floor(totalSeats * 0.05)
    const businessClassSeats = Math.floor(totalSeats * 0.15)
    const economyClassSeats = totalSeats - firstClassSeats - businessClassSeats
    
    // 模擬可用座位（假設 70% 可用）
    const availabilityRate = 0.7
    
    switch (cabin) {
      case 'first':
        // 頭等艙：1-1 配置，每排 2 座
        return Math.floor(firstClassSeats * availabilityRate)
      case 'business':
        // 商務艙：2-2-2 配置，每排 6 座
        return Math.floor(businessClassSeats * availabilityRate)
      case 'economy':
        // 經濟艙：小飛機 3-3-3 (9座/排)，大飛機 3-4-3 (10座/排)
        return Math.floor(economyClassSeats * availabilityRate)
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
          <span className="seats-available">剩餘 {getAvailableSeats(cabin)} 個座位</span>
        </div>
        <div className="booking-section">
          <div className={`price ${price === 0 ? 'free-price' : ''}`}>
            {price === 0 ? (
              <>
                <span className="free-label">🎉 免費</span>
                <span className="original-price">
                  <span className="currency">NT$</span>
                  <span className="amount">
                    {cabin === 'economy' ? flight.price_economy : 
                     cabin === 'business' ? flight.price_business : 
                     flight.price_first}
                  </span>
                </span>
              </>
            ) : (
              <>
                <span className="currency">NT$</span>
                <span className="amount">{price.toLocaleString()}</span>
              </>
            )}
          </div>
          <button 
            className={`book-button ${price === 0 ? 'free-button' : ''}`}
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

