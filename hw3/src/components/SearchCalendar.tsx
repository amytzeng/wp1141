import React, { useState, useMemo } from 'react'
import { Flight, CabinClass } from '../types/Flight'
import '../styles/FullCalendar.css'

interface SearchCalendarProps {
  flights: Flight[]
  cabin: CabinClass
  tripType: 'roundtrip' | 'oneway'
  departure?: string
  destination?: string
  onDateSelect: (departureDate: string, returnDate?: string) => void
  onClose: () => void
  initialDepartureDate?: string
  initialReturnDate?: string
}

const SearchCalendar: React.FC<SearchCalendarProps> = ({
  flights,
  cabin,
  tripType,
  departure,
  destination,
  onDateSelect,
  onClose,
  initialDepartureDate,
  initialReturnDate
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [rangeStart, setRangeStart] = useState<string | null>(initialDepartureDate || null)
  const [rangeEnd, setRangeEnd] = useState<string | null>(initialReturnDate || null)

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']


  // 生成日曆天數
  const getCalendarDays = (month: Date) => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // 上個月的結尾日期
    const prevMonthDate = new Date(year, monthIndex - 1, 0)
    const prevMonthYear = prevMonthDate.getFullYear()
    const prevMonth = prevMonthDate.getMonth() + 1
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDate.getDate() - i
      days.push({
        date: formatDateString(prevMonthYear, prevMonth, day),
        day,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    // 當月的日期
    const today = new Date().toISOString().split('T')[0]
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDateString(year, monthIndex + 1, day)
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date === today
      })
    }
    
    // 下個月的開始日期
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = formatDateString(year, monthIndex + 2, day)
      days.push({
        date,
        day,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    return days
  }

  // 格式化日期字符串
  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // 檢查日期是否在範圍內
  const isDateInRange = (date: string) => {
    if (!rangeStart || !rangeEnd) return false
    return date > rangeStart && date < rangeEnd
  }

  // 檢查日期是否被選中
  const isDateSelected = (date: string) => {
    return date === rangeStart || date === rangeEnd
  }

  // 檢查是否為範圍開始日期
  const isDateRangeStart = (date: string) => {
    return date === rangeStart
  }

  // 檢查是否為範圍結束日期
  const isDateRangeEnd = (date: string) => {
    return date === rangeEnd
  }

  // 處理日期點擊
  const handleDateClick = (date: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (date < today) return

    // 單程票：只選擇一個日期
    if (tripType === 'oneway') {
      setRangeStart(date)
      setRangeEnd(null)
      return
    }

    // 來回票：選擇日期範圍
    // 如果已經有完整的範圍選擇，點擊新日期會重新開始選擇
    if (rangeStart && rangeEnd) {
      setRangeStart(date)
      setRangeEnd(null)
      return
    }

    // 如果沒有開始日期，設置為開始日期
    if (!rangeStart) {
      setRangeStart(date)
      return
    }

    // 如果已有開始日期但沒有結束日期
    if (rangeStart && !rangeEnd) {
      // 如果點擊的是開始日期，取消選擇
      if (date === rangeStart) {
        setRangeStart(null)
        return
      }
      
      // 如果點擊的日期早於開始日期，重新設置開始日期
      if (date < rangeStart) {
        setRangeStart(date)
        return
      }
      
      // 設置結束日期
      setRangeEnd(date)
      return
    }
  }

  // 處理月份切換
  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  // 確認選擇
  const handleConfirm = () => {
    if (rangeStart) {
      if (tripType === 'roundtrip' && rangeEnd) {
        onDateSelect(rangeStart, rangeEnd)
      } else {
        onDateSelect(rangeStart)
      }
    }
    onClose()
  }

  // 取消選擇
  const handleCancel = () => {
    onClose()
  }

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth])

  return (
    <div className="calendar-modal">
      <div className="calendar-overlay" onClick={handleCancel}></div>
      <div className="calendar-container">
        <div className="full-calendar">
          <div className="calendar-header">
            <div className="calendar-title">
              {tripType === 'roundtrip' ? '選擇來回日期' : '選擇出發日期'}
            </div>
            <button className="calendar-close" onClick={onClose}>
              ✕
            </button>
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
              {calendarDays.map((dayData, index) => {
                const isInRange = isDateInRange(dayData.date)
                const isSelected = isDateSelected(dayData.date)
                const isStart = isDateRangeStart(dayData.date)
                const isEnd = isDateRangeEnd(dayData.date)
                const isWeekend = new Date(dayData.date).getDay() === 0 || new Date(dayData.date).getDay() === 6
                const isPast = dayData.date < new Date().toISOString().split('T')[0]

                return (
                  <div
                    key={`${dayData.date}-${index}`}
                    className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${
                      isSelected ? 'selected' : ''
                    } ${isInRange ? 'in-range' : ''} ${
                      isStart ? 'range-start' : ''
                    } ${isEnd ? 'range-end' : ''} ${
                      isWeekend ? 'weekend' : ''
                    } ${dayData.isToday ? 'today' : ''} ${isPast ? 'past-date' : ''}`}
                    onClick={() => dayData.isCurrentMonth && !isPast && handleDateClick(dayData.date)}
                  >
                    <div className="day-number">{dayData.day}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="calendar-actions">
            <button 
              className="calendar-button confirm-large" 
              onClick={handleConfirm}
              disabled={!rangeStart || (tripType === 'roundtrip' && !rangeEnd)}
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchCalendar
