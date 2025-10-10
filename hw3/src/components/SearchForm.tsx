import { useState } from 'react'
import { SearchParams, CabinClass, TripType, MultiCityLeg } from '../types/Flight'
import '../styles/SearchForm.css'

interface SearchFormProps {
  onSearch: (params: SearchParams) => void
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [tripType, setTripType] = useState<TripType>('roundtrip')
  const [departure, setDeparture] = useState('')
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [cabin, setCabin] = useState<CabinClass>('economy')
  const [multiCityLegs, setMultiCityLegs] = useState<MultiCityLeg[]>([
    { departure: '', destination: '', date: '' },
    { departure: '', destination: '', date: '' }
  ])

  const cities = [
    '台北 TPE',
    '東京 NRT',
    '東京 HND',
    '大阪 KIX',
    '首爾 ICN',
    '曼谷 BKK',
    '新加坡 SIN',
    '吉隆坡 KUL',
    '澳門 MFM',
    '香港 HKG',
    '峇里島 DPS'
  ]

  // 获取可用的目的地（排除已选择的出发地）
  const getAvailableDestinations = () => {
    if (!departure) return cities
    return cities.filter(city => city !== departure)
  }

  // 获取可用的出发地（排除已选择的目的地）
  const getAvailableDepartures = () => {
    if (!destination) return cities
    return cities.filter(city => city !== destination)
  }

  const handleAddLeg = () => {
    if (multiCityLegs.length < 4) {
      setMultiCityLegs([...multiCityLegs, { departure: '', destination: '', date: '' }])
    }
  }

  const handleRemoveLeg = (index: number) => {
    if (multiCityLegs.length > 2) {
      setMultiCityLegs(multiCityLegs.filter((_, i) => i !== index))
    }
  }

  const handleLegChange = (index: number, field: keyof MultiCityLeg, value: string) => {
    const newLegs = [...multiCityLegs]
    newLegs[index][field] = value
    setMultiCityLegs(newLegs)
  }

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
      onSearch({ 
        tripType,
        departure, 
        destination, 
        date: departureDate, 
        cabin,
        returnDate: tripType === 'roundtrip' ? (returnDate || undefined) : undefined
      })
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
                    <select
                      value={leg.departure}
                      onChange={(e) => handleLegChange(index, 'departure', e.target.value)}
                      className="form-select city-select-small"
                    >
                      <option value="">請選擇</option>
                      {cities.filter(c => c !== leg.destination).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>目的地</label>
                    <select
                      value={leg.destination}
                      onChange={(e) => handleLegChange(index, 'destination', e.target.value)}
                      className="form-select city-select-small"
                    >
                      <option value="">請選擇</option>
                      {cities.filter(c => c !== leg.departure).map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>日期</label>
                    <input
                      type="date"
                      value={leg.date}
                      onChange={(e) => handleLegChange(index, 'date', e.target.value)}
                      className="form-input"
                      min={index === 0 ? new Date().toISOString().split('T')[0] : multiCityLegs[index - 1].date || new Date().toISOString().split('T')[0]}
                    />
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
                <select
                  id="departure"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="form-select city-select"
                >
                  <option value="">請選擇出發地</option>
                  {getAvailableDepartures().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
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
                <select
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="form-select city-select"
                >
                  <option value="">請選擇目的地</option>
                  {getAvailableDestinations().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row dates-row">
              <div className="form-group">
                <label htmlFor="departureDate">出發日期</label>
                <input
                  type="date"
                  id="departureDate"
                  value={departureDate}
                  onChange={(e) => {
                    setDepartureDate(e.target.value)
                    if (returnDate && e.target.value > returnDate) {
                      setReturnDate('')
                    }
                  }}
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {tripType === 'roundtrip' && (
                <div className="form-group">
                  <label htmlFor="returnDate">回程日期</label>
                  <input
                    type="date"
                    id="returnDate"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="form-input"
                    min={departureDate || new Date().toISOString().split('T')[0]}
                  />
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
    </div>
  )
}

export default SearchForm

