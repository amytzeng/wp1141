import { useState, useMemo } from 'react'
import { CabinClass, Flight } from '../types/Flight'
import '../styles/SeatSelector.css'

interface SeatSelectorProps {
  flight: Flight
  cabin: CabinClass
  onConfirm: (seatNumber: string) => void
  onClose: () => void
}

interface Seat {
  number: string
  available: boolean
  cabin: CabinClass
}

const SeatSelector = ({ flight, cabin, onConfirm, onClose }: SeatSelectorProps) => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)

  // 根據機型生成座位佈局 - 使用 useMemo 確保只生成一次
  const seats = useMemo(() => {
    const seats: Seat[] = []
    const isSmallAircraft = flight.aircraft === 'A321neo' // 180 seats
    const totalSeats = isSmallAircraft ? 180 : 300 // A350-900 has 300 seats
    
    // 計算各艙等座位數
    const firstClassSeats = Math.floor(totalSeats * 0.05)
    const businessClassSeats = Math.floor(totalSeats * 0.15)
    const economyClassSeats = totalSeats - firstClassSeats - businessClassSeats

    let seatNumber = 1
    let row = 1

    // 頭等艙 (1-1 config, 2 seats per row)
    const firstClassRows = Math.ceil(firstClassSeats / 2)
    for (let r = 0; r < firstClassRows; r++) {
      ['A', 'K'].forEach(letter => {
        if (seatNumber <= firstClassSeats) {
          seats.push({
            number: `${row}${letter}`,
            available: Math.random() > 0.3, // 70% 可用
            cabin: 'first'
          })
          seatNumber++
        }
      })
      row++
    }

    // 商務艙 (4-6 rows, 6 seats per row in 2-2-2 config)
    const businessClassRows = Math.ceil(businessClassSeats / 6)
    seatNumber = 1
    for (let r = 0; r < businessClassRows; r++) {
      ['A', 'C', 'D', 'F', 'G', 'K'].forEach(letter => {
        if (seatNumber <= businessClassSeats) {
          seats.push({
            number: `${row}${letter}`,
            available: Math.random() > 0.3, // 70% 可用
            cabin: 'business'
          })
          seatNumber++
        }
      })
      row++
    }

    // 經濟艙 (根據機型決定座位配置)
    if (isSmallAircraft) {
      // 小飛機：3-3-3 配置 (9 seats per row)
      const economySeatLayout = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K']
      const economyClassRows = Math.ceil(economyClassSeats / economySeatLayout.length)
      seatNumber = 1
      for (let r = 0; r < economyClassRows; r++) {
        economySeatLayout.forEach(letter => {
          if (seatNumber <= economyClassSeats) {
            seats.push({
              number: `${row}${letter}`,
              available: Math.random() > 0.3, // 70% 可用
              cabin: 'economy'
            })
            seatNumber++
          }
        })
        row++
      }
    } else {
      // 大飛機：大部分 3-4-3 配置，最後兩排 3-3-3 配置
      const layout334 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'] // 3-4-3 (10 seats)
      const layout333 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K'] // 3-3-3 (9 seats)
      
      // 計算座位數
      const totalRows = Math.ceil(economyClassSeats / layout334.length)
      const lastTwoRows = Math.min(2, totalRows)
      const normalRows = totalRows - lastTwoRows
      
      seatNumber = 1
      
      // 前面幾排：3-4-3 配置
      for (let r = 0; r < normalRows; r++) {
        layout334.forEach(letter => {
          if (seatNumber <= economyClassSeats) {
            seats.push({
              number: `${row}${letter}`,
              available: Math.random() > 0.3, // 70% 可用
              cabin: 'economy'
            })
            seatNumber++
          }
        })
        row++
      }
      
      // 最後兩排：3-3-3 配置
      for (let r = 0; r < lastTwoRows; r++) {
        layout333.forEach(letter => {
          if (seatNumber <= economyClassSeats) {
            seats.push({
              number: `${row}${letter}`,
              available: Math.random() > 0.3, // 70% 可用
              cabin: 'economy'
            })
            seatNumber++
          }
        })
        row++
      }
    }

    return seats
  }, [flight.aircraft]) // 只依賴於機型，確保座位佈局穩定

  // 根據艙等分組座位
  const firstClassSeats = seats.filter(s => s.cabin === 'first')
  const businessClassSeats = seats.filter(s => s.cabin === 'business')
  const economyClassSeats = seats.filter(s => s.cabin === 'economy')

  // 獲取當前艙等的座位
  const getCurrentCabinSeats = () => {
    switch (cabin) {
      case 'first':
        return firstClassSeats
      case 'business':
        return businessClassSeats
      case 'economy':
        return economyClassSeats
    }
  }

  const currentSeats = getCurrentCabinSeats()

  // 按排分組座位
  const groupSeatsByRow = (seats: Seat[]) => {
    const rows: { [key: string]: Seat[] } = {}
    seats.forEach(seat => {
      const row = seat.number.match(/\d+/)?.[0] || '0'
      if (!rows[row]) {
        rows[row] = []
      }
      rows[row].push(seat)
    })
    return rows
  }

  const handleSeatClick = (seat: Seat) => {
    if (seat.available && seat.cabin === cabin) {
      setSelectedSeat(seat.number)
    }
  }

  const handleConfirm = () => {
    if (selectedSeat) {
      onConfirm(selectedSeat)
    }
  }

  const getCabinName = (cabin: CabinClass): string => {
    switch (cabin) {
      case 'economy':
        return '經濟艙'
      case 'business':
        return '商務艙'
      case 'first':
        return '頭等艙'
    }
  }

  const getSeatLayout = (cabin: CabinClass, rowNumber?: number) => {
    const isSmallAircraft = flight.aircraft === 'A321neo'
    
    switch (cabin) {
      case 'first':
        return ['A', 'aisle1', 'K'] // 1-1 config with aisle
      case 'business':
        return ['A', 'C', 'aisle1', 'D', 'F', 'aisle2', 'G', 'K'] // 2-2-2 config with aisles
      case 'economy':
        if (isSmallAircraft) {
          return ['A', 'B', 'C', 'aisle1', 'D', 'E', 'F', 'aisle2', 'G', 'H', 'K'] // 3-3-3 config for small aircraft
        } else {
          // 大飛機：根據排數決定配置
          if (rowNumber !== undefined) {
            const totalRows = Math.ceil(economyClassSeats / 10) // 假設大部分是 3-4-3 (10 seats)
            const isLastTwoRows = rowNumber > totalRows - 2
            
            if (isLastTwoRows) {
              return ['A', 'B', 'C', 'aisle1', 'D', 'E', 'F', 'aisle2', 'G', 'H', 'K'] // 3-3-3 config for last two rows
            } else {
              return ['A', 'B', 'C', 'aisle1', 'D', 'E', 'F', 'G', 'aisle2', 'H', 'J', 'K'] // 3-4-3 config for normal rows
            }
          }
          // 預設返回 3-4-3 配置
          return ['A', 'B', 'C', 'aisle1', 'D', 'E', 'F', 'G', 'aisle2', 'H', 'J', 'K']
        }
    }
  }

  const rowsData = groupSeatsByRow(currentSeats)
  const sortedRows = Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b))

  return (
    <div className="seat-selector-overlay">
      <div className="seat-selector-modal">
        <div className="seat-selector-header">
          <h2>選擇座位</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="seat-selector-info">
          <div className="flight-info">
            <span className="info-label">航班：</span>
            <span className="info-value">{flight.flightNumber}</span>
            <span className="info-separator">|</span>
            <span className="info-label">艙等：</span>
            <span className="info-value">{getCabinName(cabin)}</span>
          </div>
          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat-icon available"></div>
              <span>可選</span>
            </div>
            <div className="legend-item">
              <div className="seat-icon selected"></div>
              <span>已選</span>
            </div>
            <div className="legend-item">
              <div className="seat-icon unavailable"></div>
              <span>不可選</span>
            </div>
          </div>
        </div>

        <div className="seat-map-container">
          <div className="aircraft-front">機頭 ✈</div>
          
          <div className="seat-map">
            {sortedRows.map(rowNum => {
              const rowNumber = parseInt(rowNum)
              const seatLayout = getSeatLayout(cabin, rowNumber)
              
              return (
                <div key={rowNum} className="seat-row">
                  <div className="row-number">{rowNum}</div>
                  <div className="seats">
                    {seatLayout.map((letter, index) => {
                      // 檢查是否為走道
                      if (letter.startsWith('aisle')) {
                        return <div key={`${letter}-${index}`} className="aisle"></div>
                      }
                      
                      const seat = rowsData[rowNum].find(s => s.number.endsWith(letter))
                      if (!seat) {
                        return <div key={letter} className="seat-spacer"></div>
                      }
                      
                      const isAvailable = seat.available && seat.cabin === cabin
                      const isSelected = seat.number === selectedSeat
                      const isUnavailable = !seat.available || seat.cabin !== cabin

                      return (
                        <div key={letter} className="seat-wrapper">
                          <button
                            className={`seat ${isSelected ? 'selected' : ''} ${isAvailable ? 'available' : 'unavailable'}`}
                            onClick={() => handleSeatClick(seat)}
                            disabled={!isAvailable}
                          >
                            {letter}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  <div className="row-number">{rowNum}</div>
                </div>
              )
            })}
          </div>

          <div className="aircraft-back">機尾</div>
        </div>

        <div className="seat-selector-footer">
          <div className="selected-seat-info">
            {selectedSeat ? (
              <span className="selected-text">已選座位: <strong>{selectedSeat}</strong></span>
            ) : (
              <span className="hint-text">請選擇座位</span>
            )}
          </div>
          <div className="action-buttons">
            <button className="cancel-button" onClick={onClose}>
              取消
            </button>
            <button 
              className="confirm-button" 
              onClick={handleConfirm}
              disabled={!selectedSeat}
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatSelector

