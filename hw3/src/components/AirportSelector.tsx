import { useState } from 'react'
import { airportRegions, formatAirportDisplay } from '../data/airports'
import '../styles/AirportSelector.css'

interface AirportSelectorProps {
  title: string
  selectedAirport: string
  onSelect: (airport: string) => void
  onClose: () => void
  excludeAirport?: string // 要排除的機場（避免選擇相同的出發地和目的地）
}

const AirportSelector = ({ 
  title, 
  onSelect, 
  onClose, 
  excludeAirport 
}: AirportSelectorProps) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('taiwan')
  const [searchTerm, setSearchTerm] = useState('')

  // 過濾機場（排除指定的機場）
  const getFilteredAirports = () => {
    const region = airportRegions.find(r => r.id === selectedRegion)
    if (!region) return []
    
    let airports = region.airports
    
    // 排除指定的機場
    if (excludeAirport) {
      airports = airports.filter(airport => 
        formatAirportDisplay(airport) !== excludeAirport
      )
    }
    
    // 搜尋過濾
    if (searchTerm) {
      airports = airports.filter(airport => 
        airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        airport.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return airports
  }

  const handleAirportSelect = (airport: any) => {
    const airportString = formatAirportDisplay(airport)
    onSelect(airportString)
    onClose()
  }

  return (
    <div className="airport-selector-overlay">
      <div className="airport-selector-modal">
        <div className="airport-selector-header">
          <h2>{title}</h2>
          <button className="airport-selector-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="airport-selector-search">
          <input
            type="text"
            placeholder="選擇機場"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="airport-search-input"
          />
        </div>
        
        <div className="airport-selector-content">
          <div className="airport-selector-sidebar">
            {airportRegions.map(region => (
              <button
                key={region.id}
                className={`region-button ${selectedRegion === region.id ? 'active' : ''}`}
                onClick={() => setSelectedRegion(region.id)}
              >
                {region.name}
              </button>
            ))}
          </div>
          
          <div className="airport-selector-main">
            <div className="airport-list">
              {getFilteredAirports().map(airport => (
                <div
                  key={airport.code}
                  className="airport-item"
                  onClick={() => handleAirportSelect(airport)}
                >
                  <div className="airport-code">{airport.code}</div>
                  <div className="airport-info">
                    <div className="airport-city">{airport.city}, {airport.country}</div>
                    <div className="airport-name">{airport.code} {airport.city}國際機場</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AirportSelector
