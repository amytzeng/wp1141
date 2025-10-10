import { useMemo } from 'react'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/PriceCalendar.css'

interface PriceCalendarProps {
  flights: Flight[]
  selectedDate: string
  cabin: CabinClass
  onDateSelect: (date: string) => void
  onDateChange: (direction: 'prev' | 'next') => void
}

function PriceCalendar({ flights, selectedDate, cabin, onDateSelect, onDateChange }: PriceCalendarProps) {
  const dateRange = useMemo(() => {
    if (!selectedDate) return []
    
    const dates = []
    const baseDate = new Date(selectedDate)
    
    // 前3天到後3天（共7天），類似星宇航空
    for (let i = -3; i <= 3; i++) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() + i)
      dates.push(date.toISOString().split('T')[0])
    }
    
    return dates
  }, [selectedDate])

  const getPriceForDate = (date: string) => {
    // 找出該日期的最低價格航班
    if (flights.length === 0) return 0
    
    // 取得該艙等的所有價格
    const prices = flights.map(flight => {
      switch (cabin) {
        case 'economy':
          return flight.price_economy
        case 'business':
          return flight.price_business
        case 'first':
          return flight.price_first
      }
    })
    
    // 找最低價
    const basePrice = Math.min(...prices)
    
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()
    
    // 週末價格較高
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1
    // 使用日期的天數作為變化因子（模擬不同日期的價格波動）
    const dayVariation = (dateObj.getDate() % 10) * 0.02
    
    return Math.round(basePrice * weekendMultiplier * (1 + dayVariation))
  }

  const formatPrice = (price: number) => {
    // 格式化为 TWD 14,446 的形式
    return `TWD ${price.toLocaleString()}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
    return { month, day, weekday }
  }

  if (!selectedDate || flights.length === 0) return null

  return (
    <div className="price-calendar">
      <div className="calendar-header">
        <span className="calendar-title">選擇出發日期</span>
      </div>
      
      <div className="calendar-controls">
        <button 
          className="calendar-nav-button prev"
          onClick={() => onDateChange('prev')}
          title="前七日"
        >
          前七日
        </button>
        
        <div className="calendar-dates">
          {dateRange.map(date => {
            const { month, day, weekday } = formatDate(date)
            const price = getPriceForDate(date)
            const isSelected = date === selectedDate
            const isWeekend = weekday === '日' || weekday === '六'
            
            return (
              <div
                key={date}
                className={`calendar-date ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''}`}
                onClick={() => onDateSelect(date)}
              >
                <div className="date-info">
                  <span className="date-month">{month}月{day}日</span>
                  <span className="date-weekday">週{weekday}</span>
                </div>
                <div className="date-price">
                  {formatPrice(price)}
                </div>
                {isSelected && <div className="selected-indicator"></div>}
              </div>
            )
          })}
        </div>
        
        <button 
          className="calendar-nav-button next"
          onClick={() => onDateChange('next')}
          title="後七日"
        >
          後七日
        </button>
      </div>
    </div>
  )
}

export default PriceCalendar

