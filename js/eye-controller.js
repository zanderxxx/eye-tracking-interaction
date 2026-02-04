/**
 * 眼球控制器类
 * 负责管理眼睛的瞳孔位置和动画
 */
class EyeController {
    constructor() {
        // DOM 元素
        this.leftPupil = document.getElementById('left-pupil');
        this.rightPupil = document.getElementById('right-pupil');

        // 配置参数
        this.config = {
            maxMove: 35,              // 瞳孔最大移动距离（像素）
            smoothFactor: 0.3,        // 平滑系数（0-1，值越小越平滑）
            minMovement: 2,           // 最小移动阈值（像素）
            blinkInterval: 5000,      // 眨眼间隔（毫秒）
            enableBlink: true         // 是否启用眨眼动画
        };

        // 当前瞳孔位置
        this.currentPosition = { x: 0, y: 0 };

        // 目标瞳孔位置
        this.targetPosition = { x: 0, y: 0 };

        // 移动平均滤波器
        this.positionHistory = [];
        this.historySize = 5;

        // FPS 计算
        this.frameCount = 0;
        this.lastFpsUpdate = Date.now();
        this.currentFps = 0;

        // 初始化
        this.init();
    }

    /**
     * 初始化控制器
     */
    init() {
        // 启动动画循环
        this.startAnimationLoop();

        // 启动眨眼动画
        if (this.config.enableBlink) {
            this.startBlinkAnimation();
        }
    }

    /**
     * 更新注视点数据
     * @param {number} gazeX - 注视点 X 坐标
     * @param {number} gazeY - 注视点 Y 坐标
     */
    updateGaze(gazeX, gazeY) {
        if (!gazeX || !gazeY) return;

        // 计算屏幕中心点
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // 计算相对偏移
        const offsetX = gazeX - centerX;
        const offsetY = gazeY - centerY;

        // 归一化并限制范围
        const normalizedX = this.clamp(
            (offsetX / centerX) * this.config.maxMove,
            -this.config.maxMove,
            this.config.maxMove
        );

        const normalizedY = this.clamp(
            (offsetY / centerY) * this.config.maxMove,
            -this.config.maxMove,
            this.config.maxMove
        );

        // 应用移动平均滤波
        const smoothedPosition = this.smoothPosition(normalizedX, normalizedY);

        // 更新目标位置
        this.targetPosition = smoothedPosition;
    }

    /**
     * 平滑位置（移动平均）
     * @param {number} x - X 坐标
     * @param {number} y - Y 坐标
     * @returns {Object} 平滑后的位置
     */
    smoothPosition(x, y) {
        // 添加到历史记录
        this.positionHistory.push({ x, y });

        // 保持历史记录大小
        if (this.positionHistory.length > this.historySize) {
            this.positionHistory.shift();
        }

        // 计算平均值
        const sum = this.positionHistory.reduce(
            (acc, pos) => ({
                x: acc.x + pos.x,
                y: acc.y + pos.y
            }),
            { x: 0, y: 0 }
        );

        return {
            x: sum.x / this.positionHistory.length,
            y: sum.y / this.positionHistory.length
        };
    }

    /**
     * 启动动画循环
     */
    startAnimationLoop() {
        const animate = () => {
            // 插值到目标位置
            this.currentPosition.x += (this.targetPosition.x - this.currentPosition.x) * this.config.smoothFactor;
            this.currentPosition.y += (this.targetPosition.y - this.currentPosition.y) * this.config.smoothFactor;

            // 检查是否需要更新（避免微小抖动）
            const deltaX = Math.abs(this.targetPosition.x - this.currentPosition.x);
            const deltaY = Math.abs(this.targetPosition.y - this.currentPosition.y);

            if (deltaX > this.config.minMovement || deltaY > this.config.minMovement) {
                this.updatePupilDOM();
            }

            // 更新 FPS
            this.updateFPS();

            // 继续动画
            requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * 更新 DOM 元素
     */
    updatePupilDOM() {
        const transform = `translate(${this.currentPosition.x}px, ${this.currentPosition.y}px)`;

        if (this.leftPupil) {
            this.leftPupil.style.transform = transform;
        }

        if (this.rightPupil) {
            this.rightPupil.style.transform = transform;
        }
    }

    /**
     * 启动眨眼动画
     */
    startBlinkAnimation() {
        const blink = () => {
            const leftEye = document.getElementById('left-eye');
            const rightEye = document.getElementById('right-eye');

            if (leftEye && rightEye) {
                leftEye.classList.add('blinking');
                rightEye.classList.add('blinking');

                setTimeout(() => {
                    leftEye.classList.remove('blinking');
                    rightEye.classList.remove('blinking');
                }, 300);
            }

            // 随机间隔眨眼（3-7秒）
            const nextBlink = Math.random() * 4000 + 3000;
            setTimeout(blink, nextBlink);
        };

        // 首次眨眼
        setTimeout(blink, this.config.blinkInterval);
    }

    /**
     * 更新 FPS 计数
     */
    updateFPS() {
        this.frameCount++;
        const now = Date.now();
        const elapsed = now - this.lastFpsUpdate;

        if (elapsed >= 1000) {
            this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastFpsUpdate = now;

            // 更新 UI
            const fpsCounter = document.getElementById('fps-counter');
            if (fpsCounter) {
                fpsCounter.textContent = this.currentFps;
            }
        }
    }

    /**
     * 获取当前位置（用于调试）
     * @returns {Object} 当前瞳孔位置
     */
    getCurrentPosition() {
        return {
            x: this.currentPosition.x.toFixed(1),
            y: this.currentPosition.y.toFixed(1)
        };
    }

    /**
     * 限制数值范围
     * @param {number} value - 输入值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * 重置瞳孔位置
     */
    reset() {
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.positionHistory = [];
        this.updatePupilDOM();
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置对象
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// 导出供 main.js 使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EyeController;
}
