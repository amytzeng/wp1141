import React, { useState, useMemo, useEffect } from 'react'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/FullCalendar.css'

interface FullCalendarProps {
  flights: Flight[]
  cabin: CabinClass
  selectedDate: string | null
  onDateSelect: (date: string) => void
  onConfirm: () => void
  tripType: 'roundtrip' | 'oneway' | 'multicity'
  departureDate?: string
  onDepartureDateSelect?: (date: string) => void
  departure?: string
  destination?: string
}

const FullCalendar: React.FC<FullCalendarProps> = ({
  flights,
  cabin,
  selectedDate,
  onDateSelect,
  onConfirm,
  tripType,
  departureDate,
  onDepartureDateSelect,
  departure,
  destination
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [rangeStart, setRangeStart] = useState<string | null>(departureDate || null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(() => {
    if (tripType === 'roundtrip' && selectedDate && selectedDate !== departureDate) {
      return selectedDate
    }
    return null
  })

  // 只在組件掛載時打印初始狀態
  useEffect(() => {
    console.log('🔵 FullCalendar 組件掛載')
    console.log('初始 departureDate prop:', departureDate)
    console.log('初始 selectedDate prop:', selectedDate)
    console.log('初始 rangeStart:', rangeStart)
    console.log('初始 rangeEnd:', rangeEnd)
  }, [])

  const getPriceForDate = (date: string) => {
    if (flights.length === 0) return 0
    
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
      return departureMatch && destinationMatch && dateMatch
    })
    
    if (dayFlights.length === 0) return 0
    
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
    return Math.min(...prices)
  }

  const formatPrice = (price: number) => {
    return `TWD ${price.toLocaleString()}`
  }

  // 格式化日期字符串，避免時區問題
  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getCalendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // 上个月的结尾日期
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i
      days.push({
        date: formatDateString(year, month, day),
        day,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    // 当前月的日期
    const today = new Date()
    const todayStr = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate())
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDateString(year, month + 1, day)
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date === todayStr
      })
    }
    
    // 下个月的开始日期
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: formatDateString(year, month + 2, day),
        day,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    return days
  }, [currentMonth])

  const isDateInRange = (date: string) => {
    if (!rangeStart || !rangeEnd) return false
    return date > rangeStart && date < rangeEnd
  }

  const isDateSelected = (date: string) => {
    return date === selectedDate || date === departureDate
  }

  const isDateRangeStart = (date: string) => {
    return date === rangeStart
  }

  const isDateRangeEnd = (date: string) => {
    return date === rangeEnd
  }

  const handleDateClick = (date: string) => {
    console.log('========== FullCalendar handleDateClick ==========')
    console.log('點擊的日期:', date)
    console.log('tripType:', tripType)
    console.log('當前 rangeStart:', rangeStart)
    console.log('當前 rangeEnd:', rangeEnd)
    console.log('傳入的 departureDate prop:', departureDate)
    
    if (tripType === 'roundtrip') {
      if (!rangeStart) {
        // 第一步：选择出发日
        console.log('✓ 執行：第一步選擇出發日')
        setRangeStart(date)
        onDepartureDateSelect?.(date)
      } else if (!rangeEnd && date >= rangeStart) {
        // 第二步：选择回程日（可以等於或晚於出發日）
        console.log('✓ 執行：第二步選擇回程日')
        setRangeEnd(date)
        onDateSelect(date)
      } else if (rangeEnd && date >= rangeStart) {
        // 重新選擇回程日（已經有回程日期，且新日期不早於出發日）
        console.log('✓ 執行：重新選擇回程日')
        setRangeEnd(date)
        onDateSelect(date)
      } else if (date < rangeStart) {
        // 重新選擇出發日（選擇的日期早於當前出發日）
        console.log('✓ 執行：重新選擇出發日')
        setRangeStart(date)
        setRangeEnd(null)
        onDepartureDateSelect?.(date)
      }
    } else {
      // 单程票或多個航段
      onDateSelect(date)
    }
    console.log('==================================================')
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="full-calendar">
      <div className="calendar-header">
        <div className="calendar-title">
          {tripType === 'roundtrip' ? (
            rangeStart ? '選擇回程日期' : '選擇出發日期'
          ) : (
            '選擇出發日期'
          )}
        </div>
        {tripType === 'roundtrip' && rangeStart && (
          <div className="selected-dates">
            出發日期 {new Date(rangeStart).toLocaleDateString('zh-TW')} 
            {rangeEnd && ` - 回程日期 ${new Date(rangeEnd).toLocaleDateString('zh-TW')}`}
          </div>
        )}
      </div>

      <div className="calendar-navigation">
        <button className="nav-button" onClick={handlePrevMonth}>
          ‹
        </button>
        <div className="month-year">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button className="nav-button" onClick={handleNextMonth}>
          ›
        </button>
      </div>

      <div className="calendar-grid">
        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="days-grid">
          {getCalendarDays.map((dayData, index) => {
            const price = getPriceForDate(dayData.date)
            const isInRange = isDateInRange(dayData.date)
            const isSelected = isDateSelected(dayData.date)
            const isStart = isDateRangeStart(dayData.date)
            const isEnd = isDateRangeEnd(dayData.date)
            const isWeekend = new Date(dayData.date).getDay() === 0 || new Date(dayData.date).getDay() === 6

            return (
              <div
                key={`${dayData.date}-${index}`}
                className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${
                  isSelected ? 'selected' : ''
                } ${isInRange ? 'in-range' : ''} ${
                  isStart ? 'range-start' : ''
                } ${isEnd ? 'range-end' : ''} ${
                  isWeekend ? 'weekend' : ''
                } ${dayData.isToday ? 'today' : ''}`}
                onClick={() => dayData.isCurrentMonth && handleDateClick(dayData.date)}
              >
                <div className="day-number">{dayData.day}</div>
                {dayData.isCurrentMonth && (
                  <div className="day-price">
                    {formatPrice(price)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {tripType === 'roundtrip' && !rangeStart && (
        <div className="calendar-hint">
          請先選擇出發日期，再選擇回程日期
        </div>
      )}
      {tripType === 'roundtrip' && rangeStart && !rangeEnd && (
        <div className="calendar-hint">
          請選擇回程日期（必須晚於出發日期）
        </div>
      )}
      
      {/* 確定按鈕 */}
      <div className="calendar-actions">
        <button 
          className="confirm-button"
          onClick={onConfirm}
          disabled={tripType === 'roundtrip' ? (!rangeStart || !rangeEnd) : !selectedDate}
        >
          確定
        </button>
      </div>
    </div>
  )
}

export default FullCalendar
