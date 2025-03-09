/**
 * 关卡类
 * 负责生成和管理游戏关卡
 */

class Level {
  /**
   * 创建一个游戏关卡
   * @param {number} levelNumber - 关卡编号
   */
  constructor(levelNumber = 1) {
    this.levelNumber = levelNumber;
    this.width = 800;
    this.height = 600;
    this.tileSize = 40; // 瓦片大小
    this.tiles = [];
    this.entities = [];
    this.player = null;
    this.exit = null; // 关卡出口
    this.isCompleted = false;

    // 关卡难度随着关卡数增加
    this.difficulty = 1 + (levelNumber - 1) * 0.2;

    // 敌人生成配置
    this.enemyConfig = {
      maxEnemies: Math.floor(5 + levelNumber * 2), // 敌人数量随关卡增加
      types: ['basic'],
      spawnRate: 0.8, // 敌人生成概率
    };

    // 根据关卡难度调整敌人类型
    if (levelNumber >= 2) {
      this.enemyConfig.types.push('fast');
    }
    if (levelNumber >= 3) {
      this.enemyConfig.types.push('tank');
    }
    if (levelNumber >= 5) {
      this.enemyConfig.types.push('ranged');
    }
    if (levelNumber % 5 === 0) {
      // 每5关出现一次Boss
      this.enemyConfig.types.push('boss');
      this.enemyConfig.spawnRate = 1.0; // Boss关卡必定生成敌人
    }

    // 初始化关卡
    this.initialize();
  }

  /**
   * 初始化关卡
   */
  initialize() {
    // 生成地图
    this.generateMap();

    // 生成敌人
    this.generateEnemies();

    // 生成出口
    this.generateExit();
  }

  /**
   * 生成地图
   */
  generateMap() {
    // 简单的随机地图生成
    // 在实际项目中，可以使用更复杂的算法，如BSP树、元胞自动机等

    // 初始化瓦片数组
    const tilesX = Math.ceil(this.width / this.tileSize);
    const tilesY = Math.ceil(this.height / this.tileSize);

    for (let y = 0; y < tilesY; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < tilesX; x++) {
        // 边界为墙
        if (x === 0 || y === 0 || x === tilesX - 1 || y === tilesY - 1) {
          this.tiles[y][x] = 1; // 墙
        } else {
          // 随机生成一些障碍物
          this.tiles[y][x] = Math.random() < 0.1 ? 1 : 0;
        }
      }
    }

    // 确保玩家出生点周围没有障碍物
    const spawnX = Math.floor(tilesX / 2);
    const spawnY = Math.floor(tilesY / 2);

    for (let y = spawnY - 1; y <= spawnY + 1; y++) {
      for (let x = spawnX - 1; x <= spawnX + 1; x++) {
        if (y >= 0 && y < tilesY && x >= 0 && x < tilesX) {
          this.tiles[y][x] = 0; // 清除障碍物
        }
      }
    }
  }

  /**
   * 生成敌人
   */
  generateEnemies() {
    const tilesX = Math.ceil(this.width / this.tileSize);
    const tilesY = Math.ceil(this.height / this.tileSize);
    const spawnX = Math.floor(tilesX / 2);
    const spawnY = Math.floor(tilesY / 2);

    // 生成指定数量的敌人
    let enemyCount = 0;
    const maxAttempts = this.enemyConfig.maxEnemies * 3;
    let attempts = 0;

    while (enemyCount < this.enemyConfig.maxEnemies && attempts < maxAttempts) {
      attempts++;

      // 随机位置
      const x = Utils.randomInt(1, tilesX - 2);
      const y = Utils.randomInt(1, tilesY - 2);

      // 确保不在玩家出生点附近
      const distToSpawn = Math.sqrt(
        Math.pow(x - spawnX, 2) + Math.pow(y - spawnY, 2),
      );

      // 确保位置是空的且不在玩家附近
      if (this.tiles[y][x] === 0 && distToSpawn > 5) {
        // 随机决定是否生成敌人
        if (Math.random() < this.enemyConfig.spawnRate) {
          // 随机选择敌人类型
          const enemyType = Utils.randomChoice(this.enemyConfig.types);

          // 创建敌人实体
          const enemy = new Enemy(
            x * this.tileSize,
            y * this.tileSize,
            enemyType,
          );

          this.entities.push(enemy);
          enemyCount++;
        }
      }
    }
  }

  /**
   * 生成关卡出口
   */
  generateExit() {
    const tilesX = Math.ceil(this.width / this.tileSize);
    const tilesY = Math.ceil(this.height / this.tileSize);

    // 在地图边缘随机选择一个位置作为出口
    let x, y;
    const side = Utils.randomInt(0, 3); // 0: 上, 1: 右, 2: 下, 3: 左

    switch (side) {
      case 0: // 上
        x = Utils.randomInt(1, tilesX - 2);
        y = 0;
        break;
      case 1: // 右
        x = tilesX - 1;
        y = Utils.randomInt(1, tilesY - 2);
        break;
      case 2: // 下
        x = Utils.randomInt(1, tilesX - 2);
        y = tilesY - 1;
        break;
      case 3: // 左
        x = 0;
        y = Utils.randomInt(1, tilesY - 2);
        break;
    }

    // 清除出口位置的墙
    this.tiles[y][x] = 2; // 2表示出口

    // 保存出口位置
    this.exit = {
      x: x * this.tileSize,
      y: y * this.tileSize,
      width: this.tileSize,
      height: this.tileSize,
    };
  }

  /**
   * 设置玩家
   * @param {Player} player - 玩家对象
   */
  setPlayer(player) {
    this.player = player;

    // 将玩家放在地图中央
    const tilesX = Math.ceil(this.width / this.tileSize);
    const tilesY = Math.ceil(this.height / this.tileSize);

    player.setPosition(
      Math.floor(tilesX / 2) * this.tileSize,
      Math.floor(tilesY / 2) * this.tileSize,
    );
  }

  /**
   * 更新关卡状态
   * @param {number} deltaTime - 帧时间差
   */
  update(deltaTime) {
    // 更新所有实体
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const entity = this.entities[i];

      if (entity.isActive) {
        if (entity.type === 'enemy') {
          entity.update(deltaTime, this.player, this.entities, this);
        } else if (entity.type === 'item') {
          entity.update(deltaTime, this.player);
        } else if (entity.type === 'projectile') {
          entity.update(deltaTime, this.entities, this);
        } else {
          entity.update(deltaTime);
        }
      } else {
        // 移除非活动实体
        this.entities.splice(i, 1);
      }
    }

    // 检查玩家是否到达出口
    if (
      this.player &&
      this.exit &&
      Utils.rectIntersect(this.player.getCollisionRect(), this.exit)
    ) {
      this.completeLevel();
    }

    // 检查关卡是否完成（所有敌人都被消灭）
    if (!this.isCompleted && this.checkAllEnemiesDefeated()) {
      // 显示出口
      this.revealExit();
    }
  }

  /**
   * 渲染关卡
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 渲染地图瓦片
    const tilesX = Math.ceil(this.width / this.tileSize);
    const tilesY = Math.ceil(this.height / this.tileSize);

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        const tile = this.tiles[y][x];

        if (tile === 1) {
          // 墙
          ctx.fillStyle = '#555555';
          ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize,
          );
        } else if (tile === 2) {
          // 出口
          ctx.fillStyle = '#00ff00';
          ctx.fillRect(
            x * this.tileSize,
            y * this.tileSize,
            this.tileSize,
            this.tileSize,
          );
        }
      }
    }

    // 渲染所有实体
    // 先渲染物品，再渲染投射物，然后渲染敌人，最后渲染玩家，确保正确的渲染顺序

    // 渲染物品
    for (const entity of this.entities) {
      if (entity.type === 'item' && entity.isActive) {
        entity.render(ctx);
      }
    }
    
    // 渲染投射物
    for (const entity of this.entities) {
      if (entity.type === 'projectile' && entity.isActive) {
        entity.render(ctx);
      }
    }

    // 渲染敌人
    for (const entity of this.entities) {
      if (entity.type === 'enemy' && entity.isActive) {
        entity.render(ctx);
      }
    }
  }

  /**
   * 检查指定位置是否有碰撞
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @returns {boolean} 是否有碰撞
   */
  checkCollision(x, y, width, height) {
    // 检查与地图瓦片的碰撞
    const tileX1 = Math.floor(x / this.tileSize);
    const tileY1 = Math.floor(y / this.tileSize);
    const tileX2 = Math.floor((x + width) / this.tileSize);
    const tileY2 = Math.floor((y + height) / this.tileSize);

    for (let tileY = tileY1; tileY <= tileY2; tileY++) {
      for (let tileX = tileX1; tileX <= tileX2; tileX++) {
        if (
          tileY >= 0 &&
          tileY < this.tiles.length &&
          tileX >= 0 &&
          tileX < this.tiles[tileY].length
        ) {
          if (this.tiles[tileY][tileX] === 1) {
            // 墙
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * 获取关卡边界
   * @returns {Object} 边界矩形 {x, y, width, height}
   */
  getBounds() {
    return {
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * 添加实体到关卡
   * @param {Entity} entity - 实体对象
   */
  addEntity(entity) {
    this.entities.push(entity);
  }

  /**
   * 检查所有敌人是否都被消灭
   * @returns {boolean} 是否所有敌人都被消灭
   */
  checkAllEnemiesDefeated() {
    for (const entity of this.entities) {
      if (entity.type === 'enemy' && entity.isActive) {
        return false;
      }
    }
    return true;
  }

  /**
   * 显示出口
   */
  revealExit() {
    // 出口已经在地图生成时创建，这里只需要确保它是可见的
    // 在实际项目中，可以添加一些视觉效果或动画

    // 添加一个指示箭头或提示
    Game.showMessage('出口已开启！');
  }

  /**
   * 完成关卡
   */
  completeLevel() {
    if (this.isCompleted) return;

    this.isCompleted = true;

    // 触发关卡完成事件
    Game.levelCompleted();
  }
}
