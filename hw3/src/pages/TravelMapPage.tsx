import { useMemo } from 'react'
import { Order } from '../types/Order'
import { airports, getAirportCode } from '../data/airports'
import '../styles/TravelMapPage.css'

interface TravelMapPageProps {
  orders: Order[]
}

function TravelMapPage({ orders }: TravelMapPageProps) {
  const visitedAirports = useMemo(() => {
    const airportCodes = new Set<string>()
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const depCode = getAirportCode(item.flight.departure)
        const destCode = getAirportCode(item.flight.destination)
        airportCodes.add(depCode)
        airportCodes.add(destCode)
      })
    })
    
    return Array.from(airportCodes).map(code => airports[code]).filter(Boolean)
  }, [orders])

  const statistics = useMemo(() => {
    const continentCountries = new Map<string, Set<string>>()
    
    visitedAirports.forEach(airport => {
      if (!continentCountries.has(airport.continent)) {
        continentCountries.set(airport.continent, new Set())
      }
      continentCountries.get(airport.continent)!.add(airport.country)
    })
    
    return Array.from(continentCountries.entries()).map(([continent, countries]) => ({
      continent,
      count: countries.size,
      countries: Array.from(countries)
    }))
  }, [visitedAirports])

  return (
    <main className="main-content">
      <div className="travel-map-container">
        <h2 className="page-title">我的旅行地圖</h2>
        
        <div className="map-section">
          <div className="world-map">
            <svg viewBox="0 0 1000 500" className="map-svg">
              {/* 海洋背景 */}
              <rect width="1000" height="500" fill="#0a1628" />
              
              {/* 大陸輪廓 - 更清楚明顯 */}
              <g className="continents">
                {/* 亞洲 */}
                <path d="M 580 140 L 620 110 L 680 100 L 750 120 L 820 140 L 860 180 L 870 220 L 850 260 L 820 290 L 770 310 L 720 315 L 670 305 L 630 280 L 600 240 L 585 200 L 580 160 Z" 
                      fill="#2a4a3a" stroke="#3d6e59" strokeWidth="3"/>
                
                {/* 歐洲 */}
                <path d="M 420 110 L 460 95 L 500 100 L 530 130 L 540 165 L 530 190 L 500 205 L 460 195 L 430 170 L 410 140 Z" 
                      fill="#2a4a3a" stroke="#3d6e59" strokeWidth="3"/>
                
                {/* 北美洲 */}
                <path d="M 120 90 L 180 75 L 240 85 L 290 110 L 310 150 L 300 190 L 280 220 L 240 240 L 190 245 L 150 220 L 120 180 L 110 140 Z" 
                      fill="#2a4a3a" stroke="#3d6e59" strokeWidth="3"/>
                
                {/* 南美洲 */}
                <path d="M 210 270 L 250 255 L 285 265 L 305 290 L 310 330 L 300 370 L 280 405 L 250 425 L 220 430 L 190 410 L 175 380 L 180 340 L 195 300 Z" 
                      fill="#2a4a3a" stroke="#3d6e59" strokeWidth="3"/>
                
                {/* 非洲 */}
                <path d="M 460 210 L 500 195 L 540 205 L 565 235 L 570 275 L 560 320 L 540 360 L 510 385 L 475 390 L 445 370 L 430 330 L 435 280 L 450 240 Z" 
                      fill="#2a4a3a" stroke="#3d6e59" strokeWidth="3"/>
                
                {/* 大洋洲 */}
                <path d="M 760 330 L 810 315 L 860 330 L 890 360 L 885 385 L 860 405 L 820 410 L 780 395 L 760 370 L 755 350 Z" 
                      fill="#2a4a3a" stroke="#3d6e59" strokeWidth="3"/>
              </g>
              
              {/* 標記訪問過的機場 */}
              {visitedAirports.map((airport) => {
                // 簡化的座標映射（實際應該用投影算法）
                const x = ((airport.coordinates.lng + 180) / 360) * 1000
                const y = ((90 - airport.coordinates.lat) / 180) * 500
                
                return (
                  <g key={airport.code} className="airport-marker">
                    <circle cx={x} cy={y} r="8" fill="var(--accent-color)" />
                    <text x={x} y={y - 15} className="flag-icon" textAnchor="middle">
                      🚩
                    </text>
                    <text x={x} y={y + 25} className="airport-label" textAnchor="middle">
                      {airport.city}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="statistics-section">
          <h3 className="section-title">旅行統計</h3>
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-number">{visitedAirports.length}</div>
              <div className="stat-label">個機場</div>
            </div>
            
            {statistics.map(stat => (
              <div key={stat.continent} className="stat-card">
                <div className="stat-continent">{stat.continent}</div>
                <div className="stat-number">{stat.count}</div>
                <div className="stat-label">個國家/地區</div>
                <div className="stat-countries">
                  {stat.countries.join('、')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="airports-list">
          <h3 className="section-title">訪問過的機場</h3>
          <div className="airports-grid">
            {visitedAirports.map(airport => (
              <div key={airport.code} className="airport-item">
                <div className="airport-flag">🚩</div>
                <div className="airport-info">
                  <div className="airport-name">{airport.city} ({airport.code})</div>
                  <div className="airport-location">{airport.country} • {airport.continent}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default TravelMapPage

