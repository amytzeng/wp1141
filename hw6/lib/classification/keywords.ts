import { CategoryDefinition } from './types';

/**
 * Category keyword mappings
 * Each subcategory has a list of keywords that help identify messages
 * belonging to that category
 */
export const CATEGORY_KEYWORDS: Record<string, CategoryDefinition[]> = {
  humanities: [
    {
      mainCategory: 'humanities',
      subCategory: 'chinese_literature',
      displayName: { zh: '中國文學', en: 'Chinese Literature' },
      keywords: [
        '詩', '詞', '古文', '文言文', '唐詩', '宋詞', '元曲', '文學', '小說', '散文',
        '詩歌', '詩人', '作家', '文學作品', '詩經', '楚辭', '論語', '孟子', '莊子',
        '紅樓夢', '水滸傳', '三國演義', '西遊記', '魯迅', '李白', '杜甫', '蘇軾'
      ],
    },
    {
      mainCategory: 'humanities',
      subCategory: 'foreign_literature',
      displayName: { zh: '外國文學', en: 'Foreign Literature' },
      keywords: [
        '英文', '英文文學', '莎士比亞', 'novel', 'poetry', 'literature', 'drama',
        '英國文學', '美國文學', '法國文學', '日本文學', '世界文學', '文學作品',
        '哈姆雷特', '羅密歐與茱麗葉', '傲慢與偏見', '戰爭與和平'
      ],
    },
    {
      mainCategory: 'humanities',
      subCategory: 'history',
      displayName: { zh: '歷史', en: 'History' },
      keywords: [
        '歷史', '朝代', '古代', '近代', '史', '考古', '歷史事件', '歷史人物',
        '中國歷史', '世界歷史', '台灣歷史', '歷史學', '史學', '史料', '歷史研究',
        '秦始皇', '漢朝', '唐朝', '宋朝', '明朝', '清朝', '民國', '二戰', '冷戰'
      ],
    },
    {
      mainCategory: 'humanities',
      subCategory: 'philosophy',
      displayName: { zh: '哲學', en: 'Philosophy' },
      keywords: [
        '哲學', '思想', '倫理', '道德', '存在', 'philosophy', 'ethics', 'metaphysics',
        '中國哲學', '西方哲學', '儒家', '道家', '佛家', '存在主義', '實用主義',
        '孔子', '老子', '莊子', '柏拉圖', '亞里斯多德', '康德', '尼采'
      ],
    },
    {
      mainCategory: 'humanities',
      subCategory: 'linguistics',
      displayName: { zh: '語言學', en: 'Linguistics' },
      keywords: [
        '語言', '語法', '語音', '語義', '語言學', 'linguistics', 'grammar', 'syntax',
        '語音學', '語義學', '語用學', '詞彙', '句法', '語音分析', '語言結構',
        '語言習得', '語言發展', '語言變化'
      ],
    },
  ],
  business: [
    {
      mainCategory: 'business',
      subCategory: 'economics',
      displayName: { zh: '經濟學', en: 'Economics' },
      keywords: [
        '經濟', '經濟學', '供需', '市場', 'GDP', '通膨', 'economics', 'supply', 'demand',
        '微觀經濟', '宏觀經濟', '市場經濟', '計劃經濟', '經濟政策', '經濟成長',
        '通貨膨脹', '失業率', '利率', '匯率', '貿易', '國際經濟'
      ],
    },
    {
      mainCategory: 'business',
      subCategory: 'management',
      displayName: { zh: '管理學', en: 'Management' },
      keywords: [
        '管理', '管理學', '組織', '領導', '策略', 'management', 'leadership', 'strategy',
        '企業管理', '人力資源', '組織行為', '管理理論', '專案管理', '品質管理',
        '管理技巧', '管理方法', '管理決策', '團隊管理'
      ],
    },
    {
      mainCategory: 'business',
      subCategory: 'accounting',
      displayName: { zh: '會計學', en: 'Accounting' },
      keywords: [
        '會計', '會計學', '財務報表', '借貸', '會計科目', 'accounting', 'balance sheet',
        '損益表', '現金流量表', '會計原則', '會計準則', '會計分錄', '會計處理',
        '審計', '成本會計', '管理會計', '財務會計'
      ],
    },
    {
      mainCategory: 'business',
      subCategory: 'finance',
      displayName: { zh: '財務金融', en: 'Finance' },
      keywords: [
        '金融', '財務', '投資', '股票', '債券', 'finance', 'investment', 'stock', 'bond',
        '金融市場', '證券', '期貨', '選擇權', '投資組合', '風險管理', '財務分析',
        '資本市場', '銀行', '保險', '理財'
      ],
    },
    {
      mainCategory: 'business',
      subCategory: 'marketing',
      displayName: { zh: '行銷學', en: 'Marketing' },
      keywords: [
        '行銷', '市場行銷', '廣告', '品牌', 'marketing', 'advertising', 'brand',
        '市場分析', '消費者行為', '產品定位', '價格策略', '促銷', '通路',
        '數位行銷', '社群媒體行銷', '行銷策略', '行銷研究'
      ],
    },
  ],
  stem: [
    {
      mainCategory: 'stem',
      subCategory: 'mathematics',
      displayName: { zh: '數學', en: 'Mathematics' },
      keywords: [
        '數學', '微積分', '代數', '幾何', '統計', 'math', 'calculus', 'algebra', 'geometry',
        '線性代數', '微分', '積分', '函數', '方程式', '矩陣', '向量', '機率',
        '離散數學', '數論', '數學分析', '數學證明'
      ],
    },
    {
      mainCategory: 'stem',
      subCategory: 'physics',
      displayName: { zh: '物理學', en: 'Physics' },
      keywords: [
        '物理', '物理學', '力學', '電學', '光學', 'physics', 'mechanics', 'electricity',
        '熱力學', '電磁學', '量子力學', '相對論', '牛頓', '愛因斯坦', '物理定律',
        '能量', '動量', '波', '粒子', '物理實驗'
      ],
    },
    {
      mainCategory: 'stem',
      subCategory: 'chemistry',
      displayName: { zh: '化學', en: 'Chemistry' },
      keywords: [
        '化學', '化學反應', '元素', '分子', '原子', 'chemistry', 'reaction', 'molecule',
        '有機化學', '無機化學', '物理化學', '分析化學', '化學鍵', '化學式',
        '化學平衡', '酸鹼', '氧化還原', '化學實驗', '化學方程式'
      ],
    },
    {
      mainCategory: 'stem',
      subCategory: 'computer_science',
      displayName: { zh: '資訊科學', en: 'Computer Science' },
      keywords: [
        '程式', '程式設計', '演算法', '資料結構', 'programming', 'algorithm', 'code',
        '程式語言', 'Python', 'Java', 'JavaScript', 'C++', '資料庫', '軟體開發',
        '人工智慧', '機器學習', '資料科學', '網路', '資訊安全', '系統設計'
      ],
    },
    {
      mainCategory: 'stem',
      subCategory: 'statistics',
      displayName: { zh: '統計學', en: 'Statistics' },
      keywords: [
        '統計', '統計學', '機率', '資料分析', 'statistics', 'probability', 'data analysis',
        '描述統計', '推論統計', '假設檢定', '迴歸分析', '抽樣', '統計方法',
        '資料視覺化', '統計軟體', 'R', 'SPSS', '統計模型'
      ],
    },
  ],
  life_sciences: [
    {
      mainCategory: 'life_sciences',
      subCategory: 'biology',
      displayName: { zh: '生物學', en: 'Biology' },
      keywords: [
        '生物', '生物學', '細胞', '基因', '演化', 'biology', 'cell', 'genetics', 'evolution',
        '分子生物', '細胞生物', '遺傳學', '生態學', '生物多樣性', 'DNA', 'RNA',
        '蛋白質', '生物化學', '生理學', '生物實驗'
      ],
    },
    {
      mainCategory: 'life_sciences',
      subCategory: 'medicine',
      displayName: { zh: '醫學', en: 'Medicine' },
      keywords: [
        '醫學', '疾病', '治療', '症狀', '診斷', 'medicine', 'disease', 'treatment', 'diagnosis',
        '臨床', '藥物', '手術', '醫療', '健康', '病患', '醫師', '護理',
        '內科', '外科', '兒科', '婦產科', '醫學研究'
      ],
    },
    {
      mainCategory: 'life_sciences',
      subCategory: 'agriculture',
      displayName: { zh: '農學', en: 'Agriculture' },
      keywords: [
        '農業', '農學', '作物', '種植', 'agriculture', 'crop', 'farming', 'cultivation',
        '農作物', '農產品', '土壤', '肥料', '灌溉', '農業技術', '農業經濟',
        '園藝', '畜牧', '農業機械', '農業科學'
      ],
    },
    {
      mainCategory: 'life_sciences',
      subCategory: 'food_science',
      displayName: { zh: '食品科學', en: 'Food Science' },
      keywords: [
        '食品', '食品科學', '營養', '食品安全', 'food', 'nutrition', 'food safety',
        '食品加工', '食品化學', '食品微生物', '營養學', '食品添加物', '食品檢驗',
        '飲食', '健康飲食', '食品保存', '食品包裝'
      ],
    },
    {
      mainCategory: 'life_sciences',
      subCategory: 'environmental_science',
      displayName: { zh: '環境科學', en: 'Environmental Science' },
      keywords: [
        '環境', '環境科學', '環保', '污染', 'environment', 'pollution', 'environmental',
        '環境保護', '氣候變遷', '全球暖化', '永續發展', '環境工程', '環境影響評估',
        '廢水處理', '廢棄物', '資源回收', '環境監測'
      ],
    },
  ],
  others: [
    {
      mainCategory: 'others',
      subCategory: 'arts_design',
      displayName: { zh: '藝術設計', en: 'Arts & Design' },
      keywords: [
        '藝術', '設計', '繪畫', '音樂', 'art', 'design', 'drawing', 'music',
        '美術', '視覺設計', '平面設計', '工業設計', '建築設計', '室內設計',
        '攝影', '雕塑', '藝術史', '設計理論', '創意', '美學'
      ],
    },
    {
      mainCategory: 'others',
      subCategory: 'education',
      displayName: { zh: '教育學', en: 'Education' },
      keywords: [
        '教育', '教學', '學習', '課程', 'education', 'teaching', 'learning', 'curriculum',
        '教育學', '教學方法', '學習理論', '課程設計', '教育心理', '教育政策',
        '師資', '學生', '學校', '教育研究', '教學技巧'
      ],
    },
    {
      mainCategory: 'others',
      subCategory: 'psychology',
      displayName: { zh: '心理學', en: 'Psychology' },
      keywords: [
        '心理', '心理學', '認知', '行為', 'psychology', 'cognitive', 'behavior',
        '心理學研究', '認知心理', '發展心理', '社會心理', '臨床心理', '諮商',
        '心理治療', '心理測驗', '心理狀態', '心理健康', '心理疾病'
      ],
    },
    {
      mainCategory: 'others',
      subCategory: 'sociology',
      displayName: { zh: '社會學', en: 'Sociology' },
      keywords: [
        '社會', '社會學', '社會問題', 'sociology', 'social', 'society',
        '社會研究', '社會結構', '社會變遷', '社會現象', '社會議題', '社會運動',
        '文化', '社會階層', '社會制度', '社會關係', '社會調查'
      ],
    },
    {
      mainCategory: 'others',
      subCategory: 'law',
      displayName: { zh: '法律', en: 'Law' },
      keywords: [
        '法律', '法學', '法條', '訴訟', 'law', 'legal', 'lawyer', 'court',
        '民法', '刑法', '憲法', '行政法', '商法', '智慧財產權', '契約',
        '法律問題', '法律諮詢', '判決', '法規', '法律條文'
      ],
    },
  ],
};

/**
 * Get all category definitions as a flat array
 */
export function getAllCategoryDefinitions(): CategoryDefinition[] {
  return Object.values(CATEGORY_KEYWORDS).flat();
}

/**
 * Get category definition by main and sub category
 */
export function getCategoryDefinition(
  mainCategory: string,
  subCategory: string
): CategoryDefinition | undefined {
  const categories = CATEGORY_KEYWORDS[mainCategory];
  if (!categories) return undefined;
  return categories.find((cat) => cat.subCategory === subCategory);
}

