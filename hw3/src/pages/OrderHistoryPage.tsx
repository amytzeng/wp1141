import { Order } from '../types/Order'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/OrderHistoryPage.css'

interface OrderHistoryPageProps {
  orders: Order[]
  onDeleteOrder: (orderId: string) => void
}

function OrderHistoryPage({ orders, onDeleteOrder }: OrderHistoryPageProps) {
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (orders.length === 0) {
    return (
      <main className="main-content">
        <div className="order-history-container">
          <h2 className="page-title">訂單記錄</h2>
          <div className="empty-orders">
            <p>尚無訂單記錄</p>
            <p className="hint">完成付款後，訂單會顯示在這裡</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="order-history-container">
        <h2 className="page-title">訂單記錄</h2>
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <span className="order-id">訂單編號: {order.id}</span>
                  <span className="order-date">{formatDate(order.orderDate)}</span>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.status}`}>
                    {order.status === 'completed' ? '已完成' : '已取消'}
                  </span>
                </div>
              </div>

              <div className="order-flights">
                {order.items.map((item, index) => (
                  <div key={index} className="order-flight-item">
                    <div className="flight-number">{item.flight.flightNumber}</div>
                    <div className="flight-route">
                      <span>{item.flight.departure}</span>
                      <span className="arrow">→</span>
                      <span>{item.flight.destination}</span>
                    </div>
                    <div className="flight-details">
                      <span>{item.flight.departureTime} - {item.flight.arrivalTime}</span>
                      <span>•</span>
                      <span>{getCabinName(item.cabin)}</span>
                      <span>•</span>
                      <span>日期: {new Date(item.flight.departureDate).toLocaleDateString('zh-TW')}</span>
                      <span>•</span>
                      <span>NT$ {getPrice(item.flight, item.cabin).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div className="payment-method">
                  付款方式: {order.paymentMethod}
                </div>
                <div className="order-actions">
                  <div className="order-total">
                    總金額: <span className="amount">NT$ {order.totalAmount.toLocaleString()}</span>
                  </div>
                  <button 
                    className="delete-order-button"
                    onClick={() => {
                      if (window.confirm('確定要刪除此訂單嗎？刪除後無法復原，且旅行地圖上的記錄也會一併移除。')) {
                        onDeleteOrder(order.id)
                      }
                    }}
                  >
                    刪除訂單
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default OrderHistoryPage

