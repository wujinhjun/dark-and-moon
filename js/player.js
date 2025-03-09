/**
 * 玩家类
 * 继承自Entity基类，表示游戏中的玩家角色
 */

class Player extends Entity {
  /**
   * 创建一个玩家实体
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  constructor(x, y) {
    super(x, y, 32, 32, 'player');

    // 玩家基本属性
    this.maxHealth = 100;
    this.health = this.maxHealth;
    this.speed = 150;
    this.damage = 20;
    this.attackSpeed = 1; // 每秒攻击次数
    this.attackCooldown = 0;
    this.attackRange = 60; // 攻击范围（圆形半径）

    // 远程攻击属性
    this.hasRangedAttack = true;
    this.rangedDamage = 15;
    this.rangedAttackSpeed = 1.5; // 每秒发射次数
    this.rangedAttackCooldown = 0;
    this.projectileType = 'basic'; // 默认投射物类型

    // 升级相关属性
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = Utils.expToNextLevel(this.level);

    // 资源
    this.coins = 0;

    // 装备和能力
    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null,
    };

    this.abilities = [];

    // 攻击状态
    this.isAttacking = false;
    this.attackDirection = { x: 1, y: 0 };

    // 加载玩家精灵图和动画
    this.loadSprite();
  }

  /**
   * 加载玩家精灵图和动画
   */
  loadSprite() {
    // 在实际项目中，这里会加载玩家的精灵图
    // 由于我们没有实际的图片资源，这里使用简单的颜色块代替
    this.sprite = null;

    // 设置默认动画
    this.setAnimation('idle');
  }

  /**
   * 更新玩家状态
   * @param {number} deltaTime - 帧时间差
   * @param {Array} entities - 游戏中的所有实体
   * @param {Object} level - 当前关卡对象
   */
  update(deltaTime, entities, level) {
    // 处理输入
    const direction = Input.getMovementDirection();
    this.setDirection(direction.x, direction.y);

    // 更新位置
    super.update(deltaTime);

    // 边界检查
    this.checkBoundaries(level);

    // 处理近战攻击冷却
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }

    // 处理远程攻击冷却
    if (this.rangedAttackCooldown > 0) {
      this.rangedAttackCooldown -= deltaTime;
    }

    // 处理近战攻击
    if (Input.isAttacking() && this.attackCooldown <= 0) {
      this.attack(entities);
      this.attackCooldown = 1 / this.attackSpeed;
    }

    // 处理远程攻击（右键）
    if (
      Input.isRangedAttacking() &&
      this.rangedAttackCooldown <= 0 &&
      this.hasRangedAttack
    ) {
      this.rangedAttack(entities, level);
      this.rangedAttackCooldown = 1 / this.rangedAttackSpeed;
    }

    // 更新动画状态
    this.updateAnimationState();
  }

  /**
   * 更新动画状态
   */
  updateAnimationState() {
    if (this.isAttacking) {
      this.setAnimation('attack');
    } else if (this.direction.x !== 0 || this.direction.y !== 0) {
      this.setAnimation('walk');
    } else {
      this.setAnimation('idle');
    }
  }

  /**
   * 检查并处理边界碰撞
   * @param {Object} level - 当前关卡对象
   */
  checkBoundaries(level) {
    // 简单的边界检查，防止玩家离开游戏区域
    const bounds = level.getBounds();

    if (this.x < bounds.x) this.x = bounds.x;
    if (this.y < bounds.y) this.y = bounds.y;
    if (this.x + this.width > bounds.x + bounds.width) {
      this.x = bounds.x + bounds.width - this.width;
    }
    if (this.y + this.height > bounds.y + bounds.height) {
      this.y = bounds.y + bounds.height - this.height;
    }
  }

  /**
   * 玩家攻击
   * @param {Array} entities - 游戏中的所有实体
   */
  attack(entities) {
    this.isAttacking = true;

    // 获取攻击方向（朝向鼠标方向）
    const angle = Input.getMouseAngle(
      this.x + this.width / 2,
      this.y + this.height / 2,
    );
    this.attackDirection = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    // 创建圆形攻击范围
    const attackCircle = {
      x: this.x + this.width / 2 + (this.attackDirection.x * this.width) / 2,
      y: this.y + this.height / 2 + (this.attackDirection.y * this.height) / 2,
      radius: this.attackRange
    };

    // 检测并伤害范围内的敌人
    // TODO：非常愚蠢的方案，可以改成四叉树
    for (const entity of entities) {
      if (entity.type === 'enemy' && entity.isActive) {
        if (Utils.circleIntersectRect(attackCircle, entity.getCollisionRect())) {
          entity.takeDamage(this.damage);
        }
      }
    }

    // 攻击动画结束后重置攻击状态
    setTimeout(() => {
      this.isAttacking = false;
    }, 200);
  }

  /**
   * 渲染玩家
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 调用父类的渲染方法
    super.render(ctx);

    // 如果在攻击状态，绘制攻击效果
    if (this.isAttacking) {
      const attackCircle = {
        x: this.x + this.width / 2 + (this.attackDirection.x * this.width) / 2,
        y: this.y + this.height / 2 + (this.attackDirection.y * this.height) / 2,
        radius: this.attackRange
      };

      // 绘制半透明的圆形攻击范围
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      ctx.beginPath();
      ctx.arc(attackCircle.x, attackCircle.y, attackCircle.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // 绘制圆形边缘
      ctx.strokeStyle = 'rgba(255, 200, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * 远程攻击
   * @param {Array} entities - 游戏中的所有实体
   * @param {Object} level - 当前关卡对象
   */
  rangedAttack(entities, level) {
    // 获取攻击方向（朝向鼠标方向）
    const angle = Input.getMouseAngle(
      this.x + this.width / 2,
      this.y + this.height / 2,
    );

    // 创建投射物
    const projectile = new Projectile(
      this.x + this.width / 2 - 5, // 从玩家中心发射
      this.y + this.height / 2 - 5,
      angle,
      this,
      this.projectileType,
    );

    // 设置投射物伤害
    projectile.damage = this.rangedDamage;

    // 将投射物添加到实体列表
    level.addEntity(projectile);

    // 播放发射音效（如果有的话）
    // Sound.play('shoot');
  }

  /**
   * 玩家受到伤害
   * @param {number} amount - 伤害值
   */
  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  /**
   * 玩家死亡
   */
  die() {
    this.isActive = false;
    // 触发游戏结束事件
    Game.gameOver();
  }

  /**
   * 玩家获得经验值
   * @param {number} amount - 经验值数量
   * @returns {boolean} 是否升级
   */
  gainExperience(amount) {
    this.experience += amount;

    // 检查是否升级
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
      return true;
    }

    return false;
  }

  /**
   * 玩家升级
   */
  levelUp() {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Utils.expToNextLevel(this.level);

    // 提升基本属性
    this.maxHealth += 10;
    this.health = this.maxHealth;
    this.damage += 5;

    // 触发升级事件
    Game.playerLevelUp();
  }

  /**
   * 玩家获得金币
   * @param {number} amount - 金币数量
   */
  gainCoins(amount) {
    this.coins += amount;
  }

  /**
   * 玩家消费金币
   * @param {number} amount - 金币数量
   * @returns {boolean} 是否消费成功
   */
  spendCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      return true;
    }
    return false;
  }

  /**
   * 装备物品
   * @param {Object} item - 物品对象
   * @returns {boolean} 是否装备成功
   */
  equipItem(item) {
    if (item.type in this.equipment) {
      // 卸下旧装备的效果
      const oldItem = this.equipment[item.type];
      if (oldItem) {
        this.removeItemEffects(oldItem);
      }

      // 装备新物品
      this.equipment[item.type] = item;

      // 应用新装备的效果
      this.applyItemEffects(item);

      return true;
    }
    return false;
  }

  /**
   * 应用物品效果
   * @param {Object} item - 物品对象
   */
  applyItemEffects(item) {
    if (item.effects) {
      for (const effect of item.effects) {
        switch (effect.type) {
          case 'health':
            this.maxHealth += effect.value;
            this.health += effect.value;
            break;
          case 'damage':
            this.damage += effect.value;
            break;
          case 'speed':
            this.speed += effect.value;
            break;
          case 'attackSpeed':
            this.attackSpeed += effect.value;
            break;
          // 可以添加更多效果类型
        }
      }
    }
  }

  /**
   * 移除物品效果
   * @param {Object} item - 物品对象
   */
  removeItemEffects(item) {
    if (item.effects) {
      for (const effect of item.effects) {
        switch (effect.type) {
          case 'health':
            this.maxHealth -= effect.value;
            this.health = Math.min(this.health, this.maxHealth);
            break;
          case 'damage':
            this.damage -= effect.value;
            break;
          case 'speed':
            this.speed -= effect.value;
            break;
          case 'attackSpeed':
            this.attackSpeed -= effect.value;
            break;
          // 可以添加更多效果类型
        }
      }
    }
  }

  /**
   * 添加能力
   * @param {Object} ability - 能力对象
   */
  addAbility(ability) {
    this.abilities.push(ability);

    // 应用能力效果
    if (ability.onAcquire) {
      ability.onAcquire(this);
    }
  }

  /**
   * 使用能力
   * @param {number} index - 能力索引
   * @param {Array} entities - 游戏中的所有实体
   * @returns {boolean} 是否使用成功
   */
  useAbility(index, entities) {
    if (index >= 0 && index < this.abilities.length) {
      const ability = this.abilities[index];
      if (ability.onUse) {
        return ability.onUse(this, entities);
      }
    }
    return false;
  }

  /**
   * 治疗玩家
   * @param {number} amount - 治疗量
   */
  heal(amount) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }
}
