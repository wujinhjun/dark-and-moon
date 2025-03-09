/**
 * 投射物类
 * 继承自Entity基类，表示游戏中的投射物（如子弹、箭矢等）
 */

class Projectile extends Entity {
    /**
     * 创建一个投射物实体
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} angle - 发射角度（弧度）
     * @param {Object} owner - 投射物的发射者
     * @param {string} type - 投射物类型
     */
    constructor(x, y, angle, owner, type = 'basic') {
        // 投射物尺寸较小
        super(x, y, 10, 10, 'projectile');
        
        this.owner = owner; // 发射者（通常是玩家）
        this.projectileType = type;
        this.speed = 300; // 投射物速度较快
        this.damage = 15; // 基础伤害值
        this.range = 400; // 射程
        this.distanceTraveled = 0; // 已经飞行的距离
        this.penetration = false; // 是否穿透（默认不穿透）
        this.hitEntities = new Set(); // 已经击中的实体（用于穿透效果）
        
        // 设置投射物方向
        this.setDirection(Math.cos(angle), Math.sin(angle));
        
        // 根据投射物类型初始化属性
        this.initProjectileType();
    }
    
    /**
     * 根据投射物类型初始化属性
     */
    initProjectileType() {
        switch (this.projectileType) {
            case 'basic': // 基础投射物
                this.damage = 15;
                this.speed = 300;
                this.penetration = false;
                break;
                
            case 'heavy': // 重型投射物
                this.damage = 30;
                this.speed = 200;
                this.width = 15;
                this.height = 15;
                this.penetration = false;
                break;
                
            case 'piercing': // 穿透投射物
                this.damage = 10;
                this.speed = 350;
                this.penetration = true;
                break;
                
            case 'explosive': // 爆炸投射物
                this.damage = 20;
                this.speed = 250;
                this.explosionRadius = 50; // 爆炸半径
                this.penetration = false;
                break;
        }
    }
    
    /**
     * 更新投射物状态
     * @param {number} deltaTime - 帧时间差
     * @param {Array} entities - 游戏中的所有实体
     * @param {Object} level - 当前关卡对象
     */
    update(deltaTime, entities, level) {
        // 更新位置
        const prevX = this.x;
        const prevY = this.y;
        
        super.update(deltaTime);
        
        // 计算移动距离
        const dx = this.x - prevX;
        const dy = this.y - prevY;
        this.distanceTraveled += Math.sqrt(dx * dx + dy * dy);
        
        // 检查是否超出射程
        if (this.distanceTraveled >= this.range) {
            this.destroy();
            return;
        }
        
        // 检查与墙壁的碰撞
        if (level && level.checkCollision(this.x, this.y, this.width, this.height)) {
            // 如果是爆炸类型，触发爆炸
            if (this.projectileType === 'explosive') {
                this.explode(entities);
            }
            
            this.destroy();
            return;
        }
        
        // 检查与敌人的碰撞
        for (const entity of entities) {
            if (entity.type === 'enemy' && entity.isActive && !this.hitEntities.has(entity.id)) {
                if (this.collidesWith(entity)) {
                    // 造成伤害
                    entity.takeDamage(this.damage);
                    
                    // 记录已击中的实体
                    this.hitEntities.add(entity.id);
                    
                    // 如果是爆炸类型，触发爆炸
                    if (this.projectileType === 'explosive') {
                        this.explode(entities);
                    }
                    
                    // 如果不是穿透类型，销毁投射物
                    if (!this.penetration) {
                        this.destroy();
                        return;
                    }
                }
            }
        }
    }
    
    /**
     * 触发爆炸效果
     * @param {Array} entities - 游戏中的所有实体
     */
    explode(entities) {
        // 检查爆炸范围内的敌人
        for (const entity of entities) {
            if (entity.type === 'enemy' && entity.isActive && !this.hitEntities.has(entity.id)) {
                const dx = entity.x + entity.width / 2 - (this.x + this.width / 2);
                const dy = entity.y + entity.height / 2 - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= this.explosionRadius) {
                    // 爆炸伤害随距离衰减
                    const damageMultiplier = 1 - (distance / this.explosionRadius);
                    const explosionDamage = this.damage * damageMultiplier;
                    
                    entity.takeDamage(explosionDamage);
                    this.hitEntities.add(entity.id);
                }
            }
        }
    }
    
    /**
     * 渲染投射物
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    render(ctx) {
        // 根据投射物类型设置不同颜色
        switch (this.projectileType) {
            case 'basic':
                ctx.fillStyle = '#00aaff'; // 蓝色
                break;
            case 'heavy':
                ctx.fillStyle = '#0055ff'; // 深蓝色
                break;
            case 'piercing':
                ctx.fillStyle = '#55ffff'; // 青色
                break;
            case 'explosive':
                ctx.fillStyle = '#ffaa00'; // 橙色
                break;
        }
        
        // 绘制投射物
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制投射物轨迹
        ctx.strokeStyle = ctx.fillStyle;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(
            this.x + this.width / 2 - this.direction.x * 10,
            this.y + this.height / 2 - this.direction.y * 10
        );
        ctx.stroke();
        ctx.globalAlpha = 1.0;
        
        // 开发模式：显示碰撞箱
        if (Game.debugMode) {
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}