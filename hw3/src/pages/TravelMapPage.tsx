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
            <div className="map-image-container">
              <img 
                src="/vec_worldmap.jpg" 
                alt="世界地圖" 
                className="world-map-image"
              />
              
              {/* 標記訪問過的機場 */}
              {visitedAirports.map((airport) => {
                // 改進的座標映射，考慮地圖投影
                const lng = airport.coordinates.lng
                const lat = airport.coordinates.lat
                
                // 使用墨卡托投影的簡化版本
                const x = ((lng + 180) / 360) * 100
                const y = ((90 - lat) / 180) * 100
                
                // 基礎調整 - 所有地方都再垂直往下移兩倍
                let adjustedX = Math.max(0, Math.min(100, x - 3))
                let adjustedY = Math.max(0, Math.min(100, y + 8))
                
                // 特定地區的個別調整
                switch (airport.code) {
                  case 'SEA': // 西雅圖 - 往左下移動
                    adjustedX = Math.max(0, Math.min(100, x - 6))
                    adjustedY = Math.max(0, Math.min(100, y + 12))
                    break
                  case 'NRT': // 東京成田 - 往右下移動
                  case 'HND': // 東京羽田 - 往右下移動
                  case 'KIX': // 大阪 - 往右下移動
                  case 'FUK': // 福岡 - 往右下移動
                    adjustedX = Math.max(0, Math.min(100, x + 1))
                    adjustedY = Math.max(0, Math.min(100, y + 14))
                    break
                  case 'TPE': // 台北 - 往右移動
                  case 'TSA': // 台北松山 - 往右移動
                    adjustedX = Math.max(0, Math.min(100, x + 1))
                    adjustedY = Math.max(0, Math.min(100, y + 14))
                    break
                  case 'SIN': // 新加坡 - 往上移動
                    adjustedX = Math.max(0, Math.min(100, x - 1))
                    adjustedY = Math.max(0, Math.min(100, y + 8))
                    break
                  case 'SYD': // 雪梨 - 往右下移動
                  case 'MEL': // 墨爾本 - 往右下移動
                  case 'BNE': // 布里斯本 - 往右下移動
                    adjustedX = Math.max(0, Math.min(100, x - 1))
                    adjustedY = Math.max(0, Math.min(100, y + 8))
                    break
                }
                
                return (
                  <div 
                    key={airport.code} 
                    className="airport-marker"
                    style={{
                      position: 'absolute',
                      left: `${adjustedX}%`,
                      top: `${adjustedY}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="marker-circle"></div>
                    <div className="airport-label">{airport.city}</div>
                  </div>
                )
              })}
            </div>
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

