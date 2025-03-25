/**
 * 赛博启示�?- 调试助手脚本
 * 用于诊断和修�?D图表渲染问题
 */

// 全局调试对象
const DEBUG = {
  // 是否打开调试模式
  isDebugMode: true,
  
  // 初始化调试功�?
  init: function() {
    if (!this.isDebugMode) return;
    
    console.log('🔍 调试助手已激�?);
    
    // 添加调试信息
    this.setupDebugPanel();
    
    // 添加THREE.js检�?
    this.checkThreeJs();
    
    // 添加容器检�?
    this.checkContainers();
    
    // 添加WebGL诊断
    this.checkWebGL();
    
    // 添加渲染监控
    this.monitorRendering();
  },
  
  // 设置调试面板
  setupDebugPanel: function() {
    const debugPanel = document.getElementById('debug-info');
    
    if (!debugPanel) {
      console.warn('找不到debug-info元素，创建新的调试面�?);
      const panel = document.createElement('div');
      panel.id = 'debug-info';
      panel.style.cssText = `
        position: fixed;
        top: 60px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: #0ff;
        padding: 10px;
        border: 1px solid #0ff;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        max-height: 400px;
        overflow-y: auto;
      `;
      
      // 添加控制按钮
      const controls = document.createElement('div');
      controls.innerHTML = `
        <button id="debug-toggle" style="background:#222; color:#0ff; border:1px solid #0ff; margin-right:5px; cursor:pointer;">隐藏</button>
        <button id="debug-fix" style="background:#222; color:#0ff; border:1px solid #0ff; cursor:pointer;">修复图表</button>
      `;
      panel.appendChild(controls);
      
      // 添加内容�?
      const content = document.createElement('div');
      content.id = 'debug-content';
      panel.appendChild(content);
      
      document.body.appendChild(panel);
      
      // 添加事件监听
      document.getElementById('debug-toggle').addEventListener('click', function() {
        const content = document.getElementById('debug-content');
        if (content.style.display === 'none') {
          content.style.display = 'block';
          this.textContent = '隐藏';
        } else {
          content.style.display = 'none';
          this.textContent = '显示';
        }
      });
      
      document.getElementById('debug-fix').addEventListener('click', function() {
        DEBUG.fixCharts();
      });
    }
    
    // 添加基本信息
    this.log('调试助手初始化完�?);
    this.log(`浏览�? ${navigator.userAgent}`);
    this.log(`屏幕尺寸: ${window.innerWidth}x${window.innerHeight}`);
  },
  
  // 添加日志
  log: function(message) {
    const content = document.getElementById('debug-content');
    if (content) {
      const time = new Date().toLocaleTimeString();
      content.innerHTML += `<div>[${time}] ${message}</div>`;
      // 滚动到底�?
      content.scrollTop = content.scrollHeight;
    }
    
    // 同时在控制台输出
    console.log(`[调试助手] ${message}`);
  },
  
  // 检查THREE.js
  checkThreeJs: function() {
    if (typeof THREE === 'undefined') {
      this.log('�?THREE.js未加载，尝试重新加载...');
      
      // 创建脚本
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => {
        this.log('�?THREE.js已成功加�?);
        
        // 尝试加载OrbitControls
        const orbitScript = document.createElement('script');
        orbitScript.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
        orbitScript.onload = () => {
          this.log('�?OrbitControls已成功加�?);
          this.reInitCharts();
        };
        orbitScript.onerror = () => {
          this.log('�?OrbitControls加载失败');
        };
        document.head.appendChild(orbitScript);
      };
      script.onerror = () => {
        this.log('�?THREE.js加载失败，图表可能无法显�?);
      };
      document.head.appendChild(script);
    } else {
      this.log('�?THREE.js已加�?);
      
      // 检查OrbitControls
      if (typeof THREE.OrbitControls === 'undefined') {
        this.log('�?OrbitControls未加�?);
      } else {
        this.log('�?OrbitControls已加�?);
      }
    }
  },
  
  // 检查容�?
  checkContainers: function() {
    const priceChart = document.getElementById('priceChart3D');
    if (!priceChart) {
      this.log('�?找不到priceChart3D容器');
    } else {
      const width = priceChart.clientWidth;
      const height = priceChart.clientHeight;
      this.log(`�?priceChart3D容器: ${width}x${height}px`);
      
      if (width === 0 || height === 0) {
        this.log('⚠️ 容器尺寸�?，可能导致渲染问�?);
      }
    }
    
    const worldMap = document.getElementById('worldMapContainer');
    if (!worldMap) {
      this.log('�?找不到worldMapContainer容器');
    } else {
      const width = worldMap.clientWidth;
      const height = worldMap.clientHeight;
      this.log(`�?worldMapContainer容器: ${width}x${height}px`);
      
      if (width === 0 || height === 0) {
        this.log('⚠️ 容器尺寸�?，可能导致渲染问�?);
      }
    }
  },
  
  // 检查WebGL支持
  checkWebGL: function() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        this.log('�?您的浏览器不支持WebGL');
        return false;
      }
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        this.log(`�?WebGL支持: ${vendor} - ${renderer}`);
      } else {
        this.log('�?WebGL支持: 无法获取详细信息');
      }
      
      // 检查WebGL限制
      this.log(`最大纹理大�? ${gl.getParameter(gl.MAX_TEXTURE_SIZE)}`);
      this.log(`最大视口尺�? ${gl.getParameter(gl.MAX_VIEWPORT_DIMS)}`);
      
      return true;
    } catch (e) {
      this.log(`�?WebGL检查出�? ${e.message}`);
      return false;
    }
  },
  
  // 监控渲染性能
  monitorRendering: function() {
    // 检查是否存在WebGL上下�?
    const canvas = document.querySelector('#priceChart3D canvas');
    if (canvas) {
      this.log('�?找到WebGL画布，监控渲�?);
      
      // 添加帧率监控
      let frameCount = 0;
      let lastTime = performance.now();
      
      const checkFrameRate = () => {
        frameCount++;
        const now = performance.now();
        
        // 每秒更新一�?
        if (now - lastTime > 1000) {
          const fps = Math.round(frameCount * 1000 / (now - lastTime));
          this.updateStatus(`渲染性能: ${fps} FPS`);
          frameCount = 0;
          lastTime = now;
        }
        
        requestAnimationFrame(checkFrameRate);
      };
      
      checkFrameRate();
    } else {
      this.log('�?未找到WebGL画布，无法监控渲�?);
      
      // 3秒后重新检�?
      setTimeout(() => {
        const canvas = document.querySelector('#priceChart3D canvas');
        if (canvas) {
          this.log('�?延迟检测到WebGL画布');
        } else {
          this.log('�?仍然未检测到WebGL画布，可能渲染失�?);
        }
      }, 3000);
    }
  },
  
  // 更新状�?
  updateStatus: function(message) {
    const statusElement = document.getElementById('render-status');
    if (!statusElement) {
      const content = document.getElementById('debug-content');
      if (content) {
        const status = document.createElement('div');
        status.id = 'render-status';
        status.style.color = '#0f0';
        status.textContent = message;
        content.appendChild(status);
      }
    } else {
      statusElement.textContent = message;
    }
  },
  
  // 修复图表
  fixCharts: function() {
    this.log('🔧 尝试修复图表...');
    
    // 检查THREE状�?
    if (typeof THREE === 'undefined') {
      this.log('需要先加载THREE.js');
      this.checkThreeJs();
      return;
    }
    
    // 清理和重新创建价格图表容�?
    const priceChart = document.getElementById('priceChart3D');
    if (priceChart) {
      this.log('清理价格图表容器');
      // 保存父元素和样式
      const parent = priceChart.parentNode;
      const style = window.getComputedStyle(priceChart);
      const width = priceChart.clientWidth || 800;
      const height = priceChart.clientHeight || 400;
      
      // 移除旧容�?
      priceChart.remove();
      
      // 创建新容�?
      const newContainer = document.createElement('div');
      newContainer.id = 'priceChart3D';
      newContainer.style.width = `${width}px`;
      newContainer.style.height = `${height}px`;
      newContainer.className = 'hologram-container';
      parent.appendChild(newContainer);
      
      this.log(`重建价格图表容器: ${width}x${height}px`);
    }
    
    // 执行类似操作重置世界地图容器
    const worldMap = document.getElementById('worldMapContainer');
    if (worldMap) {
      this.log('清理世界地图容器');
      const parent = worldMap.parentNode;
      const width = worldMap.clientWidth || 800;
      const height = worldMap.clientHeight || 500;
      
      worldMap.remove();
      
      const newContainer = document.createElement('div');
      newContainer.id = 'worldMapContainer';
      newContainer.style.width = `${width}px`;
      newContainer.style.height = `${height}px`;
      newContainer.className = 'hologram-container';
      parent.appendChild(newContainer);
      
      this.log(`重建世界地图容器: ${width}x${height}px`);
    }
    
    // 重新初始化图�?
    this.reInitCharts();
  },
  
  // 重新初始化图�?
  reInitCharts: function() {
    this.log('🔄 重新初始化图�?..');
    
    // 检查initAllCharts是否存在
    if (typeof initAllCharts === 'function') {
      initAllCharts();
    } else {
      // 分别初始化每个图�?
      if (typeof initPriceChart === 'function') {
        this.log('重新初始化价格图�?);
        initPriceChart();
      }
      
      if (typeof initWorldMap === 'function') {
        this.log('重新初始化世界地�?);
        initWorldMap();
      }
    }
    
    this.log('🔄 重新初始化完�?);
  }
};

// 页面加载完成后初始化调试助手
document.addEventListener('DOMContentLoaded', function() {
  // 延迟初始化，确保其他脚本先加�?
  setTimeout(() => {
    DEBUG.init();
  }, 500);
}); 
