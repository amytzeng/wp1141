# Amy's Personal Website

這是一個現代化的個人網站，包含歡迎頁面、首頁、專案作品、課外活動和旅遊記錄等頁面。網站採用響應式設計，支援卡片式佈局和彈出視窗功能。

## 檔案結構

```
hw1/
├── welcome.html        # 歡迎頁面（入口頁面）
├── index.html          # 首頁（個人資料）
├── projects.html       # 專案作品
├── activities.html     # 課外活動
├── travel.html         # 旅遊記錄（互動地圖）
├── styles.css          # 樣式檔案
├── images/             # 圖片資料夾
│   ├── profile.jpg     # 個人照片
│   ├── welcome-photo.jpg # 歡迎頁面照片
│   ├── welcome_background.jpg # 歡迎頁面背景
│   ├── cal_2.jpg       # 助教活動照片
│   ├── gtm_1.png       # 導師計畫照片
│   ├── tkd_1.JPG       # 跆拳道照片
│   ├── cad_1.JPG       # 加拿大青年大使照片
│   ├── spch_3.JPEG     # 演講比賽照片
│   ├── elite_2.jpg     # 菁英營照片
│   ├── imc_2.JPEG      # 資管營照片
│   ├── flower_bot.jpeg # 專案照片
│   ├── seattle1.jpg, seattle2.jpg # 西雅圖照片
│   ├── bej_1.jpg, bej_2.jpg # 北京照片
│   ├── xm_1.jpg, xm_2.jpg # 廈門照片
│   ├── tpe_1.JPEG, tpe_2.JPEG # 台北照片
│   └── ...             # 其他活動照片
└── README.md           # 說明文件
```

## 網站特色

- **響應式設計**：支援手機、平板、電腦等各種裝置
- **卡片式佈局**：活動以卡片形式展示，包含預覽圖片
- **彈出視窗**：點擊卡片可查看詳細資訊和照片
- **互動地圖**：旅遊頁面使用 Leaflet 地圖顯示去過的地方
- **現代化配色**：使用深色主題配色方案（#1d1c48 漸層）

## 頁面說明

### 1. 歡迎頁面 (welcome.html)
- **網站入口頁面**：全螢幕漸層背景設計
- **內容**：個人照片、姓名（粗體白色）、歡迎標題
- **功能**：「Enter Website」按鈕連結到首頁
- **設計**：深色漸層背景，居中佈局

### 2. 首頁 (index.html)
- **個人基本資料展示**：
  - 姓名：Amy Tzeng
  - 教育背景：台大資管系（2023-至今）、台大植微系（2022-2023）、中山女高數理資優班（2019-2022）
  - 聯絡方式：Email、電話
  - 技能語言：C++、Python、Microsoft Office、Canva、Powerdirector
  - 語言能力：英文（IELTS 8.0、TOEFL iBT 98、TOEIC 930）、中文母語
- **快速導航**：Projects、Extracurricular Activities、Travel
- **注意**：首頁的 "Amy's Website" 標題沒有連結到歡迎頁面

### 3. 專案作品 (projects.html)
- **展示三個主要專案**：
  - **Gender Analysis Research**：研究助理，使用 Python 進行網路貼文情感分析
  - **Flower Bot**：後端開發專案，JSON 轉 DOCX 格式功能
  - **How Flaxseed Affect Lung Cancer Cell**：亞麻籽對肺癌細胞影響研究，主導研究員
- **每個專案包含**：角色、時間、簡介、技術、成果
- **注意**：此頁面的 "Amy's Website" 標題有連結到歡迎頁面

### 4. 課外活動 (activities.html)
- **卡片式佈局展示各類活動**，每個卡片都有預覽圖片：
  - **學術活動**：
    - Calculus & Statistics Tutor（助教）- 使用 `cal_2.jpg`
    - Global Talent Mentoring（導師計畫）- 使用 `gtm_1.png`
  - **社團活動**：
    - NTU Taekwondo Varsity Team（跆拳道校隊）- 使用 `tkd_1.JPG`
    - Student Association of Dept. of IM（資管系學會）- 使用文字標籤
  - **志工服務**：
    - OCAC Taiwan Youth Ambassador（青年大使）- 使用 `cad_1.JPG`
  - **競賽活動**：
    - NTU Speech Contest（演講比賽）- 使用 `spch_3.JPEG`
  - **其他活動**：
    - NTU x PKU Elite Camp（菁英營）- 使用 `elite_2.jpg`
    - IM Camp for High School Students（資管營）- 使用 `imc_2.JPEG`
- **彈出視窗功能**：點擊卡片查看詳細資訊和照片
- **注意**：此頁面的 "Amy's Website" 標題沒有連結到歡迎頁面

### 5. 旅遊記錄 (travel.html)
- **互動式世界地圖**：使用 Leaflet 地圖庫
- **標記去過的城市**：
  - 西雅圖（Seattle, USA）- March 2025
  - 溫哥華（Vancouver, Canada）- July 2025
  - 廈門（Xiamen, China）- August 2025
  - 北京（Beijing, China）- July 2024
  - 台北（Taipei, Taiwan）
- **地圖功能**：點擊標記查看旅遊照片和資訊
- **注意**：此頁面的 "Amy's Website" 標題沒有連結到歡迎頁面

## 導航結構

- **歡迎頁面** → 首頁（通過 Enter 按鈕）
- **首頁** → 各子頁面（通過導航選單和快速導航）
- **子頁面** → 歡迎頁面（僅 projects.html 的標題有連結）
- **所有頁面** → 歡迎頁面（通過 footer 的年份連結）

## 技術規格

- **HTML5**：語義化標籤和現代化結構
- **CSS3**：Flexbox、Grid、動畫效果、漸層背景
- **JavaScript**：彈出視窗互動、地圖功能
- **Leaflet**：互動地圖庫（CDN 載入）
- **響應式設計**：支援各種螢幕尺寸

## 如何運行網站

### 方法一：使用 Python（推薦）
```bash
# 進入 hw1 資料夾
cd hw1

# 啟動本地伺服器
python3 -m http.server 8000

# 在瀏覽器中開啟
# http://localhost:8000/welcome.html
```

### 方法二：使用 Node.js
```bash
# 安裝 http-server（如果還沒安裝）
npm install -g http-server

# 進入 hw1 資料夾
cd hw1

# 啟動伺服器
http-server

# 在瀏覽器中開啟顯示的網址
```

### 方法三：直接開啟檔案
- 雙擊 `welcome.html` 檔案
- 注意：某些功能（如地圖）可能需要本地伺服器才能正常運作

## 如何修改內容

### 更新個人資訊
1. 編輯 `index.html` 中的個人資料
2. 替換 `images/profile.jpg` 為你的照片
3. 更新 `welcome.html` 中的姓名和照片

### 添加新專案
1. 在 `projects.html` 中複製現有的 `.project-item` 區塊
2. 修改專案名稱、描述、技術等資訊

### 添加新活動
1. 在 `activities.html` 中複製現有的 `.card-item` 區塊
2. 更新活動資訊和圖片路徑
3. 添加對應的彈出視窗內容

### 添加旅遊地點
1. 在 `travel.html` 的 `pins` 陣列中添加新地點
2. 設定經緯度座標和相關資訊
3. 添加對應的照片到 `images/` 資料夾

## 圖片規格建議

- **個人照片**：200x200px（首頁和歡迎頁面）
- **活動卡片預覽**：200x200px（桌面）、150x150px（平板）、120x120px（手機）
- **彈出視窗照片**：與卡片預覽相同尺寸
- **旅遊照片**：300x200px
- **格式**：JPG、PNG、JPEG

## 注意事項

- 所有圖片建議使用 JPG 或 PNG 格式
- 記得定期備份你的個人資訊和照片
- 地圖功能需要網路連線（使用 CDN）
- 某些瀏覽器可能需要本地伺服器才能正常顯示地圖

## 故障排除

如果遇到問題：

1. **圖片無法顯示**：檢查圖片路徑和檔案名稱
2. **地圖無法載入**：確保有網路連線（使用 CDN）
3. **樣式異常**：檢查 `styles.css` 檔案路徑
4. **彈出視窗無法開啟**：檢查 JavaScript 控制台錯誤訊息
5. **導航連結錯誤**：確認 HTML 檔案路徑正確

祝你使用愉快！
