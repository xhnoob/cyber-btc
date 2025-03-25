/**
 * 赛博启示录 - 技术发展页面JS文件
 * 实现技术发展页面的特有功能，如闪电网络可视化
 */

// 页面加载完成事件
document.addEventListener('DOMContentLoaded', () => {
  // 初始化闪电网络可视化
  initLightningNetwork();
  
  // 初始化闪电网络采用图表
  initLightningAdoptionChart();
  
  // 为时间线添加动画
  initTimelineAnimations();
  
  // 初始化协议卡片交互
  initProtocolCards();
  
  // 添加网络指标数字变化动画
  initMetricValueAnimation();
});

/**
 * 初始化闪电网络可视化
 */
function initLightningNetwork() {
  const container = document.getElementById('lightningNetworkVisualization');
  if (!container) return;
  
  // 创建场景、相机和渲染器
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0x404040, 1);
  scene.add(ambientLight);
  
  // 添加点光源
  const pointLight = new THREE.PointLight(0xB026FF, 2, 100);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);
  
  // 创建节点和通道的几何体
  createLightningNodes(scene);
  
  // 设置相机位置
  camera.position.z = 15;
  
  // 动画循环
  function animate() {
    requestAnimationFrame(animate);
    
    // 旋转整个网络
    scene.rotation.y += 0.001;
    scene.rotation.x += 0.0005;
    
    // 更新通道动画
    updateChannelAnimations();
    
    renderer.render(scene, camera);
  }
  
  // 创建网络通道动画
  function updateChannelAnimations() {
    scene.children.forEach(child => {
      if (child.userData && child.userData.isChannel) {
        // 更新通道脉冲动画
        if (child.material.dashSize > 0) {
          child.material.dashSize -= 0.01;
          if (child.material.dashSize <= 0) {
            child.material.dashSize = Math.random() * 0.5 + 0.2;
          }
        }
      }
    });
  }
  
  animate();
  
  // 窗口大小变化时调整画布大小
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/**
 * 创建闪电网络节点和通道
 * @param {THREE.Scene} scene - Three.js场景
 */
function createLightningNodes(scene) {
  // 创建节点几何体
  const nodeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
  const largeNodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  
  // 创建节点材质
  const nodeMaterial = new THREE.MeshPhongMaterial({
    color: 0xB026FF,
    emissive: 0xB026FF,
    emissiveIntensity: 0.5,
    shininess: 50
  });
  
  const largeNodeMaterial = new THREE.MeshPhongMaterial({
    color: 0x00FFFF,
    emissive: 0x00FFFF,
    emissiveIntensity: 0.5,
    shininess: 50
  });
  
  // 创建通道线条材质
  const channelMaterial = new THREE.LineDashedMaterial({
    color: 0xB026FF,
    linewidth: a1,
    scale: 1,
    dashSize: 0.5,
    gapSize: 0.1,
    opacity: 0.6,
    transparent: true
  });
  
  // 生成随机节点位置
  const nodes = [];
  const largeNodes = [];
  const totalNodes = 150;
  const largeNodeCount = 10;
  
  // 创建大型节点（中心节点）
  for (let i = 0; i < largeNodeCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 4 + Math.random() * 2;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    const node = new THREE.Mesh(largeNodeGeometry, largeNodeMaterial);
    node.position.set(x, y, z);
    scene.add(node);
    
    largeNodes.push({
      mesh: node,
      position: new THREE.Vector3(x, y, z)
    });
  }
  
  // 创建普通节点
  for (let i = 0; i < totalNodes; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const radius = 5 + Math.random() * 2;
    
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(x, y, z);
    scene.add(node);
    
    nodes.push({
      mesh: node,
      position: new THREE.Vector3(x, y, z)
    });
  }
  
  // 创建节点之间的通道
  // 首先连接所有大型节点
  for (let i = 0; i < largeNodes.length; i++) {
    for (let j = i + 1; j < largeNodes.length; j++) {
      createChannel(scene, largeNodes[i].position, largeNodes[j].position, 0x00FFFF);
    }
  }
  
  // 然后为每个普通节点连接到最近的大型节点
  nodes.forEach(node => {
    // 找到最近的大型节点
    let closestLargeNode = largeNodes[0];
    let minDistance = node.position.distanceTo(largeNodes[0].position);
    
    largeNodes.forEach(largeNode => {
      const distance = node.position.distanceTo(largeNode.position);
      if (distance < minDistance) {
        minDistance = distance;
        closestLargeNode = largeNode;
      }
    });
    
    // 创建通道
    createChannel(scene, node.position, closestLargeNode.position, 0xB026FF);
  });
  
  // 随机添加一些节点之间的通道
  for (let i = 0; i < 100; i++) {
    const nodeA = nodes[Math.floor(Math.random() * nodes.length)];
    const nodeB = nodes[Math.floor(Math.random() * nodes.length)];
    
    if (nodeA !== nodeB && nodeA.position.distanceTo(nodeB.position) < 3) {
      createChannel(scene, nodeA.position, nodeB.position, 0xB026FF);
    }
  }
}

/**
 * 创建通道线条
 * @param {THREE.Scene} scene - Three.js场景
 * @param {THREE.Vector3} startPoint - 起始点
 * @param {THREE.Vector3} endPoint - 结束点
 * @param {number} color - 线条颜色
 */
function createChannel(scene, startPoint, endPoint, color) {
  // 创建几何体
  const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
  
  // 创建材质
  const material = new THREE.LineDashedMaterial({
    color: color,
    linewidth: 1,
    scale: 1,
    dashSize: Math.random() * 0.5 + 0.2,
    gapSize: 0.1,
    opacity: 0.6,
    transparent: true
  });
  
  // 创建线条
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances(); // 计算线段距离，用于虚线渲染
  line.userData = { isChannel: true };
  scene.add(line);
  
  return line;
}

/**
 * 初始化闪电网络采用图表
 */
function initLightningAdoptionChart() {
  const ctx = document.getElementById('lightningAdoptionChart');
  if (!ctx) return;
  
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
      datasets: [
        {
          label: '网络容量 (BTC)',
          data: [830, 1100, 3300, 3800, 5100, 5830],
          borderColor: 'rgba(176, 38, 255, 1)',
          backgroundColor: 'rgba(176, 38, 255, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(176, 38, 255, 1)',
          pointRadius: 4
        },
        {
          label: '活跃节点数',
          data: [2500, 5000, 8400, 15600, 16800, 18290],
          borderColor: 'rgba(0, 255, 255, 1)',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: 'rgba(0, 255, 255, 1)',
          pointRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)'
          },
          title: {
            display: true,
            text: '容量 (BTC)',
            color: 'rgba(176, 38, 255, 0.7)'
          }
        },
        y1: {
          position: 'right',
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            color: 'rgba(0, 255, 255, 0.7)'
          },
          title: {
            display: true,
            text: '活跃节点',
            color: 'rgba(0, 255, 255, 0.7)'
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255, 255, 255, 0.7)'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      animation: {
        duration: 2000,
        easing: 'easeOutQuart'
      }
    }
  });
}

/**
 * 初始化时间线动画
 */
function initTimelineAnimations() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  if (!timelineItems.length) return;
  
  // 创建交叉观察器
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 延迟添加可见类，创建级联效果
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 150 * Array.from(timelineItems).indexOf(entry.target));
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });
  
  // 为所有时间线项目添加初始类并观察
  timelineItems.forEach(item => {
    item.classList.add('timeline-animate');
    observer.observe(item);
    
    // 添加悬停效果
    item.addEventListener('mouseenter', () => {
      CYBER.playSound('hover');
    });
  });
}

/**
 * 初始化协议卡片交互
 */
function initProtocolCards() {
  const protocolCards = document.querySelectorAll('.protocol-card');
  if (!protocolCards.length) return;
  
  // 为卡片添加动画效果
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, 100 * Array.from(protocolCards).indexOf(entry.target));
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  });
  
  // 观察所有卡片
  protocolCards.forEach(card => {
    observer.observe(card);
    
    // 添加悬停效果
    card.addEventListener('mouseenter', () => {
      CYBER.playSound('hover');
      
      // 添加扫描线效果
      const scanLine = document.createElement('div');
      scanLine.classList.add('card-scan-line');
      card.appendChild(scanLine);
      
      // 延时移除扫描线
      setTimeout(() => {
        scanLine.remove();
      }, 1000);
    });
  });
}

/**
 * 初始化网络指标数字变化动画
 */
function initMetricValueAnimation() {
  const metricValues = document.querySelectorAll('.metric-value');
  if (!metricValues.length) return;
  
  metricValues.forEach(valueElement => {
    // 获取原始文本值
    const originalText = valueElement.textContent;
    
    // 提取数字部分和后缀
    const match = originalText.match(/^([\d,\.]+)(.*)$/);
    if (!match) return;
    
    const numericPart = parseFloat(match[1].replace(/,/g, ''));
    const suffix = match[2];
    
    // 设置初始值为0
    valueElement.textContent = '0' + suffix;
    
    // 创建交叉观察器，当元素进入视口时触发动画
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 开始计数动画
          animateValue(valueElement, 0, numericPart, 2000, suffix);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.5
    });
    
    observer.observe(valueElement);
  });
}

/**
 * 数字变化动画
 * @param {Element} element - 目标DOM元素
 * @param {number} start - 起始值
 * @param {number} end - 结束值
 * @param {number} duration - 动画持续时间(毫秒)
 * @param {string} suffix - 数字后缀
 */
function animateValue(element, start, end, duration, suffix) {
  let startTimestamp = null;
  
  // 数字格式化函数
  const formatter = new Intl.NumberFormat();
  
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = progress * (end - start) + start;
    
    element.textContent = formatter.format(currentValue.toFixed(1)) + suffix;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  
  window.requestAnimationFrame(step);
} 