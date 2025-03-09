/**
 * 输入处理模块
 */

const Input = {
    // 按键状态
    keys: {},
    // 鼠标位置
    mouse: {
        x: 0,
        y: 0,
        isDown: false,
        rightIsDown: false
    },
    
    /**
     * 初始化输入处理
     */
    init: function() {
        // 键盘事件监听
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 鼠标事件监听
        const canvas = document.getElementById('game-canvas');
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        canvas.addEventListener('click', this.handleClick.bind(this));
        
        // 防止右键菜单
        canvas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    },
    
    /**
     * 处理键盘按下事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyDown: function(e) {
        this.keys[e.key] = true;
        
        // 防止方向键和空格键滚动页面
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }
    },
    
    /**
     * 处理键盘释放事件
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyUp: function(e) {
        this.keys[e.key] = false;
    },
    
    /**
     * 处理鼠标移动事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseMove: function(e) {
        const rect = e.target.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    },
    
    /**
     * 处理鼠标按下事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseDown: function(e) {
        if (e.button === 0) { // 左键
            this.mouse.isDown = true;
        } else if (e.button === 2) { // 右键
            this.mouse.rightIsDown = true;
        }
    },
    
    /**
     * 处理鼠标释放事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleMouseUp: function(e) {
        if (e.button === 0) { // 左键
            this.mouse.isDown = false;
        } else if (e.button === 2) { // 右键
            this.mouse.rightIsDown = false;
        }
    },
    
    /**
     * 处理鼠标点击事件
     * @param {MouseEvent} e - 鼠标事件
     */
    handleClick: function(e) {
        // 可以在这里添加点击特定处理逻辑
    },
    
    /**
     * 检查某个键是否被按下
     * @param {string} key - 键名
     * @returns {boolean} 是否按下
     */
    isKeyDown: function(key) {
        return this.keys[key] === true;
    },
    
    /**
     * 获取移动方向向量
     * @returns {Object} 方向向量 {x, y}
     */
    getMovementDirection: function() {
        let dx = 0;
        let dy = 0;
        
        // WASD 或方向键移动
        if (this.isKeyDown('w') || this.isKeyDown('ArrowUp')) {
            dy = -1;
        }
        if (this.isKeyDown('s') || this.isKeyDown('ArrowDown')) {
            dy = 1;
        }
        if (this.isKeyDown('a') || this.isKeyDown('ArrowLeft')) {
            dx = -1;
        }
        if (this.isKeyDown('d') || this.isKeyDown('ArrowRight')) {
            dx = 1;
        }
        
        // 如果有对角线移动，标准化向量
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        return { x: dx, y: dy };
    },
    
    /**
     * 检查是否按下了攻击键
     * @returns {boolean} 是否攻击
     */
    isAttacking: function() {
        return this.isKeyDown(' ') || this.mouse.isDown;
    },
    
    /**
     * 检查是否按下了远程攻击键
     * @returns {boolean} 是否远程攻击
     */
    isRangedAttacking: function() {
        return this.mouse.rightIsDown;
    },
    
    /**
     * 获取鼠标位置相对于某个点的角度（弧度）
     * @param {number} x - 参考点x坐标
     * @param {number} y - 参考点y坐标
     * @returns {number} 角度（弧度）
     */
    getMouseAngle: function(x, y) {
        return Math.atan2(this.mouse.y - y, this.mouse.x - x);
    },
    
    /**
     * 重置所有输入状态
     */
    reset: function() {
        this.keys = {};
        this.mouse.isDown = false;
    }
};