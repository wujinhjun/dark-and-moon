/**
 * UI模块
 * 负责管理游戏界面的显示和交互
 */

const UI = {
  // 消息显示计时器
  messageTimer: null,

  /**
   * 初始化UI
   */
  init: function () {
    // 绑定UI事件
    document
      .getElementById('start-game')
      .addEventListener('click', Game.start.bind(Game));
    document
      .getElementById('how-to-play')
      .addEventListener('click', this.showHowToPlay.bind(this));
    document
      .getElementById('back-to-menu')
      .addEventListener('click', this.backToMenu.bind(this));
    document
      .getElementById('restart-game')
      .addEventListener('click', Game.restart.bind(Game));
  },

  /**
   * 显示游戏说明
   */
  showHowToPlay: function () {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('how-to-play-screen').classList.remove('hidden');
  },

  /**
   * 返回主菜单
   */
  backToMenu: function () {
    document.getElementById('how-to-play-screen').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
  },

  /**
   * 显示游戏界面
   */
  showGameUI: function () {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-ui').classList.remove('hidden');
  },

  /**
   * 显示游戏结束界面
   * @param {number} score - 玩家得分
   */
  showGameOver: function (score) {
    document.getElementById('game-ui').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('final-score').textContent = score;
  },

  /**
   * 关闭游戏结束界面
   */
  closeGameOver: function () {
    document.getElementById('game-over').classList.add('hidden');
  },

  /**
   * 更新玩家状态
   * @param {Player} player - 玩家对象
   */
  updatePlayerStats: function (player) {
    if (!player) return;

    // 更新生命值
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent = `${Math.floor(
      player.health,
    )}/${player.maxHealth}`;

    // 更新金币
    document.getElementById('coins-text').textContent = player.coins;

    // 更新等级
    document.getElementById('level-text').textContent = player.level;
  },

  /**
   * 显示消息
   * @param {string} message - 消息内容
   * @param {number} duration - 显示时间（毫秒）
   */
  showMessage: function (message, duration = 2000) {
    // 清除之前的消息计时器
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
    }

    // 创建或获取消息元素
    let messageElement = document.getElementById('game-message');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'game-message';
      messageElement.style.position = 'absolute';
      messageElement.style.top = '50%';
      messageElement.style.left = '50%';
      messageElement.style.transform = 'translate(-50%, -50%)';
      messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      messageElement.style.color = '#fff';
      messageElement.style.padding = '10px 20px';
      messageElement.style.borderRadius = '5px';
      messageElement.style.fontSize = '18px';
      messageElement.style.fontWeight = 'bold';
      messageElement.style.zIndex = '100';
      messageElement.style.pointerEvents = 'none';
      document.querySelector('.game-container').appendChild(messageElement);
    }

    // 设置消息内容
    messageElement.textContent = message;
    messageElement.style.display = 'block';

    // 设置消息自动消失
    this.messageTimer = setTimeout(() => {
      messageElement.style.display = 'none';
    }, duration);
  },

  /**
   * 渲染游戏界面
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} game - 游戏对象
   */
  render: function (ctx, game) {
    // 在这里可以添加额外的UI渲染，如小地图、技能图标等

    // 渲染调试信息（如果开启）
    if (game.debugMode) {
      this.renderDebugInfo(ctx, game);
    }
  },

  /**
   * 渲染调试信息
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   * @param {Object} game - 游戏对象
   */
  renderDebugInfo: function (ctx, game) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';

    // 显示FPS
    ctx.fillText(`FPS: ${Math.round(game.fps)}`, 10, 20);

    // 显示实体数量
    ctx.fillText(`实体数量: ${game.currentLevel.entities.length}`, 10, 40);

    // 显示玩家位置
    if (game.player) {
      ctx.fillText(
        `玩家位置: (${Math.round(game.player.x)}, ${Math.round(
          game.player.y,
        )})`,
        10,
        60,
      );
    }
  },
};
