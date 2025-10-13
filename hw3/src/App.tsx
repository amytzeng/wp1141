import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import CartPage from './pages/CartPage'
import PaymentPage from './pages/PaymentPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import TravelMapPage from './pages/TravelMapPage'
import { Flight, CabinClass } from './types/Flight'
import { Order } from './types/Order'

interface SelectedFlight {
  flight: Flight
  cabin: CabinClass
  actualPrice: number // 實際支付價格（考慮通關密語等優惠）
}

// LocalStorage keys
const CART_STORAGE_KEY = 'flight_cart'
const ORDERS_STORAGE_KEY = 'flight_orders'

function App() {
  const [selectedFlights, setSelectedFlights] = useState<SelectedFlight[]>(() => {
    const saved = localStorage.getItem(CART_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  })

  // 保存購物車到 localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(selectedFlights))
  }, [selectedFlights])

  // 保存訂單到 localStorage
  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  }, [orders])

  const handleSelectFlight = (flight: Flight, cabin: CabinClass, actualPrice: number) => {
    const newFlight = { flight, cabin, actualPrice }
    setSelectedFlights(prev => {
      console.log('Adding flight to cart:', flight.flightNumber, 'Price:', actualPrice)
      return [...prev, newFlight]
    })
  }

  const handleRemoveFlight = (index: number) => {
    setSelectedFlights(selectedFlights.filter((_, i) => i !== index))
  }

  const handleCompleteOrder = (paymentMethod: string) => {
    const totalAmount = selectedFlights.reduce((sum, item) => {
      return sum + item.actualPrice
    }, 0)

    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      items: selectedFlights,
      totalAmount,
      orderDate: new Date().toISOString(),
      paymentMethod,
      status: 'completed'
    }

    setOrders([newOrder, ...orders])
    setSelectedFlights([])
  }

  const handleDeleteOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId))
  }

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <Link to="/" className="logo-link">
              <h1 className="logo">欸米航空</h1>
              <p className="tagline">AMARS AIRLINES</p>
            </Link>
            <nav className="nav">
              <Link to="/" className="nav-link">搜尋航班</Link>
              <Link to="/cart" className="nav-link cart-link">
                購物車
                {selectedFlights.length > 0 && (
                  <span className="cart-badge">{selectedFlights.length}</span>
                )}
              </Link>
              <Link to="/orders" className="nav-link">訂單記錄</Link>
              <Link to="/map" className="nav-link">旅行地圖</Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage onSelectFlight={handleSelectFlight} />} />
          <Route path="/cart" element={<CartPage selectedFlights={selectedFlights} onRemoveFlight={handleRemoveFlight} />} />
          <Route path="/payment" element={<PaymentPage selectedFlights={selectedFlights} onCompleteOrder={handleCompleteOrder} />} />
          <Route path="/orders" element={<OrderHistoryPage orders={orders} onDeleteOrder={handleDeleteOrder} />} />
          <Route path="/map" element={<TravelMapPage orders={orders} />} />
        </Routes>

        <footer className="footer">
          <p>© 2025 欸米航空 AMARS Airways. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
