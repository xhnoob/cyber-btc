/**
 * 赛博启示录 - 首页JS文件
 * 实现首页特有的功能，包括3D图表和全息效果
 */

// 页面加载完成事件
document.addEventListener('DOMContentLoaded', () => {
  // 检查WebGL支持
  if (!isWebGLSupported()) {
    showWebGLError();
    return;
  }
  
  console.log("DOM已加载，准备初始化3D图表...");
  
  // 确保Three.js已正确加载
  if (typeof THREE === 'undefined') {
    console.error('THREE.js未加载，等待1秒后重试...');
    setTimeout(() => {
      if (typeof THREE !== 'undefined') {
        console.log('延迟加载THREE.js成功，开始初始化图表');
        initAllCharts();
      } else {
        console.error('THREE.js加载失败，使用替代方案显示图表');
        showWebGLError();
      }
    }, 1000);
  } else {
    console.log('THREE.js已加载，立即初始化图表');
    initAllCharts();
  }
});

/**
 * 初始化所有图表和交互元素
 */
function initAllCharts() {
  // 添加调试日志
  console.log('开始初始化所有图表组件');
  console.log('价格图表容器:', document.getElementById('priceChart3D'));
  console.log('地图容器:', document.getElementById('worldMapContainer'));

  // 初始化价格图表
  initPriceChart();
  
  // 初始化全息世界地图
  initWorldMap();
  
  // 初始化进入矩阵按钮事件
  initEnterMatrixButton();
  
  // 初始化卡片导航
  initCardNavigation();
  
  // 添加滚动动画
  initScrollAnimations();
}

/**
 * 检查浏览器是否支持WebGL
 * @returns {boolean} 是否支持WebGL
 */
function isWebGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    console.error("WebGL支持检查失败:", e);
    return false;
  }
}

/**
 * 显示WebGL不支持错误
 */
function showWebGLError() {
  // 找到所有需要WebGL的容器
  const containers = document.querySelectorAll('#priceChart3D, #worldMapContainer');
  
  containers.forEach(container => {
    if (!container) return;
    
    console.warn(`容器 ${container.id} 不支持WebGL，显示错误信息`);
    
    // 清空容器
    container.innerHTML = '';
    
    // 添加错误消息
    const errorDiv = document.createElement('div');
    errorDiv.className = 'webgl-error';
    errorDiv.innerHTML = `
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <h3>3D全息图无法显示</h3>
      <p>您的浏览器不支持WebGL技术，无法显示3D图表效果。</p>
      <p>请尝试使用最新版Chrome、Firefox或Edge浏览器。</p>
    `;
    
    container.appendChild(errorDiv);
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.textAlign = 'center';
    container.style.padding = '20px';
  });
}

/**
 * 初始化3D比特币价格图表
 */
function initPriceChart() {
  const container = document.getElementById('priceChart3D');
  if (!container) {
    console.error('找不到价格图表容器: priceChart3D');
    return;
  }
  
  console.log("准备渲染价格图表，容器已找到:", container);
  
  try {
    // 确保THREE对象存在
    if (typeof THREE === 'undefined') {
      console.error('THREE对象未定义，无法渲染3D图表');
      throw new Error('THREE库未加载');
    }
    
    console.log("THREE对象已确认可用，创建场景...");
    
    // 创建场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    
    // 检查容器尺寸
    console.log('容器尺寸:', container.clientWidth, 'x', container.clientHeight);
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      console.warn('容器尺寸为0，等待DOM完全渲染...');
      // 延迟设置尺寸
      setTimeout(() => {
        renderer.setSize(container.clientWidth || 800, container.clientHeight || 400);
        container.appendChild(renderer.domElement);
        console.log('延迟设置渲染器尺寸:', container.clientWidth, 'x', container.clientHeight);
      }, 500);
    } else {
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.appendChild(renderer.domElement);
    }
    
    console.log("WebGL渲染器已创建和添加到DOM中");
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // 添加点光源
    const pointLight = new THREE.PointLight(0x00FFFF, 2, 100);
    pointLight.position.set(0, 10, 10);
    scene.add(pointLight);
    
    // 创建价格图表
    createPriceChart(scene);
    
    // 设置相机位置
    camera.position.z = 15;
    
    // 动画循环
    function animate() {
      requestAnimationFrame(animate);
      
      // 旋转图表
      scene.rotation.y += 0.005;
      
      renderer.render(scene, camera);
    }
    
    animate();
    
    console.log("3D价格图表动画已开始运行");
    
    // 窗口大小变化时调整画布大小
    window.addEventListener('resize', () => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.render(scene, camera);
        console.log('窗口大小调整为:', container.clientWidth, 'x', container.clientHeight);
      }
    });
    
    return { scene, camera, renderer }; // 返回对象以便外部访问
  } catch (error) {
    console.error('初始化价格图表时出错:', error);
    showDetailedError(container, error);
    
    // 尝试使用备用图表
    if (window.CYBER && CYBER.createSimplePriceChart) {
      console.log("尝试使用备用2D图表...");
      CYBER.createSimplePriceChart();
    }
  }
}

/**
 * 显示详细错误信息
 */
function showDetailedError(container, error) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="webgl-error">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <h3>3D全息图渲染失败</h3>
      <p>显示3D价格图表时发生错误。</p>
      <p>错误详情: ${error.message}</p>
      <div class="error-details">
        <p>THREE.js状态: ${typeof THREE !== 'undefined' ? '已加载' : '未加载'}</p>
        <p>容器尺寸: ${container.clientWidth}x${container.clientHeight}</p>
        <p>浏览器: ${navigator.userAgent}</p>
      </div>
    </div>
  `;
}

/**
 * 创建价格图表
 * @param {THREE.Scene} scene - Three.js场景
 */
function createPriceChart(scene) {
  // 模拟比特币价格数据
  const priceData = [
    50000, 52000, 48000, 47000, 52000, 56000, 
    60000, 58000, 62000, 65000, 68000, 73000,
    75000, 70000, 73000, 78000, 82000, 85000,
    80000, 82000, 86000, 89000, 87000, 88000
  ];
  
  // 创建图表材质
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0x00FFFF,
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });
  
  // 创建光面材质
  const surfaceMaterial = new THREE.MeshPhongMaterial({
    color: 0x00FFFF,
    transparent: true,
    opacity: 0.2,
    side: THREE.DoubleSide
  });
  
  console.log('创建价格图表，数据点数量:', priceData.length);
  
  // 创建图表点
  const points = [];
  const width = 20;
  const scaleFactor = 0.0002;
  
  for (let i = 0; i < priceData.length; i++) {
    const x = (i / (priceData.length - 1)) * width - width / 2;
    const y = priceData[i] * scaleFactor;
    points.push(new THREE.Vector3(x, y, 0));
  }
  
  console.log('生成的点数量:', points.length, '第一个点:', points[0], '最后一个点:', points[points.length-1]);
  
  // 创建线条几何体
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scene.add(line);
  
  // 创建表面（下方区域）
  const surfacePoints = [...points];
  surfacePoints.push(new THREE.Vector3(width / 2, 0, 0));
  surfacePoints.push(new THREE.Vector3(-width / 2, 0, 0));
  
  const surfaceGeometry = new THREE.BufferGeometry();
  const vertices = [];
  const indices = [];
  
  // 添加点
  for (const point of surfacePoints) {
    vertices.push(point.x, point.y, point.z);
  }
  
  // 创建三角形索引
  for (let i = 0; i < points.length - 1; i++) {
    indices.push(i, i + 1, points.length);
    indices.push(i, points.length, points.length + 1);
  }
  
  surfaceGeometry.setIndex(indices);
  surfaceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  surfaceGeometry.computeVertexNormals();
  
  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  scene.add(surface);
  
  // 添加网格线
  const gridHelper = new THREE.GridHelper(20, 20, 0x00FFFF, 0x004444);
  gridHelper.position.y = -0.5;
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);
  
  // 添加一个比特币模型（用简单的圆柱体代替）
  const btcGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
  const btcMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xF7931A,
    transparent: true,
    opacity: 0.8,
    shininess: 100
  });
  const btcCoin = new THREE.Mesh(btcGeometry, btcMaterial);
  btcCoin.position.set(points[points.length-1].x, points[points.length-1].y + 2, 0);
  btcCoin.rotation.x = Math.PI / 2;
  scene.add(btcCoin);
  
  console.log('价格图表创建完成，所有元素已添加到场景');
}

/**
 * 确保热点在地球旋转时保持正确位置
 * @param {THREE.Mesh} earth - 地球对象
 */
function updateGlobalHotspots(earth) {
  if (!window.globalHotspots) return;
  
  // 获取地球的旋转
  const earthRotation = earth.rotation.y;
  
  // 更新热点的位置，使其随着地球旋转
  window.globalHotspots.forEach(hotspot => {
    if (hotspot.userData.initialPosition) {
      // 这是一个向量复制和旋转操作
      const rotatedPosition = hotspot.userData.initialPosition.clone();
      rotatedPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), earthRotation);
      hotspot.position.copy(rotatedPosition);
    }
  });
}

/**
 * 添加地理热点
 * @param {THREE.Scene} scene - Three.js场景
 */
function addGeoHotspots(scene) {
  // 定义热点数据 [纬度, 经度, 名称, 颜色, 大小, 描述]
  const hotspots = [
    [40.7, -74.0, "纽约", 0x00FFFF, 0.2, "美国纽约：<br>- 纽约证券交易所上市多个比特币ETF<br>- 金融监管机构对加密货币的态度逐渐开放<br>- 多家投资银行在纽约建立加密货币交易部门<br>- 自由金融理念在华尔街逐渐被接受"],
    [34.1, -118.2, "洛杉矶", 0x00FFFF, 0.2, "美国洛杉矶：<br>- 多家加密货币初创公司总部所在地<br>- 比特币ATM机数量全美领先<br>- 科技社区对区块链技术的采用率高<br>- 加密货币投资者社区活跃"],
    [51.5, -0.1, "伦敦", 0xB026FF, 0.25, "英国伦敦：<br>- 全球金融中心对比特币的监管态度<br>- 英国央行对CBDC的研究进展<br>- 脱欧后金融政策对加密货币市场的影响<br>- 伦敦金融城大型机构的比特币投资策略"],
    [35.7, 139.8, "东京", 0xB026FF, 0.2, "日本东京：<br>- 日本率先将比特币作为法定支付手段<br>- Mt.Gox事件后的监管变化<br>- 日本央行数字货币计划<br>- 零售市场比特币支付的普及程度"],
    [39.9, 116.4, "北京", 0xFF2A6D, 0.25, "中国北京：<br>- 中国对加密货币挖矿和交易的政策演变<br>- 数字人民币(e-CNY)的发展进程<br>- 区块链技术在中国的应用发展<br>- 政策变化对全球比特币市场的影响"],
    [1.3, 103.8, "新加坡", 0x00FF41, 0.15, "新加坡：<br>- 新加坡作为亚洲加密货币中心的崛起<br>- 开放的监管环境吸引全球加密企业<br>- 金融管理局(MAS)的监管框架<br>- 创新沙盒计划促进区块链技术发展"],
    [55.8, 37.6, "莫斯科", 0xFF4500, 0.2, "俄罗斯莫斯科：<br>- 俄罗斯对加密货币的监管立场转变<br>- 能源丰富地区成为挖矿中心<br>- 地缘政治因素对加密货币采用的影响<br>- 规避国际制裁与比特币使用的关联"],
    [-33.9, 18.4, "开普敦", 0xFFD700, 0.15, "南非开普敦：<br>- 非洲大陆比特币采用的引领者<br>- 应对高通胀环境下的比特币需求<br>- P2P交易平台在非洲的快速增长<br>- 跨境支付与汇款领域的加密应用"],
    [25.2, 55.3, "迪拜", 0x9370DB, 0.2, "阿联酋迪拜：<br>- 迪拜区块链战略2023的实施进展<br>- 中东地区加密货币监管的先行者<br>- 石油财富向数字资产的转移趋势<br>- 创建全球首个基于区块链的政府"]
  ];
  
  // 纬度经度转换为3D坐标
  const latLngToVector3 = (lat, lng, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    return new THREE.Vector3(x, y, z);
  };
  
  // 存储所有热点对象的数组，用于交互
  window.globalHotspots = [];
  
  hotspots.forEach(spot => {
    const [lat, lng, name, color, size, description] = spot;
    const position = latLngToVector3(lat, lng, 5.1);
    
    // 创建热点球体
    const hotspotGeometry = new THREE.SphereGeometry(size, 16, 16);
    const hotspotMaterial = new THREE.MeshPhongMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9
    });
    
    const hotspot = new THREE.Mesh(hotspotGeometry, hotspotMaterial);
    hotspot.position.copy(position);
    hotspot.userData.isHotspot = true;
    hotspot.userData.name = name;
    hotspot.userData.description = description; // 添加描述内容
    hotspot.userData.initialPosition = position.clone(); // 保存初始位置
    
    // 存储热点引用，供交互使用
    window.globalHotspots.push(hotspot);
    
    scene.add(hotspot);
    
    // 添加脉冲效果
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0
    });
    
    const pulseGeometry = new THREE.SphereGeometry(size * 2, 16, 16);
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.position.copy(position);
    pulse.userData.isHotspot = true;
    pulse.userData.name = name;
    pulse.userData.description = description; // 脉冲效果也添加描述内容
    pulse.userData.initialPosition = position.clone(); // 保存初始位置
    pulse.userData.pulse = Math.random() * 2 * Math.PI;
    
    // 存储脉冲引用，供交互使用
    window.globalHotspots.push(pulse);
    
    scene.add(pulse);
    
    // 更新脉冲效果
    function updatePulse() {
      pulse.userData.pulse += 0.05;
      pulseMaterial.opacity = 0.5 * (Math.sin(pulse.userData.pulse) + 1) / 2;
      pulse.scale.set(
        1 + 0.5 * Math.sin(pulse.userData.pulse),
        1 + 0.5 * Math.sin(pulse.userData.pulse),
        1 + 0.5 * Math.sin(pulse.userData.pulse)
      );
      
      requestAnimationFrame(updatePulse);
    }
    
    updatePulse();
  });
  
  // 添加一个说明标签
  const instructionDiv = document.createElement('div');
  instructionDiv.className = 'map-instruction';
  instructionDiv.innerHTML = '点击地图上的彩色热点可查看详细信息';
  instructionDiv.style.cssText = `
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 20, 40, 0.7);
    color: #0ff;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    pointer-events: none;
    z-index: 10;
    border: 1px solid rgba(0, 255, 255, 0.3);
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
  `;
  
  // 找到地图容器并添加说明
  const mapContainer = document.querySelector('.map-container');
  if (mapContainer) {
    mapContainer.style.position = 'relative';
    mapContainer.appendChild(instructionDiv);
  }
}

/**
 * 设置热点交互功能
 */
function setupHotspotInteraction(scene, renderer, camera, container) {
  // 创建射线发射器，用于检测点击
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  // 创建热点信息弹窗
  const infoPopup = document.createElement('div');
  infoPopup.className = 'hotspot-info';
  infoPopup.style.cssText = `
    position: absolute;
    background: rgba(0, 20, 40, 0.9);
    color: #fff;
    padding: 20px;
    border-radius: 5px;
    max-width: 300px;
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.7);
    border: 1px solid #0ff;
    display: none;
    z-index: 100;
    transition: opacity 0.3s ease;
    font-family: 'Share Tech Mono', monospace;
  `;
  container.appendChild(infoPopup);
  
  // 关闭按钮
  const closeButton = document.createElement('button');
  closeButton.className = 'close-btn';
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    color: #0ff;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  infoPopup.appendChild(closeButton);
  
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    infoPopup.style.display = 'none';
    
    // 播放点击音效
    if (window.CYBER && CYBER.playSound) {
      CYBER.playSound('click');
    }
  });
  
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.transform = 'scale(1.2)';
    closeButton.style.color = '#ff2a6d';
    
    // 播放悬停音效
    if (window.CYBER && CYBER.playSound) {
      CYBER.playSound('hover');
    }
  });
  
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.transform = 'scale(1)';
    closeButton.style.color = '#0ff';
  });
  
  // 监听点击事件
  container.addEventListener('click', (event) => {
    // 计算鼠标位置的标准化设备坐标
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
    
    // 从相机和鼠标位置更新射线
    raycaster.setFromCamera(mouse, camera);
    
    // 检查射线是否与热点相交
    const intersects = raycaster.intersectObjects(window.globalHotspots);
    
    if (intersects.length > 0) {
      const hotspot = intersects[0].object;
      
      // 确保对象是热点
      if (hotspot.userData && hotspot.userData.isHotspot) {
        console.log('点击了热点:', hotspot.userData.name);
        
        // 显示弹窗
        const name = hotspot.userData.name;
        const description = hotspot.userData.description || '暂无信息';
        
        // 创建标题，使用霓虹文字样式
        infoPopup.innerHTML = `
          <button class="close-btn">×</button>
          <h3 class="neon-text">${name}</h3>
          <div class="hotspot-content">${description}</div>
        `;
        
        // 重新添加关闭按钮事件
        const newCloseButton = infoPopup.querySelector('.close-btn');
        newCloseButton.style.cssText = closeButton.style.cssText;
        newCloseButton.addEventListener('click', (e) => {
          e.stopPropagation();
          infoPopup.style.display = 'none';
          
          // 播放点击音效
          if (window.CYBER && CYBER.playSound) {
            CYBER.playSound('click');
          }
        });
        
        newCloseButton.addEventListener('mouseenter', () => {
          newCloseButton.style.transform = 'scale(1.2)';
          newCloseButton.style.color = '#ff2a6d';
          
          // 播放悬停音效
          if (window.CYBER && CYBER.playSound) {
            CYBER.playSound('hover');
          }
        });
        
        newCloseButton.addEventListener('mouseleave', () => {
          newCloseButton.style.transform = 'scale(1)';
          newCloseButton.style.color = '#0ff';
        });
        
        // 添加霓虹文字样式
        const neonText = infoPopup.querySelector('.neon-text');
        if (neonText) {
          neonText.style.cssText = `
            color: #fff;
            text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff;
            font-size: 18px;
            margin-bottom: 10px;
            text-align: center;
          `;
        }
        
        // 添加内容样式
        const hotspotContent = infoPopup.querySelector('.hotspot-content');
        if (hotspotContent) {
          hotspotContent.style.cssText = `
            line-height: 1.6;
            font-size: 14px;
          `;
        }
        
        // 定位弹窗 - 默认在热点上方显示
        const point = intersects[0].point.clone();
        point.project(camera);
        
        const x = (point.x * 0.5 + 0.5) * container.clientWidth;
        const y = (-point.y * 0.5 + 0.5) * container.clientHeight;
        
        // 调整弹窗位置，防止超出容器边界
        const popupWidth = 300; // 弹窗最大宽度
        const popupHeight = 200; // 估算弹窗高度
        
        let popupX = x - popupWidth / 2;
        let popupY = y - popupHeight - 20; // 在热点上方20px处显示
        
        // 检查是否会超出容器边界，如果是则调整位置
        if (popupX < 10) popupX = 10;
        if (popupX + popupWidth > container.clientWidth - 10) 
          popupX = container.clientWidth - popupWidth - 10;
        
        if (popupY < 10) {
          // 如果上方空间不足，则在热点下方显示
          popupY = y + 20;
          
          // 如果下方也不够，则尽量居中
          if (popupY + popupHeight > container.clientHeight - 10)
            popupY = container.clientHeight / 2 - popupHeight / 2;
        }
        
        infoPopup.style.left = `${popupX}px`;
        infoPopup.style.top = `${popupY}px`;
        infoPopup.style.display = 'block';
        infoPopup.style.opacity = '0';
        
        // 添加进入动画
        setTimeout(() => {
          infoPopup.style.opacity = '1';
        }, 10);
        
        // 播放点击音效
        if (window.CYBER && CYBER.playSound) {
          CYBER.playSound('data');
        }
        
        // 更新热点材质，让被点击的热点亮起来
        if (hotspot.material) {
          const originalEmissiveIntensity = hotspot.material.emissiveIntensity;
          hotspot.material.emissiveIntensity = 2;
          
          // 2秒后恢复原来的亮度
          setTimeout(() => {
            if (hotspot.material) {
              hotspot.material.emissiveIntensity = originalEmissiveIntensity;
            }
          }, 2000);
        }
      }
    } else {
      // 没有点击到热点，如果点击了容器空白处，关闭弹窗
      if (infoPopup.style.display === 'block') {
        infoPopup.style.display = 'none';
      }
    }
  });
  
  // 添加鼠标移动事件，更改鼠标样式
  container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(window.globalHotspots);
    
    if (intersects.length > 0) {
      const hotspot = intersects[0].object;
      if (hotspot.userData && hotspot.userData.isHotspot) {
        container.style.cursor = 'pointer';
      }
    } else {
      container.style.cursor = 'default';
    }
  });
}

/**
 * 初始化全息世界地图
 */
function initWorldMap() {
  const container = document.getElementById('worldMapContainer');
  if (!container) {
    console.error('找不到世界地图容器: worldMapContainer');
    return;
  }
  
  try {
    console.log('初始化世界地图...');
    
    // 创建场景、相机和渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true
    });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    console.log('渲染器已创建，尺寸:', container.clientWidth, 'x', container.clientHeight);
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    // 添加点光源
    const pointLight = new THREE.PointLight(0x00FFFF, 2, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // 创建地球
    const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x333333,
      emissive: 0x112244,
      transparent: true,
      opacity: 0.9
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // 添加国家轮廓
    const countriesGeometry = new THREE.SphereGeometry(5.05, 32, 32);
    const countriesMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    
    const countries = new THREE.Mesh(countriesGeometry, countriesMaterial);
    scene.add(countries);
    
    console.log('地球和国家轮廓已添加到场景');
    
    // 添加热点
    addGeoHotspots(scene);
    console.log('地理热点已添加');
    
    // 设置相机位置
    camera.position.z = 15;
    
    // 创建控制器组
    let controls = null;
    
    // 是否启用自动旋转
    let autoRotate = true;
    
    // 添加暂停/继续旋转按钮
    const pauseButton = document.createElement('button');
    pauseButton.className = 'pause-rotation';
    pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    pauseButton.style.cssText = `
      position: absolute;
      bottom: 60px;
      right: 20px;
      background: rgba(0, 20, 40, 0.7);
      color: #0ff;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1px solid rgba(0, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.3s ease;
    `;
    
    container.appendChild(pauseButton);
    
    pauseButton.addEventListener('click', () => {
      autoRotate = !autoRotate;
      
      if (controls) {
        controls.autoRotate = autoRotate;
      }
      
      pauseButton.innerHTML = autoRotate ? 
        '<i class="fas fa-pause"></i>' : 
        '<i class="fas fa-play"></i>';
        
      // 播放点击音效
      if (window.CYBER && CYBER.playSound) {
        CYBER.playSound('click');
      }
    });
    
    pauseButton.addEventListener('mouseenter', () => {
      pauseButton.style.transform = 'scale(1.1)';
      pauseButton.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.8)';
      
      // 播放悬停音效
      if (window.CYBER && CYBER.playSound) {
        CYBER.playSound('hover');
      }
    });
    
    pauseButton.addEventListener('mouseleave', () => {
      pauseButton.style.transform = 'scale(1)';
      pauseButton.style.boxShadow = 'none';
    });
    
    // 创建OrbitControls控制器（如果可用）
    if (typeof THREE.OrbitControls !== 'undefined') {
      console.log('使用OrbitControls控制地球旋转');
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.rotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 8;
      controls.maxDistance = 20;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.0; // 增加自动旋转速度
      
      // 添加事件监听，当用户交互时暂停自动旋转，一段时间后恢复
      controls.addEventListener('start', function() {
        if (autoRotate) {
          controls.autoRotate = false;
        }
      });
      
      controls.addEventListener('end', function() {
        if (autoRotate) {
          // 用户停止交互3秒后恢复自动旋转
          setTimeout(() => {
            if (autoRotate) {
              controls.autoRotate = true;
            }
          }, 3000);
        }
      });
    } else {
      console.log('OrbitControls未加载，使用默认自动旋转');
    }
    
    // 动画循环 - 始终创建此函数
    const rotationSpeed = 0.003; // 旋转速度
    let lastAutoRotateState = autoRotate;
    
    function animate() {
      requestAnimationFrame(animate);
      
      // 如果有控制器，更新控制器
      if (controls) {
        controls.update();
        
        // 检查自动旋转状态是否发生变化
        if (lastAutoRotateState !== autoRotate) {
          controls.autoRotate = autoRotate;
          lastAutoRotateState = autoRotate;
        }
        
        // 控制器旋转时自动更新热点位置
        // 注意：这种方法在OrbitControls中不适用，因为控制器会旋转相机而不是物体
        // 但我们可以保持热点稳定在各自位置
      } else {
        // 否则手动旋转
        if (autoRotate) {
          earth.rotation.y += rotationSpeed;
          countries.rotation.y += rotationSpeed;
        }
      }
      
      // 无论是否有控制器，都渲染场景
      renderer.render(scene, camera);
    }
    
    // 开始动画循环
    animate();
    console.log('地球旋转动画已启动');
    
    // 窗口大小变化时调整画布大小
    window.addEventListener('resize', () => {
      if (container.clientWidth > 0 && container.clientHeight > 0) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.render(scene, camera);
        console.log('窗口大小调整为:', container.clientWidth, 'x', container.clientHeight);
      }
    });
    
    // 显示热点信息的事件处理
    setupHotspotInteraction(scene, renderer, camera, container);
    console.log('热点交互功能已设置');
    
    return { scene, camera, renderer, controls, earth, countries, autoRotate };
  } catch (error) {
    console.error('初始化世界地图时出错:', error);
    container.innerHTML = `
      <div class="webgl-error">
        <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
        <h3>3D全息地图渲染失败</h3>
        <p>显示3D世界地图时发生错误。</p>
        <p>错误详情: ${error.message}</p>
      </div>
    `;
  }
}

/**
 * 初始化进入矩阵按钮事件
 */
function initEnterMatrixButton() {
  const enterButton = document.getElementById('enterMatrixButton');
  if (!enterButton) return;
  
  enterButton.addEventListener('click', () => {
    // 播放点击声音
    CYBER.playSound('click');
    
    // 添加过渡动画类
    document.querySelector('.page-transition').classList.add('active');
    
    // 延迟跳转，等待动画完成
    setTimeout(() => {
      window.location.href = 'pages/price-analysis.html';
    }, 1000);
  });
  
  // 添加悬停效果
  enterButton.addEventListener('mouseenter', () => {
    CYBER.playSound('hover');
    
    // 添加扫描线
    const scanLine = document.createElement('div');
    scanLine.classList.add('scan-line');
    enterButton.appendChild(scanLine);
    
    // 自动移除扫描线
    setTimeout(() => {
      scanLine.remove();
    }, 1000);
  });
}

/**
 * 初始化卡片导航
 */
function initCardNavigation() {
  const cards = document.querySelectorAll('.cyber-card');
  if (!cards.length) return;
  
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // 获取卡片链接
      const link = card.querySelector('.card-link');
      if (!link) return;
      
      // 播放点击声音
      CYBER.playSound('click');
      
      // 添加过渡动画类
      document.querySelector('.page-transition').classList.add('active');
      
      // 延迟跳转，等待动画完成
      setTimeout(() => {
        window.location.href = link.getAttribute('href');
      }, 1000);
    });
    
    // 添加悬停效果
    card.addEventListener('mouseenter', () => {
      CYBER.playSound('hover');
    });
  });
}

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const hologramSection = document.querySelector('.hologram-section');
      if (hologramSection) {
        // 平滑滚动到全息图部分
        hologramSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
    
    // 滚动时隐藏滚动指示器
    window.addEventListener('scroll', () => {
      if (window.scrollY > window.innerHeight * 0.2) {
        scrollIndicator.style.opacity = '0';
      } else {
        scrollIndicator.style.opacity = '0.7';
      }
    });
  }
  
  // 在元素进入视口时添加动画
  const animateOnScroll = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  };
  
  const observer = new IntersectionObserver(animateOnScroll, {
    root: null,
    threshold: 0.1,
    rootMargin: '-20px'
  });
  
  // 观察需要动画的元素
  document.querySelectorAll('.cyber-card, .hologram-container').forEach(el => {
    el.classList.add('needs-animation');
    observer.observe(el);
  });
  
  // 更新价格数据
  const headerPrice = document.getElementById('headerPrice');
  const headerPriceChange = document.getElementById('headerPriceChange');
  const lastUpdated = document.getElementById('lastUpdated');
  
  if (headerPrice && headerPriceChange && lastUpdated) {
    // 获取价格数据和更新UI
    CYBER.updateBitcoinPrice('headerPrice', 'headerPriceChange');
    
    // 每60秒更新一次价格
    setInterval(() => {
      CYBER.updateBitcoinPrice('headerPrice', 'headerPriceChange');
      lastUpdated.textContent = '刚刚';
    }, 60000);
  }
}

// 将关键函数导出到window对象，以便CYBER对象能够访问
window.initPriceChart = initPriceChart;
window.initWorldMap = initWorldMap; 