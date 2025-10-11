import React, { useState, useMemo } from 'react'
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
}

const FullCalendar: React.FC<FullCalendarProps> = ({
  flights,
  cabin,
  selectedDate,
  onDateSelect,
  onConfirm,
  tripType,
  departureDate,
  onDepartureDateSelect
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(null)

  const getPriceForDate = (date: string) => {
    if (flights.length === 0) return 0
    
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
    
    const basePrice = Math.min(...prices)
    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay()
    
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.15 : 1
    const dayVariation = (dateObj.getDate() % 10) * 0.02
    
    return Math.round(basePrice * weekendMultiplier * (1 + dayVariation))
  }

  const formatPrice = (price: number) => {
    return `TWD ${price.toLocaleString()}`
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
        date: new Date(year, month - 1, day).toISOString().split('T')[0],
        day,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    // 当前月的日期
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toISOString().split('T')[0]
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date === today.toISOString().split('T')[0]
      })
    }
    
    // 下个月的开始日期
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day).toISOString().split('T')[0],
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
    if (tripType === 'roundtrip') {
      if (!rangeStart) {
        // 第一步：选择出发日
        setRangeStart(date)
        onDepartureDateSelect?.(date)
      } else if (!rangeEnd && date > rangeStart) {
        // 第二步：选择回程日（必须晚于出发日）
        setRangeEnd(date)
        onDateSelect(date)
      } else if (date <= rangeStart) {
        // 重新选择出发日
        setRangeStart(date)
        setRangeEnd(null)
        onDepartureDateSelect?.(date)
      }
    } else {
      // 单程票或多程票
      onDateSelect(date)
    }
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
