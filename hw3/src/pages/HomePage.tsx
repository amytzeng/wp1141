import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { useNavigate } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import FlightList from '../components/FlightList'
import FullCalendar from '../components/FullCalendar'
import { Flight, SearchParams, CabinClass } from '../types/Flight'
import { extractAirportCode } from '../data/airports'
import '../styles/HomePage.css'

interface HomePageProps {
  onSelectFlight: (flight: Flight, cabin: CabinClass) => void
}

function HomePage({ onSelectFlight }: HomePageProps) {
  const [flights, setFlights] = useState<Flight[]>([])
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([])
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentLegIndex, setCurrentLegIndex] = useState(0)
  const [selectedFlights, setSelectedFlights] = useState<Flight[]>([])
  const [displayDate, setDisplayDate] = useState<string>('')
  const [departureDate, setDepartureDate] = useState<string | null>(null)
  const [showFullCalendar, setShowFullCalendar] = useState(false)
  const [selectedDateRange, setSelectedDateRange] = useState<{start: string | null, end: string | null}>({start: null, end: null})
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/flights.csv')
      .then(response => response.text())
      .then(csvText => {
        Papa.parse<Flight>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('航班資料載入完成:', results.data.length, '個航班')
            console.log('前5個航班:', results.data.slice(0, 5))
            setFlights(results.data)
            setFilteredFlights(results.data)
            setIsLoading(false)
          }
        })
      })
      .catch(error => {
        console.error('Error loading flights:', error)
        setIsLoading(false)
      })
  }, [])

  const handleSearch = (params: SearchParams) => {
    setSearchParams(params)
    setCurrentLegIndex(0)
    setSelectedFlights([])
    setDisplayDate(params.date)

    if (params.tripType === 'multicity' && params.multiCityLegs) {
      // 多程：显示第一程
      const firstLeg = params.multiCityLegs[0]
      const filtered = flights.filter(flight => {
        const departureCode = extractAirportCode(firstLeg.departure)
        const destinationCode = extractAirportCode(firstLeg.destination)
        const departureMatch = flight.departure.includes(departureCode)
        const destinationMatch = flight.destination.includes(destinationCode)
        const dateMatch = flight.departureDate === firstLeg.date
        console.log(`多程搜尋航班: 出發地=${flight.departure}, 目的地=${flight.destination}, 日期=${flight.departureDate}`)
        console.log(`條件: 出發地匹配=${departureMatch}, 目的地匹配=${destinationMatch}, 日期匹配=${dateMatch}`)
        return departureMatch && destinationMatch && dateMatch
      })
      setFilteredFlights(filtered)
    } else {
      // 单程或来回
      const filtered = flights.filter(flight => {
        const departureCode = extractAirportCode(params.departure)
        const destinationCode = extractAirportCode(params.destination)
        const departureMatch = flight.departure.includes(departureCode)
        const destinationMatch = flight.destination.includes(destinationCode)
        const dateMatch = flight.departureDate === params.date
        console.log(`搜尋航班: 出發地=${flight.departure}, 目的地=${flight.destination}, 日期=${flight.departureDate}`)
        console.log(`條件: 出發地匹配=${departureMatch}, 目的地匹配=${destinationMatch}, 日期匹配=${dateMatch}`)
        return departureMatch && destinationMatch && dateMatch
      })
      setFilteredFlights(filtered)
    }
  }

  // handleDateChange 函數已移除，現在直接在 PriceCalendar 中處理

  const handleDateSelect = (date: string) => {
    if (!searchParams) return
    
    console.log(`日期選擇: ${date}`)
    
    if (searchParams.tripType === 'roundtrip') {
      if (!selectedDateRange.start) {
        // 第一步：选择出发日
        setSelectedDateRange({start: date, end: null})
        setDepartureDate(date)
      } else if (!selectedDateRange.end && date > selectedDateRange.start) {
        // 第二步：选择回程日（必须晚于出发日）
        setSelectedDateRange({start: selectedDateRange.start, end: date})
        setDisplayDate(date)
        setShowFullCalendar(false)
        
        // 重新搜索该日期的航班
        const filtered = flights.filter(flight => {
          const departureCode = extractAirportCode(searchParams.departure)
          const destinationCode = extractAirportCode(searchParams.destination)
          const departureMatch = flight.departure.includes(departureCode)
          const destinationMatch = flight.destination.includes(destinationCode)
          const dateMatch = flight.departureDate === date
          return departureMatch && destinationMatch && dateMatch
        })
        setFilteredFlights(filtered)
      }
    } else {
      // 单程票或多程票
      setDisplayDate(date)
      setShowFullCalendar(false)
      
      // 重新搜索该日期的航班
      const filtered = flights.filter(flight => {
        const departureCode = extractAirportCode(searchParams.departure)
        const destinationCode = extractAirportCode(searchParams.destination)
        const departureMatch = flight.departure.includes(departureCode)
        const destinationMatch = flight.destination.includes(destinationCode)
        const dateMatch = flight.departureDate === date
        console.log(`日期選擇搜尋: 出發地=${flight.departure}, 目的地=${flight.destination}, 日期=${flight.departureDate}`)
        console.log(`條件: 出發地匹配=${departureMatch}, 目的地匹配=${destinationMatch}, 日期匹配=${dateMatch}`)
        return departureMatch && destinationMatch && dateMatch
      })
      console.log(`日期選擇找到 ${filtered.length} 個航班`)
      setFilteredFlights(filtered)
    }
  }

  const handleDepartureDateSelect = (date: string) => {
    setDepartureDate(date)
  }

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

  const handleSelectFlight = (flight: Flight) => {
    if (!searchParams) return

    if (searchParams.tripType === 'oneway') {
      // 单程：直接加入购物车
      onSelectFlight(flight, searchParams.cabin)
      navigate('/cart')
    } else if (searchParams.tripType === 'roundtrip') {
      // 来回
      if (currentLegIndex === 0) {
        // 选择了去程，保存并显示回程
        setSelectedFlights([flight])
        const filtered = flights.filter(f => {
          const departureMatch = f.departure.includes(searchParams.destination)
          const destinationMatch = f.destination.includes(searchParams.departure)
          return departureMatch && destinationMatch
        })
        setFilteredFlights(filtered)
        setCurrentLegIndex(1)
      } else {
        // 选择了回程，将去程和回程都加入购物车
        selectedFlights.forEach(f => onSelectFlight(f, searchParams.cabin))
        onSelectFlight(flight, searchParams.cabin)
        navigate('/cart')
      }
    } else if (searchParams.tripType === 'multicity' && searchParams.multiCityLegs) {
      // 多程
      const newSelectedFlights = [...selectedFlights, flight]
      setSelectedFlights(newSelectedFlights)
      
      const nextIndex = currentLegIndex + 1
      
      if (nextIndex < searchParams.multiCityLegs.length) {
        // 还有下一程
        const nextLeg = searchParams.multiCityLegs[nextIndex]
        const filtered = flights.filter(f => {
          const departureMatch = f.departure.includes(nextLeg.departure)
          const destinationMatch = f.destination.includes(nextLeg.destination)
          return departureMatch && destinationMatch
        })
        setFilteredFlights(filtered)
        setCurrentLegIndex(nextIndex)
      } else {
        // 所有程都选完了，加入购物车
        newSelectedFlights.forEach(f => onSelectFlight(f, searchParams.cabin))
        navigate('/cart')
      }
    }
  }

  const handleCancelSelection = () => {
    setSearchParams(null)
    setCurrentLegIndex(0)
    setSelectedFlights([])
    setFilteredFlights(flights)
  }

  const getStepTitle = () => {
    if (!searchParams) return ''

    if (searchParams.tripType === 'oneway') {
      return '選擇航班'
    } else if (searchParams.tripType === 'roundtrip') {
      return currentLegIndex === 0 ? '選擇去程航班' : '選擇回程航班'
    } else if (searchParams.tripType === 'multicity' && searchParams.multiCityLegs) {
      return `選擇航班 - 行程 ${currentLegIndex + 1}/${searchParams.multiCityLegs.length}`
    }
    return ''
  }

  const getRouteHint = () => {
    if (!searchParams) return ''

    if (searchParams.tripType === 'multicity' && searchParams.multiCityLegs) {
      const leg = searchParams.multiCityLegs[currentLegIndex]
      return `${leg.departure} → ${leg.destination}`
    } else if (searchParams.tripType === 'roundtrip' && currentLegIndex === 1) {
      return `${searchParams.destination} → ${searchParams.departure}`
    } else {
      return `${searchParams.departure} → ${searchParams.destination}`
    }
  }

  return (
    <main className="main-content">
      {!searchParams && <SearchForm onSearch={handleSearch} />}
      
      {searchParams && showFullCalendar && (
        <div className="calendar-modal">
          <div className="calendar-overlay" onClick={() => setShowFullCalendar(false)}></div>
          <div className="calendar-container">
            <FullCalendar
              flights={filteredFlights}
              cabin={searchParams.cabin}
              selectedDate={selectedDateRange.end || displayDate}
              onDateSelect={handleDateSelect}
              onConfirm={() => setShowFullCalendar(false)}
              tripType={searchParams.tripType}
              departureDate={selectedDateRange.start || departureDate || undefined}
              onDepartureDateSelect={handleDepartureDateSelect}
            />
          </div>
        </div>
      )}

      {searchParams && !showFullCalendar && (
        <div className="selection-header">
          <div className="selection-info">
            <h2 className="selection-title">{getStepTitle()}</h2>
            <p className="selection-hint">{getRouteHint()}</p>
            {searchParams.tripType !== 'multicity' && displayDate && (
              <p className="selected-date-info">
                搜尋日期: {new Date(displayDate).toLocaleDateString('zh-TW', { 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </p>
            )}
            {searchParams.tripType === 'roundtrip' && departureDate && (
              <p className="selected-date-info">
                出發日期: {new Date(departureDate).toLocaleDateString('zh-TW', { 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </p>
            )}
          </div>
          
          {selectedFlights.length > 0 && (
            <div className="selected-flights-preview">
              <p className="preview-title">已選擇的航班：</p>
              {selectedFlights.map((flight, index) => (
                <div key={index} className="mini-flight-card">
                  <span className="flight-num">{flight.flightNumber}</span>
                  <span className="flight-route">
                    {flight.departure} → {flight.destination}
                  </span>
                  <span className="flight-time">{flight.departureTime}</span>
                </div>
              ))}
            </div>
          )}
          
          <button className="cancel-button" onClick={handleCancelSelection}>
            重新搜尋
          </button>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading">載入航班資訊中...</div>
      ) : searchParams && (
        <>
          {/* 價格日曆 - 顯示前後幾天的票價 */}
          <div className="calendar-section">
            <button 
              className="calendar-toggle-button"
              onClick={() => setShowFullCalendar(true)}
            >
              📅 選擇其他日期
            </button>
          </div>
          
          <FlightList 
            flights={filteredFlights} 
            cabin={searchParams.cabin}
            getPrice={getPrice}
            onSelectFlight={handleSelectFlight}
          />
        </>
      )}
    </main>
  )
}

export default HomePage
