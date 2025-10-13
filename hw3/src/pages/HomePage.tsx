import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { useNavigate } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import FlightList from '../components/FlightList'
import FullCalendar from '../components/FullCalendar'
import FlightPlanSelector from '../components/FlightPlanSelector'
import SeatSelector from '../components/SeatSelector'
import { Flight, SearchParams, CabinClass } from '../types/Flight'
import { extractAirportCode } from '../data/airports'
import '../styles/HomePage.css'

interface HomePageProps {
  onSelectFlight: (flight: Flight, cabin: CabinClass, actualPrice: number) => void
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
  const [showPlanSelector, setShowPlanSelector] = useState(false)
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [showSeatSelector, setShowSeatSelector] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'value' | 'basic' | 'full' | null>(null)
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
    console.log('============ 開始搜尋航班 ============')
    console.log('搜尋類型:', params.tripType)
    console.log('出發地:', params.departure)
    console.log('目的地:', params.destination)
    console.log('出發日期:', params.date)
    console.log('回程日期:', params.returnDate)
    console.log('艙等:', params.cabin)
    console.log('====================================')
    
    setSearchParams(params)
    setCurrentLegIndex(0)
    setSelectedFlights([])
    setDisplayDate(params.date)
    setDepartureDate(params.date)
    
    // 如果是來回票，保存回程日期
    if (params.tripType === 'roundtrip' && params.returnDate) {
      console.log('✓ 設置回程日期範圍:', params.date, '→', params.returnDate)
      setSelectedDateRange({start: params.date, end: params.returnDate})
    } else {
      setSelectedDateRange({start: null, end: null})
    }

    if (params.tripType === 'multicity' && params.multiCityLegs) {
      // 多個航段：显示第一程
      const firstLeg = params.multiCityLegs[0]
      const filtered = flights.filter(flight => {
        const departureCode = extractAirportCode(firstLeg.departure)
        const destinationCode = extractAirportCode(firstLeg.destination)
        const departureMatch = flight.departure.includes(departureCode)
        const destinationMatch = flight.destination.includes(destinationCode)
        const dateMatch = flight.departureDate === firstLeg.date
        console.log(`多個航段搜尋航班: 出發地=${flight.departure}, 目的地=${flight.destination}, 日期=${flight.departureDate}`)
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

  const handleDateSelect = (date: string) => {
    if (!searchParams) return
    
    console.log(`日期選擇: ${date}`)
    
    if (searchParams.tripType === 'roundtrip') {
      if (!selectedDateRange.start) {
        // 第一步：选择出发日
        setSelectedDateRange({start: date, end: null})
        setDepartureDate(date)
        
        // 搜尋該出發日期的航班
        const filtered = flights.filter(flight => {
          const departureCode = extractAirportCode(searchParams.departure)
          const destinationCode = extractAirportCode(searchParams.destination)
          const departureMatch = flight.departure.includes(departureCode)
          const destinationMatch = flight.destination.includes(destinationCode)
          const dateMatch = flight.departureDate === date
          return departureMatch && destinationMatch && dateMatch
        })
        setFilteredFlights(filtered)
      } else if (date !== selectedDateRange.start) {
        // 如果選擇的日期與當前出發日不同，重新選擇出發日
        setSelectedDateRange({start: date, end: null})
        setDepartureDate(date)
        
        // 搜尋新的出發日期的航班
        const filtered = flights.filter(flight => {
          const departureCode = extractAirportCode(searchParams.departure)
          const destinationCode = extractAirportCode(searchParams.destination)
          const departureMatch = flight.departure.includes(departureCode)
          const destinationMatch = flight.destination.includes(destinationCode)
          const dateMatch = flight.departureDate === date
          return departureMatch && destinationMatch && dateMatch
        })
        setFilteredFlights(filtered)
      } else if (!selectedDateRange.end || date !== selectedDateRange.end) {
        // 第二步：选择回程日（必须晚于出发日）或重新選擇回程日
        console.log('============ 選擇回程日期 ============')
        console.log('選擇的日期:', date)
        console.log('當前出發日期:', selectedDateRange.start)
        console.log('當前回程日期:', selectedDateRange.end)
        console.log('currentLegIndex:', currentLegIndex)
        console.log('selectedFlights.length:', selectedFlights.length)
        console.log('====================================')
        
        setSelectedDateRange({start: selectedDateRange.start, end: date})
        setShowFullCalendar(false)
        
        // 檢查是否已經選擇了去程航班
        if (currentLegIndex === 0 && selectedFlights.length === 0) {
          // 還沒有選擇去程航班，繼續顯示出發日期的航班
          console.log('✓ 還沒有選擇去程航班，顯示出發日期航班')
          setDisplayDate(date) // 更新 displayDate 為回程日期
          const filtered = flights.filter(flight => {
            const departureCode = extractAirportCode(searchParams.departure)
            const destinationCode = extractAirportCode(searchParams.destination)
            const departureMatch = flight.departure.includes(departureCode)
            const destinationMatch = flight.destination.includes(destinationCode)
            const dateMatch = flight.departureDate === selectedDateRange.start
            console.log(`回程日期搜尋: 航班=${flight.flightNumber}, 日期=${flight.departureDate}, 匹配=${dateMatch}`)
            return departureMatch && destinationMatch && dateMatch
          })
          console.log('回程日期搜尋結果:', filtered.length, '個航班')
          setFilteredFlights(filtered)
        } else {
          // 已經選擇了去程航班，需要重新搜尋回程航班
          console.log('✓ 已經選擇了去程航班，重新搜尋回程航班')
          // 不要更新 displayDate，保持出發日期顯示
          console.log('保持 departureDate 不變:', departureDate)
          console.log('保持 displayDate 不變:', displayDate)
          const returnDateToUse = date // 使用新選擇的回程日期
          const departureCode = extractAirportCode(searchParams.destination)
          const destinationCode = extractAirportCode(searchParams.departure)
          
          console.log('回程搜尋參數:')
          console.log('- 回程日期:', returnDateToUse)
          console.log('- 出發地:', searchParams.destination, '→ 代碼:', departureCode)
          console.log('- 目的地:', searchParams.departure, '→ 代碼:', destinationCode)
          
          const filtered = flights.filter(f => {
            const departureMatch = f.departure.includes(departureCode)
            const destinationMatch = f.destination.includes(destinationCode)
            const dateMatch = f.departureDate === returnDateToUse
            
            if (departureMatch && destinationMatch) {
              console.log(`✓ 找到候選回程航班: ${f.flightNumber}, 日期=${f.departureDate}, 出發=${f.departure}, 目的=${f.destination}`)
              console.log(`  匹配結果: 出發=${departureMatch}, 目的=${destinationMatch}, 日期=${dateMatch}`)
            }
            
            return departureMatch && destinationMatch && dateMatch
          })
          
          console.log(`✓ 找到 ${filtered.length} 個回程航班`)
          console.log('回程航班列表:', filtered.map(f => f.flightNumber).join(', '))
          setFilteredFlights(filtered)
        }
        console.log('====================================')
      }
    } else {
      // 单程票或多個航段
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
    console.log('🔴 handleDepartureDateSelect 被調用，日期:', date)
    console.log('🔴 currentLegIndex:', currentLegIndex)
    console.log('🔴 selectedFlights.length:', selectedFlights.length)
    console.log('🔴 selectedDateRange:', selectedDateRange)
    setDepartureDate(date)
  }

  const getPrice = (flight: Flight, cabin: CabinClass): number => {
    // 檢查是否有通關密語且是 10/17 航班
    const isDate1017 = (dateStr: string): boolean => {
      if (!dateStr) return false
      const date = new Date(dateStr)
      const month = date.getMonth() + 1 // getMonth() 返回 0-11
      const day = date.getDate()
      return month === 10 && day === 17
    }

    const is1017Flight = isDate1017(flight.departureDate)
    const hasSecretCode = searchParams?.hasSecretCode && is1017Flight
    
    // 調試信息
    if (is1017Flight) {
      console.log('🔍 10/17 航班價格計算:')
      console.log('  航班:', flight.flightNumber, flight.departureDate)
      console.log('  searchParams.hasSecretCode:', searchParams?.hasSecretCode)
      console.log('  is1017Flight:', is1017Flight)
      console.log('  hasSecretCode:', hasSecretCode)
      console.log('  返回價格:', hasSecretCode ? 0 : flight[`price_${cabin}`])
    }
    
    if (hasSecretCode) {
      return 0 // 通關密語有效時免費
    }

    // 臺北松山航班特殊價格
    const isTSAFlight = flight.departure === '臺北松山 TSA' || flight.destination === '臺北松山 TSA'
    if (isTSAFlight) {
      console.log('🎉 臺北松山航班特殊價格:', flight.flightNumber, '艙等:', cabin)
      switch (cabin) {
        case 'economy':
          return 0 // 經濟艙免費
        case 'business':
          return 30 // 商務艙 30 元
        case 'first':
          return 50 // 頭等艙 50 元
      }
    }

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
    console.log('選擇航班:', flight)
    
    // 顯示方案選擇器
    setSelectedFlight(flight)
    setShowPlanSelector(true)
  }

  const handleSeatConfirm = (seatNumber: string) => {
    if (!selectedFlight || !searchParams || !selectedPlan) return

    console.log('選擇座位:', seatNumber, '方案:', selectedPlan)
    
    // 根據方案調整價格（全額方案 +1000）
    const priceModifier = 1000
    const adjustedFlight = {
      ...selectedFlight,
      price_economy: selectedFlight.price_economy + priceModifier,
      price_business: selectedFlight.price_business + priceModifier,
      price_first: selectedFlight.price_first + priceModifier
    }
    
    // 關閉座位選擇器
    setShowSeatSelector(false)
    setSelectedFlight(null)
    setSelectedPlan(null)

    // 繼續原本的選擇邏輯
    if (searchParams.tripType === 'oneway') {
      // 单程：直接加入购物车
      const actualPrice = getPrice(adjustedFlight, searchParams.cabin)
      onSelectFlight(adjustedFlight, searchParams.cabin, actualPrice)
      navigate('/cart')
    } else if (searchParams.tripType === 'roundtrip') {
      // 来回
      if (currentLegIndex === 0) {
        // 选择了去程，保存並顯示回程
        setSelectedFlights([adjustedFlight])
        
        const returnDateToUse = selectedDateRange.end || searchParams.returnDate
        const departureCode = extractAirportCode(searchParams.destination)
        const destinationCode = extractAirportCode(searchParams.departure)
        
        console.log('🟢 查找回程航班')
        console.log('   出發地碼:', departureCode)
        console.log('   目的地碼:', destinationCode)
        console.log('   日期:', returnDateToUse)
        
        const returnFlights = flights.filter(f => {
          const fDep = extractAirportCode(f.departure)
          const fDest = extractAirportCode(f.destination)
          const match = fDep === departureCode && 
                       fDest === destinationCode && 
                       f.departureDate === returnDateToUse
          
          if (match) {
            console.log('   ✅ 找到回程:', f.flightNumber, f.departure, '->', f.destination)
          }
          return match
        })
        
        console.log('🟢 回程航班數量:', returnFlights.length)
        
        setFilteredFlights(returnFlights)
        setCurrentLegIndex(1)
        setDisplayDate(returnDateToUse || '')
      } else {
        // 选择了回程，全部加入购物车
        const outboundPrice = getPrice(selectedFlights[0], searchParams.cabin)
        const returnPrice = getPrice(adjustedFlight, searchParams.cabin)
        onSelectFlight(selectedFlights[0], searchParams.cabin, outboundPrice)
        onSelectFlight(adjustedFlight, searchParams.cabin, returnPrice)
        navigate('/cart')
      }
    } else if (searchParams.tripType === 'multicity') {
      // 多個航段
      const newSelectedFlights = [...selectedFlights, adjustedFlight]
      setSelectedFlights(newSelectedFlights)
      
      if (currentLegIndex < (searchParams.multiCityLegs?.length || 0) - 1) {
        // 还有下一个航段
        const nextIndex = currentLegIndex + 1
        const nextLeg = searchParams.multiCityLegs![nextIndex]
        const departureCode = extractAirportCode(nextLeg.departure)
        const destinationCode = extractAirportCode(nextLeg.destination)
        
        const nextLegFlights = flights.filter(f => 
          extractAirportCode(f.departure) === departureCode && 
          extractAirportCode(f.destination) === destinationCode && 
          f.departureDate === nextLeg.date
        )
        
        setFilteredFlights(nextLegFlights)
        setCurrentLegIndex(nextIndex)
        setDisplayDate(nextLeg.date)
      } else {
        // 所有航段都选完了
        newSelectedFlights.forEach(flight => {
          const legIndex = newSelectedFlights.indexOf(flight)
          const legCabin = searchParams.multiCityLegs![legIndex].cabin
          const actualPrice = getPrice(flight, legCabin)
          onSelectFlight(flight, legCabin, actualPrice)
        })
        navigate('/cart')
      }
    }
  }

  const handlePlanSelect = (plan: 'value' | 'basic' | 'full') => {
    if (!selectedFlight || !searchParams) return

    console.log('選擇方案:', plan, selectedFlight)
    
    // 保存選擇的方案
    setSelectedPlan(plan)
    
    // 如果選擇全額方案，顯示座位選擇器
    if (plan === 'full') {
      setShowPlanSelector(false)
      setShowSeatSelector(true)
      return
    }
    
    // 其他方案：根據方案調整價格後繼續
    const priceModifier = plan === 'value' ? 0 : plan === 'basic' ? 300 : 1000
    const adjustedFlight = {
      ...selectedFlight,
      price_economy: selectedFlight.price_economy + priceModifier,
      price_business: selectedFlight.price_business + priceModifier,
      price_first: selectedFlight.price_first + priceModifier
    }
    
    // 關閉方案選擇器
    setShowPlanSelector(false)
    setSelectedFlight(null)
    setSelectedPlan(null)

    // 繼續原本的選擇邏輯
    if (!searchParams) return

    if (searchParams.tripType === 'oneway') {
      // 单程：直接加入购物车
      const actualPrice = getPrice(adjustedFlight, searchParams.cabin)
      onSelectFlight(adjustedFlight, searchParams.cabin, actualPrice)
      navigate('/cart')
    } else if (searchParams.tripType === 'roundtrip') {
      // 来回
      if (currentLegIndex === 0) {
        // 选择了去程，保存并显示回程
        setSelectedFlights([adjustedFlight])
        
        // 使用正確的回程日期來源 - 優先使用 selectedDateRange.end
        const returnDateToUse = selectedDateRange.end || searchParams.returnDate
        const departureCode = extractAirportCode(searchParams.destination)
        const destinationCode = extractAirportCode(searchParams.departure)
        
        console.log('============ 選擇去程航班，準備顯示回程航班 ============')
        console.log('searchParams.returnDate:', searchParams.returnDate)
        console.log('selectedDateRange:', selectedDateRange)
        console.log('displayDate:', displayDate)
        console.log('最終使用的回程日期:', returnDateToUse)
        console.log('回程出發地:', searchParams.destination, '→ 代碼:', departureCode)
        console.log('回程目的地:', searchParams.departure, '→ 代碼:', destinationCode)
        console.log('總航班數量:', flights.length)
        console.log('==================================================')
        
        const filtered = flights.filter(f => {
          const departureMatch = f.departure.includes(departureCode)
          const destinationMatch = f.destination.includes(destinationCode)
          const dateMatch = f.departureDate === returnDateToUse
          
          // 只顯示匹配的航班以減少日誌
          if (departureMatch && destinationMatch) {
            console.log(`✓ 找到候選航班: ${f.flightNumber}, 日期=${f.departureDate}, 出發=${f.departure}, 目的=${f.destination}`)
            console.log(`  匹配結果: 出發=${departureMatch}, 目的=${destinationMatch}, 日期=${dateMatch}`)
          }
          
          return departureMatch && destinationMatch && dateMatch
        })
        
        console.log('==================================================')
        console.log(`✓ 找到 ${filtered.length} 個回程航班`)
        console.log('回程航班列表:', filtered.map(f => f.flightNumber).join(', '))
        console.log('==================================================')
        setFilteredFlights(filtered)
        setCurrentLegIndex(1)
      } else {
        // 选择了回程，将去程和回程都加入购物车
        selectedFlights.forEach(f => {
          const price = getPrice(f, searchParams.cabin)
          onSelectFlight(f, searchParams.cabin, price)
        })
        const returnPrice = getPrice(adjustedFlight, searchParams.cabin)
        onSelectFlight(adjustedFlight, searchParams.cabin, returnPrice)
        navigate('/cart')
      }
    } else if (searchParams.tripType === 'multicity' && searchParams.multiCityLegs) {
      // 多個航段
      const newSelectedFlights = [...selectedFlights, adjustedFlight]
      setSelectedFlights(newSelectedFlights)
      
      const nextIndex = currentLegIndex + 1
      
      if (nextIndex < searchParams.multiCityLegs.length) {
        // 还有下一程
        const nextLeg = searchParams.multiCityLegs[nextIndex]
        const departureCode = extractAirportCode(nextLeg.departure)
        const destinationCode = extractAirportCode(nextLeg.destination)
        
        const filtered = flights.filter(f => {
          const departureMatch = f.departure.includes(departureCode)
          const destinationMatch = f.destination.includes(destinationCode)
          const dateMatch = f.departureDate === nextLeg.date
          return departureMatch && destinationMatch && dateMatch
        })
        setFilteredFlights(filtered)
        setCurrentLegIndex(nextIndex)
      } else {
        // 所有程都选完了，加入购物车
        newSelectedFlights.forEach(f => {
          const price = getPrice(f, searchParams.cabin)
          onSelectFlight(f, searchParams.cabin, price)
        })
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
      {!searchParams && <SearchForm onSearch={handleSearch} flights={flights} />}
      
      {searchParams && showFullCalendar && (
        <div className="calendar-modal">
          <div className="calendar-overlay" onClick={() => setShowFullCalendar(false)}></div>
          <div className="calendar-container">
            <FullCalendar
              key={`${selectedDateRange.start}-${selectedDateRange.end}`}
              flights={flights}
              cabin={searchParams.cabin}
              selectedDate={selectedDateRange.end || displayDate}
              onDateSelect={handleDateSelect}
              onConfirm={() => setShowFullCalendar(false)}
              tripType={searchParams.tripType}
              departureDate={selectedDateRange.start || departureDate || undefined}
              onDepartureDateSelect={handleDepartureDateSelect}
              departure={searchParams.departure}
              destination={searchParams.destination}
            />
          </div>
        </div>
      )}

      {searchParams && !showFullCalendar && (
        <div className="selection-header">
          <div className="selection-info">
            <h2 className="selection-title">{getStepTitle()}</h2>
            <p className="selection-hint">{getRouteHint()}</p>
            {searchParams.tripType === 'roundtrip' && departureDate && (
              <p className="selected-date-info">
                出發日期: {new Date(departureDate).toLocaleDateString('zh-TW', { 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </p>
            )}
            {searchParams.tripType === 'roundtrip' && selectedDateRange.end && (
              <p className="selected-date-info">
                回程日期: {new Date(selectedDateRange.end).toLocaleDateString('zh-TW', { 
                  month: 'long', 
                  day: 'numeric', 
                  weekday: 'long' 
                })}
              </p>
            )}
            {searchParams.tripType !== 'roundtrip' && displayDate && (
              <p className="selected-date-info">
                搜尋日期: {new Date(displayDate).toLocaleDateString('zh-TW', { 
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

      {showPlanSelector && selectedFlight && (
        <FlightPlanSelector
          flight={selectedFlight}
          cabin={searchParams?.cabin || 'economy'}
          isFree={getPrice(selectedFlight, searchParams?.cabin || 'economy') === 0}
          onSelect={handlePlanSelect}
          onClose={() => {
            setShowPlanSelector(false)
            setSelectedFlight(null)
            setSelectedPlan(null)
          }}
        />
      )}

      {showSeatSelector && selectedFlight && (
        <SeatSelector
          flight={selectedFlight}
          cabin={searchParams?.cabin || 'economy'}
          onConfirm={handleSeatConfirm}
          onClose={() => {
            setShowSeatSelector(false)
            setSelectedFlight(null)
            setSelectedPlan(null)
          }}
        />
      )}
    </main>
  )
}

export default HomePage
