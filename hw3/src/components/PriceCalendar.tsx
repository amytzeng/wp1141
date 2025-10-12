import { useMemo } from 'react'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/PriceCalendar.css'

interface PriceCalendarProps {
  flights: Flight[]
  selectedDate: string
  cabin: CabinClass
  departure?: string
  destination?: string
  onDateSelect: (date: string) => void
  onDateChange: (direction: 'prev' | 'next') => void
}

function PriceCalendar({ flights, selectedDate, cabin, departure, destination, onDateSelect, onDateChange }: PriceCalendarProps) {
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

  const getPriceForDate = (date: string): number | null => {
    // 找出該日期且符合路線的航班
    const dayFlights = flights.filter(flight => {
      let departureMatch = true
      let destinationMatch = true
      
      if (departure) {
        // 從 "台北 TPE" 中提取 "TPE"
        const departureCode = departure.split(' ')[1] || departure
        departureMatch = flight.departure.includes(departureCode)
      }
      
      if (destination) {
        // 從 "東京 NRT" 中提取 "NRT"
        const destinationCode = destination.split(' ')[1] || destination
        destinationMatch = flight.destination.includes(destinationCode)
      }
      
      const dateMatch = flight.departureDate === date
      
      console.log(`航班檢查: ${flight.flightNumber}, 出發地=${flight.departure}, 目的地=${flight.destination}, 日期=${flight.departureDate}`)
      console.log(`匹配結果: 出發地=${departureMatch}, 目的地=${destinationMatch}, 日期=${dateMatch}`)
      
      return departureMatch && destinationMatch && dateMatch
    })
    
    console.log(`檢查日期 ${date} 的航班:`, dayFlights.length, '個航班')
    console.log(`路線條件: 出發地=${departure}, 目的地=${destination}`)
    
    if (dayFlights.length === 0) return null // 沒航班
    
    // 取得該艙等的所有價格
    const prices = dayFlights.map(flight => {
      switch (cabin) {
        case 'economy':
          return flight.price_economy
        case 'business':
          return flight.price_business
        case 'first':
          return flight.price_first
        default:
          return 0
      }
    })
    
    // 回傳最低價格
    const minPrice = Math.min(...prices)
    console.log(`日期 ${date} 最低價格:`, minPrice)
    return minPrice
  }

  const hasFlightsForDate = (date: string): boolean => {
    return flights.some(flight => {
      let departureMatch = true
      let destinationMatch = true
      
      if (departure) {
        const departureCode = departure.split(' ')[1] || departure
        departureMatch = flight.departure.includes(departureCode)
      }
      
      if (destination) {
        const destinationCode = destination.split(' ')[1] || destination
        destinationMatch = flight.destination.includes(destinationCode)
      }
      
      const dateMatch = flight.departureDate === date
      return departureMatch && destinationMatch && dateMatch
    })
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

  console.log('PriceCalendar 檢查:', { selectedDate, flightsCount: flights.length, cabin, departure, destination })
  console.log('PriceCalendar 航班資料:', flights.slice(0, 3))
  
  if (!selectedDate) {
    console.log('PriceCalendar: selectedDate 為空，不渲染')
    return null
  }
  
  console.log('PriceCalendar 開始渲染')

  return (
    <div className="price-calendar">
      <div className="calendar-header">
        <span className="calendar-title">去程: {departure || '台北'} - {destination || '東京'}</span>
        <button className="view-full-month">+ 查看整月份票價</button>
      </div>
      
      <div className="calendar-controls">
        <button 
          className="calendar-nav-button prev"
          onClick={() => {
            console.log('點擊前七日按鈕')
            onDateChange('prev')
          }}
          title="前七日"
          style={{ cursor: 'pointer' }}
        >
          &lt; 前七日
        </button>
        
        <div className="calendar-dates">
          {dateRange.map(date => {
            const { month, day, weekday } = formatDate(date)
            const price = getPriceForDate(date)
            const hasFlights = hasFlightsForDate(date)
            const isSelected = date === selectedDate
            const isWeekend = weekday === '日' || weekday === '六'
            
            return (
              <div
                key={date}
                className={`calendar-date ${isSelected ? 'selected' : ''} ${isWeekend ? 'weekend' : ''} ${!hasFlights ? 'no-flights' : ''}`}
                onClick={() => {
                  console.log(`點擊日期按鈕: ${date}, 有航班: ${hasFlights}`)
                  if (hasFlights) {
                    onDateSelect(date)
                  }
                }}
                style={{ 
                  cursor: hasFlights ? 'pointer' : 'not-allowed', 
                  opacity: hasFlights ? 1 : 0.5,
                  pointerEvents: hasFlights ? 'auto' : 'none'
                }}
              >
                <div className="date-info">
                  <span className="date-month">{month}月{day}日</span>
                  <span className="date-weekday">週{weekday}</span>
                </div>
                <div className="date-price">
                  {hasFlights ? formatPrice(price!) : '該日沒有航班'}
                </div>
                {isSelected && <div className="selected-indicator"></div>}
              </div>
            )
          })}
        </div>
        
        <button 
          className="calendar-nav-button next"
          onClick={() => {
            console.log('點擊後七日按鈕')
            onDateChange('next')
          }}
          title="後七日"
          style={{ cursor: 'pointer' }}
        >
          後七日 &gt;
        </button>
      </div>
    </div>
  )
}

export default PriceCalendar