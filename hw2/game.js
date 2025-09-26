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
        this.currentWave = 1;
        this.totalWaves = 5;
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.selectedTower = null;
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
        
        // 通知系統
        this.notifications = [];
        this.notificationTimeout = null;
        
        // 音效控制
        this.isMuted = localStorage.getItem('gameMuted') === 'true';
        
        // 音效系統
        this.audioContext = null;
        this.sounds = {};
        this.initAudio();
        
        // 遊戲物件
        this.towers = [];
        this.enemies = [];
        this.bullets = [];
        this.particles = [];
        
        // 關卡配置
        this.levels = this.initializeLevels();
        this.currentLevelData = this.levels[this.currentLevel - 1];
        
        // 塔防配置
        this.towerTypes = {
            basic: { cost: 20, damage: 20, range: 80, fireRate: 1000, color: '#f39c12' },
            rapid: { cost: 40, damage: 15, range: 70, fireRate: 500, color: '#9b59b6' },
            heavy: { cost: 70, damage: 40, range: 100, fireRate: 1500, color: '#e74c3c' },
            ice: { cost: 60, damage: 25, range: 90, fireRate: 800, color: '#3498db' }, // 冰霜塔，第七關出現
            laser: { cost: 100, damage: 60, range: 120, fireRate: 2000, color: '#e67e22' } // 雷射塔，第七關出現
        };
        
        // 怪物配置
        this.enemyTypes = {
            basic: { health: 80, speed: 0.7, reward: 1, color: '#e74c3c' },
            fast: { health: 50, speed: 1.3, reward: 3, color: '#f39c12' },
            tank: { health: 150, speed: 0.4, reward: 5, color: '#3498db' },
            flying: { health: 60, speed: 1.8, reward: 4, color: '#9b59b6' }, // 飛行敵人，第六關出現
            armored: { health: 300, speed: 0.3, reward: 8, color: '#2c3e50' }, // 裝甲敵人，第八關出現
            boss: { health: 1500, speed: 0.15, reward: 50, color: '#8e44ad' } // Boss敵人
        };
        
        this.initializeEventListeners();
        this.updateMuteButtons();
        this.showStartScreen();
    }
    
    initializeShopData() {
        return {
            basic: [
                { id: 'default', name: '預設', color: '#f39c12', price: 0 },
                { id: 'red', name: '紅色', color: '#e74c3c', price: 50 },
                { id: 'blue', name: '藍色', color: '#3498db', price: 50 }
            ],
            rapid: [
                { id: 'default', name: '預設', color: '#9b59b6', price: 0 },
                { id: 'green', name: '綠色', color: '#27ae60', price: 75 },
                { id: 'orange', name: '橙色', color: '#e67e22', price: 75 }
            ],
            heavy: [
                { id: 'default', name: '預設', color: '#e74c3c', price: 0 },
                { id: 'purple', name: '紫色', color: '#8e44ad', price: 100 },
                { id: 'gold', name: '金色', color: '#f1c40f', price: 100 }
            ]
        };
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('音效系統初始化失敗');
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
        if (!this.isMuted && this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message: message,
            type: type,
            time: Date.now()
        };
        
        this.notifications.push(notification);
        
        // 顯示通知
        this.displayNotification(notification);
        
        // 3秒後自動移除
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 3000);
    }
    
    displayNotification(notification) {
        // 創建通知元素
        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.id = `notification-${notification.id}`;
        notificationEl.textContent = notification.message;
        
        // 添加到頁面
        document.body.appendChild(notificationEl);
        
        // 動畫顯示
        setTimeout(() => {
            notificationEl.classList.add('show');
        }, 100);
    }
    
    removeNotification(id) {
        const notificationEl = document.getElementById(`notification-${id}`);
        if (notificationEl) {
            notificationEl.classList.add('hide');
            setTimeout(() => {
                if (notificationEl.parentNode) {
                    notificationEl.parentNode.removeChild(notificationEl);
                }
            }, 300);
        }
        
        // 從數組中移除
        this.notifications = this.notifications.filter(n => n.id !== id);
    }
    
    initializeLevels() {
        return [
            {
                name: "森林關卡",
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
                    { enemies: [{ type: 'basic', count: 12, delay: 800 }] },
                    { enemies: [{ type: 'fast', count: 10, delay: 600 }] },
                    { enemies: [{ type: 'basic', count: 15, delay: 700 }, { type: 'fast', count: 8, delay: 1000 }] },
                    { enemies: [{ type: 'tank', count: 5, delay: 2000 }, { type: 'basic', count: 12, delay: 500 }] }
                ]
            },
            {
                name: "沙漠關卡",
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
                    { enemies: [{ type: 'fast', count: 12, delay: 700 }] },
                    { enemies: [{ type: 'tank', count: 4, delay: 1500 }] },
                    { enemies: [{ type: 'basic', count: 18, delay: 600 }, { type: 'fast', count: 10, delay: 800 }] },
                    { enemies: [{ type: 'tank', count: 6, delay: 1200 }, { type: 'fast', count: 15, delay: 500 }] }
                ]
            },
            {
                name: "山脈關卡",
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
                    { enemies: [{ type: 'fast', count: 15, delay: 600 }] },
                    { enemies: [{ type: 'tank', count: 5, delay: 1000 }] },
                    { enemies: [{ type: 'basic', count: 20, delay: 500 }, { type: 'fast', count: 12, delay: 700 }] },
                    { enemies: [{ type: 'tank', count: 8, delay: 1000 }, { type: 'fast', count: 18, delay: 400 }] }
                ]
            },
            {
                name: "城市關卡",
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
                    { enemies: [{ type: 'basic', count: 18, delay: 700 }] },
                    { enemies: [{ type: 'tank', count: 6, delay: 800 }] },
                    { enemies: [{ type: 'fast', count: 20, delay: 400 }, { type: 'basic', count: 15, delay: 600 }] },
                    { enemies: [{ type: 'tank', count: 8, delay: 800 }, { type: 'fast', count: 20, delay: 300 }] }
                ]
            },
            {
                name: "最終關卡",
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
                    { enemies: [{ type: 'fast', count: 18, delay: 500 }] },
                    { enemies: [{ type: 'tank', count: 8, delay: 800 }] },
                    { enemies: [{ type: 'basic', count: 25, delay: 400 }, { type: 'fast', count: 20, delay: 500 }] },
                    { enemies: [{ type: 'tank', count: 12, delay: 600 }, { type: 'fast', count: 25, delay: 300 }] }
                ]
            },
            {
                name: "火山關卡",
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
                    { enemies: [{ type: 'fast', count: 25, delay: 250 }, { type: 'tank', count: 8, delay: 500 }] },
                    { enemies: [{ type: 'basic', count: 30, delay: 200 }, { type: 'fast', count: 20, delay: 300 }] },
                    { enemies: [{ type: 'tank', count: 15, delay: 400 }, { type: 'fast', count: 30, delay: 150 }, { type: 'basic', count: 25, delay: 100 }] }
                ],
                newEnemy: 'flying' // 第六關新增飛行敵人
            },
            {
                name: "冰雪關卡",
                path: [
                    { x: 0, y: 300 },
                    { x: 120, y: 300 },
                    { x: 120, y: 180 },
                    { x: 240, y: 180 },
                    { x: 240, y: 60 },
                    { x: 360, y: 60 },
                    { x: 360, y: 240 },
                    { x: 480, y: 240 },
                    { x: 480, y: 120 },
                    { x: 600, y: 120 },
                    { x: 600, y: 300 },
                    { x: 700, y: 300 }
                ],
                waves: [
                    { enemies: [{ type: 'fast', count: 10, delay: 500 }] },
                    { enemies: [{ type: 'tank', count: 8, delay: 800 }] },
                    { enemies: [{ type: 'basic', count: 25, delay: 300 }] },
                    { enemies: [{ type: 'fast', count: 20, delay: 350 }, { type: 'tank', count: 6, delay: 600 }] },
                    { enemies: [{ type: 'basic', count: 30, delay: 200 }, { type: 'fast', count: 25, delay: 250 }] },
                    { enemies: [{ type: 'tank', count: 12, delay: 400 }, { type: 'basic', count: 20, delay: 300 }] },
                    { enemies: [{ type: 'fast', count: 35, delay: 100 }, { type: 'tank', count: 18, delay: 300 }, { type: 'basic', count: 30, delay: 80 }] }
                ],
                newTowers: ['ice', 'laser'] // 第七關新增冰霜塔和雷射塔
            },
            {
                name: "雷電關卡",
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
                    { enemies: [{ type: 'tank', count: 15, delay: 500 }, { type: 'fast', count: 25, delay: 200 }] },
                    { enemies: [{ type: 'basic', count: 35, delay: 150 }, { type: 'tank', count: 12, delay: 400 }] },
                    { enemies: [{ type: 'fast', count: 40, delay: 80 }, { type: 'tank', count: 20, delay: 250 }, { type: 'basic', count: 30, delay: 60 }] }
                ],
                newEnemy: 'armored' // 第八關新增裝甲敵人
            },
            {
                name: "暗影關卡",
                path: [
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
                waves: [
                    { enemies: [{ type: 'tank', count: 8, delay: 600 }] },
                    { enemies: [{ type: 'fast', count: 20, delay: 400 }] },
                    { enemies: [{ type: 'basic', count: 30, delay: 250 }] },
                    { enemies: [{ type: 'tank', count: 15, delay: 400 }, { type: 'fast', count: 25, delay: 300 }] },
                    { enemies: [{ type: 'basic', count: 40, delay: 150 }, { type: 'tank', count: 18, delay: 350 }] },
                    { enemies: [{ type: 'fast', count: 35, delay: 100 }, { type: 'basic', count: 25, delay: 200 }] },
                    { enemies: [{ type: 'tank', count: 25, delay: 200 }, { type: 'fast', count: 45, delay: 60 }, { type: 'basic', count: 35, delay: 50 }] }
                ]
            },
            {
                name: "終極關卡",
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
                    { enemies: [{ type: 'basic', count: 18, delay: 300 }] },
                    { enemies: [{ type: 'fast', count: 30, delay: 250 }] },
                    { enemies: [{ type: 'tank', count: 20, delay: 400 }] },
                    { enemies: [{ type: 'basic', count: 40, delay: 200 }, { type: 'fast', count: 30, delay: 300 }] },
                    { enemies: [{ type: 'tank', count: 25, delay: 300 }, { type: 'fast', count: 35, delay: 150 }] },
                    { enemies: [{ type: 'basic', count: 50, delay: 100 }, { type: 'tank', count: 20, delay: 250 }] },
                    { enemies: [{ type: 'fast', count: 50, delay: 50 }, { type: 'tank', count: 30, delay: 150 }, { type: 'basic', count: 40, delay: 40 }] }
                ]
            },
            {
                name: "Boss關卡",
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
                    { enemies: [{ type: 'flying', count: 20, delay: 400 }] },
                    { enemies: [{ type: 'armored', count: 15, delay: 600 }] },
                    { enemies: [{ type: 'basic', count: 40, delay: 200 }, { type: 'fast', count: 30, delay: 300 }] },
                    { enemies: [{ type: 'tank', count: 30, delay: 300 }, { type: 'flying', count: 25, delay: 200 }] },
                    { enemies: [{ type: 'armored', count: 20, delay: 400 }, { type: 'fast', count: 40, delay: 150 }] },
                    { enemies: [{ type: 'basic', count: 50, delay: 100 }, { type: 'tank', count: 25, delay: 200 }] },
                    { enemies: [{ type: 'flying', count: 30, delay: 100 }, { type: 'armored', count: 15, delay: 300 }] },
                    { enemies: [{ type: 'fast', count: 60, delay: 50 }, { type: 'tank', count: 35, delay: 100 }, { type: 'basic', count: 45, delay: 30 }] },
                    { enemies: [{ type: 'flying', count: 40, delay: 80 }, { type: 'armored', count: 25, delay: 150 }, { type: 'fast', count: 50, delay: 40 }] },
                    { enemies: [{ type: 'boss', count: 1, delay: 0 }] } // Boss波次
                ],
                isBoss: true
            }
        ];
    }
    
    initializeEventListeners() {
        // 開始頁面
        document.getElementById('enter-game').addEventListener('click', () => {
            this.showLevelSelect();
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
                    this.currentLevel = level;
                    this.startLevel();
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
                if (towerType && this.towerTypes[towerType] && this.coins >= this.towerTypes[towerType].cost) {
                    this.selectedTower = towerType;
                    document.querySelectorAll('.tower-option').forEach(opt => opt.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
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
        
        // 快轉按鈕
        document.getElementById('fast-forward').addEventListener('click', () => {
            this.toggleFastForward();
        });
        
        // 靜音按鈕 (只在主選單和關卡選擇頁面)
        document.getElementById('mute-btn-level').addEventListener('click', () => {
            this.toggleMute();
        });
        
        document.getElementById('mute-btn-guide').addEventListener('click', () => {
            this.toggleMute();
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
            if (this.gameState === 'playing' && this.selectedTower) {
                this.placeTower(e);
            }
        });
        
        // 畫布鼠標移動事件
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        // 鍵盤事件
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            } else if (e.key === 'r' || e.key === 'R') {
                this.restartGame();
            }
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
        return this.completedLevels.includes(level - 1);
    }
    
    updateLevelButtons() {
        document.querySelectorAll('.level-btn').forEach(btn => {
            const level = parseInt(btn.dataset.level);
            btn.classList.remove('unlocked', 'locked');
            
            // 隱藏boss關卡（第11關）
            if (level === 11) {
                btn.style.display = 'none';
                return;
            }
            
            if (this.isLevelUnlocked(level)) {
                btn.classList.add('unlocked');
                btn.disabled = false;
            } else {
                btn.classList.add('locked');
                btn.disabled = true;
            }
        });
    }
    
    startLevel() {
        document.getElementById('level-select-screen').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        this.currentLevelData = this.levels[this.currentLevel - 1];
        this.lives = 5;
        this.coins = 100;
        this.score = 0;
        this.currentLevelScore = 0;
        this.currentLevelCoins = 0;
        this.currentWave = 1;
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
        
        // 檢查新敵人通知
        if (this.currentLevelData.newEnemy) {
            const enemyName = this.currentLevelData.newEnemy === 'flying' ? '飛行敵人' : '裝甲敵人';
            this.showNotification(`🆕 新敵人出現：${enemyName}！`, 'warning');
        }
        
        // 檢查新塔防通知
        if (this.currentLevelData.newTowers) {
            this.showNotification('🆕 新塔防解鎖：冰霜塔和雷射塔！', 'success');
            // 顯示新塔防
            document.querySelector('.tower-option[data-tower="ice"]').style.display = 'block';
            document.querySelector('.tower-option[data-tower="laser"]').style.display = 'block';
        }
        
        this.updateUI();
        
        // 更新塔防圖標顏色
        this.updateTowerIcons();
        
        // 啟動遊戲循環
        this.gameLoop();
    }
    
    updateUI() {
        document.getElementById('current-level').textContent = this.currentLevel;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('current-wave').textContent = this.currentWave;
        document.getElementById('total-waves').textContent = this.totalWaves;
        document.getElementById('timer').textContent = Math.floor(this.timer);
        document.getElementById('score').textContent = this.score;
        
        // 更新關卡總數顯示
        const levelInfo = document.querySelector('#level-info span');
        if (levelInfo) {
            levelInfo.textContent = `關卡: ${this.currentLevel}/10`;
        }
        
        // 更新開始波次按鈕狀態
        const startWaveBtn = document.getElementById('start-wave');
        if (this.waveInProgress) {
            startWaveBtn.textContent = '波次進行中...';
            startWaveBtn.disabled = true;
        } else if (this.currentWave > this.totalWaves) {
            startWaveBtn.textContent = '關卡完成';
            startWaveBtn.disabled = true;
        } else {
            startWaveBtn.textContent = '開始波次';
            startWaveBtn.disabled = false;
        }
        
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
            if (towerType && this.towerTypes[towerType]) {
                const cost = this.towerTypes[towerType].cost;
                if (this.coins < cost) {
                    option.classList.add('disabled');
                } else {
                    option.classList.remove('disabled');
                }
            }
        });
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 更新倒數計時器
        if (this.waveInProgress && this.gameState === 'playing') {
            this.timer -= (1/60) * this.gameSpeed; // 假設60FPS，倒數
            if (this.timer <= 0) {
                this.timer = 0;
                // 時間到，檢查是否還有敵人
                if (this.enemies.length > 0) {
                    // 時間到但還有敵人，強制結束波次
                    this.forceEndWave();
                }
            }
            this.updateUI();
        }
        
        // 更新敵人
        this.enemies.forEach((enemy, index) => {
            enemy.update(this.gameSpeed);
            if (enemy.reachedEnd) {
                this.lives--;
                this.enemies.splice(index, 1);
                this.updateUI();
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
        
        // 更新粒子效果
        this.particles.forEach((particle, index) => {
            particle.update();
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // 更新金幣動畫
        this.coinAnimations.forEach((animation, index) => {
            animation.update();
            if (animation.life <= 0) {
                this.coinAnimations.splice(index, 1);
            }
        });
        
        // 更新分數動畫
        this.scoreAnimations.forEach((animation, index) => {
            animation.update();
            if (animation.life <= 0) {
                this.scoreAnimations.splice(index, 1);
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
                        this.updateUI();
                    }
                }
            });
        });
        
        // 檢查波次完成
        if (this.enemies.length === 0 && this.waveInProgress && this.currentWave <= this.totalWaves) {
            this.waveInProgress = false;
            
            // 計算時間獎勵（基於剩餘時間）
            const timeBonus = Math.floor(this.timer); // 每秒1金幣
            this.coins += 20 + timeBonus; // 基礎20金幣 + 時間獎勵
            this.score += (20 + timeBonus) * 10; // 分數獎勵
            this.currentLevelScore += (20 + timeBonus) * 10;
            this.currentLevelCoins += 20 + timeBonus;
            this.scoreAnimations.push(new ScoreAnimation(350, 200, (20 + timeBonus) * 10));
            
            // 重置計時器
            this.timer = 0;
            this.maxTimer = 0;
            
            this.currentWave++;
            this.updateUI();
            if (this.currentWave > this.totalWaves) {
                this.levelComplete();
            }
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
        
        // 繪製波次狀態
        if (this.waveInProgress) {
            this.drawWaveStatus();
        }
    }
    
    drawBackground() {
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
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.currentLevelData.path[0].x, this.currentLevelData.path[0].y);
        
        for (let i = 1; i < this.currentLevelData.path.length; i++) {
            this.ctx.lineTo(this.currentLevelData.path[i].x, this.currentLevelData.path[i].y);
        }
        
        this.ctx.stroke();
    }
    
    drawStartEndPoints() {
        const start = this.currentLevelData.path[0];
        const end = this.currentLevelData.path[this.currentLevelData.path.length - 1];
        
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
    }
    
    drawTowerPreview() {
        if (!this.selectedTower) return;
        
        // 獲取裝備的皮膚顏色
        const equippedSkin = this.equippedSkins[this.selectedTower];
        const skinData = this.shopData[this.selectedTower].find(s => s.id === equippedSkin);
        const previewColor = skinData ? skinData.color : this.towerTypes[this.selectedTower].color;
        
        // 繪製塔防預覽
        this.ctx.fillStyle = previewColor;
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        this.ctx.arc(this.mouseX, this.mouseY, 15, 0, Math.PI * 2);
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
        for (let i = 0; i < this.currentLevelData.path.length - 1; i++) {
            const start = this.currentLevelData.path[i];
            const end = this.currentLevelData.path[i + 1];
            
            const distance = this.pointToLineDistance(x, y, start.x, start.y, end.x, end.y);
            if (distance < pathWidth / 2) {
                return true;
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
        if (this.currentWave <= this.totalWaves && !this.waveInProgress) {
            this.playSound('waveStart');
            this.waveInProgress = true;
            this.waveStarted = true;
            
            const wave = this.currentLevelData.waves[this.currentWave - 1];
            let delay = 0;
            let totalEnemies = 0;
            
            // 計算總延遲和敵人數量
            wave.enemies.forEach(enemyGroup => {
                totalEnemies += enemyGroup.count;
                for (let i = 0; i < enemyGroup.count; i++) {
                    setTimeout(() => {
                        if (this.enemyTypes[enemyGroup.type]) {
                            this.enemies.push(new Enemy(this.currentLevelData.path, enemyGroup.type, this.enemyTypes[enemyGroup.type]));
                        }
                    }, delay);
                    delay += enemyGroup.delay;
                }
            });
            
            // 設定1分鐘倒數計時
            this.timer = 60; // 60秒
            this.maxTimer = 60;
        }
    }
    
    calculatePathLength() {
        let length = 0;
        for (let i = 0; i < this.currentLevelData.path.length - 1; i++) {
            const start = this.currentLevelData.path[i];
            const end = this.currentLevelData.path[i + 1];
            length += Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
        }
        return length;
    }
    
    forceEndWave() {
        // 強制結束波次，清除所有敵人
        this.enemies = [];
        this.waveInProgress = false;
        this.currentWave++;
        this.updateUI();
        if (this.currentWave > this.totalWaves) {
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
        this.showLevelSelect();
    }
    
    levelComplete() {
        // 保存關卡完成進度
        if (!this.completedLevels.includes(this.currentLevel)) {
            this.completedLevels.push(this.currentLevel);
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
        }
        
        // 如果完成第十關，解鎖boss關卡
        if (this.currentLevel === 10 && !this.completedLevels.includes(11)) {
            this.completedLevels.push(11);
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
            this.showNotification('🎉 Boss關卡已解鎖！', 'success');
        }
        
        // 計算商店金幣獎勵
        const shopCoinsEarned = Math.floor(this.currentLevelScore / 10);
        this.shopCoins += shopCoinsEarned;
        localStorage.setItem('shopCoins', this.shopCoins.toString());
        
        // 顯示結果彈窗
        this.showLevelResult(true);
    }
    
    gameOver(won) {
        if (!won) {
            this.showLevelResult(false);
        }
        this.gameState = 'gameOver';
    }
    
    nextLevel() {
        if (this.currentLevel < 5) {
            this.currentLevel++;
            this.startLevel();
        }
        document.getElementById('game-over-modal').style.display = 'none';
        this.updateLevelButtons();
    }
    
    restartGame() {
        this.currentLevel = 1;
        this.startLevel();
        document.getElementById('game-over-modal').style.display = 'none';
        document.getElementById('pause-modal').style.display = 'none';
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
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('gameMuted', this.isMuted.toString());
        this.updateMuteButtons();
    }
    
    updateMuteButtons() {
        // 更新主選單和關卡選擇頁面的靜音按鈕
        const muteButtons = ['mute-btn-level', 'mute-btn-guide'];
        muteButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                if (this.isMuted) {
                    btn.textContent = '🔇';
                    btn.classList.add('muted');
                } else {
                    btn.textContent = '🔊';
                    btn.classList.remove('muted');
                }
            }
        });
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
            
            item.innerHTML = `
                <div class="tower-skin" style="background: ${skin.color}"></div>
                <div class="skin-name">${skin.name}</div>
                <div class="skin-price">${skin.price === 0 ? '免費' : skin.price + ' 金幣'}</div>
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
            coins.textContent = Math.floor(this.currentLevelScore / 10);
            
            if (this.currentLevel < 11) {
                nextBtn.style.display = 'inline-block';
            } else {
                nextBtn.style.display = 'none';
            }
            shopBtn.style.display = 'inline-block';
        } else {
            title.textContent = '關卡失敗！';
            score.textContent = this.currentLevelScore;
            coins.textContent = Math.floor(this.currentLevelScore / 10);
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
        this.startLevel();
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
            const skinData = this.shopData.basic.find(s => s.id === equippedSkin);
            basicIcon.style.background = skinData ? skinData.color : '#f39c12';
        }
        
        // 更新快速塔圖標
        const rapidIcon = document.querySelector('.rapid-tower');
        if (rapidIcon) {
            const equippedSkin = this.equippedSkins.rapid;
            const skinData = this.shopData.rapid.find(s => s.id === equippedSkin);
            rapidIcon.style.background = skinData ? skinData.color : '#9b59b6';
        }
        
        // 更新重型塔圖標
        const heavyIcon = document.querySelector('.heavy-tower');
        if (heavyIcon) {
            const equippedSkin = this.equippedSkins.heavy;
            const skinData = this.shopData.heavy.find(s => s.id === equippedSkin);
            heavyIcon.style.background = skinData ? skinData.color : '#e74c3c';
        }
    }
}

class Tower {
    constructor(x, y, type, config) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.damage = config.damage;
        this.range = config.range;
        this.fireRate = config.fireRate;
        this.color = config.color;
        this.lastFire = 0;
        this.target = null;
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
        let closestEnemy = null;
        let closestDistance = this.range;
        
        enemies.forEach(enemy => {
            const distance = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
            if (distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        });
        
        this.target = closestEnemy;
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
        // 獲取裝備的皮膚顏色
        const equippedSkin = this.getEquippedSkinColor();
        
        ctx.fillStyle = equippedSkin;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
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
        const equippedSkin = window.game.equippedSkins[this.type];
        const skinData = window.game.shopData[this.type].find(s => s.id === equippedSkin);
        return skinData ? skinData.color : this.color;
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
        // 繪製敵人
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 繪製生命值條
        const barWidth = 20;
        const barHeight = 4;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x - barWidth / 2, this.y - 20, barWidth, barHeight);
        
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(this.x - barWidth / 2, this.y - 20, barWidth * healthPercent, barHeight);
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
