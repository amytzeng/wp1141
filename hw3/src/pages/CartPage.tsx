import { useNavigate } from 'react-router-dom'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/CartPage.css'

interface SelectedFlight {
  flight: Flight
  cabin: CabinClass
}

interface CartPageProps {
  selectedFlights: SelectedFlight[]
  onRemoveFlight: (index: number) => void
}

function CartPage({ selectedFlights, onRemoveFlight }: CartPageProps) {
  const navigate = useNavigate()

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

  const getPrice = (flight: Flight, cabin: CabinClass): number => {
    switch (cabin) {
      case 'economy':
        return flight.price_economy
      case 'business':
        return flight.price_business
      case 'first':
        return flight.price_first
    }
  }

  const totalAmount = selectedFlights.reduce((sum, item) => {
    return sum + getPrice(item.flight, item.cabin)
  }, 0)

  const handleCheckout = () => {
    if (selectedFlights.length === 0) {
      alert('請先選擇航班')
      return
    }
    navigate('/payment')
  }

  return (
    <main className="main-content">
      <div className="cart-container">
        <h2 className="cart-title">已選擇的航班</h2>
        
        {selectedFlights.length === 0 ? (
          <div className="empty-cart">
            <p>尚未選擇任何航班</p>
            <button className="back-button" onClick={() => navigate('/')}>
              返回搜尋航班
            </button>
          </div>
        ) : (
          <>
            <div className="selected-flights">
              {selectedFlights.map((item, index) => (
                <div key={index} className="selected-flight-card">
                  <div className="flight-info">
                    <div className="flight-header">
                      <span className="flight-number">{item.flight.flightNumber}</span>
                      <span className="cabin-badge">{getCabinName(item.cabin)}</span>
                    </div>
                    
                    <div className="flight-route">
                      <div className="route-point">
                        <div className="city">{item.flight.departure}</div>
                        <div className="time">{item.flight.departureTime}</div>
                      </div>
                      
                      <div className="route-arrow">→</div>
                      
                      <div className="route-point">
                        <div className="city">{item.flight.destination}</div>
                        <div className="time">{item.flight.arrivalTime}</div>
                      </div>
                    </div>
                    
                    <div className="flight-details">
                      <span>飛行時間: {item.flight.duration}</span>
                      <span>機型: {item.flight.aircraft}</span>
                      <span>日期: {new Date(item.flight.departureDate).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                  
                  <div className="flight-actions">
                    <div className="price">
                      NT$ {getPrice(item.flight, item.cabin).toLocaleString()}
                    </div>
                    <button 
                      className="remove-button"
                      onClick={() => onRemoveFlight(index)}
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="summary-row">
                <span>航班數量</span>
                <span>{selectedFlights.length} 個</span>
              </div>
              <div className="summary-row total">
                <span>總金額</span>
                <span>NT$ {totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="cart-actions">
                <button className="continue-button" onClick={() => navigate('/')}>
                  繼續選購
                </button>
                <button className="checkout-button" onClick={handleCheckout}>
                  前往付款
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default CartPage

