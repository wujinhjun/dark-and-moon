/**
 * 游戏主模块
 * 负责游戏的初始化、更新和渲染
 */

const Game = {
  // 游戏状态
  isRunning: false,
  isPaused: false,
  debugMode: false,

  // 游戏对象
  canvas: null,
  ctx: null,
  player: null,
  currentLevel: null,
  levels: [],
  currentLevelNumber: 1,

  // 游戏资源
  inventory: [],
  score: 0,

  // 游戏性能
  lastTime: 0,
  deltaTime: 0,
  fps: 0,
  frameCount: 0,
  fpsTimer: 0,

  /**
   * 初始化游戏
   */
  init: function () {
    // 获取Canvas和上下文
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // 设置Canvas尺寸
    this.canvas.width = 800;
    this.canvas.height = 600;

    // 初始化输入处理
    Input.init();

    // 初始化UI
    UI.init();

    // 初始化商店
    Shop.init();

    // 初始化升级系统
    Upgrade.init();

    // 添加键盘快捷键
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  },

  /**
   * 处理键盘快捷键
   * @param {KeyboardEvent} e - 键盘事件
   */
  handleKeyDown: function (e) {
    // ESC键暂停/恢复游戏
    if (e.key === 'Escape' && this.isRunning) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    }

    // P键打开商店
    if (
      e.key === 'p' &&
      this.isRunning &&
      !this.isPaused &&
      !Shop.isOpen &&
      !Upgrade.isOpen
    ) {
      Shop.open(this.player.level);
    }

    // U键打开升级界面
    if (
      e.key === 'u' &&
      this.isRunning &&
      !this.isPaused &&
      !Shop.isOpen &&
      !Upgrade.isOpen
    ) {
      Upgrade.open(this.player.level);
    }

    // D键切换调试模式
    if (e.key === 'd' && e.ctrlKey) {
      this.debugMode = !this.debugMode;
    }
  },

  /**
   * 开始游戏
   */
  start: function () {
    if (this.isRunning) return;

    // 重置游戏状态
    this.reset();

    // 创建玩家
    this.player = new Player(0, 0);

    // 创建第一关
    this.currentLevelNumber = 1;
    this.currentLevel = new Level(this.currentLevelNumber);
    this.currentLevel.setPlayer(this.player);

    // 显示游戏UI
    UI.showGameUI();

    // 开始游戏循环
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  },

  /**
   * 游戏循环
   * @param {number} timestamp - 当前时间戳
   */
  gameLoop: function (timestamp) {
    // 计算帧时间差
    this.deltaTime = (timestamp - this.lastTime) / 1000; // 转换为秒
    this.lastTime = timestamp;

    // 限制最大帧时间差，防止卡顿时物理计算出错
    if (this.deltaTime > 0.1) this.deltaTime = 0.1;

    // 计算FPS
    this.frameCount++;
    this.fpsTimer += this.deltaTime;
    if (this.fpsTimer >= 1) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer -= 1;
    }

    // 如果游戏未暂停，更新游戏状态
    if (!this.isPaused) {
      this.update();
    }

    // 渲染游戏
    this.render();

    // 继续游戏循环
    if (this.isRunning) {
      requestAnimationFrame(this.gameLoop.bind(this));
    }
  },

  /**
   * 更新游戏状态
   */
  update: function () {
    // 更新当前关卡
    if (this.currentLevel) {
      this.currentLevel.update(this.deltaTime);
    }

    // 更新玩家
    if (this.player && this.player.isActive) {
      this.player.update(
        this.deltaTime,
        this.currentLevel.entities,
        this.currentLevel,
      );
    }

    // 更新UI
    UI.updatePlayerStats(this.player);
  },

  /**
   * 渲染游戏
   */
  render: function () {
    // 清空画布
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 渲染当前关卡
    if (this.currentLevel) {
      this.currentLevel.render(this.ctx);
    }

    // 渲染玩家
    if (this.player && this.player.isActive) {
      this.player.render(this.ctx);
    }

    // 渲染UI
    UI.render(this.ctx, this);
  },

  /**
   * 暂停游戏
   */
  pause: function () {
    this.isPaused = true;
  },

  /**
   * 恢复游戏
   */
  resume: function () {
    this.isPaused = false;
  },

  /**
   * 重置游戏
   */
  reset: function () {
    this.player = null;
    this.currentLevel = null;
    this.currentLevelNumber = 1;
    this.inventory = [];
    this.score = 0;
  },

  /**
   * 重新开始游戏
   */
  restart: function () {
    // 停止当前游戏
    this.isRunning = false;

    // 重新开始
    setTimeout(() => {
      // TODO: 人工修改
      UI.closeGameOver();

      this.start();
    }, 100);
  },

  /**
   * 游戏结束
   */
  gameOver: function () {
    this.isRunning = false;

    // 计算最终得分
    const finalScore = this.calculateScore();

    // 显示游戏结束界面
    UI.showGameOver(finalScore);
  },

  /**
   * 计算得分
   * @returns {number} 得分
   */
  calculateScore: function () {
    // 基础分数：关卡数 * 100 + 玩家等级 * 50 + 金币数
    let score =
      this.currentLevelNumber * 100 +
      (this.player ? this.player.level * 50 + this.player.coins : 0);

    return score;
  },

  /**
   * 关卡完成
   */
  levelCompleted: function () {
    // 增加得分
    this.score += this.currentLevelNumber * 100;

    // 显示完成消息
    this.showMessage(`关卡 ${this.currentLevelNumber} 完成！`);

    // 打开升级界面
    setTimeout(() => {
      Upgrade.open(this.player.level);
    }, 1000);

    // 进入下一关
    setTimeout(() => {
      this.nextLevel();
    }, 1500);
  },

  /**
   * 进入下一关
   */
  nextLevel: function () {
    // 增加关卡数
    this.currentLevelNumber++;

    // 创建新关卡
    this.currentLevel = new Level(this.currentLevelNumber);
    this.currentLevel.setPlayer(this.player);

    // 显示新关卡消息
    this.showMessage(`进入关卡 ${this.currentLevelNumber}`);
  },

  /**
   * 玩家升级
   */
  playerLevelUp: function () {
    // 显示升级消息
    this.showMessage(`玩家升级到 ${this.player.level} 级！`);

    // 更新UI
    UI.updatePlayerStats(this.player);
  },

  /**
   * 显示消息
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时间（毫秒）
   */
  showMessage: function (message, duration = 2000) {
    UI.showMessage(message, duration);
  },

  /**
   * 添加实体到当前关卡
   * @param {Entity} entity - 实体对象
   */
  addEntity: function (entity) {
    if (this.currentLevel) {
      this.currentLevel.addEntity(entity);
    }
  },

  /**
   * 添加物品到物品栏
   * @param {Item} item - 物品对象
   */
  addToInventory: function (item) {
    this.inventory.push(item);
  },
};

// 当页面加载完成后初始化游戏
window.addEventListener('load', function () {
  Game.init();
});
