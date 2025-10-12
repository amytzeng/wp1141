import { useState, useEffect } from 'react'
import { SearchParams, CabinClass, TripType, MultiCityLeg } from '../types/Flight'
import AirportSelector from './AirportSelector'
import '../styles/SearchForm.css'
import '../styles/FullCalendar.css'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [tripType, setTripType] = useState<TripType>('roundtrip')
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0])
  const [returnDate, setReturnDate] = useState('')
  const [showDepartureCalendar, setShowDepartureCalendar] = useState(false)
  const [showReturnCalendar, setShowReturnCalendar] = useState(false)
  const [showMultiCityCalendars, setShowMultiCityCalendars] = useState<boolean[]>([])
  const [showDepartureSelector, setShowDepartureSelector] = useState(false)
  const [showDestinationSelector, setShowDestinationSelector] = useState(false)
  const [currentLegIndex, setCurrentLegIndex] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [returnCurrentMonth, setReturnCurrentMonth] = useState(new Date())
  const [multiCityMonths, setMultiCityMonths] = useState<Date[]>([])
  const [cabin, setCabin] = useState<CabinClass>('economy')
  const [multiCityLegs, setMultiCityLegs] = useState<MultiCityLeg[]>([
    { departure: '', destination: '', date: '' },
    { departure: '', destination: '', date: '' }
  ])



  // 格式化日期字符串，避免時區問題
  const formatDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }


  const handleAddLeg = () => {
    if (multiCityLegs.length < 4) {
      setMultiCityLegs([...multiCityLegs, { departure: '', destination: '', date: '' }])
      setShowMultiCityCalendars([...showMultiCityCalendars, false])
      setMultiCityMonths([...multiCityMonths, new Date()])
    }
  }

  const handleRemoveLeg = (index: number) => {
    if (multiCityLegs.length > 2) {
      setMultiCityLegs(multiCityLegs.filter((_, i) => i !== index))
      setShowMultiCityCalendars(showMultiCityCalendars.filter((_, i) => i !== index))
      setMultiCityMonths(multiCityMonths.filter((_, i) => i !== index))
    }
  }


  const handleAirportSelect = (airport: string, type: 'departure' | 'destination') => {
    if (tripType === 'multicity') {
      // 多程票處理
      const newLegs = [...multiCityLegs]
      if (type === 'departure') {
        newLegs[currentLegIndex].departure = airport
      } else {
        newLegs[currentLegIndex].destination = airport
      }
      setMultiCityLegs(newLegs)
      setShowDepartureSelector(false)
      setShowDestinationSelector(false)
    } else {
      // 單程、來回票處理
      if (type === 'departure') {
        setDeparture(airport)
        setShowDepartureSelector(false)
      } else {
        setDestination(airport)
        setShowDestinationSelector(false)
      }
    }
  }

  // 日曆相關函數
  const getCalendarDays = (month: Date) => {
    const year = month.getFullYear()
    const monthIndex = month.getMonth()
    
    const firstDay = new Date(year, monthIndex, 1)
    const lastDay = new Date(year, monthIndex + 1, 0)
    const firstDayOfWeek = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    
    const days = []
    
    // 上个月的结尾日期
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
    
    // 当前月的日期
    const today = new Date()
    const todayStr = formatDateString(today.getFullYear(), today.getMonth() + 1, today.getDate())
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDateString(year, monthIndex + 1, day)
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date === todayStr
      })
    }
    
    // 下个月的开始日期
    const nextMonthDate = new Date(year, monthIndex + 1, 1)
    const nextMonthYear = nextMonthDate.getFullYear()
    const nextMonth = nextMonthDate.getMonth() + 1
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: formatDateString(nextMonthYear, nextMonth, day),
        day,
        isCurrentMonth: false,
        isToday: false
      })
    }
    
    return days
  }

  const handleDateSelect = (date: string, type: 'departure' | 'return' | 'multicity', index?: number) => {
    if (type === 'departure') {
      setDepartureDate(date)
      setShowDepartureCalendar(false)
      // 如果是來回票且回程日期早於出發日期，清空回程日期
      if (tripType === 'roundtrip' && returnDate && date >= returnDate) {
        setReturnDate('')
      }
    } else if (type === 'return') {
      setReturnDate(date)
      setShowReturnCalendar(false)
    } else if (type === 'multicity' && index !== undefined) {
      const newLegs = [...multiCityLegs]
      newLegs[index].date = date
      setMultiCityLegs(newLegs)
      
      const newCalendars = [...showMultiCityCalendars]
      newCalendars[index] = false
      setShowMultiCityCalendars(newCalendars)
    }
  }

  const handlePrevMonth = (type: 'departure' | 'return' | 'multicity', index?: number) => {
    if (type === 'departure') {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    } else if (type === 'return') {
      setReturnCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    } else if (type === 'multicity' && index !== undefined) {
      const newMonths = [...multiCityMonths]
      newMonths[index] = new Date(newMonths[index].getFullYear(), newMonths[index].getMonth() - 1, 1)
      setMultiCityMonths(newMonths)
    }
  }

  const handleNextMonth = (type: 'departure' | 'return' | 'multicity', index?: number) => {
    if (type === 'departure') {
      setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    } else if (type === 'return') {
      setReturnCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    } else if (type === 'multicity' && index !== undefined) {
      const newMonths = [...multiCityMonths]
      newMonths[index] = new Date(newMonths[index].getFullYear(), newMonths[index].getMonth() + 1, 1)
      setMultiCityMonths(newMonths)
    }
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  // 初始化多程日曆狀態
  useEffect(() => {
    setShowMultiCityCalendars(new Array(multiCityLegs.length).fill(false))
    setMultiCityMonths(new Array(multiCityLegs.length).fill(new Date()))
  }, [multiCityLegs.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (tripType === 'multicity') {
      // 验证多程航班
      for (const leg of multiCityLegs) {
        if (!leg.departure || !leg.destination || !leg.date) {
          alert('請填寫所有行程的資訊')
          return
        }
        if (leg.departure === leg.destination) {
          alert('出發地和目的地不能相同')
          return
        }
      }
      onSearch({ 
        tripType,
        departure: '',
        destination: '',
        date: '',
        cabin,
        multiCityLegs
      })
    } else {
      if (departure === destination) {
        alert('出發地和目的地不能相同')
        return
      }
      console.log('========== SearchForm - 提交搜尋 ==========')
      console.log('票種:', tripType)
      console.log('出發地:', departure)
      console.log('目的地:', destination)
      console.log('出發日期 (state):', departureDate)
      console.log('回程日期 (state):', returnDate)
      console.log('艙等:', cabin)
      console.log('==========================================')
      
      const searchData = { 
        tripType,
        departure, 
        destination, 
        date: departureDate, 
        cabin,
        returnDate: tripType === 'roundtrip' ? returnDate : undefined
      }
      
      console.log('✓ 實際傳送的資料:', searchData)
      console.log('✓ returnDate 會傳送嗎?', tripType === 'roundtrip' ? '是 (' + returnDate + ')' : '否 (單程)')
      console.log('==========================================')
      
      onSearch(searchData)
    }
  }

  const handleSwap = () => {
    const temp = departure
    setDeparture(destination)
    setDestination(temp)
  }

  return (
    <div className="search-form-container">
      <h2 className="search-title">預訂您的航班</h2>
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="trip-type-selector">
          <label className={`trip-type-option ${tripType === 'roundtrip' ? 'active' : ''}`}>
            <input
              type="radio"
              name="tripType"
              value="roundtrip"
              checked={tripType === 'roundtrip'}
              onChange={(e) => setTripType(e.target.value as TripType)}
            />
            <span>來回</span>
          </label>
          <label className={`trip-type-option ${tripType === 'oneway' ? 'active' : ''}`}>
            <input
              type="radio"
              name="tripType"
              value="oneway"
              checked={tripType === 'oneway'}
              onChange={(e) => setTripType(e.target.value as TripType)}
            />
            <span>單程</span>
          </label>
          <label className={`trip-type-option ${tripType === 'multicity' ? 'active' : ''}`}>
            <input
              type="radio"
              name="tripType"
              value="multicity"
              checked={tripType === 'multicity'}
              onChange={(e) => setTripType(e.target.value as TripType)}
            />
            <span>多程</span>
          </label>
        </div>
        {tripType === 'multicity' ? (
          <div className="multicity-container">
            {multiCityLegs.map((leg, index) => (
              <div key={index} className="multicity-leg">
                <div className="leg-header">
                  <span className="leg-number">行程 {index + 1}</span>
                  {multiCityLegs.length > 2 && (
                    <button
                      type="button"
                      className="remove-leg-button"
                      onClick={() => handleRemoveLeg(index)}
                    >
                      移除
                    </button>
                  )}
                </div>
                <div className="leg-fields">
                  <div className="form-group">
                    <label>出發地</label>
                    <button
                      type="button"
                      className="city-select-button"
                      onClick={() => {
                        setShowDepartureSelector(true)
                        setCurrentLegIndex(index)
                      }}
                    >
                      {leg.departure || '選擇出發地'}
                    </button>
                  </div>
                  <div className="form-group">
                    <label>目的地</label>
                    <button
                      type="button"
                      className="city-select-button"
                      onClick={() => {
                        setShowDestinationSelector(true)
                        setCurrentLegIndex(index)
                      }}
                    >
                      {leg.destination || '選擇目的地'}
                    </button>
                  </div>
                  <div className="form-group">
                    <label>日期</label>
                    <div className="date-input-wrapper">
                      <input
                        type="text"
                        value={leg.date ? new Date(leg.date).toLocaleDateString('zh-TW') : ''}
                        readOnly
                        placeholder="選擇日期"
                        onClick={() => {
                          const newCalendars = [...showMultiCityCalendars]
                          newCalendars[index] = true
                          setShowMultiCityCalendars(newCalendars)
                        }}
                        className="date-display-input"
                      />
                      <button
                        type="button"
                        className="calendar-icon-button"
                        onClick={() => {
                          const newCalendars = [...showMultiCityCalendars]
                          newCalendars[index] = true
                          setShowMultiCityCalendars(newCalendars)
                        }}
                      >
                        📅
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {multiCityLegs.length < 4 && (
              <button type="button" className="add-leg-button" onClick={handleAddLeg}>
                + 新增行程
              </button>
            )}
            <div className="form-group cabin-selector">
              <label htmlFor="cabin">艙等</label>
              <select
                id="cabin"
                value={cabin}
                onChange={(e) => setCabin(e.target.value as CabinClass)}
                className="form-select"
              >
                <option value="economy">經濟艙</option>
                <option value="business">商務艙</option>
                <option value="first">頭等艙</option>
              </select>
            </div>
          </div>
        ) : (
          <>
            <div className="form-row cities-row">
              <div className="form-group">
                <label htmlFor="departure">出發地</label>
                <button 
                  type="button"
                  className="city-select-button"
                  onClick={() => setShowDepartureSelector(true)}
                >
                  {departure || '請選擇出發地'}
                </button>
              </div>

              <button 
                type="button" 
                className="swap-button"
                onClick={handleSwap}
                title="交換出發地和目的地"
              >
                ⇄
              </button>

              <div className="form-group">
                <label htmlFor="destination">目的地</label>
                <button 
                  type="button"
                  className="city-select-button"
                  onClick={() => setShowDestinationSelector(true)}
                >
                  {destination || '請選擇目的地'}
                </button>
              </div>
            </div>

            <div className="form-row dates-row">
              <div className="form-group">
                <label htmlFor="departureDate">出發日期</label>
                <div className="date-input-wrapper">
                  <input
                    type="text"
                    id="departureDate"
                    value={departureDate ? new Date(departureDate).toLocaleDateString('zh-TW') : ''}
                    readOnly
                    placeholder="選擇出發日期"
                    onClick={() => setShowDepartureCalendar(true)}
                    className="date-display-input"
                  />
                  <button
                    type="button"
                    className="calendar-icon-button"
                    onClick={() => setShowDepartureCalendar(true)}
                  >
                    📅
                  </button>
                </div>
              </div>

              {tripType === 'roundtrip' && (
                <div className="form-group">
                  <label htmlFor="returnDate">回程日期</label>
                  <div className="date-input-wrapper">
                    <input
                      type="text"
                      id="returnDate"
                      value={returnDate ? new Date(returnDate).toLocaleDateString('zh-TW') : ''}
                      readOnly
                      placeholder="選擇回程日期"
                      onClick={() => setShowReturnCalendar(true)}
                      className="date-display-input"
                    />
                    <button
                      type="button"
                      className="calendar-icon-button"
                      onClick={() => setShowReturnCalendar(true)}
                    >
                      📅
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="cabin">艙等</label>
                <select
                  id="cabin"
                  value={cabin}
                  onChange={(e) => setCabin(e.target.value as CabinClass)}
                  className="form-select"
                >
                  <option value="economy">經濟艙</option>
                  <option value="business">商務艙</option>
                  <option value="first">頭等艙</option>
                </select>
              </div>
            </div>
          </>
        )}

        <button type="submit" className="search-button">
          搜尋航班
        </button>
      </form>

      {/* 出發日期日曆 */}
      {showDepartureCalendar && (
        <div className="calendar-modal">
          <div className="calendar-overlay" onClick={() => setShowDepartureCalendar(false)}></div>
          <div className="calendar-container">
            <div className="full-calendar">
              <div className="calendar-header">
                <div className="calendar-title">選擇出發日期</div>
              </div>

              <div className="calendar-navigation">
                <button className="nav-button" onClick={() => handlePrevMonth('departure')}>
                  ‹
                </button>
                <div className="month-year">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button className="nav-button" onClick={() => handleNextMonth('departure')}>
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
                  {getCalendarDays(currentMonth).map((dayData, index) => {
                    const isSelected = dayData.date === departureDate
                    const isWeekend = new Date(dayData.date).getDay() === 0 || new Date(dayData.date).getDay() === 6
                    const isPast = dayData.date < new Date().toISOString().split('T')[0]

                    return (
                      <div
                        key={`${dayData.date}-${index}`}
                        className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${
                          isSelected ? 'selected' : ''
                        } ${isWeekend ? 'weekend' : ''} ${
                          dayData.isToday ? 'today' : ''
                        } ${isPast ? 'past-date' : ''}`}
                        onClick={() => dayData.isCurrentMonth && !isPast && handleDateSelect(dayData.date, 'departure')}
                      >
                        <div className="day-number">{dayData.day}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 回程日期日曆 */}
      {showReturnCalendar && (
        <div className="calendar-modal">
          <div className="calendar-overlay" onClick={() => setShowReturnCalendar(false)}></div>
          <div className="calendar-container">
            <div className="full-calendar">
              <div className="calendar-header">
                <div className="calendar-title">選擇回程日期</div>
              </div>

              <div className="calendar-navigation">
                <button className="nav-button" onClick={() => handlePrevMonth('return')}>
                  ‹
                </button>
                <div className="month-year">
                  {monthNames[returnCurrentMonth.getMonth()]} {returnCurrentMonth.getFullYear()}
                </div>
                <button className="nav-button" onClick={() => handleNextMonth('return')}>
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
                  {getCalendarDays(returnCurrentMonth).map((dayData, index) => {
                    const isSelected = dayData.date === returnDate
                    const isWeekend = new Date(dayData.date).getDay() === 0 || new Date(dayData.date).getDay() === 6
                    const isPast = dayData.date < departureDate

                    return (
                      <div
                        key={`${dayData.date}-${index}`}
                        className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${
                          isSelected ? 'selected' : ''
                        } ${isWeekend ? 'weekend' : ''} ${
                          dayData.isToday ? 'today' : ''
                        } ${isPast ? 'past-date' : ''}`}
                        onClick={() => dayData.isCurrentMonth && !isPast && handleDateSelect(dayData.date, 'return')}
                      >
                        <div className="day-number">{dayData.day}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 多程日曆 */}
      {showMultiCityCalendars.map((showCalendar, index) => showCalendar && (
        <div key={`multicity-calendar-${index}`} className="calendar-modal">
          <div className="calendar-overlay" onClick={() => {
            const newCalendars = [...showMultiCityCalendars]
            newCalendars[index] = false
            setShowMultiCityCalendars(newCalendars)
          }}></div>
          <div className="calendar-container">
            <div className="full-calendar">
              <div className="calendar-header">
                <div className="calendar-title">選擇第 {index + 1} 程日期</div>
              </div>

              <div className="calendar-navigation">
                <button className="nav-button" onClick={() => handlePrevMonth('multicity', index)}>
                  ‹
                </button>
                <div className="month-year">
                  {monthNames[multiCityMonths[index]?.getMonth()]} {multiCityMonths[index]?.getFullYear()}
                </div>
                <button className="nav-button" onClick={() => handleNextMonth('multicity', index)}>
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
                  {getCalendarDays(multiCityMonths[index] || new Date()).map((dayData, dayIndex) => {
                    const isSelected = dayData.date === multiCityLegs[index]?.date
                    const isWeekend = new Date(dayData.date).getDay() === 0 || new Date(dayData.date).getDay() === 6
                    const minDate = index === 0 ? new Date().toISOString().split('T')[0] : multiCityLegs[index - 1]?.date || new Date().toISOString().split('T')[0]
                    const isPast = dayData.date < minDate

                    return (
                      <div
                        key={`${dayData.date}-${dayIndex}`}
                        className={`calendar-day ${!dayData.isCurrentMonth ? 'other-month' : ''} ${
                          isSelected ? 'selected' : ''
                        } ${isWeekend ? 'weekend' : ''} ${
                          dayData.isToday ? 'today' : ''
                        } ${isPast ? 'past-date' : ''}`}
                        onClick={() => dayData.isCurrentMonth && !isPast && handleDateSelect(dayData.date, 'multicity', index)}
                      >
                        <div className="day-number">{dayData.day}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* 機場選擇器彈窗 */}
      {showDepartureSelector && (
        <AirportSelector
          title="請選擇出發地"
          selectedAirport={tripType === 'multicity' ? multiCityLegs[currentLegIndex]?.departure || '' : departure}
          onSelect={(airport) => handleAirportSelect(airport, 'departure')}
          onClose={() => setShowDepartureSelector(false)}
          excludeAirport={tripType === 'multicity' ? multiCityLegs[currentLegIndex]?.destination || '' : destination}
        />
      )}
      
      {showDestinationSelector && (
        <AirportSelector
          title="請選擇目的地"
          selectedAirport={tripType === 'multicity' ? multiCityLegs[currentLegIndex]?.destination || '' : destination}
          onSelect={(airport) => handleAirportSelect(airport, 'destination')}
          onClose={() => setShowDestinationSelector(false)}
          excludeAirport={tripType === 'multicity' ? multiCityLegs[currentLegIndex]?.departure || '' : departure}
        />
      )}
    </div>
  )
}

export default SearchForm

