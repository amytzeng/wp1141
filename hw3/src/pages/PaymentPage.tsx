import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/PaymentPage.css'

interface SelectedFlight {
  flight: Flight
  cabin: CabinClass
}

interface PaymentPageProps {
  selectedFlights: SelectedFlight[]
  onCompleteOrder: (paymentMethod: string) => void
}

function PaymentPage({ selectedFlights, onCompleteOrder }: PaymentPageProps) {
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'transfer'>('credit')
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handlePayment = () => {
    setIsProcessing(true)
    
    // 模擬付款處理
    setTimeout(() => {
      setIsProcessing(false)
      
      const paymentMethodName = paymentMethod === 'credit' ? '信用卡' : 
                                paymentMethod === 'debit' ? '金融卡' : 'ATM轉帳'
      
      onCompleteOrder(paymentMethodName)
      alert('付款成功！\n您的訂單已確認，感謝您的訂購。\n可在「訂單記錄」查看詳情。')
      navigate('/orders')
    }, 2000)
  }

  if (selectedFlights.length === 0) {
    return (
      <main className="main-content">
        <div className="payment-container">
          <div className="empty-payment">
            <p>購物車是空的，無法進行付款</p>
            <button className="back-button" onClick={() => navigate('/')}>
              返回首頁
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="payment-container">
        <h2 className="payment-title">付款資訊</h2>
        
        <div className="payment-content">
          <div className="payment-form">
            <div className="form-section">
              <h3>選擇付款方式</h3>
              <div className="payment-methods">
                <label className={`payment-method ${paymentMethod === 'credit' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="credit"
                    checked={paymentMethod === 'credit'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  />
                  <div className="method-info">
                    <span className="method-icon">💳</span>
                    <span className="method-name">信用卡</span>
                  </div>
                </label>
                
                <label className={`payment-method ${paymentMethod === 'debit' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="debit"
                    checked={paymentMethod === 'debit'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  />
                  <div className="method-info">
                    <span className="method-icon">🏦</span>
                    <span className="method-name">金融卡</span>
                  </div>
                </label>
                
                <label className={`payment-method ${paymentMethod === 'transfer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                  />
                  <div className="method-info">
                    <span className="method-icon">🏧</span>
                    <span className="method-name">ATM 轉帳</span>
                  </div>
                </label>
              </div>
            </div>

            {paymentMethod === 'credit' && (
              <div className="form-section">
                <h3>信用卡資訊</h3>
                <div className="form-group">
                  <label>持卡人姓名</label>
                  <input type="text" placeholder="請輸入持卡人姓名" className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>卡號</label>
                  <input type="text" placeholder="1234 5678 9012 3456" className="form-input" maxLength={19} />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>有效期限</label>
                    <input type="text" placeholder="MM/YY" className="form-input" maxLength={5} />
                  </div>
                  
                  <div className="form-group">
                    <label>安全碼 (CVV)</label>
                    <input type="text" placeholder="123" className="form-input" maxLength={3} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>帳單地址</label>
                  <input type="text" placeholder="請輸入帳單地址" className="form-input" />
                </div>
              </div>
            )}

            {paymentMethod === 'debit' && (
              <div className="form-section">
                <h3>金融卡資訊</h3>
                <div className="form-group">
                  <label>持卡人姓名</label>
                  <input type="text" placeholder="請輸入持卡人姓名" className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>卡號</label>
                  <input type="text" placeholder="1234 5678 9012 3456" className="form-input" maxLength={19} />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>有效期限</label>
                    <input type="text" placeholder="MM/YY" className="form-input" maxLength={5} />
                  </div>
                  
                  <div className="form-group">
                    <label>安全碼 (CVV)</label>
                    <input type="text" placeholder="123" className="form-input" maxLength={3} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>帳單地址</label>
                  <input type="text" placeholder="請輸入帳單地址" className="form-input" />
                </div>
              </div>
            )}

            {paymentMethod === 'transfer' && (
              <div className="form-section">
                <h3>ATM 轉帳資訊</h3>
                <div className="atm-info-box">
                  <div className="info-item">
                    <span className="info-label">銀行代碼</span>
                    <span className="info-value">012</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">轉帳帳號</span>
                    <span className="info-value">1234-5678-9012-3456</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">戶名</span>
                    <span className="info-value">星程航空股份有限公司</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">轉帳金額</span>
                    <span className="info-value highlight">NT$ {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>轉帳後5碼</label>
                  <input type="text" placeholder="請輸入轉帳帳號後5碼" className="form-input" maxLength={5} />
                </div>
                
                <div className="form-group">
                  <label>轉帳日期</label>
                  <input type="text" className="form-input" placeholder="MM/YY" maxLength={5} />
                </div>
                
                <div className="notice-box">
                  <p>⚠️ 請於24小時內完成轉帳，逾期訂單將自動取消</p>
                  <p>💡 轉帳完成後，請填寫帳號後5碼以便核對</p>
                </div>
              </div>
            )}
          </div>

          <div className="order-summary">
            <h3>訂單摘要</h3>
            <div className="summary-items">
              {selectedFlights.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="item-info">
                    <div className="item-number">{item.flight.flightNumber}</div>
                    <div className="item-route">
                      {item.flight.departure} → {item.flight.destination}
                    </div>
                  </div>
                  <div className="item-price">
                    NT$ {getPrice(item.flight, item.cabin).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-total">
              <span>總金額</span>
              <span className="total-amount">NT$ {totalAmount.toLocaleString()}</span>
            </div>
            
            <button 
              className={`pay-button ${isProcessing ? 'processing' : ''}`}
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? '處理中...' : `確認付款 NT$ ${totalAmount.toLocaleString()}`}
            </button>
            
            <button className="cancel-button" onClick={() => navigate('/cart')}>
              返回購物車
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentPage

