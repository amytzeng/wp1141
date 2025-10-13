import { useState, useEffect } from 'react'
import { SearchParams, CabinClass, TripType, MultiCityLeg } from '../types/Flight'
import AirportSelector from './AirportSelector'
import SearchCalendar from './SearchCalendar'
import MultiCityCalendar from './MultiCityCalendar'
import '../styles/SearchForm.css'
import '../styles/FullCalendar.css'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
  flights?: any[] // 航班數據用於顯示價格
}

const SearchForm = ({ onSearch, flights = [] }: SearchFormProps) => {
  const [tripType, setTripType] = useState<TripType>('roundtrip')
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0])
  const [returnDate, setReturnDate] = useState('')
  const [showSearchCalendar, setShowSearchCalendar] = useState(false)
  const [showMultiCityCalendars, setShowMultiCityCalendars] = useState<boolean[]>([])
  const [showDepartureSelector, setShowDepartureSelector] = useState(false)
  const [showDestinationSelector, setShowDestinationSelector] = useState(false)
  const [currentLegIndex, setCurrentLegIndex] = useState(0)
  const [multiCityMonths, setMultiCityMonths] = useState<Date[]>([])
  const [cabin, setCabin] = useState<CabinClass>('economy')
  const [multiCityLegs, setMultiCityLegs] = useState<MultiCityLeg[]>([
    { departure: '', destination: '', date: '', cabin: 'economy' },
    { departure: '', destination: '', date: '', cabin: 'economy' }
  ])





  const handleAddLeg = () => {
    if (multiCityLegs.length < 4) {
      setMultiCityLegs([...multiCityLegs, { departure: '', destination: '', date: '', cabin: 'economy' }])
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
      // 多個航段處理
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

  const handleMultiCityDateSelect = (date: string, legIndex: number) => {
    const newLegs = [...multiCityLegs]
    newLegs[legIndex].date = date
    setMultiCityLegs(newLegs)
    
    const newCalendars = [...showMultiCityCalendars]
    newCalendars[legIndex] = false
    setShowMultiCityCalendars(newCalendars)
  }



  // 初始化多個航段日曆狀態
  useEffect(() => {
    setShowMultiCityCalendars(new Array(multiCityLegs.length).fill(false))
    setMultiCityMonths(new Array(multiCityLegs.length).fill(new Date()))
  }, [multiCityLegs.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (tripType === 'multicity') {
      // 验证多個航段航班
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

  // 處理搜尋日曆的日期選擇
  const handleSearchCalendarDateSelect = (departureDate: string, returnDate?: string) => {
    setDepartureDate(departureDate)
    if (tripType === 'roundtrip' && returnDate) {
      setReturnDate(returnDate)
    } else if (tripType === 'oneway') {
      setReturnDate('')
    }
    setShowSearchCalendar(false)
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
            <span>多個航段</span>
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
                  <div className="form-group">
                    <label>艙等</label>
                    <select
                      value={leg.cabin}
                      onChange={(e) => {
                        const newLegs = [...multiCityLegs]
                        newLegs[index].cabin = e.target.value as CabinClass
                        setMultiCityLegs(newLegs)
                      }}
                      className="form-select"
                    >
                      <option value="economy">經濟艙</option>
                      <option value="business">商務艙</option>
                      <option value="first">頭等艙</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {multiCityLegs.length < 4 && (
              <button type="button" className="add-leg-button" onClick={handleAddLeg}>
                + 新增行程
              </button>
            )}
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
                <label>日期選擇</label>
                <div className="date-input-wrapper">
                  <input
                    type="text"
                    value={
                      tripType === 'roundtrip' 
                        ? `${departureDate ? new Date(departureDate).toLocaleDateString('zh-TW') : '選擇出發日期'}${returnDate ? ' - ' + new Date(returnDate).toLocaleDateString('zh-TW') : ''}`
                        : departureDate ? new Date(departureDate).toLocaleDateString('zh-TW') : '選擇出發日期'
                    }
                    readOnly
                    placeholder={tripType === 'roundtrip' ? '選擇來回日期' : '選擇出發日期'}
                    onClick={() => setShowSearchCalendar(true)}
                    className="date-display-input"
                  />
                  <button
                    type="button"
                    className="calendar-icon-button"
                    onClick={() => setShowSearchCalendar(true)}
                  >
                    📅
                  </button>
                </div>
              </div>

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

      {/* 搜尋日曆 */}
      {showSearchCalendar && (
        <SearchCalendar
          flights={flights}
          cabin={cabin}
          tripType={tripType === 'multicity' ? 'roundtrip' : tripType}
          departure={departure}
          destination={destination}
          onDateSelect={handleSearchCalendarDateSelect}
          onClose={() => setShowSearchCalendar(false)}
          initialDepartureDate={departureDate}
          initialReturnDate={returnDate}
        />
      )}

      {/* 多個航段日曆 */}
      {showMultiCityCalendars.map((showCalendar, index) => showCalendar && (
        <MultiCityCalendar
          key={`multicity-calendar-${index}`}
          legIndex={index}
          onDateSelect={handleMultiCityDateSelect}
          onClose={() => {
            const newCalendars = [...showMultiCityCalendars]
            newCalendars[index] = false
            setShowMultiCityCalendars(newCalendars)
          }}
          initialDate={multiCityLegs[index]?.date}
        />
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

