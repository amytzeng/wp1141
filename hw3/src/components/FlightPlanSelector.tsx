import React from 'react'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/FlightPlanSelector.css'

interface FlightPlanSelectorProps {
  flight: Flight
  cabin: CabinClass
  onSelect: (plan: 'value' | 'basic' | 'full') => void
  onClose: () => void
  isFree?: boolean
}

interface PlanDetails {
  name: string
  priceModifier: number
  seatSelection: string
  baggage: string
  mileage: string
  changeFee: string
  refundFee: string
}

const FlightPlanSelector: React.FC<FlightPlanSelectorProps> = ({
  flight,
  cabin,
  onSelect,
  onClose,
  isFree = false
}) => {
  const getBasePrice = (cabin: CabinClass): number => {
    switch (cabin) {
      case 'economy':
        return flight.price_economy
      case 'business':
        return flight.price_business
      case 'first':
        return flight.price_first
      default:
        return flight.price_economy
    }
  }

  const basePrice = getBasePrice(cabin)

  const plans: Record<'value' | 'basic' | 'full', PlanDetails> = {
    value: {
      name: '超值',
      priceModifier: 0,
      seatSelection: '無',
      baggage: '無',
      mileage: '0',
      changeFee: '無法改票',
      refundFee: '無法退票'
    },
    basic: {
      name: '基本',
      priceModifier: 300,
      seatSelection: '無',
      baggage: '一件免費',
      mileage: '50%',
      changeFee: 'NTD 6,000',
      refundFee: 'NTD 9,000'
    },
    full: {
      name: '全額',
      priceModifier: 1000,
      seatSelection: '有',
      baggage: '兩件免費',
      mileage: '200%',
      changeFee: '0',
      refundFee: '0'
    }
  }

  const getCabinDisplay = (cabin: CabinClass): string => {
    switch (cabin) {
      case 'economy':
        return '經濟艙'
      case 'business':
        return '商務艙'
      case 'first':
        return '頭等艙'
      default:
        return '經濟艙'
    }
  }

  const formatTime = (timeStr: string): string => {
    return timeStr.replace('+1', ' (+1)')
  }

  return (
    <div className="flight-plan-modal">
      <div className="flight-plan-overlay" onClick={onClose}></div>
      <div className="flight-plan-container">
        <div className="flight-plan-header">
          <h3>選擇航班方案</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="flight-info">
          <div className="route-info">
            <span className="departure">{flight.departure}</span>
            <span className="arrow">→</span>
            <span className="destination">{flight.destination}</span>
          </div>
          <div className="flight-details">
            <span className="flight-number">{flight.flightNumber}</span>
            <span className="date">{flight.departureDate}</span>
            <span className="time">
              {flight.departureTime} - {formatTime(flight.arrivalTime)}
            </span>
            <span className="duration">{flight.duration}</span>
          </div>
          <div className="cabin-class">
            {getCabinDisplay(cabin)}
          </div>
        </div>

        <div className="plans-container">
          {Object.entries(plans).map(([key, plan]) => (
            <div key={key} className={`plan-card ${key}`}>
              <div className="plan-header">
                <h4 className="plan-name">{plan.name}</h4>
                <div className="plan-price">
                  <span className="price-label">價格</span>
                  {isFree ? (
                    <span className="price-value free-plan-price">
                      🎉 免費
                      <span className="original-plan-price">
                        NT$ {(basePrice + plan.priceModifier).toLocaleString()}
                      </span>
                    </span>
                  ) : (
                    <span className="price-value">
                      NT$ {(basePrice + plan.priceModifier).toLocaleString()}
                      {plan.priceModifier > 0 && (
                        <span className="price-modifier"> (+{plan.priceModifier})</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="plan-details">
                <div className="detail-item">
                  <span className="detail-label">艙等</span>
                  <span className="detail-value">{getCabinDisplay(cabin)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">預選座位</span>
                  <span className="detail-value">{plan.seatSelection}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">託運行李</span>
                  <span className="detail-value">{plan.baggage}</span>
                  {plan.baggage !== '無' && (
                    <span className="baggage-note">每件23公斤(50磅)</span>
                  )}
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">累積哩程</span>
                  <span className="detail-value">{plan.mileage}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">改票手續費（每次）</span>
                  <span className="detail-value">{plan.changeFee}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">退票手續費</span>
                  <span className="detail-value">{plan.refundFee}</span>
                </div>
              </div>

              <button 
                className={`select-button ${key}`}
                onClick={() => onSelect(key as 'value' | 'basic' | 'full')}
              >
                選擇
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlightPlanSelector
