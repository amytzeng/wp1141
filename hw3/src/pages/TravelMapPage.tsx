import { useMemo, useEffect, useRef } from 'react'
import { Order } from '../types/Order'
import { airports, getAirportCode } from '../data/airports'
import '../styles/TravelMapPage.css'

interface TravelMapPageProps {
  orders: Order[]
}

function TravelMapPage({ orders }: TravelMapPageProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  
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
  
  useEffect(() => {
    console.log('TravelMapPage useEffect 執行')
    console.log('visitedAirports:', visitedAirports)
    
    // 動態載入 Leaflet
    const loadLeaflet = async () => {
      console.log('開始載入 Leaflet')
      
      // 檢查是否已經載入
      if ((window as any).L) {
        console.log('Leaflet 已存在，直接初始化地圖')
        initializeMap()
        return
      }
      
      // 載入 CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet/dist/leaflet.css'
        document.head.appendChild(link)
        console.log('Leaflet CSS 已載入')
      }
      
      // 載入 JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet/dist/leaflet.js'
      script.onload = () => {
        console.log('Leaflet JS 載入完成')
        initializeMap()
      }
      script.onerror = () => {
        console.error('Leaflet JS 載入失敗')
      }
      document.head.appendChild(script)
    }
    
    const initializeMap = () => {
      console.log('開始初始化地圖')
      if (!mapRef.current) {
        console.log('mapRef.current 不存在')
        return
      }
      if (mapInstanceRef.current) {
        console.log('地圖已存在，先移除')
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      
      try {
        // 初始化地圖
        const L = (window as any).L
        const map = L.map(mapRef.current, {
          minZoom: 2,
          maxZoom: 10,
          maxBoundsViscosity: 1.0  // 拖動到邊界自動反彈
        }).setView([20, 0], 2)
        
        // 設定地圖可拖動範圍（整個世界緯度 -90~90，經度 -180~180）
        const southWest = L.latLng(-90, -180)
        const northEast = L.latLng(90, 180)
        const bounds = L.latLngBounds(southWest, northEast)
        
        map.setMaxBounds(bounds)
        
        // 限制拖動範圍
        map.on('drag', function() {
          map.panInsideBounds(bounds, { animate: false })
        })
        
        // 加入 OpenStreetMap 磚圖
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap'
        }).addTo(map)
        
        console.log('地圖基礎設定完成')
        
        // 添加旗幟標記
        visitedAirports.forEach((airport, index) => {
          console.log(`添加標記 ${index + 1}:`, airport)
          const flagIcon = L.divIcon({
            html: `<div style="
              font-size: 24px;
              text-align: center;
              line-height: 1;
              background: rgba(255, 255, 255, 0.8);
              border-radius: 50%;
              padding: 8px;
              border: 2px solid #007bff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">🏳️</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
          })
          
          const marker = L.marker([airport.coordinates.lat, airport.coordinates.lng], {
            icon: flagIcon
          }).addTo(map)
          
          marker.bindPopup(`
            <div style="text-align: center; min-width: 150px;">
              <h4 style="margin: 0 0 8px 0; color: #007bff;">${airport.city}, ${airport.country}</h4>
              <p style="margin: 0; font-size: 14px; color: #666;">
                <strong>機場:</strong> ${airport.code}<br>
                <strong>洲:</strong> ${airport.continent}
              </p>
            </div>
          `)
        })
        
        mapInstanceRef.current = map
        console.log('地圖初始化完成')
      } catch (error) {
        console.error('地圖初始化失敗:', error)
      }
    }
    
    // 延遲執行以確保 DOM 已渲染
    setTimeout(() => {
      loadLeaflet()
    }, 100)
    
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [visitedAirports])

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

