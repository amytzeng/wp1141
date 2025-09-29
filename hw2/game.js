class TowerDefenseGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasWidth = 700;
        this.canvasHeight = 400;
        
        // 遊戲狀態
        this.currentLevel = 1;
        this.lives = 5;
        this.coins = 100;
        this.currentWave = 0;
        this.totalWaves = 5; // 將在 startLevel 中動態設定
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.survivalWaveCount = 0; // Survival 模式波次計數器
        this.selectedTower = null;
        this.shovelMode = false; // 鏟子模式
        this.selectedTowerForUpgrade = null; // 選中要升級的塔防
        this.waveStarted = false;
        this.waveInProgress = false;
        this.timer = 0;
        this.maxTimer = 0;
        this.timerInterval = null;
        this.completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
        this.coinAnimations = [];
        this.score = 0;
        this.scoreAnimations = [];
        this.gameSpeed = 1;
        this.isFastForward = false;
        this.ownedSkins = JSON.parse(localStorage.getItem('ownedSkins') || '{"basic":["default"],"rapid":["default"],"heavy":["default"]}');
        this.equippedSkins = JSON.parse(localStorage.getItem('equippedSkins') || '{"basic":"default","rapid":"default","heavy":"default"}');
        this.shopCoins = parseInt(localStorage.getItem('shopCoins') || '100');
        this.shopData = this.initializeShopData();
        this.currentLevelScore = 0;
        this.currentLevelCoins = 0;
        this.shopTabsInitialized = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.gameLoopRunning = false;
        
        // 音效系統
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = localStorage.getItem('gameMuted') === 'true';
        this.audioUnlocked = false;
        this.initAudio();
        
        // 遊戲物件
        this.towers = [];
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        
        // 背景圖片緩存
        this.backgroundImages = {};
        
        // 關卡配置
        this.levels = this.initializeLevels();
        this.currentLevelData = this.levels[this.currentLevel - 1];
        
        // 塔防配置
        this.towerTypes = {
            basic: { cost: 20, damage: 20, range: 80, fireRate: 1000, color: '#f1c40f' },
            rapid: { cost: 40, damage: 10, range: 50, fireRate: 300, color: '#8e44ad' },
            heavy: { cost: 70, damage: 80, range: 120, fireRate: 2000, color: '#e74c3c' }
        };
        
        // 怪物配置
        this.enemyTypes = {
            basic: { health: 70, speed: 0.5, reward: 1, color: '#e74c3c' },
            fast: { health: 50, speed: 1, reward: 3, color: '#f39c12' },
            tank: { health: 300, speed: 0.3, reward: 5, color: '#3498db' },
            boss_2: { health: 1000, speed: 0.2, reward: 10, color: '#8e44ad' },
            boss_4: { health: 2000, speed: 0.2, reward: 15, color: '#8e44ad' },
            boss_6: { health: 4000, speed: 0.2, reward: 20, color: '#8e44ad' },
            boss_8: { health: 5000, speed: 0.2, reward: 30, color: '#8e44ad' },
            boss: { health: 10000, speed: 0.1, reward: 50, color: '#8e44ad' } // Boss敵人
        };
        
        this.initializeEventListeners();
        this.updateMuteButton();
        this.showStartScreen();
    }
    
    initializeShopData() {
        return {
            basic: [
                { id: 'default', name: '預設', color: '#f1c40f', price: 0, bonus: { damage: 0, range: 0, fireRate: 0 }, description: '標準基礎塔，平衡的攻擊力和射程' },
                { id: 'triangle', name: '三角形', color: '#e74c3c', price: 50, bonus: { damage: 8, range: 0, fireRate: 0 }, description: '攻擊型造型，大幅提升攻擊力，適合對付高血量敵人' },
                { id: 'square', name: '正方形', color: '#3498db', price: 50, bonus: { damage: 0, range: 15, fireRate: 0 }, description: '射程型造型，擴大攻擊範圍，覆蓋更多區域' }
            ],
            rapid: [
                { id: 'default', name: '預設', color: '#8e44ad', price: 0, bonus: { damage: 0, range: 0, fireRate: 0 }, description: '標準快速塔，高射速低傷害，適合清理小兵' },
                { id: 'triangle', name: '三角形', color: '#27ae60', price: 75, bonus: { damage: 5, range: 0, fireRate: 0 }, description: '攻擊型造型，提升攻擊力，快速擊殺敵人' },
                { id: 'square', name: '正方形', color: '#e67e22', price: 75, bonus: { damage: 0, range: 12, fireRate: 0 }, description: '射程型造型，擴大攻擊範圍，覆蓋更多敵人' }
            ],
            heavy: [
                { id: 'default', name: '預設', color: '#e74c3c', price: 0, bonus: { damage: 0, range: 0, fireRate: 0 }, description: '標準重型塔，高傷害低射速，對付坦克敵人' },
                { id: 'triangle', name: '三角形', color: '#8e44ad', price: 100, bonus: { damage: 15, range: 0, fireRate: 0 }, description: '毀滅型造型，極高攻擊力，一擊必殺' },
                { id: 'square', name: '正方形', color: '#f1c40f', price: 100, bonus: { damage: 0, range: 25, fireRate: 0 }, description: '王者型造型，超遠射程，覆蓋整個戰場' }
            ]
        };
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('音效系統初始化成功，狀態:', this.audioContext.state);
            this.createSounds();
        } catch (e) {
            console.log('音效系統初始化失敗:', e);
        }
    }
    
    createSounds() {
        // 創建音效
        this.sounds = {
            shoot: this.createTone(800, 0.1, 'sine'),
            hit: this.createTone(400, 0.2, 'square'),
            enemyDeath: this.createTone(200, 0.3, 'sawtooth'),
            towerPlace: this.createTone(600, 0.15, 'triangle'),
            waveStart: this.createTone(1000, 0.5, 'sine'),
            gameOver: this.createTone(150, 1, 'sawtooth')
        };
        console.log('音效創建完成:', Object.keys(this.sounds));
    }
    
    createTone(frequency, duration, type = 'sine') {
        return () => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }
    
    playSound(soundName) {
        console.log('嘗試播放音效:', soundName, '靜音:', this.isMuted, '解鎖:', this.audioUnlocked, '音效存在:', !!this.sounds[soundName]);
        if (!this.isMuted && this.audioUnlocked && this.sounds[soundName]) {
            try {
                this.sounds[soundName]();
                console.log('音效播放成功:', soundName);
            } catch (e) {
                console.log('音效播放失敗:', e);
            }
        }
    }
    
    unlockAudio() {
        if (!this.audioUnlocked && this.audioContext) {
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    this.audioUnlocked = true;
                    console.log('音效已解鎖');
                }).catch(e => {
                    console.log('音效解鎖失敗:', e);
                });
            } else {
                this.audioUnlocked = true;
                console.log('音效已解鎖');
            }
        }
    }
    
    toggleMute() {
        const wasMuted = this.isMuted;
        this.isMuted = !this.isMuted;
        localStorage.setItem('gameMuted', this.isMuted.toString());
        this.updateMuteButton();
        
        // 如果從靜音狀態解除，播放提示音
        if (wasMuted && !this.isMuted) {
            this.playSound('towerPlace');
        }
    }
    
    updateMuteButton() {
        const muteButtons = ['mute-btn', 'mute-btn-level', 'mute-btn-guide', 'mute-btn-game'];
        muteButtons.forEach(btnId => {
            const muteBtn = document.getElementById(btnId);
            if (muteBtn) {
                if (this.isMuted) {
                    muteBtn.textContent = '🔇';
                    muteBtn.classList.add('muted');
                } else {
                    muteBtn.textContent = '🔊';
                    muteBtn.classList.remove('muted');
                }
            }
        });
    }
    
    initializeLevels() {
        return [
            {
                name: "大坡池",
                background: "bg/1_大坡池.jpg",
                path: [
                    { x: 0, y: 200 },
                    { x: 150, y: 200 },
                    { x: 150, y: 100 },
                    { x: 300, y: 100 },
                    { x: 300, y: 300 },
                    { x: 500, y: 300 },
                    { x: 500, y: 200 },
                    { x: 700, y: 200 }
                ],
                waves: [
                    { enemies: [{ type: 'basic', count: 5, delay: 1000 }] },
                    { enemies: [{ type: 'basic', count: 8, delay: 800 }] },
                    { enemies: [{ type: 'fast', count: 6, delay: 600 }] },
                    { enemies: [{ type: 'basic', count: 10, delay: 700 }, { type: 'fast', count: 5, delay: 1000 }] },
                    { enemies: [{ type: 'tank', count: 3, delay: 2000 }, { type: 'basic', count: 8, delay: 500 }] }
                ]
            },
            {
                name: "植物園",
                background: "bg/2_植物園.jpg",
                path: [
                    { x: 0, y: 100 },
                    { x: 100, y: 100 },
                    { x: 100, y: 300 },
                    { x: 250, y: 300 },
                    { x: 250, y: 150 },
                    { x: 400, y: 150 },
                    { x: 400, y: 300 },
                    { x: 700, y: 300 }
                ],
                waves: [
                    { enemies: [{ type: 'basic', count: 6, delay: 900 }] },
                    { enemies: [{ type: 'fast', count: 8, delay: 700 }] },
                    { enemies: [{ type: 'tank', count: 2, delay: 1500 }] },
                    { enemies: [{ type: 'basic', count: 12, delay: 600 }, { type: 'fast', count: 6, delay: 800 }] },
                    { enemies: [{ type: 'fast', count: 10, delay: 500 }, { type: 'boss_2', count: 1, delay: 1000 }] }
                ]
            },
            {
                name: "華盛頓大學",
                background: "bg/3_華盛頓大學.jpg",
                path: [
                    { x: 0, y: 300 },
                    { x: 80, y: 300 },
                    { x: 80, y: 150 },
                    { x: 200, y: 150 },
                    { x: 200, y: 300 },
                    { x: 350, y: 300 },
                    { x: 350, y: 80 },
                    { x: 500, y: 80 },
                    { x: 500, y: 200 },
                    { x: 700, y: 200 }
                ],
                waves: [
                    { enemies: [{ type: 'basic', count: 8, delay: 800 }] },
                    { enemies: [{ type: 'fast', count: 10, delay: 600 }] },
                    { enemies: [{ type: 'tank', count: 3, delay: 1000 }] },
                    { enemies: [{ type: 'basic', count: 15, delay: 500 }, { type: 'fast', count: 8, delay: 700 }] },
                    { enemies: [{ type: 'tank', count: 5, delay: 1000 }, { type: 'fast', count: 12, delay: 400 }] }
                ]
            },
            {
                name: "頤和園",
                background: "bg/4_頤和園.jpg",
                path: [
                    { x: 0, y: 80 },
                    { x: 150, y: 80 },
                    { x: 150, y: 200 },
                    { x: 300, y: 200 },
                    { x: 300, y: 320 },
                    { x: 500, y: 320 },
                    { x: 500, y: 150 },
                    { x: 700, y: 150 }
                ],
                waves: [
                    { enemies: [{ type: 'fast', count: 8, delay: 600 }] },
                    { enemies: [{ type: 'basic', count: 12, delay: 700 }] },
                    { enemies: [{ type: 'tank', count: 4, delay: 800 }] },
                    { enemies: [{ type: 'fast', count: 15, delay: 400 }, { type: 'basic', count: 10, delay: 600 }] },
                    { enemies: [{ type: 'tank', count: 6, delay: 800 }, { type: 'fast', count: 5, delay: 300 }, { type: 'boss_4', count: 1, delay: 1000 }] }
                ]
            },
            {
                name: "長城",
                background: "bg/5_長城.jpg",
                path: [
                    { x: 0, y: 200 },
                    { x: 80, y: 200 },
                    { x: 80, y: 80 },
                    { x: 200, y: 80 },
                    { x: 200, y: 320 },
                    { x: 350, y: 320 },
                    { x: 350, y: 150 },
                    { x: 500, y: 150 },
                    { x: 500, y: 250 },
                    { x: 700, y: 250 }
                ],
                waves: [
                    { enemies: [{ type: 'basic', count: 10, delay: 600 }] },
                    { enemies: [{ type: 'fast', count: 12, delay: 500 }] },
                    { enemies: [{ type: 'tank', count: 5, delay: 800 }] },
                    { enemies: [{ type: 'basic', count: 20, delay: 400 }, { type: 'fast', count: 15, delay: 500 }] },
                    { enemies: [{ type: 'tank', count: 8, delay: 600 }, { type: 'fast', count: 20, delay: 300 }] }
                ]
            },
            {
                name: "小琉球",
                background: "bg/6_小琉球.jpg",
                path: [
                    { x: 0, y: 150 },
                    { x: 100, y: 150 },
                    { x: 100, y: 50 },
                    { x: 250, y: 50 },
                    { x: 250, y: 200 },
                    { x: 400, y: 200 },
                    { x: 400, y: 100 },
                    { x: 550, y: 100 },
                    { x: 550, y: 250 },
                    { x: 700, y: 250 }
                ],
                waves: [
                    { enemies: [{ type: 'tank', count: 4, delay: 1000 }] },
                    { enemies: [{ type: 'basic', count: 20, delay: 500 }] },
                    { enemies: [{ type: 'fast', count: 18, delay: 400 }] },
                    { enemies: [{ type: 'tank', count: 10, delay: 600 }, { type: 'basic', count: 15, delay: 300 }] },
                    { enemies: [{ type: 'fast', count: 20, delay: 250 }, { type: 'tank', count: 6, delay: 500 }, { type: 'boss_6', count: 1, delay: 1000 }] }
                ]
            },
            {
                name: "溪頭",
                background: "bg/7_溪頭.jpg",
                paths: [
                    // 上路徑（完整路徑）
                    [
                        { x: 0, y: 200 },
                        { x: 150, y: 200 },
                        { x: 150, y: 100 },
                        { x: 300, y: 100 },
                        { x: 300, y: 200 },
                        { x: 450, y: 200 },
                        { x: 450, y: 100 },
                        { x: 600, y: 100 },
                        { x: 600, y: 200 },
                        { x: 700, y: 200 }
                    ],
                    // 下路徑（完整路徑）
                    [
                        { x: 0, y: 200 },
                        { x: 150, y: 200 },
                        { x: 150, y: 300 },
                        { x: 300, y: 300 },
                        { x: 300, y: 200 },
                        { x: 450, y: 200 },
                        { x: 450, y: 300 },
                        { x: 600, y: 300 },
                        { x: 600, y: 200 },
                        { x: 700, y: 200 }
                    ]
                ],
                waves: [
                    { enemies: [{ type: 'fast', count: 10, delay: 500 }] },
                    { enemies: [{ type: 'tank', count: 8, delay: 800 }] },
                    { enemies: [{ type: 'basic', count: 25, delay: 300 }] },
                    { enemies: [{ type: 'fast', count: 20, delay: 350 }, { type: 'tank', count: 6, delay: 600 }] },
                    { enemies: [{ type: 'basic', count: 30, delay: 200 }, { type: 'fast', count: 25, delay: 250 }] }
                ]
            },
            {
                name: "阿里山",
                background: "bg/8_阿里山.jpg",
                path: [
                    { x: 0, y: 200 },
                    { x: 80, y: 200 },
                    { x: 80, y: 80 },
                    { x: 200, y: 80 },
                    { x: 200, y: 320 },
                    { x: 320, y: 320 },
                    { x: 320, y: 160 },
                    { x: 440, y: 160 },
                    { x: 440, y: 280 },
                    { x: 560, y: 280 },
                    { x: 560, y: 120 },
                    { x: 700, y: 120 }
                ],
                waves: [
                    { enemies: [{ type: 'basic', count: 12, delay: 400 }] },
                    { enemies: [{ type: 'tank', count: 10, delay: 700 }] },
                    { enemies: [{ type: 'fast', count: 22, delay: 300 }] },
                    { enemies: [{ type: 'basic', count: 25, delay: 250 }, { type: 'fast', count: 18, delay: 400 }] },
                    { enemies: [{ type: 'tank', count: 10, delay: 500 }, { type: 'fast', count: 20, delay: 200 }, { type: 'boss_8', count: 1, delay: 1000 }] }
                ]
            },
            {
                name: "WreckBeach",
                background: "bg/9_WreckBeach.jpg",
                paths: [
                    // 上路徑
                    [
                        { x: 0, y: 100 },
                        { x: 150, y: 100 },
                        { x: 150, y: 250 },
                        { x: 300, y: 250 },
                        { x: 300, y: 50 },
                        { x: 450, y: 50 },
                        { x: 450, y: 200 },
                        { x: 600, y: 200 },
                        { x: 600, y: 350 },
                        { x: 700, y: 350 }
                    ],
                    // 下路徑
                    [
                        { x: 0, y: 100 },
                        { x: 150, y: 100 },
                        { x: 150, y: 250 },
                        { x: 300, y: 250 },
                        { x: 300, y: 50 },
                        { x: 450, y: 50 },
                        { x: 450, y: 200 },
                        { x: 600, y: 200 },
                        { x: 600, y: 100 },
                        { x: 700, y: 100 }
                    ]
                ],
                waves: [
                    { enemies: [{ type: 'tank', count: 8, delay: 600 }] },
                    { enemies: [{ type: 'fast', count: 20, delay: 400 }] },
                    { enemies: [{ type: 'basic', count: 30, delay: 250 }] },
                    { enemies: [{ type: 'tank', count: 15, delay: 400 }, { type: 'fast', count: 25, delay: 300 }] },
                    { enemies: [{ type: 'basic', count: 40, delay: 150 }, { type: 'tank', count: 18, delay: 350 }] }
                ]
            },
            {
                name: "Victoria",
                background: "bg/10_Victoria.jpg",
                path: [
                    { x: 0, y: 200 },
                    { x: 100, y: 200 },
                    { x: 100, y: 100 },
                    { x: 200, y: 100 },
                    { x: 200, y: 300 },
                    { x: 300, y: 300 },
                    { x: 300, y: 50 },
                    { x: 400, y: 50 },
                    { x: 400, y: 250 },
                    { x: 500, y: 250 },
                    { x: 500, y: 150 },
                    { x: 600, y: 150 },
                    { x: 600, y: 350 },
                    { x: 700, y: 350 }
                ],
                waves: [
                    { enemies: [{ type: 'basic', count: 30, delay: 400 }] },
                    { enemies: [{ type: 'fast', count: 35, delay: 300 }] },
                    { enemies: [{ type: 'tank', count: 25, delay: 500 }] },
                    { enemies: [{ type: 'basic', count: 40, delay: 200 }, { type: 'fast', count: 30, delay: 300 }] },
                    { enemies: [{ type: 'boss', count: 1, delay: 0 }] } // Boss波次
                ]
            },
            {
                name: "Survival",
                background: "bg/11_MOA.jpg",
                path: [
                    { x: 0, y: 50 },
                    { x: 100, y: 50 },
                    { x: 100, y: 150 },
                    { x: 200, y: 150 },
                    { x: 200, y: 80 },
                    { x: 300, y: 80 },
                    { x: 300, y: 200 },
                    { x: 400, y: 200 },
                    { x: 400, y: 120 },
                    { x: 500, y: 120 },
                    { x: 500, y: 250 },
                    { x: 600, y: 250 },
                    { x: 600, y: 180 },
                    { x: 700, y: 180 },
                    { x: 700, y: 300 },
                    { x: 600, y: 300 },
                    { x: 600, y: 350 },
                    { x: 500, y: 350 },
                    { x: 500, y: 280 },
                    { x: 400, y: 280 },
                    { x: 400, y: 350 },
                    { x: 300, y: 350 },
                    { x: 300, y: 320 },
                    { x: 200, y: 320 },
                    { x: 200, y: 380 },
                    { x: 100, y: 380 },
                    { x: 100, y: 320 },
                    { x: 0, y: 320 }
                ],
                isSurvival: true,
                waves: [] // Survival 模式不需要預定義波次
            }
        ];
    }
    
    initializeEventListeners() {
        // 開始頁面
        document.getElementById('enter-game').addEventListener('click', () => {
            this.unlockAudio();
            this.showLevelSelect();
        });
        
        // 靜音按鈕
        document.getElementById('mute-btn').addEventListener('click', () => {
            this.unlockAudio();
            this.toggleMute();
            // 測試音效
            this.playSound('towerPlace');
        });
        
        // 關卡選擇頁面靜音按鈕
        document.getElementById('mute-btn-level').addEventListener('click', () => {
            this.unlockAudio();
            this.toggleMute();
        });
        
        // 遊戲說明頁面靜音按鈕
        document.getElementById('mute-btn-guide').addEventListener('click', () => {
            this.unlockAudio();
            this.toggleMute();
        });
        
        // 遊戲頁面靜音按鈕
        document.getElementById('mute-btn-game').addEventListener('click', () => {
            this.unlockAudio();
            this.toggleMute();
        });
        
        // 遊戲說明按鈕
        document.getElementById('game-guide').addEventListener('click', () => {
            this.showGuide();
        });
        
        // 從說明返回主選單
        document.getElementById('back-to-start-from-guide').addEventListener('click', () => {
            this.showStartScreen();
        });
        
        // 關卡選擇
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = parseInt(e.currentTarget.dataset.level);
                if (this.isLevelUnlocked(level)) {
                    // 檢查是否需要金幣解鎖
                    if ((level === 10 || level === 11) && !this.completedLevels.includes(level - 1) && this.shopCoins >= 100) {
                        if (confirm(`使用100商店金幣解鎖關卡${level}？`)) {
                            this.shopCoins -= 100;
                            this.updateShopCoins();
                            this.currentLevel = level;
                            this.initializeLevel();
                        }
                    } else {
                        this.currentLevel = level;
                        this.initializeLevel();
                    }
                }
            });
        });
        
        // 返回主選單
        document.getElementById('back-to-start').addEventListener('click', () => {
            this.showStartScreen();
        });
        
        // 塔防選擇
        document.querySelectorAll('.tower-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const towerType = e.currentTarget.dataset.tower;
                if (this.coins >= this.towerTypes[towerType].cost) {
                    // 如果鏟子模式開啟，先關閉鏟子模式
                    if (this.shovelMode) {
                        this.shovelMode = false;
                        document.getElementById('shovel-btn').classList.remove('active');
                        console.log('關閉鏟子模式');
                    }
                    
                    // 如果點擊的是已選中的塔，則取消選擇
                    if (this.selectedTower === towerType) {
                        this.selectedTower = null;
                        document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
                        console.log('取消選擇塔防:', towerType);
                    } else {
                        // 選擇新的塔防
                        this.selectedTower = towerType;
                        document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
                        e.currentTarget.classList.add('selected');
                        console.log('選擇塔防:', towerType);
                    }
                }
            });
        });
        
        // 遊戲控制
        document.getElementById('start-wave').addEventListener('click', () => {
            this.startWave();
        });
        
        document.getElementById('pause-game').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('next-level').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('restart-game').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        // 暫停彈窗按鈕
        document.getElementById('resume-game').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-from-pause').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.backToMenu();
        });
        
        // Survival 結果彈窗按鈕
        document.getElementById('survival-restart').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('survival-main-menu').addEventListener('click', () => {
            this.backToMenu();
        });
        
        // 快轉按鈕
        document.getElementById('fast-forward').addEventListener('click', () => {
            this.toggleFastForward();
        });
        
        // 鏟子按鈕
        document.getElementById('shovel-btn').addEventListener('click', () => {
            this.toggleShovel();
        });
        
        // 塔防升級對話框按鈕
        document.getElementById('upgrade-damage').addEventListener('click', () => {
            this.upgradeTower('damage');
        });
        
        document.getElementById('upgrade-speed').addEventListener('click', () => {
            this.upgradeTower('speed');
        });
        
        document.getElementById('upgrade-cancel').addEventListener('click', () => {
            this.hideUpgradeModal();
        });
        
        // 點擊對話框背景關閉
        document.getElementById('tower-upgrade-modal').addEventListener('click', (e) => {
            if (e.target.id === 'tower-upgrade-modal') {
                this.hideUpgradeModal();
            }
        });
        
        // 關卡選擇標籤
        document.querySelectorAll('.level-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.level-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab + '-tab').classList.add('active');
                
                // 如果切換到商店標籤，更新商店
                if (e.target.dataset.tab === 'shop') {
                    this.updateShop();
                }
            });
        });
        
        // 關卡結果按鈕
        document.getElementById('result-next-level').addEventListener('click', () => {
            this.nextLevelFromResult();
        });
        
        document.getElementById('result-restart').addEventListener('click', () => {
            this.restartFromResult();
        });
        
        document.getElementById('result-shop').addEventListener('click', () => {
            this.showShopFromResult();
        });
        
        document.getElementById('result-main-menu').addEventListener('click', () => {
            this.backToMenuFromResult();
        });
        
        // 畫布點擊事件
        this.canvas.addEventListener('click', (e) => {
            if (this.gameState === 'playing') {
                if (this.selectedTower) {
                    this.placeTower(e);
                } else if (this.shovelMode) {
                    this.removeTower(e);
                } else {
                    this.handleTowerClick(e);
                }
            }
        });
        
        // 畫布鼠標移動事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        
    }
    
    showStartScreen() {
        document.getElementById('start-screen').style.display = 'flex';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('level-select-screen').style.display = 'none';
        document.getElementById('guide-screen').style.display = 'none';
        this.gameState = 'menu';
    }
    
    showLevelSelect() {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('guide-screen').style.display = 'none';
        document.getElementById('level-select-screen').style.display = 'flex';
        this.updateLevelButtons();
        this.updateShopCoins();
        this.updateShop();
        this.gameState = 'menu';
    }
    
    showGuide() {
        document.getElementById('start-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('level-select-screen').style.display = 'none';
        document.getElementById('guide-screen').style.display = 'flex';
        this.gameState = 'guide';
    }
    
    isLevelUnlocked(level) {
        if (level === 1) return true;
        
        // 第十關和第十一關可以用金幣解鎖
        if (level === 10 || level === 11) {
            return this.completedLevels.includes(level - 1) || this.shopCoins >= 100;
        }
        
        return this.completedLevels.includes(level - 1);
    }
    
    updateLevelButtons() {
        document.querySelectorAll('.level-btn').forEach(btn => {
            const level = parseInt(btn.dataset.level);
            btn.classList.remove('unlocked', 'locked', 'coin-unlockable');
            
            if (this.isLevelUnlocked(level)) {
                btn.classList.add('unlocked');
                btn.disabled = false;
                
                // 為可以用金幣解鎖的關卡添加特殊樣式
                if ((level === 10 || level === 11) && !this.completedLevels.includes(level - 1) && this.shopCoins >= 100) {
                    btn.classList.add('coin-unlockable');
                }
            } else {
                btn.classList.add('locked');
                btn.disabled = true;
            }
        });
    }
    
    initializeLevel() {
        console.log('initializeLevel 開始');
        document.getElementById('level-select-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        this.currentLevelData = this.levels[this.currentLevel - 1];
        
        // 檢查是否為 Survival 模式
        if (this.currentLevelData.isSurvival) {
            this.totalWaves = Infinity; // Survival 模式無限波次
            this.survivalWaveCount = 0;
        } else {
            this.totalWaves = 5; // 動態設定總波次數
        }
        
        this.lives = 5;
        this.coins = 100;
        this.score = 0;
        this.currentLevelScore = 0;
        this.currentLevelCoins = 0;
        this.currentWave = 0;
        this.towers = [];
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.selectedTower = null;
        this.waveStarted = false;
        this.waveInProgress = false;
        this.timer = 0;
        this.maxTimer = 0;
        this.gameState = 'playing';
        this.allEnemiesSpawned = false;
        
        // 確保重新開始時不會自動開始波次
        this.survivalWaveCount = 0;
        
        // 重置鏟子模式
        this.shovelMode = false;
        document.getElementById('shovel-btn').classList.remove('active');
        
        // 重置快轉狀態
        this.gameSpeed = 1;
        this.isFastForward = false;
        const fastForwardBtn = document.getElementById('fast-forward');
        if (fastForwardBtn) {
            fastForwardBtn.textContent = '快轉';
            fastForwardBtn.classList.remove('active');
        }
        
        console.log('initializeLevel 狀態:', {
            currentWave: this.currentWave,
            waveInProgress: this.waveInProgress,
            allEnemiesSpawned: this.allEnemiesSpawned,
            waveStarted: this.waveStarted,
            enemiesLength: this.enemies.length,
            gameSpeed: this.gameSpeed,
            isFastForward: this.isFastForward,
            gameLoopRunning: this.gameLoopRunning
        });
        
        this.updateUI();
        
        // 更新塔防圖標顏色
        this.updateTowerIcons();
        
        // 開始遊戲循環（但波次不會自動開始）
        if (!this.gameLoopRunning) {
            this.gameLoopRunning = true;
            this.gameLoop();
        }
    }
    
    startLevel() {
        this.initializeLevel();
    }
    
    updateUI() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('coins').textContent = this.coins;
        
        // 處理 Survival 模式的波次顯示
        if (this.currentLevelData.isSurvival) {
            document.getElementById('current-wave').textContent = this.survivalWaveCount;
            document.getElementById('total-waves').textContent = '∞';
        } else {
            document.getElementById('current-wave').textContent = this.currentWave;
            document.getElementById('total-waves').textContent = this.totalWaves;
        }
        
        // Survival 模式不顯示計時器
        if (this.currentLevelData.isSurvival) {
            document.getElementById('timer').textContent = '--';
        } else if (this.currentWave >= 5) {
            // 第五波顯示0且不動
            document.getElementById('timer').textContent = '0';
        } else {
            document.getElementById('timer').textContent = Math.max(0, Math.floor(this.timer));
        }
        
        document.getElementById('score').textContent = this.score;
        
        // 更新開始波次按鈕狀態
        const startWaveBtn = document.getElementById('start-wave');
        startWaveBtn.textContent = '開始波次';
        startWaveBtn.disabled = false;
        startWaveBtn.classList.remove('disabled');

        // 更新暫停按鈕
        const pauseBtn = document.getElementById('pause-game');
        if (this.gameState === 'paused') {
            pauseBtn.textContent = '繼續';
        } else {
            pauseBtn.textContent = '暫停';
        }
        
        // 更新塔防選項狀態
        document.querySelectorAll('.tower-option').forEach(option => {
            const towerType = option.dataset.tower;
            const cost = this.towerTypes[towerType].cost;
            if (this.coins < cost) {
                option.classList.add('disabled');
            } else {
                option.classList.remove('disabled');
            }
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 更新倒數計時器（Survival 模式不計時，第五波次不計時）
        if (this.waveInProgress && this.gameState === 'playing' && !this.currentLevelData.isSurvival && this.currentWave < 5 && this.timer > 0) {
            this.timer -= (1/60) * this.gameSpeed; // 假設60FPS，倒數
            if (this.timer <= 0) {
                this.timer = 0;
                // 時間到，檢查是否還有敵人
                if (this.enemies.length > 0) {
                    // 時間到但還有敵人，強制結束波次
                    console.log(`時間到！強制結束波次 ${this.currentWave}`);
                    this.forceEndWave();
                }
            }
        }
        
        // 第五波時確保計時器為0且不動
        if (this.currentWave >= 5 && !this.currentLevelData.isSurvival) {
            this.timer = 0;
            this.maxTimer = 0;
        }
        
        // 只在遊戲進行中時更新遊戲邏輯
        if (this.gameState === 'playing') {
            // 更新敵人
            this.enemies.forEach((enemy, index) => {
                enemy.update(this.gameSpeed);
                if (enemy.reachedEnd) {
                    this.lives--;
                    this.enemies.splice(index, 1);
                    if (this.lives <= 0) {
                        this.gameOver(false);
                    }
                }
            });
            
            // 更新子彈
            this.bullets.forEach((bullet, index) => {
                bullet.update();
                if (bullet.life <= 0) {
                    this.bullets.splice(index, 1);
                }
            });
            
            // 塔防攻擊
            this.towers.forEach(tower => {
                tower.update(this.enemies, this.bullets, this.gameSpeed);
            });
            
            // 碰撞檢測
            this.bullets.forEach((bullet, bulletIndex) => {
                this.enemies.forEach((enemy, enemyIndex) => {
                    if (this.checkCollision(bullet, enemy)) {
                        enemy.takeDamage(bullet.damage);
                        this.bullets.splice(bulletIndex, 1);
                        
                        if (enemy.health <= 0) {
                            this.addCoins(enemy.reward, enemy.x, enemy.y);
                            this.createParticles(enemy.x, enemy.y, '#f39c12');
                            this.playSound('enemyDeath');
                            this.enemies.splice(enemyIndex, 1);
                        }
                    }
                });
            });
        }
        
        // 更新粒子效果（總是更新）
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // 更新金幣動畫（總是更新）
        this.coinAnimations.forEach((animation, index) => {
            animation.update();
            if (animation.life <= 0) {
                this.coinAnimations.splice(index, 1);
            }
        });
        
        // 更新分數動畫（總是更新）
        this.scoreAnimations.forEach((animation, index) => {
            animation.update();
            if (animation.life <= 0) {
                this.scoreAnimations.splice(index, 1);
            }
        });
        
        // 總是更新UI（包括計時器顯示）
        this.updateUI();
        
        if (this.waveInProgress && this.enemies.length === 0 && this.allEnemiesSpawned && this.waveStarted) {
            console.log(`波次完成檢查: waveInProgress=${this.waveInProgress}, enemies.length=${this.enemies.length}, allEnemiesSpawned=${this.allEnemiesSpawned}, waveStarted=${this.waveStarted}, currentWave=${this.currentWave}`);
            this.endWaveWithReward(false);  // forceOnly = false → 給獎勵並清除敵人
            
            // 確保最後波次完成關卡
            if (this.currentWave >= this.totalWaves) {
                this.levelComplete();
            }
        }

        // 檢查是否所有波次完成且敵人已清空
        if (this.currentWave >= this.totalWaves && this.enemies.length === 0 && this.gameState === 'playing' && this.waveStarted) {
            this.levelComplete();
            this.waveInProgress = false; // 確保波次狀態重置
        }
    }
    
    render() {
        // 清空畫布
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 繪製背景漸變
        this.drawBackground();
        
        // 繪製道路
        this.drawPath();
        
        // 繪製起點和終點
        this.drawStartEndPoints();
        
        // 繪製塔防
        this.towers.forEach(tower => tower.render(this.ctx));
        
        // 繪製敵人
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        
        // 繪製子彈
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        
        // 繪製粒子效果
        this.particles.forEach(particle => particle.render(this.ctx));
        
        // 繪製金幣動畫
        this.coinAnimations.forEach(animation => animation.render(this.ctx));
        
        // 繪製分數動畫
        this.scoreAnimations.forEach(animation => animation.render(this.ctx));
        
        // 繪製選擇的塔防預覽
        if (this.selectedTower) {
            this.drawTowerPreview();
        }
        
        // 繪製暫停畫面
        if (this.gameState === 'paused') {
            this.drawPauseScreen();
        }
        
        // 繪製波次狀態（只要遊戲進行中且有敵人，就顯示敵人數量）
        if (this.gameState === 'playing' && this.enemies.length > 0) {
            this.drawWaveStatus();
        }
    }
    
    drawBackground() {
        // 如果有背景圖片，繪製背景圖片
        if (this.currentLevelData.background) {
            // 預載入圖片並緩存
            if (!this.backgroundImages) {
                this.backgroundImages = {};
            }
            
            if (this.backgroundImages[this.currentLevelData.background]) {
                // 使用已載入的圖片
                this.ctx.drawImage(this.backgroundImages[this.currentLevelData.background], 0, 0, this.canvasWidth, this.canvasHeight);
            } else {
                // 載入新圖片
                const img = new Image();
                img.onload = () => {
                    this.backgroundImages[this.currentLevelData.background] = img;
                    this.ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);
                };
                img.onerror = () => {
                    console.log('背景圖片載入失敗:', this.currentLevelData.background);
                    this.drawDefaultBackground();
                };
                img.src = this.currentLevelData.background;
            }
        } else {
            this.drawDefaultBackground();
        }
    }
    
    drawDefaultBackground() {
        // 創建漸變背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, '#2ecc71');
        gradient.addColorStop(1, '#27ae60');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 添加一些裝飾性的草地紋理
        this.ctx.fillStyle = 'rgba(46, 204, 113, 0.3)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvasWidth;
            const y = Math.random() * this.canvasHeight;
            this.ctx.beginPath();
            this.ctx.arc(x, y, Math.random() * 3 + 1, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawPauseScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('遊戲暫停', this.canvasWidth / 2, this.canvasHeight / 2 - 20);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('按空白鍵繼續', this.canvasWidth / 2, this.canvasHeight / 2 + 30);
    }
    
    drawWaveStatus() {
        // 只繪製敵人數量
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 120, 30);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`敵人: ${this.enemies.length}`, 20, 30);
    }
    
    drawPath() {
        this.ctx.strokeStyle = 'rgba(139, 69, 19, 0.7)'; // 70% 透明度
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // 支援多條路徑
        const paths = this.currentLevelData.paths || [this.currentLevelData.path];
        
        // 如果只有一條路徑，直接繪製
        if (paths.length === 1) {
            const path = paths[0];
            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);
            
            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }
            
            this.ctx.stroke();
        } else {
            // 多條路徑時，先繪製主路徑（重疊部分）
            const mainPath = paths[0];
            this.ctx.beginPath();
            this.ctx.moveTo(mainPath[0].x, mainPath[0].y);
            
            for (let i = 1; i < mainPath.length; i++) {
                this.ctx.lineTo(mainPath[i].x, mainPath[i].y);
            }
            
            this.ctx.stroke();
            
            // 然後繪製分叉部分
            for (let pathIndex = 1; pathIndex < paths.length; pathIndex++) {
                const path = paths[pathIndex];
                this.ctx.beginPath();
                this.ctx.moveTo(path[0].x, path[0].y);
                
                for (let i = 1; i < path.length; i++) {
                    this.ctx.lineTo(path[i].x, path[i].y);
                }
                
                this.ctx.stroke();
            }
        }
    }
    
    drawStartEndPoints() {
        // 支援多條路徑
        const paths = this.currentLevelData.paths || [this.currentLevelData.path];
        
        paths.forEach(path => {
            const start = path[0];
            const end = path[path.length - 1];
            
            // 起點
            this.ctx.fillStyle = '#27ae60';
            this.ctx.fillRect(start.x - 20, start.y - 20, 40, 40);
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(start.x - 20, start.y - 20, 40, 40);
            
            // 終點
            this.ctx.fillStyle = '#e74c3c';
            this.ctx.fillRect(end.x - 20, end.y - 20, 40, 40);
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(end.x - 20, end.y - 20, 40, 40);
        });
    }
    
    drawTowerPreview() {
        if (!this.selectedTower) return;
        
        // 獲取裝備的造型顏色
        const equippedSkin = this.equippedSkins[this.selectedTower];
        const skinData = this.shopData[this.selectedTower].find(s => s.id === equippedSkin);
        const previewColor = skinData ? skinData.color : this.towerTypes[this.selectedTower].color;
        
        // 繪製塔防預覽
        this.ctx.fillStyle = previewColor;
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        
        // 根據裝備的造型繪製不同形狀
        if (equippedSkin === 'triangle') {
            // 繪製三角形
            this.ctx.moveTo(this.mouseX, this.mouseY - 15);
            this.ctx.lineTo(this.mouseX - 13, this.mouseY + 10);
            this.ctx.lineTo(this.mouseX + 13, this.mouseY + 10);
            this.ctx.closePath();
        } else if (equippedSkin === 'square') {
            // 繪製正方形
            this.ctx.rect(this.mouseX - 12, this.mouseY - 12, 24, 24);
        } else {
            // 預設圓形
            this.ctx.arc(this.mouseX, this.mouseY, 15, 0, Math.PI * 2);
        }
        
        this.ctx.fill();
        
        // 繪製攻擊範圍預覽
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, this.towerTypes[this.selectedTower].range, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }
    
    placeTower(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 檢查是否在道路上
        if (this.isOnPath(x, y)) {
            return;
        }
        
        // 檢查是否與現有塔防重疊
        if (this.isTowerOverlap(x, y)) {
            return;
        }
        
        const towerType = this.towerTypes[this.selectedTower];
        if (this.coins >= towerType.cost) {
            this.coins -= towerType.cost;
            this.towers.push(new Tower(x, y, this.selectedTower, towerType));
            this.selectedTower = null;
            document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
            this.playSound('towerPlace');
            this.updateUI();
        }
    }
    
    isOnPath(x, y) {
        const pathWidth = 40;
        const paths = this.currentLevelData.paths || [this.currentLevelData.path];
        
        for (let path of paths) {
            for (let i = 0; i < path.length - 1; i++) {
                const start = path[i];
                const end = path[i + 1];
                
                const distance = this.pointToLineDistance(x, y, start.x, start.y, end.x, end.y);
                if (distance < pathWidth / 2) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isTowerOverlap(x, y) {
        return this.towers.some(tower => {
            const distance = Math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2);
            return distance < 30;
        });
    }
    
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) {
            param = dot / lenSq;
        }
        
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    startWave() {
        // 如果上一波還有敵人，給金幣回饋（不要停止敵人生成）
        if (this.waveInProgress && this.enemies.length > 0) {
            this.endWaveWithReward(true); // 傳參數表示「強制結束前波給獎勵，但不要清除敵人」
        }
    
        // 開啟新波次
        if (this.currentWave < this.totalWaves && this.gameState !== 'completed') {
            this.playSound('waveStart');
    
            let wave;
            if (this.currentLevelData.isSurvival) {
                // Survival 模式：動態生成波次
                wave = this.generateSurvivalWave();
                this.survivalWaveCount++;
            } else {
                // 一般模式：使用預定義波次
                wave = this.currentLevelData.waves[this.currentWave];
            }
            
            let delay = 0;
    
            wave.enemies.forEach(enemyGroup => {
                for (let i = 0; i < enemyGroup.count; i++) {
                    setTimeout(() => {
                        if (this.gameState !== 'completed' && this.enemyTypes[enemyGroup.type]) {
                            // 隨機選擇一條路徑
                            const paths = this.currentLevelData.paths || [this.currentLevelData.path];
                            const selectedPath = paths[Math.floor(Math.random() * paths.length)];
                            
                            // 獲取敵人配置
                            let enemyConfig = { ...this.enemyTypes[enemyGroup.type] };
                            
                            // Survival 模式：應用增強效果
                            if (this.currentLevelData.isSurvival) {
                                const enhancementLevel = Math.floor(this.survivalWaveCount / 3);
                                enemyConfig.health = Math.floor(enemyConfig.health * (1 + enhancementLevel * 0.5));
                                enemyConfig.speed = enemyConfig.speed * (1 + enhancementLevel * 0.2);
                                enemyConfig.reward = Math.floor(enemyConfig.reward * (1 + enhancementLevel * 0.3));
                            }
                            
                            this.enemies.push(new Enemy(selectedPath, enemyGroup.type, enemyConfig));
                        }
                        // 判斷是否最後一隻敵人生成
                        if (i === enemyGroup.count - 1 && enemyGroup === wave.enemies[wave.enemies.length-1]) {
                            this.allEnemiesSpawned = true;
                        }
                    }, delay);
                    delay += enemyGroup.delay;
                }
            });
    
            // 設定計時器（Survival 模式不設定計時器）
            if (this.currentLevelData.isSurvival) {
                this.timer = 0;
                this.maxTimer = 0;
            } else if (this.currentWave < 5) {
                this.timer = 60;
                this.maxTimer = 60;
            } else {
                this.timer = 0;
                this.maxTimer = 0;
            }
            
            this.waveInProgress = true;
            this.waveStarted = true;
            this.currentWave++; // 在波次開始後才遞增

            console.log(`開始波次 ${this.currentWave}, 計時器: ${this.timer}秒`);
        }
    }
    
    generateSurvivalWave() {
        // 每三波增強敵人
        const enhancementLevel = Math.floor(this.survivalWaveCount / 3);
        
        // 基礎敵人配置
        const baseEnemies = [
            { type: 'basic', count: 5, delay: 1000 },
            { type: 'fast', count: 3, delay: 800 },
            { type: 'tank', count: 1, delay: 1500 }
        ];
        
        // 根據波次數量和增強等級調整
        const waveMultiplier = 1 + (this.survivalWaveCount * 0.1);
        const enhancedEnemies = baseEnemies.map(enemy => ({
            ...enemy,
            count: Math.floor(enemy.count * waveMultiplier),
            delay: Math.max(200, enemy.delay - (enhancementLevel * 100))
        }));
        
        // 每10波增加一個 boss
        if (this.survivalWaveCount > 0 && this.survivalWaveCount % 10 === 0) {
            enhancedEnemies.push({ type: 'boss', count: 1, delay: 0 });
        }
        
        return { enemies: enhancedEnemies };
    }
    
    endWaveWithReward(forceOnly = false) {
        // forceOnly = true → 只給金幣/分數，不清除敵人
        this.waveInProgress = false;
    
        // Survival 模式：每波固定給50金幣
        if (this.currentLevelData.isSurvival) {
            this.coins += 50;
            this.score += 500;
            this.currentLevelScore += 500;
            this.currentLevelCoins += 50;
            this.scoreAnimations.push(new ScoreAnimation(350, 200, 500));
        } else {
            // 一般模式：時間獎勵
            const timeBonus = Math.floor(this.timer); // 每秒1金幣
            if (timeBonus > 0) {
                this.coins += timeBonus;
                this.score += timeBonus * 10;
                this.currentLevelScore += timeBonus * 10;
                this.currentLevelCoins += timeBonus;
                this.scoreAnimations.push(new ScoreAnimation(350, 200, timeBonus * 10));
            }
        }
    
        if (!forceOnly) {
            this.enemies = []; // 正常結束波次才清除敵人
            this.timer = 0;
            this.maxTimer = 0;
        }
    
        this.updateUI();
    
        // Survival 模式不會結束，只有一般模式才會檢查關卡完成
        if (!forceOnly && !this.currentLevelData.isSurvival && this.currentWave >= this.totalWaves) {
            this.levelComplete();
        }
    }
    
    calculatePathLength() {
        const paths = this.currentLevelData.paths || [this.currentLevelData.path];
        let totalLength = 0;
        
        paths.forEach(path => {
            let length = 0;
            for (let i = 0; i < path.length - 1; i++) {
                const start = path[i];
                const end = path[i + 1];
                length += Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
            }
            totalLength += length;
        });
        
        return totalLength / paths.length; // 返回平均路徑長度
    }
    
    forceEndWave() {
        // 強制結束波次，清除所有敵人
        // 時間到時不給金幣獎勵
        // this.enemies = [];
        this.waveInProgress = false;
        this.timer = 0; // 重置計時器
        this.maxTimer = 0;
        this.currentWave++;
        this.updateUI();
        
        // 只有在所有波次都完成且沒有敵人時才完成關卡
        if (this.currentWave >= this.totalWaves) {
            this.levelComplete();
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pause-modal').style.display = 'flex';
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pause-modal').style.display = 'none';
        this.updateUI();
    }
    
    backToMenu() {
        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('survival-result-modal').style.display = 'none';
        this.showLevelSelect();
    }
    
    levelComplete() {
        // 設置遊戲狀態為完成，防止繼續生成敵人
        this.gameState = 'completed';
        
        // 保存關卡完成進度
        if (!this.completedLevels.includes(this.currentLevel)) {
            this.completedLevels.push(this.currentLevel);
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
        }
        
        // 計算商店金幣獎勵
        const shopCoinsEarned = Math.floor(this.currentLevelScore / 100);
        this.shopCoins += shopCoinsEarned;
        localStorage.setItem('shopCoins', this.shopCoins.toString());
        
        // 顯示結果彈窗
        this.showLevelResult(true);
    }
    
    gameOver(won) {
        if (this.currentLevelData.isSurvival) {
            // Survival 模式：顯示特殊的結束彈窗
            this.showSurvivalResult();
        } else {
            if (!won) {
                // 關卡失敗時不給任何金幣和分數
                this.currentLevelScore = 0;
                this.currentLevelCoins = 0;
                this.showLevelResult(false);
            }
        }
        this.gameState = 'gameOver';
    }
    
    showSurvivalResult() {
        console.log('showSurvivalResult 被調用');
        const modal = document.getElementById('survival-result-modal');
        const title = document.getElementById('survival-result-title');
        const waveCount = document.getElementById('survival-wave-count');
        const score = document.getElementById('survival-result-score');
        const coins = document.getElementById('survival-result-coins');
        
        console.log('彈窗元素:', modal);
        console.log('標題元素:', title);
        
        if (!modal) {
            console.error('找不到 survival-result-modal 元素');
            return;
        }
        
        title.textContent = '闖關結束！';
        waveCount.textContent = this.survivalWaveCount;
        score.textContent = this.currentLevelScore;
        coins.textContent = this.currentLevelCoins;
        
        // 將金幣加入商店金幣
        this.shopCoins += this.currentLevelCoins;
        this.updateShopCoins();
        
        modal.style.display = 'block';
        console.log('彈窗顯示設定完成');
    }
    
    nextLevel() {
        if (this.currentLevel < 10) {
            this.currentLevel++;
            // 只初始化關卡，不自動開始
            this.initializeLevel();
        }
        document.getElementById('game-over-modal').style.display = 'none';
        this.updateLevelButtons();
    }
    
    restartGame() {
        // 重新開始當前關卡，不回到第一關
        console.log('restartGame 開始');
        
        // 重置所有遊戲狀態
        this.gameState = 'playing';
        this.waveStarted = false;
        this.waveInProgress = false;
        this.allEnemiesSpawned = false;
        this.currentWave = 0;
        this.survivalWaveCount = 0;
        this.timer = 0;
        this.maxTimer = 0;
        
        // 清除所有遊戲對象
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        this.towers = [];
        this.coinAnimations = [];
        this.scoreAnimations = [];
        
        // 重置遊戲速度
        this.gameSpeed = 1;
        this.isFastForward = false;
        
        // 隱藏所有模態框
        document.getElementById('game-over-modal').style.display = 'none';
        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('survival-result-modal').style.display = 'none';
        document.getElementById('level-result-modal').style.display = 'none';
        
        // 重新初始化關卡
        this.initializeLevel();
        
        console.log('restartGame 完成');
    }
    
    checkCollision(bullet, enemy) {
        const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);
        return distance < 15;
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    addCoins(amount, x, y) {
        this.coins += amount;
        this.score += amount * 10; // 每金幣10分
        this.currentLevelScore += amount * 10;
        this.currentLevelCoins += amount;
        this.coinAnimations.push(new CoinAnimation(x, y, amount));
        this.scoreAnimations.push(new ScoreAnimation(x + 20, y, amount * 10));
    }
    
    toggleFastForward() {
        this.isFastForward = !this.isFastForward;
        this.gameSpeed = this.isFastForward ? 2 : 1;
        
        const btn = document.getElementById('fast-forward');
        if (this.isFastForward) {
            btn.textContent = '正常';
            btn.classList.add('active');
        } else {
            btn.textContent = '快轉';
            btn.classList.remove('active');
        }
    }
    
    toggleShovel() {
        this.shovelMode = !this.shovelMode;
        
        // 如果開啟鏟子模式，取消塔防選擇
        if (this.shovelMode) {
            this.selectedTower = null;
            document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
        }
        
        const shovelBtn = document.getElementById('shovel-btn');
        if (this.shovelMode) {
            shovelBtn.classList.add('active');
            console.log('鏟子模式開啟');
        } else {
            shovelBtn.classList.remove('active');
            console.log('鏟子模式關閉');
        }
    }
    
    removeTower(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 檢查是否點擊到塔防
        for (let i = this.towers.length - 1; i >= 0; i--) {
            const tower = this.towers[i];
            const distance = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            
            if (distance <= 20) { // 塔防半徑約20像素
                // 計算回饋金幣（原費用的一半）
                const refund = Math.floor(this.towerTypes[tower.type].cost / 2);
                this.coins += refund;
                
                // 移除塔防
                this.towers.splice(i, 1);
                
                // 播放音效
                this.playSound('towerPlace');
                
                // 顯示金幣動畫
                this.coinAnimations.push(new CoinAnimation(x, y, refund));
                
                console.log(`移除塔防，獲得 ${refund} 金幣回饋`);
                this.updateUI();
                break;
            }
        }
    }
    
    handleTowerClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 檢查是否點擊到塔防
        for (let i = this.towers.length - 1; i >= 0; i--) {
            const tower = this.towers[i];
            const distance = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
            
            if (distance <= 20) { // 塔防半徑約20像素
                if (tower.canUpgrade()) {
                    this.showUpgradeModal(tower);
                } else {
                    console.log('塔防已達到最高等級');
                }
                break;
            }
        }
    }
    
    showUpgradeModal(tower) {
        this.selectedTowerForUpgrade = tower;
        const cost = tower.getUpgradeCost();
        
        document.getElementById('upgrade-cost-amount').textContent = cost;
        
        // 根據等級顯示不同的選項
        if (tower.level < 2) {
            document.getElementById('upgrade-title').textContent = '升級塔防';
            document.getElementById('upgrade-options').style.display = 'flex';
            document.getElementById('upgrade-damage').style.display = 'block';
            document.getElementById('upgrade-damage').disabled = false;
            document.getElementById('upgrade-speed').disabled = false;
            document.getElementById('upgrade-damage').textContent = '攻擊力 +5';
            document.getElementById('upgrade-speed').textContent = '攻擊速度 +5';
        } else {
            document.getElementById('upgrade-title').textContent = '升級到最高等級';
            document.getElementById('upgrade-options').style.display = 'flex';
            document.getElementById('upgrade-damage').style.display = 'none';
            document.getElementById('upgrade-speed').disabled = false;
            document.getElementById('upgrade-speed').textContent = '升級所有屬性';
        }
        
        document.getElementById('tower-upgrade-modal').style.display = 'flex';
    }
    
    hideUpgradeModal() {
        document.getElementById('tower-upgrade-modal').style.display = 'none';
        this.selectedTowerForUpgrade = null;
    }
    
    upgradeTower(upgradeType) {
        if (!this.selectedTowerForUpgrade) return;
        
        const tower = this.selectedTowerForUpgrade;
        const cost = tower.getUpgradeCost();
        
        if (this.coins < cost) {
            alert('金幣不足！');
            return;
        }
        
        // 執行升級
        if (tower.level < 2) {
            tower.upgrade(upgradeType);
        } else {
            // 第三級升級所有屬性（使用speed按鈕觸發）
            tower.upgrade('damage');
        }
        
        // 更新塔防顏色
        this.updateTowerColor(tower);
        
        this.hideUpgradeModal();
    }
    
    updateTowerColor(tower) {
        // 每次升級顏色變深10%
        const darkenFactor = 1 - (tower.level * 0.1);
        
        if (tower.type === 'basic') {
            tower.color = this.darkenColor('#f1c40f', darkenFactor);
        } else if (tower.type === 'rapid') {
            tower.color = this.darkenColor('#8e44ad', darkenFactor);
        } else if (tower.type === 'heavy') {
            tower.color = this.darkenColor('#e74c3c', darkenFactor);
        }
    }
    
    darkenColor(color, factor) {
        // 將十六進制顏色變暗
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        const newR = Math.floor(r * factor);
        const newG = Math.floor(g * factor);
        const newB = Math.floor(b * factor);
        
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }
    
    updateShop() {
        // 添加商店標籤事件（只添加一次）
        if (!this.shopTabsInitialized) {
            document.querySelectorAll('.shop-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                    e.target.classList.add('active');
                    this.updateShopItems(e.target.dataset.tower);
                });
            });
            this.shopTabsInitialized = true;
        }
        
        this.updateShopItems('basic');
    }
    
    updateShopItems(towerType) {
        const shopItems = document.getElementById('shop-items');
        shopItems.innerHTML = '';
        
        this.shopData[towerType].forEach(skin => {
            const item = document.createElement('div');
            item.className = 'shop-item';
            
            const isOwned = this.ownedSkins[towerType].includes(skin.id);
            const isEquipped = this.equippedSkins[towerType] === skin.id;
            
            if (isOwned) {
                item.classList.add('owned');
            } else if (skin.price > this.shopCoins) {
                item.classList.add('disabled');
            }
            
            let actionButtons = '';
            if (!isOwned) {
                if (skin.price <= this.shopCoins) {
                    actionButtons = `<button class="skin-btn buy-btn" onclick="game.buySkin('${towerType}', '${skin.id}')">購買</button>`;
                } else {
                    actionButtons = `<button class="skin-btn buy-btn" disabled>金幣不足</button>`;
                }
            } else if (!isEquipped) {
                actionButtons = `<button class="skin-btn equip-btn" onclick="game.equipSkin('${towerType}', '${skin.id}')">裝備</button>`;
            } else {
                actionButtons = `<button class="skin-btn equipped-btn">已裝備</button>`;
            }
            
            // 生成屬性加成描述
            let bonusText = '';
            if (skin.bonus) {
                const bonuses = [];
                if (skin.bonus.damage > 0) bonuses.push(`攻擊力 +${skin.bonus.damage}`);
                if (skin.bonus.range > 0) bonuses.push(`射程 +${skin.bonus.range}`);
                if (skin.bonus.fireRate < 0) bonuses.push(`射速 +${Math.abs(skin.bonus.fireRate)}ms`);
                bonusText = bonuses.length > 0 ? `<div class="skin-bonus">${bonuses.join(', ')}</div>` : '';
            }
            
            // 根據造型類型設定形狀樣式
            let shapeStyle = '';
            if (skin.id === 'triangle') {
                shapeStyle = 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%); border-radius: 0;';
            } else if (skin.id === 'square') {
                shapeStyle = 'clip-path: none; border-radius: 0;';
            } else {
                shapeStyle = 'clip-path: none; border-radius: 50%;';
            }
            
            // 根據塔防類型決定顏色，而不是造型類型
            let towerColor = '';
            if (towerType === 'basic') {
                towerColor = '#f1c40f'; // 黃色
            } else if (towerType === 'rapid') {
                towerColor = '#8e44ad'; // 紫色
            } else if (towerType === 'heavy') {
                towerColor = '#e74c3c'; // 紅色
            }
            
            item.innerHTML = `
                <div class="tower-skin" style="background: ${towerColor}; ${shapeStyle}"></div>
                <div class="skin-name">${skin.name}</div>
                <div class="skin-description">${skin.description}</div>
                <div class="skin-price">${skin.price === 0 ? '免費' : skin.price + ' 金幣'}</div>
                ${bonusText}
                <div class="skin-actions">
                    ${actionButtons}
                </div>
            `;
            
            shopItems.appendChild(item);
        });
    }
    
    buySkin(towerType, skinId) {
        const skin = this.shopData[towerType].find(s => s.id === skinId);
        if (skin && skin.price <= this.shopCoins) {
            this.shopCoins -= skin.price;
            this.ownedSkins[towerType].push(skinId);
            localStorage.setItem('ownedSkins', JSON.stringify(this.ownedSkins));
            localStorage.setItem('shopCoins', this.shopCoins.toString());
            this.updateShopItems(towerType);
            this.updateShopCoins();
        }
    }
    
    equipSkin(towerType, skinId) {
        this.equippedSkins[towerType] = skinId;
        localStorage.setItem('equippedSkins', JSON.stringify(this.equippedSkins));
        this.updateShopItems(towerType);
        this.updateTowerIcons();
        
        // 更新已建造塔防的屬性
        this.towers.forEach(tower => {
            if (tower.type === towerType) {
                tower.updateSkinBonus();
            }
        });
    }
    
    showLevelResult(success) {
        const modal = document.getElementById('level-result-modal');
        const title = document.getElementById('level-result-title');
        const score = document.getElementById('result-score');
        const coins = document.getElementById('result-coins');
        const nextBtn = document.getElementById('result-next-level');
        const shopBtn = document.getElementById('result-shop');
        
        if (success) {
            title.textContent = '關卡完成！';
            score.textContent = this.currentLevelScore;
            coins.textContent = Math.floor(this.currentLevelScore / 100);
            
            if (this.currentLevel < 10) {
                nextBtn.style.display = 'inline-block';
            } else {
                nextBtn.style.display = 'none';
            }
            shopBtn.style.display = 'inline-block';
        } else {
            title.textContent = '關卡失敗！';
            score.textContent = '0';
            coins.textContent = '0';
            nextBtn.style.display = 'none';
            shopBtn.style.display = 'none';
        }
        
        modal.style.display = 'flex';
    }
    
    nextLevelFromResult() {
        document.getElementById('level-result-modal').style.display = 'none';
        this.nextLevel();
    }
    
    restartFromResult() {
        document.getElementById('level-result-modal').style.display = 'none';
        this.initializeLevel();
    }
    
    showShopFromResult() {
        document.getElementById('level-result-modal').style.display = 'none';
        this.showLevelSelect();
        // 切換到商店標籤
        document.querySelector('.level-tab[data-tab="shop"]').click();
    }
    
    backToMenuFromResult() {
        document.getElementById('level-result-modal').style.display = 'none';
        this.showLevelSelect();
    }
    
    updateShopCoins() {
        document.getElementById('shop-coins').textContent = this.shopCoins;
    }
    
    updateTowerIcons() {
        // 更新基礎塔圖標
        const basicIcon = document.querySelector('.basic-tower');
        if (basicIcon) {
            const equippedSkin = this.equippedSkins.basic;
            
            // 根據塔防類型設定顏色，而不是造型類型
            basicIcon.style.background = '#f1c40f'; // 黃色
            
            // 更新形狀
            if (equippedSkin === 'triangle') {
                basicIcon.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                basicIcon.style.borderRadius = '0';
            } else if (equippedSkin === 'square') {
                basicIcon.style.clipPath = 'none';
                basicIcon.style.borderRadius = '0';
            } else {
                basicIcon.style.clipPath = 'none';
                basicIcon.style.borderRadius = '50%';
            }
        }
        
        // 更新快速塔圖標
        const rapidIcon = document.querySelector('.rapid-tower');
        if (rapidIcon) {
            const equippedSkin = this.equippedSkins.rapid;
            
            // 根據塔防類型設定顏色，而不是造型類型
            rapidIcon.style.background = '#8e44ad'; // 紫色
            
            // 更新形狀
            if (equippedSkin === 'triangle') {
                rapidIcon.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                rapidIcon.style.borderRadius = '0';
            } else if (equippedSkin === 'square') {
                rapidIcon.style.clipPath = 'none';
                rapidIcon.style.borderRadius = '0';
            } else {
                rapidIcon.style.clipPath = 'none';
                rapidIcon.style.borderRadius = '50%';
            }
        }
        
        // 更新重型塔圖標
        const heavyIcon = document.querySelector('.heavy-tower');
        if (heavyIcon) {
            const equippedSkin = this.equippedSkins.heavy;
            
            // 根據塔防類型設定顏色，而不是造型類型
            heavyIcon.style.background = '#e74c3c'; // 紅色
            
            // 更新形狀
            if (equippedSkin === 'triangle') {
                heavyIcon.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
                heavyIcon.style.borderRadius = '0';
            } else if (equippedSkin === 'square') {
                heavyIcon.style.clipPath = 'none';
                heavyIcon.style.borderRadius = '0';
            } else {
                heavyIcon.style.clipPath = 'none';
                heavyIcon.style.borderRadius = '50%';
            }
        }
    }
}

class Tower {
    constructor(x, y, type, config) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.baseDamage = config.damage;
        this.baseRange = config.range;
        this.baseFireRate = config.fireRate;
        this.color = config.color;
        this.lastFire = 0;
        this.target = null;
        
        // 升級系統
        this.level = 0; // 0 = 未升級, 1-3 = 升級等級
        this.damageUpgrades = 0; // 攻擊力升級次數
        this.speedUpgrades = 0; // 攻擊速度升級次數
        
        // 計算裝備造型的屬性加成
        this.updateSkinBonus();
    }
    
    updateSkinBonus() {
        const equippedSkin = window.game.equippedSkins[this.type];
        const skinData = window.game.shopData[this.type].find(s => s.id === equippedSkin);
        
        // 基礎屬性
        let damage = this.baseDamage;
        let range = this.baseRange;
        let fireRate = this.baseFireRate;
        
        // 造型加成
        if (skinData && skinData.bonus) {
            damage += skinData.bonus.damage;
            range += skinData.bonus.range;
            fireRate += skinData.bonus.fireRate;
        }
        
        // 升級加成
        damage += this.damageUpgrades * 5;
        fireRate += this.speedUpgrades * 5;
        
        // 第三級特殊加成
        if (this.level === 3) {
            damage += 5;
            fireRate += 5;
            range += 5;
        }
        
        this.damage = damage;
        this.range = range;
        this.fireRate = fireRate;
    }
    
    update(enemies, bullets, gameSpeed = 1) {
        // 尋找目標
        this.findTarget(enemies);
        
        // 攻擊
        if (this.target && Date.now() - this.lastFire > this.fireRate / gameSpeed) {
            this.fire(bullets);
            this.lastFire = Date.now();
        }
    }
    
    findTarget(enemies) {
        let bestTarget = null;
        let bestProgress = -1; // 使用負值，因為我們要找最接近終點的敵人
        
        enemies.forEach(enemy => {
            // 檢查敵人是否在攻擊範圍內
            const distanceToTower = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distanceToTower <= this.range) {
                // 計算敵人到終點的進度（路徑索引越高，越接近終點）
                const progress = enemy.pathIndex + (1 - this.getDistanceToNextPathPoint(enemy));
                
                // 選擇進度最高的敵人（最接近終點）
                if (progress > bestProgress) {
                    bestTarget = enemy;
                    bestProgress = progress;
                }
            }
        });
        
        this.target = bestTarget;
    }
    
    getDistanceToNextPathPoint(enemy) {
        if (enemy.pathIndex >= enemy.path.length - 1) {
            return 0; // 已經到達終點
        }
        
        const currentPoint = enemy.path[enemy.pathIndex];
        const nextPoint = enemy.path[enemy.pathIndex + 1];
        const totalDistance = Math.sqrt((nextPoint.x - currentPoint.x) ** 2 + (nextPoint.y - currentPoint.y) ** 2);
        const remainingDistance = Math.sqrt((enemy.x - nextPoint.x) ** 2 + (enemy.y - nextPoint.y) ** 2);
        
        if (totalDistance === 0) return 0;
        return Math.max(0, Math.min(1, remainingDistance / totalDistance));
    }
    
    fire(bullets) {
        if (this.target) {
            const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            bullets.push(new Bullet(this.x, this.y, angle, this.damage));
            // 播放射擊音效
            if (window.game) {
                window.game.playSound('shoot');
            }
        }
    }
    
    render(ctx) {
        // 獲取裝備的造型顏色
        const equippedSkin = this.getEquippedSkinColor();
        
        ctx.fillStyle = equippedSkin;
        ctx.beginPath();
        
        // 根據裝備的造型繪製不同形狀
        const equippedSkinId = window.game.equippedSkins[this.type];
        if (equippedSkinId === 'triangle') {
            // 繪製三角形
            ctx.moveTo(this.x, this.y - 15);
            ctx.lineTo(this.x - 13, this.y + 10);
            ctx.lineTo(this.x + 13, this.y + 10);
            ctx.closePath();
        } else if (equippedSkinId === 'square') {
            // 繪製正方形
            ctx.rect(this.x - 12, this.y - 12, 24, 24);
        } else {
            // 預設圓形
            ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        }
        
        ctx.fill();
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 繪製升級等級
        if (this.level > 0) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.level.toString(), this.x, this.y + 4);
        }
        
        // 繪製攻擊範圍（可選）
        if (this.target) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    getEquippedSkinColor() {
        // 使用升級後的顏色
        return this.color;
    }
    
    canUpgrade() {
        return this.level < 3;
    }
    
    getUpgradeCost() {
        if (this.level === 0) return 10;
        if (this.level === 1) return 10;
        if (this.level === 2) return 15;
        return 0;
    }
    
    upgrade(upgradeType) {
        if (!this.canUpgrade()) return false;
        
        const cost = this.getUpgradeCost();
        if (window.game.coins < cost) return false;
        
        window.game.coins -= cost;
        this.level++;
        
        if (upgradeType === 'damage') {
            this.damageUpgrades++;
        } else if (upgradeType === 'speed') {
            this.speedUpgrades++;
        }
        
        // 第三級自動提升所有屬性
        if (this.level === 3) {
            this.damageUpgrades++;
            this.speedUpgrades++;
        }
        
        this.updateSkinBonus();
        window.game.updateUI();
        return true;
    }
}

class Enemy {
    constructor(path, type, config) {
        this.path = path;
        this.type = type;
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.reward = config.reward;
        this.color = config.color;
        
        this.x = path[0].x;
        this.y = path[0].y;
        this.pathIndex = 0;
        this.reachedEnd = false;
    }
    
    update(gameSpeed = 1) {
        if (this.pathIndex < this.path.length - 1) {
            const target = this.path[this.pathIndex + 1];
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.speed * gameSpeed) {
                this.pathIndex++;
                if (this.pathIndex >= this.path.length - 1) {
                    this.reachedEnd = true;
                }
            } else {
                this.x += (dx / distance) * this.speed * gameSpeed;
                this.y += (dy / distance) * this.speed * gameSpeed;
            }
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
    }
    
    render(ctx) {
        // Boss敵人使用交錯圖片動畫
        if (this.type === 'boss' || this.type === 'boss_2' || this.type === 'boss_4' || this.type === 'boss_6' || this.type === 'boss_8') {
            // 根據boss類型載入對應圖片
            if (this.type === 'boss') {
                // 最後一關boss使用動畫效果
                if (!this.bossImage1) {
                    this.bossImage1 = new Image();
                    this.bossImage1.onload = () => {
                        console.log('Boss圖片1載入成功');
                    };
                    this.bossImage1.onerror = () => {
                        console.log('Boss圖片1載入失敗');
                    };
                    this.bossImage1.src = 'boss/1.png';
                }
                
                if (!this.bossImage2) {
                    this.bossImage2 = new Image();
                    this.bossImage2.onload = () => {
                        console.log('Boss圖片2載入成功');
                    };
                    this.bossImage2.onerror = () => {
                        console.log('Boss圖片2載入失敗');
                    };
                    this.bossImage2.src = 'boss/2.png';
                }
                
                if (!this.bossImage3) {
                    this.bossImage3 = new Image();
                    this.bossImage3.onload = () => {
                        console.log('Boss圖片3載入成功');
                    };
                    this.bossImage3.onerror = () => {
                        console.log('Boss圖片3載入失敗');
                    };
                    this.bossImage3.src = 'boss/3.png';
                }
            } else {
                // 其他boss使用單張圖片
                let bossImageSrc = '';
                if (this.type === 'boss_2') {
                    bossImageSrc = 'boss/toco.png';
                } else if (this.type === 'boss_4') {
                    bossImageSrc = 'boss/boat.png';
                } else if (this.type === 'boss_6') {
                    bossImageSrc = 'boss/turtle.png';
                } else if (this.type === 'boss_8') {
                    bossImageSrc = 'boss/train.png';
                }
                
                if (!this.bossImage1) {
                    this.bossImage1 = new Image();
                    this.bossImage1.onload = () => {
                        console.log('Boss圖片載入成功');
                    };
                    this.bossImage1.onerror = () => {
                        console.log('Boss圖片載入失敗');
                    };
                    this.bossImage1.src = bossImageSrc;
                }
            }
            
            // 檢查圖片是否載入完成
            const image1Ready = this.bossImage1.complete && this.bossImage1.naturalWidth > 0;
            const image2Ready = this.bossImage2 && this.bossImage2.complete && this.bossImage2.naturalWidth > 0;
            const image3Ready = this.bossImage3 && this.bossImage3.complete && this.bossImage3.naturalWidth > 0;

            if (image1Ready || image2Ready || image3Ready) {
                const size = 50; // Boss圖片大小
                
                if (this.type === 'boss') {
                    // 最後一關boss使用動畫效果
                    const time = Date.now() * 0.005; // 調整動畫速度
                    const frame = Math.floor(time) % 3; // 0, 1, 2
                    
                    // 根據幀數選擇圖片
                    let currentImage = null;
                    if (frame === 0 && image1Ready) {
                        currentImage = this.bossImage1;
                    } else if (frame === 1 && image2Ready) {
                        currentImage = this.bossImage2;
                    } else if (frame === 2 && image3Ready) {
                        currentImage = this.bossImage3;
                    } else if (image1Ready) {
                        currentImage = this.bossImage1;
                    } else if (image2Ready) {
                        currentImage = this.bossImage2;
                    } else if (image3Ready) {
                        currentImage = this.bossImage3;
                    }
                    
                    if (currentImage) {
                        ctx.drawImage(currentImage, this.x - size/2, this.y - size/2, size, size);
                    }
                } else {
                    // 其他boss使用單張圖片
                    ctx.drawImage(this.bossImage1, this.x - size/2, this.y - size/2, size, size);
                }
                
                // 添加動態光環效果
                const time = Date.now() * 0.005;
                const pulse = Math.sin(time) * 0.3 + 0.7;
                ctx.strokeStyle = `rgba(142, 68, 173, ${pulse * 0.5})`;
                ctx.lineWidth = 3 + Math.sin(time * 2) * 1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 30 + Math.sin(time * 1.5) * 5, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                // 如果圖片都沒載入，使用原本的圓形
                const radius = 25;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.strokeStyle = '#2c3e50';
                ctx.lineWidth = 4;
                ctx.stroke();
                
                // 繪製外圈光環
                ctx.strokeStyle = 'rgba(142, 68, 173, 0.5)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius + 10, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Boss血量條
            const barWidth = 50;
            const barHeight = 8;
            const barOffset = 35;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x - barWidth / 2, this.y - barOffset, barWidth, barHeight);
            
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(this.x - barWidth / 2, this.y - barOffset, barWidth * healthPercent, barHeight);
            
            // Boss敵人顯示血量數字
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.health}/${this.maxHealth}`, this.x, this.y - barOffset - 5);
        } else {
            // 一般敵人
            const radius = 12;
            const barWidth = 20;
            const barHeight = 4;
            const barOffset = 20;
            
            // 繪製敵人
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#2c3e50';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 繪製生命值條
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(this.x - barWidth / 2, this.y - barOffset, barWidth, barHeight);
            
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(this.x - barWidth / 2, this.y - barOffset, barWidth * healthPercent, barHeight);
        }
    }
}

class Bullet {
    constructor(x, y, angle, damage) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.damage = damage;
        this.speed = 5;
        this.life = 100;
    }
    
    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life--;
    }
    
    render(ctx) {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.color = color;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class CoinAnimation {
    constructor(x, y, amount) {
        this.x = x;
        this.y = y;
        this.amount = amount;
        this.life = 60;
        this.maxLife = 60;
        this.vy = -2;
    }
    
    update() {
        this.y += this.vy;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${this.amount}`, this.x, this.y);
    }
}

class ScoreAnimation {
    constructor(x, y, amount) {
        this.x = x;
        this.y = y;
        this.amount = amount;
        this.life = 60;
        this.maxLife = 60;
        this.vy = -2;
    }
    
    update() {
        this.y += this.vy;
        this.life--;
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`+${this.amount}`, this.x, this.y);
    }
}

// 啟動遊戲
document.addEventListener('DOMContentLoaded', () => {
    window.game = new TowerDefenseGame();
});
