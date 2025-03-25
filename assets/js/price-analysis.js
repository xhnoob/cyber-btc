/**
 * 价格分析页面 JavaScript
 * 负责图表渲染、数据处理和交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('价格分析页面加载完成，初始化组件...');
    
    // 检查必要的元素是否存在
    const checkElements = () => {
        const elements = [
            'chart3DContainer',
            'chart2DContainer',
            'priceChart',
            'currentPriceDisplay',
            '24hChange',
            '24hVolume',
            'marketCap'
        ];
        
        let allFound = true;
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.error(`找不到元素 #${id}`);
                allFound = false;
            }
        });
        
        return allFound;
    };
    
    // 如果所有元素都存在，则开始初始化
    if (checkElements()) {
        // 初始化各个组件
        initPriceChart();
        initTimeControls();
        initChartControls();
        initIndicatorsTerminal();
        initAIPredictionCharts(); // 初始化AI预测图表
        
        // 确保Bitcoin价格更新
        if (window.CYBER && typeof CYBER.updateBitcoinPrice === 'function') {
            CYBER.updateBitcoinPrice('currentPriceDisplay', '24hChange');
        } else {
            console.warn('全局CYBER对象不可用，使用模拟价格数据');
            updatePriceWithMockData();
        }
    } else {
        console.error('缺少必要元素，无法完全初始化价格分析页面');
    }
});

// 使用模拟数据更新价格
function updatePriceWithMockData() {
    const priceElement = document.getElementById('currentPriceDisplay');
    const changeElement = document.getElementById('24hChange');
    const volumeElement = document.getElementById('24hVolume');
    const marketCapElement = document.getElementById('marketCap');
    
    if (priceElement) {
        priceElement.textContent = '$67,245.32';
    }
    
    if (changeElement) {
        changeElement.textContent = '+2.34%';
        changeElement.className = 'price-value positive';
    }
    
    if (volumeElement) {
        volumeElement.textContent = '$42.5B';
    }
    
    if (marketCapElement) {
        marketCapElement.textContent = '$1.32T';
    }
}

// 模拟价格数据
function generatePriceData(days) {
    let data = [];
    let startPrice = 65000;
    let date = new Date();
    date.setDate(date.getDate() - days);
    
    for (let i = 0; i < days; i++) {
        let change = (Math.random() - 0.48) * 1200; // 偏向上涨的随机变化
        startPrice += change;
        if (startPrice < 50000) startPrice = 50000 + Math.random() * 1000;
        if (startPrice > 75000) startPrice = 75000 - Math.random() * 1000;
        
        let volume = Math.floor(Math.random() * 100000) + 50000;
        
        let newDate = new Date(date);
        newDate.setDate(date.getDate() + i);
        
        data.push({
            date: newDate,
            price: startPrice,
            volume: volume
        });
    }
    
    return data;
}

// 初始化3D价格图表
function initPriceChart() {
    const container = document.getElementById('chart3DContainer');
    if (!container) {
        console.error('找不到3D图表容器 #chart3DContainer');
        return;
    }
    
    console.log('初始化3D价格图表...');
    
    try {
        // 检查Three.js是否可用
        if (typeof THREE === 'undefined') {
            console.error('THREE.js未加载，无法渲染3D图表');
            container.innerHTML = `
                <div class="webgl-error">
                    <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                    <h3>3D全息图表加载失败</h3>
                    <p>THREE.js库未加载，请刷新页面或尝试使用2D图表。</p>
                </div>
            `;
            
            // 自动切换到2D图表
            toggleChartView('2d');
            return;
        }
        
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 400;
        
        // 创建Three.js场景
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        renderer.setSize(width, height);
        renderer.setClearColor(0x000000, 0);
        container.appendChild(renderer.domElement);
        
        // 设置相机位置
        camera.position.set(0, 30, 80);
        camera.lookAt(0, 0, 0);
        
        // 添加光源
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0x00ffff, 1);
        pointLight.position.set(0, 50, 50);
        scene.add(pointLight);
        
        const pointLight2 = new THREE.PointLight(0xff00ff, 0.8);
        pointLight2.position.set(50, 30, 0);
        scene.add(pointLight2);
        
        // 创建价格图表
        createPriceChart(scene);
        
        // 动画循环
        function animate() {
            requestAnimationFrame(animate);
            
            // 旋转图表
            if (scene.children.length > 3) { // 光源后的对象是图表
                scene.children[3].rotation.y += 0.001;
            }
            
            renderer.render(scene, camera);
        }
        
        // 窗口大小变化时调整
        window.addEventListener('resize', function() {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            
            if (newWidth > 0 && newHeight > 0) {
                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                
                renderer.setSize(newWidth, newHeight);
            }
        });
        
        animate();
        console.log('3D价格图表初始化成功');
    } catch (error) {
        console.error('3D价格图表初始化失败:', error);
        container.innerHTML = `
            <div class="webgl-error">
                <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3>3D全息图表渲染失败</h3>
                <p>错误信息: ${error.message}</p>
                <p>请切换到2D图表查看价格数据。</p>
            </div>
        `;
        
        // 自动切换到2D图表
        toggleChartView('2d');
    }
}

// 创建价格图表的3D表示
function createPriceChart(scene) {
    const priceData = generatePriceData(180); // 模拟180天的数据
    
    // 创建图表组
    const chartGroup = new THREE.Group();
    
    // 创建基础平台
    const platformGeometry = new THREE.BoxGeometry(100, 1, 60);
    const platformMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a2e,
        transparent: true,
        opacity: 0.7,
        emissive: 0x0a0a15
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -0.5;
    chartGroup.add(platform);
    
    // 添加网格线
    const gridHelper = new THREE.GridHelper(100, 20, 0x00ffff, 0x00ffff);
    gridHelper.position.y = 0;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    chartGroup.add(gridHelper);
    
    // 创建价格线
    const linePoints = [];
    const maxPrice = Math.max(...priceData.map(d => d.price));
    const minPrice = Math.min(...priceData.map(d => d.price));
    const priceRange = maxPrice - minPrice;
    
    // 归一化价格数据到合适的高度
    const yScale = 20 / priceRange;
    const xScale = 80 / priceData.length;
    
    for (let i = 0; i < priceData.length; i++) {
        const x = (i * xScale) - 40; // 居中显示
        const y = ((priceData[i].price - minPrice) * yScale) + 1; // 从平台上方开始
        const z = 0;
        
        linePoints.push(new THREE.Vector3(x, y, z));
    }
    
    // 创建曲线
    const priceCurve = new THREE.CatmullRomCurve3(linePoints);
    const priceGeometry = new THREE.TubeGeometry(priceCurve, 150, 0.3, 8, false);
    const priceMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        metalness: 0.8,
        roughness: 0.2
    });
    
    const priceLine = new THREE.Mesh(priceGeometry, priceMaterial);
    chartGroup.add(priceLine);
    
    // 创建价格表面
    const surfacePoints = [];
    
    // 添加底部点
    for (let i = 0; i < priceData.length; i++) {
        const x = (i * xScale) - 40;
        const y = 1; // 平台表面
        const z = 0;
        
        surfacePoints.push([x, y, z]);
    }
    
    // 添加价格曲线点
    for (let i = 0; i < linePoints.length; i++) {
        surfacePoints.push([linePoints[i].x, linePoints[i].y, linePoints[i].z]);
    }
    
    // 创建表面几何体
    const surfaceShape = new THREE.Shape();
    surfaceShape.moveTo(surfacePoints[0][0], surfacePoints[0][1]);
    
    // 底部线
    for (let i = 1; i < priceData.length; i++) {
        surfaceShape.lineTo(surfacePoints[i][0], surfacePoints[i][1]);
    }
    
    // 顶部曲线
    for (let i = priceData.length; i < surfacePoints.length; i++) {
        surfaceShape.lineTo(surfacePoints[i][0], surfacePoints[i][1]);
    }
    
    // 闭合形状
    surfaceShape.lineTo(surfacePoints[0][0], surfacePoints[0][1]);
    
    const extrudeSettings = {
        steps: 1,
        depth: 0,
        bevelEnabled: false
    };
    
    const surfaceGeometry = new THREE.ExtrudeGeometry(surfaceShape, extrudeSettings);
    const surfaceMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    
    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
    surface.rotation.x = Math.PI / 2;
    chartGroup.add(surface);
    
    // 添加比特币模型
    const bitcoinGeometry = new THREE.CylinderGeometry(5, 5, 1, 32);
    const bitcoinMaterial = new THREE.MeshStandardMaterial({
        color: 0xF7931A,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0xF7931A,
        emissiveIntensity: 0.2
    });
    
    const bitcoin = new THREE.Mesh(bitcoinGeometry, bitcoinMaterial);
    bitcoin.position.set(-40, 25, 0);
    bitcoin.rotation.x = Math.PI / 2;
    chartGroup.add(bitcoin);
    
    // 添加坐标轴标签
    const lastPoint = linePoints[linePoints.length - 1];
    
    // 添加当前价格点
    const sphereGeometry = new THREE.SphereGeometry(0.8, 16, 16);
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.5
    });
    
    const currentPricePoint = new THREE.Mesh(sphereGeometry, sphereMaterial);
    currentPricePoint.position.copy(lastPoint);
    chartGroup.add(currentPricePoint);
    
    // 添加整个图表到场景
    scene.add(chartGroup);
    
    // 添加轻微的旋转动画
    chartGroup.rotation.x = -Math.PI / 15;
}

// 初始化时间控制按钮
function initTimeControls() {
    const timeButtons = document.querySelectorAll('.time-button');
    
    if (!timeButtons.length) {
        console.warn('找不到时间控制按钮');
        return;
    }
    
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            timeButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 根据所选时间段更新数据
            const period = this.getAttribute('data-period');
            updateChartData(period);
            
            // 播放点击音效
            if (window.CYBER && CYBER.playSound) {
                CYBER.playSound('click');
            }
        });
    });
}

// 更新图表数据
function updateChartData(period) {
    // 根据选择的时间段确定天数
    let days;
    switch (period) {
        case '7d':
            days = 7;
            break;
        case '1m':
            days = 30;
            break;
        case '3m':
            days = 90;
            break;
        case '6m':
            days = 180;
            break;
        case '1y':
            days = 365;
            break;
        default:
            days = 30;
    }
    
    // 生成模拟数据
    const newData = generatePriceData(days);
    
    // 重新创建图表
    const container = document.getElementById('priceChartContainer');
    
    // 添加加载动画
    container.classList.add('loading');
    
    // 移除旧的Three.js画布
    const oldCanvas = container.querySelector('canvas');
    if (oldCanvas) {
        oldCanvas.remove();
    }
    
    // 显示加载动画
    const loadingElement = document.createElement('div');
    loadingElement.className = 'chart-loading';
    loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="loading-text">正在加载数据...</div>
    `;
    container.appendChild(loadingElement);
    
    // 模拟加载延迟
    setTimeout(() => {
        // 移除加载提示
        container.removeChild(loadingElement);
        container.classList.remove('loading');
        
        // 重新初始化图表
        initPriceChart();
    }, 1500);
}

// 初始化图表控制按钮
function initChartControls() {
    const chartTypeButtons = document.querySelectorAll('.chart-type-button');
    
    if (!chartTypeButtons.length) {
        console.warn('找不到图表类型控制按钮');
        return;
    }
    
    chartTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            chartTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的active类
            this.classList.add('active');
            
            // 切换图表类型
            const chartType = this.getAttribute('data-type');
            toggleChartView(chartType);
            
            // 播放点击音效
            if (window.CYBER && CYBER.playSound) {
                CYBER.playSound('click');
            }
        });
    });
    
    // 初始化2D图表
    const canvas = document.getElementById('priceChart');
    if (canvas) {
        createChart2D(canvas);
    } else {
        console.warn('找不到2D图表Canvas元素');
    }
}

// 切换图表视图类型
function toggleChartView(view) {
    const chart3DContainer = document.getElementById('chart3DContainer');
    const chart2DContainer = document.getElementById('chart2DContainer');
    
    if (!chart3DContainer || !chart2DContainer) {
        console.error('找不到图表容器');
        return;
    }
    
    if (view === '3d') {
        chart3DContainer.style.display = 'block';
        chart2DContainer.style.display = 'none';
    } else if (view === '2d') {
        chart3DContainer.style.display = 'none';
        chart2DContainer.style.display = 'block';
    }
}

// 创建2D图表
function createChart2D(canvas) {
    const ctx = canvas.getContext('2d');
    const timeButtons = document.querySelectorAll('.time-button');
    let activePeriod = '30d';
    
    timeButtons.forEach(btn => {
        if (btn.classList.contains('active')) {
            activePeriod = btn.getAttribute('data-period');
        }
    });
    
    // 确定天数
    let days = 30;
    switch (activePeriod) {
        case '7d':
            days = 7;
            break;
        case '1m':
            days = 30;
            break;
        case '3m':
            days = 90;
            break;
        case '6m':
            days = 180;
            break;
        case '1y':
            days = 365;
            break;
    }
    
    // 生成数据
    const priceData = generatePriceData(days);
    
    // 准备Chart.js数据
    const labels = priceData.map(d => {
        const date = new Date(d.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    
    const data = {
        labels: labels,
        datasets: [{
            label: 'BTC价格 (USD)',
            data: priceData.map(d => d.price),
            fill: true,
            backgroundColor: 'rgba(0, 255, 255, 0.2)',
            borderColor: 'rgba(0, 255, 255, 1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(255, 0, 255, 1)',
            tension: 0.4
        }]
    };
    
    // Chart.js配置
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 18, 0.8)',
                    borderColor: 'rgba(0, 255, 255, 0.5)',
                    borderWidth: 1,
                    titleColor: '#00ffff',
                    bodyColor: '#ffffff',
                    titleFont: {
                        family: "'Orbitron', sans-serif",
                        size: 14
                    },
                    bodyFont: {
                        family: "'Share Tech Mono', monospace",
                        size: 12
                    },
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            },
            animations: {
                tension: {
                    duration: 1000,
                    easing: 'linear'
                }
            }
        }
    };
    
    // 创建图表
    new Chart(ctx, config);
}

// 切换技术指标显示
function toggleIndicator(indicator) {
    // 这里在实际项目中会更新图表显示相应的指标
    console.log(`切换指标: ${indicator}`);
    
    // 添加视觉反馈
    const container = document.getElementById('priceChartContainer');
    const overlayMessage = document.createElement('div');
    overlayMessage.className = 'indicator-message';
    overlayMessage.textContent = `正在加载${getIndicatorName(indicator)}指标...`;
    container.appendChild(overlayMessage);
    
    // 模拟加载延迟
    setTimeout(() => {
        container.removeChild(overlayMessage);
        
        // 通知用户已加载
        const notification = document.createElement('div');
        notification.className = 'chart-notification';
        notification.textContent = `${getIndicatorName(indicator)}指标已激活`;
        container.appendChild(notification);
        
        // 自动移除通知
        setTimeout(() => {
            container.removeChild(notification);
        }, 2000);
    }, 800);
}

// 获取指标中文名称
function getIndicatorName(indicator) {
    switch (indicator) {
        case 'volume':
            return '交易量';
        case 'ma':
            return '移动平均线';
        case 'bollinger':
            return '布林带';
        default:
            return indicator;
    }
}

// 初始化指标终端
function initIndicatorsTerminal() {
    const terminalElement = document.getElementById('technicalTerminal');
    
    if (!terminalElement) {
        console.warn('找不到技术指标终端元素');
        return;
    }
    
    console.log('初始化技术指标终端...');
    
    // 清空终端内容
    terminalElement.innerHTML = '';
    
    // 终端欢迎消息
    const messages = [
        { text: "正在初始化技术分析终端...", type: "command" },
        { text: "加载市场数据...", type: "command" },
        { text: "成功连接到数据源", type: "success" },
        { text: "分析当前价格形态...", type: "command" },
        { text: "检测到潜在的头肩底形态，确认度: 76%", type: "warning" },
        { text: "支撑位: $62,450 | 阻力位: $69,880", type: "result" },
        { text: "VWAP: $66,723 | 日内波动率: 2.8%", type: "result" },
        { text: "多个指标显示看涨信号，建议关注 $69,880 阻力位突破情况", type: "success" },
        { text: "分析比特币持仓分布...", type: "command" },
        { text: "散户持仓: 减少2.1% | 鲸鱼钱包: 增加3.4%", type: "result" },
        { text: "检测到大额钱包异常积累，可能表明机构兴趣增加", type: "warning" },
        { text: "analyzing_market_sentiment.exe", type: "command" },
        { text: "社交媒体情绪: 中性偏正面 | 恐慌贪婪指数: 65 (贪婪)", type: "result" },
        { text: "_", type: "command" }
    ];
    
    let index = 0;
    
    function typeNextLine() {
        if (index >= messages.length) return;
        
        const message = messages[index];
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '$';
        
        const content = document.createElement('span');
        content.className = message.type;
        content.textContent = message.text;
        
        line.appendChild(prompt);
        line.appendChild(document.createTextNode(' '));
        line.appendChild(content);
        
        terminalElement.appendChild(line);
        terminalElement.scrollTop = terminalElement.scrollHeight;
        
        index++;
        
        // 最后一行添加闪烁光标类
        if (index === messages.length) {
            line.classList.add('blinking-cursor');
        }
        
        // 随机延迟，模拟真实打字
        const delay = message.type === 'command' ? 300 + Math.random() * 300 : 500 + Math.random() * 500;
        setTimeout(typeNextLine, delay);
    }
    
    // 开始打字效果
    typeNextLine();
}

// 设置AI预言机动画
function setupOracle() {
    const oracleEye = document.querySelector('.oracle-eye');
    
    // 添加鼠标追踪效果
    document.addEventListener('mousemove', function(e) {
        const x = e.clientX;
        const y = e.clientY;
        
        const eyeRect = oracleEye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        
        // 计算眼球和鼠标之间的角度
        const angle = Math.atan2(y - eyeCenterY, x - eyeCenterX);
        
        // 眼球移动的最大距离
        const maxMove = 10;
        
        // 计算眼球移动距离
        const moveX = Math.cos(angle) * maxMove;
        const moveY = Math.sin(angle) * maxMove;
        
        // 应用变换
        oracleEye.querySelector(':before')?.style.transform = 
            `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    });
    
    // 更新预言机预测
    const probabilityBars = document.querySelectorAll('.probability-fill');
    
    // 设置初始动画
    probabilityBars.forEach(bar => {
        const targetWidth = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.transition = 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
            bar.style.width = targetWidth;
        }, 500);
    });
    
    // 设置价格点的起始位置
    const rangePoint = document.querySelector('.range-current');
    rangePoint.style.left = '0%';
    
    setTimeout(() => {
        rangePoint.style.transition = 'left 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        rangePoint.style.left = rangePoint.style.left || '65%';
    }, 1000);
}

// 初始化AI预测图表
function initAIPredictionCharts() {
    console.log('初始化AI预测图表...');
    
    // 初始化LSTM深度学习模型图表
    initLSTMChart();
    
    // 初始化情感分析预测模型图表
    initSentimentChart();
}

// 初始化LSTM深度学习模型图表
function initLSTMChart() {
    const canvas = document.getElementById('lstmChart');
    if (!canvas) {
        console.warn('找不到LSTM图表Canvas元素');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 生成历史价格数据和预测数据
    const dates = [];
    const historicalData = [];
    const predictedData = [];
    
    // 历史数据 - 过去30天
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
        
        if (i > 0) {
            // 生成随机历史价格，但有一定的趋势
            const basePrice = 65000 + i * 100;
            const randomFactor = Math.random() * 1000 - 500;
            historicalData.push(basePrice + randomFactor);
            predictedData.push(null); // 历史部分没有预测数据
        } else {
            // 当前价格
            historicalData.push(67245);
            predictedData.push(67245); // 预测从当前价格开始
        }
    }
    
    // 预测数据 - 未来30天
    for (let i = 1; i <= 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`);
        
        // 添加一个null值作为历史数据
        historicalData.push(null);
        
        // 生成预测价格，总体趋势上升
        const trend = 200; // 平均每天上涨
        const volatility = Math.random() * 800 - 400; // 随机波动
        const lastPrice = predictedData[predictedData.length - 1];
        predictedData.push(lastPrice + trend + volatility);
    }
    
    // 创建图表
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: '历史价格',
                    data: historicalData,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                },
                {
                    label: '预测价格',
                    data: predictedData,
                    borderColor: '#b026ff',
                    backgroundColor: 'rgba(176, 38, 255, 0.2)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 18, 0.8)',
                    titleColor: '#00ffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(176, 38, 255, 0.5)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    console.log('LSTM预测图表初始化完成');
}

// 初始化情感分析预测模型图表
function initSentimentChart() {
    const canvas = document.getElementById('sentimentChart');
    if (!canvas) {
        console.warn('找不到情感分析图表Canvas元素');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 时间标签 - 过去14天
    const labels = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }
    
    // 生成情感数据
    const bullishData = []; // 看涨
    const neutralData = []; // 中性
    const bearishData = []; // 看跌
    
    for (let i = 0; i < 14; i++) {
        // 创建三种情感，总和为100%
        let bullish, neutral, bearish;
        
        if (i < 7) {
            // 前半部分，看跌情绪较强
            bearish = Math.floor(Math.random() * 20) + 40; // 40-60%
            neutral = Math.floor(Math.random() * 15) + 20; // 20-35%
            bullish = 100 - bearish - neutral; // 剩余部分
        } else {
            // 后半部分，看涨情绪增强
            bullish = Math.floor(Math.random() * 20) + 50; // 50-70%
            neutral = Math.floor(Math.random() * 15) + 15; // 15-30%
            bearish = 100 - bullish - neutral; // 剩余部分
        }
        
        bullishData.push(bullish);
        neutralData.push(neutral);
        bearishData.push(bearish);
    }
    
    // 创建堆叠式柱状图
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '看涨',
                    data: bullishData,
                    backgroundColor: 'rgba(0, 255, 136, 0.7)',
                    borderColor: 'rgba(0, 255, 136, 1)',
                    borderWidth: 1
                },
                {
                    label: '中性',
                    data: neutralData,
                    backgroundColor: 'rgba(255, 204, 0, 0.7)',
                    borderColor: 'rgba(255, 204, 0, 1)',
                    borderWidth: 1
                },
                {
                    label: '看跌',
                    data: bearishData,
                    backgroundColor: 'rgba(255, 42, 109, 0.7)',
                    borderColor: 'rgba(255, 42, 109, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 18, 0.8)',
                    titleColor: '#00ffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(176, 38, 255, 0.5)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    stacked: true,
                    max: 100,
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    
    console.log('情感分析预测图表初始化完成');
} 