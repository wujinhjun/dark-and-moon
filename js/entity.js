/**
 * 实体基类
 * 游戏中所有实体（玩家、敌人、物品等）的基类
 */

class Entity {
  /**
   * 创建一个实体
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   * @param {number} width - 宽度
   * @param {number} height - 高度
   * @param {string} type - 实体类型
   */
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.id = Utils.generateUUID();
    this.speed = 0;
    this.direction = { x: 0, y: 0 };
    this.isActive = true;
    this.sprite = null;
    this.animations = {};
    this.currentAnimation = null;
    this.frameIndex = 0;
    this.frameCounter = 0;
    this.frameDelay = 5; // 帧延迟，控制动画速度
  }

  /**
   * 更新实体状态
   * @param {number} deltaTime - 帧时间差
   */
  update(deltaTime) {
    // 基本移动逻辑
    this.x += this.direction.x * this.speed * deltaTime;
    this.y += this.direction.y * this.speed * deltaTime;

    // 更新动画
    this.updateAnimation();
  }

  /**
   * 渲染实体
   * @param {CanvasRenderingContext2D} ctx - Canvas上下文
   */
  render(ctx) {
    // 如果有精灵图，则渲染精灵图
    if (this.sprite && this.currentAnimation) {
      const animation = this.animations[this.currentAnimation];
      if (animation) {
        const frame = animation[this.frameIndex];
        ctx.drawImage(
          this.sprite,
          frame.x,
          frame.y,
          frame.width,
          frame.height,
          this.x,
          this.y,
          this.width,
          this.height,
        );
      }
    } else {
      // 根据实体类型设置不同颜色，提高对比度
      switch (this.type) {
        case 'player':
          ctx.fillStyle = '#3498db'; // 蓝色
          break;
        case 'enemy':
          ctx.fillStyle = '#e74c3c'; // 红色
          break;
        case 'item':
          ctx.fillStyle = '#f1c40f'; // 黄色
          break;
        case 'projectile':
          ctx.fillStyle = '#2ecc71'; // 绿色
          break;
        default:
          ctx.fillStyle = '#95a5a6'; // 灰色
      }
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // 开发模式：显示碰撞箱
    if (Game.debugMode) {
      ctx.strokeStyle = '#00ff00';
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  /**
   * 更新动画帧
   */
  updateAnimation() {
    if (!this.currentAnimation || !this.animations[this.currentAnimation])
      return;

    this.frameCounter++;
    if (this.frameCounter >= this.frameDelay) {
      this.frameCounter = 0;
      this.frameIndex =
        (this.frameIndex + 1) % this.animations[this.currentAnimation].length;
    }
  }

  /**
   * 设置当前动画
   * @param {string} animationName - 动画名称
   */
  setAnimation(animationName) {
    if (
      this.currentAnimation !== animationName &&
      this.animations[animationName]
    ) {
      this.currentAnimation = animationName;
      this.frameIndex = 0;
      this.frameCounter = 0;
    }
  }

  /**
   * 获取实体的碰撞矩形
   * @returns {Object} 碰撞矩形 {x, y, width, height}
   */
  getCollisionRect() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * 检测与另一个实体的碰撞
   * @param {Entity} other - 另一个实体
   * @returns {boolean} 是否碰撞
   */
  collidesWith(other) {
    return Utils.rectIntersect(
      this.getCollisionRect(),
      other.getCollisionRect(),
    );
  }

  /**
   * 移动实体
   * @param {number} dx - X方向移动量
   * @param {number} dy - Y方向移动量
   */
  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }

  /**
   * 设置实体位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置实体移动方向
   * @param {number} dx - X方向分量
   * @param {number} dy - Y方向分量
   */
  setDirection(dx, dy) {
    // 标准化方向向量
    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy);
      this.direction.x = dx / length;
      this.direction.y = dy / length;
    } else {
      this.direction.x = 0;
      this.direction.y = 0;
    }
  }

  /**
   * 销毁实体
   */
  destroy() {
    this.isActive = false;
  }
}
