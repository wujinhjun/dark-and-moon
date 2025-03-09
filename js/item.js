/**
 * 物品类
 * 继承自Entity基类，表示游戏中的物品、道具和装备
 */

class Item extends Entity {
    /**
     * 创建一个物品实体
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} itemType - 物品类型
     */
    constructor(x, y, itemType = 'health') {
        super(x, y, 24, 24, 'item');
        
        this.itemType = itemType;
        this.name = '';
        this.description = '';
        this.value = 0;
        this.price = 0;
        this.effects = [];
        this.isCollectible = true;
        this.collectRadius = 20; // 玩家可以拾取的范围
        this.lifespan = 30; // 物品存在的时间（秒）
        this.lifeTimer = 0;
        
        // 根据物品类型初始化属性
        this.initItemType();
        
        // 加载物品精灵图
        this.loadSprite();
    }
    
    /**
     * 根据物品类型初始化属性
     */
    initItemType() {
        switch (this.itemType) {
            case 'health': // 生命药水
                this.name = '生命药水';
                this.description = '恢复20点生命值';
                this.value = 20;
                this.price = 15;
                this.effects = [{ type: 'heal', value: 20 }];
                break;
                
            case 'damage': // 攻击力提升
                this.name = '力量药剂';
                this.description = '永久提升5点攻击力';
                this.value = 5;
                this.price = 30;
                this.effects = [{ type: 'damage', value: 5 }];
                break;
                
            case 'speed': // 速度提升
                this.name = '敏捷药剂';
                this.description = '永久提升10点移动速度';
                this.value = 10;
                this.price = 25;
                this.effects = [{ type: 'speed', value: 10 }];
                break;
                
            case 'coin': // 金币
                this.name = '金币';
                this.description = '可用于购买物品';
                this.value = Utils.randomInt(5, 15);
                this.price = 0;
                this.effects = [{ type: 'coin', value: this.value }];
                break;
                
            // 装备类物品
            case 'weapon_sword': // 剑
                this.name = '锋利的剑';
                this.description = '提升15点攻击力';
                this.value = 15;
                this.price = 50;
                this.effects = [{ type: 'damage', value: 15 }];
                this.equipType = 'weapon';
                break;
                
            case 'weapon_axe': // 斧头
                this.name = '战斧';
                this.description = '提升20点攻击力，降低5点速度';
                this.value = 20;
                this.price = 65;
                this.effects = [
                    { type: 'damage', value: 20 },
                    { type: 'speed', value: -5 }
                ];
                this.equipType = 'weapon';
                break;
                
            case 'armor_light': // 轻甲
                this.name = '轻型护甲';
                this.description = '提升20点最大生命值';
                this.value = 20;
                this.price = 40;
                this.effects = [{ type: 'health', value: 20 }];
                this.equipType = 'armor';
                break;
                
            case 'armor_heavy': // 重甲
                this.name = '重型护甲';
                this.description = '提升50点最大生命值，降低10点速度';
                this.value = 50;
                this.price = 80;
                this.effects = [
                    { type: 'health', value: 50 },
                    { type: 'speed', value: -10 }
                ];
                this.equipType = 'armor';
                break;
                
            case 'accessory_ring': // 戒指
                this.name = '力量戒指';
                this.description = '提升10点攻击力和10点最大生命值';
                this.value = 10;
                this.price = 70;
                this.effects = [
                    { type: 'damage', value: 10 },
                    { type: 'health', value: 10 }
                ];
                this.equipType = 'accessory';
                break;
                
            case 'accessory_amulet': // 护身符
                this.name = '速度护身符';
                this.description = '提升20点速度';
                this.value = 20;
                this.price = 60;
                this.effects = [{ type: 'speed', value: 20 }];
                this.equipType = 'accessory';
                break;
        }
    }
    
    /**
     * 加载物品精灵图
     */
    loadSprite() {
        // 在实际项目中，这里会加载物品的精灵图
        // 由于我们没有实际的图片资源，这里使用简单的颜色块代替
        this.sprite = null;
    }
    
    /**
     * 更新物品状态
     * @param {number} deltaTime - 帧时间差
     * @param {Player} player - 玩家对象
     */
    update(deltaTime, player) {
        // 更新生命周期
        this.lifeTimer += deltaTime;
        if (this.lifeTimer >= this.lifespan) {
            this.destroy();
            return;
        }
        
        // 检测玩家是否可以拾取物品
        if (this.isCollectible && player && player.isActive) {
            const distance = Utils.distance(
                this.x + this.width / 2,
                this.y + this.height / 2,
                player.x + player.width / 2,
                player.y + player.height / 2
            );
            
            if (distance <= this.collectRadius) {
                this.collect(player);
            }
        }
        
        // 物品可以有一些简单的动画效果，比如上下浮动
        this.y += Math.sin(this.lifeTimer * 5) * 0.5;
    }
    
    /**
     * 渲染物品
     * @param {CanvasRenderingContext2D} ctx - Canvas上下文
     */
    render(ctx) {
        // 根据物品类型设置不同颜色
        switch (this.itemType) {
            case 'health':
                ctx.fillStyle = '#ff5555'; // 红色
                break;
            case 'damage':
                ctx.fillStyle = '#ffaa00'; // 橙色
                break;
            case 'speed':
                ctx.fillStyle = '#55ff55'; // 绿色
                break;
            case 'coin':
                ctx.fillStyle = '#ffff00'; // 黄色
                break;
            case 'weapon_sword':
            case 'weapon_axe':
                ctx.fillStyle = '#aaaaff'; // 蓝色
                break;
            case 'armor_light':
            case 'armor_heavy':
                ctx.fillStyle = '#aaaaaa'; // 灰色
                break;
            case 'accessory_ring':
            case 'accessory_amulet':
                ctx.fillStyle = '#ff55ff'; // 粉色
                break;
            default:
                ctx.fillStyle = '#ffffff'; // 白色
        }
        
        // 绘制物品
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 如果物品快要消失，闪烁效果
        if (this.lifespan - this.lifeTimer < 5 && Math.floor(this.lifeTimer * 5) % 2 === 0) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
    
    /**
     * 玩家拾取物品
     * @param {Player} player - 玩家对象
     */
    collect(player) {
        // 根据物品类型应用效果
        switch (this.itemType) {
            case 'health':
                player.heal(this.value);
                break;
                
            case 'damage':
                player.damage += this.value;
                break;
                
            case 'speed':
                player.speed += this.value;
                break;
                
            case 'coin':
                player.gainCoins(this.value);
                break;
                
            // 装备类物品需要玩家手动装备
            case 'weapon_sword':
            case 'weapon_axe':
            case 'armor_light':
            case 'armor_heavy':
            case 'accessory_ring':
            case 'accessory_amulet':
                // 将物品添加到玩家的物品栏
                Game.addToInventory(this);
                break;
        }
        
        // 销毁物品
        this.destroy();
        
        // 播放拾取音效
        // 在实际项目中，这里会播放音效
    }
    
    /**
     * 使用物品
     * @param {Player} player - 玩家对象
     * @returns {boolean} 是否使用成功
     */
    use(player) {
        // 如果是装备类物品，则装备它
        if (this.equipType) {
            return player.equipItem(this);
        }
        
        // 如果是消耗品，应用效果
        switch (this.itemType) {
            case 'health':
                player.heal(this.value);
                return true;
                
            case 'damage':
                player.damage += this.value;
                return true;
                
            case 'speed':
                player.speed += this.value;
                return true;
        }
        
        return false;
    }
}