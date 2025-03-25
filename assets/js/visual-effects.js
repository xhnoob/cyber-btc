/**
 * 赛博启示录 - 视觉效果脚本
 * 提供各种赛博朋克视觉效果
 */

// 页面加载完成后初始化视觉效果
document.addEventListener('DOMContentLoaded', function() {
  console.log("加载视觉效果...");
  
  // 添加一定延迟，确保Three.js和图表已初始化
  setTimeout(() => {
    initVisualEffects();      
  }, 1000);
});

function initVisualEffects() {
  console.log("初始化视觉效果...");
  
  // 添加矩阵雨效果
  addMatrixRainEffect();
  
  // 添加鼠标光束效果
  addMouseBeamEffect();
  
  // 添加霓虹闪烁效果
  addNeonFlickerEffect();
  
  // 添加扫描线效果
  addScanLinesEffect();
  
  // 确保视觉效果不影响Three.js渲染
  ensureThreeJsCompatibility();
}

/**
 * 添加矩阵雨效果
 */
function addMatrixRainEffect() {
  const matrixContainer = document.getElementById('matrixEffect');
  if (!matrixContainer) return;
  
  console.log("添加矩阵雨效果...");
  
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 设置canvas大小
  canvas.width = matrixContainer.clientWidth || 300;
  canvas.height = matrixContainer.clientHeight || 400;
  
  matrixContainer.appendChild(canvas);
  
  // 矩阵雨字符集
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  
  // 字体大小
  const fontSize = 14;
  
  // 列数
  const columns = Math.floor(canvas.width / fontSize);
  
  // 列的当前位置
  const drops = [];
  for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
  }
  
  // 绘制矩阵雨
  function drawMatrixRain() {
    // 半透明黑色背景，形成拖尾效果
    ctx.fillStyle = "rgba(0, 10, 20, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 文字颜色
    ctx.fillStyle = "#0F0";
    ctx.font = `${fontSize}px monospace`;
    
    // 每列输出一个字符
    for (let i = 0; i < drops.length; i++) {
      // 随机选择一个字符
      const char = chars[Math.floor(Math.random() * chars.length)];
      
      // 计算x和y位置
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      
      // 绘制字符
      ctx.fillText(char, x, y);
      
      // 随机重置一部分字符回顶部
      if (y > canvas.height && Math.random() > 0.99) {
        drops[i] = 0;
      }
      
      // 移动到下一位置
      drops[i]++;
    }
  }
  
  // 每50ms更新一次矩阵雨
  const matrixInterval = setInterval(drawMatrixRain, 50);
  
  // 窗口大小变化时重设canvas大小
  window.addEventListener('resize', () => {
    clearInterval(matrixInterval);
    
    canvas.width = matrixContainer.clientWidth || 300;
    canvas.height = matrixContainer.clientHeight || 400;
    
    // 重新计算列数和重置列位置
    const columns = Math.floor(canvas.width / fontSize);
    drops.length = 0;
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * canvas.height / fontSize);
    }
    
    setInterval(drawMatrixRain, 50);
  });
}

/**
 * 添加鼠标光束效果
 */
function addMouseBeamEffect() {
  // 创建跟随鼠标的光束效果
  const beam = document.createElement('div');
  beam.className = 'mouse-beam';
  beam.style.cssText = `
    position: fixed;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0,255,255,0.2) 0%, rgba(0,255,255,0) 70%);
    pointer-events: none;
    z-index: 9999;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  document.body.appendChild(beam);
  
  // 只在特定区域显示光束效果
  const enabledAreas = ['.hologram-container', '.cyber-card', '.matrix-visual'];
  
  // 鼠标移动时更新光束位置
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    beam.style.left = `${x - 50}px`;
    beam.style.top = `${y - 50}px`;
    
    // 检查鼠标是否在启用区域
    let isInEnabledArea = false;
    
    for (const selector of enabledAreas) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          isInEnabledArea = true;
          break;
        }
      }
      
      if (isInEnabledArea) break;
    }
    
    // 根据区域切换光束状态
    beam.style.opacity = isInEnabledArea ? '1' : '0';
  });
}

/**
 * 添加霓虹闪烁效果
 */
function addNeonFlickerEffect() {
  // 为所有霓虹文字添加随机闪烁
  const neonElements = document.querySelectorAll('.neon-text, .price-value');
  
  neonElements.forEach(el => {
    // 原始文本阴影
    const originalShadow = window.getComputedStyle(el).textShadow;
    
    // 随机闪烁
    const flickerInterval = 2000 + Math.random() * 4000; // 2-6秒一次闪烁
    
    setInterval(() => {
      // 随机决定是否闪烁
      if (Math.random() > 0.7) {
        // 闪烁效果
        el.style.textShadow = 'none';
        
        // 短暂延迟后恢复
        setTimeout(() => {
          el.style.textShadow = originalShadow;
          
          // 可能的二次闪烁
          if (Math.random() > 0.5) {
            setTimeout(() => {
              el.style.textShadow = 'none';
              setTimeout(() => {
                el.style.textShadow = originalShadow;
              }, 50);
            }, 100);
          }
        }, 50);
      }
    }, flickerInterval);
  });
}

/**
 * 添加扫描线效果
 */
function addScanLinesEffect() {
  // 为全息容器添加扫描线
  const containers = document.querySelectorAll('.hologram-container');
  
  containers.forEach(container => {
    // 检查是否已经有扫描线
    if (container.querySelector('.scan-line')) return;
    
    // 创建扫描线
    const scanLine = document.createElement('div');
    scanLine.className = 'scan-line-effect';
    scanLine.style.cssText = `
      position: absolute;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(0, 255, 255, 0.2) 10%, 
        rgba(0, 255, 255, 0.6) 50%, 
        rgba(0, 255, 255, 0.2) 90%, 
        transparent 100%);
      z-index: 10;
      pointer-events: none;
    `;
    
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.appendChild(scanLine);
    
    // 添加动画
    let position = 0;
    const height = container.clientHeight;
    
    function animateScanLine() {
      position = (position + 1) % height;
      scanLine.style.top = `${position}px`;
      requestAnimationFrame(animateScanLine);
    }
    
    animateScanLine();
  });
}

/**
 * 确保视觉效果不影响Three.js渲染
 */
function ensureThreeJsCompatibility() {
  // 降低扫描线的z-index，避免遮挡3D渲染
  document.querySelectorAll('.scan-line-effect').forEach(el => {
    el.style.zIndex = '2';
  });
  
  // 确保hologram-container的position为relative
  document.querySelectorAll('.hologram-container').forEach(el => {
    if (window.getComputedStyle(el).position === 'static') {
      el.style.position = 'relative';
    }
  });
  
  // 移除可能影响WebGL性能的动画效果
  const isLowPerformance = navigator.hardwareConcurrency < 4 || 
                         /Mobile|Android/.test(navigator.userAgent);
  
  if (isLowPerformance) {
    console.log("检测到低性能设备，降低视觉效果复杂度");
    
    // 减少矩阵雨的更新频率
    const matrixEffects = document.querySelectorAll('#matrixEffect canvas');
    matrixEffects.forEach(canvas => {
      canvas.style.opacity = '0.5';
    });
    
    // 禁用鼠标光束
    const beam = document.querySelector('.mouse-beam');
    if (beam) beam.style.display = 'none';
  }
} 