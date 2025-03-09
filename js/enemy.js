/**
 * 敌人类
 * 继承自Entity基类，表示游戏中的敌人
 */

class Enemy extends Entity {
    /**
     * 创建一个敌人实体
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} enemyType - 敌人类型
     */
    constructor(x, y, enemyType = 'basic') {
        super(x, y, 32, 32, 'enemy');
        
        this.enemyType = enemyType;
        this.target = null; // 目标（通常是玩家）
        this.detectionRange = 200; // 检测范围
        this.attackRange = 40; // 攻击范围
        this.attackCooldown = 0;
        this.isAttacking = false;
        
        // 根据敌人类型设置属性
        this.initEnemyType();
        
        // 加载敌人精灵图和动画
        this.loadSprite();
    }
    
    /**
     * 根据敌人类型初始化属性
     */
    initEnemyType() {
        switch (this.enemyType) {
            case 'basic': // 基础敌人
                this.maxHealth = 50;
                this.health = this.maxHealth;
                this.damage = 10;
                this.speed = 80;
                this.attackSpeed = 1; // 每秒攻击次数
                this.experienceValue = 20;
                this.coinValue = 5;
                break;
                
            case 'fast': // 快速敌人
                this.maxHealth = 30;
                this.health = this.maxHealth;
                this.damage = 5;
                this.speed = 150;
                this.attackSpeed = 1.5;
                this.experienceValue = 15;
                this.coinValue = 3;
                break;
                
            case 'tank': // 坦克敌人
                this.maxHealth = 120;
                this.health = this.maxHealth;
                this.damage = 15;
                this.speed = 50;
                this.attackSpeed = 0.7;
                this.experienceValue = 35;
                this.coinValue = 8;
                break;
                
            case 'ranged': // 远程敌人
                this.maxHealth = 40;
                this.health = this.maxHealth;
                this.damage = 12;
                this.speed = 70;
                this.attackSpeed = 0.8;
                this.attackRange = 150; // 远程攻击
                this.experienceValue = 25;
                this.coinValue = 6;
                break;
                
            case 'boss': // Boss敌人
                this.maxHealth = 300;
                this.health = this.maxHealth;
                this.damage = 25;
                this.speed = 60;
                this.attackSpeed = 1.2;
                this.attackRange = 80;
                this.experienceValue = 100;
                this.coinValue = 50;
                this.width = 64; // Boss更大
                this.height = 64;
                break;
        }
    }
    
    /**
     * 加载敌人精灵图和动画
     */
    loadSprite() {
        // 在实际项目中，这里会加载敌人的精灵图
        // 由于我们没有实际的图片资源，这里使用简单的颜色块代替
        this.sprite = null;
        
        // 设置默认动画
        this.setAnimation('idle');
    }
    
    /**
     * 更新敌人状态
     * @param {number} deltaTime - 帧时间差
     * @param {Player} player - 玩家对象
     * @param {Array} entities - 游戏中的所有实体
     * @param {Object} level - 当前关卡对象
     */
    update(deltaTime, player, entities, level) {
        // 如果没有目标，设置玩家为目标
        if (!this.target && player.isActive) {
            this.target = player;
        }
        
        // 如果有目标，执行AI行为
        if (this.target && this.target.isActive) {
            this.executeAI(deltaTime);
        } else {
            // 没有目标时随机游荡
            this.wander(deltaTime);
        }
        
        // 处理攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }
        
        // 更新位置
        super.update(deltaTime);
        
        // 边界检查
        this.checkBoundaries(level);
        
        // 更新动画状态
        this.updateAnimationState();
    }
    
    /**
     * 执行AI行为
     * @param {number} deltaTime - 帧时间差
     */
    executeAI(deltaTime) {
        // 计算与目标的距离
        const dx = this.target.x + this.target.width / 2 - (this.x + this.width / 2);
        const dy = this.target.y + this.target.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果在检测范围内，追踪目标
        if (distance <= this.detectionRange) {
            // 设置移动方向朝向目标
            this.setDirection(dx, dy);
            
            // 如果在攻击范围内，攻击目标
            if (distance <= this.attackRange && this.attackCooldown <= 0) {
                this.attack();
                this.attackCooldown = 1 / this.attackSpeed;
            }
        } else {
            // 超出检测范围，随机游荡
            this.wander(deltaTime);
        }
    }
    
    /**
     * 随机游荡行为
     * @param {number} deltaTime - 帧时间差
     */
    wander(deltaTime) {
        // 每3秒改变一次方向
        if (!this.wanderTimer) {
            this.wanderTimer = 0;
            this.setRandomDirection();
        }
        
        this.wanderTimer += deltaTime;
        if (this.wanderTimer >= 3) {
            this.wanderTimer = 0;
            this.setRandomDirection();
        }
    }
    
    /**
     * 设置随机移动方向
     */
    setRandomDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.setDirection(Math.cos(angle), Math.sin(angle));
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
        // 简单的边界检查，防止敌人离开游戏区域
        const bounds = level.getBounds();
        
        if (this.x < bounds.x) {
            this.x = bounds.x;
            this.setRandomDirection();
        }
        if (this.y < bounds.y) {
            this.y = bounds.y;
            this.setRandomDirection();
        }
        if (this.x + this.width > bounds.x + bounds.width) {
            this.x = bounds.x + bounds.width - this.width;
            this.setRandomDirection();
        }
        if (this.y + this.height > bounds.y + bounds.height) {
            this.y = bounds.y + bounds.height - this.height;
            this.setRandomDirection();
        }
    }
    
    /**
     * 敌人攻击
     */
    attack() {
        this.isAttacking = true;
        
        // 如果目标在攻击范围内，造成伤害
        if (this.target && this.target.isActive) {
            this.target.takeDamage(this.damage);
        }
        
        // 攻击动画结束后重置攻击状态
        setTimeout(() => {
            this.isAttacking = false;
        }, 200);
    }
    
    /**
     * 渲染敌人
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    render(ctx) {
        // 根据敌人类型设置不同颜色，使用更鲜明的颜色提高对比度
        switch (this.enemyType) {
            case 'basic':
                ctx.fillStyle = '#e74c3c'; // 鲜红色
                break;
            case 'fast':
                ctx.fillStyle = '#9b59b6'; // 紫色
                break;
            case 'tank':
                ctx.fillStyle = '#8e44ad'; // 深紫色
                break;
            case 'ranged':
                ctx.fillStyle = '#d35400'; // 橙色
                break;
            case 'boss':
                ctx.fillStyle = '#c0392b'; // 深红色
                break;
        }
        
        // 绘制敌人
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 如果在攻击状态，绘制攻击效果
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.attackRange,
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        // 绘制生命条
        const healthBarWidth = this.width;
        const healthBarHeight = 5;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth, healthBarHeight);
        
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(this.x, this.y - 10, healthBarWidth * healthPercent, healthBarHeight);
    }
    
    /**
     * 敌人受到伤害
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
     * 敌人死亡
     */
    die() {
        this.isActive = false;
        
        // 掉落物品和经验值
        if (Game.player) {
            // 给玩家经验值
            Game.player.gainExperience(this.experienceValue);
            
            // 给玩家金币
            Game.player.gainCoins(this.coinValue);
            
            // 有几率掉落物品
            this.dropItem();
        }
    }
    
    /**
     * 掉落物品
     */
    dropItem() {
        // 根据敌人类型和随机概率决定是否掉落物品
        const dropChance = this.enemyType === 'boss' ? 1.0 : 0.2; // Boss必定掉落，普通敌人20%概率
        
        if (Math.random() < dropChance) {
            // 创建物品实体
            const itemTypes = ['health', 'damage', 'speed'];
            const itemType = Utils.randomChoice(itemTypes);
            
            // 在敌人位置创建物品
            const item = new Item(this.x, this.y, itemType);
            Game.addEntity(item);
        }
    }
}