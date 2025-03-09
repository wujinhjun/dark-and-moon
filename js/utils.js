/**
 * 工具函数集合
 */

const Utils = {
    /**
     * 生成指定范围内的随机整数
     * @param {number} min - 最小值（包含）
     * @param {number} max - 最大值（包含）
     * @returns {number} 随机整数
     */
    randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * 生成指定范围内的随机浮点数
     * @param {number} min - 最小值（包含）
     * @param {number} max - 最大值（包含）
     * @returns {number} 随机浮点数
     */
    randomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * 检测两个矩形是否碰撞
     * @param {Object} rect1 - 第一个矩形 {x, y, width, height}
     * @param {Object} rect2 - 第二个矩形 {x, y, width, height}
     * @returns {boolean} 是否碰撞
     */
    rectIntersect: function(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    },
    
    /**
     * 检测点是否在矩形内
     * @param {number} x - 点的x坐标
     * @param {number} y - 点的y坐标
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @returns {boolean} 点是否在矩形内
     */
    pointInRect: function(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    },
    
    /**
     * 计算两点之间的距离
     * @param {number} x1 - 第一个点的x坐标
     * @param {number} y1 - 第一个点的y坐标
     * @param {number} x2 - 第二个点的x坐标
     * @param {number} y2 - 第二个点的y坐标
     * @returns {number} 两点之间的距离
     */
    distance: function(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * 计算从一点到另一点的角度（弧度）
     * @param {number} x1 - 起点x坐标
     * @param {number} y1 - 起点y坐标
     * @param {number} x2 - 终点x坐标
     * @param {number} y2 - 终点y坐标
     * @returns {number} 角度（弧度）
     */
    angle: function(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    
    /**
     * 将角度从弧度转换为度数
     * @param {number} radians - 弧度值
     * @returns {number} 度数值
     */
    radToDeg: function(radians) {
        return radians * 180 / Math.PI;
    },
    
    /**
     * 将角度从度数转换为弧度
     * @param {number} degrees - 度数值
     * @returns {number} 弧度值
     */
    degToRad: function(degrees) {
        return degrees * Math.PI / 180;
    },
    
    /**
     * 从数组中随机选择一个元素
     * @param {Array} array - 输入数组
     * @returns {*} 随机选择的元素
     */
    randomChoice: function(array) {
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * 将值限制在指定范围内
     * @param {number} value - 输入值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * 线性插值
     * @param {number} a - 起始值
     * @param {number} b - 结束值
     * @param {number} t - 插值因子 (0-1)
     * @returns {number} 插值结果
     */
    lerp: function(a, b, t) {
        return a + (b - a) * t;
    },
    
    /**
     * 创建一个2D向量
     * @param {number} x - x分量
     * @param {number} y - y分量
     * @returns {Object} 向量对象
     */
    vector: function(x, y) {
        return { x, y };
    },
    
    /**
     * 计算向量长度
     * @param {Object} vector - 向量 {x, y}
     * @returns {number} 向量长度
     */
    vectorLength: function(vector) {
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    },
    
    /**
     * 标准化向量（使其长度为1）
     * @param {Object} vector - 向量 {x, y}
     * @returns {Object} 标准化后的向量
     */
    normalizeVector: function(vector) {
        const length = this.vectorLength(vector);
        if (length === 0) return { x: 0, y: 0 };
        return { x: vector.x / length, y: vector.y / length };
    },
    
    /**
     * 生成UUID
     * @returns {string} UUID字符串
     */
    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * 深拷贝对象
     * @param {Object} obj - 要拷贝的对象
     * @returns {Object} 拷贝后的新对象
     */
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    /**
     * 计算经验值到下一级所需的总量
     * @param {number} level - 当前等级
     * @returns {number} 所需经验值
     */
    expToNextLevel: function(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },
    
    /**
     * 检测圆形与矩形是否碰撞
     * @param {Object} circle - 圆形 {x, y, radius}
     * @param {Object} rect - 矩形 {x, y, width, height}
     * @returns {boolean} 是否碰撞
     */
    circleIntersectRect: function(circle, rect) {
        // 找到矩形上离圆心最近的点
        const closestX = this.clamp(circle.x, rect.x, rect.x + rect.width);
        const closestY = this.clamp(circle.y, rect.y, rect.y + rect.height);
        
        // 计算圆心到矩形最近点的距离
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        const distanceSquared = distanceX * distanceX + distanceY * distanceY;
        
        // 如果距离小于等于半径，则发生碰撞
        return distanceSquared <= (circle.radius * circle.radius);
    }
};