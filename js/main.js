/**
 * 主应用控制器
 * 负责 WebGazer 初始化、校准流程和用户交互
 */

// 全局变量
let eyeController = null;
let isCalibrated = false;
let calibrationPoints = [];
let currentCalibrationIndex = 0;
let cameraVisible = true;
let debugVisible = false;

/**
 * 页面加载完成后初始化
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 应用启动...');
    initializeApp();
});

/**
 * 初始化应用
 */
async function initializeApp() {
    try {
        // 检查浏览器兼容性
        if (!checkBrowserCompatibility()) {
            showError('您的浏览器不支持 WebGazer.js，请使用 Chrome、Firefox 或 Edge 浏览器。');
            return;
        }

        // 初始化眼球控制器
        eyeController = new EyeController();
        console.log('✅ 眼球控制器初始化完成');

        // 初始化 WebGazer
        await initializeWebGazer();

        // 设置事件监听
        setupEventListeners();

        // 显示校准界面
        showCalibration();

    } catch (error) {
        console.error('❌ 初始化失败:', error);
        showError(`初始化失败: ${error.message}`);
    }
}

/**
 * 检查浏览器兼容性
 */
function checkBrowserCompatibility() {
    // 检查是否支持 getUserMedia
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

    // 检查是否为 HTTPS 或 localhost
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

    if (!hasGetUserMedia) {
        console.error('浏览器不支持 getUserMedia API');
        return false;
    }

    if (!isSecure) {
        console.warn('⚠️ 警告: 非 HTTPS 环境，部分浏览器可能无法访问摄像头');
    }

    return true;
}

/**
 * 初始化 WebGazer
 */
async function initializeWebGazer() {
    return new Promise((resolve, reject) => {
        try {
            console.log('📹 初始化 WebGazer...');

            // 配置 WebGazer
            webgazer
                .setRegression('ridge')
                .setTracker('TFFacemesh')
                .setGazeListener((data, timestamp) => {
                    // 即使未校准也处理数据（用于调试）
                    if (data) {
                        handleGazeData(data);
                    } else {
                        console.log('⚠️ 未接收到注视数据');
                    }
                })
                .showPredictionPoints(false);

            // 启动 WebGazer
            webgazer.begin();

            // 等待摄像头和模型加载
            let attempts = 0;
            const maxAttempts = 50; // 10秒超时 (50 * 200ms)

            const checkReady = setInterval(async () => {
                attempts++;

                // 检查 WebGazer 是否可用
                if (webgazer.params && webgazer.params.showVideo !== undefined) {
                    clearInterval(checkReady);
                    console.log('✅ WebGazer 准备就绪');

                    // 等待一小段时间确保完全初始化
                    setTimeout(() => {
                        hideLoading();
                        resolve();
                    }, 500);
                    return;
                }

                // 超时处理
                if (attempts >= maxAttempts) {
                    clearInterval(checkReady);
                    reject(new Error('WebGazer 初始化超时。请确保:\n1. 已允许摄像头权限\n2. 使用 Chrome/Firefox/Edge 浏览器\n3. 网络连接正常'));
                }
            }, 200);

        } catch (error) {
            console.error('WebGazer 初始化错误:', error);
            reject(new Error('WebGazer 初始化失败: ' + error.message));
        }
    });
}

/**
 * 处理注视数据
 */
function handleGazeData(data) {
    const { x, y } = data;

    // 更新眼球控制器（即使未校准也更新，用于测试）
    if (eyeController && x && y) {
        eyeController.updateGaze(x, y);
    }

    // 更新调试信息
    if (debugVisible) {
        updateDebugInfo(x, y);
    }
}

/**
 * 显示校准界面
 */
function showCalibration() {
    hideLoading();
    document.getElementById('calibration').classList.remove('hidden');

    // 初始化校准点
    calibrationPoints = document.querySelectorAll('.calibration-point');
    currentCalibrationIndex = 0;

    // 绑定校准点点击事件
    setupCalibrationListeners();

    // 显示第一个校准点
    showNextCalibrationPoint();
}

/**
 * 设置校准点事件监听
 */
function setupCalibrationListeners() {
    calibrationPoints.forEach((point, index) => {
        point.addEventListener('click', (e) => {
            if (point.classList.contains('active')) {
                // 记录点击位置
                const rect = point.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                // 通知 WebGazer
                webgazer.recordScreenPosition(centerX, centerY);

                // 视觉反馈
                point.classList.add('clicked');

                // 延迟显示下一个点
                setTimeout(() => {
                    currentCalibrationIndex++;
                    showNextCalibrationPoint();
                }, 400);
            }
        });
    });
}

/**
 * 显示下一个校准点
 */
function showNextCalibrationPoint() {
    // 隐藏所有校准点
    calibrationPoints.forEach(point => {
        point.classList.remove('active', 'clicked');
    });

    // 显示当前校准点
    if (currentCalibrationIndex < calibrationPoints.length) {
        const currentPoint = calibrationPoints[currentCalibrationIndex];
        currentPoint.classList.add('active');

        // 更新进度
        document.getElementById('calibration-count').textContent = currentCalibrationIndex;
    } else {
        // 校准完成
        finishCalibration();
    }
}

/**
 * 完成校准
 */
function finishCalibration() {
    console.log('✅ 校准完成');
    isCalibrated = true;

    // 隐藏校准界面
    document.getElementById('calibration').classList.add('hidden');

    // 显示主界面
    document.getElementById('main-content').classList.remove('hidden');

    // 检查 WebGazer 状态
    console.log('WebGazer 状态检查:');
    console.log('- webgazer 对象:', typeof webgazer);
    console.log('- webgazer.params:', webgazer.params);

    // 强制显示调试信息用于诊断
    setTimeout(() => {
        debugVisible = true;
        const debugInfo = document.getElementById('debug-info');
        if (debugInfo) {
            debugInfo.classList.remove('hidden');
        }
        const btn = document.getElementById('toggle-debug-btn');
        if (btn) {
            btn.textContent = '隐藏调试';
        }
        console.log('🐛 调试模式已自动启用');
    }, 500);

    // 提示用户
    showToast('校准完成！现在移动你的眼睛试试看');
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
    // 跳过校准按钮
    const skipBtn = document.getElementById('skip-calibration');
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            finishCalibration();
        });
    }

    // 重新校准按钮
    const recalibrateBtn = document.getElementById('recalibrate-btn');
    if (recalibrateBtn) {
        recalibrateBtn.addEventListener('click', () => {
            resetCalibration();
        });
    }

    // 切换摄像头显示
    const toggleCameraBtn = document.getElementById('toggle-camera-btn');
    if (toggleCameraBtn) {
        toggleCameraBtn.addEventListener('click', () => {
            toggleCameraVisibility();
        });
    }

    // 切换调试信息
    const toggleDebugBtn = document.getElementById('toggle-debug-btn');
    if (toggleDebugBtn) {
        toggleDebugBtn.addEventListener('click', () => {
            toggleDebugInfo();
        });
    }

    // 重试按钮
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    // 窗口大小改变时重置
    window.addEventListener('resize', () => {
        if (eyeController) {
            eyeController.reset();
        }
    });
}

/**
 * 重置校准
 */
function resetCalibration() {
    console.log('🔄 重置校准...');

    // 清除 WebGazer 数据
    webgazer.clearData();

    // 重置状态
    isCalibrated = false;
    currentCalibrationIndex = 0;

    // 重置眼球位置
    if (eyeController) {
        eyeController.reset();
    }

    // 隐藏主界面
    document.getElementById('main-content').classList.add('hidden');

    // 显示校准界面
    showCalibration();
}

/**
 * 切换摄像头显示
 */
function toggleCameraVisibility() {
    cameraVisible = !cameraVisible;
    const videoContainer = document.getElementById('webgazerVideoContainer');
    const btn = document.getElementById('toggle-camera-btn');

    if (videoContainer) {
        if (cameraVisible) {
            videoContainer.classList.remove('hidden');
            btn.textContent = '隐藏摄像头';
        } else {
            videoContainer.classList.add('hidden');
            btn.textContent = '显示摄像头';
        }
    }
}

/**
 * 切换调试信息
 */
function toggleDebugInfo() {
    debugVisible = !debugVisible;
    const debugInfo = document.getElementById('debug-info');
    const btn = document.getElementById('toggle-debug-btn');

    if (debugInfo) {
        if (debugVisible) {
            debugInfo.classList.remove('hidden');
            btn.textContent = '隐藏调试';
        } else {
            debugInfo.classList.add('hidden');
            btn.textContent = '显示调试';
        }
    }
}

/**
 * 更新调试信息
 */
function updateDebugInfo(gazeX, gazeY) {
    const gazeCoords = document.getElementById('gaze-coords');
    const pupilCoords = document.getElementById('pupil-coords');

    if (gazeCoords) {
        gazeCoords.textContent = `(${Math.round(gazeX)}, ${Math.round(gazeY)})`;
    }

    if (pupilCoords && eyeController) {
        const pos = eyeController.getCurrentPosition();
        pupilCoords.textContent = `(${pos.x}, ${pos.y})`;
    }
}

/**
 * 隐藏加载界面
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

/**
 * 显示错误信息
 */
function showError(message) {
    const errorContainer = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    if (errorContainer && errorText) {
        errorText.textContent = message;
        errorContainer.classList.remove('hidden');
    }

    // 隐藏其他界面
    hideLoading();
    document.getElementById('calibration').classList.add('hidden');
    document.getElementById('main-content').classList.add('hidden');
}

/**
 * 显示提示信息
 */
function showToast(message, duration = 3000) {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 18px;
        z-index: 10000;
        animation: fadeInOut 0.5s ease;
    `;

    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 500);
    }, duration);
}

/**
 * 页面卸载时清理
 */
window.addEventListener('beforeunload', () => {
    if (webgazer) {
        webgazer.end();
    }
});

// 添加淡入淡出动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        10%, 90% { opacity: 1; }
    }
`;
document.head.appendChild(style);
