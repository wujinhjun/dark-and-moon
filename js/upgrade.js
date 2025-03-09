/**
 * 升级系统
 * 负责管理游戏中的升级功能，包括能力提升和技能解锁
 */

const Upgrade = {
    // 升级选项列表
    options: [],
    
    // 升级界面是否打开
    isOpen: false,
    
    /**
     * 初始化升级系统
     */
    init: function() {
        // 绑定UI事件
        document.getElementById('close-upgrade').addEventListener('click', this.close.bind(this));
        
        // 初始化升级选项容器
        this.upgradeOptionsContainer = document.getElementById('upgrade-options');
    },
    
    /**
     * 打开升级界面
     * @param {number} playerLevel - 玩家等级，用于调整可用的升级选项
     */
    open: function(playerLevel) {
        // 生成升级选项
        this.generateOptions(playerLevel);
        
        // 显示升级界面
        document.getElementById('upgrade-screen').classList.remove('hidden');
        this.isOpen = true;
        
        // 暂停游戏
        Game.pause();
    },
    
    /**
     * 关闭升级界面
     */
    close: function() {
        // 隐藏升级界面
        document.getElementById('upgrade-screen').classList.add('hidden');
        this.isOpen = false;
        
        // 恢复游戏
        Game.resume();
    },
    
    /**
     * 生成升级选项
     * @param {number} playerLevel - 玩家等级
     */
    generateOptions: function(playerLevel) {
        // 清空现有选项
        this.options = [];
        this.upgradeOptionsContainer.innerHTML = '';
        
        // 基础升级选项
        const baseOptions = [
            {
                id: 'health',
                name: '生命提升',
                description: '增加20点最大生命值',
                effect: function(player) {
                    player.maxHealth += 20;
                    player.health += 20;
                }
            },
            {
                id: 'damage',
                name: '攻击提升',
                description: '增加10点攻击力',
                effect: function(player) {
                    player.damage += 10;
                }
            },
            {
                id: 'speed',
                name: '速度提升',
                description: '增加15点移动速度',
                effect: function(player) {
                    player.speed += 15;
                }
            },
            {
                id: 'attack_speed',
                name: '攻击速度',
                description: '增加20%攻击速度',
                effect: function(player) {
                    player.attackSpeed *= 1.2;
                }
            }
        ];
        
        // 高级升级选项（根据玩家等级解锁）
        const advancedOptions = [
            {
                id: 'critical',
                name: '暴击几率',
                description: '增加15%暴击几率',
                minLevel: 3,
                effect: function(player) {
                    player.critChance = (player.critChance || 0) + 0.15;
                }
            },
            {
                id: 'critical_damage',
                name: '暴击伤害',
                description: '增加50%暴击伤害',
                minLevel: 3,
                effect: function(player) {
                    player.critDamage = (player.critDamage || 1.5) + 0.5;
                }
            },
            {
                id: 'lifesteal',
                name: '生命偷取',
                description: '攻击时恢复造成伤害的10%生命值',
                minLevel: 5,
                effect: function(player) {
                    player.lifeSteal = (player.lifeSteal || 0) + 0.1;
                }
            },
            {
                id: 'area_damage',
                name: '范围伤害',
                description: '攻击范围增加20%',
                minLevel: 4,
                effect: function(player) {
                    player.attackRange *= 1.2;
                }
            },
            {
                id: 'double_attack',
                name: '连击',
                description: '有20%几率连续攻击两次',
                minLevel: 6,
                effect: function(player) {
                    player.doubleAttackChance = (player.doubleAttackChance || 0) + 0.2;
                }
            }
        ];
        
        // 根据玩家等级筛选可用的升级选项
        const availableOptions = [...baseOptions];
        
        for (const option of advancedOptions) {
            if (playerLevel >= option.minLevel) {
                availableOptions.push(option);
            }
        }
        
        // 随机选择3个选项
        const selectedOptions = [];
        while (selectedOptions.length < 3 && availableOptions.length > 0) {
            const index = Math.floor(Math.random() * availableOptions.length);
            selectedOptions.push(availableOptions[index]);
            availableOptions.splice(index, 1);
        }
        
        this.options = selectedOptions;
        
        // 创建升级选项UI
        for (const option of this.options) {
            this.createOptionElement(option);
        }
    },
    
    /**
     * 创建升级选项UI元素
     * @param {Object} option - 升级选项对象
     */
    createOptionElement: function(option) {
        const optionElement = document.createElement('div');
        optionElement.className = 'upgrade-option';
        optionElement.dataset.optionId = option.id;
        
        // 选项图标（在实际项目中，这里会使用图片）
        const optionIcon = document.createElement('div');
        optionIcon.style.width = '64px';
        optionIcon.style.height = '64px';
        optionIcon.style.margin = '0 auto 10px';
        optionIcon.style.backgroundColor = this.getOptionColor(option.id);
        optionElement.appendChild(optionIcon);
        
        // 选项名称
        const optionName = document.createElement('div');
        optionName.className = 'upgrade-option-name';
        optionName.textContent = option.name;
        optionElement.appendChild(optionName);
        
        // 选项描述
        const optionDesc = document.createElement('div');
        optionDesc.className = 'upgrade-option-description';
        optionDesc.textContent = option.description;
        optionElement.appendChild(optionDesc);
        
        // 添加点击事件
        optionElement.addEventListener('click', () => {
            this.selectOption(option);
        });
        
        // 添加到升级选项容器
        this.upgradeOptionsContainer.appendChild(optionElement);
    },
    
    /**
     * 获取选项颜色
     * @param {string} optionId - 选项ID
     * @returns {string} 颜色代码
     */
    getOptionColor: function(optionId) {
        switch (optionId) {
            case 'health':
                return '#ff5555'; // 红色
            case 'damage':
                return '#ffaa00'; // 橙色
            case 'speed':
                return '#55ff55'; // 绿色
            case 'attack_speed':
                return '#55aaff'; // 浅蓝色
            case 'critical':
            case 'critical_damage':
                return '#ff55ff'; // 粉色
            case 'lifesteal':
                return '#aa55ff'; // 紫色
            case 'area_damage':
                return '#ffff55'; // 黄色
            case 'double_attack':
                return '#ffffff'; // 白色
            default:
                return '#aaaaaa'; // 灰色
        }
    },
    
    /**
     * 选择升级选项
     * @param {Object} option - 选择的升级选项
     */
    selectOption: function(option) {
        // 应用升级效果
        option.effect(Game.player);
        
        // 显示升级消息
        Game.showMessage(`已升级: ${option.name}`);
        
        // 更新UI
        UI.updatePlayerStats();
        
        // 关闭升级界面
        this.close();
    }
};