/**
 * 商店系统
 * 负责管理游戏中的商店功能，包括物品购买和出售
 */

const Shop = {
    // 商店物品列表
    items: [],
    
    // 商店是否打开
    isOpen: false,
    
    /**
     * 初始化商店
     */
    init: function() {
        // 绑定UI事件
        document.getElementById('close-shop').addEventListener('click', this.close.bind(this));
        
        // 初始化商店物品容器
        this.shopItemsContainer = document.getElementById('shop-items');
    },
    
    /**
     * 打开商店
     * @param {number} playerLevel - 玩家等级，用于调整商店物品
     */
    open: function(playerLevel) {
        // 生成商店物品
        this.generateItems(playerLevel);
        
        // 显示商店界面
        document.getElementById('shop-screen').classList.remove('hidden');
        this.isOpen = true;
        
        // 暂停游戏
        Game.pause();
    },
    
    /**
     * 关闭商店
     */
    close: function() {
        // 隐藏商店界面
        document.getElementById('shop-screen').classList.add('hidden');
        this.isOpen = false;
        
        // 恢复游戏
        Game.resume();
    },
    
    /**
     * 生成商店物品
     * @param {number} playerLevel - 玩家等级
     */
    generateItems: function(playerLevel) {
        // 清空现有物品
        this.items = [];
        this.shopItemsContainer.innerHTML = '';
        
        // 根据玩家等级生成不同的物品
        const itemTypes = ['health', 'damage', 'speed'];
        
        // 添加装备类物品
        if (playerLevel >= 2) {
            itemTypes.push('weapon_sword');
            itemTypes.push('armor_light');
        }
        
        if (playerLevel >= 3) {
            itemTypes.push('accessory_ring');
        }
        
        if (playerLevel >= 5) {
            itemTypes.push('weapon_axe');
            itemTypes.push('armor_heavy');
        }
        
        if (playerLevel >= 7) {
            itemTypes.push('accessory_amulet');
        }
        
        // 随机选择5-7个物品
        const numItems = Utils.randomInt(5, 7);
        const selectedTypes = [];
        
        while (selectedTypes.length < numItems && selectedTypes.length < itemTypes.length) {
            const type = Utils.randomChoice(itemTypes);
            if (!selectedTypes.includes(type)) {
                selectedTypes.push(type);
            }
        }
        
        // 创建物品
        for (const type of selectedTypes) {
            const item = new Item(0, 0, type);
            this.items.push(item);
            
            // 创建物品UI元素
            this.createItemElement(item);
        }
    },
    
    /**
     * 创建物品UI元素
     * @param {Item} item - 物品对象
     */
    createItemElement: function(item) {
        const itemElement = document.createElement('div');
        itemElement.className = 'shop-item';
        itemElement.dataset.itemType = item.itemType;
        
        // 物品图标（在实际项目中，这里会使用图片）
        const itemIcon = document.createElement('div');
        itemIcon.style.width = '64px';
        itemIcon.style.height = '64px';
        itemIcon.style.margin = '0 auto 10px';
        itemIcon.style.backgroundColor = this.getItemColor(item.itemType);
        itemElement.appendChild(itemIcon);
        
        // 物品名称
        const itemName = document.createElement('div');
        itemName.className = 'shop-item-name';
        itemName.textContent = item.name;
        itemElement.appendChild(itemName);
        
        // 物品描述
        const itemDesc = document.createElement('div');
        itemDesc.className = 'shop-item-description';
        itemDesc.textContent = item.description;
        itemElement.appendChild(itemDesc);
        
        // 物品价格
        const itemPrice = document.createElement('div');
        itemPrice.className = 'shop-item-price';
        itemPrice.textContent = `${item.price} 金币`;
        itemElement.appendChild(itemPrice);
        
        // 添加点击事件
        itemElement.addEventListener('click', () => {
            this.buyItem(item);
        });
        
        // 添加到商店容器
        this.shopItemsContainer.appendChild(itemElement);
    },
    
    /**
     * 获取物品颜色
     * @param {string} itemType - 物品类型
     * @returns {string} 颜色代码
     */
    getItemColor: function(itemType) {
        switch (itemType) {
            case 'health':
                return '#ff5555'; // 红色
            case 'damage':
                return '#ffaa00'; // 橙色
            case 'speed':
                return '#55ff55'; // 绿色
            case 'weapon_sword':
            case 'weapon_axe':
                return '#aaaaff'; // 蓝色
            case 'armor_light':
            case 'armor_heavy':
                return '#aaaaaa'; // 灰色
            case 'accessory_ring':
            case 'accessory_amulet':
                return '#ff55ff'; // 粉色
            default:
                return '#ffffff'; // 白色
        }
    },
    
    /**
     * 购买物品
     * @param {Item} item - 要购买的物品
     */
    buyItem: function(item) {
        // 检查玩家是否有足够的金币
        if (Game.player.coins >= item.price) {
            // 扣除金币
            if (Game.player.spendCoins(item.price)) {
                // 应用物品效果
                if (item.equipType) {
                    // 如果是装备类物品，添加到物品栏
                    Game.addToInventory(item);
                    Game.showMessage(`已购买 ${item.name}，已添加到物品栏`);
                } else {
                    // 如果是消耗品，直接使用
                    item.use(Game.player);
                    Game.showMessage(`已购买并使用 ${item.name}`);
                }
                
                // 更新UI
                UI.updatePlayerStats();
                
                // 从商店中移除该物品
                this.removeItem(item);
            }
        } else {
            // 金币不足
            Game.showMessage('金币不足！');
        }
    },
    
    /**
     * 从商店中移除物品
     * @param {Item} item - 要移除的物品
     */
    removeItem: function(item) {
        // 从物品列表中移除
        const index = this.items.indexOf(item);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
        
        // 从UI中移除
        const itemElements = this.shopItemsContainer.querySelectorAll('.shop-item');
        for (const element of itemElements) {
            if (element.dataset.itemType === item.itemType) {
                element.remove();
                break;
            }
        }
    }
};