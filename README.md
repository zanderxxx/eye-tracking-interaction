# 👀 H5 眼动交互应用

一个基于浏览器的实时眼动追踪交互应用，通过摄像头捕获用户眼球运动，屏幕上的卡通眼睛会同步跟随转动。

![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ 特性

- 🎯 **实时眼动追踪** - 使用 WebGazer.js 进行浏览器端眼球追踪
- 👁️ **简约扁平化设计** - 美观的卡通眼睛 UI
- 🎨 **平滑动画** - 流畅的瞳孔移动和眨眼动画
- 🔧 **易于定制** - 可调整灵敏度、平滑度等参数
- 📱 **响应式设计** - 支持桌面和移动设备
- 🔒 **隐私保护** - 所有处理均在本地进行，不上传任何数据

## 🚀 快速开始

### 前置要求

- 现代浏览器（Chrome、Firefox、Edge 或 Safari）
- 摄像头设备
- HTTPS 环境或本地开发服务器

### 安装运行

1. **克隆或下载项目**
```bash
# 如果你有 git
git clone <repository-url>
cd eye-tracking-interaction

# 或直接下载项目文件
```

2. **启动本地服务器**

由于浏览器安全限制，需要通过 HTTP 服务器运行（不能直接打开 HTML 文件）。

**方法 1: 使用 Python（推荐）**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**方法 2: 使用 Node.js**
```bash
npx http-server -p 8000
```

**方法 3: 使用 PHP**
```bash
php -S localhost:8000
```

**方法 4: 使用 VS Code Live Server 扩展**
- 安装 "Live Server" 扩展
- 右键 index.html → "Open with Live Server"

3. **打开浏览器访问**
```
http://localhost:8000
```

4. **允许摄像头权限**
   - 浏览器会请求摄像头访问权限
   - 点击"允许"授予权限

5. **完成校准**
   - 依次点击屏幕上出现的 9 个校准点
   - 点击时保持头部稳定，用眼睛注视圆点
   - 校准完成后，眼睛会出现在屏幕上

6. **开始体验**
   - 移动你的眼睛看向屏幕不同位置
   - 观察卡通眼睛的瞳孔同步转动

## 📁 项目结构

```
eye-tracking-interaction/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── eye-controller.js  # 眼球控制器
│   └── main.js            # 主逻辑控制
└── README.md              # 说明文档
```

## 🎮 使用说明

### 界面控制

- **重新校准** - 如果追踪不准确，点击此按钮重新校准
- **隐藏/显示摄像头** - 切换右下角摄像头预览的显示
- **调试信息** - 显示注视点坐标、瞳孔位置和 FPS 等技术信息

### 校准技巧

1. **保持适当距离** - 距离屏幕 50-70cm 最佳
2. **光线充足** - 确保面部光线充足但不刺眼
3. **头部稳定** - 校准时尽量保持头部不动
4. **专注注视** - 点击校准点时，用眼睛注视圆点中心
5. **完整校准** - 完成所有 9 个校准点以获得最佳效果

### 常见问题

**Q: 眼睛跟踪不准确？**
- 尝试重新校准
- 调整环境光线
- 确保摄像头清晰对准面部

**Q: 瞳孔移动很卡顿？**
- 关闭其他占用 CPU 的程序
- 尝试降低浏览器缩放比例
- 检查调试信息中的 FPS（应 > 30）

**Q: 摄像头权限被拒绝？**
- 检查浏览器设置，允许网站访问摄像头
- 确保使用 HTTPS 或 localhost
- 尝试刷新页面重新授权

**Q: Safari 浏览器无法使用？**
- Safari 需要 HTTPS 才能访问摄像头
- 或者尝试在 Safari 设置中允许不安全内容

## ⚙️ 自定义配置

### 调整瞳孔移动参数

编辑 [js/eye-controller.js](js/eye-controller.js) 中的配置：

```javascript
this.config = {
    maxMove: 35,              // 瞳孔最大移动距离（像素）
    smoothFactor: 0.3,        // 平滑系数（0-1，值越小越平滑）
    minMovement: 2,           // 最小移动阈值（像素）
    blinkInterval: 5000,      // 眨眼间隔（毫秒）
    enableBlink: true         // 是否启用眨眼动画
};
```

### 修改眼睛样式

编辑 [css/style.css](css/style.css) 中的样式：

```css
/* 眼球大小 */
.eyeball {
    width: 160px;
    height: 120px;
}

/* 瞳孔大小 */
.pupil {
    width: 50px;
    height: 50px;
}

/* 颜色 */
.eyeball {
    background: white;  /* 眼白颜色 */
}

.pupil {
    background: radial-gradient(circle at 30% 30%, #333, #000);  /* 瞳孔颜色 */
}
```

## 🔧 技术栈

- **WebGazer.js 2.0.1** - 浏览器端眼动追踪库
- **TensorFlow.js** - 机器学习（WebGazer 依赖）
- **原生 HTML5/CSS3/JavaScript** - 无需额外框架

## 🌟 技术原理

1. **摄像头捕获** - 使用 WebRTC API 访问摄像头
2. **人脸检测** - TFFacemesh 检测面部特征点
3. **眼动预测** - Ridge 回归算法预测注视点坐标
4. **坐标映射** - 将屏幕坐标映射到瞳孔相对位置
5. **平滑处理** - 移动平均滤波减少抖动
6. **动画渲染** - requestAnimationFrame 实现流畅动画

## 📊 性能优化

- ✅ 使用 requestAnimationFrame 优化渲染
- ✅ 移动平均滤波减少计算量
- ✅ 最小移动阈值避免无效更新
- ✅ CSS Transform 硬件加速
- ✅ 限制预测频率（30-60 FPS）

## 🔒 隐私说明

- ✅ 所有眼动追踪处理均在**浏览器本地**进行
- ✅ 不会上传任何摄像头画面或数据到服务器
- ✅ 不会存储任何个人信息
- ✅ 关闭页面后所有数据自动清除

## 🚧 后续开发计划

- [ ] 添加多种眼睛风格切换
- [ ] 支持眼动热力图
- [ ] 录制眼动数据并回放
- [ ] 眼动游戏（眼控打地鼠等）
- [ ] 支持眼动操控网页元素
- [ ] 导出眼动数据分析

## 📄 许可证

MIT License - 详见 LICENSE 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，欢迎联系。

---

**Made with ❤️ and Claude Code**

## 🎯 测试检查清单

运行应用后，请验证以下功能：

- [ ] 浏览器请求摄像头权限
- [ ] 授权后显示校准界面
- [ ] 可以点击 9 个校准点
- [ ] 校准完成后显示两只眼睛
- [ ] 眼睛瞳孔跟随视线移动
- [ ] 移动流畅无明显卡顿
- [ ] 眼睛会自动眨眼
- [ ] 控制按钮功能正常
- [ ] 调试信息显示正确
- [ ] 响应式布局在不同屏幕正常
